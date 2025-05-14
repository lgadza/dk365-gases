import { IFleetRepository } from "./interfaces/services";
import {
  FleetVehicleInterface,
  MaintenanceRecordInterface,
} from "./interfaces/interfaces";
import FleetVehicle from "./model";
import MaintenanceRecord from "./maintenance.model";
import { Transaction, Op, WhereOptions, Sequelize, literal } from "sequelize";
import {
  FleetVehicleListQueryParams,
  CreateFleetVehicleDTO,
  UpdateFleetVehicleDTO,
  MaintenanceRecordListQueryParams,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";

export class FleetRepository implements IFleetRepository {
  // Helper method to convert string dates to Date objects
  private convertDatesToDateObjects(data: any): any {
    const result = { ...data };

    // List of date fields in our models
    const dateFields = [
      "lastMaintenanceDate",
      "nextMaintenanceDate",
      "purchaseDate",
      "registrationExpiryDate",
      "insuranceExpiryDate",
      "serviceDate",
      "nextServiceDueDate",
    ];

    // Convert any string dates to Date objects
    for (const field of dateFields) {
      if (result[field] && typeof result[field] === "string") {
        result[field] = new Date(result[field]);
      }
    }

    return result;
  }

  /**
   * Find a vehicle by ID
   */
  public async findVehicleById(
    id: string
  ): Promise<FleetVehicleInterface | null> {
    try {
      return await FleetVehicle.findByPk(id);
    } catch (error) {
      logger.error("Error finding vehicle by ID:", error);
      throw new DatabaseError("Database error while finding vehicle", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleId: id },
      });
    }
  }

  /**
   * Create a new vehicle
   */
  public async createVehicle(
    vehicleData: CreateFleetVehicleDTO,
    transaction?: Transaction
  ): Promise<FleetVehicleInterface> {
    try {
      const processedData = this.convertDatesToDateObjects(vehicleData);
      return await FleetVehicle.create(processedData as any, { transaction });
    } catch (error) {
      logger.error("Error creating vehicle:", error);
      throw new DatabaseError("Database error while creating vehicle", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a vehicle
   */
  public async updateVehicle(
    id: string,
    vehicleData: UpdateFleetVehicleDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const processedData = this.convertDatesToDateObjects(vehicleData);
      const [updated] = await FleetVehicle.update(processedData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating vehicle:", error);
      throw new DatabaseError("Database error while updating vehicle", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleId: id },
      });
    }
  }

  /**
   * Delete a vehicle
   */
  public async deleteVehicle(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await FleetVehicle.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting vehicle:", error);
      throw new DatabaseError("Database error while deleting vehicle", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleId: id },
      });
    }
  }

  /**
   * Get vehicle list with filtering and pagination
   */
  public async getVehicleList(params: FleetVehicleListQueryParams): Promise<{
    vehicles: FleetVehicleInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        status,
        vehicleType,
        make,
        model,
        year,
        driverId,
        needsMaintenance,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (status) {
        where.status = status;
      }

      if (vehicleType) {
        where.vehicleType = vehicleType;
      }

      if (make) {
        where.make = { [Op.iLike]: `%${make}%` };
      }

      if (model) {
        where.model = { [Op.iLike]: `%${model}%` };
      }

      if (year) {
        where.year = year;
      }

      if (driverId) {
        where.assignedDriverId = driverId;
      }

      // Filter for vehicles needing maintenance - use Sequelize.literal for complex conditions
      if (needsMaintenance === true) {
        const currentDate = new Date();
        where[Op.or as any] = [
          Sequelize.literal(
            "next_maintenance_date IS NOT NULL AND next_maintenance_date <= " +
              db.sequelize.escape(currentDate)
          ),
          Sequelize.literal(
            "current_mileage >= next_maintenance_mileage AND next_maintenance_mileage IS NOT NULL"
          ),
        ];
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { make: { [Op.iLike]: `%${search}%` } },
            { model: { [Op.iLike]: `%${search}%` } },
            { licensePlate: { [Op.iLike]: `%${search}%` } },
            { vin: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get vehicles and total count
      const { count, rows } = await FleetVehicle.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
      });

      return {
        vehicles: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting vehicle list:", error);
      throw new DatabaseError("Database error while getting vehicle list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Update vehicle status
   */
  public async updateVehicleStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await FleetVehicle.update(
        { status },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error updating vehicle status:", error);
      throw new DatabaseError("Database error while updating vehicle status", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleId: id },
      });
    }
  }

  /**
   * Update vehicle mileage
   */
  public async updateVehicleMileage(
    id: string,
    mileage: number,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await FleetVehicle.update(
        { currentMileage: mileage },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error updating vehicle mileage:", error);
      throw new DatabaseError("Database error while updating vehicle mileage", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleId: id },
      });
    }
  }

  /**
   * Assign driver to vehicle
   */
  public async assignDriverToVehicle(
    id: string,
    driverId: string | null,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await FleetVehicle.update(
        {
          assignedDriverId:
            driverId === null ? Sequelize.literal("NULL") : driverId,
        },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error assigning driver to vehicle:", error);
      throw new DatabaseError(
        "Database error while assigning driver to vehicle",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleId: id },
        }
      );
    }
  }

  /**
   * Get vehicles by status
   */
  public async getVehiclesByStatus(
    status: string
  ): Promise<FleetVehicleInterface[]> {
    try {
      return await FleetVehicle.findAll({
        where: { status },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting vehicles by status:", error);
      throw new DatabaseError(
        "Database error while getting vehicles by status",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, status },
        }
      );
    }
  }

  /**
   * Get vehicles by type
   */
  public async getVehiclesByType(
    vehicleType: string
  ): Promise<FleetVehicleInterface[]> {
    try {
      return await FleetVehicle.findAll({
        where: { vehicleType },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting vehicles by type:", error);
      throw new DatabaseError("Database error while getting vehicles by type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleType },
      });
    }
  }

  /**
   * Get vehicles requiring maintenance
   */
  public async getVehiclesRequiringMaintenance(): Promise<
    FleetVehicleInterface[]
  > {
    try {
      const currentDate = new Date();
      return await FleetVehicle.findAll({
        where: Sequelize.literal(
          "(next_maintenance_date IS NOT NULL AND next_maintenance_date <= " +
            db.sequelize.escape(currentDate) +
            ") OR " +
            "(current_mileage >= next_maintenance_mileage AND next_maintenance_mileage IS NOT NULL)"
        ),
        order: [["nextMaintenanceDate", "ASC"]],
      });
    } catch (error) {
      logger.error("Error getting vehicles requiring maintenance:", error);
      throw new DatabaseError(
        "Database error while getting vehicles requiring maintenance",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Get vehicle status summary
   */
  public async getVehicleStatusSummary(): Promise<Record<string, number>> {
    try {
      // Get status summary using Sequelize's aggregation
      const statusCounts = await FleetVehicle.findAll({
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });

      const typeCounts = await FleetVehicle.findAll({
        attributes: [
          "vehicleType",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["vehicleType"],
        raw: true,
      });

      // Calculate vehicles requiring maintenance
      const currentDate = new Date();
      const needsMaintenance = await FleetVehicle.count({
        where: Sequelize.literal(
          "(next_maintenance_date IS NOT NULL AND next_maintenance_date <= " +
            db.sequelize.escape(currentDate) +
            ") OR " +
            "(current_mileage >= next_maintenance_mileage AND next_maintenance_mileage IS NOT NULL)"
        ),
      });

      // Count available vehicles (active status and assigned driver)
      const availableVehicles = await FleetVehicle.count({
        where: Sequelize.literal(
          "status = 'active' AND assigned_driver_id IS NOT NULL"
        ),
      });

      // Total vehicles
      const totalVehicles = await FleetVehicle.count();

      // Convert to a record
      const summary: Record<string, number> = {
        total: totalVehicles,
        requireMaintenance: needsMaintenance,
        availableVehicles: availableVehicles,
      };

      // Add status counts
      statusCounts.forEach((item: any) => {
        summary[`status_${item.status}`] = parseInt(item.count);
      });

      // Add type counts
      typeCounts.forEach((item: any) => {
        summary[`type_${item.vehicleType}`] = parseInt(item.count);
      });

      return summary;
    } catch (error) {
      logger.error("Error getting vehicle status summary:", error);
      throw new DatabaseError(
        "Database error while getting vehicle status summary",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Find a maintenance record by ID
   */
  public async findMaintenanceById(
    id: string
  ): Promise<MaintenanceRecordInterface | null> {
    try {
      return await MaintenanceRecord.findByPk(id);
    } catch (error) {
      logger.error("Error finding maintenance record by ID:", error);
      throw new DatabaseError(
        "Database error while finding maintenance record",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, recordId: id },
        }
      );
    }
  }

  /**
   * Create a new maintenance record
   */
  public async createMaintenance(
    maintenanceData: CreateMaintenanceRecordDTO,
    transaction?: Transaction
  ): Promise<MaintenanceRecordInterface> {
    try {
      const useTransaction = transaction || (await db.sequelize.transaction());

      try {
        // Process date fields for maintenance record
        const processedData = this.convertDatesToDateObjects(maintenanceData);

        // Create the maintenance record
        const newRecord = await MaintenanceRecord.create(processedData as any, {
          transaction: useTransaction,
        });

        // Update the vehicle's last maintenance date and next maintenance date
        if (
          maintenanceData.nextServiceDueDate ||
          maintenanceData.nextServiceDueMileage
        ) {
          // Prepare vehicle update data with proper date objects
          const vehicleUpdateData: any = {
            lastMaintenanceDate: new Date(maintenanceData.serviceDate),
          };

          if (maintenanceData.nextServiceDueDate) {
            vehicleUpdateData.nextMaintenanceDate = new Date(
              maintenanceData.nextServiceDueDate
            );
          }

          if (maintenanceData.nextServiceDueMileage) {
            vehicleUpdateData.nextMaintenanceMileage =
              maintenanceData.nextServiceDueMileage;
          }

          await FleetVehicle.update(vehicleUpdateData, {
            where: { id: maintenanceData.vehicleId },
            transaction: useTransaction,
          });
        }

        // Commit the transaction if we started it
        if (!transaction) {
          await useTransaction.commit();
        }

        return newRecord;
      } catch (error) {
        // Rollback the transaction if we started it
        if (!transaction) {
          await useTransaction.rollback();
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error creating maintenance record:", error);
      throw new DatabaseError(
        "Database error while creating maintenance record",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Update a maintenance record
   */
  public async updateMaintenance(
    id: string,
    maintenanceData: UpdateMaintenanceRecordDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const useTransaction = transaction || (await db.sequelize.transaction());

      try {
        const record = await MaintenanceRecord.findByPk(id, {
          transaction: useTransaction,
        });
        if (!record) {
          if (!transaction) await useTransaction.rollback();
          return false;
        }

        // Process date fields for maintenance update
        const processedData = this.convertDatesToDateObjects(maintenanceData);

        // Update the maintenance record
        const [updated] = await MaintenanceRecord.update(processedData as any, {
          where: { id },
          transaction: useTransaction,
        });

        // Update the vehicle's maintenance dates if next service dates are provided
        if (
          maintenanceData.nextServiceDueDate ||
          maintenanceData.nextServiceDueMileage
        ) {
          // Prepare vehicle update data with proper date objects
          const vehicleUpdateData: any = {};

          if (maintenanceData.serviceDate) {
            vehicleUpdateData.lastMaintenanceDate = new Date(
              maintenanceData.serviceDate
            );
          }

          if (maintenanceData.nextServiceDueDate) {
            vehicleUpdateData.nextMaintenanceDate = new Date(
              maintenanceData.nextServiceDueDate
            );
          }

          if (maintenanceData.nextServiceDueMileage) {
            vehicleUpdateData.nextMaintenanceMileage =
              maintenanceData.nextServiceDueMileage;
          }

          await FleetVehicle.update(vehicleUpdateData, {
            where: { id: record.vehicleId },
            transaction: useTransaction,
          });
        }

        // Commit the transaction if we started it
        if (!transaction) {
          await useTransaction.commit();
        }

        return updated > 0;
      } catch (error) {
        // Rollback the transaction if we started it
        if (!transaction) {
          await useTransaction.rollback();
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error updating maintenance record:", error);
      throw new DatabaseError(
        "Database error while updating maintenance record",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, recordId: id },
        }
      );
    }
  }

  /**
   * Delete a maintenance record
   */
  public async deleteMaintenance(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await MaintenanceRecord.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting maintenance record:", error);
      throw new DatabaseError(
        "Database error while deleting maintenance record",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, recordId: id },
        }
      );
    }
  }

  /**
   * Get maintenance list with filtering and pagination
   */
  public async getMaintenanceList(
    params: MaintenanceRecordListQueryParams
  ): Promise<{
    records: MaintenanceRecordInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "serviceDate",
        sortOrder = "desc",
        vehicleId,
        serviceType,
        status,
        fromDate,
        toDate,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (vehicleId) {
        where.vehicleId = vehicleId;
      }

      if (serviceType) {
        where.serviceType = serviceType;
      }

      if (status) {
        where.status = status;
      }

      // Date range filter - convert to Date objects for Sequelize
      if (fromDate && toDate) {
        where.serviceDate = {
          [Op.between]: [new Date(fromDate), new Date(toDate)],
        };
      } else if (fromDate) {
        where.serviceDate = {
          [Op.gte]: new Date(fromDate),
        };
      } else if (toDate) {
        where.serviceDate = {
          [Op.lte]: new Date(toDate),
        };
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { serviceType: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
            { serviceProvider: { [Op.iLike]: `%${search}%` } },
            { technician: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get records and total count
      const { count, rows } = await MaintenanceRecord.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: FleetVehicle,
            as: "vehicle",
            attributes: ["id", "make", "model", "licensePlate"],
          },
        ],
      });

      return {
        records: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting maintenance list:", error);
      throw new DatabaseError("Database error while getting maintenance list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Get vehicle maintenance history
   */
  public async getVehicleMaintenanceHistory(
    vehicleId: string
  ): Promise<MaintenanceRecordInterface[]> {
    try {
      return await MaintenanceRecord.findAll({
        where: { vehicleId },
        order: [["serviceDate", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting vehicle maintenance history:", error);
      throw new DatabaseError(
        "Database error while getting vehicle maintenance history",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, vehicleId },
        }
      );
    }
  }

  /**
   * Update maintenance status
   */
  public async updateMaintenanceStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await MaintenanceRecord.update(
        { status },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error updating maintenance status:", error);
      throw new DatabaseError(
        "Database error while updating maintenance status",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, recordId: id },
        }
      );
    }
  }

  /**
   * Get upcoming maintenance schedule
   */
  public async getUpcomingMaintenanceSchedule(): Promise<
    MaintenanceRecordInterface[]
  > {
    try {
      const currentDate = new Date();
      // Get scheduled maintenance records
      return await MaintenanceRecord.findAll({
        where: {
          status: "scheduled",
          serviceDate: {
            [Op.gt]: currentDate,
          },
        },
        order: [["serviceDate", "ASC"]],
        include: [
          {
            model: FleetVehicle,
            as: "vehicle",
            attributes: ["id", "make", "model", "licensePlate"],
          },
        ],
      });
    } catch (error) {
      logger.error("Error getting upcoming maintenance schedule:", error);
      throw new DatabaseError(
        "Database error while getting upcoming maintenance schedule",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Get maintenance records by status
   */
  public async getMaintenanceByStatus(
    status: string
  ): Promise<MaintenanceRecordInterface[]> {
    try {
      return await MaintenanceRecord.findAll({
        where: { status },
        order: [["serviceDate", "DESC"]],
        include: [
          {
            model: FleetVehicle,
            as: "vehicle",
            attributes: ["id", "make", "model", "licensePlate"],
          },
        ],
      });
    } catch (error) {
      logger.error("Error getting maintenance by status:", error);
      throw new DatabaseError(
        "Database error while getting maintenance by status",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, status },
        }
      );
    }
  }
}

// Create and export repository instance
export default new FleetRepository();
