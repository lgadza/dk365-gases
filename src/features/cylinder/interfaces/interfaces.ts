/**
 * Cylinder Category Interface
 */
export interface CylinderCategoryInterface {
  id: string;
  categoryName: string;
  description?: string;
  totalQuantity: number;
  filledQuantity: number;
  emptyQuantity: number;
  location?: string;
  lastRestocked?: Date;
  price?: number;
  depositAmount?: number;
  cylinderWeight?: number;
  gasType?: string;
  status: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Cylinder Movement Interface
 */
export interface CylinderMovementInterface {
  id: string;
  categoryId: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  movementType: string; // 'sale', 'exchange', 'return', 'restock'
  customerId?: string;
  driverId?: string;
  invoiceId?: string;
  timestamp: Date;
  status: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
