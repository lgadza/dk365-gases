import { Router } from "express";
import cylinderController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import cylinderValidationSchemas from "./validation";
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
 * tags:
 *   name: Cylinders
 *   description: Cylinder inventory management API
 */

// Category routes
/**
 * @swagger
 * /api/v1/cylinders/categories:
 *   get:
 *     summary: Get a list of cylinder categories
 *     tags: [Cylinders]
 *     description: Retrieve a paginated list of cylinder categories with filtering options
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
 *         description: Number of categories per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering categories
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [categoryName, totalQuantity, filledQuantity, emptyQuantity, location, lastRestocked, gasType, status, createdAt]
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
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: gasType
 *         schema:
 *           type: string
 *         description: Filter by gas type
 *       - in: query
 *         name: requiresRestock
 *         schema:
 *           type: boolean
 *         description: Filter to show only categories requiring restock
 *     responses:
 *       200:
 *         description: A paginated list of cylinder categories
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/categories",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCategoryList),
  asyncHandler(cylinderController.getCategoryList)
);

/**
 * @swagger
 * /api/v1/cylinders/categories/{id}:
 *   get:
 *     summary: Get cylinder category by ID
 *     tags: [Cylinders]
 *     description: Retrieve detailed information about a cylinder category by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Cylinder category details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/categories/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCategoryById),
  asyncHandler(cylinderController.getCategoryById)
);

/**
 * @swagger
 * /api/v1/cylinders/categories:
 *   post:
 *     summary: Create a new cylinder category
 *     tags: [Cylinders]
 *     description: Create a new cylinder category with initial quantities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - totalQuantity
 *               - filledQuantity
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: 5kg Standard
 *               description:
 *                 type: string
 *                 example: Standard 5kg propane cylinders
 *               totalQuantity:
 *                 type: integer
 *                 example: 100
 *               filledQuantity:
 *                 type: integer
 *                 example: 80
 *               emptyQuantity:
 *                 type: integer
 *                 example: 20
 *               location:
 *                 type: string
 *                 example: Main Warehouse
 *               price:
 *                 type: number
 *                 example: 45.99
 *               depositAmount:
 *                 type: number
 *                 example: 20.00
 *               cylinderWeight:
 *                 type: number
 *                 example: 5.0
 *               gasType:
 *                 type: string
 *                 example: Propane
 *               status:
 *                 type: string
 *                 enum: [active, inactive, discontinued]
 *                 example: active
 *               notes:
 *                 type: string
 *                 example: Regular stock item
 *     responses:
 *       201:
 *         description: Cylinder category created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/categories",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.createCategory),
  asyncHandler(cylinderController.createCategory)
);

/**
 * @swagger
 * /api/v1/cylinders/categories/{id}:
 *   put:
 *     summary: Update a cylinder category
 *     tags: [Cylinders]
 *     description: Update an existing cylinder category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: 5kg Premium
 *               description:
 *                 type: string
 *                 example: Premium 5kg propane cylinders
 *               totalQuantity:
 *                 type: integer
 *                 example: 120
 *               filledQuantity:
 *                 type: integer
 *                 example: 90
 *               emptyQuantity:
 *                 type: integer
 *                 example: 30
 *               location:
 *                 type: string
 *                 example: East Warehouse
 *               price:
 *                 type: number
 *                 example: 49.99
 *               depositAmount:
 *                 type: number
 *                 example: 25.00
 *               cylinderWeight:
 *                 type: number
 *                 example: 5.0
 *               gasType:
 *                 type: string
 *                 example: Propane
 *               status:
 *                 type: string
 *                 enum: [active, inactive, discontinued]
 *                 example: active
 *               notes:
 *                 type: string
 *                 example: Premium stock item
 *     responses:
 *       200:
 *         description: Cylinder category updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/categories/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.updateCategory),
  asyncHandler(cylinderController.updateCategory)
);

/**
 * @swagger
 * /api/v1/cylinders/categories/{id}:
 *   delete:
 *     summary: Delete a cylinder category
 *     tags: [Cylinders]
 *     description: Delete a cylinder category if it's not in use
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Cylinder category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       409:
 *         description: Conflict - category has associated movements
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/categories/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.DELETE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.deleteCategory),
  asyncHandler(cylinderController.deleteCategory)
);

// Movement routes
/**
 * @swagger
 * /api/v1/cylinders/movements:
 *   get:
 *     summary: Get a list of cylinder movements
 *     tags: [Cylinders]
 *     description: Retrieve a paginated list of cylinder movements with filtering options
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
 *         description: Number of movements per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering movements
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [timestamp, quantity, fromLocation, toLocation, movementType, status, createdAt]
 *           default: timestamp
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: movementType
 *         schema:
 *           type: string
 *           enum: [sale, exchange, return, restock]
 *         description: Filter by movement type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by customer ID
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by driver ID
 *     responses:
 *       200:
 *         description: A paginated list of cylinder movements
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/movements",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getMovementList),
  asyncHandler(cylinderController.getMovementList)
);

/**
 * @swagger
 * /api/v1/cylinders/movements/{id}:
 *   get:
 *     summary: Get cylinder movement by ID
 *     tags: [Cylinders]
 *     description: Retrieve detailed information about a cylinder movement by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Movement ID
 *     responses:
 *       200:
 *         description: Cylinder movement details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Movement not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/movements/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getMovementById),
  asyncHandler(cylinderController.getMovementById)
);

/**
 * @swagger
 * /api/v1/cylinders/categories/{categoryId}/movements:
 *   get:
 *     summary: Get movements for a specific cylinder category
 *     tags: [Cylinders]
 *     description: Retrieve all movements for a specific cylinder category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of movements for the specified category
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/categories/:categoryId/movements",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getMovementsByCategory
  ),
  asyncHandler(cylinderController.getMovementsByCategory)
);

/**
 * @swagger
 * /api/v1/cylinders/movements:
 *   post:
 *     summary: Create a new cylinder movement
 *     tags: [Cylinders]
 *     description: Create a new cylinder movement (generic transaction)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - quantity
 *               - fromLocation
 *               - toLocation
 *               - movementType
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               fromLocation:
 *                 type: string
 *                 example: Main Warehouse
 *               toLocation:
 *                 type: string
 *                 example: Customer
 *               movementType:
 *                 type: string
 *                 enum: [sale, exchange, return, restock]
 *                 example: sale
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               driverId:
 *                 type: string
 *                 format: uuid
 *                 example: 773c8400-a44d-61e6-c827-995544330000
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: 884d8400-b55e-71f7-d938-115544330000
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-01-15T12:00:00Z
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *                 default: completed
 *                 example: completed
 *               notes:
 *                 type: string
 *                 example: Sale to regular customer
 *     responses:
 *       201:
 *         description: Cylinder movement created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/movements",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.createMovement),
  asyncHandler(cylinderController.createMovement)
);

/**
 * @swagger
 * /api/v1/cylinders/movements/{id}:
 *   put:
 *     summary: Update a cylinder movement
 *     tags: [Cylinders]
 *     description: Update an existing cylinder movement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Movement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *               fromLocation:
 *                 type: string
 *                 example: East Warehouse
 *               toLocation:
 *                 type: string
 *                 example: Customer
 *               movementType:
 *                 type: string
 *                 enum: [sale, exchange, return, restock]
 *                 example: exchange
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               driverId:
 *                 type: string
 *                 format: uuid
 *                 example: 773c8400-a44d-61e6-c827-995544330000
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: 884d8400-b55e-71f7-d938-115544330000
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-01-16T14:30:00Z
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *                 example: completed
 *               notes:
 *                 type: string
 *                 example: Updated transaction details
 *     responses:
 *       200:
 *         description: Cylinder movement updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Movement not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/movements/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.updateMovement),
  asyncHandler(cylinderController.updateMovement)
);

/**
 * @swagger
 * /api/v1/cylinders/movements/{id}:
 *   delete:
 *     summary: Delete a cylinder movement
 *     tags: [Cylinders]
 *     description: Delete a cylinder movement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Movement ID
 *     responses:
 *       200:
 *         description: Cylinder movement deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Movement not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/movements/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.DELETE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.deleteMovement),
  asyncHandler(cylinderController.deleteMovement)
);

// Specialized operations
/**
 * @swagger
 * /api/v1/cylinders/transactions/exchange:
 *   post:
 *     summary: Perform cylinder exchange
 *     tags: [Cylinders]
 *     description: Exchange filled cylinders for empty ones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - filledQuantity
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               filledQuantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               driverId:
 *                 type: string
 *                 format: uuid
 *                 example: 773c8400-a44d-61e6-c827-995544330000
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: 884d8400-b55e-71f7-d938-115544330000
 *               notes:
 *                 type: string
 *                 example: Regular customer exchange
 *     responses:
 *       201:
 *         description: Cylinder exchange performed successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/transactions/exchange",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.performCylinderExchange
  ),
  asyncHandler(cylinderController.performCylinderExchange)
);

/**
 * @swagger
 * /api/v1/cylinders/transactions/sale:
 *   post:
 *     summary: Perform cylinder sale
 *     tags: [Cylinders]
 *     description: Sell cylinders to a customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - quantity
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: 884d8400-b55e-71f7-d938-115544330000
 *               notes:
 *                 type: string
 *                 example: New customer purchase
 *     responses:
 *       201:
 *         description: Cylinder sale performed successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/transactions/sale",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.performCylinderSale),
  asyncHandler(cylinderController.performCylinderSale)
);

/**
 * @swagger
 * /api/v1/cylinders/transactions/return:
 *   post:
 *     summary: Process cylinder return
 *     tags: [Cylinders]
 *     description: Process returned empty cylinders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - quantity
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: 884d8400-b55e-71f7-d938-115544330000
 *               notes:
 *                 type: string
 *                 example: Customer returning cylinders
 *     responses:
 *       201:
 *         description: Cylinder return processed successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/transactions/return",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.performCylinderReturn
  ),
  asyncHandler(cylinderController.performCylinderReturn)
);

/**
 * @swagger
 * /api/v1/cylinders/transactions/restock:
 *   post:
 *     summary: Restock cylinders
 *     tags: [Cylinders]
 *     description: Restock filled and/or empty cylinders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - filledQuantity
 *               - emptyQuantity
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               filledQuantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 20
 *               emptyQuantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 5
 *               notes:
 *                 type: string
 *                 example: Monthly restock
 *     responses:
 *       201:
 *         description: Cylinders restocked successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/transactions/restock",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.performCylinderRestock
  ),
  asyncHandler(cylinderController.performCylinderRestock)
);

/**
 * @swagger
 * /api/v1/cylinders/inventory/summary:
 *   get:
 *     summary: Get cylinder inventory summary
 *     tags: [Cylinders]
 *     description: Retrieve a summary of the cylinder inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cylinder inventory summary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/inventory/summary",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  asyncHandler(cylinderController.getInventorySummary)
);

/**
 * @swagger
 * /api/v1/cylinders/categories/locations/{location}:
 *   get:
 *     summary: Get cylinder categories by location
 *     tags: [Cylinders]
 *     description: Retrieve all cylinder categories for a specific location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location name
 *     responses:
 *       200:
 *         description: List of categories at the specified location
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/categories/locations/:location",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCategoriesByLocation
  ),
  asyncHandler(cylinderController.getCategoriesByLocation)
);

/**
 * @swagger
 * /api/v1/cylinders/categories/status/{status}:
 *   get:
 *     summary: Get cylinder categories by status
 *     tags: [Cylinders]
 *     description: Retrieve all cylinder categories with a specific status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Status (active, inactive, discontinued)
 *     responses:
 *       200:
 *         description: List of categories with the specified status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/categories/status/:status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCategoriesByStatus
  ),
  asyncHandler(cylinderController.getCategoriesByStatus)
);

/**
 * @swagger
 * /api/v1/cylinders/categories/requiring-restock:
 *   get:
 *     summary: Get cylinder categories requiring restock
 *     tags: [Cylinders]
 *     description: Retrieve all cylinder categories that require restocking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories requiring restock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/categories/requiring-restock",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  asyncHandler(cylinderController.getCategoriesRequiringRestock)
);

export default router;
