import { Request, Response } from "express";
import { IOrderService } from "./interfaces/services";
import orderService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class OrderController {
  private service: IOrderService;

  constructor(service: IOrderService) {
    this.service = service;
  }

  /**
   * Get order by ID
   */
  public getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getOrderById(id);

      ResponseUtil.sendSuccess(res, result, "Order retrieved successfully");
    } catch (error) {
      logger.error("Error in getOrderById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving order",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new order
   */
  public createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData = req.body;
      const result = await this.service.createOrder(orderData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Order created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createOrder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating order",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update an order
   */
  public updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const orderData = req.body;
      const result = await this.service.updateOrder(id, orderData);

      ResponseUtil.sendSuccess(res, result, "Order updated successfully");
    } catch (error) {
      logger.error("Error in updateOrder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating order",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete an order
   */
  public deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteOrder(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Order deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteOrder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting order",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get order list
   */
  public getOrderList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getOrderList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        customerId: params.customerId as string,
        driverId: params.driverId as string,
        orderStatus: params.orderStatus as string,
        paymentStatus: params.paymentStatus as string,
        deliveryMethod: params.deliveryMethod as string,
        fromDate: params.fromDate as string,
        toDate: params.toDate as string,
        minAmount: params.minAmount
          ? parseFloat(params.minAmount as string)
          : undefined,
        maxAmount: params.maxAmount
          ? parseFloat(params.maxAmount as string)
          : undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Orders retrieved successfully");
    } catch (error) {
      logger.error("Error in getOrderList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving orders",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Add detail to an order
   */
  public addOrderDetail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const orderDetail = req.body;
      const result = await this.service.addOrderDetail(orderDetail);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Order detail added successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in addOrderDetail controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error adding order detail",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update an order detail
   */
  public updateOrderDetail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const orderDetailData = req.body;
      const result = await this.service.updateOrderDetail(id, orderDetailData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Order detail updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateOrderDetail controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating order detail",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete an order detail
   */
  public deleteOrderDetail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteOrderDetail(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Order detail deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteOrderDetail controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting order detail",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get orders by customer
   */
  public getCustomerOrders = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { customerId } = req.params;
      const result = await this.service.getOrdersByCustomerId(customerId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Customer orders retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCustomerOrders controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving customer orders",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get orders by driver
   */
  public getDriverOrders = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { driverId } = req.params;
      const result = await this.service.getOrdersByDriverId(driverId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Driver orders retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDriverOrders controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving driver orders",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update order status
   */
  public updateOrderStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { orderStatus, notes } = req.body;
      const result = await this.service.updateOrderStatus(
        id,
        orderStatus,
        notes
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Order status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateOrderStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating order status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update payment status
   */
  public updatePaymentStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentStatus, notes } = req.body;
      const result = await this.service.updatePaymentStatus(
        id,
        paymentStatus,
        notes
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Payment status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updatePaymentStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating payment status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Assign driver to order
   */
  public assignDriver = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      const result = await this.service.assignDriver(id, driverId);

      ResponseUtil.sendSuccess(res, result, "Driver assigned successfully");
    } catch (error) {
      logger.error("Error in assignDriver controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error assigning driver",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Complete an order
   */
  public completeOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const result = await this.service.completeOrder(id, notes);

      ResponseUtil.sendSuccess(res, result, "Order completed successfully");
    } catch (error) {
      logger.error("Error in completeOrder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error completing order",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Cancel an order
   */
  public cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await this.service.cancelOrder(id, reason);

      ResponseUtil.sendSuccess(res, result, "Order cancelled successfully");
    } catch (error) {
      logger.error("Error in cancelOrder controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error cancelling order",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new OrderController(orderService);
