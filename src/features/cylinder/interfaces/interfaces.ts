import { Optional } from "sequelize";

/**
 * Interface for Cylinder model
 */
export interface CylinderInterface {
  id: string;
  serialNumber: string;
  cylinderTypeId: string;
  manufacturerId: string | null;
  manufacturerName: string | null;
  manufacturingDate: Date | null;
  lastInspectionDate: Date | null;
  nextInspectionDate: Date | null;
  capacity: number;
  color: string | null;
  status: string;
  location: string | null;
  currentGasType: string | null;
  fillLevel: number | null;
  tare: number | null; // Empty weight of cylinder in kg
  valveType: string | null;
  currentPressure: number | null;
  maxPressure: number | null;
  batchNumber: string | null;
  notes: string | null;
  barcode: string | null;
  rfidTag: string | null;
  isActive: boolean;
  lastFilled: Date | null;
  lastLeakTest: Date | null;
  lastMaintenanceDate: Date | null;
  maintenanceDueDate: Date | null;
  assignedCustomerId: string | null;
  assignedCustomerName: string | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Cylinder Type model
 */
export interface CylinderTypeInterface {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  gasType: string;
  material: string;
  height: number | null;
  diameter: number | null;
  weight: number | null;
  color: string | null;
  valveType: string | null;
  standardPressure: number | null;
  maxPressure: number | null;
  image: string | null;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Cylinder Movement model
 */
export interface CylinderMovementInterface {
  id: string;
  cylinderId: string;
  movementType: string;
  fromLocation: string | null;
  toLocation: string | null;
  fromStatus: string | null;
  toStatus: string;
  quantity: number;
  transactionDate: Date;
  customerId: string | null;
  customerName: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
  performedBy: string;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cylinder status enum
 */
export enum CylinderStatus {
  AVAILABLE = "available",
  IN_USE = "in_use",
  LOANED = "loaned",
  EMPTY = "empty",
  FILLED = "filled",
  MAINTENANCE = "maintenance",
  TESTING = "testing",
  EXPIRED = "expired",
  DAMAGED = "damaged",
  LOST = "lost",
  SCRAPPED = "scrapped",
}

/**
 * Cylinder movement type enum
 */
export enum CylinderMovementType {
  FILL = "fill",
  EMPTY = "empty",
  LOAN = "loan",
  RETURN = "return",
  TRANSFER = "transfer",
  MAINTENANCE = "maintenance",
  INSPECTION = "inspection",
  RECEIVE = "receive",
  DISPOSE = "dispose",
  SELL = "sell",
  PURCHASE = "purchase",
}

/**
 * Gas types enum
 */
export enum GasType {
  LPG = "lpg", // Liquefied Petroleum Gas
  CNG = "cng", // Compressed Natural Gas
  OXYGEN = "oxygen",
  NITROGEN = "nitrogen",
  HYDROGEN = "hydrogen",
  HELIUM = "helium",
  ARGON = "argon",
  CARBON_DIOXIDE = "carbon_dioxide",
  ACETYLENE = "acetylene",
  PROPANE = "propane",
  BUTANE = "butane",
  MIXED = "mixed",
  OTHER = "other",
}

/**
 * Cylinder material enum
 */
export enum CylinderMaterial {
  STEEL = "steel",
  ALUMINUM = "aluminum",
  COMPOSITE = "composite",
  FIBER = "fiber",
  OTHER = "other",
}

/**
 * Valve types enum
 */
export enum ValveType {
  STANDARD = "standard",
  SELF_CLOSING = "self_closing",
  QUICK_RELEASE = "quick_release",
  PRESSURE_RELIEF = "pressure_relief",
  RESIDUAL_PRESSURE = "residual_pressure",
  OTHER = "other",
}
