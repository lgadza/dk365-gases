import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";
import { InvoiceStatus, PaymentMethod } from "./interfaces/interfaces";

/**
 * Validation schemas for Invoice API endpoints
 */
export const invoiceValidationSchemas = {
  // Create invoice validation
  createInvoice: {
    body: Joi.object({
      customerId: ValidationUtil.SCHEMAS.ID.required(),
      customerName: Joi.string().max(255).required(),
      billingAddressId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      shippingAddressId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      issueDate: Joi.date().required(),
      dueDate: Joi.date().min(Joi.ref("issueDate")).required(),
      status: Joi.string()
        .valid(...Object.values(InvoiceStatus))
        .default(InvoiceStatus.DRAFT),
      notes: Joi.string().allow(null, "").optional(),
      paymentTerms: Joi.string().max(100).required(),
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .allow(null)
        .optional(),
      currency: Joi.string().max(3).default("USD"),
      exchangeRate: Joi.number().positive().precision(6).allow(null).optional(),
      discountAmount: Joi.number().min(0).default(0),
      items: Joi.array()
        .items(
          Joi.object({
            productId: ValidationUtil.SCHEMAS.ID.required(),
            productName: Joi.string().max(255).required(),
            description: Joi.string().allow(null, "").optional(),
            quantity: Joi.number().positive().required(),
            unitPrice: Joi.number().min(0).required(),
            unitOfMeasurement: Joi.string().max(20).default("unit"),
            taxRate: Joi.number().min(0).max(100).default(0),
          })
        )
        .min(1),
      createdBy: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Update invoice validation
  updateInvoice: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      customerName: Joi.string().max(255).optional(),
      billingAddressId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      shippingAddressId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      issueDate: Joi.date().optional(),
      dueDate: Joi.date().optional(),
      status: Joi.string()
        .valid(...Object.values(InvoiceStatus))
        .optional(),
      notes: Joi.string().allow(null, "").optional(),
      paymentTerms: Joi.string().max(100).optional(),
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .allow(null)
        .optional(),
      currency: Joi.string().max(3).optional(),
      exchangeRate: Joi.number().positive().precision(6).allow(null).optional(),
      discountAmount: Joi.number().min(0).optional(),
      updatedBy: ValidationUtil.SCHEMAS.ID.required(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get invoice by ID validation
  getInvoiceById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get invoice by invoice number validation
  getInvoiceByNumber: {
    params: Joi.object({
      invoiceNumber: Joi.string().required(),
    }),
  },

  // Delete invoice validation
  deleteInvoice: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get invoice list validation
  getInvoiceList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "invoiceNumber",
          "customerName",
          "issueDate",
          "dueDate",
          "status",
          "totalAmount",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      status: Joi.string()
        .valid(...Object.values(InvoiceStatus))
        .optional(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().min(Joi.ref("startDate")).optional(),
      minAmount: Joi.number().min(0).optional(),
      maxAmount: Joi.number().min(Joi.ref("minAmount")).optional(),
      isPaid: Joi.boolean().optional(),
      isOverdue: Joi.boolean().optional(),
    }),
  },

  // Get invoices by customer ID
  getInvoicesByCustomerId: {
    params: Joi.object({
      customerId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Add invoice item validation
  addInvoiceItem: {
    params: Joi.object({
      invoiceId: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      productId: ValidationUtil.SCHEMAS.ID.required(),
      productName: Joi.string().max(255).required(),
      description: Joi.string().allow(null, "").optional(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().min(0).required(),
      unitOfMeasurement: Joi.string().max(20).default("unit"),
      taxRate: Joi.number().min(0).max(100).default(0),
    }),
  },

  // Update invoice item validation
  updateInvoiceItem: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      productId: ValidationUtil.SCHEMAS.ID.optional(),
      productName: Joi.string().max(255).optional(),
      description: Joi.string().allow(null, "").optional(),
      quantity: Joi.number().positive().optional(),
      unitPrice: Joi.number().min(0).optional(),
      unitOfMeasurement: Joi.string().max(20).optional(),
      taxRate: Joi.number().min(0).max(100).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Delete invoice item validation
  deleteInvoiceItem: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get invoice items validation
  getInvoiceItems: {
    params: Joi.object({
      invoiceId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Add payment validation
  addInvoicePayment: {
    params: Joi.object({
      invoiceId: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      amount: Joi.number().positive().required(),
      paymentDate: Joi.date().required(),
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .required(),
      reference: Joi.string().max(100).allow(null, "").optional(),
      notes: Joi.string().allow(null, "").optional(),
      createdBy: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Get invoice payments validation
  getInvoicePayments: {
    params: Joi.object({
      invoiceId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Generate invoice PDF validation
  generateInvoicePdf: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Send invoice by email validation
  sendInvoiceByEmail: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  // Mark invoice as paid validation
  markInvoiceAsPaid: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      amount: Joi.number().positive().required(),
      paymentDate: Joi.date().required(),
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .required(),
      reference: Joi.string().max(100).allow(null, "").optional(),
      notes: Joi.string().allow(null, "").optional(),
      createdBy: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Mark invoice as sent validation
  markInvoiceAsSent: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Cancel invoice validation
  cancelInvoice: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      reason: Joi.string().allow(null, "").optional(),
    }),
  },

  // Calculate invoice statistics validation
  calculateInvoiceStatistics: {
    query: Joi.object({
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().min(Joi.ref("startDate")).optional(),
    }),
  },
};

export default invoiceValidationSchemas;
