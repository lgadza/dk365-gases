import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";
import { OrderStatus, PaymentStatus, DeliveryMethod } from "./model";
import { TransactionType, CylinderCondition } from "./order-detail.model";

/**
 * Validation schemas for Order API endpoints
 */
export const orderValidationSchemas = {
  // Create order validation
  createOrder: {
    body: Joi.object({
      customerId: ValidationUtil.SCHEMAS.ID.required(),
      orderStatus: Joi.string()
        .valid(...Object.values(OrderStatus))
        .optional(),
      paymentStatus: Joi.string()
        .valid(...Object.values(PaymentStatus))
        .optional(),
      deliveryMethod: Joi.string()
        .valid(...Object.values(DeliveryMethod))
        .required(),
      deliveryAddressId: ValidationUtil.SCHEMAS.ID.optional(),
      driverId: ValidationUtil.SCHEMAS.ID.optional(),
      notes: Joi.string().max(1000).allow(null, "").optional(),
      orderDetails: Joi.array()
        .items(
          Joi.object({
            cylinderCategoryId: ValidationUtil.SCHEMAS.ID.required(),
            transactionType: Joi.string()
              .valid(...Object.values(TransactionType))
              .required(),
            quantity: Joi.number().integer().min(1).required(),
            unitPrice: Joi.number().min(0).required(),
            cylinderCondition: Joi.string()
              .valid(...Object.values(CylinderCondition))
              .required(),
            notes: Joi.string().max(1000).allow(null, "").optional(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Update order validation
  updateOrder: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      orderStatus: Joi.string()
        .valid(...Object.values(OrderStatus))
        .optional(),
      paymentStatus: Joi.string()
        .valid(...Object.values(PaymentStatus))
        .optional(),
      deliveryMethod: Joi.string()
        .valid(...Object.values(DeliveryMethod))
        .optional(),
      deliveryAddressId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      driverId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      completedAt: Joi.date().allow(null).optional(),
      notes: Joi.string().max(1000).allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get order by ID validation
  getOrderById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete order validation
  deleteOrder: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get order list validation
  getOrderList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "id",
          "customerId",
          "totalAmount",
          "createdAt",
          "updatedAt",
          "orderStatus",
          "paymentStatus"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      driverId: ValidationUtil.SCHEMAS.ID.optional(),
      orderStatus: Joi.string()
        .valid(...Object.values(OrderStatus))
        .optional(),
      paymentStatus: Joi.string()
        .valid(...Object.values(PaymentStatus))
        .optional(),
      deliveryMethod: Joi.string()
        .valid(...Object.values(DeliveryMethod))
        .optional(),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
      minAmount: Joi.number().min(0).optional(),
      maxAmount: Joi.number().min(0).optional(),
    }),
  },

  // Create order detail validation
  addOrderDetail: {
    body: Joi.object({
      orderId: ValidationUtil.SCHEMAS.ID.required(),
      cylinderCategoryId: ValidationUtil.SCHEMAS.ID.required(),
      transactionType: Joi.string()
        .valid(...Object.values(TransactionType))
        .required(),
      quantity: Joi.number().integer().min(1).required(),
      unitPrice: Joi.number().min(0).required(),
      cylinderCondition: Joi.string()
        .valid(...Object.values(CylinderCondition))
        .required(),
      notes: Joi.string().max(1000).allow(null, "").optional(),
    }),
  },

  // Update order detail validation
  updateOrderDetail: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      transactionType: Joi.string()
        .valid(...Object.values(TransactionType))
        .optional(),
      quantity: Joi.number().integer().min(1).optional(),
      unitPrice: Joi.number().min(0).optional(),
      cylinderCondition: Joi.string()
        .valid(...Object.values(CylinderCondition))
        .optional(),
      notes: Joi.string().max(1000).allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Delete order detail validation
  deleteOrderDetail: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get customer orders validation
  getCustomerOrders: {
    params: Joi.object({
      customerId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get driver orders validation
  getDriverOrders: {
    params: Joi.object({
      driverId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Update order status validation
  updateOrderStatus: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      orderStatus: Joi.string()
        .valid(...Object.values(OrderStatus))
        .required(),
      notes: Joi.string().max(1000).allow(null, "").optional(),
    }),
  },

  // Update payment status validation
  updatePaymentStatus: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      paymentStatus: Joi.string()
        .valid(...Object.values(PaymentStatus))
        .required(),
      notes: Joi.string().max(1000).allow(null, "").optional(),
    }),
  },

  // Assign driver validation
  assignDriver: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      driverId: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Complete order validation
  completeOrder: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      notes: Joi.string().max(1000).allow(null, "").optional(),
    }),
  },

  // Cancel order validation
  cancelOrder: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      reason: Joi.string().max(1000).allow(null, "").optional(),
    }),
  },
};

export default orderValidationSchemas;
