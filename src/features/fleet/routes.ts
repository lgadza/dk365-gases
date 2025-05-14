import { Router } from "express";
import fleetController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import fleetValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

/**
 * @swagger
 * components:
 *   schemas:
 *     FleetVehicleDetailDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         vehicleType:
 *           type: string
 *           description: Type of vehicle (delivery, tanker)
 *         make:
 *           type: string
 *           description: Vehicle manufacturer
 *         model:
 *           type: string
 *           description: Vehicle model
 *         year:
 *           type: integer
 *           description: Year of manufacture
 *         vin:
 *           type: string
 *           description: Vehicle Identification Number
 *         licensePlate:
 *           type: string
 *           description: License plate number
 *         status:
 *           type: string
 *           description: Current vehicle status
 *         capacity:
 *           type: number
 *           description: Cargo or tank capacity
 *         capacityUnit:
 *           type: string
 *           description: Unit of capacity measurement
 *         fuelType:
 *           type: string
 *           description: Type of fuel used
 *         fuelConsumptionRate:
 *           type: number
 *           description: Average fuel consumption
 *         purchaseDate:
 *           type: string
 *           format: date
 *         purchaseCost:
 *           type: number
 *         currentMileage:
 *           type: integer
 *         assignedDriverId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         lastMaintenanceDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         nextMaintenanceDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         nextMaintenanceMileage:
 *           type: integer
 *           nullable: true
 *         notes:
 *           type: string
 *           nullable: true
 *         registrationExpiryDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         insuranceExpiryDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         insuranceProvider:
 *           type: string
 *           nullable: true
 *         insurancePolicyNumber:
 *           type: string
 *           nullable: true
 *         gpsTrackingId:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     MaintenanceRecordDetailDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         vehicleId:
 *           type: string
 *           format: uuid
 *         serviceDate:
 *           type: string
 *           format: date
 *         serviceType:
 *           type: string
 *         description:
 *           type: string
 *         cost:
 *           type: number
 *         serviceProvider:
 *           type: string
 *           nullable: true
 *         technician:
 *           type: string
 *           nullable: true
 *         mileageAtService:
 *           type: integer
 *         partsReplaced:
 *           type: string
 *           nullable: true
 *         laborHours:
 *           type: number
 *           nullable: true
 *         nextServiceDueDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         nextServiceDueMileage:
 *           type: integer
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [scheduled, in-progress, completed]
 *         notes:
 *           type: string
 *           nullable: true
 *         invoiceNumber:
 *           type: string
 *           nullable: true
 *         workOrderNumber:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Fleet
 *   description: Fleet vehicle and maintenance management API
 */

// Vehicle Management Routes

/**
 * @swagger
 * /api/v1/fleet/vehicles:
 *   get:
 *     summary: Get a list of fleet vehicles
 *     tags: [Fleet]
 *     description: Retrieve a paginated list of fleet vehicles with filtering options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of vehicles per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering vehicles
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [make, model, vehicleType, status, currentMileage, nextMaintenanceDate, year, createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by vehicle status
 *       - in: query
 *         name: vehicleType
 *         schema:
 *           type: string
 *         description: Filter by vehicle type
 *       - in: query
 *         name: needsMaintenance
 *         schema:
 *           type: boolean
 *         description: Filter for vehicles requiring maintenance
 *     responses:
 *       200:
 *         description: A paginated list of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicles retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vehicles",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(fleetValidationSchemas.getVehicleList),
  asyncHandler(fleetController.getVehicleList)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Fleet]
 *     description: Retrieve detailed information about a fleet vehicle by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vehicles/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(fleetValidationSchemas.getVehicleById),
  asyncHandler(fleetController.getVehicleById)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Fleet]
 *     description: Add a new vehicle to the fleet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleType
 *               - make
 *               - model
 *               - year
 *               - vin
 *               - licensePlate
 *               - fuelType
 *             properties:
 *               vehicleType:
 *                 type: string
 *                 description: Type of vehicle (delivery, tanker, etc.)
 *                 example: delivery
 *               make:
 *                 type: string
 *                 description: Vehicle manufacturer
 *                 example: Ford
 *               model:
 *                 type: string
 *                 description: Vehicle model
 *                 example: F-150
 *               year:
 *                 type: integer
 *                 description: Year of manufacture
 *                 minimum: 1900
 *                 maximum: 2099
 *                 example: 2023
 *               vin:
 *                 type: string
 *                 description: Vehicle Identification Number
 *                 example: 1FTEW1E83MFA12345
 *               licensePlate:
 *                 type: string
 *                 description: Vehicle license plate
 *                 example: ABC123
 *               status:
 *                 type: string
 *                 description: Vehicle status
 *                 enum: [active, maintenance, out-of-service, retired]
 *                 default: active
 *                 example: active
 *               capacity:
 *                 type: number
 *                 description: Cargo or tank capacity
 *                 example: 2000
 *               capacityUnit:
 *                 type: string
 *                 description: Unit of capacity measurement
 *                 example: kg
 *               fuelType:
 *                 type: string
 *                 description: Type of fuel used
 *                 example: diesel
 *               fuelConsumptionRate:
 *                 type: number
 *                 description: Average fuel consumption (L/100km or mpg)
 *                 example: 12.5
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 description: Date vehicle was purchased
 *                 example: 2023-01-15
 *               purchaseCost:
 *                 type: number
 *                 description: Purchase cost of vehicle
 *                 example: 45000
 *               currentMileage:
 *                 type: integer
 *                 description: Current mileage of vehicle
 *                 minimum: 0
 *                 default: 0
 *                 example: 0
 *               assignedDriverId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of assigned driver
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               notes:
 *                 type: string
 *                 description: Additional notes about the vehicle
 *                 example: Used for short-range deliveries
 *               registrationExpiryDate:
 *                 type: string
 *                 format: date
 *                 description: Date vehicle registration expires
 *                 example: 2024-01-15
 *               insuranceExpiryDate:
 *                 type: string
 *                 format: date
 *                 description: Date vehicle insurance expires
 *                 example: 2024-01-15
 *               insuranceProvider:
 *                 type: string
 *                 description: Insurance provider name
 *                 example: ABC Insurance
 *               insurancePolicyNumber:
 *                 type: string
 *                 description: Insurance policy number
 *                 example: POL-123456
 *               gpsTrackingId:
 *                 type: string
 *                 description: ID for GPS tracking system
 *                 example: GPS-789012
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle created successfully
 *                 data:
 *                   $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - VIN already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/vehicles",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.CREATE),
  ValidationUtil.validateRequest(fleetValidationSchemas.createVehicle),
  asyncHandler(fleetController.createVehicle)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Fleet]
 *     description: Update an existing fleet vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               vehicleType:
 *                 type: string
 *                 example: tanker
 *               make:
 *                 type: string
 *                 example: Freightliner
 *               model:
 *                 type: string
 *                 example: Cascadia
 *               year:
 *                 type: integer
 *                 example: 2022
 *               vin:
 *                 type: string
 *                 example: 3ALACXDT5MDLF8765
 *               licensePlate:
 *                 type: string
 *                 example: XYZ789
 *               status:
 *                 type: string
 *                 enum: [active, maintenance, out-of-service, retired]
 *                 example: maintenance
 *               capacity:
 *                 type: number
 *                 example: 15000
 *               capacityUnit:
 *                 type: string
 *                 example: liters
 *               fuelType:
 *                 type: string
 *                 example: diesel
 *               fuelConsumptionRate:
 *                 type: number
 *                 example: 32.5
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 example: 2022-05-15
 *               purchaseCost:
 *                 type: number
 *                 example: 120000
 *               currentMileage:
 *                 type: integer
 *                 example: 15000
 *               assignedDriverId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               notes:
 *                 type: string
 *                 example: Used for long-range gas deliveries
 *               registrationExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-05-15
 *               insuranceExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-05-15
 *               insuranceProvider:
 *                 type: string
 *                 example: XYZ Insurance
 *               insurancePolicyNumber:
 *                 type: string
 *                 example: POL-654321
 *               gpsTrackingId:
 *                 type: string
 *                 example: GPS-345678
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       409:
 *         description: Conflict - VIN already exists
 *       500:
 *         description: Internal server error
 */
router.put(
  "/vehicles/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(fleetValidationSchemas.updateVehicle),
  asyncHandler(fleetController.updateVehicle)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Fleet]
 *     description: Delete a vehicle from the fleet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/vehicles/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.DELETE),
  ValidationUtil.validateRequest(fleetValidationSchemas.deleteVehicle),
  asyncHandler(fleetController.deleteVehicle)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{id}/status:
 *   patch:
 *     summary: Update vehicle status
 *     tags: [Fleet]
 *     description: Update the status of a fleet vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, maintenance, out-of-service, retired]
 *                 description: New vehicle status
 *                 example: maintenance
 *     responses:
 *       200:
 *         description: Vehicle status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/vehicles/:id/status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(fleetValidationSchemas.updateVehicleStatus),
  asyncHandler(fleetController.updateVehicleStatus)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{id}/mileage:
 *   patch:
 *     summary: Update vehicle mileage
 *     tags: [Fleet]
 *     description: Update the current mileage of a fleet vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mileage
 *             properties:
 *               mileage:
 *                 type: integer
 *                 minimum: 0
 *                 description: Current vehicle mileage
 *                 example: 25000
 *     responses:
 *       200:
 *         description: Vehicle mileage updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle mileage updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       400:
 *         description: Bad request - validation error or new mileage less than current
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/vehicles/:id/mileage",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(fleetValidationSchemas.updateVehicleMileage),
  asyncHandler(fleetController.updateVehicleMileage)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{id}/driver:
 *   patch:
 *     summary: Assign a driver to a vehicle
 *     tags: [Fleet]
 *     description: Assign or unassign a driver to/from a fleet vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *             properties:
 *               driverId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID of the driver to assign (null to unassign)
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Driver assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Driver assigned successfully
 *                 data:
 *                   $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/vehicles/:id/driver",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(fleetValidationSchemas.assignDriverToVehicle),
  asyncHandler(fleetController.assignDriverToVehicle)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/status/{status}:
 *   get:
 *     summary: Get vehicles by status
 *     tags: [Fleet]
 *     description: Retrieve all vehicles with a specific status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, maintenance, out-of-service, retired]
 *         description: Status to filter by
 *     responses:
 *       200:
 *         description: List of vehicles with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Vehicles with status 'active' retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vehicles/status/:status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(fleetValidationSchemas.getVehiclesByStatus),
  asyncHandler(fleetController.getVehiclesByStatus)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/type/{type}:
 *   get:
 *     summary: Get vehicles by type
 *     tags: [Fleet]
 *     description: Retrieve all vehicles of a specific type
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle type to filter by (e.g., delivery, tanker)
 *     responses:
 *       200:
 *         description: List of vehicles of the specified type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Vehicles of type 'tanker' retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vehicles/type/:type",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(fleetValidationSchemas.getVehiclesByType),
  asyncHandler(fleetController.getVehiclesByType)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/maintenance/required:
 *   get:
 *     summary: Get vehicles requiring maintenance
 *     tags: [Fleet]
 *     description: Retrieve all vehicles that require maintenance (based on date or mileage)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles requiring maintenance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicles requiring maintenance retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FleetVehicleDetailDTO'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vehicles/maintenance/required",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  asyncHandler(fleetController.getVehiclesRequiringMaintenance)
);

/**
 * @swagger
 * /api/v1/fleet/summary:
 *   get:
 *     summary: Get fleet summary statistics
 *     tags: [Fleet]
 *     description: Retrieve summary statistics about the fleet
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fleet summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Fleet summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     byStatus:
 *                       type: object
 *                       example: {"active": 30, "maintenance": 7, "out-of-service": 5, "retired": 3}
 *                     byType:
 *                       type: object
 *                       example: {"delivery": 25, "tanker": 20}
 *                     requireMaintenance:
 *                       type: integer
 *                       example: 8
 *                     availableVehicles:
 *                       type: integer
 *                       example: 22
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/summary",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  asyncHandler(fleetController.getFleetSummary)
);

// Maintenance Record Routes

/**
 * @swagger
 * /api/v1/fleet/maintenance:
 *   get:
 *     summary: Get a list of maintenance records
 *     tags: [Fleet]
 *     description: Retrieve a paginated list of maintenance records with filtering options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering records
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [serviceDate, serviceType, cost, status, createdAt]
 *           default: serviceDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by vehicle ID
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *         description: Filter by service type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in-progress, completed]
 *         description: Filter by status
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by service date (start date)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by service date (end date)
 *     responses:
 *       200:
 *         description: A paginated list of maintenance records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Maintenance records retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 35
 *                         totalPages:
 *                           type: integer
 *                           example: 4
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/maintenance",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(fleetValidationSchemas.getMaintenanceList),
  asyncHandler(fleetController.getMaintenanceList)
);

/**
 * @swagger
 * /api/v1/fleet/maintenance/{id}:
 *   get:
 *     summary: Get a maintenance record by ID
 *     tags: [Fleet]
 *     description: Retrieve detailed information about a maintenance record by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Maintenance record ID
 *     responses:
 *       200:
 *         description: Maintenance record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Maintenance record retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Maintenance record not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/maintenance/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(fleetValidationSchemas.getMaintenanceById),
  asyncHandler(fleetController.getMaintenanceById)
);

/**
 * @swagger
 * /api/v1/fleet/maintenance:
 *   post:
 *     summary: Create a new maintenance record
 *     tags: [Fleet]
 *     description: Create a new maintenance record for a vehicle
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - serviceDate
 *               - serviceType
 *               - description
 *               - cost
 *               - mileageAtService
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the vehicle
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               serviceDate:
 *                 type: string
 *                 format: date
 *                 description: Date of service
 *                 example: 2023-07-15
 *               serviceType:
 *                 type: string
 *                 description: Type of service performed
 *                 example: Routine Maintenance
 *               description:
 *                 type: string
 *                 description: Detailed description of maintenance
 *                 example: Oil change, filter replacement, and general inspection
 *               cost:
 *                 type: number
 *                 description: Cost of service
 *                 example: 350.75
 *               serviceProvider:
 *                 type: string
 *                 description: Company or person who performed the service
 *                 example: ABC Auto Service
 *               technician:
 *                 type: string
 *                 description: Name of technician
 *                 example: John Smith
 *               mileageAtService:
 *                 type: integer
 *                 description: Vehicle mileage when service was performed
 *                 example: 25000
 *               partsReplaced:
 *                 type: string
 *                 description: List of parts replaced
 *                 example: Oil filter, air filter, wiper blades
 *               laborHours:
 *                 type: number
 *                 description: Hours of labor
 *                 example: 2.5
 *               nextServiceDueDate:
 *                 type: string
 *                 format: date
 *                 description: Date when next service is due
 *                 example: 2023-10-15
 *               nextServiceDueMileage:
 *                 type: integer
 *                 description: Mileage when next service is due
 *                 example: 35000
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed]
 *                 description: Status of the maintenance
 *                 default: completed
 *                 example: completed
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *                 example: Vehicle is performing well, recommend checking brake pads at next service
 *               invoiceNumber:
 *                 type: string
 *                 description: Invoice reference number
 *                 example: INV-12345
 *               workOrderNumber:
 *                 type: string
 *                 description: Work order reference number
 *                 example: WO-67890
 *     responses:
 *       201:
 *         description: Maintenance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Maintenance record created successfully
 *                 data:
 *                   $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/maintenance",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.CREATE),
  ValidationUtil.validateRequest(fleetValidationSchemas.createMaintenance),
  asyncHandler(fleetController.createMaintenance)
);

/**
 * @swagger
 * /api/v1/fleet/maintenance/{id}:
 *   put:
 *     summary: Update a maintenance record
 *     tags: [Fleet]
 *     description: Update an existing maintenance record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Maintenance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               serviceDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-07-20
 *               serviceType:
 *                 type: string
 *                 example: Repair
 *               description:
 *                 type: string
 *                 example: Replaced brake pads and rotors
 *               cost:
 *                 type: number
 *                 example: 650.50
 *               serviceProvider:
 *                 type: string
 *                 example: XYZ Auto Repair
 *               technician:
 *                 type: string
 *                 example: Robert Johnson
 *               mileageAtService:
 *                 type: integer
 *                 example: 26000
 *               partsReplaced:
 *                 type: string
 *                 example: Front and rear brake pads, rotors
 *               laborHours:
 *                 type: number
 *                 example: 4.0
 *               nextServiceDueDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-10-20
 *               nextServiceDueMileage:
 *                 type: integer
 *                 example: 36000
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed]
 *                 example: completed
 *               notes:
 *                 type: string
 *                 example: Brake system now in excellent condition
 *               invoiceNumber:
 *                 type: string
 *                 example: INV-67890
 *               workOrderNumber:
 *                 type: string
 *                 example: WO-12345
 *     responses:
 *       200:
 *         description: Maintenance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Maintenance record updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Maintenance record not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/maintenance/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(fleetValidationSchemas.updateMaintenance),
  asyncHandler(fleetController.updateMaintenance)
);

/**
 * @swagger
 * /api/v1/fleet/maintenance/{id}:
 *   delete:
 *     summary: Delete a maintenance record
 *     tags: [Fleet]
 *     description: Delete a maintenance record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Maintenance record ID
 *     responses:
 *       200:
 *         description: Maintenance record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Maintenance record deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Maintenance record not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/maintenance/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.DELETE),
  ValidationUtil.validateRequest(fleetValidationSchemas.deleteMaintenance),
  asyncHandler(fleetController.deleteMaintenance)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{vehicleId}/maintenance:
 *   get:
 *     summary: Get maintenance history for a vehicle
 *     tags: [Fleet]
 *     description: Retrieve the complete maintenance history for a specific vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle maintenance history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle maintenance history retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/vehicles/:vehicleId/maintenance",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(
    fleetValidationSchemas.getVehicleMaintenanceHistory
  ),
  asyncHandler(fleetController.getVehicleMaintenanceHistory)
);

/**
 * @swagger
 * /api/v1/fleet/maintenance/{id}/status:
 *   patch:
 *     summary: Update maintenance record status
 *     tags: [Fleet]
 *     description: Update the status of a maintenance record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Maintenance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed]
 *                 description: New maintenance status
 *                 example: in-progress
 *     responses:
 *       200:
 *         description: Maintenance status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Maintenance status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Maintenance record not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/maintenance/:id/status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    fleetValidationSchemas.updateMaintenanceStatus
  ),
  asyncHandler(fleetController.updateMaintenanceStatus)
);

/**
 * @swagger
 * /api/v1/fleet/maintenance/upcoming:
 *   get:
 *     summary: Get upcoming maintenance schedule
 *     tags: [Fleet]
 *     description: Retrieve the schedule of upcoming maintenance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming maintenance schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Upcoming maintenance schedule retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     upcoming:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *                     overdue:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *                     inProgress:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         upcoming:
 *                           type: integer
 *                           example: 12
 *                         overdue:
 *                           type: integer
 *                           example: 3
 *                         inProgress:
 *                           type: integer
 *                           example: 5
 *                         completed:
 *                           type: integer
 *                           example: 25
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/maintenance/upcoming",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  asyncHandler(fleetController.getUpcomingMaintenanceSchedule)
);

/**
 * @swagger
 * /api/v1/fleet/maintenance/status:
 *   get:
 *     summary: Get maintenance records by status
 *     tags: [Fleet]
 *     description: Retrieve maintenance records with a specific status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [scheduled, in-progress, completed]
 *         description: Status to filter by
 *     responses:
 *       200:
 *         description: Maintenance records with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Maintenance records with status 'scheduled' retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *       400:
 *         description: Bad request - missing status parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/maintenance/status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.READ),
  ValidationUtil.validateRequest(fleetValidationSchemas.getMaintenanceByStatus),
  asyncHandler(fleetController.getMaintenanceByStatus)
);

/**
 * @swagger
 * /api/v1/fleet/vehicles/{vehicleId}/maintenance/schedule:
 *   post:
 *     summary: Schedule maintenance for a vehicle
 *     tags: [Fleet]
 *     description: Schedule a new maintenance service for a specific vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceDate
 *               - serviceType
 *               - description
 *               - cost
 *             properties:
 *               serviceDate:
 *                 type: string
 *                 format: date
 *                 description: Scheduled date of service
 *                 example: 2023-12-15
 *               serviceType:
 *                 type: string
 *                 description: Type of service to be performed
 *                 example: Annual Inspection
 *               description:
 *                 type: string
 *                 description: Detailed description of planned maintenance
 *                 example: Complete vehicle inspection and fluids change
 *               cost:
 *                 type: number
 *                 description: Estimated cost of service
 *                 example: 450.00
 *               serviceProvider:
 *                 type: string
 *                 description: Company or person who will perform the service
 *                 example: Premium Auto Service
 *               nextServiceDueDate:
 *                 type: string
 *                 format: date
 *                 description: Date when next service would be due after this one
 *                 example: 2024-06-15
 *               nextServiceDueMileage:
 *                 type: integer
 *                 description: Mileage when next service would be due after this one
 *                 example: 45000
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *                 example: Schedule for morning appointment if possible
 *     responses:
 *       201:
 *         description: Maintenance scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle maintenance scheduled successfully
 *                 data:
 *                   $ref: '#/components/schemas/MaintenanceRecordDetailDTO'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/vehicles/:vehicleId/maintenance/schedule",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("fleet", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    fleetValidationSchemas.scheduleVehicleMaintenance
  ),
  asyncHandler(fleetController.scheduleVehicleMaintenance)
);

export default router;
