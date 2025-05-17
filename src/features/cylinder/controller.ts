import { Request, Response } from "express";
import { ICylinderService } from "./interfaces/services";
import cylinderService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class CylinderController {
  private service: ICylinderService;

  constructor(service: ICylinderService) {
    this.service = service;
  }

  // Category operations
  public getCategoryById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getCategoryById(id);

      ResponseUtil.sendSuccess(res, result, "Category retrieved successfully");
    } catch (error) {
      logger.error("Error in getCategoryById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public createCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categoryData = req.body;
      const result = await this.service.createCategory(categoryData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Category created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public updateCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const result = await this.service.updateCategory(id, categoryData);

      ResponseUtil.sendSuccess(res, result, "Category updated successfully");
    } catch (error) {
      logger.error("Error in updateCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public deleteCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteCategory(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Category deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public getCategoryList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getCategoryList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        location: params.location as string,
        status: params.status as string,
        gasType: params.gasType as string,
        minFilledQuantity: params.minFilledQuantity
          ? parseInt(params.minFilledQuantity as string)
          : undefined,
        maxFilledQuantity: params.maxFilledQuantity
          ? parseInt(params.maxFilledQuantity as string)
          : undefined,
        requiresRestock: params.requiresRestock === "true",
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Categories retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCategoryList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving categories",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  // Movement operations
  public getMovementById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getMovementById(id);

      ResponseUtil.sendSuccess(res, result, "Movement retrieved successfully");
    } catch (error) {
      logger.error("Error in getMovementById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public createMovement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const movementData = req.body;
      const result = await this.service.createMovement(movementData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Movement created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createMovement controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public updateMovement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const movementData = req.body;
      const result = await this.service.updateMovement(id, movementData);

      ResponseUtil.sendSuccess(res, result, "Movement updated successfully");
    } catch (error) {
      logger.error("Error in updateMovement controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public deleteMovement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteMovement(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Movement deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteMovement controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public getMovementList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getMovementList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        categoryId: params.categoryId as string,
        movementType: params.movementType as string,
        status: params.status as string,
        fromDate: params.fromDate as string,
        toDate: params.toDate as string,
        customerId: params.customerId as string,
        driverId: params.driverId as string,
      });

      ResponseUtil.sendSuccess(res, result, "Movements retrieved successfully");
    } catch (error) {
      logger.error("Error in getMovementList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving movements",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public getMovementsByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const result = await this.service.getMovementsByCategory(categoryId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Category movements retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getMovementsByCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving category movements",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  // Specialized operations
  public performCylinderExchange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        categoryId,
        filledQuantity,
        customerId,
        driverId,
        invoiceId,
        notes,
      } = req.body;

      const result = await this.service.performCylinderExchange(
        categoryId,
        filledQuantity,
        customerId,
        driverId,
        invoiceId
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder exchange performed successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in performCylinderExchange controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error performing cylinder exchange",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public performCylinderSale = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { categoryId, quantity, customerId, invoiceId } = req.body;

      const result = await this.service.performCylinderSale(
        categoryId,
        quantity,
        customerId,
        invoiceId
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder sale performed successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in performCylinderSale controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error performing cylinder sale",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public performCylinderReturn = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { categoryId, quantity, customerId, invoiceId } = req.body;

      const result = await this.service.performCylinderReturn(
        categoryId,
        quantity,
        customerId,
        invoiceId
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder return performed successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in performCylinderReturn controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error performing cylinder return",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public performCylinderRestock = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { categoryId, filledQuantity, emptyQuantity } = req.body;

      const result = await this.service.performCylinderRestock(
        categoryId,
        filledQuantity,
        emptyQuantity
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder restock performed successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in performCylinderRestock controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error performing cylinder restock",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public getInventorySummary = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getInventorySummary();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Inventory summary retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getInventorySummary controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving inventory summary",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public getCategoriesByLocation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { location } = req.params;
      const result = await this.service.getCategoriesByLocation(location);

      ResponseUtil.sendSuccess(
        res,
        result,
        `Categories at location '${location}' retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getCategoriesByLocation controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving categories by location",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public getCategoriesByStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { status } = req.params;
      const result = await this.service.getCategoriesByStatus(status);

      ResponseUtil.sendSuccess(
        res,
        result,
        `Categories with status '${status}' retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getCategoriesByStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving categories by status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  public getCategoriesRequiringRestock = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getCategoriesRequiringRestock();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Categories requiring restock retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCategoriesRequiringRestock controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving categories requiring restock",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new CylinderController(cylinderService);
