import { Transaction } from "sequelize";
import {
  CylinderCategoryInterface,
  CylinderMovementInterface,
} from "./interfaces";
import {
  CylinderCategoryDetailDTO,
  CreateCylinderCategoryDTO,
  UpdateCylinderCategoryDTO,
  CylinderCategoryListQueryParams,
  PaginatedCylinderCategoryListDTO,
  CylinderMovementDetailDTO,
  CreateCylinderMovementDTO,
  UpdateCylinderMovementDTO,
  CylinderMovementListQueryParams,
  PaginatedCylinderMovementListDTO,
  CylinderInventorySummaryDTO,
} from "../dto";

export interface ICylinderRepository {
  // Category operations
  findCategoryById(id: string): Promise<CylinderCategoryInterface | null>;
  createCategory(
    categoryData: CreateCylinderCategoryDTO,
    transaction?: Transaction
  ): Promise<CylinderCategoryInterface>;
  updateCategory(
    id: string,
    categoryData: UpdateCylinderCategoryDTO,
    transaction?: Transaction
  ): Promise<boolean>;
  deleteCategory(id: string, transaction?: Transaction): Promise<boolean>;
  getCategoryList(params: CylinderCategoryListQueryParams): Promise<{
    categories: CylinderCategoryInterface[];
    total: number;
  }>;

  // Movement operations
  findMovementById(id: string): Promise<CylinderMovementInterface | null>;
  createMovement(
    movementData: CreateCylinderMovementDTO,
    transaction?: Transaction
  ): Promise<CylinderMovementInterface>;
  updateMovement(
    id: string,
    movementData: UpdateCylinderMovementDTO,
    transaction?: Transaction
  ): Promise<boolean>;
  deleteMovement(id: string, transaction?: Transaction): Promise<boolean>;
  getMovementList(params: CylinderMovementListQueryParams): Promise<{
    movements: CylinderMovementInterface[];
    total: number;
  }>;
  getMovementsByCategory(
    categoryId: string
  ): Promise<CylinderMovementInterface[]>;

  // Inventory operations
  adjustCategoryQuantities(
    categoryId: string,
    filledAdjustment: number,
    emptyAdjustment: number,
    transaction?: Transaction
  ): Promise<boolean>;
  getCategoriesByLocation(
    location: string
  ): Promise<CylinderCategoryInterface[]>;
  getCategoriesByStatus(status: string): Promise<CylinderCategoryInterface[]>;
  getCategoriesRequiringRestock(): Promise<CylinderCategoryInterface[]>;
}

export interface ICylinderService {
  // Category operations
  getCategoryById(id: string): Promise<CylinderCategoryDetailDTO>;
  createCategory(
    categoryData: CreateCylinderCategoryDTO
  ): Promise<CylinderCategoryDetailDTO>;
  updateCategory(
    id: string,
    categoryData: UpdateCylinderCategoryDTO
  ): Promise<CylinderCategoryDetailDTO>;
  deleteCategory(id: string): Promise<boolean>;
  getCategoryList(
    params: CylinderCategoryListQueryParams
  ): Promise<PaginatedCylinderCategoryListDTO>;

  // Movement operations
  getMovementById(id: string): Promise<CylinderMovementDetailDTO>;
  createMovement(
    movementData: CreateCylinderMovementDTO
  ): Promise<CylinderMovementDetailDTO>;
  updateMovement(
    id: string,
    movementData: UpdateCylinderMovementDTO
  ): Promise<CylinderMovementDetailDTO>;
  deleteMovement(id: string): Promise<boolean>;
  getMovementList(
    params: CylinderMovementListQueryParams
  ): Promise<PaginatedCylinderMovementListDTO>;
  getMovementsByCategory(
    categoryId: string
  ): Promise<CylinderMovementDetailDTO[]>;

  // Inventory operations
  performCylinderExchange(
    categoryId: string,
    filledQuantity: number,
    customerId?: string,
    driverId?: string,
    invoiceId?: string
  ): Promise<CylinderMovementDetailDTO>;
  performCylinderSale(
    categoryId: string,
    quantity: number,
    customerId?: string,
    invoiceId?: string
  ): Promise<CylinderMovementDetailDTO>;
  performCylinderReturn(
    categoryId: string,
    quantity: number,
    customerId?: string,
    invoiceId?: string
  ): Promise<CylinderMovementDetailDTO>;
  performCylinderRestock(
    categoryId: string,
    filledQuantity: number,
    emptyQuantity: number
  ): Promise<CylinderMovementDetailDTO>;
  getInventorySummary(): Promise<CylinderInventorySummaryDTO>;
  getCategoriesByLocation(
    location: string
  ): Promise<CylinderCategoryDetailDTO[]>;
  getCategoriesByStatus(status: string): Promise<CylinderCategoryDetailDTO[]>;
  getCategoriesRequiringRestock(): Promise<CylinderCategoryDetailDTO[]>;
}
