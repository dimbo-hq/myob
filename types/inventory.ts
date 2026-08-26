export type TempZone = 'ambient' | 'chilled' | 'frozen';

export type StockStatus = 
  | 'in-stock' 
  | 'low-stock' 
  | 'critical' 
  | 'out-of-stock' 
  | 'expiring-soon' 
  | 'expired';

export type CategoryType = 
  | 'Fresh Produce'
  | 'Dairy & Eggs'
  | 'Bakery & Deli'
  | 'Meat & Seafood'
  | 'Beverages'
  | 'Pantry & Dry Goods'
  | 'Frozen Foods'
  | 'Snacks & Confectionery'
  | 'Household & Personal Care';

export type UnitType = 
  | 'pcs' 
  | 'kg' 
  | 'g' 
  | 'litres' 
  | 'ml' 
  | 'pack' 
  | 'box' 
  | 'crate' 
  | 'bunch' 
  | 'bottle';

export interface BatchInfo {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string; // ISO date string YYYY-MM-DD
  manufacturingDate?: string;
  costPrice: number;
  markdownPercentage: number; // e.g. 0, 20, 50
  markdownPrice?: number;
  status: 'safe' | 'warning' | 'critical' | 'expired';
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  storeAddress?: string;
  currency?: string;
  phone?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  minOrderValue: number;
  rating: number; // 1 to 5
  paymentTerms: string;
  address: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  brand: string;
  category: CategoryType;
  subcategory: string;
  description: string;
  
  // Stock Levels
  currentStock: number;
  unit: UnitType;
  minStockLevel: number; // Safety stock
  reorderPoint: number; // Trigger point
  optimalStockLevel: number; // Target max
  maxCapacity: number;
  
  // Location
  location: {
    aisle: string;
    shelf: string;
    section: string;
    tempZone: TempZone;
  };
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  vatRate: number; // e.g. 0.05, 0.20
  
  // Batches & Expiry
  batches: BatchInfo[];
  
  // Supplier Info
  supplierId: string;
  supplierName: string;
  
  // Sales & Performance
  salesVelocity: {
    dailyAverage: number;
    weeklySales: number;
    turnoverRate: number; // Days of inventory
    lastRestockedAt: string;
    lastSoldAt: string;
  };
  
  imageUrl?: string;
  tags: string[];
  isFeatured?: boolean;
  notes?: string;
}

export type POStatus = 
  | 'draft' 
  | 'pending' 
  | 'sent' 
  | 'in-transit' 
  | 'partially-received' 
  | 'received' 
  | 'cancelled';

export interface POLineItem {
  itemId: string;
  sku: string;
  name: string;
  unit: UnitType;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
  suggestedQty?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  items: POLineItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
  createdBy: string;
}

export type MovementType = 
  | 'SALE' 
  | 'RESTOCK' 
  | 'ADJUSTMENT' 
  | 'WASTE_EXPIRED' 
  | 'WASTE_DAMAGED' 
  | 'MARKDOWN_APPLIED' 
  | 'RETURN'
  | 'INITIAL_COUNT';

export interface StockMovement {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: MovementType;
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  batchNumber?: string;
  reason: string;
  performedBy: string;
  unitCost: number;
  financialImpact: number;
}

export interface WastageLog {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  sku: string;
  batchNumber: string;
  quantity: number;
  unit: UnitType;
  reason: 'expired' | 'damaged' | 'spoiled_cold_chain' | 'packaging_defect';
  unitCost: number;
  totalLoss: number;
  disposalMethod: 'compost' | 'landfill' | 'bio_waste' | 'supplier_claim';
  recordedBy: string;
  notes?: string;
}

export interface POSCartItem {
  item: InventoryItem;
  batch?: BatchInfo;
  quantity: number;
  unitPrice: number;
  appliedDiscountPercentage: number;
  total: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  onAction?: () => void;
}
