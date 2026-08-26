import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        userId,
        items: [],
        suppliers: [],
        purchaseOrders: [],
        stockMovements: [],
        wastageLogs: [],
        settings: { storeName: '' },
        isOfflineMode: true
      });
    }

    // Ensure tenant-isolated indexes exist
    await Promise.all([
      db.collection('inventory_items').createIndex({ userId: 1 }),
      db.collection('suppliers').createIndex({ userId: 1 }),
      db.collection('purchase_orders').createIndex({ userId: 1 }),
      db.collection('stock_movements').createIndex({ userId: 1, _id: -1 }),
      db.collection('wastage_logs').createIndex({ userId: 1, _id: -1 }),
      db.collection('store_settings').createIndex({ userId: 1 })
    ]).catch((err) => console.warn('Index creation notice:', err.message));

    const [items, suppliers, purchaseOrders, stockMovements, wastageLogs, settingsDoc] = await Promise.all([
      db.collection('inventory_items').find({ userId }).toArray(),
      db.collection('suppliers').find({ userId }).toArray(),
      db.collection('purchase_orders').find({ userId }).toArray(),
      db.collection('stock_movements').find({ userId }).sort({ _id: -1 }).limit(100).toArray(),
      db.collection('wastage_logs').find({ userId }).sort({ _id: -1 }).toArray(),
      db.collection('store_settings').findOne({ userId })
    ]);

    return NextResponse.json({
      userId,
      items: items.map(({ _id, ...rest }) => rest),
      suppliers: suppliers.map(({ _id, ...rest }) => rest),
      purchaseOrders: purchaseOrders.map(({ _id, ...rest }) => rest),
      stockMovements: stockMovements.map(({ _id, ...rest }) => rest),
      wastageLogs: wastageLogs.map(({ _id, ...rest }) => rest),
      settings: settingsDoc ? { storeName: settingsDoc.storeName || '' } : { storeName: '' }
    });
  } catch (error: any) {
    console.warn('Store data fetch warning:', error.message);
    return NextResponse.json({
      items: [],
      suppliers: [],
      purchaseOrders: [],
      stockMovements: [],
      wastageLogs: [],
      settings: { storeName: '' },
      isOfflineMode: true,
      error: error.message
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { items, suppliers, purchaseOrders, stockMovements, wastageLogs, settings } = body;

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        isOfflineMode: true,
        message: 'Saved to local workspace. Ensure IP is whitelisted in MongoDB Atlas Network Access.'
      });
    }

    if (settings && typeof settings.storeName === 'string') {
      await db.collection('store_settings').updateOne(
        { userId },
        { $set: { userId, storeName: settings.storeName, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    }

    if (items !== undefined && Array.isArray(items)) {
      await db.collection('inventory_items').deleteMany({ userId });
      if (items.length > 0) {
        await db.collection('inventory_items').insertMany(items.map((i) => ({ ...i, userId })));
      }
    }

    if (suppliers !== undefined && Array.isArray(suppliers)) {
      await db.collection('suppliers').deleteMany({ userId });
      if (suppliers.length > 0) {
        await db.collection('suppliers').insertMany(suppliers.map((s) => ({ ...s, userId })));
      }
    }

    if (purchaseOrders !== undefined && Array.isArray(purchaseOrders)) {
      await db.collection('purchase_orders').deleteMany({ userId });
      if (purchaseOrders.length > 0) {
        await db.collection('purchase_orders').insertMany(purchaseOrders.map((p) => ({ ...p, userId })));
      }
    }

    if (stockMovements !== undefined && Array.isArray(stockMovements)) {
      await db.collection('stock_movements').deleteMany({ userId });
      if (stockMovements.length > 0) {
        await db.collection('stock_movements').insertMany(stockMovements.map((m) => ({ ...m, userId })));
      }
    }

    if (wastageLogs !== undefined && Array.isArray(wastageLogs)) {
      await db.collection('wastage_logs').deleteMany({ userId });
      if (wastageLogs.length > 0) {
        await db.collection('wastage_logs').insertMany(wastageLogs.map((w) => ({ ...w, userId })));
      }
    }

    return NextResponse.json({ success: true, message: 'Store data saved to MongoDB Atlas' });
  } catch (error: any) {
    console.warn('Store data save warning:', error.message);
    return NextResponse.json({
      success: true,
      isOfflineMode: true,
      error: error.message
    });
  }
}
