import { ICylinderService, ICylinderRepository } from "./interfaces/services";
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
  CylinderDTOMapper,
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

export class CylinderService implements ICylinderService {
  private repository: ICylinderRepository;
  private readonly CACHE_PREFIX = "cylinder:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ICylinderRepository) {
    this.repository = repository;
  }

  // Category operations
  public async getCategoryById(id: string): Promise<CylinderCategoryDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}category:${id}`;
      const cachedCategory = await cache.get(cacheKey);

      if (cachedCategory) {
        return JSON.parse(cachedCategory);
      }

      // Get from database if not in cache
      const category = await this.repository.findCategoryById(id);
      if (!category) {
        throw new NotFoundError(`Cylinder category with ID ${id} not found`);
      }

      // Map to DTO
      const categoryDTO = CylinderDTOMapper.toCategoryDetailDTO(category);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(categoryDTO), this.CACHE_TTL);

      return categoryDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoryById service:", error);
      throw new AppError("Failed to get cylinder category");
    }
  }

  public async createCategory(
    categoryData: CreateCylinderCategoryDTO
  ): Promise<CylinderCategoryDetailDTO> {
    try {
      // Validate the data
      this.validateCategoryData(categoryData);

      // Create the category
      const newCategory = await this.repository.createCategory(categoryData);

      // Return the mapped DTO
      return CylinderDTOMapper.toCategoryDetailDTO(newCategory);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createCategory service:", error);
      throw new AppError("Failed to create cylinder category");
    }
  }

  public async updateCategory(
    id: string,
    categoryData: UpdateCylinderCategoryDTO
  ): Promise<CylinderCategoryDetailDTO> {
    try {
      // Validate the category exists
      const existingCategory = await this.repository.findCategoryById(id);
      if (!existingCategory) {
        throw new NotFoundError(`Cylinder category with ID ${id} not found`);
      }

      // Update the category
      await this.repository.updateCategory(id, categoryData);

      // Clear cache
      await this.clearCategoryCache(id);

      // Get the updated category
      const updatedCategory = await this.repository.findCategoryById(id);
      if (!updatedCategory) {
        throw new AppError("Failed to retrieve updated category");
      }

      // Return the mapped DTO
      return CylinderDTOMapper.toCategoryDetailDTO(updatedCategory);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateCategory service:", error);
      throw new AppError("Failed to update cylinder category");
    }
  }

  public async deleteCategory(id: string): Promise<boolean> {
    try {
      // Check if category exists
      const category = await this.repository.findCategoryById(id);
      if (!category) {
        throw new NotFoundError(`Cylinder category with ID ${id} not found`);
      }

      // Delete the category
      const result = await this.repository.deleteCategory(id);

      // Clear cache
      await this.clearCategoryCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteCategory service:", error);
      throw new AppError("Failed to delete cylinder category");
    }
  }

  public async getCategoryList(
    params: CylinderCategoryListQueryParams
  ): Promise<PaginatedCylinderCategoryListDTO> {
    try {
      const { categories, total } = await this.repository.getCategoryList(
        params
      );

      // Map to DTOs
      const categoryDTOs = categories.map((category) =>
        CylinderDTOMapper.toCategoryDetailDTO(category)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        categories: categoryDTOs,
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
      logger.error("Error in getCategoryList service:", error);
      throw new AppError("Failed to get cylinder category list");
    }
  }

  // Movement operations
  public async getMovementById(id: string): Promise<CylinderMovementDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}movement:${id}`;
      const cachedMovement = await cache.get(cacheKey);

      if (cachedMovement) {
        return JSON.parse(cachedMovement);
      }

      // Get from database if not in cache
      const movement = await this.repository.findMovementById(id);
      if (!movement) {
        throw new NotFoundError(`Cylinder movement with ID ${id} not found`);
      }

      // Map to DTO
      const movementDTO = CylinderDTOMapper.toMovementDetailDTO(
        movement,
        (movement as any).category
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(movementDTO), this.CACHE_TTL);

      return movementDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getMovementById service:", error);
      throw new AppError("Failed to get cylinder movement");
    }
  }

  public async createMovement(
    movementData: CreateCylinderMovementDTO
  ): Promise<CylinderMovementDetailDTO> {
    try {
      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Validate the category exists
        const category = await this.repository.findCategoryById(
          movementData.categoryId
        );
        if (!category) {
          throw new NotFoundError(
            `Cylinder category with ID ${movementData.categoryId} not found`
          );
        }

        // Create the movement
        const newMovement = await this.repository.createMovement(
          movementData,
          transaction
        );

        // For certain movement types, adjust the category quantities
        if (movementData.movementType === "sale") {
          // For sales, decrease filled cylinders
          await this.repository.adjustCategoryQuantities(
            movementData.categoryId,
            -movementData.quantity, // Decrease filled
            0, // No change in empty
            transaction
          );
        } else if (movementData.movementType === "exchange") {
          // For exchanges, decrease filled and increase empty
          await this.repository.adjustCategoryQuantities(
            movementData.categoryId,
            -movementData.quantity, // Decrease filled
            movementData.quantity, // Increase empty
            transaction
          );
        } else if (movementData.movementType === "return") {
          // For returns, increase empty cylinders
          await this.repository.adjustCategoryQuantities(
            movementData.categoryId,
            0, // No change in filled
            movementData.quantity, // Increase empty
            transaction
          );
        } else if (movementData.movementType === "restock") {
          // For restocks, increase filled cylinders
          await this.repository.adjustCategoryQuantities(
            movementData.categoryId,
            movementData.quantity, // Increase filled
            0, // No change in empty
            transaction
          );
        }

        // Commit the transaction
        await transaction.commit();

        // Get the category for the response
        const updatedCategory = await this.repository.findCategoryById(
          movementData.categoryId
        );

        // Return the movement with category
        return CylinderDTOMapper.toMovementDetailDTO(
          newMovement,
          updatedCategory!
        );
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createMovement service:", error);
      throw new AppError("Failed to create cylinder movement");
    }
  }

  public async updateMovement(
    id: string,
    movementData: UpdateCylinderMovementDTO
  ): Promise<CylinderMovementDetailDTO> {
    try {
      // Check if movement exists
      const existingMovement = await this.repository.findMovementById(id);
      if (!existingMovement) {
        throw new NotFoundError(`Cylinder movement with ID ${id} not found`);
      }

      // Update the movement
      await this.repository.updateMovement(id, movementData);

      // Clear cache
      await this.clearMovementCache(id);

      // Get the updated movement
      const updatedMovement = await this.repository.findMovementById(id);
      if (!updatedMovement) {
        throw new AppError("Failed to retrieve updated movement");
      }

      // Return the mapped DTO
      return CylinderDTOMapper.toMovementDetailDTO(
        updatedMovement,
        (updatedMovement as any).category
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateMovement service:", error);
      throw new AppError("Failed to update cylinder movement");
    }
  }

  public async deleteMovement(id: string): Promise<boolean> {
    try {
      // Check if movement exists
      const movement = await this.repository.findMovementById(id);
      if (!movement) {
        throw new NotFoundError(`Cylinder movement with ID ${id} not found`);
      }

      // Delete the movement
      const result = await this.repository.deleteMovement(id);

      // Clear cache
      await this.clearMovementCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteMovement service:", error);
      throw new AppError("Failed to delete cylinder movement");
    }
  }

  public async getMovementList(
    params: CylinderMovementListQueryParams
  ): Promise<PaginatedCylinderMovementListDTO> {
    try {
      const { movements, total } = await this.repository.getMovementList(
        params
      );

      // Map to DTOs
      const movementDTOs = movements.map((movement) =>
        CylinderDTOMapper.toMovementDetailDTO(
          movement,
          (movement as any).category
        )
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        movements: movementDTOs,
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
      logger.error("Error in getMovementList service:", error);
      throw new AppError("Failed to get cylinder movement list");
    }
  }

  public async getMovementsByCategory(
    categoryId: string
  ): Promise<CylinderMovementDetailDTO[]> {
    try {
      // Validate the category exists
      const category = await this.repository.findCategoryById(categoryId);
      if (!category) {
        throw new NotFoundError(
          `Cylinder category with ID ${categoryId} not found`
        );
      }

      // Get movements for this category
      const movements = await this.repository.getMovementsByCategory(
        categoryId
      );

      // Map to DTOs
      return movements.map((movement) =>
        CylinderDTOMapper.toMovementDetailDTO(
          movement,
          (movement as any).category || category
        )
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getMovementsByCategory service:", error);
      throw new AppError("Failed to get cylinder movements by category");
    }
  }

  // Specialized operations
  public async performCylinderExchange(
    categoryId: string,
    filledQuantity: number,
    customerId?: string,
    driverId?: string,
    invoiceId?: string
  ): Promise<CylinderMovementDetailDTO> {
    try {
      // Validate inputs
      if (filledQuantity <= 0) {
        throw new BadRequestError(
          "Exchange quantity must be greater than zero"
        );
      }

      // Create a movement for the exchange
      const movementData: CreateCylinderMovementDTO = {
        categoryId,
        quantity: filledQuantity,
        fromLocation: "stock",
        toLocation: "customer",
        movementType: "exchange",
        customerId,
        driverId,
        invoiceId,
        notes: `Exchange of ${filledQuantity} cylinders`,
      };

      // Use createMovement which handles both the movement creation and quantity adjustment
      return await this.createMovement(movementData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in performCylinderExchange service:", error);
      throw new AppError("Failed to perform cylinder exchange");
    }
  }

  public async performCylinderSale(
    categoryId: string,
    quantity: number,
    customerId?: string,
    invoiceId?: string
  ): Promise<CylinderMovementDetailDTO> {
    try {
      // Validate inputs
      if (quantity <= 0) {
        throw new BadRequestError("Sale quantity must be greater than zero");
      }

      // Create a movement for the sale
      const movementData: CreateCylinderMovementDTO = {
        categoryId,
        quantity,
        fromLocation: "stock",
        toLocation: "customer",
        movementType: "sale",
        customerId,
        invoiceId,
        notes: `Sale of ${quantity} cylinders`,
      };

      // Use createMovement which handles both the movement creation and quantity adjustment
      return await this.createMovement(movementData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in performCylinderSale service:", error);
      throw new AppError("Failed to perform cylinder sale");
    }
  }

  public async performCylinderReturn(
    categoryId: string,
    quantity: number,
    customerId?: string,
    invoiceId?: string
  ): Promise<CylinderMovementDetailDTO> {
    try {
      // Validate inputs
      if (quantity <= 0) {
        throw new BadRequestError("Return quantity must be greater than zero");
      }

      // Create a movement for the return
      const movementData: CreateCylinderMovementDTO = {
        categoryId,
        quantity,
        fromLocation: "customer",
        toLocation: "stock",
        movementType: "return",
        customerId,
        invoiceId,
        notes: `Return of ${quantity} empty cylinders`,
      };

      // Use createMovement which handles both the movement creation and quantity adjustment
      return await this.createMovement(movementData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in performCylinderReturn service:", error);
      throw new AppError("Failed to perform cylinder return");
    }
  }

  public async performCylinderRestock(
    categoryId: string,
    filledQuantity: number,
    emptyQuantity: number
  ): Promise<CylinderMovementDetailDTO> {
    try {
      // Validate inputs
      if (filledQuantity < 0 || emptyQuantity < 0) {
        throw new BadRequestError("Restock quantities cannot be negative");
      }

      if (filledQuantity === 0 && emptyQuantity === 0) {
        throw new BadRequestError(
          "At least one quantity must be greater than zero"
        );
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Check if category exists
        const category = await this.repository.findCategoryById(categoryId);
        if (!category) {
          throw new NotFoundError(
            `Cylinder category with ID ${categoryId} not found`
          );
        }

        // Create a movement for the restock
        const movementData: CreateCylinderMovementDTO = {
          categoryId,
          quantity: filledQuantity + emptyQuantity,
          fromLocation: "supplier",
          toLocation: "stock",
          movementType: "restock",
          notes: `Restock of ${filledQuantity} filled and ${emptyQuantity} empty cylinders`,
        };

        const newMovement = await this.repository.createMovement(
          movementData,
          transaction
        );

        // Adjust the category quantities
        await this.repository.adjustCategoryQuantities(
          categoryId,
          filledQuantity,
          emptyQuantity,
          transaction
        );

        // Update the lastRestocked date
        await this.repository.updateCategory(
          categoryId,
          { lastRestocked: new Date().toISOString() },
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Get the updated category
        const updatedCategory = await this.repository.findCategoryById(
          categoryId
        );

        // Return the movement with category
        return CylinderDTOMapper.toMovementDetailDTO(
          newMovement,
          updatedCategory!
        );
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in performCylinderRestock service:", error);
      throw new AppError("Failed to perform cylinder restock");
    }
  }

  public async getInventorySummary(): Promise<CylinderInventorySummaryDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}inventory:summary`;
      const cachedSummary = await cache.get(cacheKey);

      if (cachedSummary) {
        return JSON.parse(cachedSummary);
      }

      // Get all active categories
      const allCategories = await this.repository.getCategoryList({
        limit: 1000,
        status: "active",
      });

      // Calculate summary metrics
      let totalCylinders = 0;
      let totalFilled = 0;
      let totalEmpty = 0;
      let requiresRestock = 0;

      const byLocation: Record<
        string,
        { total: number; filled: number; empty: number }
      > = {};
      const byStatus: Record<string, number> = {};
      const byGasType: Record<string, number> = {};

      for (const category of allCategories.categories) {
        totalCylinders += category.totalQuantity;
        totalFilled += category.filledQuantity;
        totalEmpty += category.emptyQuantity;

        // Check if category requires restock (less than 20% filled)
        if (category.filledQuantity < category.totalQuantity * 0.2) {
          requiresRestock++;
        }

        // Group by location
        if (category.location) {
          if (!byLocation[category.location]) {
            byLocation[category.location] = { total: 0, filled: 0, empty: 0 };
          }
          byLocation[category.location].total += category.totalQuantity;
          byLocation[category.location].filled += category.filledQuantity;
          byLocation[category.location].empty += category.emptyQuantity;
        }

        // Group by status
        if (!byStatus[category.status]) {
          byStatus[category.status] = 0;
        }
        byStatus[category.status] += category.totalQuantity;

        // Group by gas type
        if (category.gasType) {
          if (!byGasType[category.gasType]) {
            byGasType[category.gasType] = 0;
          }
          byGasType[category.gasType] += category.totalQuantity;
        }
      }

      const summary: CylinderInventorySummaryDTO = {
        totalCategories: allCategories.categories.length,
        totalCylinders,
        totalFilled,
        totalEmpty,
        byLocation,
        byStatus,
        byGasType,
        requiresRestock,
      };

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(summary), this.CACHE_TTL);

      return summary;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getInventorySummary service:", error);
      throw new AppError("Failed to get cylinder inventory summary");
    }
  }

  public async getCategoriesByLocation(
    location: string
  ): Promise<CylinderCategoryDetailDTO[]> {
    try {
      const categories = await this.repository.getCategoriesByLocation(
        location
      );

      return categories.map((category) =>
        CylinderDTOMapper.toCategoryDetailDTO(category)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoriesByLocation service:", error);
      throw new AppError("Failed to get cylinder categories by location");
    }
  }

  public async getCategoriesByStatus(
    status: string
  ): Promise<CylinderCategoryDetailDTO[]> {
    try {
      const categories = await this.repository.getCategoriesByStatus(status);

      return categories.map((category) =>
        CylinderDTOMapper.toCategoryDetailDTO(category)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoriesByStatus service:", error);
      throw new AppError("Failed to get cylinder categories by status");
    }
  }

  public async getCategoriesRequiringRestock(): Promise<
    CylinderCategoryDetailDTO[]
  > {
    try {
      const categories = await this.repository.getCategoriesRequiringRestock();

      return categories.map((category) =>
        CylinderDTOMapper.toCategoryDetailDTO(category)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoriesRequiringRestock service:", error);
      throw new AppError("Failed to get cylinder categories requiring restock");
    }
  }

  // Helper methods
  private validateCategoryData(categoryData: CreateCylinderCategoryDTO): void {
    // Check if filled quantity is <= total quantity
    if (categoryData.filledQuantity > categoryData.totalQuantity) {
      throw new BadRequestError("Filled quantity cannot exceed total quantity");
    }

    // If emptyQuantity is provided, validate total = filled + empty
    if (categoryData.emptyQuantity !== undefined) {
      if (
        categoryData.filledQuantity + categoryData.emptyQuantity !==
        categoryData.totalQuantity
      ) {
        throw new BadRequestError(
          "Total quantity must equal filled plus empty quantities"
        );
      }
    }
  }

  private async clearCategoryCache(categoryId: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}category:${categoryId}`;
      await cache.del(cacheKey);

      // Also clear inventory summary cache
      await cache.del(`${this.CACHE_PREFIX}inventory:summary`);
    } catch (error) {
      logger.warn("Error clearing category cache:", error);
    }
  }

  private async clearMovementCache(movementId: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}movement:${movementId}`;
      await cache.del(cacheKey);

      // Also clear inventory summary cache
      await cache.del(`${this.CACHE_PREFIX}inventory:summary`);
    } catch (error) {
      logger.warn("Error clearing movement cache:", error);
    }
  }
}

// Create and export service instance
export default new CylinderService(repository);
