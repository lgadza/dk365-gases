import { ICylinderRepository } from "./interfaces/services";
import {
  CylinderInterface,
  CylinderTypeInterface,
  CylinderMovementInterface,
  CylinderStatus,
} from "./interfaces/interfaces";
import Cylinder from "./model";
import CylinderType from "./cylinder-type.model";
import CylinderMovement from "./cylinder-movement.model";
import {
  CylinderListQueryParams,
  CreateCylinderDTO,
  UpdateCylinderDTO,
  CylinderTypeListQueryParams,
  CreateCylinderTypeDTO,
  UpdateCylinderTypeDTO,
  CylinderMovementListQueryParams,
  CreateCylinderMovementDTO,
  UpdateCylinderMovementDTO,
} from "./dto";
import db from "@/config/database";
import { Transaction, Op, Sequelize } from "sequelize";
import {
  AppError,
  DatabaseError,
  ErrorCode,
} from "@/common/utils/errors/errorUtils";
import logger from "@/common/utils/logging/logger";

export class CylinderRepository implements ICylinderRepository {
  /**
   * Find cylinder by ID
   */
  public async findCylinderById(id: string): Promise<CylinderInterface | null> {
    try {
      return await Cylinder.findByPk(id, {
        include: [
          {
            model: CylinderType,
            as: "type",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding cylinder by ID:", error);
      throw new DatabaseError("Database error while finding cylinder by ID", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Find cylinder by serial number
   */
  public async findCylinderBySerialNumber(
    serialNumber: string
  ): Promise<CylinderInterface | null> {
    try {
      return await Cylinder.findOne({
        where: { serialNumber },
        include: [
          {
            model: CylinderType,
            as: "type",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding cylinder by serial number:", error);
      throw new DatabaseError(
        "Database error while finding cylinder by serial number",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, serialNumber },
        }
      );
    }
  }

  /**
   * Create cylinder
   */
  public async createCylinder(
    cylinderData: CreateCylinderDTO,
    transaction?: Transaction
  ): Promise<CylinderInterface> {
    try {
      const cylinder = await Cylinder.create(cylinderData as any, {
        transaction,
      });
      return cylinder;
    } catch (error) {
      logger.error("Error creating cylinder:", error);
      throw new DatabaseError("Database error while creating cylinder", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update cylinder
   */
  public async updateCylinder(
    id: string,
    cylinderData: UpdateCylinderDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Cylinder.update(cylinderData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating cylinder:", error);
      throw new DatabaseError("Database error while updating cylinder", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Delete cylinder
   */
  public async deleteCylinder(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Cylinder.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting cylinder:", error);
      throw new DatabaseError("Database error while deleting cylinder", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Get cylinder list with filtering and pagination
   */
  public async getCylinderList(params: CylinderListQueryParams): Promise<{
    cylinders: CylinderInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "serialNumber",
        sortOrder = "asc",
        status,
        gasType,
        location,
        cylinderTypeId,
        customerId,
        isActive,
        needsInspection,
        needsMaintenance,
      } = params;

      // Log the processed parameters
      logger.debug("Repository getCylinderList processing params:", {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status,
        gasType,
        location,
        cylinderTypeId,
        customerId,
        isActive,
        needsInspection,
        needsMaintenance,
      });

      const offset = (page - 1) * limit;
      const whereClause: any = {};

      // Only add filters if they are provided AND have values
      if (search && search.trim()) {
        whereClause[Op.or] = [
          { serialNumber: { [Op.iLike]: `%${search}%` } },
          { manufacturerName: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (status && status.trim()) {
        whereClause.status = status;
      }

      if (cylinderTypeId && cylinderTypeId.trim()) {
        whereClause.cylinderTypeId = cylinderTypeId;
      }

      if (customerId && customerId.trim()) {
        whereClause.assignedCustomerId = customerId;
      }

      if (location && location.trim()) {
        whereClause.location = { [Op.iLike]: `%${location}%` };
      }

      // Only use isActive filter if explicitly provided
      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }

      // For debugging, log the count of raw cylinders without filters
      const totalCylinders = await Cylinder.count();
      logger.debug(
        `Total cylinders in database (no filters): ${totalCylinders}`
      );

      // Log the final where clause
      logger.debug(
        "Final where clause for cylinder query:",
        JSON.stringify(whereClause)
      );

      // Execute query with all filters
      const { rows, count } = await Cylinder.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit,
        offset,
      });

      // Add additional debugging if filters eliminated too many results
      if (rows.length === 0 && totalCylinders > 0) {
        logger.warn(
          `Filters eliminated all ${totalCylinders} cylinders. Where clause: ${JSON.stringify(
            whereClause
          )}`
        );

        // Test each filter separately to identify which one is too restrictive
        if (Object.keys(whereClause).length > 0) {
          for (const [key, value] of Object.entries(whereClause)) {
            const singleFilterCount = await Cylinder.count({
              where: { [key]: value },
            });
            logger.debug(
              `Filter ${key} alone returns ${singleFilterCount} cylinders`
            );
          }
        }
      }

      logger.debug(
        `Query returned ${rows.length} cylinders out of ${count} total`
      );

      return {
        cylinders: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error in getCylinderList repository:", error);
      throw error;
    }
  }

  /**
   * Find cylinders by type ID
   */
  public async findCylindersByTypeId(
    typeId: string
  ): Promise<CylinderInterface[]> {
    try {
      return await Cylinder.findAll({
        where: { cylinderTypeId: typeId },
        include: [
          {
            model: CylinderType,
            as: "type",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding cylinders by type ID:", error);
      throw new DatabaseError(
        "Database error while finding cylinders by type ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, typeId },
        }
      );
    }
  }

  /**
   * Find cylinders by customer ID
   */
  public async findCylindersByCustomerId(
    customerId: string
  ): Promise<CylinderInterface[]> {
    try {
      return await Cylinder.findAll({
        where: { assignedCustomerId: customerId },
        include: [
          {
            model: CylinderType,
            as: "type",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding cylinders by customer ID:", error);
      throw new DatabaseError(
        "Database error while finding cylinders by customer ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, customerId },
        }
      );
    }
  }

  /**
   * Find cylinders by status
   */
  public async findCylindersByStatus(
    status: string
  ): Promise<CylinderInterface[]> {
    try {
      return await Cylinder.findAll({
        where: { status },
        include: [
          {
            model: CylinderType,
            as: "type",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding cylinders by status:", error);
      throw new DatabaseError(
        "Database error while finding cylinders by status",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, status },
        }
      );
    }
  }

  /**
   * Find cylinders for inspection
   */
  public async findCylindersForInspection(
    daysThreshold: number
  ): Promise<CylinderInterface[]> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      return await Cylinder.findAll({
        where: {
          nextInspectionDate: {
            [Op.not]: null,
            [Op.lte]: thresholdDate,
          },
          isActive: true,
        },
        include: [
          {
            model: CylinderType,
            as: "type",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding cylinders for inspection:", error);
      throw new DatabaseError(
        "Database error while finding cylinders for inspection",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Update cylinder status
   */
  public async updateCylinderStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Cylinder.update(
        { status },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error updating cylinder status:", error);
      throw new DatabaseError("Database error while updating cylinder status", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Find cylinder type by ID
   */
  public async findCylinderTypeById(
    id: string
  ): Promise<CylinderTypeInterface | null> {
    try {
      return await CylinderType.findByPk(id);
    } catch (error) {
      logger.error("Error finding cylinder type by ID:", error);
      throw new DatabaseError(
        "Database error while finding cylinder type by ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
        }
      );
    }
  }

  /**
   * Create cylinder type
   */
  public async createCylinderType(
    typeData: CreateCylinderTypeDTO,
    transaction?: Transaction
  ): Promise<CylinderTypeInterface> {
    try {
      const t = transaction || (await db.sequelize.transaction());

      try {
        // Make sure standardPressure and maxPressure are properly formatted
        // and ensure isActive is always a boolean
        const sanitizedData = {
          ...typeData,
          standardPressure:
            typeData.standardPressure === null ||
            typeData.standardPressure === undefined
              ? null
              : Number(typeData.standardPressure),
          maxPressure:
            typeData.maxPressure === null || typeData.maxPressure === undefined
              ? null
              : Number(typeData.maxPressure),
          isActive: typeData.isActive === undefined ? true : typeData.isActive,
        };

        const newType = await CylinderType.create(sanitizedData as any, {
          transaction: t,
        });

        if (!transaction) {
          await t.commit();
        }

        return newType;
      } catch (error) {
        if (!transaction) {
          await t.rollback();
        }

        logger.error("Database error in createCylinderType:", error);

        // Provide more detailed error message
        let errorMessage = "Database error while creating cylinder type";
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        }

        throw new DatabaseError(errorMessage);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createCylinderType repository:", error);
      throw new DatabaseError("Database error while creating cylinder type");
    }
  }

  /**
   * Update cylinder type
   */
  public async updateCylinderType(
    id: string,
    typeData: UpdateCylinderTypeDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await CylinderType.update(typeData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating cylinder type:", error);
      throw new DatabaseError("Database error while updating cylinder type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Delete cylinder type
   */
  public async deleteCylinderType(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await CylinderType.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting cylinder type:", error);
      throw new DatabaseError("Database error while deleting cylinder type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Get cylinder type list
   */
  public async getCylinderTypeList(
    params: CylinderTypeListQueryParams
  ): Promise<{ types: CylinderTypeInterface[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "name",
        sortOrder = "asc",
        name,
        description,
        gasType,
        material,
        minCapacity,
        maxCapacity,
        valveType,
        color,
        minWeight,
        maxWeight,
        minHeight,
        maxHeight,
        minDiameter,
        maxDiameter,
        isActive,
      } = params;

      const offset = (page - 1) * limit;
      const whereClause: any = {};

      // General search term (searches across multiple fields)
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { gasType: { [Op.iLike]: `%${search}%` } },
          { material: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Specific field filters
      if (name) {
        whereClause.name = { [Op.iLike]: `%${name}%` };
      }

      if (description) {
        whereClause.description = { [Op.iLike]: `%${description}%` };
      }

      if (gasType) {
        whereClause.gasType = { [Op.iLike]: `%${gasType}%` };
      }

      if (material) {
        whereClause.material = { [Op.iLike]: `%${material}%` };
      }

      if (valveType) {
        whereClause.valveType = { [Op.iLike]: `%${valveType}%` };
      }

      if (color) {
        whereClause.color = { [Op.iLike]: `%${color}%` };
      }

      // Numeric range filters
      if (minCapacity !== undefined) {
        whereClause.capacity = {
          ...whereClause.capacity,
          [Op.gte]: minCapacity,
        };
      }

      if (maxCapacity !== undefined) {
        whereClause.capacity = {
          ...whereClause.capacity,
          [Op.lte]: maxCapacity,
        };
      }

      if (minWeight !== undefined) {
        whereClause.weight = {
          ...whereClause.weight,
          [Op.gte]: minWeight,
        };
      }

      if (maxWeight !== undefined) {
        whereClause.weight = {
          ...whereClause.weight,
          [Op.lte]: maxWeight,
        };
      }

      if (minHeight !== undefined) {
        whereClause.height = {
          ...whereClause.height,
          [Op.gte]: minHeight,
        };
      }

      if (maxHeight !== undefined) {
        whereClause.height = {
          ...whereClause.height,
          [Op.lte]: maxHeight,
        };
      }

      if (minDiameter !== undefined) {
        whereClause.diameter = {
          ...whereClause.diameter,
          [Op.gte]: minDiameter,
        };
      }

      if (maxDiameter !== undefined) {
        whereClause.diameter = {
          ...whereClause.diameter,
          [Op.lte]: maxDiameter,
        };
      }

      // Active status filter
      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }

      // Execute query
      const { rows, count } = await CylinderType.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit,
        offset,
      });

      return {
        types: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error in getCylinderTypeList repository:", error);
      throw error;
    }
  }

  /**
   * Get cylinder movement list
   */
  public async getCylinderMovementList(
    params: CylinderMovementListQueryParams
  ): Promise<{ movements: CylinderMovementInterface[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder,
        cylinderId,
        movementType,
        customerId,
        startDate,
        endDate,
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Apply filters
      if (cylinderId) {
        where.cylinderId = cylinderId;
      }

      if (movementType) {
        where.movementType = movementType;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (startDate && endDate) {
        where.transactionDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      } else if (startDate) {
        where.transactionDate = {
          [Op.gte]: new Date(startDate),
        };
      } else if (endDate) {
        where.transactionDate = {
          [Op.lte]: new Date(endDate),
        };
      }

      // Search across multiple fields
      if (search) {
        where[Op.or] = [
          { toLocation: { [Op.iLike]: `%${search}%` } },
          { fromLocation: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } },
          { customerName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Determine sort order
      const order: any = [];
      if (sortBy && sortOrder) {
        order.push([sortBy, sortOrder]);
      } else {
        order.push(["transactionDate", "DESC"]);
      }

      const { count, rows } = await CylinderMovement.findAndCountAll({
        where,
        limit,
        offset,
        order,
      });

      return { movements: rows, total: count };
    } catch (error) {
      logger.error("Error getting cylinder movement list:", error);
      throw new DatabaseError(
        "Database error while getting cylinder movement list",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Find cylinder movement by ID
   */
  public async findCylinderMovementById(
    id: string
  ): Promise<CylinderMovementInterface | null> {
    try {
      return await CylinderMovement.findByPk(id);
    } catch (error) {
      logger.error("Error finding cylinder movement by ID:", error);
      throw new DatabaseError(
        "Database error while finding cylinder movement by ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
        }
      );
    }
  }

  /**
   * Get cylinder movements by cylinder ID
   */
  public async getCylinderMovementsByCylinderId(
    cylinderId: string
  ): Promise<CylinderMovementInterface[]> {
    try {
      return await CylinderMovement.findAll({
        where: { cylinderId },
        order: [["transactionDate", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting cylinder movements by cylinder ID:", error);
      throw new DatabaseError(
        "Database error while getting cylinder movements by cylinder ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, cylinderId },
        }
      );
    }
  }

  /**
   * Create cylinder movement
   */
  public async createCylinderMovement(
    movementData: CreateCylinderMovementDTO,
    transaction?: Transaction
  ): Promise<CylinderMovementInterface> {
    try {
      const movement = await CylinderMovement.create(movementData as any, {
        transaction,
      });
      return movement;
    } catch (error) {
      logger.error("Error creating cylinder movement:", error);
      throw new DatabaseError(
        "Database error while creating cylinder movement",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Update cylinder movement
   */
  public async updateCylinderMovement(
    id: string,
    movementData: UpdateCylinderMovementDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await CylinderMovement.update(movementData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating cylinder movement:", error);
      throw new DatabaseError(
        "Database error while updating cylinder movement",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
        }
      );
    }
  }

  /**
   * Delete cylinder movement
   */
  public async deleteCylinderMovement(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await CylinderMovement.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting cylinder movement:", error);
      throw new DatabaseError(
        "Database error while deleting cylinder movement",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
        }
      );
    }
  }

  /**
   * Debug utility function to check database access
   * For development/testing purposes only
   */
  public async debugCheckDatabaseAccess(): Promise<{
    cylinderCount: number;
    typeCount: number;
    sampleCylinder: any | null;
  }> {
    try {
      const cylinderCount = await Cylinder.count();
      const typeCount = await CylinderType.count();

      // Get a sample cylinder (any one) with no filters
      const sampleCylinder = await Cylinder.findOne({
        attributes: ["id", "serialNumber", "status", "isActive"],
        raw: true,
      });

      return {
        cylinderCount,
        typeCount,
        sampleCylinder,
      };
    } catch (error) {
      logger.error("Database access check failed:", error);
      throw error;
    }
  }
}

// Create and export repository instance
export default new CylinderRepository();
