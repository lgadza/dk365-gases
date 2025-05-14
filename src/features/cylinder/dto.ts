import {
  CylinderInterface,
  CylinderTypeInterface,
  CylinderMovementInterface,
} from "./interfaces/interfaces";
import Cylinder from "./model";

/**
 * Base DTO for cylinder information
 */
export interface CylinderBaseDTO {
  id: string;
  serialNumber: string;
  cylinderTypeId: string;
  manufacturerId: string | null;
  manufacturerName: string | null;
  manufacturingDate: string | null;
  lastInspectionDate: string | null;
  nextInspectionDate: string | null;
  capacity: number;
  color: string | null;
  status: string;
  location: string | null;
  currentGasType: string | null;
  fillLevel: number | null;
  tare: number | null;
  valveType: string | null;
  currentPressure: number | null;
  maxPressure: number | null;
  batchNumber: string | null;
  notes: string | null;
  barcode: string | null;
  rfidTag: string | null;
  isActive: boolean;
  lastFilled: string | null;
  lastLeakTest: string | null;
  lastMaintenanceDate: string | null;
  maintenanceDueDate: string | null;
  assignedCustomerId: string | null;
  assignedCustomerName: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Detailed cylinder DTO with timestamps and type info
 */
export interface CylinderDetailDTO extends CylinderBaseDTO {
  type: CylinderTypeDTO | null;
  needsInspection: boolean;
  needsMaintenance: boolean;
  daysUntilInspection: number | null;
  fillPercentage: number | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple cylinder DTO with type and gas name
 */
export interface CylinderSimpleDTO extends CylinderBaseDTO {
  typeName: string;
  gasTypeName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new cylinder
 */
export interface CreateCylinderDTO {
  serialNumber: string;
  cylinderTypeId: string;
  manufacturerId?: string | null;
  manufacturerName?: string | null;
  manufacturingDate?: Date | string | null;
  lastInspectionDate?: Date | string | null;
  nextInspectionDate?: Date | string | null;
  capacity: number;
  color?: string | null;
  status?: string;
  location?: string | null;
  currentGasType?: string | null;
  fillLevel?: number | null;
  tare?: number | null;
  valveType?: string | null;
  currentPressure?: number | null;
  maxPressure?: number | null;
  batchNumber?: string | null;
  notes?: string | null;
  barcode?: string | null;
  rfidTag?: string | null;
  isActive?: boolean;
  lastFilled?: Date | string | null;
  lastLeakTest?: Date | string | null;
  lastMaintenanceDate?: Date | string | null;
  maintenanceDueDate?: Date | string | null;
  assignedCustomerId?: string | null;
  assignedCustomerName?: string | null;
  createdBy: string;
}

/**
 * DTO for updating a cylinder
 */
export interface UpdateCylinderDTO {
  cylinderTypeId?: string;
  manufacturerId?: string | null;
  manufacturerName?: string | null;
  manufacturingDate?: Date | string | null;
  lastInspectionDate?: Date | string | null;
  nextInspectionDate?: Date | string | null;
  capacity?: number;
  color?: string | null;
  status?: string;
  location?: string | null;
  currentGasType?: string | null;
  fillLevel?: number | null;
  tare?: number | null;
  valveType?: string | null;
  currentPressure?: number | null;
  maxPressure?: number | null;
  batchNumber?: string | null;
  notes?: string | null;
  barcode?: string | null;
  rfidTag?: string | null;
  isActive?: boolean;
  lastFilled?: Date | string | null;
  lastLeakTest?: Date | string | null;
  lastMaintenanceDate?: Date | string | null;
  maintenanceDueDate?: Date | string | null;
  assignedCustomerId?: string | null;
  assignedCustomerName?: string | null;
  updatedBy: string;
}

/**
 * Cylinder Type DTO
 */
export interface CylinderTypeDTO {
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
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new cylinder type
 */
export interface CreateCylinderTypeDTO {
  name: string;
  description?: string | null;
  capacity: number;
  gasType: string;
  material: string;
  height?: number | null;
  diameter?: number | null;
  weight?: number | null;
  color?: string | null;
  valveType?: string | null;
  standardPressure?: number | null;
  maxPressure?: number | null;
  image?: string | null;
  isActive?: boolean;
  createdBy: string;
}

/**
 * DTO for updating a cylinder type
 */
export interface UpdateCylinderTypeDTO {
  name?: string;
  description?: string | null;
  capacity?: number;
  gasType?: string;
  material?: string;
  height?: number | null;
  diameter?: number | null;
  weight?: number | null;
  color?: string | null;
  valveType?: string | null;
  standardPressure?: number | null;
  maxPressure?: number | null;
  image?: string | null;
  isActive?: boolean;
  updatedBy: string;
}

/**
 * Cylinder Movement DTO
 */
export interface CylinderMovementDTO {
  id: string;
  cylinderId: string;
  cylinderSerialNumber: string;
  movementType: string;
  fromLocation: string | null;
  toLocation: string | null;
  fromStatus: string | null;
  toStatus: string;
  quantity: number;
  transactionDate: string;
  customerId: string | null;
  customerName: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
  performedBy: string;
  performedByName: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new cylinder movement
 */
export interface CreateCylinderMovementDTO {
  cylinderId: string;
  movementType: string;
  fromLocation?: string | null;
  toLocation?: string | null;
  fromStatus?: string | null;
  toStatus: string;
  quantity?: number;
  transactionDate?: Date | string;
  customerId?: string | null;
  customerName?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  performedBy: string;
  notes?: string | null;
  createdBy: string;
}

/**
 * DTO for updating a cylinder movement
 */
export interface UpdateCylinderMovementDTO {
  movementType?: string;
  fromLocation?: string | null;
  toLocation?: string | null;
  fromStatus?: string | null;
  toStatus?: string;
  quantity?: number;
  transactionDate?: Date | string;
  customerId?: string | null;
  customerName?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  performedBy?: string;
  notes?: string | null;
}

/**
 * Query parameters for cylinder list
 */
export interface CylinderListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  gasType?: string;
  location?: string;
  cylinderTypeId?: string;
  customerId?: string;
  isActive?: boolean;
  needsInspection?: boolean;
  needsMaintenance?: boolean;
}

/**
 * Query parameters for cylinder type list
 */
export interface CylinderTypeListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Enhanced search parameters
  name?: string;
  description?: string;
  gasType?: string;
  material?: string;
  minCapacity?: number;
  maxCapacity?: number;
  valveType?: string;
  color?: string;
  minWeight?: number;
  maxWeight?: number;
  minHeight?: number;
  maxHeight?: number;
  minDiameter?: number;
  maxDiameter?: number;
  isActive?: boolean;
}

/**
 * Query parameters for cylinder movement list
 */
export interface CylinderMovementListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  cylinderId?: string;
  movementType?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Paginated cylinder list response
 */
export interface PaginatedCylinderListDTO {
  cylinders: CylinderSimpleDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Paginated cylinder type list response
 */
export interface PaginatedCylinderTypeListDTO {
  types: CylinderTypeDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Paginated cylinder movement list response
 */
export interface PaginatedCylinderMovementListDTO {
  movements: CylinderMovementDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Cylinder statistics DTO
 */
export interface CylinderStatsDTO {
  totalCylinders: number;
  activeCylinders: number;
  byStatus: Record<string, number>;
  byGasType: Record<string, number>;
  byLocation: Record<string, number>;
  byCylinderType: Record<string, number>;
  needInspection: number;
  needMaintenance: number;
  availableForFilling: number;
  loaned: number;
  loanedByCustomer: Record<string, number>;
}

/**
 * Mapper class for converting between entity and DTOs
 */
export class CylinderDTOMapper {
  /**
   * Map Cylinder entity to BaseDTO
   */
  public static toBaseDTO(cylinder: CylinderInterface): CylinderBaseDTO {
    return {
      id: cylinder.id,
      serialNumber: cylinder.serialNumber,
      cylinderTypeId: cylinder.cylinderTypeId,
      manufacturerId: cylinder.manufacturerId,
      manufacturerName: cylinder.manufacturerName,
      manufacturingDate: formatDateToISOString(cylinder.manufacturingDate),
      lastInspectionDate: formatDateToISOString(cylinder.lastInspectionDate),
      nextInspectionDate: formatDateToISOString(cylinder.nextInspectionDate),
      capacity: cylinder.capacity,
      color: cylinder.color,
      status: cylinder.status,
      location: cylinder.location,
      currentGasType: cylinder.currentGasType,
      fillLevel: cylinder.fillLevel,
      tare: cylinder.tare,
      valveType: cylinder.valveType,
      currentPressure: cylinder.currentPressure,
      maxPressure: cylinder.maxPressure,
      batchNumber: cylinder.batchNumber,
      notes: cylinder.notes,
      barcode: cylinder.barcode,
      rfidTag: cylinder.rfidTag,
      isActive: cylinder.isActive,
      lastFilled: formatDateToISOString(cylinder.lastFilled),
      lastLeakTest: formatDateToISOString(cylinder.lastLeakTest),
      lastMaintenanceDate: formatDateToISOString(cylinder.lastMaintenanceDate),
      maintenanceDueDate: formatDateToISOString(cylinder.maintenanceDueDate),
      assignedCustomerId: cylinder.assignedCustomerId,
      assignedCustomerName: cylinder.assignedCustomerName,
      createdAt: formatDateToISOString(cylinder.createdAt) || undefined,
      updatedAt: formatDateToISOString(cylinder.updatedAt) || undefined,
    };
  }

  /**
   * Map Cylinder entity to DetailDTO
   */
  public static toDetailDTO(
    cylinder: CylinderInterface,
    cylinderType?: CylinderTypeInterface | null
  ): CylinderDetailDTO {
    const cylinderInstance =
      cylinder instanceof Cylinder
        ? cylinder
        : Object.assign(new Cylinder(), cylinder);

    return {
      ...this.toBaseDTO(cylinder),
      type: cylinderType ? this.toCylinderTypeDTO(cylinderType) : null,
      needsInspection: cylinderInstance.needsInspection(),
      needsMaintenance: cylinderInstance.needsMaintenance(),
      daysUntilInspection: cylinderInstance.daysUntilInspection(),
      fillPercentage: cylinderInstance.getFillPercentage(),
      createdBy: cylinder.createdBy,
      updatedBy: cylinder.updatedBy,
      createdAt: cylinder.createdAt.toISOString(),
      updatedAt: cylinder.updatedAt.toISOString(),
    };
  }

  /**
   * Map Cylinder entity to SimpleDTO
   */
  public static toSimpleDTO(
    cylinder: CylinderInterface,
    typeName: string = "Unknown Type",
    gasTypeName: string = "Unknown Gas"
  ): CylinderSimpleDTO {
    return {
      ...this.toBaseDTO(cylinder),
      typeName,
      gasTypeName,
      createdAt: cylinder.createdAt.toISOString(),
      updatedAt: cylinder.updatedAt.toISOString(),
    };
  }

  /**
   * Map CylinderType entity to DTO
   */
  public static toCylinderTypeDTO(
    type: CylinderTypeInterface
  ): CylinderTypeDTO {
    return {
      id: type.id,
      name: type.name,
      description: type.description,
      capacity: type.capacity,
      gasType: type.gasType,
      material: type.material,
      height: type.height,
      diameter: type.diameter,
      weight: type.weight,
      color: type.color,
      valveType: type.valveType,
      standardPressure: type.standardPressure,
      maxPressure: type.maxPressure,
      image: type.image,
      isActive: type.isActive,
      createdBy: type.createdBy,
      updatedBy: type.updatedBy,
      createdAt: type.createdAt.toISOString(),
      updatedAt: type.updatedAt.toISOString(),
    };
  }

  /**
   * Map CylinderMovement entity to DTO
   */
  public static toCylinderMovementDTO(
    movement: CylinderMovementInterface,
    cylinderSerialNumber: string = "Unknown",
    performedByName: string = "Unknown User"
  ): CylinderMovementDTO {
    return {
      id: movement.id,
      cylinderId: movement.cylinderId,
      cylinderSerialNumber: cylinderSerialNumber,
      movementType: movement.movementType,
      fromLocation: movement.fromLocation,
      toLocation: movement.toLocation,
      fromStatus: movement.fromStatus,
      toStatus: movement.toStatus,
      quantity: movement.quantity,
      transactionDate: movement.transactionDate.toISOString(),
      customerId: movement.customerId,
      customerName: movement.customerName,
      invoiceId: movement.invoiceId,
      invoiceNumber: movement.invoiceNumber,
      performedBy: movement.performedBy,
      performedByName: performedByName,
      notes: movement.notes,
      createdBy: movement.createdBy,
      createdAt: movement.createdAt.toISOString(),
      updatedAt: movement.updatedAt.toISOString(),
    };
  }
}

/**
 * Helper function to safely format a date to ISO string
 * Handles both Date objects and string dates
 */
const formatDateToISOString = (date: Date | string | null): string | null => {
  if (!date) return null;

  try {
    // If it's already a Date object, use toISOString directly
    if (date instanceof Date) {
      return date.toISOString();
    }

    // Otherwise, convert the string to a Date object first
    return new Date(date).toISOString();
  } catch (error) {
    console.error(`Invalid date format: ${date}`, error);
    return null;
  }
};
