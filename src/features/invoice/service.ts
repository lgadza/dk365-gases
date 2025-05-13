import { IInvoiceService, IInvoiceRepository } from "./interfaces/services";
import {
  InvoiceDetailDTO,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  PaginatedInvoiceListDTO,
  InvoiceListQueryParams,
  InvoiceItemDTO,
  CreateInvoiceItemDTO,
  UpdateInvoiceItemDTO,
  InvoicePaymentDTO,
  CreateInvoicePaymentDTO,
  InvoiceDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import Handlebars from "handlebars";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";
import cache from "@/common/utils/cache/cacheUtil";
import { InvoiceStatus } from "./interfaces/interfaces";
import { promises as fs } from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import config from "@/config";
import InvoiceItem from "./invoice-item.model";
import EmailUtil from "@/common/utils/email/emailUtil";

export class InvoiceService implements IInvoiceService {
  private repository: IInvoiceRepository;
  private readonly CACHE_PREFIX = "invoice:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IInvoiceRepository) {
    this.repository = repository;
  }

  /**
   * Get invoice by ID
   */
  public async getInvoiceById(id: string): Promise<InvoiceDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedInvoice = await cache.get(cacheKey);

      if (cachedInvoice) {
        return JSON.parse(cachedInvoice);
      }

      // Get from database if not in cache
      const invoice = await this.repository.findInvoiceById(id);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${id} not found`);
      }

      // Get invoice items and payments
      const items = await this.repository.getInvoiceItemsByInvoiceId(id);
      const payments = await this.repository.getInvoicePaymentsByInvoiceId(id);

      // Map to DTO
      const invoiceDTO = InvoiceDTOMapper.toDetailDTO(invoice, items, payments);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(invoiceDTO), this.CACHE_TTL);

      return invoiceDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getInvoiceById service:", error);
      throw new AppError("Failed to get invoice");
    }
  }

  /**
   * Get invoice by invoice number
   */
  public async getInvoiceByNumber(
    invoiceNumber: string
  ): Promise<InvoiceDetailDTO> {
    try {
      const invoice = await this.repository.findInvoiceByNumber(invoiceNumber);
      if (!invoice) {
        throw new NotFoundError(
          `Invoice with number ${invoiceNumber} not found`
        );
      }

      // Use the existing getInvoiceById method to get the full details
      return this.getInvoiceById(invoice.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getInvoiceByNumber service:", error);
      throw new AppError("Failed to get invoice by number");
    }
  }

  /**
   * Create a new invoice
   */
  public async createInvoice(
    invoiceData: CreateInvoiceDTO
  ): Promise<InvoiceDetailDTO> {
    try {
      // Create the invoice
      const newInvoice = await this.repository.createInvoice(invoiceData);

      // Get the complete invoice
      return this.getInvoiceById(newInvoice.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createInvoice service:", error);
      throw new AppError("Failed to create invoice");
    }
  }

  /**
   * Update an invoice
   */
  public async updateInvoice(
    id: string,
    invoiceData: UpdateInvoiceDTO
  ): Promise<InvoiceDetailDTO> {
    try {
      // Check if invoice exists
      const existingInvoice = await this.repository.findInvoiceById(id);
      if (!existingInvoice) {
        throw new NotFoundError(`Invoice with ID ${id} not found`);
      }

      // Prevent updates to paid or cancelled invoices
      if (
        existingInvoice.status === InvoiceStatus.PAID ||
        existingInvoice.status === InvoiceStatus.CANCELLED ||
        existingInvoice.status === InvoiceStatus.VOID
      ) {
        throw new BadRequestError(
          `Cannot update invoice with status: ${existingInvoice.status}`
        );
      }

      // Update invoice
      await this.repository.updateInvoice(id, invoiceData);

      // Clear cache
      await this.clearInvoiceCache(id);

      // Get the updated invoice
      return this.getInvoiceById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateInvoice service:", error);
      throw new AppError("Failed to update invoice");
    }
  }

  /**
   * Delete an invoice
   */
  public async deleteInvoice(id: string): Promise<boolean> {
    try {
      // Check if invoice exists
      const existingInvoice = await this.repository.findInvoiceById(id);
      if (!existingInvoice) {
        throw new NotFoundError(`Invoice with ID ${id} not found`);
      }

      // Only allow deletion of draft invoices
      if (existingInvoice.status !== InvoiceStatus.DRAFT) {
        throw new BadRequestError("Only draft invoices can be deleted");
      }

      // Delete the invoice
      const result = await this.repository.deleteInvoice(id);

      // Clear cache
      await this.clearInvoiceCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteInvoice service:", error);
      throw new AppError("Failed to delete invoice");
    }
  }

  /**
   * Get paginated invoice list
   */
  public async getInvoiceList(
    params: InvoiceListQueryParams
  ): Promise<PaginatedInvoiceListDTO> {
    try {
      const { invoices, total } = await this.repository.getInvoiceList(params);

      // Map to DTOs
      const invoiceDTOs = invoices.map((invoice) =>
        InvoiceDTOMapper.toSimpleDTO(invoice)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        invoices: invoiceDTOs,
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
      logger.error("Error in getInvoiceList service:", error);
      throw new AppError("Failed to get invoice list");
    }
  }

  /**
   * Get invoices by customer ID
   */
  public async getInvoicesByCustomerId(
    customerId: string
  ): Promise<InvoiceDetailDTO[]> {
    try {
      const invoices = await this.repository.getInvoicesByCustomerId(
        customerId
      );

      // Map each invoice to a full DTO with items and payments
      const invoiceDTOs: InvoiceDetailDTO[] = [];

      for (const invoice of invoices) {
        const items = await this.repository.getInvoiceItemsByInvoiceId(
          invoice.id
        );
        const payments = await this.repository.getInvoicePaymentsByInvoiceId(
          invoice.id
        );
        invoiceDTOs.push(
          InvoiceDTOMapper.toDetailDTO(invoice, items, payments)
        );
      }

      return invoiceDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getInvoicesByCustomerId service:", error);
      throw new AppError("Failed to get customer invoices");
    }
  }

  /**
   * Add an item to an invoice
   */
  public async addInvoiceItem(
    invoiceId: string,
    itemData: CreateInvoiceItemDTO
  ): Promise<InvoiceItemDTO> {
    try {
      // Check if invoice exists
      const invoice = await this.repository.findInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      // Prevent adding items to paid or cancelled invoices
      if (
        invoice.status === InvoiceStatus.PAID ||
        invoice.status === InvoiceStatus.CANCELLED ||
        invoice.status === InvoiceStatus.VOID
      ) {
        throw new BadRequestError(
          `Cannot add items to invoice with status: ${invoice.status}`
        );
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Create the item
        const newItem = await this.repository.createInvoiceItem(
          {
            ...itemData,
            invoiceId,
          },
          transaction
        );

        // Recalculate invoice totals
        await this.repository.recalculateInvoiceTotals(invoiceId, transaction);

        // Commit the transaction
        await transaction.commit();

        // Clear invoice cache
        await this.clearInvoiceCache(invoiceId);

        return InvoiceDTOMapper.toInvoiceItemDTO(newItem);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in addInvoiceItem service:", error);
      throw new AppError("Failed to add invoice item");
    }
  }

  /**
   * Update an invoice item
   */
  public async updateInvoiceItem(
    id: string,
    itemData: UpdateInvoiceItemDTO
  ): Promise<InvoiceItemDTO> {
    try {
      // Find the item first to get the invoice ID
      const item = await InvoiceItem.findByPk(id);
      if (!item) {
        throw new NotFoundError(`Invoice item with ID ${id} not found`);
      }

      const invoiceId = item.invoiceId;

      // Check invoice status
      const invoice = await this.repository.findInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      // Prevent updates to paid or cancelled invoices
      if (
        invoice.status === InvoiceStatus.PAID ||
        invoice.status === InvoiceStatus.CANCELLED ||
        invoice.status === InvoiceStatus.VOID
      ) {
        throw new BadRequestError(
          `Cannot update items for invoice with status: ${invoice.status}`
        );
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Update the item
        await this.repository.updateInvoiceItem(id, itemData, transaction);

        // Recalculate invoice totals
        await this.repository.recalculateInvoiceTotals(invoiceId, transaction);

        // Commit the transaction
        await transaction.commit();

        // Clear invoice cache
        await this.clearInvoiceCache(invoiceId);

        // Get the updated item
        const updatedItem = await InvoiceItem.findByPk(id);
        if (!updatedItem) {
          throw new NotFoundError(
            `Invoice item with ID ${id} not found after update`
          );
        }

        return InvoiceDTOMapper.toInvoiceItemDTO(updatedItem);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateInvoiceItem service:", error);
      throw new AppError("Failed to update invoice item");
    }
  }

  /**
   * Remove an item from an invoice
   */
  public async removeInvoiceItem(id: string): Promise<boolean> {
    try {
      // Find the item first to get the invoice ID
      const item = await InvoiceItem.findByPk(id);
      if (!item) {
        throw new NotFoundError(`Invoice item with ID ${id} not found`);
      }

      const invoiceId = item.invoiceId;

      // Check invoice status
      const invoice = await this.repository.findInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      // Prevent removing items from paid or cancelled invoices
      if (
        invoice.status === InvoiceStatus.PAID ||
        invoice.status === InvoiceStatus.CANCELLED ||
        invoice.status === InvoiceStatus.VOID
      ) {
        throw new BadRequestError(
          `Cannot remove items from invoice with status: ${invoice.status}`
        );
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Delete the item
        const result = await this.repository.deleteInvoiceItem(id, transaction);

        // Recalculate invoice totals
        await this.repository.recalculateInvoiceTotals(invoiceId, transaction);

        // Commit the transaction
        await transaction.commit();

        // Clear invoice cache
        await this.clearInvoiceCache(invoiceId);

        return result;
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in removeInvoiceItem service:", error);
      throw new AppError("Failed to remove invoice item");
    }
  }

  /**
   * Get invoice items
   */
  public async getInvoiceItems(invoiceId: string): Promise<InvoiceItemDTO[]> {
    try {
      // Check if invoice exists
      const invoice = await this.repository.findInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      const items = await this.repository.getInvoiceItemsByInvoiceId(invoiceId);
      return items.map((item) => InvoiceDTOMapper.toInvoiceItemDTO(item));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getInvoiceItems service:", error);
      throw new AppError("Failed to get invoice items");
    }
  }

  /**
   * Add a payment to an invoice
   */
  public async addInvoicePayment(
    invoiceId: string,
    paymentData: CreateInvoicePaymentDTO
  ): Promise<InvoicePaymentDTO> {
    try {
      // Check if invoice exists
      const invoice = await this.repository.findInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      // Prevent adding payments to cancelled or void invoices
      if (
        invoice.status === InvoiceStatus.CANCELLED ||
        invoice.status === InvoiceStatus.VOID
      ) {
        throw new BadRequestError(
          `Cannot add payments to invoice with status: ${invoice.status}`
        );
      }

      // Prevent adding payments that exceed the remaining amount
      const remainingAmount = invoice.totalAmount - invoice.paidAmount;
      if (paymentData.amount > remainingAmount) {
        throw new BadRequestError(
          `Payment amount (${paymentData.amount}) exceeds remaining amount (${remainingAmount})`
        );
      }

      // Create the payment
      const payment = await this.repository.createInvoicePayment({
        ...paymentData,
        invoiceId,
      });

      // Clear invoice cache
      await this.clearInvoiceCache(invoiceId);

      return InvoiceDTOMapper.toInvoicePaymentDTO(payment);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in addInvoicePayment service:", error);
      throw new AppError("Failed to add invoice payment");
    }
  }

  /**
   * Get invoice payments
   */
  public async getInvoicePayments(
    invoiceId: string
  ): Promise<InvoicePaymentDTO[]> {
    try {
      // Check if invoice exists
      const invoice = await this.repository.findInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      const payments = await this.repository.getInvoicePaymentsByInvoiceId(
        invoiceId
      );
      return payments.map((payment) =>
        InvoiceDTOMapper.toInvoicePaymentDTO(payment)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getInvoicePayments service:", error);
      throw new AppError("Failed to get invoice payments");
    }
  }

  /**
   * Generate invoice PDF
   */
  public async generateInvoicePdf(id: string): Promise<Buffer> {
    try {
      // Get the invoice details
      const invoice = await this.getInvoiceById(id);

      // Create a PDF document
      const pdfBuffer: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      // Collect PDF data chunks
      doc.on("data", (chunk) => pdfBuffer.push(chunk));

      // Build PDF content
      // Header
      doc.fontSize(20).text("INVOICE", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Issue Date: ${invoice.issueDate}`);
      doc.text(`Due Date: ${invoice.dueDate}`);
      doc.moveDown();

      // Customer info
      doc.fontSize(14).text("Customer Information");
      doc.fontSize(12).text(`Customer: ${invoice.customerName}`);
      doc.moveDown();

      // Items table
      doc.fontSize(14).text("Invoice Items");
      doc.moveDown(0.5);

      // Table headers
      const tableTop = doc.y;
      const itemCodeX = 50;
      const descriptionX = 150;
      const quantityX = 300;
      const priceX = 350;
      const amountX = 450;

      doc
        .fontSize(10)
        .text("Product", itemCodeX, tableTop)
        .text("Description", descriptionX, tableTop)
        .text("Qty", quantityX, tableTop)
        .text("Price", priceX, tableTop)
        .text("Amount", amountX, tableTop);

      // Items
      let tableRowY = tableTop + 20;

      for (const item of invoice.items) {
        doc
          .fontSize(10)
          .text(item.productName, itemCodeX, tableRowY)
          .text(item.description || "", descriptionX, tableRowY)
          .text(item.quantity.toString(), quantityX, tableRowY)
          .text(item.unitPrice.toFixed(2), priceX, tableRowY)
          .text(item.total.toFixed(2), amountX, tableRowY);

        tableRowY += 20;
      }

      doc.moveDown(2);

      // Totals
      doc
        .fontSize(12)
        .text(`Subtotal: ${invoice.subtotal.toFixed(2)}`, { align: "right" })
        .text(`Tax: ${invoice.taxAmount.toFixed(2)}`, { align: "right" })
        .text(`Discount: ${invoice.discountAmount.toFixed(2)}`, {
          align: "right",
        })
        .text(`Total: ${invoice.totalAmount.toFixed(2)}`, { align: "right" });

      // Payment info
      doc.moveDown(2);
      doc.fontSize(14).text("Payment Information");
      doc.fontSize(12).text(`Payment Terms: ${invoice.paymentTerms}`);
      if (invoice.paymentMethod) {
        doc.text(`Payment Method: ${invoice.paymentMethod}`);
      }
      doc.text(`Paid Amount: ${invoice.paidAmount.toFixed(2)}`);
      doc.text(
        `Balance Due: ${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}`
      );

      // Notes
      if (invoice.notes) {
        doc.moveDown(2);
        doc.fontSize(14).text("Notes");
        doc.fontSize(12).text(invoice.notes);
      }

      // Finalize the PDF
      doc.end();

      // Return the PDF as a Buffer
      return Buffer.concat(pdfBuffer);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in generateInvoicePdf service:", error);
      throw new AppError("Failed to generate invoice PDF");
    }
  }

  /**
   * Send invoice by email
   */
  public async sendInvoiceByEmail(id: string, email: string): Promise<boolean> {
    try {
      // Get the invoice details
      const invoice = await this.getInvoiceById(id);

      // Generate PDF
      const pdfBuffer = await this.generateInvoicePdf(id);

      // Prepare template data
      const items = invoice.items || [];
      const itemsSummary =
        items.length > 0
          ? items
              .slice(0, 3)
              .map((item) => item.productName)
              .join(", ") +
            (items.length > 3 ? ` and ${items.length - 3} more items` : "")
          : "";

      const templateData = {
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        totalAmount: invoice.totalAmount.toFixed(2),
        paymentTerms: invoice.paymentTerms,
        paymentMethod: invoice.paymentMethod,
        itemsSummary,
        portalLink: `${config.frontendUrls.production}/invoices/${invoice.id}`,
        accountingEmail:
          config.company.accountingEmail || "accounting@example.com",
        accountingPhone: config.company.accountingPhone || "+1 (555) 123-4567",
        companyName: config.company.name || "Your Company Name",
        companyAddress:
          config.company.address || "123 Business St, City, Country",
        companyPhone: config.company.phone || "+1 (555) 987-6543",
        companyEmail: config.company.email || "info@example.com",
        companyWebsite: config.company.website || "www.example.com",
        year: new Date().getFullYear(),
      };

      // Render email template
      const emailHtml = await this.renderEmailTemplate("invoice", templateData);

      // Send email with PDF attachment
      const info = await EmailUtil.sendEmail({
        from: config.email.defaultFrom || "accounting@example.com",
        to: email,
        subject: `Invoice ${invoice.invoiceNumber} from ${templateData.companyName}`,
        text: `Please find attached your invoice ${invoice.invoiceNumber} for ${invoice.totalAmount} ${invoice.currency}, due on ${invoice.dueDate}.`,
        html: emailHtml,
        attachments: [
          {
            filename: `Invoice_${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in sendInvoiceByEmail service:", error);
      throw new AppError("Failed to send invoice by email");
    }
  }

  /**
   * Render email template
   */
  private async renderEmailTemplate(
    template: string,
    data: any
  ): Promise<string> {
    try {
      const templatePath = path.join(
        __dirname,
        "../../../templates/email",
        `${template}.hbs`
      );
      const templateContent = await fs.readFile(templatePath, "utf8");
      const compiledTemplate = Handlebars.compile(templateContent);
      return compiledTemplate(data);
    } catch (error) {
      logger.error(`Error rendering email template "${template}":`, error);
      throw new AppError(`Failed to render email template: ${template}`);
    }
  }

  /**
   * Mark invoice as paid
   */
  public async markInvoiceAsPaid(
    id: string,
    paymentData: CreateInvoicePaymentDTO
  ): Promise<InvoiceDetailDTO> {
    try {
      // Check if invoice exists
      const invoice = await this.repository.findInvoiceById(id);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${id} not found`);
      }

      // Check if invoice is already paid
      if (invoice.isPaid) {
        throw new BadRequestError("Invoice is already paid");
      }

      // Check if invoice is cancelled or void
      if (
        invoice.status === InvoiceStatus.CANCELLED ||
        invoice.status === InvoiceStatus.VOID
      ) {
        throw new BadRequestError(
          `Cannot mark as paid an invoice with status: ${invoice.status}`
        );
      }

      // Check if payment amount matches remaining amount
      const remainingAmount = invoice.totalAmount - invoice.paidAmount;
      if (paymentData.amount !== remainingAmount) {
        throw new BadRequestError(
          `Payment amount must equal the remaining amount (${remainingAmount})`
        );
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Add the payment
        await this.repository.createInvoicePayment(
          {
            ...paymentData,
            invoiceId: id,
          },
          transaction
        );

        // Update invoice status
        await this.repository.updateInvoiceStatus(
          id,
          InvoiceStatus.PAID,
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Clear cache
        await this.clearInvoiceCache(id);

        // Get the updated invoice
        return this.getInvoiceById(id);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in markInvoiceAsPaid service:", error);
      throw new AppError("Failed to mark invoice as paid");
    }
  }

  /**
   * Mark invoice as sent
   */
  public async markInvoiceAsSent(id: string): Promise<InvoiceDetailDTO> {
    try {
      // Check if invoice exists
      const invoice = await this.repository.findInvoiceById(id);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${id} not found`);
      }

      // Only draft or issued invoices can be marked as sent
      if (
        invoice.status !== InvoiceStatus.DRAFT &&
        invoice.status !== InvoiceStatus.ISSUED
      ) {
        throw new BadRequestError(
          `Cannot mark as sent an invoice with status: ${invoice.status}`
        );
      }

      // Update the invoice status
      await this.repository.updateInvoiceStatus(id, InvoiceStatus.SENT);

      // Clear cache
      await this.clearInvoiceCache(id);

      // Get the updated invoice
      return this.getInvoiceById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in markInvoiceAsSent service:", error);
      throw new AppError("Failed to mark invoice as sent");
    }
  }

  /**
   * Cancel an invoice
   */
  public async cancelInvoice(
    id: string,
    reason?: string
  ): Promise<InvoiceDetailDTO> {
    try {
      // Check if invoice exists
      const invoice = await this.repository.findInvoiceById(id);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${id} not found`);
      }

      // Only unpaid invoices can be cancelled
      if (invoice.isPaid) {
        throw new BadRequestError("Cannot cancel a paid invoice");
      }

      // Update the invoice status and notes
      const transaction = await db.sequelize.transaction();

      try {
        // Update status
        await this.repository.updateInvoiceStatus(
          id,
          InvoiceStatus.CANCELLED,
          transaction
        );

        // Add cancellation reason to notes if provided
        if (reason) {
          const notes = invoice.notes
            ? `${invoice.notes}\n\nCANCELLATION: ${reason}`
            : `CANCELLATION: ${reason}`;

          await this.repository.updateInvoice(
            id,
            { notes, updatedBy: "system" },
            transaction
          );
        }

        // Commit the transaction
        await transaction.commit();

        // Clear cache
        await this.clearInvoiceCache(id);

        // Get the updated invoice
        return this.getInvoiceById(id);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in cancelInvoice service:", error);
      throw new AppError("Failed to cancel invoice");
    }
  }

  /**
   * Calculate invoice statistics
   */
  public async calculateInvoiceStatistics(
    filters?: Partial<InvoiceListQueryParams>
  ): Promise<{
    totalUnpaid: number;
    totalPaid: number;
    totalOverdue: number;
    averagePaymentTime: number;
  }> {
    try {
      // Get all relevant invoices based on filters
      const { invoices } = await this.repository.getInvoiceList({
        ...filters,
        limit: 1000, // Use a high limit to get most invoices
      });

      // Filter and compute statistics
      const paidInvoices = invoices.filter((inv) => inv.isPaid);
      const unpaidInvoices = invoices.filter(
        (inv) =>
          !inv.isPaid &&
          inv.status !== InvoiceStatus.CANCELLED &&
          inv.status !== InvoiceStatus.VOID
      );
      const overdueInvoices = unpaidInvoices.filter(
        (inv) => new Date(inv.dueDate) < new Date()
      );

      // Calculate totals
      const totalPaid = paidInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount),
        0
      );
      const totalUnpaid = unpaidInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount),
        0
      );
      const totalOverdue = overdueInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount),
        0
      );

      // Calculate average payment time (for paid invoices with paidDate)
      let averagePaymentTime = 0;
      const invoicesWithPaymentTime = paidInvoices.filter(
        (inv) => inv.paidDate
      );

      if (invoicesWithPaymentTime.length > 0) {
        const totalDays = invoicesWithPaymentTime.reduce((sum, inv) => {
          const issueDate = new Date(inv.issueDate);
          const paidDate = new Date(inv.paidDate!);
          const daysDiff = Math.floor(
            (paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + daysDiff;
        }, 0);
        averagePaymentTime = totalDays / invoicesWithPaymentTime.length;
      }

      return {
        totalPaid,
        totalUnpaid,
        totalOverdue,
        averagePaymentTime,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in calculateInvoiceStatistics service:", error);
      throw new AppError("Failed to calculate invoice statistics");
    }
  }

  /**
   * Clear invoice cache
   */
  private async clearInvoiceCache(invoiceId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${invoiceId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new InvoiceService(repository);
