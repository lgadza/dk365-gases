import {
  InvoiceInterface,
  InvoiceItemInterface,
  InvoicePaymentInterface,
} from "./interfaces";
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
} from "../dto";
import { Transaction } from "sequelize";

export interface IInvoiceRepository {
  /**
   * Find an invoice by ID
   */
  findInvoiceById(id: string): Promise<InvoiceInterface | null>;

  /**
   * Find an invoice by invoice number
   */
  findInvoiceByNumber(invoiceNumber: string): Promise<InvoiceInterface | null>;

  /**
   * Create a new invoice
   */
  createInvoice(
    invoiceData: CreateInvoiceDTO,
    transaction?: Transaction
  ): Promise<InvoiceInterface>;

  /**
   * Update an invoice
   */
  updateInvoice(
    id: string,
    invoiceData: UpdateInvoiceDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete an invoice
   */
  deleteInvoice(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get invoice list with filtering and pagination
   */
  getInvoiceList(params: InvoiceListQueryParams): Promise<{
    invoices: InvoiceInterface[];
    total: number;
  }>;

  /**
   * Get invoices by customer ID
   */
  getInvoicesByCustomerId(customerId: string): Promise<InvoiceInterface[]>;

  /**
   * Create an invoice item
   */
  createInvoiceItem(
    itemData: CreateInvoiceItemDTO,
    transaction?: Transaction
  ): Promise<InvoiceItemInterface>;

  /**
   * Update an invoice item
   */
  updateInvoiceItem(
    id: string,
    itemData: UpdateInvoiceItemDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete an invoice item
   */
  deleteInvoiceItem(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get invoice items by invoice ID
   */
  getInvoiceItemsByInvoiceId(
    invoiceId: string
  ): Promise<InvoiceItemInterface[]>;

  /**
   * Create an invoice payment
   */
  createInvoicePayment(
    paymentData: CreateInvoicePaymentDTO,
    transaction?: Transaction
  ): Promise<InvoicePaymentInterface>;

  /**
   * Get invoice payments by invoice ID
   */
  getInvoicePaymentsByInvoiceId(
    invoiceId: string
  ): Promise<InvoicePaymentInterface[]>;

  /**
   * Recalculate invoice totals
   */
  recalculateInvoiceTotals(
    invoiceId: string,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Find overdue invoices
   */
  findOverdueInvoices(): Promise<InvoiceInterface[]>;

  /**
   * Update invoice status
   */
  updateInvoiceStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean>;
}

export interface IInvoiceService {
  /**
   * Get invoice by ID
   */
  getInvoiceById(id: string): Promise<InvoiceDetailDTO>;

  /**
   * Get invoice by invoice number
   */
  getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceDetailDTO>;

  /**
   * Create a new invoice
   */
  createInvoice(invoiceData: CreateInvoiceDTO): Promise<InvoiceDetailDTO>;

  /**
   * Update an invoice
   */
  updateInvoice(
    id: string,
    invoiceData: UpdateInvoiceDTO
  ): Promise<InvoiceDetailDTO>;

  /**
   * Delete an invoice
   */
  deleteInvoice(id: string): Promise<boolean>;

  /**
   * Get paginated invoice list
   */
  getInvoiceList(
    params: InvoiceListQueryParams
  ): Promise<PaginatedInvoiceListDTO>;

  /**
   * Get invoices by customer ID
   */
  getInvoicesByCustomerId(customerId: string): Promise<InvoiceDetailDTO[]>;

  /**
   * Add an item to an invoice
   */
  addInvoiceItem(
    invoiceId: string,
    itemData: CreateInvoiceItemDTO
  ): Promise<InvoiceItemDTO>;

  /**
   * Update an invoice item
   */
  updateInvoiceItem(
    id: string,
    itemData: UpdateInvoiceItemDTO
  ): Promise<InvoiceItemDTO>;

  /**
   * Remove an item from an invoice
   */
  removeInvoiceItem(id: string): Promise<boolean>;

  /**
   * Get invoice items
   */
  getInvoiceItems(invoiceId: string): Promise<InvoiceItemDTO[]>;

  /**
   * Add a payment to an invoice
   */
  addInvoicePayment(
    invoiceId: string,
    paymentData: CreateInvoicePaymentDTO
  ): Promise<InvoicePaymentDTO>;

  /**
   * Get invoice payments
   */
  getInvoicePayments(invoiceId: string): Promise<InvoicePaymentDTO[]>;

  /**
   * Generate invoice PDF
   */
  generateInvoicePdf(id: string): Promise<Buffer>;

  /**
   * Send invoice by email
   */
  sendInvoiceByEmail(id: string, email: string): Promise<boolean>;

  /**
   * Mark invoice as paid
   */
  markInvoiceAsPaid(
    id: string,
    paymentData: CreateInvoicePaymentDTO
  ): Promise<InvoiceDetailDTO>;

  /**
   * Mark invoice as sent
   */
  markInvoiceAsSent(id: string): Promise<InvoiceDetailDTO>;

  /**
   * Cancel an invoice
   */
  cancelInvoice(id: string, reason?: string): Promise<InvoiceDetailDTO>;

  /**
   * Calculate invoice statistics
   */
  calculateInvoiceStatistics(
    filters?: Partial<InvoiceListQueryParams>
  ): Promise<{
    totalUnpaid: number;
    totalPaid: number;
    totalOverdue: number;
    averagePaymentTime: number;
  }>;
}
