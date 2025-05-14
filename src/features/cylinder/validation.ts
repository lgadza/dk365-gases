import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";
import {
  CylinderStatus,
  CylinderMovementType,
  GasType,
  CylinderMaterial,
  ValveType,
} from "./interfaces/interfaces";

/**
 * Validation schemas for Cylinder API endpoints
 */
export const cylinderValidationSchemas = {
  // Create cylinder validation
  createCylinder: {
    body: Joi.object({
      serialNumber: Joi.string().max(50).required(),
      cylinderTypeId: ValidationUtil.SCHEMAS.ID.required(),
      manufacturerId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      manufacturerName: Joi.string().max(100).allow(null, "").optional(),
      manufacturingDate: Joi.date().allow(null).optional(),
      lastInspectionDate: Joi.date().allow(null).optional(),
      nextInspectionDate: Joi.date().allow(null).optional(),
      capacity: Joi.number().positive().required(),
      color: Joi.string().max(50).allow(null, "").optional(),
      status: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .default(CylinderStatus.AVAILABLE),
      location: Joi.string().max(100).allow(null, "").optional(),
      currentGasType: Joi.string()
        .valid(...Object.values(GasType))
        .allow(null, "")
        .optional(),
      fillLevel: Joi.number().min(0).allow(null).optional(),
      tare: Joi.number().min(0).allow(null).optional(),
      valveType: Joi.string()
        .valid(...Object.values(ValveType))
        .allow(null, "")
        .optional(),
      currentPressure: Joi.number().min(0).allow(null).optional(),
      maxPressure: Joi.number().min(0).allow(null).optional(),
      batchNumber: Joi.string().max(50).allow(null, "").optional(),
      notes: Joi.string().allow(null, "").optional(),
      barcode: Joi.string().max(100).allow(null, "").optional(),
      rfidTag: Joi.string().max(100).allow(null, "").optional(),
      isActive: Joi.boolean().default(true),
      lastFilled: Joi.date().allow(null).optional(),
      lastLeakTest: Joi.date().allow(null).optional(),
      lastMaintenanceDate: Joi.date().allow(null).optional(),
      maintenanceDueDate: Joi.date().allow(null).optional(),
      assignedCustomerId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      assignedCustomerName: Joi.string().max(100).allow(null, "").optional(),
      createdBy: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Update cylinder validation
  updateCylinder: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      cylinderTypeId: ValidationUtil.SCHEMAS.ID.optional(),
      manufacturerId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      manufacturerName: Joi.string().max(100).allow(null, "").optional(),
      manufacturingDate: Joi.date().allow(null).optional(),
      lastInspectionDate: Joi.date().allow(null).optional(),
      nextInspectionDate: Joi.date().allow(null).optional(),
      capacity: Joi.number().positive().optional(),
      color: Joi.string().max(50).allow(null, "").optional(),
      status: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .optional(),
      location: Joi.string().max(100).allow(null, "").optional(),
      currentGasType: Joi.string()
        .valid(...Object.values(GasType))
        .allow(null, "")
        .optional(),
      fillLevel: Joi.number().min(0).allow(null).optional(),
      tare: Joi.number().min(0).allow(null).optional(),
      valveType: Joi.string()
        .valid(...Object.values(ValveType))
        .allow(null, "")
        .optional(),
      currentPressure: Joi.number().min(0).allow(null).optional(),
      maxPressure: Joi.number().min(0).allow(null).optional(),
      batchNumber: Joi.string().max(50).allow(null, "").optional(),
      notes: Joi.string().allow(null, "").optional(),
      barcode: Joi.string().max(100).allow(null, "").optional(),
      rfidTag: Joi.string().max(100).allow(null, "").optional(),
      isActive: Joi.boolean().optional(),
      lastFilled: Joi.date().allow(null).optional(),
      lastLeakTest: Joi.date().allow(null).optional(),
      lastMaintenanceDate: Joi.date().allow(null).optional(),
      maintenanceDueDate: Joi.date().allow(null).optional(),
      assignedCustomerId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      assignedCustomerName: Joi.string().max(100).allow(null, "").optional(),
      updatedBy: ValidationUtil.SCHEMAS.ID.required(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get cylinder by ID validation
  getCylinderById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinder by serial number validation
  getCylinderBySerialNumber: {
    params: Joi.object({
      serialNumber: Joi.string().required(),
    }),
  },

  // Delete cylinder validation
  deleteCylinder: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinder list validation
  getCylinderList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "serialNumber",
          "status",
          "location",
          "capacity",
          "currentGasType",
          "nextInspectionDate",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      status: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .optional(),
      gasType: Joi.string()
        .valid(...Object.values(GasType))
        .optional(),
      location: Joi.string().optional(),
      cylinderTypeId: ValidationUtil.SCHEMAS.ID.optional(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      isActive: Joi.boolean().optional(),
      needsInspection: Joi.boolean().optional(),
      needsMaintenance: Joi.boolean().optional(),
    }),
  },

  // Get cylinders by type ID validation
  getCylindersByTypeId: {
    params: Joi.object({
      typeId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinders by customer ID validation
  getCylindersByCustomerId: {
    params: Joi.object({
      customerId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinders by status validation
  getCylindersByStatus: {
    params: Joi.object({
      status: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .required(),
    }),
  },

  // Get cylinders for inspection validation
  getCylindersForInspection: {
    query: Joi.object({
      daysThreshold: Joi.number().integer().min(1).max(365).default(30),
    }),
  },

  // Update cylinder status validation
  updateCylinderStatus: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      status: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .required(),
    }),
  },

  // Create cylinder type validation
  createCylinderType: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      description: Joi.string().allow(null, "").optional(),
      capacity: Joi.number().positive().required(),
      gasType: Joi.string()
        .valid(...Object.values(GasType))
        .required(),
      material: Joi.string()
        .valid(...Object.values(CylinderMaterial))
        .required(),
      height: Joi.number().positive().allow(null).optional(),
      diameter: Joi.number().positive().allow(null).optional(),
      weight: Joi.number().positive().allow(null).optional(),
      color: Joi.string().max(50).allow(null, "").optional(),
      valveType: Joi.string()
        .valid(...Object.values(ValveType))
        .allow(null, "")
        .optional(),
      standardPressure: Joi.number().positive().allow(null).optional(),
      maxPressure: Joi.number().positive().allow(null).optional(),
      image: Joi.string().max(255).allow(null, "").optional(),
      isActive: Joi.boolean().default(true),
      createdBy: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Update cylinder type validation
  updateCylinderType: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      description: Joi.string().allow(null, "").optional(),
      capacity: Joi.number().positive().optional(),
      gasType: Joi.string()
        .valid(...Object.values(GasType))
        .optional(),
      material: Joi.string()
        .valid(...Object.values(CylinderMaterial))
        .optional(),
      height: Joi.number().positive().allow(null).optional(),
      diameter: Joi.number().positive().allow(null).optional(),
      weight: Joi.number().positive().allow(null).optional(),
      color: Joi.string().max(50).allow(null, "").optional(),
      valveType: Joi.string()
        .valid(...Object.values(ValveType))
        .allow(null, "")
        .optional(),
      standardPressure: Joi.number().positive().allow(null).optional(),
      maxPressure: Joi.number().positive().allow(null).optional(),
      image: Joi.string().max(255).allow(null, "").optional(),
      isActive: Joi.boolean().optional(),
      updatedBy: ValidationUtil.SCHEMAS.ID.required(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get cylinder type by ID validation
  getCylinderTypeById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete cylinder type validation
  deleteCylinderType: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinder type list validation
  getCylinderTypeList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "capacity", "gasType", "material", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      gasType: Joi.string()
        .valid(...Object.values(GasType))
        .optional(),
      material: Joi.string()
        .valid(...Object.values(CylinderMaterial))
        .optional(),
      isActive: Joi.boolean().optional(),
    }),
  },

  // Record cylinder movement validation
  recordCylinderMovement: {
    body: Joi.object({
      cylinderId: ValidationUtil.SCHEMAS.ID.required(),
      movementType: Joi.string()
        .valid(...Object.values(CylinderMovementType))
        .required(),
      fromLocation: Joi.string().max(100).allow(null, "").optional(),
      toLocation: Joi.string().max(100).allow(null, "").optional(),
      fromStatus: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .allow(null)
        .optional(),
      toStatus: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .required(),
      quantity: Joi.number().integer().min(1).default(1),
      transactionDate: Joi.date().default(Date.now),
      customerId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      customerName: Joi.string().max(100).allow(null, "").optional(),
      invoiceId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      invoiceNumber: Joi.string().max(50).allow(null, "").optional(),
      performedBy: ValidationUtil.SCHEMAS.ID.required(),
      notes: Joi.string().allow(null, "").optional(),
      createdBy: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Update cylinder movement validation
  updateCylinderMovement: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      movementType: Joi.string()
        .valid(...Object.values(CylinderMovementType))
        .optional(),
      fromLocation: Joi.string().max(100).allow(null, "").optional(),
      toLocation: Joi.string().max(100).allow(null, "").optional(),
      fromStatus: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .allow(null)
        .optional(),
      toStatus: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .optional(),
      quantity: Joi.number().integer().min(1).optional(),
      transactionDate: Joi.date().optional(),
      customerId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      customerName: Joi.string().max(100).allow(null, "").optional(),
      invoiceId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      invoiceNumber: Joi.string().max(50).allow(null, "").optional(),
      performedBy: ValidationUtil.SCHEMAS.ID.optional(),
      notes: Joi.string().allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Delete cylinder movement validation
  deleteCylinderMovement: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinder movement by ID validation
  getCylinderMovementById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinder movements by cylinder ID validation
  getCylinderMovementsByCylinderId: {
    params: Joi.object({
      cylinderId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get cylinder movement list validation
  getCylinderMovementList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "transactionDate",
          "movementType",
          "cylinderId",
          "fromLocation",
          "toLocation",
          "createdAt"
        )
        .default("transactionDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      cylinderId: ValidationUtil.SCHEMAS.ID.optional(),
      movementType: Joi.string()
        .valid(...Object.values(CylinderMovementType))
        .optional(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().min(Joi.ref("startDate")).optional(),
    }),
  },

  // Generate cylinder QR code validation
  generateCylinderQRCode: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Generate cylinder barcode validation
  generateCylinderBarcode: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Generate inventory report validation
  generateInventoryReport: {
    query: Joi.object({
      status: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .optional(),
      gasType: Joi.string()
        .valid(...Object.values(GasType))
        .optional(),
      location: Joi.string().optional(),
      cylinderTypeId: ValidationUtil.SCHEMAS.ID.optional(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      isActive: Joi.boolean().optional(),
      needsInspection: Joi.boolean().optional(),
      needsMaintenance: Joi.boolean().optional(),
    }),
  },

  // Export cylinders to CSV validation
  exportCylindersToCSV: {
    query: Joi.object({
      status: Joi.string()
        .valid(...Object.values(CylinderStatus))
        .optional(),
      gasType: Joi.string()
        .valid(...Object.values(GasType))
        .optional(),
      location: Joi.string().optional(),
      cylinderTypeId: ValidationUtil.SCHEMAS.ID.optional(),
      customerId: ValidationUtil.SCHEMAS.ID.optional(),
      isActive: Joi.boolean().optional(),
      needsInspection: Joi.boolean().optional(),
      needsMaintenance: Joi.boolean().optional(),
    }),
  },

  // Calculate cylinder statistics validation
  calculateCylinderStats: {
    query: Joi.object({}),
  },

  /**
   * Search cylinder types schema
   */
  searchCylinderTypes: {
    body: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().optional(),
      sortBy: Joi.string().optional(),
      sortOrder: Joi.string().valid("asc", "desc").optional(),

      // Enhanced search parameters
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      gasType: Joi.string().optional(),
      material: Joi.string().optional(),
      minCapacity: Joi.number().optional(),
      maxCapacity: Joi.number().optional(),
      valveType: Joi.string().optional(),
      color: Joi.string().optional(),
      minWeight: Joi.number().optional(),
      maxWeight: Joi.number().optional(),
      minHeight: Joi.number().optional(),
      maxHeight: Joi.number().optional(),
      minDiameter: Joi.number().optional(),
      maxDiameter: Joi.number().optional(),
      isActive: Joi.boolean().optional(),
    }),
  },
};

export default cylinderValidationSchemas;
