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
        customers: [],
        salesOrders: [],
        refundRecords: [],
        zReports: [],
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
      db.collection('customers').createIndex({ userId: 1, phone: 1 }),
      db.collection('sales_orders').createIndex({ userId: 1, _id: -1 }),
      db.collection('sales_orders').createIndex({ userId: 1, 'customer.phone': 1 }),
      db.collection('refund_records').createIndex({ userId: 1, _id: -1 }),
      db.collection('z_reports').createIndex({ userId: 1, reportDate: -1 }),
      db.collection('store_settings').createIndex({ userId: 1 })
    ]).catch((err) => console.warn('Index creation notice:', err.message));

    const [items, suppliers, purchaseOrders, stockMovements, wastageLogs, customers, salesOrders, refundRecords, zReports, settingsDoc] = await Promise.all([
      db.collection('inventory_items').find({ userId }).toArray(),
      db.collection('suppliers').find({ userId }).toArray(),
      db.collection('purchase_orders').find({ userId }).toArray(),
      db.collection('stock_movements').find({ userId }).sort({ _id: -1 }).limit(200).toArray(),
      db.collection('wastage_logs').find({ userId }).sort({ _id: -1 }).toArray(),
      db.collection('customers').find({ userId }).toArray(),
      db.collection('sales_orders').find({ userId }).sort({ _id: -1 }).limit(250).toArray(),
      db.collection('refund_records').find({ userId }).sort({ _id: -1 }).limit(100).toArray(),
      db.collection('z_reports').find({ userId }).sort({ _id: -1 }).limit(60).toArray(),
      db.collection('store_settings').findOne({ userId })
    ]);

    return NextResponse.json({
      userId,
      items: items.map(({ _id, ...rest }) => rest),
      suppliers: suppliers.map(({ _id, ...rest }) => rest),
      purchaseOrders: purchaseOrders.map(({ _id, ...rest }) => rest),
      stockMovements: stockMovements.map(({ _id, ...rest }) => rest),
      wastageLogs: wastageLogs.map(({ _id, ...rest }) => rest),
      customers: customers.map(({ _id, ...rest }) => rest),
      salesOrders: salesOrders.map(({ _id, ...rest }) => rest),
      refundRecords: refundRecords.map(({ _id, ...rest }) => rest),
      zReports: zReports.map(({ _id, ...rest }) => rest),
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
      customers: [],
      salesOrders: [],
      refundRecords: [],
      zReports: [],
      settings: { storeName: '' },
      isOfflineMode: true,
      error: error.message
    });
  }
}

// Safe batch insert helper to avoid BSON 16MB packet limits on MongoDB Atlas
async function chunkedInsertMany(collection: any, docs: any[], chunkSize = 1500) {
  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    if (chunk.length > 0) {
      await collection.insertMany(chunk, { ordered: false });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        isOfflineMode: true,
        message: 'Saved to local workspace.'
      });
    }

    // High-Scale Chunked Sync Mode (For 3,000 to 500,000+ items)
    if (body.isChunked) {
      const { 
        action, 
        chunk, 
        settings, 
        suppliers, 
        purchaseOrders, 
        stockMovements, 
        wastageLogs, 
        customers, 
        salesOrders, 
        refundRecords, 
        zReports 
      } = body;

      if (action === 'init_sync') {
        await db.collection('inventory_items').deleteMany({ userId });

        if (settings && typeof settings.storeName === 'string') {
          await db.collection('store_settings').updateOne(
            { userId },
            { $set: { userId, storeName: settings.storeName, updatedAt: new Date().toISOString() } },
            { upsert: true }
          );
        }
        if (Array.isArray(suppliers)) {
          await db.collection('suppliers').deleteMany({ userId });
          if (suppliers.length > 0) await chunkedInsertMany(db.collection('suppliers'), suppliers.map((s) => ({ ...s, userId })));
        }
        if (Array.isArray(purchaseOrders)) {
          await db.collection('purchase_orders').deleteMany({ userId });
          if (purchaseOrders.length > 0) await chunkedInsertMany(db.collection('purchase_orders'), purchaseOrders.map((p) => ({ ...p, userId })));
        }
        if (Array.isArray(stockMovements)) {
          await db.collection('stock_movements').deleteMany({ userId });
          if (stockMovements.length > 0) await chunkedInsertMany(db.collection('stock_movements'), stockMovements.map((m) => ({ ...m, userId })));
        }
        if (Array.isArray(wastageLogs)) {
          await db.collection('wastage_logs').deleteMany({ userId });
          if (wastageLogs.length > 0) await chunkedInsertMany(db.collection('wastage_logs'), wastageLogs.map((w) => ({ ...w, userId })));
        }
        if (Array.isArray(customers)) {
          await db.collection('customers').deleteMany({ userId });
          if (customers.length > 0) await chunkedInsertMany(db.collection('customers'), customers.map((c) => ({ ...c, userId })));
        }
        if (Array.isArray(salesOrders)) {
          await db.collection('sales_orders').deleteMany({ userId });
          if (salesOrders.length > 0) await chunkedInsertMany(db.collection('sales_orders'), salesOrders.map((o) => ({ ...o, userId })));
        }
        if (Array.isArray(refundRecords)) {
          await db.collection('refund_records').deleteMany({ userId });
          if (refundRecords.length > 0) await chunkedInsertMany(db.collection('refund_records'), refundRecords.map((r) => ({ ...r, userId })));
        }
        if (Array.isArray(zReports)) {
          await db.collection('z_reports').deleteMany({ userId });
          if (zReports.length > 0) await chunkedInsertMany(db.collection('z_reports'), zReports.map((z) => ({ ...z, userId })));
        }
        return NextResponse.json({ success: true, message: 'Chunked sync initialized' });
      }

      if (action === 'append_items' && Array.isArray(chunk) && chunk.length > 0) {
        await chunkedInsertMany(db.collection('inventory_items'), chunk.map((it: any) => ({ ...it, userId })));
        return NextResponse.json({ success: true, count: chunk.length });
      }

      if (action === 'finalize_sync') {
        return NextResponse.json({ success: true, message: 'Chunked sync complete' });
      }
    }

    // Standard Direct Sync Mode (For standard size datasets)
    const { 
      items, 
      suppliers, 
      purchaseOrders, 
      stockMovements, 
      wastageLogs, 
      customers,
      salesOrders,
      refundRecords,
      zReports,
      settings,
      isExplicitClear 
    } = body;

    // 1. Update store settings
    if (settings && typeof settings.storeName === 'string') {
      if (settings.storeName.trim() !== '' || isExplicitClear) {
        await db.collection('store_settings').updateOne(
          { userId },
          { $set: { userId, storeName: settings.storeName, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
      }
    }

    // 2. Safeguarded Inventory Items Replacement (Using chunked insertion)
    if (items !== undefined && Array.isArray(items)) {
      if (items.length > 0 || isExplicitClear === true) {
        await db.collection('inventory_items').deleteMany({ userId });
        if (items.length > 0) {
          await chunkedInsertMany(db.collection('inventory_items'), items.map((i) => ({ ...i, userId })));
        }
      }
    }

    // 3. Suppliers Replacement
    if (suppliers !== undefined && Array.isArray(suppliers)) {
      if (suppliers.length > 0 || isExplicitClear === true) {
        await db.collection('suppliers').deleteMany({ userId });
        if (suppliers.length > 0) {
          await chunkedInsertMany(db.collection('suppliers'), suppliers.map((s) => ({ ...s, userId })));
        }
      }
    }

    // 4. Purchase Orders Replacement
    if (purchaseOrders !== undefined && Array.isArray(purchaseOrders)) {
      if (purchaseOrders.length > 0 || isExplicitClear === true) {
        await db.collection('purchase_orders').deleteMany({ userId });
        if (purchaseOrders.length > 0) {
          await chunkedInsertMany(db.collection('purchase_orders'), purchaseOrders.map((p) => ({ ...p, userId })));
        }
      }
    }

    // 5. Stock Movements Replacement
    if (stockMovements !== undefined && Array.isArray(stockMovements)) {
      if (stockMovements.length > 0 || isExplicitClear === true) {
        await db.collection('stock_movements').deleteMany({ userId });
        if (stockMovements.length > 0) {
          await chunkedInsertMany(db.collection('stock_movements'), stockMovements.map((m) => ({ ...m, userId })));
        }
      }
    }

    // 6. Wastage Logs Replacement
    if (wastageLogs !== undefined && Array.isArray(wastageLogs)) {
      if (wastageLogs.length > 0 || isExplicitClear === true) {
        await db.collection('wastage_logs').deleteMany({ userId });
        if (wastageLogs.length > 0) {
          await chunkedInsertMany(db.collection('wastage_logs'), wastageLogs.map((w) => ({ ...w, userId })));
        }
      }
    }

    // 7. Customers Directory Replacement
    if (customers !== undefined && Array.isArray(customers)) {
      if (customers.length > 0 || isExplicitClear === true) {
        await db.collection('customers').deleteMany({ userId });
        if (customers.length > 0) {
          await chunkedInsertMany(db.collection('customers'), customers.map((c) => ({ ...c, userId })));
        }
      }
    }

    // 8. Sales Orders History Replacement
    if (salesOrders !== undefined && Array.isArray(salesOrders)) {
      if (salesOrders.length > 0 || isExplicitClear === true) {
        await db.collection('sales_orders').deleteMany({ userId });
        if (salesOrders.length > 0) {
          await chunkedInsertMany(db.collection('sales_orders'), salesOrders.map((o) => ({ ...o, userId })));
        }
      }
    }

    // 9. Refund Records Replacement
    if (refundRecords !== undefined && Array.isArray(refundRecords)) {
      if (refundRecords.length > 0 || isExplicitClear === true) {
        await db.collection('refund_records').deleteMany({ userId });
        if (refundRecords.length > 0) {
          await chunkedInsertMany(db.collection('refund_records'), refundRecords.map((r) => ({ ...r, userId })));
        }
      }
    }

    // 10. Z-Reports (Day-Close) Replacement
    if (zReports !== undefined && Array.isArray(zReports)) {
      if (zReports.length > 0 || isExplicitClear === true) {
        await db.collection('z_reports').deleteMany({ userId });
        if (zReports.length > 0) {
          await chunkedInsertMany(db.collection('z_reports'), zReports.map((z) => ({ ...z, userId })));
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Store data safely saved to MongoDB Atlas' });
  } catch (error: any) {
    console.warn('Store data save warning:', error.message);
    return NextResponse.json({
      success: true,
      isOfflineMode: true,
      error: error.message
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        isOfflineMode: true,
        message: 'Deleted in offline local mode.'
      });
    }

    // Completely wipe all collections for this tenant userId
    await Promise.all([
      db.collection('inventory_items').deleteMany({ userId }),
      db.collection('suppliers').deleteMany({ userId }),
      db.collection('purchase_orders').deleteMany({ userId }),
      db.collection('stock_movements').deleteMany({ userId }),
      db.collection('wastage_logs').deleteMany({ userId }),
      db.collection('customers').deleteMany({ userId }),
      db.collection('sales_orders').deleteMany({ userId }),
      db.collection('refund_records').deleteMany({ userId }),
      db.collection('z_reports').deleteMany({ userId }),
      db.collection('store_settings').deleteMany({ userId })
    ]);

    return NextResponse.json({
      success: true,
      message: 'All tenant store data, items, customers, orders, and settings permanently deleted.'
    });
  } catch (error: any) {
    console.error('Store data wipe error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
