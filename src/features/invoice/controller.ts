import { Request, Response } from "express";
import { IInvoiceService } from "./interfaces/services";
import invoiceService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class InvoiceController {
  private service: IInvoiceService;

  constructor(service: IInvoiceService) {
    this.service = service;
  }

  /**
   * Get invoice by ID
   */
  public getInvoiceById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getInvoiceById(id);

      ResponseUtil.sendSuccess(res, result, "Invoice retrieved successfully");
    } catch (error) {
      logger.error("Error in getInvoiceById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving invoice",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get invoice by invoice number
   */
  public getInvoiceByNumber = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { invoiceNumber } = req.params;
      const result = await this.service.getInvoiceByNumber(invoiceNumber);

      ResponseUtil.sendSuccess(res, result, "Invoice retrieved successfully");
    } catch (error) {
      logger.error("Error in getInvoiceByNumber controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving invoice",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new invoice
   */
  public createInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoiceData = req.body;

      // Set the current user as createdBy if not provided
      if (!invoiceData.createdBy && req.user?.id) {
        invoiceData.createdBy = req.user.id;
      }

      const result = await this.service.createInvoice(invoiceData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createInvoice controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating invoice",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update an invoice
   */
  public updateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const invoiceData = req.body;

      // Set the current user as updatedBy if not provided
      if (!invoiceData.updatedBy && req.user?.id) {
        invoiceData.updatedBy = req.user.id;
      }

      const result = await this.service.updateInvoice(id, invoiceData);

      ResponseUtil.sendSuccess(res, result, "Invoice updated successfully");
    } catch (error) {
      logger.error("Error in updateInvoice controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating invoice",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete an invoice
   */
  public deleteInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteInvoice(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Invoice deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteInvoice controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting invoice",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get invoice list
   */
  public getInvoiceList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getInvoiceList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        status: params.status as string,
        customerId: params.customerId as string,
        startDate: params.startDate as string,
        endDate: params.endDate as string,
        minAmount: params.minAmount
          ? parseFloat(params.minAmount as string)
          : undefined,
        maxAmount: params.maxAmount
          ? parseFloat(params.maxAmount as string)
          : undefined,
        isPaid: params.isPaid === "true",
        isOverdue: params.isOverdue === "true",
      });

      ResponseUtil.sendSuccess(res, result, "Invoices retrieved successfully");
    } catch (error) {
      logger.error("Error in getInvoiceList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving invoices",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get invoices by customer ID
   */
  public getInvoicesByCustomerId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { customerId } = req.params;
      const result = await this.service.getInvoicesByCustomerId(customerId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Customer invoices retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getInvoicesByCustomerId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving customer invoices",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Add invoice item
   */
  public addInvoiceItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { invoiceId } = req.params;
      const itemData = req.body;
      const result = await this.service.addInvoiceItem(invoiceId, itemData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice item added successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in addInvoiceItem controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error adding invoice item",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update invoice item
   */
  public updateInvoiceItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const itemData = req.body;
      const result = await this.service.updateInvoiceItem(id, itemData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice item updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateInvoiceItem controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating invoice item",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete invoice item
   */
  public deleteInvoiceItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.removeInvoiceItem(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Invoice item deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteInvoiceItem controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting invoice item",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get invoice items
   */
  public getInvoiceItems = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { invoiceId } = req.params;
      const result = await this.service.getInvoiceItems(invoiceId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice items retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getInvoiceItems controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving invoice items",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Add invoice payment
   */
  public addInvoicePayment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { invoiceId } = req.params;
      const paymentData = req.body;

      // Set the current user as createdBy if not provided
      if (!paymentData.createdBy && req.user?.id) {
        paymentData.createdBy = req.user.id;
      }

      const result = await this.service.addInvoicePayment(
        invoiceId,
        paymentData
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice payment added successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in addInvoicePayment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error adding invoice payment",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get invoice payments
   */
  public getInvoicePayments = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { invoiceId } = req.params;
      const result = await this.service.getInvoicePayments(invoiceId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice payments retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getInvoicePayments controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving invoice payments",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate invoice PDF
   */
  public generateInvoicePdf = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const pdfBuffer = await this.service.generateInvoicePdf(id);

      // Get the invoice to set filename
      const invoice = await this.service.getInvoiceById(id);
      const filename = `Invoice_${invoice.invoiceNumber}.pdf`;

      // Set headers and send pdf
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error("Error in generateInvoicePdf controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating invoice PDF",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Send invoice by email
   */
  public sendInvoiceByEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const result = await this.service.sendInvoiceByEmail(id, email);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Invoice sent by email successfully"
      );
    } catch (error) {
      logger.error("Error in sendInvoiceByEmail controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error sending invoice by email",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Mark invoice as paid
   */
  public markInvoiceAsPaid = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const paymentData = req.body;

      // Set the current user as createdBy if not provided
      if (!paymentData.createdBy && req.user?.id) {
        paymentData.createdBy = req.user.id;
      }

      const result = await this.service.markInvoiceAsPaid(id, paymentData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice marked as paid successfully"
      );
    } catch (error) {
      logger.error("Error in markInvoiceAsPaid controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error marking invoice as paid",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Mark invoice as sent
   */
  public markInvoiceAsSent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.markInvoiceAsSent(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice marked as sent successfully"
      );
    } catch (error) {
      logger.error("Error in markInvoiceAsSent controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error marking invoice as sent",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Cancel invoice
   */
  public cancelInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await this.service.cancelInvoice(id, reason);

      ResponseUtil.sendSuccess(res, result, "Invoice cancelled successfully");
    } catch (error) {
      logger.error("Error in cancelInvoice controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error cancelling invoice",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Calculate invoice statistics
   */
  public calculateInvoiceStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const filters = {
        customerId: params.customerId as string,
        startDate: params.startDate as string,
        endDate: params.endDate as string,
      };

      const result = await this.service.calculateInvoiceStatistics(filters);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Invoice statistics calculated successfully"
      );
    } catch (error) {
      logger.error("Error in calculateInvoiceStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error calculating invoice statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new InvoiceController(invoiceService);
