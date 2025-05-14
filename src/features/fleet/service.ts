import { IFleetService, IFleetRepository } from "./interfaces/services";
import {
  FleetVehicleDetailDTO,
  CreateFleetVehicleDTO,
  UpdateFleetVehicleDTO,
  FleetVehicleListQueryParams,
  PaginatedFleetVehicleListDTO,
  MaintenanceRecordDetailDTO,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceRecordListQueryParams,
  PaginatedMaintenanceRecordListDTO,
  FleetVehicleStatusSummaryDTO,
  MaintenanceScheduleSummaryDTO,
  FleetDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";
import cache from "@/common/utils/cache/cacheUtil";
import MaintenanceRecord from "./maintenance.model";

export class FleetService implements IFleetService {
  private repository: IFleetRepository;
  private readonly CACHE_PREFIX = "fleet:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IFleetRepository) {
    this.repository = repository;
  }

  /**
   * Get vehicle by ID
   */
  public async getVehicleById(id: string): Promise<FleetVehicleDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}vehicle:${id}`;
      const cachedVehicle = await cache.get(cacheKey);

      if (cachedVehicle) {
        return JSON.parse(cachedVehicle);
      }

      // Get from database if not in cache
      const vehicle = await this.repository.findVehicleById(id);
      if (!vehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }

      // Map to DTO
      const vehicleDTO = FleetDTOMapper.toVehicleDetailDTO(vehicle);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(vehicleDTO), this.CACHE_TTL);

      return vehicleDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getVehicleById service:", error);
      throw new AppError("Failed to get vehicle");
    }
  }

  /**
   * Create a new vehicle
   */
  public async createVehicle(
    vehicleData: CreateFleetVehicleDTO
  ): Promise<FleetVehicleDetailDTO> {
    try {
      // Validate VIN uniqueness
      if (vehicleData.vin) {
        const existingVehicles = await this.repository.getVehicleList({
          search: vehicleData.vin,
          limit: 1,
        });

        const existingVehicle = existingVehicles.vehicles.find(
          (v) => v.vin === vehicleData.vin
        );

        if (existingVehicle) {
          throw new ConflictError(
            `Vehicle with VIN ${vehicleData.vin} already exists`
          );
        }
      }

      // Create the vehicle
      const newVehicle = await this.repository.createVehicle(vehicleData);

      // Get the complete vehicle
      return FleetDTOMapper.toVehicleDetailDTO(newVehicle);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createVehicle service:", error);
      throw new AppError("Failed to create vehicle");
    }
  }

  /**
   * Update a vehicle
   */
  public async updateVehicle(
    id: string,
    vehicleData: UpdateFleetVehicleDTO
  ): Promise<FleetVehicleDetailDTO> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.repository.findVehicleById(id);
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }

      // Check if VIN is being updated and is unique
      if (vehicleData.vin && vehicleData.vin !== existingVehicle.vin) {
        const existingVehicles = await this.repository.getVehicleList({
          search: vehicleData.vin,
          limit: 1,
        });

        const vinExists = existingVehicles.vehicles.find(
          (v) => v.vin === vehicleData.vin
        );

        if (vinExists) {
          throw new ConflictError(
            `Vehicle with VIN ${vehicleData.vin} already exists`
          );
        }
      }

      // Update vehicle
      await this.repository.updateVehicle(id, vehicleData);

      // Clear cache
      await this.clearVehicleCache(id);

      // Get the updated vehicle
      return this.getVehicleById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateVehicle service:", error);
      throw new AppError("Failed to update vehicle");
    }
  }

  /**
   * Delete a vehicle
   */
  public async deleteVehicle(id: string): Promise<boolean> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.repository.findVehicleById(id);
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }

      // Delete the vehicle
      const result = await this.repository.deleteVehicle(id);

      // Clear cache
      await this.clearVehicleCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteVehicle service:", error);
      throw new AppError("Failed to delete vehicle");
    }
  }

  /**
   * Get paginated vehicle list
   */
  public async getVehicleList(
    params: FleetVehicleListQueryParams
  ): Promise<PaginatedFleetVehicleListDTO> {
    try {
      const { vehicles, total } = await this.repository.getVehicleList(params);

      // Map to DTOs
      const vehicleDTOs = vehicles.map((vehicle) =>
        FleetDTOMapper.toVehicleDetailDTO(vehicle)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        vehicles: vehicleDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getVehicleList service:", error);
      throw new AppError("Failed to get vehicle list");
    }
  }

  /**
   * Update vehicle status
   */
  public async updateVehicleStatus(
    id: string,
    status: string
  ): Promise<FleetVehicleDetailDTO> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.repository.findVehicleById(id);
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }

      // Update status
      await this.repository.updateVehicleStatus(id, status);

      // Clear cache
      await this.clearVehicleCache(id);

      // Get the updated vehicle
      return this.getVehicleById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateVehicleStatus service:", error);
      throw new AppError("Failed to update vehicle status");
    }
  }

  /**
   * Update vehicle mileage
   */
  public async updateVehicleMileage(
    id: string,
    mileage: number
  ): Promise<FleetVehicleDetailDTO> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.repository.findVehicleById(id);
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }

      // Validate mileage
      if (mileage < existingVehicle.currentMileage) {
        throw new BadRequestError(
          "New mileage cannot be less than current mileage"
        );
      }

      // Update mileage
      await this.repository.updateVehicleMileage(id, mileage);

      // Clear cache
      await this.clearVehicleCache(id);

      // Get the updated vehicle
      return this.getVehicleById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateVehicleMileage service:", error);
      throw new AppError("Failed to update vehicle mileage");
    }
  }

  /**
   * Assign driver to vehicle
   */
  public async assignDriverToVehicle(
    id: string,
    driverId: string | null
  ): Promise<FleetVehicleDetailDTO> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.repository.findVehicleById(id);
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }

      // Update driver
      await this.repository.assignDriverToVehicle(id, driverId);

      // Clear cache
      await this.clearVehicleCache(id);

      // Get the updated vehicle
      return this.getVehicleById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in assignDriverToVehicle service:", error);
      throw new AppError("Failed to assign driver to vehicle");
    }
  }

  /**
   * Get vehicles by status
   */
  public async getVehiclesByStatus(
    status: string
  ): Promise<FleetVehicleDetailDTO[]> {
    try {
      const vehicles = await this.repository.getVehiclesByStatus(status);
      return vehicles.map((vehicle) =>
        FleetDTOMapper.toVehicleDetailDTO(vehicle)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getVehiclesByStatus service:", error);
      throw new AppError("Failed to get vehicles by status");
    }
  }

  /**
   * Get vehicles by type
   */
  public async getVehiclesByType(
    vehicleType: string
  ): Promise<FleetVehicleDetailDTO[]> {
    try {
      const vehicles = await this.repository.getVehiclesByType(vehicleType);
      return vehicles.map((vehicle) =>
        FleetDTOMapper.toVehicleDetailDTO(vehicle)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getVehiclesByType service:", error);
      throw new AppError("Failed to get vehicles by type");
    }
  }

  /**
   * Get vehicles requiring maintenance
   */
  public async getVehiclesRequiringMaintenance(): Promise<
    FleetVehicleDetailDTO[]
  > {
    try {
      const vehicles = await this.repository.getVehiclesRequiringMaintenance();
      return vehicles.map((vehicle) =>
        FleetDTOMapper.toVehicleDetailDTO(vehicle)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getVehiclesRequiringMaintenance service:", error);
      throw new AppError("Failed to get vehicles requiring maintenance");
    }
  }

  /**
   * Get fleet summary
   */
  public async getFleetSummary(): Promise<FleetVehicleStatusSummaryDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}summary`;
      const cachedSummary = await cache.get(cacheKey);

      if (cachedSummary) {
        return JSON.parse(cachedSummary);
      }

      // Get raw status data
      const statusData = await this.repository.getVehicleStatusSummary();

      // Process into summary format
      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};

      // Extract status and type data
      Object.entries(statusData).forEach(([key, value]) => {
        if (key.startsWith("status_")) {
          byStatus[key.replace("status_", "")] = value;
        } else if (key.startsWith("type_")) {
          byType[key.replace("type_", "")] = value;
        }
      });

      // Create summary object
      const summary: FleetVehicleStatusSummaryDTO = {
        total: statusData.total || 0,
        byStatus,
        byType,
        requireMaintenance: statusData.requireMaintenance || 0,
        availableVehicles: statusData.availableVehicles || 0,
      };

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(summary), this.CACHE_TTL);

      return summary;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getFleetSummary service:", error);
      throw new AppError("Failed to get fleet summary");
    }
  }

  /**
   * Get maintenance record by ID
   */
  public async getMaintenanceById(
    id: string
  ): Promise<MaintenanceRecordDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}maintenance:${id}`;
      const cachedRecord = await cache.get(cacheKey);

      if (cachedRecord) {
        return JSON.parse(cachedRecord);
      }

      // Get from database if not in cache
      const record = await this.repository.findMaintenanceById(id);
      if (!record) {
        throw new NotFoundError(`Maintenance record with ID ${id} not found`);
      }

      // Map to DTO
      const recordDTO = FleetDTOMapper.toMaintenanceDetailDTO(record);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(recordDTO), this.CACHE_TTL);

      return recordDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getMaintenanceById service:", error);
      throw new AppError("Failed to get maintenance record");
    }
  }

  /**
   * Create a new maintenance record
   */
  public async createMaintenance(
    maintenanceData: CreateMaintenanceRecordDTO
  ): Promise<MaintenanceRecordDetailDTO> {
    try {
      // Verify that the vehicle exists
      const vehicle = await this.repository.findVehicleById(
        maintenanceData.vehicleId
      );
      if (!vehicle) {
        throw new NotFoundError(
          `Vehicle with ID ${maintenanceData.vehicleId} not found`
        );
      }

      // Create the maintenance record
      const newRecord = await this.repository.createMaintenance(
        maintenanceData
      );

      // Clear vehicle cache since maintenance state may have changed
      await this.clearVehicleCache(maintenanceData.vehicleId);

      // Get the complete record
      return FleetDTOMapper.toMaintenanceDetailDTO(newRecord);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createMaintenance service:", error);
      throw new AppError("Failed to create maintenance record");
    }
  }

  /**
   * Update a maintenance record
   */
  public async updateMaintenance(
    id: string,
    maintenanceData: UpdateMaintenanceRecordDTO
  ): Promise<MaintenanceRecordDetailDTO> {
    try {
      // Check if record exists
      const existingRecord = await this.repository.findMaintenanceById(id);
      if (!existingRecord) {
        throw new NotFoundError(`Maintenance record with ID ${id} not found`);
      }

      // Update record
      await this.repository.updateMaintenance(id, maintenanceData);

      // Clear caches
      await this.clearMaintenanceCache(id);
      await this.clearVehicleCache(existingRecord.vehicleId);

      // Get the updated record
      return this.getMaintenanceById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateMaintenance service:", error);
      throw new AppError("Failed to update maintenance record");
    }
  }

  /**
   * Delete a maintenance record
   */
  public async deleteMaintenance(id: string): Promise<boolean> {
    try {
      // Check if record exists
      const existingRecord = await this.repository.findMaintenanceById(id);
      if (!existingRecord) {
        throw new NotFoundError(`Maintenance record with ID ${id} not found`);
      }

      // Delete the record
      const result = await this.repository.deleteMaintenance(id);

      // Clear caches
      await this.clearMaintenanceCache(id);
      await this.clearVehicleCache(existingRecord.vehicleId);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteMaintenance service:", error);
      throw new AppError("Failed to delete maintenance record");
    }
  }

  /**
   * Get paginated maintenance list
   */
  public async getMaintenanceList(
    params: MaintenanceRecordListQueryParams
  ): Promise<PaginatedMaintenanceRecordListDTO> {
    try {
      const { records, total } = await this.repository.getMaintenanceList(
        params
      );

      // Map to DTOs
      const recordDTOs = records.map((record) =>
        FleetDTOMapper.toMaintenanceDetailDTO(record)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        records: recordDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getMaintenanceList service:", error);
      throw new AppError("Failed to get maintenance list");
    }
  }

  /**
   * Get vehicle maintenance history
   */
  public async getVehicleMaintenanceHistory(
    vehicleId: string
  ): Promise<MaintenanceRecordDetailDTO[]> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.repository.findVehicleById(vehicleId);
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${vehicleId} not found`);
      }

      const records = await this.repository.getVehicleMaintenanceHistory(
        vehicleId
      );
      return records.map((record) =>
        FleetDTOMapper.toMaintenanceDetailDTO(record)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getVehicleMaintenanceHistory service:", error);
      throw new AppError("Failed to get vehicle maintenance history");
    }
  }

  /**
   * Update maintenance status
   */
  public async updateMaintenanceStatus(
    id: string,
    status: string
  ): Promise<MaintenanceRecordDetailDTO> {
    try {
      // Check if record exists
      const existingRecord = await this.repository.findMaintenanceById(id);
      if (!existingRecord) {
        throw new NotFoundError(`Maintenance record with ID ${id} not found`);
      }

      // Update status
      await this.repository.updateMaintenanceStatus(id, status);

      // If completing maintenance, update vehicle's last maintenance date
      if (status === "completed") {
        await this.repository.updateVehicle(existingRecord.vehicleId, {
          lastMaintenanceDate: new Date().toISOString(),
        });

        // Clear vehicle cache
        await this.clearVehicleCache(existingRecord.vehicleId);
      }

      // Clear cache
      await this.clearMaintenanceCache(id);

      // Get the updated record
      return this.getMaintenanceById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateMaintenanceStatus service:", error);
      throw new AppError("Failed to update maintenance status");
    }
  }

  /**
   * Get upcoming maintenance schedule
   */
  public async getUpcomingMaintenanceSchedule(): Promise<MaintenanceScheduleSummaryDTO> {
    try {
      // Get upcoming scheduled maintenance
      const upcoming = await this.repository.getUpcomingMaintenanceSchedule();

      // Get overdue maintenance (from vehicles requiring maintenance)
      const vehiclesNeedingMaintenance =
        await this.repository.getVehiclesRequiringMaintenance();

      // Get in-progress maintenance
      const inProgress = await this.repository.getMaintenanceByStatus(
        "in-progress"
      );

      // Counts for summary
      const totalCompleted = await MaintenanceRecord.count({
        where: { status: "completed" },
      });

      // Map to DTOs
      const upcomingDTOs = upcoming.map((record) =>
        FleetDTOMapper.toMaintenanceDetailDTO(record)
      );
      const inProgressDTOs = inProgress.map((record) =>
        FleetDTOMapper.toMaintenanceDetailDTO(record)
      );

      // Create overdue records from vehicles needing maintenance
      const overdueDTOs = vehiclesNeedingMaintenance
        .map((vehicle) => {
          const today = new Date();
          // Only include vehicles with past due dates
          if (
            vehicle.nextMaintenanceDate &&
            new Date(vehicle.nextMaintenanceDate) < today
          ) {
            return {
              id: `overdue-${vehicle.id}`,
              vehicleId: vehicle.id,
              serviceDate: today.toISOString(),
              serviceType: "Required Maintenance",
              description: "Maintenance is overdue",
              cost: 0,
              mileageAtService: vehicle.currentMileage,
              status: "scheduled",
              createdAt: today.toISOString(),
              updatedAt: today.toISOString(),
            };
          }
          return null;
        })
        .filter(Boolean) as MaintenanceRecordDetailDTO[];

      // Create the summary object
      const scheduleSummary: MaintenanceScheduleSummaryDTO = {
        upcoming: upcomingDTOs,
        overdue: overdueDTOs,
        inProgress: inProgressDTOs,
        summary: {
          total:
            upcomingDTOs.length +
            overdueDTOs.length +
            inProgressDTOs.length +
            totalCompleted,
          upcoming: upcomingDTOs.length,
          overdue: overdueDTOs.length,
          inProgress: inProgressDTOs.length,
          completed: totalCompleted,
        },
      };

      return scheduleSummary;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getUpcomingMaintenanceSchedule service:", error);
      throw new AppError("Failed to get upcoming maintenance schedule");
    }
  }

  /**
   * Get maintenance by status
   */
  public async getMaintenanceByStatus(
    status: string
  ): Promise<MaintenanceRecordDetailDTO[]> {
    try {
      const records = await this.repository.getMaintenanceByStatus(status);
      return records.map((record) =>
        FleetDTOMapper.toMaintenanceDetailDTO(record)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getMaintenanceByStatus service:", error);
      throw new AppError("Failed to get maintenance by status");
    }
  }

  /**
   * Schedule vehicle maintenance
   */
  public async scheduleVehicleMaintenance(
    vehicleId: string,
    maintenanceData: CreateMaintenanceRecordDTO
  ): Promise<MaintenanceRecordDetailDTO> {
    try {
      // Check if vehicle exists
      const existingVehicle = await this.repository.findVehicleById(vehicleId);
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${vehicleId} not found`);
      }

      // Ensure vehicle ID in maintenance data matches
      const data = {
        ...maintenanceData,
        vehicleId,
        status: "scheduled",
        mileageAtService: existingVehicle.currentMileage,
      };

      // Create maintenance record
      const newRecord = await this.repository.createMaintenance(data);

      // Clear vehicle cache
      await this.clearVehicleCache(vehicleId);

      return FleetDTOMapper.toMaintenanceDetailDTO(newRecord);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in scheduleVehicleMaintenance service:", error);
      throw new AppError("Failed to schedule vehicle maintenance");
    }
  }

  /**
   * Clear vehicle cache
   */
  private async clearVehicleCache(vehicleId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}vehicle:${vehicleId}`;
    await cache.del(cacheKey);
    await cache.del(`${this.CACHE_PREFIX}summary`);
  }

  /**
   * Clear maintenance cache
   */
  private async clearMaintenanceCache(recordId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}maintenance:${recordId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new FleetService(repository);
