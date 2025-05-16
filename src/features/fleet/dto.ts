import {
  FleetVehicleInterface,
  MaintenanceRecordInterface,
} from "./interfaces/interfaces";

/**
 * Base DTO for fleet vehicle information
 */
export interface FleetVehicleBaseDTO {
  id: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: string;
  capacity?: number;
  capacityUnit?: string;
  fuelType: string;
  fuelConsumptionRate?: number;
  currentMileage: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
}

/**
 * Detailed fleet vehicle DTO with all information
 */
export interface FleetVehicleDetailDTO extends FleetVehicleBaseDTO {
  purchaseDate?: string;
  purchaseCost?: number;
  assignedDriverId?: string;
  notes?: string;
  registrationExpiryDate?: string;
  insuranceExpiryDate?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  gpsTrackingId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new fleet vehicle
 */
export interface CreateFleetVehicleDTO {
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status?: string;
  capacity?: number;
  capacityUnit?: string;
  fuelType: string;
  fuelConsumptionRate?: number;
  purchaseDate?: string;
  purchaseCost?: number;
  currentMileage?: number;
  assignedDriverId?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  notes?: string;
  registrationExpiryDate?: string;
  insuranceExpiryDate?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  gpsTrackingId?: string;
}

/**
 * DTO for updating a fleet vehicle
 */
export interface UpdateFleetVehicleDTO {
  vehicleType?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  status?: string;
  capacity?: number;
  capacityUnit?: string;
  fuelType?: string;
  fuelConsumptionRate?: number;
  purchaseDate?: string;
  purchaseCost?: number;
  currentMileage?: number;
  assignedDriverId?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  notes?: string;
  registrationExpiryDate?: string;
  insuranceExpiryDate?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  gpsTrackingId?: string;
}

/**
 * Query parameters for fleet vehicle list
 */
export interface FleetVehicleListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  vehicleType?: string;
  make?: string;
  model?: string;
  year?: number;
  driverId?: string;
  needsMaintenance?: boolean;
}

/**
 * Paginated fleet vehicle list response
 */
export interface PaginatedFleetVehicleListDTO {
  vehicles: FleetVehicleDetailDTO[];
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
 * Base DTO for maintenance record information
 */
export interface MaintenanceRecordBaseDTO {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  serviceDate: string;
  serviceType: string;
  description: string;
  cost: number;
  mileageAtService: number;
  status: string;
}

/**
 * Detailed maintenance record DTO
 */
export interface MaintenanceRecordDetailDTO extends MaintenanceRecordBaseDTO {
  serviceProvider?: string;
  technician?: string;
  partsReplaced?: string;
  laborHours?: number;
  nextServiceDueDate?: string;
  nextServiceDueMileage?: number;
  notes?: string;
  invoiceNumber?: string;
  workOrderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new maintenance record
 */
export interface CreateMaintenanceRecordDTO {
  vehicleId: string;
  serviceDate: string;
  serviceType: string;
  description: string;
  cost: number;
  serviceProvider?: string;
  technician?: string;
  mileageAtService: number;
  partsReplaced?: string;
  laborHours?: number;
  nextServiceDueDate?: string;
  nextServiceDueMileage?: number;
  status?: string;
  notes?: string;
  invoiceNumber?: string;
  workOrderNumber?: string;
}

/**
 * DTO for updating a maintenance record
 */
export interface UpdateMaintenanceRecordDTO {
  serviceDate?: string;
  serviceType?: string;
  description?: string;
  cost?: number;
  serviceProvider?: string;
  technician?: string;
  mileageAtService?: number;
  partsReplaced?: string;
  laborHours?: number;
  nextServiceDueDate?: string;
  nextServiceDueMileage?: number;
  status?: string;
  notes?: string;
  invoiceNumber?: string;
  workOrderNumber?: string;
}

/**
 * Query parameters for maintenance record list
 */
export interface MaintenanceRecordListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  vehicleId?: string;
  serviceType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Paginated maintenance record list response
 */
export interface PaginatedMaintenanceRecordListDTO {
  records: MaintenanceRecordDetailDTO[];
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
 * Fleet vehicle status summary DTO
 */
export interface FleetVehicleStatusSummaryDTO {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  requireMaintenance: number;
  availableVehicles: number;
}

/**
 * Maintenance schedule summary DTO
 */
export interface MaintenanceScheduleSummaryDTO {
  upcoming: MaintenanceRecordDetailDTO[];
  overdue: MaintenanceRecordDetailDTO[];
  inProgress: MaintenanceRecordDetailDTO[];
  summary: {
    total: number;
    upcoming: number;
    overdue: number;
    inProgress: number;
    completed: number;
  };
}

/**
 * Mapper class for converting between Fleet entities and DTOs
 */
export class FleetDTOMapper {
  /**
   * Map Vehicle entity to DetailDTO
   */
  public static toVehicleDetailDTO(
    vehicle: FleetVehicleInterface
  ): FleetVehicleDetailDTO {
    return {
      id: vehicle.id,
      vehicleType: vehicle.vehicleType,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
      capacity: vehicle.capacity,
      capacityUnit: vehicle.capacityUnit,
      fuelType: vehicle.fuelType,
      fuelConsumptionRate: vehicle.fuelConsumptionRate,
      currentMileage: vehicle.currentMileage,
      lastMaintenanceDate: vehicle.lastMaintenanceDate
        ? vehicle.lastMaintenanceDate.toISOString().split("T")[0]
        : undefined,
      nextMaintenanceDate: vehicle.nextMaintenanceDate
        ? vehicle.nextMaintenanceDate.toISOString().split("T")[0]
        : undefined,
      nextMaintenanceMileage: vehicle.nextMaintenanceMileage,
      purchaseDate: vehicle.purchaseDate
        ? vehicle.purchaseDate.toISOString().split("T")[0]
        : undefined,
      purchaseCost: vehicle.purchaseCost,
      assignedDriverId: vehicle.assignedDriverId,
      notes: vehicle.notes,
      registrationExpiryDate: vehicle.registrationExpiryDate
        ? vehicle.registrationExpiryDate.toISOString().split("T")[0]
        : undefined,
      insuranceExpiryDate: vehicle.insuranceExpiryDate
        ? vehicle.insuranceExpiryDate.toISOString().split("T")[0]
        : undefined,
      insuranceProvider: vehicle.insuranceProvider,
      insurancePolicyNumber: vehicle.insurancePolicyNumber,
      gpsTrackingId: vehicle.gpsTrackingId,
      createdAt: vehicle.createdAt
        ? vehicle.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: vehicle.updatedAt
        ? vehicle.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }

  /**
   * Map Maintenance entity to DetailDTO
   */
  public static toMaintenanceDetailDTO(
    record: MaintenanceRecordInterface
  ): MaintenanceRecordDetailDTO {
    return {
      id: record.id,
      vehicleId: record.vehicleId,
      vehicleName: record.vehicleName,
      serviceDate: record.serviceDate.toISOString().split("T")[0],
      serviceType: record.serviceType,
      description: record.description,
      cost: record.cost as number,
      mileageAtService: record.mileageAtService,
      status: record.status,
      serviceProvider: record.serviceProvider,
      technician: record.technician,
      partsReplaced: record.partsReplaced,
      laborHours: record.laborHours,
      nextServiceDueDate: record.nextServiceDueDate
        ? record.nextServiceDueDate.toISOString().split("T")[0]
        : undefined,
      nextServiceDueMileage: record.nextServiceDueMileage,
      notes: record.notes,
      invoiceNumber: record.invoiceNumber,
      workOrderNumber: record.workOrderNumber,
      createdAt: record.createdAt
        ? record.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: record.updatedAt
        ? record.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
