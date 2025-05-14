import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Fleet API endpoints
 */
export const fleetValidationSchemas = {
  // Vehicle validations
  createVehicle: {
    body: Joi.object({
      vehicleType: Joi.string().max(50).required(),
      make: Joi.string().max(100).required(),
      model: Joi.string().max(100).required(),
      year: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .required(),
      vin: Joi.string().max(50).required(),
      licensePlate: Joi.string().max(20).required(),
      status: Joi.string()
        .max(20)
        .valid("active", "maintenance", "out-of-service", "retired")
        .default("active"),
      capacity: Joi.number().optional(),
      capacityUnit: Joi.string().max(20).optional(),
      fuelType: Joi.string().max(30).required(),
      fuelConsumptionRate: Joi.number().optional(),
      purchaseDate: Joi.date().iso().optional(),
      purchaseCost: Joi.number().precision(2).optional(),
      currentMileage: Joi.number().integer().min(0).default(0),
      assignedDriverId: Joi.string().uuid().allow(null).optional(),
      lastMaintenanceDate: Joi.date().iso().optional(),
      nextMaintenanceDate: Joi.date().iso().optional(),
      nextMaintenanceMileage: Joi.number().integer().min(0).optional(),
      notes: Joi.string().optional(),
      registrationExpiryDate: Joi.date().iso().optional(),
      insuranceExpiryDate: Joi.date().iso().optional(),
      insuranceProvider: Joi.string().max(100).optional(),
      insurancePolicyNumber: Joi.string().max(50).optional(),
      gpsTrackingId: Joi.string().max(50).optional(),
    }),
  },

  updateVehicle: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      vehicleType: Joi.string().max(50).optional(),
      make: Joi.string().max(100).optional(),
      model: Joi.string().max(100).optional(),
      year: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
      vin: Joi.string().max(50).optional(),
      licensePlate: Joi.string().max(20).optional(),
      status: Joi.string()
        .max(20)
        .valid("active", "maintenance", "out-of-service", "retired")
        .optional(),
      capacity: Joi.number().optional(),
      capacityUnit: Joi.string().max(20).optional(),
      fuelType: Joi.string().max(30).optional(),
      fuelConsumptionRate: Joi.number().optional(),
      purchaseDate: Joi.date().iso().optional(),
      purchaseCost: Joi.number().precision(2).optional(),
      currentMileage: Joi.number().integer().min(0).optional(),
      assignedDriverId: Joi.string().uuid().allow(null).optional(),
      lastMaintenanceDate: Joi.date().iso().optional(),
      nextMaintenanceDate: Joi.date().iso().optional(),
      nextMaintenanceMileage: Joi.number().integer().min(0).optional(),
      notes: Joi.string().optional(),
      registrationExpiryDate: Joi.date().iso().optional(),
      insuranceExpiryDate: Joi.date().iso().optional(),
      insuranceProvider: Joi.string().max(100).optional(),
      insurancePolicyNumber: Joi.string().max(50).optional(),
      gpsTrackingId: Joi.string().max(50).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  getVehicleById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  deleteVehicle: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  getVehicleList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "make",
          "model",
          "vehicleType",
          "status",
          "currentMileage",
          "nextMaintenanceDate",
          "year",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      status: Joi.string().optional(),
      vehicleType: Joi.string().optional(),
      make: Joi.string().optional(),
      model: Joi.string().optional(),
      year: Joi.number().integer().optional(),
      driverId: Joi.string().uuid().optional(),
      needsMaintenance: Joi.boolean().optional(),
    }),
  },

  updateVehicleStatus: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      status: Joi.string()
        .valid("active", "maintenance", "out-of-service", "retired")
        .required(),
    }),
  },

  updateVehicleMileage: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      mileage: Joi.number().integer().min(0).required(),
    }),
  },

  assignDriverToVehicle: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      driverId: Joi.string().uuid().allow(null).required(),
    }),
  },

  getVehiclesByStatus: {
    query: Joi.object({
      status: Joi.string().required(),
    }),
  },

  getVehiclesByType: {
    query: Joi.object({
      type: Joi.string().required(),
    }),
  },

  // Maintenance validations
  createMaintenance: {
    body: Joi.object({
      vehicleId: Joi.string().uuid().required(),
      serviceDate: Joi.date().iso().required(),
      serviceType: Joi.string().max(50).required(),
      description: Joi.string().required(),
      cost: Joi.number().precision(2).required(),
      serviceProvider: Joi.string().max(100).optional(),
      technician: Joi.string().max(100).optional(),
      mileageAtService: Joi.number().integer().min(0).required(),
      partsReplaced: Joi.string().optional(),
      laborHours: Joi.number().optional(),
      nextServiceDueDate: Joi.date().iso().optional(),
      nextServiceDueMileage: Joi.number().integer().min(0).optional(),
      status: Joi.string()
        .valid("scheduled", "in-progress", "completed")
        .default("completed"),
      notes: Joi.string().optional(),
      invoiceNumber: Joi.string().max(50).optional(),
      workOrderNumber: Joi.string().max(50).optional(),
    }),
  },

  updateMaintenance: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      serviceDate: Joi.date().iso().optional(),
      serviceType: Joi.string().max(50).optional(),
      description: Joi.string().optional(),
      cost: Joi.number().precision(2).optional(),
      serviceProvider: Joi.string().max(100).optional(),
      technician: Joi.string().max(100).optional(),
      mileageAtService: Joi.number().integer().min(0).optional(),
      partsReplaced: Joi.string().optional(),
      laborHours: Joi.number().optional(),
      nextServiceDueDate: Joi.date().iso().optional(),
      nextServiceDueMileage: Joi.number().integer().min(0).optional(),
      status: Joi.string()
        .valid("scheduled", "in-progress", "completed")
        .optional(),
      notes: Joi.string().optional(),
      invoiceNumber: Joi.string().max(50).optional(),
      workOrderNumber: Joi.string().max(50).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  getMaintenanceById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  deleteMaintenance: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  getMaintenanceList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("serviceDate", "serviceType", "cost", "status", "createdAt")
        .default("serviceDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      vehicleId: Joi.string().uuid().optional(),
      serviceType: Joi.string().optional(),
      status: Joi.string().optional(),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
    }),
  },

  getVehicleMaintenanceHistory: {
    params: Joi.object({
      vehicleId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  updateMaintenanceStatus: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      status: Joi.string()
        .valid("scheduled", "in-progress", "completed")
        .required(),
    }),
  },

  getMaintenanceByStatus: {
    query: Joi.object({
      status: Joi.string().required(),
    }),
  },

  scheduleVehicleMaintenance: {
    params: Joi.object({
      vehicleId: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      serviceDate: Joi.date().iso().required(),
      serviceType: Joi.string().max(50).required(),
      description: Joi.string().required(),
      cost: Joi.number().precision(2).required(),
      serviceProvider: Joi.string().max(100).optional(),
      technician: Joi.string().max(100).optional(),
      partsReplaced: Joi.string().optional(),
      laborHours: Joi.number().optional(),
      nextServiceDueDate: Joi.date().iso().optional(),
      nextServiceDueMileage: Joi.number().integer().min(0).optional(),
      notes: Joi.string().optional(),
      invoiceNumber: Joi.string().max(50).optional(),
      workOrderNumber: Joi.string().max(50).optional(),
    }),
  },
};

export default fleetValidationSchemas;
