import { Request, Response } from "express";
import { IFleetService } from "./interfaces/services";
import fleetService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class FleetController {
  private service: IFleetService;

  constructor(service: IFleetService) {
    this.service = service;
  }

  /**
   * Get vehicle by ID
   */
  public getVehicleById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getVehicleById(id);

      ResponseUtil.sendSuccess(res, result, "Vehicle retrieved successfully");
    } catch (error) {
      logger.error("Error in getVehicleById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving vehicle",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new vehicle
   */
  public createVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
      const vehicleData = req.body;
      const result = await this.service.createVehicle(vehicleData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Vehicle created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createVehicle controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating vehicle",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a vehicle
   */
  public updateVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const vehicleData = req.body;
      const result = await this.service.updateVehicle(id, vehicleData);

      ResponseUtil.sendSuccess(res, result, "Vehicle updated successfully");
    } catch (error) {
      logger.error("Error in updateVehicle controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating vehicle",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a vehicle
   */
  public deleteVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteVehicle(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Vehicle deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteVehicle controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting vehicle",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get vehicles requiring maintenance
   */
  public getVehiclesRequiringMaintenance = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getVehiclesRequiringMaintenance();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Vehicles requiring maintenance retrieved successfully"
      );
    } catch (error) {
      logger.error(
        "Error in getVehiclesRequiringMaintenance controller:",
        error
      );
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving vehicles requiring maintenance",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get fleet summary
   */
  public getFleetSummary = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getFleetSummary();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Fleet summary retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getFleetSummary controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving fleet summary",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get maintenance by ID
   */
  public getMaintenanceById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getMaintenanceById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Maintenance record retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getMaintenanceById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving maintenance record",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new maintenance record
   */
  public createMaintenance = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const maintenanceData = req.body;
      const result = await this.service.createMaintenance(maintenanceData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Maintenance record created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createMaintenance controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating maintenance record",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a maintenance record
   */
  public updateMaintenance = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const maintenanceData = req.body;
      const result = await this.service.updateMaintenance(id, maintenanceData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Maintenance record updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateMaintenance controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating maintenance record",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a maintenance record
   */
  public deleteMaintenance = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteMaintenance(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Maintenance record deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteMaintenance controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting maintenance record",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get maintenance list
   */
  public getMaintenanceList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getMaintenanceList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        vehicleId: params.vehicleId as string,
        serviceType: params.serviceType as string,
        status: params.status as string,
        fromDate: params.fromDate as string,
        toDate: params.toDate as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Maintenance records retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getMaintenanceList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving maintenance records",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get maintenance history for a vehicle
   */
  public getVehicleMaintenanceHistory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { vehicleId } = req.params;
      const result = await this.service.getVehicleMaintenanceHistory(vehicleId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Vehicle maintenance history retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getVehicleMaintenanceHistory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving vehicle maintenance history",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update maintenance status
   */
  public updateMaintenanceStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await this.service.updateMaintenanceStatus(id, status);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Maintenance status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateMaintenanceStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating maintenance status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get upcoming maintenance schedule
   */
  public getUpcomingMaintenanceSchedule = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getUpcomingMaintenanceSchedule();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Upcoming maintenance schedule retrieved successfully"
      );
    } catch (error) {
      logger.error(
        "Error in getUpcomingMaintenanceSchedule controller:",
        error
      );
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving upcoming maintenance schedule",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get maintenance by status
   */
  public getMaintenanceByStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { status } = req.query;
      if (!status) {
        ResponseUtil.sendBadRequest(res, "Status parameter is required");
        return;
      }

      const result = await this.service.getMaintenanceByStatus(
        status as string
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        `Maintenance records with status '${status}' retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getMaintenanceByStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving maintenance records by status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Schedule vehicle maintenance
   */
  public scheduleVehicleMaintenance = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { vehicleId } = req.params;
      const maintenanceData = req.body;

      const result = await this.service.scheduleVehicleMaintenance(
        vehicleId,
        maintenanceData
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Vehicle maintenance scheduled successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in scheduleVehicleMaintenance controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error scheduling vehicle maintenance",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get vehicle list
   */
  public getVehicleList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getVehicleList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        status: params.status as string,
        vehicleType: params.vehicleType as string,
        make: params.make as string,
        model: params.model as string,
        year: params.year ? parseInt(params.year as string) : undefined,
        driverId: params.driverId as string,
        needsMaintenance: params.needsMaintenance === "true",
      });

      ResponseUtil.sendSuccess(res, result, "Vehicles retrieved successfully");
    } catch (error) {
      logger.error("Error in getVehicleList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving vehicles",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update vehicle status
   */
  public updateVehicleStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await this.service.updateVehicleStatus(id, status);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Vehicle status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateVehicleStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating vehicle status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Assign driver to vehicle
   */
  public assignDriverToVehicle = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      const result = await this.service.assignDriverToVehicle(id, driverId);

      ResponseUtil.sendSuccess(res, result, "Driver assigned successfully");
    } catch (error) {
      logger.error("Error in assignDriverToVehicle controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error assigning driver to vehicle",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get vehicles by status
   */
  public getVehiclesByStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { status } = req.params;
      const result = await this.service.getVehiclesByStatus(status);

      ResponseUtil.sendSuccess(
        res,
        result,
        `Vehicles with status '${status}' retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getVehiclesByStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving vehicles by status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get vehicles by type
   */
  public getVehiclesByType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { type } = req.params;
      const result = await this.service.getVehiclesByType(type);

      ResponseUtil.sendSuccess(
        res,
        result,
        `Vehicles of type '${type}' retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getVehiclesByType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving vehicles by type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update vehicle mileage
   */
  public updateVehicleMileage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { mileage } = req.body;
      const result = await this.service.updateVehicleMileage(id, mileage);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Vehicle mileage updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateVehicleMileage controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating vehicle mileage",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new FleetController(fleetService);
