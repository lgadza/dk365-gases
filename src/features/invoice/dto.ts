import {
  InvoiceInterface,
  InvoiceItemInterface,
  InvoicePaymentInterface,
  InvoiceStatus,
} from "./interfaces/interfaces";

/**
 * Base DTO for invoice information
 */
export interface InvoiceBaseDTO {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  billingAddressId: string | null;
  shippingAddressId: string | null;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes: string | null;
  paymentTerms: string;
  paymentMethod: string | null;
  currency: string;
  exchangeRate: number | null;
  isPaid: boolean;
  paidAmount: number;
  paidDate: string | null;
}

/**
 * Detailed invoice DTO with timestamps and items
 */
export interface InvoiceDetailDTO extends InvoiceBaseDTO {
  items: InvoiceItemDTO[];
  payments: InvoicePaymentDTO[];
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple invoice DTO without items
 */
export interface InvoiceSimpleDTO extends InvoiceBaseDTO {
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new invoice
 */
export interface CreateInvoiceDTO {
  customerId: string;
  customerName: string;
  billingAddressId?: string | null;
  shippingAddressId?: string | null;
  issueDate: Date | string;
  dueDate: Date | string;
  status?: string;
  notes?: string | null;
  paymentTerms: string;
  paymentMethod?: string | null;
  currency: string;
  exchangeRate?: number | null;
  discountAmount?: number;
  items?: CreateInvoiceItemDTO[];
  createdBy: string;
}

/**
 * DTO for updating an invoice
 */
export interface UpdateInvoiceDTO {
  customerId?: string;
  customerName?: string;
  billingAddressId?: string | null;
  shippingAddressId?: string | null;
  issueDate?: Date | string;
  dueDate?: Date | string;
  status?: string;
  notes?: string | null;
  paymentTerms?: string;
  paymentMethod?: string | null;
  currency?: string;
  exchangeRate?: number | null;
  discountAmount?: number;
  updatedBy: string;
}

/**
 * Invoice Item DTO
 */
export interface InvoiceItemDTO {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new invoice item
 */
export interface CreateInvoiceItemDTO {
  invoiceId: string;
  productId: string;
  productName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  unitOfMeasurement: string;
  taxRate: number;
}

/**
 * DTO for updating an invoice item
 */
export interface UpdateInvoiceItemDTO {
  productId?: string;
  productName?: string;
  description?: string | null;
  quantity?: number;
  unitPrice?: number;
  unitOfMeasurement?: string;
  taxRate?: number;
}

/**
 * Invoice Payment DTO
 */
export interface InvoicePaymentDTO {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new invoice payment
 */
export interface CreateInvoicePaymentDTO {
  invoiceId: string;
  amount: number;
  paymentDate: Date | string;
  paymentMethod: string;
  reference?: string | null;
  notes?: string | null;
  createdBy: string;
}

/**
 * Query parameters for invoice list
 */
export interface InvoiceListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  isPaid?: boolean;
  isOverdue?: boolean;
}

/**
 * Paginated invoice list response
 */
export interface PaginatedInvoiceListDTO {
  invoices: InvoiceSimpleDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Mapper class for converting between Invoice entities and DTOs
 */
export class InvoiceDTOMapper {
  /**
   * Map Invoice entity to BaseDTO
   */
  public static toBaseDTO(invoice: InvoiceInterface): InvoiceBaseDTO {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      billingAddressId: invoice.billingAddressId,
      shippingAddressId: invoice.shippingAddressId,
      issueDate: invoice.issueDate.toISOString().split("T")[0],
      dueDate: invoice.dueDate.toISOString().split("T")[0],
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      notes: invoice.notes,
      paymentTerms: invoice.paymentTerms,
      paymentMethod: invoice.paymentMethod,
      currency: invoice.currency,
      exchangeRate: invoice.exchangeRate,
      isPaid: invoice.isPaid,
      paidAmount: invoice.paidAmount,
      paidDate: invoice.paidDate ? invoice.paidDate.toISOString() : null,
    };
  }

  /**
   * Map Invoice entity to DetailDTO
   */
  public static toDetailDTO(
    invoice: InvoiceInterface,
    items: InvoiceItemInterface[] = [],
    payments: InvoicePaymentInterface[] = []
  ): InvoiceDetailDTO {
    return {
      ...this.toBaseDTO(invoice),
      items: items.map((item) => this.toInvoiceItemDTO(item)),
      payments: payments.map((payment) => this.toInvoicePaymentDTO(payment)),
      createdBy: invoice.createdBy,
      updatedBy: invoice.updatedBy,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }

  /**
   * Map Invoice entity to SimpleDTO
   */
  public static toSimpleDTO(invoice: InvoiceInterface): InvoiceSimpleDTO {
    return {
      ...this.toBaseDTO(invoice),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }

  /**
   * Map InvoiceItem entity to DTO
   */
  public static toInvoiceItemDTO(item: InvoiceItemInterface): InvoiceItemDTO {
    return {
      id: item.id,
      invoiceId: item.invoiceId,
      productId: item.productId,
      productName: item.productName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unitOfMeasurement: item.unitOfMeasurement,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
      subtotal: item.subtotal,
      total: item.total,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  /**
   * Map InvoicePayment entity to DTO
   */
  public static toInvoicePaymentDTO(
    payment: InvoicePaymentInterface
  ): InvoicePaymentDTO {
    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes,
      createdBy: payment.createdBy,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}
