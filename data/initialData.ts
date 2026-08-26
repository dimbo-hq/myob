import { InventoryItem, Supplier, PurchaseOrder, StockMovement, WastageLog } from '@/types/inventory';

// Helper to generate dynamic dates relative to today
export const getRelativeDate = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Green Valley Fresh Farms',
    code: 'GVF-001',
    category: 'Fresh Produce & Organics',
    contactPerson: 'Elena Rostova',
    email: 'orders@greenvalleyfresh.com',
    phone: '+1 (555) 234-8891',
    leadTimeDays: 1,
    minOrderValue: 200,
    rating: 4.9,
    paymentTerms: 'Net 15',
    address: '400 Orchard Ridge Way, Sonoma Valley, CA',
  },
  {
    id: 'sup-2',
    name: 'Alpine Crest Dairy Co.',
    code: 'ACD-002',
    category: 'Dairy, Eggs & Cold Chain',
    contactPerson: 'Marcus Vance',
    email: 'supply@alpinecrestdairy.com',
    phone: '+1 (555) 489-3320',
    leadTimeDays: 2,
    minOrderValue: 350,
    rating: 4.8,
    paymentTerms: 'Net 30',
    address: '12 Alpine Meadow Blvd, Vermont, VT',
  },
  {
    id: 'sup-3',
    name: 'Artisan Heritage Bakers',
    code: 'AHB-003',
    category: 'Bakery & Pastries',
    contactPerson: 'Chloe Laurent',
    email: 'orders@artisanheritage.com',
    phone: '+1 (555) 912-4411',
    leadTimeDays: 1,
    minOrderValue: 150,
    rating: 4.7,
    paymentTerms: 'Daily COD',
    address: '88 Flour Mill Lane, Portland, OR',
  },
  {
    id: 'sup-4',
    name: 'Prime Harbor Meats & Seafood',
    code: 'PHM-004',
    category: 'Meat, Poultry & Seafood',
    contactPerson: 'David Chen',
    email: 'b2b@primeharbormeats.com',
    phone: '+1 (555) 671-9002',
    leadTimeDays: 2,
    minOrderValue: 500,
    rating: 4.9,
    paymentTerms: 'Net 15',
    address: 'Pier 24 Logistics Hub, Seattle, WA',
  },
  {
    id: 'sup-5',
    name: 'Global Pantry Direct',
    code: 'GPD-005',
    category: 'Dry Goods, Canned & Grains',
    contactPerson: 'Sophia Morales',
    email: 'orders@globalpantrydirect.com',
    phone: '+1 (555) 883-1249',
    leadTimeDays: 4,
    minOrderValue: 600,
    rating: 4.6,
    paymentTerms: 'Net 45',
    address: '1900 Distribution Ave, Chicago, IL',
  },
  {
    id: 'sup-6',
    name: 'PureLife Eco Living',
    code: 'PLE-006',
    category: 'Household & Personal Care',
    contactPerson: 'Liam O\'Connor',
    email: 'support@purelife-eco.com',
    phone: '+1 (555) 445-7801',
    leadTimeDays: 3,
    minOrderValue: 300,
    rating: 4.8,
    paymentTerms: 'Net 30',
    address: '52 Evergreen Park, Austin, TX',
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  // 1. FRESH PRODUCE
  {
    id: 'item-101',
    sku: 'PROD-AVO-01',
    barcode: '840129001015',
    name: 'Organic Hass Avocados',
    brand: 'Green Valley Organic',
    category: 'Fresh Produce',
    subcategory: 'Fruits',
    description: 'Ready-to-eat creamy organic Hass avocados sourced directly from California orchards.',
    currentStock: 48,
    unit: 'pcs',
    minStockLevel: 25,
    reorderPoint: 35,
    optimalStockLevel: 80,
    maxCapacity: 120,
    location: {
      aisle: 'Aisle 01',
      shelf: 'Bay 02 - Fresh Bin',
      section: 'Organic Produce',
      tempZone: 'ambient'
    },
    costPrice: 1.10,
    sellingPrice: 2.29,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-101-1',
        batchNumber: 'AVO-24A',
        quantity: 16,
        expiryDate: getRelativeDate(2), // Expiring in 2 days!
        costPrice: 1.10,
        markdownPercentage: 25,
        markdownPrice: 1.72,
        status: 'critical',
        notes: 'Ripe batch - quick markdown to accelerate sales'
      },
      {
        id: 'b-101-2',
        batchNumber: 'AVO-24B',
        quantity: 32,
        expiryDate: getRelativeDate(6),
        costPrice: 1.10,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-1',
    supplierName: 'Green Valley Fresh Farms',
    salesVelocity: {
      dailyAverage: 14,
      weeklySales: 98,
      turnoverRate: 3.4,
      lastRestockedAt: getRelativeDate(-2),
      lastSoldAt: 'Today, 14:22'
    },
    tags: ['Organic', 'Keto', 'Gluten Free', 'High Velocity'],
    isFeatured: true
  },
  {
    id: 'item-102',
    sku: 'PROD-SPN-02',
    barcode: '840129001022',
    name: 'Organic Baby Spinach Clamshell 300g',
    brand: 'Green Valley Organic',
    category: 'Fresh Produce',
    subcategory: 'Greens',
    description: 'Triple-washed tender baby spinach leaves packed in eco-friendly protective clamshell.',
    currentStock: 12,
    unit: 'pack',
    minStockLevel: 15,
    reorderPoint: 20,
    optimalStockLevel: 45,
    maxCapacity: 60,
    location: {
      aisle: 'Aisle 01',
      shelf: 'Cold Deck A1',
      section: 'Packaged Salads',
      tempZone: 'chilled'
    },
    costPrice: 1.80,
    sellingPrice: 3.49,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-102-1',
        batchNumber: 'SPN-998',
        quantity: 5,
        expiryDate: getRelativeDate(1), // Tomorrow!
        costPrice: 1.80,
        markdownPercentage: 40,
        markdownPrice: 2.09,
        status: 'critical',
        notes: 'Final day before spoilage - 40% clearance markdown'
      },
      {
        id: 'b-102-2',
        batchNumber: 'SPN-999',
        quantity: 7,
        expiryDate: getRelativeDate(4),
        costPrice: 1.80,
        markdownPercentage: 0,
        status: 'warning'
      }
    ],
    supplierId: 'sup-1',
    supplierName: 'Green Valley Fresh Farms',
    salesVelocity: {
      dailyAverage: 9,
      weeklySales: 63,
      turnoverRate: 1.3,
      lastRestockedAt: getRelativeDate(-3),
      lastSoldAt: 'Today, 15:40'
    },
    tags: ['Salad', 'Fresh', 'Organic', 'Perishable'],
    isFeatured: false
  },
  {
    id: 'item-103',
    sku: 'PROD-TOM-03',
    barcode: '840129001039',
    name: 'Vine-Ripened Campari Tomatoes 500g',
    brand: 'Green Valley Fresh',
    category: 'Fresh Produce',
    subcategory: 'Vegetables',
    description: 'Sweet and aromatic cocktail tomatoes on the vine.',
    currentStock: 28,
    unit: 'pack',
    minStockLevel: 12,
    reorderPoint: 18,
    optimalStockLevel: 40,
    maxCapacity: 60,
    location: {
      aisle: 'Aisle 01',
      shelf: 'Display Table 3',
      section: 'Tomatoes & Peppers',
      tempZone: 'ambient'
    },
    costPrice: 2.10,
    sellingPrice: 3.99,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-103-1',
        batchNumber: 'TOM-881',
        quantity: 28,
        expiryDate: getRelativeDate(7),
        costPrice: 2.10,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-1',
    supplierName: 'Green Valley Fresh Farms',
    salesVelocity: {
      dailyAverage: 6,
      weeklySales: 42,
      turnoverRate: 4.6,
      lastRestockedAt: getRelativeDate(-1),
      lastSoldAt: 'Today, 11:15'
    },
    tags: ['Fresh', 'Salad', 'Vegan'],
    isFeatured: false
  },

  // 2. DAIRY & EGGS
  {
    id: 'item-201',
    sku: 'DAIR-MLK-01',
    barcode: '840129002012',
    name: 'Farm Fresh Whole Milk 1 Gallon (3.78L)',
    brand: 'Alpine Crest',
    category: 'Dairy & Eggs',
    subcategory: 'Milk',
    description: 'Pasteurized homogenized grade A whole milk with vitamins D3.',
    currentStock: 18,
    unit: 'bottle',
    minStockLevel: 25, // Currently LOW STOCK!
    reorderPoint: 35,
    optimalStockLevel: 70,
    maxCapacity: 100,
    location: {
      aisle: 'Aisle 02',
      shelf: 'Walk-in Cooler Wall 1',
      section: 'Fresh Milk',
      tempZone: 'chilled'
    },
    costPrice: 2.40,
    sellingPrice: 4.29,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-201-1',
        batchNumber: 'MLK-552',
        quantity: 6,
        expiryDate: getRelativeDate(2), // 2 days left
        costPrice: 2.40,
        markdownPercentage: 20,
        markdownPrice: 3.43,
        status: 'critical'
      },
      {
        id: 'b-201-2',
        batchNumber: 'MLK-553',
        quantity: 12,
        expiryDate: getRelativeDate(9),
        costPrice: 2.40,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-2',
    supplierName: 'Alpine Crest Dairy Co.',
    salesVelocity: {
      dailyAverage: 18,
      weeklySales: 126,
      turnoverRate: 1.0,
      lastRestockedAt: getRelativeDate(-2),
      lastSoldAt: 'Today, 16:05'
    },
    tags: ['Staple', 'Fast Moving', 'Cold Chain'],
    isFeatured: true
  },
  {
    id: 'item-202',
    sku: 'DAIR-YOG-02',
    barcode: '840129002029',
    name: 'Authentic Greek Strained Yogurt 500g',
    brand: 'Alpine Crest',
    category: 'Dairy & Eggs',
    subcategory: 'Yogurt',
    description: 'High protein, non-fat plain Greek yogurt with live active cultures.',
    currentStock: 34,
    unit: 'pack',
    minStockLevel: 15,
    reorderPoint: 25,
    optimalStockLevel: 50,
    maxCapacity: 75,
    location: {
      aisle: 'Aisle 02',
      shelf: 'Refrigerated Bay B3',
      section: 'Cultured Dairy',
      tempZone: 'chilled'
    },
    costPrice: 2.80,
    sellingPrice: 4.99,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-202-1',
        batchNumber: 'YOG-304',
        quantity: 8,
        expiryDate: getRelativeDate(4),
        costPrice: 2.80,
        markdownPercentage: 0,
        status: 'warning'
      },
      {
        id: 'b-202-2',
        batchNumber: 'YOG-305',
        quantity: 26,
        expiryDate: getRelativeDate(18),
        costPrice: 2.80,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-2',
    supplierName: 'Alpine Crest Dairy Co.',
    salesVelocity: {
      dailyAverage: 8,
      weeklySales: 56,
      turnoverRate: 4.2,
      lastRestockedAt: getRelativeDate(-4),
      lastSoldAt: 'Today, 13:50'
    },
    tags: ['High Protein', 'Dairy', 'Health'],
    isFeatured: false
  },
  {
    id: 'item-203',
    sku: 'DAIR-EGG-03',
    barcode: '840129002036',
    name: 'Pasture-Raised Organic Large Brown Eggs (12ct)',
    brand: 'Green Valley Fresh',
    category: 'Dairy & Eggs',
    subcategory: 'Eggs',
    description: 'Certified humane pasture-raised eggs rich in omega-3 with deep golden yolks.',
    currentStock: 52,
    unit: 'box',
    minStockLevel: 20,
    reorderPoint: 30,
    optimalStockLevel: 80,
    maxCapacity: 120,
    location: {
      aisle: 'Aisle 02',
      shelf: 'Cooler Wall 3',
      section: 'Egg Station',
      tempZone: 'chilled'
    },
    costPrice: 3.20,
    sellingPrice: 5.89,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-203-1',
        batchNumber: 'EGG-819',
        quantity: 52,
        expiryDate: getRelativeDate(22),
        costPrice: 3.20,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-2',
    supplierName: 'Alpine Crest Dairy Co.',
    salesVelocity: {
      dailyAverage: 12,
      weeklySales: 84,
      turnoverRate: 4.3,
      lastRestockedAt: getRelativeDate(-1),
      lastSoldAt: 'Today, 16:10'
    },
    tags: ['Pasture Raised', 'Organic', 'Breakfast Staple'],
    isFeatured: true
  },
  {
    id: 'item-204',
    sku: 'DAIR-BUT-04',
    barcode: '840129002043',
    name: 'European Style Cultured Butter 250g',
    brand: 'Alpine Crest',
    category: 'Dairy & Eggs',
    subcategory: 'Butter & Spreads',
    description: '84% butterfat slow-churned salted European style table butter.',
    currentStock: 6, // CRITICAL LOW STOCK
    unit: 'pack',
    minStockLevel: 15,
    reorderPoint: 20,
    optimalStockLevel: 45,
    maxCapacity: 60,
    location: {
      aisle: 'Aisle 02',
      shelf: 'Refrigerated Bay B2',
      section: 'Butter & Spreads',
      tempZone: 'chilled'
    },
    costPrice: 2.90,
    sellingPrice: 5.29,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-204-1',
        batchNumber: 'BUT-112',
        quantity: 6,
        expiryDate: getRelativeDate(35),
        costPrice: 2.90,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-2',
    supplierName: 'Alpine Crest Dairy Co.',
    salesVelocity: {
      dailyAverage: 5,
      weeklySales: 35,
      turnoverRate: 1.2,
      lastRestockedAt: getRelativeDate(-7),
      lastSoldAt: 'Today, 12:45'
    },
    tags: ['Gourmet', 'Baking', 'Dairy'],
    isFeatured: false
  },

  // 3. BAKERY & DELI
  {
    id: 'item-301',
    sku: 'BAKE-SRD-01',
    barcode: '840129003019',
    name: 'San Francisco Style Artisan Sourdough Batard',
    brand: 'Artisan Heritage',
    category: 'Bakery & Deli',
    subcategory: 'Bread',
    description: 'Slow-fermented wild yeast loaf with blistered crispy crust and airy crumb.',
    currentStock: 14,
    unit: 'pcs',
    minStockLevel: 10,
    reorderPoint: 15,
    optimalStockLevel: 30,
    maxCapacity: 40,
    location: {
      aisle: 'Aisle 03',
      shelf: 'Artisan Wooden Racks',
      section: 'Fresh Bread',
      tempZone: 'ambient'
    },
    costPrice: 2.20,
    sellingPrice: 5.49,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-301-1',
        batchNumber: 'SRD-DAILY-01',
        quantity: 6,
        expiryDate: getRelativeDate(1), // Daily bake - expiring tomorrow
        costPrice: 2.20,
        markdownPercentage: 35,
        markdownPrice: 3.56,
        status: 'critical',
        notes: 'Evening discount applied to prevent disposal'
      },
      {
        id: 'b-301-2',
        batchNumber: 'SRD-DAILY-02',
        quantity: 8,
        expiryDate: getRelativeDate(2),
        costPrice: 2.20,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-3',
    supplierName: 'Artisan Heritage Bakers',
    salesVelocity: {
      dailyAverage: 12,
      weeklySales: 84,
      turnoverRate: 1.1,
      lastRestockedAt: 'Today, 06:00',
      lastSoldAt: 'Today, 15:10'
    },
    tags: ['Fresh Baked', 'Artisan', 'Daily Delivery'],
    isFeatured: true
  },
  {
    id: 'item-302',
    sku: 'BAKE-CRS-02',
    barcode: '840129003026',
    name: 'Pure Butter French Croissants (Pack of 4)',
    brand: 'Artisan Heritage',
    category: 'Bakery & Deli',
    subcategory: 'Pastries',
    description: 'Golden flaky 72-layer laminated pastries made with French Normandy butter.',
    currentStock: 8,
    unit: 'pack',
    minStockLevel: 8,
    reorderPoint: 12,
    optimalStockLevel: 25,
    maxCapacity: 35,
    location: {
      aisle: 'Aisle 03',
      shelf: 'Pastry Case 1',
      section: 'Morning Pastries',
      tempZone: 'ambient'
    },
    costPrice: 3.10,
    sellingPrice: 6.99,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-302-1',
        batchNumber: 'CRS-402',
        quantity: 3,
        expiryDate: getRelativeDate(1),
        costPrice: 3.10,
        markdownPercentage: 50,
        markdownPrice: 3.49,
        status: 'critical',
        notes: 'Flash 50% evening reduction'
      },
      {
        id: 'b-302-2',
        batchNumber: 'CRS-403',
        quantity: 5,
        expiryDate: getRelativeDate(2),
        costPrice: 3.10,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-3',
    supplierName: 'Artisan Heritage Bakers',
    salesVelocity: {
      dailyAverage: 7,
      weeklySales: 49,
      turnoverRate: 1.1,
      lastRestockedAt: 'Today, 06:30',
      lastSoldAt: 'Today, 14:02'
    },
    tags: ['Bakery', 'Pastry', 'Breakfast'],
    isFeatured: false
  },

  // 4. MEAT & SEAFOOD
  {
    id: 'item-401',
    sku: 'MEAT-RIB-01',
    barcode: '840129004016',
    name: 'Prime Grass-Fed Angus Ribeye Steak (400g)',
    brand: 'Prime Harbor',
    category: 'Meat & Seafood',
    subcategory: 'Beef',
    description: 'USDA Prime dry-aged marbling, tender, grass-fed hormone-free beef cut.',
    currentStock: 4, // CRITICAL LOW STOCK
    unit: 'pack',
    minStockLevel: 10,
    reorderPoint: 14,
    optimalStockLevel: 30,
    maxCapacity: 45,
    location: {
      aisle: 'Aisle 04',
      shelf: 'Butcher Service Counter Bay 1',
      section: 'Premium Cuts',
      tempZone: 'chilled'
    },
    costPrice: 12.50,
    sellingPrice: 21.99,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-401-1',
        batchNumber: 'RIB-091',
        quantity: 2,
        expiryDate: getRelativeDate(2),
        costPrice: 12.50,
        markdownPercentage: 20,
        markdownPrice: 17.59,
        status: 'critical',
        notes: 'High cost item - discount to ensure zero loss'
      },
      {
        id: 'b-401-2',
        batchNumber: 'RIB-092',
        quantity: 2,
        expiryDate: getRelativeDate(5),
        costPrice: 12.50,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-4',
    supplierName: 'Prime Harbor Meats & Seafood',
    salesVelocity: {
      dailyAverage: 4,
      weeklySales: 28,
      turnoverRate: 1.0,
      lastRestockedAt: getRelativeDate(-3),
      lastSoldAt: 'Today, 13:12'
    },
    tags: ['Prime', 'High Value', 'Grass Fed', 'Reorder Alert'],
    isFeatured: true
  },
  {
    id: 'item-402',
    sku: 'MEAT-SAL-02',
    barcode: '840129004023',
    name: 'Norwegian Atlantic Salmon Portions (300g)',
    brand: 'Prime Harbor',
    category: 'Meat & Seafood',
    subcategory: 'Seafood',
    description: 'Sustainably farm-raised skin-on Atlantic salmon with high Omega-3 fatty acids.',
    currentStock: 0, // OUT OF STOCK!
    unit: 'pack',
    minStockLevel: 8,
    reorderPoint: 12,
    optimalStockLevel: 25,
    maxCapacity: 40,
    location: {
      aisle: 'Aisle 04',
      shelf: 'Seafood Ice Deck 2',
      section: 'Fresh Fish',
      tempZone: 'chilled'
    },
    costPrice: 6.80,
    sellingPrice: 12.49,
    vatRate: 0.0,
    batches: [],
    supplierId: 'sup-4',
    supplierName: 'Prime Harbor Meats & Seafood',
    salesVelocity: {
      dailyAverage: 6,
      weeklySales: 42,
      turnoverRate: 0,
      lastRestockedAt: getRelativeDate(-5),
      lastSoldAt: 'Yesterday, 18:44'
    },
    tags: ['Out Of Stock', 'Seafood', 'Omega-3', 'URGENT_PO'],
    isFeatured: true
  },
  {
    id: 'item-403',
    sku: 'MEAT-CHK-03',
    barcode: '840129004030',
    name: 'Organic Boneless Skinless Chicken Breast 600g',
    brand: 'Green Valley Farms',
    category: 'Meat & Seafood',
    subcategory: 'Poultry',
    description: 'Free-range non-GMO vegetarian-fed air-chilled lean chicken fillets.',
    currentStock: 22,
    unit: 'pack',
    minStockLevel: 15,
    reorderPoint: 20,
    optimalStockLevel: 45,
    maxCapacity: 60,
    location: {
      aisle: 'Aisle 04',
      shelf: 'Refrigerated Poultry Wall C',
      section: 'Organic Poultry',
      tempZone: 'chilled'
    },
    costPrice: 4.90,
    sellingPrice: 8.99,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-403-1',
        batchNumber: 'CHK-774',
        quantity: 8,
        expiryDate: getRelativeDate(3),
        costPrice: 4.90,
        markdownPercentage: 0,
        status: 'warning'
      },
      {
        id: 'b-403-2',
        batchNumber: 'CHK-775',
        quantity: 14,
        expiryDate: getRelativeDate(7),
        costPrice: 4.90,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-4',
    supplierName: 'Prime Harbor Meats & Seafood',
    salesVelocity: {
      dailyAverage: 8,
      weeklySales: 56,
      turnoverRate: 2.7,
      lastRestockedAt: getRelativeDate(-2),
      lastSoldAt: 'Today, 15:58'
    },
    tags: ['Lean Protein', 'Organic', 'Air Chilled'],
    isFeatured: false
  },

  // 5. BEVERAGES
  {
    id: 'item-501',
    sku: 'BEV-CBW-01',
    barcode: '840129005013',
    name: 'Cold Brew Nitro Coffee 330ml Can',
    brand: 'Artisan Heritage',
    category: 'Beverages',
    subcategory: 'Ready To Drink',
    description: '20-hour steeped single-origin Ethiopian cold brew with creamy nitrogen foam.',
    currentStock: 65,
    unit: 'bottle',
    minStockLevel: 24,
    reorderPoint: 36,
    optimalStockLevel: 90,
    maxCapacity: 150,
    location: {
      aisle: 'Aisle 05',
      shelf: 'Grab & Go Cooler G1',
      section: 'Functional Drinks',
      tempZone: 'chilled'
    },
    costPrice: 1.65,
    sellingPrice: 3.89,
    vatRate: 0.05,
    batches: [
      {
        id: 'b-501-1',
        batchNumber: 'CB-901',
        quantity: 65,
        expiryDate: getRelativeDate(60),
        costPrice: 1.65,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-3',
    supplierName: 'Artisan Heritage Bakers',
    salesVelocity: {
      dailyAverage: 15,
      weeklySales: 105,
      turnoverRate: 4.3,
      lastRestockedAt: getRelativeDate(-5),
      lastSoldAt: 'Today, 16:15'
    },
    tags: ['Cold Brew', 'Nitro', 'Energy'],
    isFeatured: true
  },
  {
    id: 'item-502',
    sku: 'BEV-OJ-02',
    barcode: '840129005020',
    name: 'Cold Pressed Pure Orange Juice 1L',
    brand: 'Green Valley Fresh',
    category: 'Beverages',
    subcategory: 'Juices',
    description: 'Never from concentrate 100% Florida Valencia oranges with high pulp.',
    currentStock: 14,
    unit: 'bottle',
    minStockLevel: 12,
    reorderPoint: 18,
    optimalStockLevel: 40,
    maxCapacity: 60,
    location: {
      aisle: 'Aisle 05',
      shelf: 'Juice Rack 2',
      section: 'Fresh Juices',
      tempZone: 'chilled'
    },
    costPrice: 2.20,
    sellingPrice: 4.79,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-502-1',
        batchNumber: 'OJ-441',
        quantity: 4,
        expiryDate: getRelativeDate(2),
        costPrice: 2.20,
        markdownPercentage: 30,
        markdownPrice: 3.35,
        status: 'critical'
      },
      {
        id: 'b-502-2',
        batchNumber: 'OJ-442',
        quantity: 10,
        expiryDate: getRelativeDate(11),
        costPrice: 2.20,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-1',
    supplierName: 'Green Valley Fresh Farms',
    salesVelocity: {
      dailyAverage: 6,
      weeklySales: 42,
      turnoverRate: 2.3,
      lastRestockedAt: getRelativeDate(-3),
      lastSoldAt: 'Today, 14:48'
    },
    tags: ['Fresh Juice', 'Vitamin C', 'Cold Pressed'],
    isFeatured: false
  },

  // 6. PANTRY & DRY GOODS
  {
    id: 'item-601',
    sku: 'PAN-OIL-01',
    barcode: '840129006010',
    name: 'Single Estate Extra Virgin Olive Oil 750ml',
    brand: 'Global Pantry',
    category: 'Pantry & Dry Goods',
    subcategory: 'Oils & Vinegars',
    description: 'Cold-extracted Koroneiki olives with polyphenol rich peppery finish.',
    currentStock: 38,
    unit: 'bottle',
    minStockLevel: 15,
    reorderPoint: 25,
    optimalStockLevel: 60,
    maxCapacity: 90,
    location: {
      aisle: 'Aisle 06',
      shelf: 'Shelf 3B - Gourmet Oils',
      section: 'Mediterranean Pantry',
      tempZone: 'ambient'
    },
    costPrice: 8.50,
    sellingPrice: 16.99,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-601-1',
        batchNumber: 'EVOO-2026',
        quantity: 38,
        expiryDate: getRelativeDate(420),
        costPrice: 8.50,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-5',
    supplierName: 'Global Pantry Direct',
    salesVelocity: {
      dailyAverage: 3,
      weeklySales: 21,
      turnoverRate: 12.6,
      lastRestockedAt: getRelativeDate(-14),
      lastSoldAt: 'Today, 10:19'
    },
    tags: ['EVOO', 'Mediterranean', 'Gourmet'],
    isFeatured: false
  },
  {
    id: 'item-602',
    sku: 'PAN-RIC-02',
    barcode: '840129006027',
    name: 'Himalayan Aged Long Grain Basmati Rice 2kg',
    brand: 'Global Pantry',
    category: 'Pantry & Dry Goods',
    subcategory: 'Grains & Rice',
    description: '2-year aged aromatic extra-long grain basmati rice.',
    currentStock: 50,
    unit: 'pack',
    minStockLevel: 20,
    reorderPoint: 30,
    optimalStockLevel: 75,
    maxCapacity: 100,
    location: {
      aisle: 'Aisle 06',
      shelf: 'Bottom Pallet Rack 1',
      section: 'Rice & Grains',
      tempZone: 'ambient'
    },
    costPrice: 4.10,
    sellingPrice: 8.49,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-602-1',
        batchNumber: 'BAS-88',
        quantity: 50,
        expiryDate: getRelativeDate(600),
        costPrice: 4.10,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-5',
    supplierName: 'Global Pantry Direct',
    salesVelocity: {
      dailyAverage: 5,
      weeklySales: 35,
      turnoverRate: 10.0,
      lastRestockedAt: getRelativeDate(-10),
      lastSoldAt: 'Today, 15:33'
    },
    tags: ['Pantry Staple', 'Aged Basmati', 'Gluten Free'],
    isFeatured: false
  },
  {
    id: 'item-603',
    sku: 'PAN-PAS-03',
    barcode: '840129006034',
    name: 'Bronze Die Extruded Rigatoni Pasta 500g',
    brand: 'Global Pantry',
    category: 'Pantry & Dry Goods',
    subcategory: 'Pasta',
    description: '100% durum wheat semolina extruded through bronze dies for sauce adherence.',
    currentStock: 9, // LOW STOCK
    unit: 'pack',
    minStockLevel: 15,
    reorderPoint: 20,
    optimalStockLevel: 60,
    maxCapacity: 80,
    location: {
      aisle: 'Aisle 06',
      shelf: 'Shelf 2A - Italian Grains',
      section: 'Dry Pasta',
      tempZone: 'ambient'
    },
    costPrice: 1.40,
    sellingPrice: 3.29,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-603-1',
        batchNumber: 'RIG-31',
        quantity: 9,
        expiryDate: getRelativeDate(500),
        costPrice: 1.40,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-5',
    supplierName: 'Global Pantry Direct',
    salesVelocity: {
      dailyAverage: 7,
      weeklySales: 49,
      turnoverRate: 1.3,
      lastRestockedAt: getRelativeDate(-8),
      lastSoldAt: 'Today, 16:02'
    },
    tags: ['Italian', 'Pasta', 'Bronze Cut'],
    isFeatured: false
  },

  // 7. FROZEN FOODS
  {
    id: 'item-701',
    sku: 'FRZ-PIZ-01',
    barcode: '840129007017',
    name: 'Wood-Fired Margherita Sourdough Pizza 420g',
    brand: 'Artisan Heritage',
    category: 'Frozen Foods',
    subcategory: 'Meals',
    description: 'Stone-baked in Naples with San Marzano sauce and buffalo mozzarella.',
    currentStock: 24,
    unit: 'box',
    minStockLevel: 12,
    reorderPoint: 18,
    optimalStockLevel: 40,
    maxCapacity: 60,
    location: {
      aisle: 'Aisle 07',
      shelf: 'Freezer Case 04',
      section: 'Frozen Meals',
      tempZone: 'frozen'
    },
    costPrice: 3.90,
    sellingPrice: 7.99,
    vatRate: 0.05,
    batches: [
      {
        id: 'b-701-1',
        batchNumber: 'PIZ-209',
        quantity: 24,
        expiryDate: getRelativeDate(180),
        costPrice: 3.90,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-3',
    supplierName: 'Artisan Heritage Bakers',
    salesVelocity: {
      dailyAverage: 4,
      weeklySales: 28,
      turnoverRate: 6.0,
      lastRestockedAt: getRelativeDate(-6),
      lastSoldAt: 'Today, 14:15'
    },
    tags: ['Quick Meal', 'Wood Fired', 'Frozen'],
    isFeatured: false
  },
  {
    id: 'item-702',
    sku: 'FRZ-BER-02',
    barcode: '840129007024',
    name: 'Organic Wild Berry Medley 500g',
    brand: 'Green Valley Organic',
    category: 'Frozen Foods',
    subcategory: 'Fruits & Veg',
    description: 'Flash-frozen wild blueberries, blackberries, and raspberries.',
    currentStock: 32,
    unit: 'pack',
    minStockLevel: 15,
    reorderPoint: 22,
    optimalStockLevel: 50,
    maxCapacity: 70,
    location: {
      aisle: 'Aisle 07',
      shelf: 'Freezer Case 02',
      section: 'Frozen Fruit',
      tempZone: 'frozen'
    },
    costPrice: 3.20,
    sellingPrice: 6.49,
    vatRate: 0.0,
    batches: [
      {
        id: 'b-702-1',
        batchNumber: 'BER-90',
        quantity: 32,
        expiryDate: getRelativeDate(270),
        costPrice: 3.20,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-1',
    supplierName: 'Green Valley Fresh Farms',
    salesVelocity: {
      dailyAverage: 5,
      weeklySales: 35,
      turnoverRate: 6.4,
      lastRestockedAt: getRelativeDate(-12),
      lastSoldAt: 'Today, 13:40'
    },
    tags: ['Smoothie', 'Antioxidants', 'Organic'],
    isFeatured: false
  },

  // 8. SNACKS & CONFECTIONERY
  {
    id: 'item-801',
    sku: 'SNK-CHP-01',
    barcode: '840129008014',
    name: 'Hand-Cooked Sea Salt & Truffle Crisps 150g',
    brand: 'Artisan Heritage',
    category: 'Snacks & Confectionery',
    subcategory: 'Chips & Crisps',
    description: 'Kettle cooked in small batches with black winter truffle seasoning.',
    currentStock: 42,
    unit: 'pack',
    minStockLevel: 20,
    reorderPoint: 30,
    optimalStockLevel: 70,
    maxCapacity: 100,
    location: {
      aisle: 'Aisle 08',
      shelf: 'Display Endcap E2',
      section: 'Premium Snacks',
      tempZone: 'ambient'
    },
    costPrice: 1.50,
    sellingPrice: 3.79,
    vatRate: 0.08,
    batches: [
      {
        id: 'b-801-1',
        batchNumber: 'CHP-512',
        quantity: 42,
        expiryDate: getRelativeDate(95),
        costPrice: 1.50,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-3',
    supplierName: 'Artisan Heritage Bakers',
    salesVelocity: {
      dailyAverage: 11,
      weeklySales: 77,
      turnoverRate: 3.8,
      lastRestockedAt: getRelativeDate(-4),
      lastSoldAt: 'Today, 16:20'
    },
    tags: ['Truffle', 'Gourmet Snack', 'Snacks'],
    isFeatured: true
  },
  {
    id: 'item-802',
    sku: 'SNK-CHOC-02',
    barcode: '840129008021',
    name: 'Single Origin 85% Dark Chocolate Bar 100g',
    brand: 'Global Pantry',
    category: 'Snacks & Confectionery',
    subcategory: 'Chocolate',
    description: 'Fairtrade Ecuadorian bean-to-bar chocolate with notes of vanilla & floral spice.',
    currentStock: 56,
    unit: 'pcs',
    minStockLevel: 20,
    reorderPoint: 30,
    optimalStockLevel: 80,
    maxCapacity: 120,
    location: {
      aisle: 'Aisle 08',
      shelf: 'Shelf 4C',
      section: 'Confectionery',
      tempZone: 'ambient'
    },
    costPrice: 1.80,
    sellingPrice: 4.49,
    vatRate: 0.08,
    batches: [
      {
        id: 'b-802-1',
        batchNumber: 'CHC-44',
        quantity: 56,
        expiryDate: getRelativeDate(300),
        costPrice: 1.80,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-5',
    supplierName: 'Global Pantry Direct',
    salesVelocity: {
      dailyAverage: 8,
      weeklySales: 56,
      turnoverRate: 7.0,
      lastRestockedAt: getRelativeDate(-8),
      lastSoldAt: 'Today, 15:45'
    },
    tags: ['Fairtrade', 'Dark Chocolate', 'Vegan'],
    isFeatured: false
  },

  // 9. HOUSEHOLD & PERSONAL CARE
  {
    id: 'item-901',
    sku: 'HOU-DSH-01',
    barcode: '840129009011',
    name: 'Plant-Based Concentrated Dish Liquid 500ml',
    brand: 'PureLife Eco',
    category: 'Household & Personal Care',
    subcategory: 'Cleaning',
    description: 'Biodegradable formula with organic pink grapefruit essential oil cut through grease.',
    currentStock: 25,
    unit: 'bottle',
    minStockLevel: 15,
    reorderPoint: 22,
    optimalStockLevel: 50,
    maxCapacity: 75,
    location: {
      aisle: 'Aisle 09',
      shelf: 'Household Shelf 2B',
      section: 'Eco Cleaning',
      tempZone: 'ambient'
    },
    costPrice: 2.10,
    sellingPrice: 4.99,
    vatRate: 0.10,
    batches: [
      {
        id: 'b-901-1',
        batchNumber: 'DSH-108',
        quantity: 25,
        expiryDate: getRelativeDate(720),
        costPrice: 2.10,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-6',
    supplierName: 'PureLife Eco Living',
    salesVelocity: {
      dailyAverage: 4,
      weeklySales: 28,
      turnoverRate: 6.2,
      lastRestockedAt: getRelativeDate(-11),
      lastSoldAt: 'Today, 11:40'
    },
    tags: ['Eco Friendly', 'Zero Toxic', 'Cleaning'],
    isFeatured: false
  },
  {
    id: 'item-902',
    sku: 'HOU-PAP-02',
    barcode: '840129009028',
    name: 'Bamboo Super Absorbent Paper Towels (4 Rolls)',
    brand: 'PureLife Eco',
    category: 'Household & Personal Care',
    subcategory: 'Paper Products',
    description: 'Tree-free 100% sustainable organic bamboo fiber paper towels.',
    currentStock: 5, // LOW STOCK
    unit: 'pack',
    minStockLevel: 12,
    reorderPoint: 18,
    optimalStockLevel: 40,
    maxCapacity: 60,
    location: {
      aisle: 'Aisle 09',
      shelf: 'Aisle 9 Floor Pallet',
      section: 'Paper Goods',
      tempZone: 'ambient'
    },
    costPrice: 3.50,
    sellingPrice: 7.49,
    vatRate: 0.10,
    batches: [
      {
        id: 'b-902-1',
        batchNumber: 'PAP-099',
        quantity: 5,
        expiryDate: getRelativeDate(900),
        costPrice: 3.50,
        markdownPercentage: 0,
        status: 'safe'
      }
    ],
    supplierId: 'sup-6',
    supplierName: 'PureLife Eco Living',
    salesVelocity: {
      dailyAverage: 6,
      weeklySales: 42,
      turnoverRate: 0.8,
      lastRestockedAt: getRelativeDate(-9),
      lastSoldAt: 'Today, 14:55'
    },
    tags: ['Sustainable', 'Bamboo', 'Home Care'],
    isFeatured: false
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-901',
    poNumber: 'PO-2026-0881',
    supplierId: 'sup-4',
    supplierName: 'Prime Harbor Meats & Seafood',
    status: 'in-transit',
    orderDate: getRelativeDate(-1),
    expectedDeliveryDate: getRelativeDate(1),
    items: [
      {
        itemId: 'item-402',
        sku: 'MEAT-SAL-02',
        name: 'Norwegian Atlantic Salmon Portions (300g)',
        unit: 'pack',
        orderedQty: 25,
        receivedQty: 0,
        unitCost: 6.80,
        totalCost: 170.00
      },
      {
        itemId: 'item-401',
        sku: 'MEAT-RIB-01',
        name: 'Prime Grass-Fed Angus Ribeye Steak (400g)',
        unit: 'pack',
        orderedQty: 20,
        receivedQty: 0,
        unitCost: 12.50,
        totalCost: 250.00
      }
    ],
    subtotal: 420.00,
    tax: 0.00,
    shippingFee: 25.00,
    totalAmount: 445.00,
    notes: 'Urgent restock for out of stock salmon and low ribeye inventory.',
    createdBy: 'Store Manager (Alex Chen)'
  },
  {
    id: 'po-902',
    poNumber: 'PO-2026-0879',
    supplierId: 'sup-2',
    supplierName: 'Alpine Crest Dairy Co.',
    status: 'pending',
    orderDate: getRelativeDate(0),
    expectedDeliveryDate: getRelativeDate(2),
    items: [
      {
        itemId: 'item-201',
        sku: 'DAIR-MLK-01',
        name: 'Farm Fresh Whole Milk 1 Gallon (3.78L)',
        unit: 'bottle',
        orderedQty: 50,
        receivedQty: 0,
        unitCost: 2.40,
        totalCost: 120.00
      },
      {
        itemId: 'item-204',
        sku: 'DAIR-BUT-04',
        name: 'European Style Cultured Butter 250g',
        unit: 'pack',
        orderedQty: 30,
        receivedQty: 0,
        unitCost: 2.90,
        totalCost: 87.00
      }
    ],
    subtotal: 207.00,
    tax: 0.00,
    shippingFee: 15.00,
    totalAmount: 222.00,
    notes: 'Weekly dairy baseline replenishment',
    createdBy: 'Auto-Reorder Engine'
  },
  {
    id: 'po-900',
    poNumber: 'PO-2026-0865',
    supplierId: 'sup-1',
    supplierName: 'Green Valley Fresh Farms',
    status: 'received',
    orderDate: getRelativeDate(-4),
    expectedDeliveryDate: getRelativeDate(-2),
    receivedDate: getRelativeDate(-2),
    items: [
      {
        itemId: 'item-101',
        sku: 'PROD-AVO-01',
        name: 'Organic Hass Avocados',
        unit: 'pcs',
        orderedQty: 50,
        receivedQty: 50,
        unitCost: 1.10,
        totalCost: 55.00
      },
      {
        itemId: 'item-102',
        sku: 'PROD-SPN-02',
        name: 'Organic Baby Spinach Clamshell 300g',
        unit: 'pack',
        orderedQty: 30,
        receivedQty: 30,
        unitCost: 1.80,
        totalCost: 54.00
      }
    ],
    subtotal: 109.00,
    tax: 0.00,
    shippingFee: 10.00,
    totalAmount: 119.00,
    notes: 'Delivered in good condition, cold chain verified.',
    createdBy: 'Store Manager (Alex Chen)'
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-001',
    timestamp: 'Today, 16:20',
    itemId: 'item-801',
    itemName: 'Hand-Cooked Sea Salt & Truffle Crisps 150g',
    sku: 'SNK-CHP-01',
    type: 'SALE',
    quantityDelta: -2,
    previousStock: 44,
    newStock: 42,
    batchNumber: 'CHP-512',
    reason: 'POS Counter 1 Sale #TRX-9482',
    performedBy: 'Cashier (Jordan)',
    unitCost: 1.50,
    financialImpact: 7.58
  },
  {
    id: 'mov-002',
    timestamp: 'Today, 16:05',
    itemId: 'item-201',
    itemName: 'Farm Fresh Whole Milk 1 Gallon (3.78L)',
    sku: 'DAIR-MLK-01',
    type: 'SALE',
    quantityDelta: -3,
    previousStock: 21,
    newStock: 18,
    batchNumber: 'MLK-552',
    reason: 'POS Counter 2 Sale #TRX-9480',
    performedBy: 'Cashier (Jordan)',
    unitCost: 2.40,
    financialImpact: 10.29
  },
  {
    id: 'mov-003',
    timestamp: 'Today, 14:15',
    itemId: 'item-301',
    itemName: 'San Francisco Style Artisan Sourdough Batard',
    sku: 'BAKE-SRD-01',
    type: 'MARKDOWN_APPLIED',
    quantityDelta: 0,
    previousStock: 14,
    newStock: 14,
    batchNumber: 'SRD-DAILY-01',
    reason: 'Dynamic Expiry Markdown: 35% discount applied (Expiring in 24h)',
    performedBy: 'Expiry AI Engine',
    unitCost: 2.20,
    financialImpact: -1.93
  },
  {
    id: 'mov-004',
    timestamp: 'Yesterday, 18:44',
    itemId: 'item-402',
    itemName: 'Norwegian Atlantic Salmon Portions (300g)',
    sku: 'MEAT-SAL-02',
    type: 'SALE',
    quantityDelta: -4,
    previousStock: 4,
    newStock: 0,
    batchNumber: 'SAL-088',
    reason: 'POS Counter 1 Sale - Stock Depleted',
    performedBy: 'Cashier (Sam)',
    unitCost: 6.80,
    financialImpact: 49.96
  },
  {
    id: 'mov-005',
    timestamp: getRelativeDate(-2) + ' 10:30',
    itemId: 'item-101',
    itemName: 'Organic Hass Avocados',
    sku: 'PROD-AVO-01',
    type: 'RESTOCK',
    quantityDelta: 50,
    previousStock: 12,
    newStock: 62,
    batchNumber: 'AVO-24B',
    reason: 'Goods Receipt for PO-2026-0865',
    performedBy: 'Alex Chen (Manager)',
    unitCost: 1.10,
    financialImpact: 55.00
  }
];

export const INITIAL_WASTAGE_LOGS: WastageLog[] = [
  {
    id: 'wst-101',
    timestamp: getRelativeDate(-1) + ' 21:30',
    itemId: 'item-102',
    itemName: 'Organic Baby Spinach Clamshell 300g',
    sku: 'PROD-SPN-02',
    batchNumber: 'SPN-990',
    quantity: 3,
    unit: 'pack',
    reason: 'expired',
    unitCost: 1.80,
    totalLoss: 5.40,
    disposalMethod: 'compost',
    recordedBy: 'Alex Chen',
    notes: 'Reached expiration without selling at 50% discount'
  },
  {
    id: 'wst-102',
    timestamp: getRelativeDate(-3) + ' 11:10',
    itemId: 'item-502',
    itemName: 'Cold Pressed Pure Orange Juice 1L',
    sku: 'BEV-OJ-02',
    batchNumber: 'OJ-430',
    quantity: 2,
    unit: 'bottle',
    reason: 'damaged',
    unitCost: 2.20,
    totalLoss: 4.40,
    disposalMethod: 'supplier_claim',
    recordedBy: 'Jordan (Inventory Staff)',
    notes: 'Dropped during shelf restocking, seal broken'
  }
];
