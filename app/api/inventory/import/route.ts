import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { InventoryItem } from '@/types/inventory';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { items } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided for import.' }, { status: 400 });
    }

    const db = await getDatabase();
    if (db) {
      const documentsToInsert = items.map((item: InventoryItem) => ({
        ...item,
        userId,
        createdAt: new Date().toISOString()
      }));

      await db.collection('inventory_items').insertMany(documentsToInsert);

      // Record bulk import movement
      await db.collection('stock_movements').insertOne({
        id: 'mov-imp-' + Date.now(),
        timestamp: 'Just now',
        itemId: 'bulk-import',
        itemName: `Imported ${items.length} Products via CSV/Excel`,
        sku: 'IMPORT',
        type: 'INITIAL_COUNT',
        quantityDelta: items.reduce((a: number, c: InventoryItem) => a + (c.currentStock || 0), 0),
        previousStock: 0,
        newStock: items.reduce((a: number, c: InventoryItem) => a + (c.currentStock || 0), 0),
        reason: 'Bulk Data Import (CSV/Excel)',
        performedBy: 'Store Owner',
        unitCost: 0,
        financialImpact: 0,
        userId
      });
    }

    return NextResponse.json({
      success: true,
      importedCount: items.length,
      message: `Successfully imported ${items.length} products.`
    });
  } catch (error: any) {
    console.error('Error importing inventory items:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
