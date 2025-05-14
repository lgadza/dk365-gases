import { Request, Response } from "express";
import { ICylinderService } from "./interfaces/services";
import cylinderService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
// Fix the import path - appConfig is exported from the main config index
import { appConfig } from "@/config";

export class CylinderController {
  private service: ICylinderService;

  constructor(service: ICylinderService) {
    this.service = service;
  }

  /**
   * Get cylinder by ID
   */
  public getCylinderById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getCylinderById(id);

      ResponseUtil.sendSuccess(res, result, "Cylinder retrieved successfully");
    } catch (error) {
      logger.error("Error in getCylinderById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinder",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinder by serial number
   */
  public getCylinderBySerialNumber = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { serialNumber } = req.params;
      const result = await this.service.getCylinderBySerialNumber(serialNumber);

      ResponseUtil.sendSuccess(res, result, "Cylinder retrieved successfully");
    } catch (error) {
      logger.error("Error in getCylinderBySerialNumber controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinder",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new cylinder
   */
  public createCylinder = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const cylinderData = req.body;

      // Set the current user as createdBy if not provided
      if (!cylinderData.createdBy && req.user?.id) {
        cylinderData.createdBy = req.user.id;
      }

      const result = await this.service.createCylinder(cylinderData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createCylinder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating cylinder",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a cylinder
   */
  public updateCylinder = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const cylinderData = req.body;

      // Set the current user as updatedBy if not provided
      if (!cylinderData.updatedBy && req.user?.id) {
        cylinderData.updatedBy = req.user.id;
      }

      const result = await this.service.updateCylinder(id, cylinderData);

      ResponseUtil.sendSuccess(res, result, "Cylinder updated successfully");
    } catch (error) {
      logger.error("Error in updateCylinder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating cylinder",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a cylinder
   */
  public deleteCylinder = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteCylinder(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Cylinder deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteCylinder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting cylinder",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinder list
   */
  public getCylinderList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getCylinderList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        status: params.status as string,
        gasType: params.gasType as string,
        location: params.location as string,
        cylinderTypeId: params.cylinderTypeId as string,
        customerId: params.customerId as string,
        // Only pass isActive if it was explicitly provided
        isActive:
          params.isActive !== undefined
            ? params.isActive === "true"
            : undefined,
        needsInspection: params.needsInspection === "true",
        needsMaintenance: params.needsMaintenance === "true",
      });

      ResponseUtil.sendSuccess(res, result, "Cylinders retrieved successfully");
    } catch (error) {
      logger.error("Error in getCylinderList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinders",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinders by type ID
   */
  public getCylindersByTypeId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { typeId } = req.params;
      const result = await this.service.getCylindersByTypeId(typeId);

      ResponseUtil.sendSuccess(res, result, "Cylinders retrieved successfully");
    } catch (error) {
      logger.error("Error in getCylindersByTypeId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinders by type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinders by customer ID
   */
  public getCylindersByCustomerId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { customerId } = req.params;
      const result = await this.service.getCylindersByCustomerId(customerId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Customer cylinders retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCylindersByCustomerId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving customer cylinders",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinders by status
   */
  public getCylindersByStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { status } = req.params;
      const result = await this.service.getCylindersByStatus(status);

      ResponseUtil.sendSuccess(res, result, "Cylinders retrieved successfully");
    } catch (error) {
      logger.error("Error in getCylindersByStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinders by status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinders for inspection
   */
  public getCylindersForInspection = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { daysThreshold } = req.query;
      const result = await this.service.getCylindersForInspection(
        daysThreshold ? parseInt(daysThreshold as string) : undefined
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinders for inspection retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCylindersForInspection controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinders for inspection",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update cylinder status
   */
  public updateCylinderStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await this.service.updateCylinderStatus(id, status);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateCylinderStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating cylinder status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinder type by ID
   */
  public getCylinderTypeById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getCylinderTypeById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder type retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCylinderTypeById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinder type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create cylinder type
   */
  public createCylinderType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const typeData = req.body;

      // Set the current user as createdBy if not provided
      if (!typeData.createdBy && req.user?.id) {
        typeData.createdBy = req.user.id;
      }

      const result = await this.service.createCylinderType(typeData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder type created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createCylinderType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating cylinder type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update cylinder type
   */
  public updateCylinderType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const typeData = req.body;

      // Set the current user as updatedBy if not provided
      if (!typeData.updatedBy && req.user?.id) {
        typeData.updatedBy = req.user.id;
      }

      const result = await this.service.updateCylinderType(id, typeData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder type updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateCylinderType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating cylinder type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete cylinder type
   */
  public deleteCylinderType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteCylinderType(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Cylinder type deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteCylinderType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting cylinder type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinder type list
   */
  public getCylinderTypeList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getCylinderTypeList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,

        // Enhanced search parameters
        name: params.name as string,
        description: params.description as string,
        gasType: params.gasType as string,
        material: params.material as string,
        minCapacity: params.minCapacity
          ? parseFloat(params.minCapacity as string)
          : undefined,
        maxCapacity: params.maxCapacity
          ? parseFloat(params.maxCapacity as string)
          : undefined,
        valveType: params.valveType as string,
        color: params.color as string,
        minWeight: params.minWeight
          ? parseFloat(params.minWeight as string)
          : undefined,
        maxWeight: params.maxWeight
          ? parseFloat(params.maxWeight as string)
          : undefined,
        minHeight: params.minHeight
          ? parseFloat(params.minHeight as string)
          : undefined,
        maxHeight: params.maxHeight
          ? parseFloat(params.maxHeight as string)
          : undefined,
        minDiameter: params.minDiameter
          ? parseFloat(params.minDiameter as string)
          : undefined,
        maxDiameter: params.maxDiameter
          ? parseFloat(params.maxDiameter as string)
          : undefined,
        isActive: params.isActive === "true",
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder types retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCylinderTypeList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinder types",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Advanced search for cylinder types - dedicated endpoint
   */
  public searchCylinderTypes = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Use the same implementation as getCylinderTypeList
      // but with a more descriptive name for the dedicated search endpoint
      const params = req.body; // Using body for more complex search criteria

      const result = await this.service.getCylinderTypeList({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
        sortBy: params.sortBy || "name",
        sortOrder: params.sortOrder || "asc",

        // All search parameters from body
        name: params.name,
        description: params.description,
        gasType: params.gasType,
        material: params.material,
        minCapacity: params.minCapacity,
        maxCapacity: params.maxCapacity,
        valveType: params.valveType,
        color: params.color,
        minWeight: params.minWeight,
        maxWeight: params.maxWeight,
        minHeight: params.minHeight,
        maxHeight: params.maxHeight,
        minDiameter: params.minDiameter,
        maxDiameter: params.maxDiameter,
        isActive: params.isActive,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder types search completed successfully"
      );
    } catch (error) {
      logger.error("Error in searchCylinderTypes controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error searching cylinder types",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Record cylinder movement
   */
  public recordCylinderMovement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const movementData = req.body;

      // Set the current user as createdBy if not provided
      if (!movementData.createdBy && req.user?.id) {
        movementData.createdBy = req.user.id;
      }
      // Set the current user as performedBy if not provided
      if (!movementData.performedBy && req.user?.id) {
        movementData.performedBy = req.user.id;
      }

      const result = await this.service.recordCylinderMovement(movementData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder movement recorded successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in recordCylinderMovement controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error recording cylinder movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update cylinder movement
   */
  public updateCylinderMovement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const movementData = req.body;
      const result = await this.service.updateCylinderMovement(
        id,
        movementData
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder movement updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateCylinderMovement controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating cylinder movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete cylinder movement
   */
  public deleteCylinderMovement = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteCylinderMovement(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Cylinder movement deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteCylinderMovement controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting cylinder movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinder movement by ID
   */
  public getCylinderMovementById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getCylinderMovementById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder movement retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCylinderMovementById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinder movement",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinder movements by cylinder ID
   */
  public getCylinderMovementsByCylinderId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { cylinderId } = req.params;
      const result = await this.service.getCylinderMovementsByCylinderId(
        cylinderId
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder movements retrieved successfully"
      );
    } catch (error) {
      logger.error(
        "Error in getCylinderMovementsByCylinderId controller:",
        error
      );
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinder movements",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get cylinder movement list
   */
  public getCylinderMovementList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getCylinderMovementList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        cylinderId: params.cylinderId as string,
        movementType: params.movementType as string,
        customerId: params.customerId as string,
        startDate: params.startDate as string,
        endDate: params.endDate as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder movements retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCylinderMovementList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving cylinder movements",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate inventory report
   */
  public generateInventoryReport = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const filterParams = {
        status: params.status as string,
        gasType: params.gasType as string,
        location: params.location as string,
        cylinderTypeId: params.cylinderTypeId as string,
        customerId: params.customerId as string,
        isActive: params.isActive === "true",
        needsInspection: params.needsInspection === "true",
        needsMaintenance: params.needsMaintenance === "true",
      };

      const pdfBuffer = await this.service.generateInventoryReport(
        filterParams
      );

      // Set filename and headers
      const filename = `Cylinder_Inventory_Report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error("Error in generateInventoryReport controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating inventory report",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Export cylinders to CSV
   */
  public exportCylindersToCSV = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const filterParams = {
        status: params.status as string,
        gasType: params.gasType as string,
        location: params.location as string,
        cylinderTypeId: params.cylinderTypeId as string,
        customerId: params.customerId as string,
        isActive: params.isActive === "true",
        needsInspection: params.needsInspection === "true",
        needsMaintenance: params.needsMaintenance === "true",
      };

      const csvContent = await this.service.exportCylindersToCSV(filterParams);

      // Set filename and headers
      const filename = `Cylinder_Export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(csvContent);
    } catch (error) {
      logger.error("Error in exportCylindersToCSV controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error exporting cylinders to CSV",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate QR code for a cylinder
   */
  public generateCylinderQRCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const qrCodeBuffer = await this.service.generateCylinderQRCode(id);

      // Get the cylinder to set filename
      const cylinder = await this.service.getCylinderById(id);
      const filename = `Cylinder_QR_${cylinder.serialNumber}.png`;

      // Set headers and send png
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Length", qrCodeBuffer.length);
      res.send(qrCodeBuffer);
    } catch (error) {
      logger.error("Error in generateCylinderQRCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating cylinder QR code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate barcode for a cylinder
   */
  public generateCylinderBarcode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const barcodeBuffer = await this.service.generateCylinderBarcode(id);

      // Get the cylinder to set filename
      const cylinder = await this.service.getCylinderById(id);
      const filename = `Cylinder_Barcode_${cylinder.serialNumber}.png`;

      // Set headers and send png
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Length", barcodeBuffer.length);
      res.send(barcodeBuffer);
    } catch (error) {
      logger.error("Error in generateCylinderBarcode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating cylinder barcode",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Calculate cylinder statistics
   */
  public calculateCylinderStats = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.calculateCylinderStats();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Cylinder statistics calculated successfully"
      );
    } catch (error) {
      logger.error("Error in calculateCylinderStats controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error calculating cylinder statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Debug endpoint to verify database access
   * Only available in development mode
   */
  public debugDatabaseAccess = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Only allow in development mode
      if (appConfig.env !== "development") {
        return ResponseUtil.sendError(
          res,
          "Debug endpoint only available in development mode",
          HttpStatus.FORBIDDEN
        );
      }

      // Access repository directly to check database access
      // @ts-ignore - accessing private property for debugging
      const dbAccessInfo =
        await this.service.repository.debugCheckDatabaseAccess();

      ResponseUtil.sendSuccess(
        res,
        dbAccessInfo,
        "Database access check completed"
      );
    } catch (error) {
      logger.error("Error in debug database access endpoint:", error);
      ResponseUtil.sendError(
        res,
        "Error checking database access",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  };
}

// Create and export controller instance
export default new CylinderController(cylinderService);
