import { ICylinderRepository } from "./interfaces/services";
import {
  CylinderCategoryInterface,
  CylinderMovementInterface,
} from "./interfaces/interfaces";
import CylinderCategory from "./models/cylinder-category.model";
import CylinderMovement from "./models/cylinder-movement.model";
import { Transaction, Op as SeqOp, WhereOptions } from "sequelize";
import {
  CylinderCategoryListQueryParams,
  CreateCylinderCategoryDTO,
  UpdateCylinderCategoryDTO,
  CylinderMovementListQueryParams,
  CreateCylinderMovementDTO,
  UpdateCylinderMovementDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";

// Fix Sequelize operator typing issue by using a regular object
const Op = SeqOp as any;

export class CylinderRepository implements ICylinderRepository {
  // Category operations
  public async findCategoryById(
    id: string
  ): Promise<CylinderCategoryInterface | null> {
    try {
      return await CylinderCategory.findByPk(id);
    } catch (error) {
      logger.error("Error finding cylinder category by ID:", error);
      throw new DatabaseError(
        "Database error while finding cylinder category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId: id },
        }
      );
    }
  }

  public async createCategory(
    categoryData: CreateCylinderCategoryDTO,
    transaction?: Transaction
  ): Promise<CylinderCategoryInterface> {
    try {
      // Ensure emptyQuantity is calculated correctly if not provided
      if (categoryData.emptyQuantity === undefined) {
        categoryData.emptyQuantity =
          categoryData.totalQuantity - categoryData.filledQuantity;
      }

      return await CylinderCategory.create(categoryData as any, {
        transaction,
      });
    } catch (error) {
      logger.error("Error creating cylinder category:", error);
      throw new DatabaseError(
        "Database error while creating cylinder category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  public async updateCategory(
    id: string,
    categoryData: UpdateCylinderCategoryDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await CylinderCategory.update(categoryData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating cylinder category:", error);
      throw new DatabaseError(
        "Database error while updating cylinder category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId: id },
        }
      );
    }
  }

  public async deleteCategory(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await CylinderCategory.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting cylinder category:", error);
      throw new DatabaseError(
        "Database error while deleting cylinder category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId: id },
        }
      );
    }
  }

  public async getCategoryList(
    params: CylinderCategoryListQueryParams
  ): Promise<{
    categories: CylinderCategoryInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        location,
        status,
        gasType,
        minFilledQuantity,
        maxFilledQuantity,
        requiresRestock,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (location) {
        where.location = { [Op.eq]: location };
      }

      if (status) {
        where.status = { [Op.eq]: status };
      }

      if (gasType) {
        where.gasType = { [Op.eq]: gasType };
      }

      if (minFilledQuantity !== undefined) {
        where.filledQuantity = {
          ...where.filledQuantity,
          [Op.gte]: minFilledQuantity,
        };
      }

      if (maxFilledQuantity !== undefined) {
        where.filledQuantity = {
          ...where.filledQuantity,
          [Op.lte]: maxFilledQuantity,
        };
      }

      if (requiresRestock) {
        // Logic to identify categories requiring restock
        // For example, where filledQuantity is below 20% of totalQuantity
        where.filledQuantity = {
          [Op.lt]: db.sequelize.literal(
            'cylinder_categories."totalQuantity" * 0.2'
          ),
        };
      }

      // Search across multiple fields
      if (search) {
        where[Op.or] = [
          { categoryName: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { gasType: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get categories and total count
      const { count, rows } = await CylinderCategory.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
      });

      return {
        categories: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting cylinder category list:", error);
      throw new DatabaseError(
        "Database error while getting cylinder category list",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
        }
      );
    }
  }

  // Movement operations
  public async findMovementById(
    id: string
  ): Promise<CylinderMovementInterface | null> {
    try {
      return await CylinderMovement.findByPk(id, {
        include: [{ model: CylinderCategory, as: "category" }],
      });
    } catch (error) {
      logger.error("Error finding cylinder movement by ID:", error);
      throw new DatabaseError(
        "Database error while finding cylinder movement",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, movementId: id },
        }
      );
    }
  }

  public async createMovement(
    movementData: CreateCylinderMovementDTO,
    transaction?: Transaction
  ): Promise<CylinderMovementInterface> {
    try {
      // Set timestamp to current time if not provided
      if (!movementData.timestamp) {
        movementData.timestamp = new Date().toISOString();
      }

      // Set default status if not provided
      if (!movementData.status) {
        movementData.status = "completed";
      }

      return await CylinderMovement.create(movementData as any, {
        transaction,
      });
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

  public async updateMovement(
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
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, movementId: id },
        }
      );
    }
  }

  public async deleteMovement(
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
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, movementId: id },
        }
      );
    }
  }

  public async getMovementList(
    params: CylinderMovementListQueryParams
  ): Promise<{
    movements: CylinderMovementInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "timestamp",
        sortOrder = "desc",
        categoryId,
        movementType,
        status,
        fromDate,
        toDate,
        customerId,
        driverId,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (categoryId) {
        where.categoryId = { [Op.eq]: categoryId };
      }

      if (movementType) {
        where.movementType = { [Op.eq]: movementType };
      }

      if (status) {
        where.status = { [Op.eq]: status };
      }

      if (customerId) {
        where.customerId = { [Op.eq]: customerId };
      }

      if (driverId) {
        where.driverId = { [Op.eq]: driverId };
      }

      // Date range filter
      if (fromDate || toDate) {
        where.timestamp = {};

        if (fromDate) {
          where.timestamp[Op.gte] = new Date(fromDate);
        }

        if (toDate) {
          where.timestamp[Op.lte] = new Date(toDate);
        }
      }

      // Search across relevant fields
      if (search) {
        where[Op.or] = [
          { fromLocation: { [Op.iLike]: `%${search}%` } },
          { toLocation: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get movements and total count
      const { count, rows } = await CylinderMovement.findAndCountAll({
        where,
        include: [{ model: CylinderCategory, as: "category" }],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
      });

      return {
        movements: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting cylinder movement list:", error);
      throw new DatabaseError(
        "Database error while getting cylinder movement list",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
        }
      );
    }
  }

  public async getMovementsByCategory(
    categoryId: string
  ): Promise<CylinderMovementInterface[]> {
    try {
      return await CylinderMovement.findAll({
        where: { categoryId },
        include: [{ model: CylinderCategory, as: "category" }],
        order: [["timestamp", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting movements by category:", error);
      throw new DatabaseError(
        "Database error while getting movements by category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId },
        }
      );
    }
  }

  // Inventory operations
  public async adjustCategoryQuantities(
    categoryId: string,
    filledAdjustment: number,
    emptyAdjustment: number,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const category = await CylinderCategory.findByPk(categoryId, {
        transaction,
      });

      if (!category) {
        return false;
      }

      // Calculate new quantities
      const newFilledQuantity = category.filledQuantity + filledAdjustment;
      const newEmptyQuantity = category.emptyQuantity + emptyAdjustment;

      // Update the category
      await category.update(
        {
          filledQuantity: newFilledQuantity >= 0 ? newFilledQuantity : 0,
          emptyQuantity: newEmptyQuantity >= 0 ? newEmptyQuantity : 0,
          lastRestocked:
            filledAdjustment > 0 || emptyAdjustment > 0
              ? new Date()
              : category.lastRestocked,
        },
        { transaction }
      );

      return true;
    } catch (error) {
      logger.error("Error adjusting category quantities:", error);
      throw new DatabaseError(
        "Database error while adjusting category quantities",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId },
        }
      );
    }
  }

  public async getCategoriesByLocation(
    location: string
  ): Promise<CylinderCategoryInterface[]> {
    try {
      return await CylinderCategory.findAll({
        where: { location },
        order: [["categoryName", "ASC"]],
      });
    } catch (error) {
      logger.error("Error getting categories by location:", error);
      throw new DatabaseError(
        "Database error while getting categories by location",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, location },
        }
      );
    }
  }

  public async getCategoriesByStatus(
    status: string
  ): Promise<CylinderCategoryInterface[]> {
    try {
      return await CylinderCategory.findAll({
        where: { status },
        order: [["categoryName", "ASC"]],
      });
    } catch (error) {
      logger.error("Error getting categories by status:", error);
      throw new DatabaseError(
        "Database error while getting categories by status",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, status },
        }
      );
    }
  }

  public async getCategoriesRequiringRestock(): Promise<
    CylinderCategoryInterface[]
  > {
    try {
      return await CylinderCategory.findAll({
        where: {
          // Where filled quantity is less than 20% of total quantity
          filledQuantity: {
            [Op.lt]: db.sequelize.literal(
              'cylinder_categories."totalQuantity" * 0.2'
            ),
          },
          // And category is active
          status: "active",
        },
        order: [["filledQuantity", "ASC"]],
      });
    } catch (error) {
      logger.error("Error getting categories requiring restock:", error);
      throw new DatabaseError(
        "Database error while getting categories requiring restock",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }
}

// Create and export repository instance
export default new CylinderRepository();
