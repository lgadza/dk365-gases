import {
  CylinderCategoryInterface,
  CylinderMovementInterface,
} from "./interfaces/interfaces";

/**
 * Base DTO for cylinder category information
 */
export interface CylinderCategoryBaseDTO {
  id: string;
  categoryName: string;
  description?: string;
  totalQuantity: number;
  filledQuantity: number;
  emptyQuantity: number;
  location?: string;
  lastRestocked?: string;
  price?: number;
  depositAmount?: number;
  cylinderWeight?: number;
  gasType?: string;
  status: string;
  notes?: string;
}

/**
 * Detailed cylinder category DTO with all information
 */
export interface CylinderCategoryDetailDTO extends CylinderCategoryBaseDTO {
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new cylinder category
 */
export interface CreateCylinderCategoryDTO {
  categoryName: string;
  description?: string;
  totalQuantity: number;
  filledQuantity: number;
  emptyQuantity?: number;
  location?: string;
  price?: number;
  depositAmount?: number;
  cylinderWeight?: number;
  gasType?: string;
  status?: string;
  notes?: string;
}

/**
 * DTO for updating a cylinder category
 */
export interface UpdateCylinderCategoryDTO {
  categoryName?: string;
  description?: string;
  totalQuantity?: number;
  filledQuantity?: number;
  emptyQuantity?: number;
  location?: string;
  lastRestocked?: string;
  price?: number;
  depositAmount?: number;
  cylinderWeight?: number;
  gasType?: string;
  status?: string;
  notes?: string;
}

/**
 * Query parameters for cylinder category list
 */
export interface CylinderCategoryListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  location?: string;
  status?: string;
  gasType?: string;
  minFilledQuantity?: number;
  maxFilledQuantity?: number;
  requiresRestock?: boolean;
}

/**
 * Paginated cylinder category list response
 */
export interface PaginatedCylinderCategoryListDTO {
  categories: CylinderCategoryDetailDTO[];
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
 * Base DTO for cylinder movement information
 */
export interface CylinderMovementBaseDTO {
  id: string;
  categoryId: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  movementType: string;
  customerId?: string;
  driverId?: string;
  invoiceId?: string;
  timestamp: string;
  status: string;
  notes?: string;
}

/**
 * Detailed cylinder movement DTO
 */
export interface CylinderMovementDetailDTO extends CylinderMovementBaseDTO {
  category?: CylinderCategoryBaseDTO;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new cylinder movement
 */
export interface CreateCylinderMovementDTO {
  categoryId: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  movementType: string;
  customerId?: string;
  driverId?: string;
  invoiceId?: string;
  timestamp?: string;
  status?: string;
  notes?: string;
}

/**
 * DTO for updating a cylinder movement
 */
export interface UpdateCylinderMovementDTO {
  quantity?: number;
  fromLocation?: string;
  toLocation?: string;
  movementType?: string;
  customerId?: string;
  driverId?: string;
  invoiceId?: string;
  timestamp?: string;
  status?: string;
  notes?: string;
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
  categoryId?: string;
  movementType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  driverId?: string;
}

/**
 * Paginated cylinder movement list response
 */
export interface PaginatedCylinderMovementListDTO {
  movements: CylinderMovementDetailDTO[];
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
 * Cylinder inventory summary DTO
 */
export interface CylinderInventorySummaryDTO {
  totalCategories: number;
  totalCylinders: number;
  totalFilled: number;
  totalEmpty: number;
  byLocation: Record<
    string,
    {
      total: number;
      filled: number;
      empty: number;
    }
  >;
  byStatus: Record<string, number>;
  byGasType: Record<string, number>;
  requiresRestock: number;
}

/**
 * Mapper class for converting between Cylinder entities and DTOs
 */
export class CylinderDTOMapper {
  /**
   * Map Category entity to DetailDTO
   */
  public static toCategoryDetailDTO(
    category: CylinderCategoryInterface
  ): CylinderCategoryDetailDTO {
    return {
      id: category.id,
      categoryName: category.categoryName,
      description: category.description,
      totalQuantity: category.totalQuantity,
      filledQuantity: category.filledQuantity,
      emptyQuantity: category.emptyQuantity,
      location: category.location,
      lastRestocked: category.lastRestocked
        ? category.lastRestocked.toISOString().split("T")[0]
        : undefined,
      price: category.price,
      depositAmount: category.depositAmount,
      cylinderWeight: category.cylinderWeight,
      gasType: category.gasType,
      status: category.status,
      notes: category.notes,
      createdAt: category.createdAt
        ? category.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: category.updatedAt
        ? category.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }

  /**
   * Map Movement entity to DetailDTO
   */
  public static toMovementDetailDTO(
    movement: CylinderMovementInterface,
    category?: CylinderCategoryInterface
  ): CylinderMovementDetailDTO {
    return {
      id: movement.id,
      categoryId: movement.categoryId,
      quantity: movement.quantity,
      fromLocation: movement.fromLocation,
      toLocation: movement.toLocation,
      movementType: movement.movementType,
      customerId: movement.customerId,
      driverId: movement.driverId,
      invoiceId: movement.invoiceId,
      timestamp: movement.timestamp.toISOString(),
      status: movement.status,
      notes: movement.notes,
      category: category ? this.toCategoryDetailDTO(category) : undefined,
      createdAt: movement.createdAt
        ? movement.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: movement.updatedAt
        ? movement.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
