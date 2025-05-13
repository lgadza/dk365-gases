import { IInvoiceRepository } from "./interfaces/services";
import {
  InvoiceInterface,
  InvoiceItemInterface,
  InvoicePaymentInterface,
  InvoiceStatus,
} from "./interfaces/interfaces";
import Invoice from "./model";
import InvoiceItem from "./invoice-item.model";
import InvoicePayment from "./invoice-payment.model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  InvoiceListQueryParams,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  CreateInvoiceItemDTO,
  UpdateInvoiceItemDTO,
  CreateInvoicePaymentDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";

// Make sure to add "implements IInvoiceRepository" to the class declaration
export class InvoiceRepository implements IInvoiceRepository {
  /**
   * Find invoice by ID
   */
  public async findInvoiceById(id: string): Promise<InvoiceInterface | null> {
    try {
      return await Invoice.findByPk(id);
    } catch (error) {
      logger.error("Error finding invoice by ID:", error);
      throw new DatabaseError("Database error while finding invoice by ID", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Find invoice by number
   */
  public async findInvoiceByNumber(
    invoiceNumber: string
  ): Promise<InvoiceInterface | null> {
    try {
      return await Invoice.findOne({ where: { invoiceNumber } });
    } catch (error) {
      logger.error("Error finding invoice by number:", error);
      throw new DatabaseError(
        "Database error while finding invoice by number",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, invoiceNumber },
        }
      );
    }
  }

  /**
   * Create invoice
   */
  public async createInvoice(
    invoiceData: CreateInvoiceDTO,
    transaction?: Transaction
  ): Promise<InvoiceInterface> {
    try {
      const invoice = await Invoice.create(invoiceData as any, { transaction });
      return invoice;
    } catch (error) {
      logger.error("Error creating invoice:", error);
      throw new DatabaseError("Database error while creating invoice", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update invoice
   */
  public async updateInvoice(
    id: string,
    invoiceData: UpdateInvoiceDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Invoice.update(invoiceData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating invoice:", error);
      throw new DatabaseError("Database error while updating invoice", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Delete invoice
   */
  public async deleteInvoice(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Invoice.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting invoice:", error);
      throw new DatabaseError("Database error while deleting invoice", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Get invoice list
   */
  public async getInvoiceList(
    params: InvoiceListQueryParams
  ): Promise<{ invoices: InvoiceInterface[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder,
        status,
        customerId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        isPaid,
        isOverdue,
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Apply filters
      if (status) {
        where.status = status;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (startDate && endDate) {
        where.issueDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      } else if (startDate) {
        where.issueDate = {
          [Op.gte]: new Date(startDate),
        };
      } else if (endDate) {
        where.issueDate = {
          [Op.lte]: new Date(endDate),
        };
      }

      if (minAmount !== undefined && maxAmount !== undefined) {
        where.totalAmount = {
          [Op.between]: [minAmount, maxAmount],
        };
      } else if (minAmount !== undefined) {
        where.totalAmount = {
          [Op.gte]: minAmount,
        };
      } else if (maxAmount !== undefined) {
        where.totalAmount = {
          [Op.lte]: maxAmount,
        };
      }

      if (isPaid !== undefined) {
        where.isPaid = isPaid;
      }

      if (isOverdue === true) {
        where.dueDate = {
          [Op.lt]: new Date(),
        };
        where.isPaid = false;
      }

      // Search across multiple fields
      if (search) {
        where[Op.or] = [
          { invoiceNumber: { [Op.iLike]: `%${search}%` } },
          { customerName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Determine sort order
      const order: any = [];
      if (sortBy && sortOrder) {
        order.push([sortBy, sortOrder]);
      } else {
        order.push(["createdAt", "DESC"]);
      }

      const { count, rows } = await Invoice.findAndCountAll({
        where,
        limit,
        offset,
        order,
      });

      return { invoices: rows, total: count };
    } catch (error) {
      logger.error("Error getting invoice list:", error);
      throw new DatabaseError("Database error while getting invoice list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Get invoices by customer ID
   */
  public async getInvoicesByCustomerId(
    customerId: string
  ): Promise<InvoiceInterface[]> {
    try {
      return await Invoice.findAll({
        where: { customerId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting invoices by customer ID:", error);
      throw new DatabaseError(
        "Database error while getting invoices by customer ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, customerId },
        }
      );
    }
  }

  /**
   * Create invoice item
   */
  public async createInvoiceItem(
    itemData: CreateInvoiceItemDTO,
    transaction?: Transaction
  ): Promise<InvoiceItemInterface> {
    try {
      const item = await InvoiceItem.create(itemData, { transaction });
      return item;
    } catch (error) {
      logger.error("Error creating invoice item:", error);
      throw new DatabaseError("Database error while creating invoice item", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update invoice item
   */
  public async updateInvoiceItem(
    id: string,
    itemData: UpdateInvoiceItemDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await InvoiceItem.update(itemData, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating invoice item:", error);
      throw new DatabaseError("Database error while updating invoice item", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Delete invoice item
   */
  public async deleteInvoiceItem(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await InvoiceItem.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting invoice item:", error);
      throw new DatabaseError("Database error while deleting invoice item", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, id },
      });
    }
  }

  /**
   * Get invoice items by invoice ID
   */
  public async getInvoiceItemsByInvoiceId(
    invoiceId: string
  ): Promise<InvoiceItemInterface[]> {
    try {
      return await InvoiceItem.findAll({
        where: { invoiceId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting invoice items by invoice ID:", error);
      throw new DatabaseError(
        "Database error while getting invoice items by invoice ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, invoiceId },
        }
      );
    }
  }

  /**
   * Create invoice payment
   */
  public async createInvoicePayment(
    paymentData: CreateInvoicePaymentDTO,
    transaction?: Transaction
  ): Promise<InvoicePaymentInterface> {
    try {
      const payment = await InvoicePayment.create(paymentData as any, {
        transaction,
      });
      return payment;
    } catch (error) {
      logger.error("Error creating invoice payment:", error);
      throw new DatabaseError("Database error while creating invoice payment", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Get invoice payments by invoice ID
   */
  public async getInvoicePaymentsByInvoiceId(
    invoiceId: string
  ): Promise<InvoicePaymentInterface[]> {
    try {
      return await InvoicePayment.findAll({
        where: { invoiceId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting invoice payments by invoice ID:", error);
      throw new DatabaseError(
        "Database error while getting invoice payments by invoice ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, invoiceId },
        }
      );
    }
  }

  /**
   * Recalculate invoice totals
   */
  public async recalculateInvoiceTotals(
    invoiceId: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Get all items for the invoice
      const items = await InvoiceItem.findAll({
        where: { invoiceId },
        transaction,
      });

      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0
      );
      const taxAmount = items.reduce(
        (sum, item) => sum + Number(item.taxAmount),
        0
      );

      // Get the invoice to check discount amount
      const invoice = await Invoice.findByPk(invoiceId, { transaction });
      if (!invoice) {
        return false;
      }

      // Calculate total including tax and discount
      const discountAmount = Number(invoice.discountAmount);
      const totalAmount = subtotal + taxAmount - discountAmount;

      // Check if the invoice is paid based on paid amount
      const isPaid = Number(invoice.paidAmount) >= totalAmount;

      // Update the invoice totals
      const [updated] = await Invoice.update(
        {
          subtotal,
          taxAmount,
          totalAmount,
          isPaid,
        },
        {
          where: { id: invoiceId },
          transaction,
        }
      );

      return updated > 0;
    } catch (error) {
      logger.error("Error recalculating invoice totals:", error);
      throw new DatabaseError(
        "Database error while recalculating invoice totals",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, invoiceId },
        }
      );
    }
  }

  /**
   * Find overdue invoices
   */
  public async findOverdueInvoices(): Promise<InvoiceInterface[]> {
    try {
      return await Invoice.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
          isPaid: false,
          status: {
            [Op.notIn]: [InvoiceStatus.CANCELLED, InvoiceStatus.VOID],
          },
        },
        order: [["dueDate", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding overdue invoices:", error);
      throw new DatabaseError("Database error while finding overdue invoices", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update invoice status
   */
  public async updateInvoiceStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Invoice.update(
        { status },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error updating invoice status:", error);
      throw new DatabaseError("Database error while updating invoice status", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, invoiceId: id },
      });
    }
  }
}

// Create and export repository instance
export default new InvoiceRepository();
