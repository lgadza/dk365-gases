import {
  CylinderInterface,
  CylinderTypeInterface,
  CylinderMovementInterface,
} from "./interfaces";
import {
  CylinderDetailDTO,
  CreateCylinderDTO,
  UpdateCylinderDTO,
  PaginatedCylinderListDTO,
  CylinderListQueryParams,
  CylinderTypeDTO,
  CreateCylinderTypeDTO,
  UpdateCylinderTypeDTO,
  PaginatedCylinderTypeListDTO,
  CylinderTypeListQueryParams,
  CylinderMovementDTO,
  CreateCylinderMovementDTO,
  UpdateCylinderMovementDTO,
  PaginatedCylinderMovementListDTO,
  CylinderMovementListQueryParams,
  CylinderStatsDTO,
} from "../dto";
import { Transaction } from "sequelize";

export interface ICylinderRepository {
  /**
   * Find a cylinder by ID
   */
  findCylinderById(id: string): Promise<CylinderInterface | null>;

  /**
   * Find a cylinder by serial number
   */
  findCylinderBySerialNumber(
    serialNumber: string
  ): Promise<CylinderInterface | null>;

  /**
   * Create a new cylinder
   */
  createCylinder(
    cylinderData: CreateCylinderDTO,
    transaction?: Transaction
  ): Promise<CylinderInterface>;

  /**
   * Update a cylinder
   */
  updateCylinder(
    id: string,
    cylinderData: UpdateCylinderDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a cylinder
   */
  deleteCylinder(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get cylinder list with filtering and pagination
   */
  getCylinderList(params: CylinderListQueryParams): Promise<{
    cylinders: CylinderInterface[];
    total: number;
  }>;

  /**
   * Find cylinders by type ID
   */
  findCylindersByTypeId(typeId: string): Promise<CylinderInterface[]>;

  /**
   * Find cylinders by customer ID
   */
  findCylindersByCustomerId(customerId: string): Promise<CylinderInterface[]>;

  /**
   * Find cylinders by status
   */
  findCylindersByStatus(status: string): Promise<CylinderInterface[]>;

  /**
   * Find cylinders that need inspection
   */
  findCylindersForInspection(
    daysThreshold: number
  ): Promise<CylinderInterface[]>;

  /**
   * Update cylinder status
   */
  updateCylinderStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Find a cylinder type by ID
   */
  findCylinderTypeById(id: string): Promise<CylinderTypeInterface | null>;

  /**
   * Create a new cylinder type
   */
  createCylinderType(
    typeData: CreateCylinderTypeDTO,
    transaction?: Transaction
  ): Promise<CylinderTypeInterface>;

  /**
   * Update a cylinder type
   */
  updateCylinderType(
    id: string,
    typeData: UpdateCylinderTypeDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a cylinder type
   */
  deleteCylinderType(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get cylinder types list with filtering and pagination
   */
  getCylinderTypeList(params: CylinderTypeListQueryParams): Promise<{
    types: CylinderTypeInterface[];
    total: number;
  }>;

  /**
   * Create a cylinder movement
   */
  createCylinderMovement(
    movementData: CreateCylinderMovementDTO,
    transaction?: Transaction
  ): Promise<CylinderMovementInterface>;

  /**
   * Update a cylinder movement
   */
  updateCylinderMovement(
    id: string,
    movementData: UpdateCylinderMovementDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a cylinder movement
   */
  deleteCylinderMovement(
    id: string,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Get cylinder movement by ID
   */
  findCylinderMovementById(
    id: string
  ): Promise<CylinderMovementInterface | null>;

  /**
   * Get cylinder movements by cylinder ID
   */
  getCylinderMovementsByCylinderId(
    cylinderId: string
  ): Promise<CylinderMovementInterface[]>;

  /**
   * Get cylinder movements list with filtering and pagination
   */
  getCylinderMovementList(params: CylinderMovementListQueryParams): Promise<{
    movements: CylinderMovementInterface[];
    total: number;
  }>;
}

export interface ICylinderService {
  /**
   * Get cylinder by ID
   */
  getCylinderById(id: string): Promise<CylinderDetailDTO>;

  /**
   * Get cylinder by serial number
   */
  getCylinderBySerialNumber(serialNumber: string): Promise<CylinderDetailDTO>;

  /**
   * Create a new cylinder
   */
  createCylinder(cylinderData: CreateCylinderDTO): Promise<CylinderDetailDTO>;

  /**
   * Update a cylinder
   */
  updateCylinder(
    id: string,
    cylinderData: UpdateCylinderDTO
  ): Promise<CylinderDetailDTO>;

  /**
   * Delete a cylinder
   */
  deleteCylinder(id: string): Promise<boolean>;

  /**
   * Get paginated cylinder list
   */
  getCylinderList(
    params: CylinderListQueryParams
  ): Promise<PaginatedCylinderListDTO>;

  /**
   * Get cylinders by type ID
   */
  getCylindersByTypeId(typeId: string): Promise<CylinderDetailDTO[]>;

  /**
   * Get cylinders by customer ID
   */
  getCylindersByCustomerId(customerId: string): Promise<CylinderDetailDTO[]>;

  /**
   * Get cylinders by status
   */
  getCylindersByStatus(status: string): Promise<CylinderDetailDTO[]>;

  /**
   * Get cylinders due for inspection
   */
  getCylindersForInspection(
    daysThreshold?: number
  ): Promise<CylinderDetailDTO[]>;

  /**
   * Update cylinder status
   */
  updateCylinderStatus(id: string, status: string): Promise<CylinderDetailDTO>;

  /**
   * Get cylinder type by ID
   */
  getCylinderTypeById(id: string): Promise<CylinderTypeDTO>;

  /**
   * Create a new cylinder type
   */
  createCylinderType(typeData: CreateCylinderTypeDTO): Promise<CylinderTypeDTO>;

  /**
   * Update a cylinder type
   */
  updateCylinderType(
    id: string,
    typeData: UpdateCylinderTypeDTO
  ): Promise<CylinderTypeDTO>;

  /**
   * Delete a cylinder type
   */
  deleteCylinderType(id: string): Promise<boolean>;

  /**
   * Get paginated cylinder type list
   */
  getCylinderTypeList(
    params: CylinderTypeListQueryParams
  ): Promise<PaginatedCylinderTypeListDTO>;

  /**
   * Record a cylinder movement
   */
  recordCylinderMovement(
    movementData: CreateCylinderMovementDTO
  ): Promise<CylinderMovementDTO>;

  /**
   * Update a cylinder movement
   */
  updateCylinderMovement(
    id: string,
    movementData: UpdateCylinderMovementDTO
  ): Promise<CylinderMovementDTO>;

  /**
   * Delete a cylinder movement
   */
  deleteCylinderMovement(id: string): Promise<boolean>;

  /**
   * Get cylinder movement by ID
   */
  getCylinderMovementById(id: string): Promise<CylinderMovementDTO>;

  /**
   * Get cylinder movements by cylinder ID
   */
  getCylinderMovementsByCylinderId(
    cylinderId: string
  ): Promise<CylinderMovementDTO[]>;

  /**
   * Get paginated cylinder movement list
   */
  getCylinderMovementList(
    params: CylinderMovementListQueryParams
  ): Promise<PaginatedCylinderMovementListDTO>;

  /**
   * Calculate cylinder inventory statistics
   */
  calculateCylinderStats(): Promise<CylinderStatsDTO>;

  /**
   * Generate cylinder inventory report
   */
  generateInventoryReport(
    params?: Partial<CylinderListQueryParams>
  ): Promise<Buffer>;

  /**
   * Export cylinder data to CSV
   */
  exportCylindersToCSV(
    params?: Partial<CylinderListQueryParams>
  ): Promise<string>;

  /**
   * Generate QR code for a cylinder
   */
  generateCylinderQRCode(id: string): Promise<Buffer>;

  /**
   * Generate barcode for a cylinder
   */
  generateCylinderBarcode(id: string): Promise<Buffer>;
}
