import { Optional } from "sequelize";

/**
 * Interface for Invoice model
 */
export interface InvoiceInterface {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  billingAddressId: string | null;
  shippingAddressId: string | null;
  issueDate: Date;
  dueDate: Date;
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
  paidDate: Date | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Invoice Item model
 */
export interface InvoiceItemInterface {
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Invoice Payment model
 */
export interface InvoicePaymentInterface {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invoice status enum
 */
export enum InvoiceStatus {
  DRAFT = "draft",
  ISSUED = "issued",
  SENT = "sent",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
  VOID = "void",
}

/**
 * Payment Methods enum
 */
export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  CHECK = "check",
  ONLINE_PAYMENT = "online_payment",
  OTHER = "other",
}
