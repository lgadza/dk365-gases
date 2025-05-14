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
   * Get cylinder list
   */
  public async getCylinderList(
    params: CylinderListQueryParams
  ): Promise<{ cylinders: CylinderInterface[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
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
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Apply filters
      if (status) {
        where.status = status;
      }

      if (gasType) {
        where.currentGasType = gasType;
      }

      if (location) {
        where.location = location;
      }

      if (cylinderTypeId) {
        where.cylinderTypeId = cylinderTypeId;
      }

      if (customerId) {
        where.assignedCustomerId = customerId;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (needsInspection) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        where.nextInspectionDate = {
          [Op.not]: null,
          [Op.lte]: thirtyDaysFromNow,
        };
      }

      if (needsMaintenance) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        where.maintenanceDueDate = {
          [Op.not]: null,
          [Op.lte]: thirtyDaysFromNow,
        };
      }

      // Search across multiple fields
      if (search) {
        where[Op.or] = [
          { serialNumber: { [Op.iLike]: `%${search}%` } },
          { batchNumber: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } },
          { assignedCustomerName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Determine sort order
      const order: any = [];
      if (sortBy && sortOrder) {
        order.push([sortBy, sortOrder]);
      } else {
        order.push(["createdAt", "DESC"]);
      }

      const { count, rows } = await Cylinder.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include: [
          {
            model: CylinderType,
            as: "type",
          },
        ],
      });

      return { cylinders: rows, total: count };
    } catch (error) {
      logger.error("Error getting cylinder list:", error);
      throw new DatabaseError("Database error while getting cylinder list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
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
        sortBy,
        sortOrder,
        gasType,
        material,
        isActive,
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Apply filters
      if (gasType) {
        where.gasType = gasType;
      }

      if (material) {
        where.material = material;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Search across multiple fields
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Determine sort order
      const order: any = [];
      if (sortBy && sortOrder) {
        order.push([sortBy, sortOrder]);
      } else {
        order.push(["name", "ASC"]);
      }

      const { count, rows } = await CylinderType.findAndCountAll({
        where,
        limit,
        offset,
        order,
      });

      return { types: rows, total: count };
    } catch (error) {
      logger.error("Error getting cylinder type list:", error);
      throw new DatabaseError(
        "Database error while getting cylinder type list",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
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
}

// Create and export repository instance
export default new CylinderRepository();
