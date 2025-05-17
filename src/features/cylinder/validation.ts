import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Cylinder API endpoints
 */
export const cylinderValidationSchemas = {
  // Category operations
  createCategory: {
    body: Joi.object({
      categoryName: Joi.string().max(100).required(),
      description: Joi.string().allow(null, "").optional(),
      totalQuantity: Joi.number().integer().min(0).required(),
      filledQuantity: Joi.number().integer().min(0).required(),
      emptyQuantity: Joi.number().integer().min(0).optional(),
      location: Joi.string().max(100).allow(null, "").optional(),
      price: Joi.number().precision(2).min(0).optional(),
      depositAmount: Joi.number().precision(2).min(0).optional(),
      cylinderWeight: Joi.number().precision(2).min(0).optional(),
      gasType: Joi.string().max(50).allow(null, "").optional(),
      status: Joi.string().max(20).default("active").optional(),
      notes: Joi.string().allow(null, "").optional(),
    }),
  },

  updateCategory: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      categoryName: Joi.string().max(100).optional(),
      description: Joi.string().allow(null, "").optional(),
      totalQuantity: Joi.number().integer().min(0).optional(),
      filledQuantity: Joi.number().integer().min(0).optional(),
      emptyQuantity: Joi.number().integer().min(0).optional(),
      location: Joi.string().max(100).allow(null, "").optional(),
      lastRestocked: Joi.date().iso().optional(),
      price: Joi.number().precision(2).min(0).optional(),
      depositAmount: Joi.number().precision(2).min(0).optional(),
      cylinderWeight: Joi.number().precision(2).min(0).optional(),
      gasType: Joi.string().max(50).allow(null, "").optional(),
      status: Joi.string().max(20).optional(),
      notes: Joi.string().allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  getCategoryById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  deleteCategory: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  getCategoryList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "categoryName",
          "totalQuantity",
          "filledQuantity",
          "emptyQuantity",
          "location",
          "lastRestocked",
          "gasType",
          "status",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      location: Joi.string().optional(),
      status: Joi.string().optional(),
      gasType: Joi.string().optional(),
      minFilledQuantity: Joi.number().integer().min(0).optional(),
      maxFilledQuantity: Joi.number().integer().min(0).optional(),
      requiresRestock: Joi.boolean().optional(),
    }),
  },

  // Movement operations
  createMovement: {
    body: Joi.object({
      categoryId: ValidationUtil.SCHEMAS.ID,
      quantity: Joi.number().integer().min(1).required(),
      fromLocation: Joi.string().max(100).required(),
      toLocation: Joi.string().max(100).required(),
      movementType: Joi.string()
        .valid("sale", "exchange", "return", "restock")
        .required(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      driverId: ValidationUtil.SCHEMAS.ID.optional(),
      invoiceId: ValidationUtil.SCHEMAS.ID.optional(),
      timestamp: Joi.date().iso().optional(),
      status: Joi.string()
        .max(20)
        .valid("pending", "in-progress", "completed", "cancelled")
        .default("completed")
        .optional(),
      notes: Joi.string().allow(null, "").optional(),
    }),
  },

  updateMovement: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      quantity: Joi.number().integer().min(1).optional(),
      fromLocation: Joi.string().max(100).optional(),
      toLocation: Joi.string().max(100).optional(),
      movementType: Joi.string()
        .valid("sale", "exchange", "return", "restock")
        .optional(),
      customerId: ValidationUtil.SCHEMAS.ID.optional().allow(null),
      driverId: ValidationUtil.SCHEMAS.ID.optional().allow(null),
      invoiceId: ValidationUtil.SCHEMAS.ID.optional().allow(null),
      timestamp: Joi.date().iso().optional(),
      status: Joi.string()
        .max(20)
        .valid("pending", "in-progress", "completed", "cancelled")
        .optional(),
      notes: Joi.string().allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  getMovementById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  deleteMovement: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  getMovementList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "timestamp",
          "quantity",
          "fromLocation",
          "toLocation",
          "movementType",
          "status",
          "createdAt"
        )
        .default("timestamp"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      categoryId: ValidationUtil.SCHEMAS.ID.optional(),
      movementType: Joi.string().optional(),
      status: Joi.string().optional(),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      driverId: ValidationUtil.SCHEMAS.ID.optional(),
    }),
  },

  getMovementsByCategory: {
    params: Joi.object({
      categoryId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Specialized inventory operations
  performCylinderExchange: {
    body: Joi.object({
      categoryId: ValidationUtil.SCHEMAS.ID,
      filledQuantity: Joi.number().integer().min(1).required(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      driverId: ValidationUtil.SCHEMAS.ID.optional(),
      invoiceId: ValidationUtil.SCHEMAS.ID.optional(),
      notes: Joi.string().allow(null, "").optional(),
    }),
  },

  performCylinderSale: {
    body: Joi.object({
      categoryId: ValidationUtil.SCHEMAS.ID,
      quantity: Joi.number().integer().min(1).required(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      invoiceId: ValidationUtil.SCHEMAS.ID.optional(),
      notes: Joi.string().allow(null, "").optional(),
    }),
  },

  performCylinderReturn: {
    body: Joi.object({
      categoryId: ValidationUtil.SCHEMAS.ID,
      quantity: Joi.number().integer().min(1).required(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      invoiceId: ValidationUtil.SCHEMAS.ID.optional(),
      notes: Joi.string().allow(null, "").optional(),
    }),
  },

  performCylinderRestock: {
    body: Joi.object({
      categoryId: ValidationUtil.SCHEMAS.ID,
      filledQuantity: Joi.number().integer().min(0).required(),
      emptyQuantity: Joi.number().integer().min(0).required(),
      notes: Joi.string().allow(null, "").optional(),
    }).custom((value, helpers) => {
      if (value.filledQuantity === 0 && value.emptyQuantity === 0) {
        return helpers.error("object.min", {
          message:
            "At least one of filledQuantity or emptyQuantity must be greater than zero",
        });
      }
      return value;
    }),
  },

  getCategoriesByLocation: {
    params: Joi.object({
      location: Joi.string().required(),
    }),
  },

  getCategoriesByStatus: {
    params: Joi.object({
      status: Joi.string().required(),
    }),
  },
};

export default cylinderValidationSchemas;
