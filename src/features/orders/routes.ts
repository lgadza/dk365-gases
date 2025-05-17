import { Router } from "express";
import orderController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import orderValidationSchemas from "./validation";
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
 *   name: Orders
 *   description: Order management API
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get a list of orders
 *     tags: [Orders]
 *     description: Retrieve a paginated list of orders with filtering options
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
 *         description: Number of orders per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering orders
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, customerId, totalAmount, createdAt, updatedAt, orderStatus, paymentStatus]
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
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled, failed]
 *         description: Filter by order status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [unpaid, paid, partially_paid, refunded, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: deliveryMethod
 *         schema:
 *           type: string
 *           enum: [pickup, delivery]
 *         description: Filter by delivery method
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for order filtering (ISO format)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for order filtering (ISO format)
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum order amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum order amount
 *     responses:
 *       200:
 *         description: A paginated list of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.READ),
  ValidationUtil.validateRequest(orderValidationSchemas.getOrderList),
  asyncHandler(orderController.getOrderList)
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     description: Retrieve detailed information about an order by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.READ),
  ValidationUtil.validateRequest(orderValidationSchemas.getOrderById),
  asyncHandler(orderController.getOrderById)
);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     description: Create a new order with order details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - deliveryMethod
 *               - orderDetails
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled, failed]
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, paid, partially_paid, refunded, cancelled]
 *               deliveryMethod:
 *                 type: string
 *                 enum: [pickup, delivery]
 *               deliveryAddressId:
 *                 type: string
 *                 format: uuid
 *               driverId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *               orderDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - cylinderCategoryId
 *                     - transactionType
 *                     - quantity
 *                     - unitPrice
 *                     - cylinderCondition
 *                   properties:
 *                     cylinderCategoryId:
 *                       type: string
 *                       format: uuid
 *                     transactionType:
 *                       type: string
 *                       enum: [sale, exchange, refill, return]
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     unitPrice:
 *                       type: number
 *                       minimum: 0
 *                     cylinderCondition:
 *                       type: string
 *                       enum: [filled, empty, damaged]
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created successfully
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
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.CREATE),
  ValidationUtil.validateRequest(orderValidationSchemas.createOrder),
  asyncHandler(orderController.createOrder)
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     description: Update an existing order's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled, failed]
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, paid, partially_paid, refunded, cancelled]
 *               deliveryMethod:
 *                 type: string
 *                 enum: [pickup, delivery]
 *               deliveryAddressId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               driverId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.updateOrder),
  asyncHandler(orderController.updateOrder)
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     description: Soft-delete an order by changing its status to cancelled
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.DELETE),
  ValidationUtil.validateRequest(orderValidationSchemas.deleteOrder),
  asyncHandler(orderController.deleteOrder)
);

/**
 * @swagger
 * /api/v1/orders/details:
 *   post:
 *     summary: Add detail to an order
 *     tags: [Orders]
 *     description: Add a new line item to an existing order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - cylinderCategoryId
 *               - transactionType
 *               - quantity
 *               - unitPrice
 *               - cylinderCondition
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               cylinderCategoryId:
 *                 type: string
 *                 format: uuid
 *               transactionType:
 *                 type: string
 *                 enum: [sale, exchange, refill, return]
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               unitPrice:
 *                 type: number
 *                 minimum: 0
 *               cylinderCondition:
 *                 type: string
 *                 enum: [filled, empty, damaged]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order detail added successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/details",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.addOrderDetail),
  asyncHandler(orderController.addOrderDetail)
);

/**
 * @swagger
 * /api/v1/orders/details/{id}:
 *   put:
 *     summary: Update an order detail
 *     tags: [Orders]
 *     description: Update an existing order detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order detail ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               transactionType:
 *                 type: string
 *                 enum: [sale, exchange, refill, return]
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               unitPrice:
 *                 type: number
 *                 minimum: 0
 *               cylinderCondition:
 *                 type: string
 *                 enum: [filled, empty, damaged]
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Order detail updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order detail not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/details/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.updateOrderDetail),
  asyncHandler(orderController.updateOrderDetail)
);

/**
 * @swagger
 * /api/v1/orders/details/{id}:
 *   delete:
 *     summary: Delete an order detail
 *     tags: [Orders]
 *     description: Delete an order line item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order detail ID
 *     responses:
 *       200:
 *         description: Order detail deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order detail not found
 *       409:
 *         description: Cannot delete detail from a non-pending order
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/details/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.DELETE),
  ValidationUtil.validateRequest(orderValidationSchemas.deleteOrderDetail),
  asyncHandler(orderController.deleteOrderDetail)
);

/**
 * @swagger
 * /api/v1/orders/customer/{customerId}:
 *   get:
 *     summary: Get orders by customer
 *     tags: [Orders]
 *     description: Retrieve all orders for a specific customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/customer/:customerId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.READ),
  ValidationUtil.validateRequest(orderValidationSchemas.getCustomerOrders),
  asyncHandler(orderController.getCustomerOrders)
);

/**
 * @swagger
 * /api/v1/orders/driver/{driverId}:
 *   get:
 *     summary: Get orders by driver
 *     tags: [Orders]
 *     description: Retrieve all orders assigned to a specific driver
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/driver/:driverId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.READ),
  ValidationUtil.validateRequest(orderValidationSchemas.getDriverOrders),
  asyncHandler(orderController.getDriverOrders)
);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     description: Update the status of an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderStatus
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled, failed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.updateOrderStatus),
  asyncHandler(orderController.updateOrderStatus)
);

/**
 * @swagger
 * /api/v1/orders/{id}/payment:
 *   put:
 *     summary: Update payment status
 *     tags: [Orders]
 *     description: Update the payment status of an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, paid, partially_paid, refunded, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/payment",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.updatePaymentStatus),
  asyncHandler(orderController.updatePaymentStatus)
);

/**
 * @swagger
 * /api/v1/orders/{id}/driver:
 *   put:
 *     summary: Assign driver to order
 *     tags: [Orders]
 *     description: Assign or reassign a driver to an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
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
 *     responses:
 *       200:
 *         description: Driver assigned successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/driver",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.assignDriver),
  asyncHandler(orderController.assignDriver)
);

/**
 * @swagger
 * /api/v1/orders/{id}/complete:
 *   put:
 *     summary: Complete an order
 *     tags: [Orders]
 *     description: Mark an order as completed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order completed successfully
 *       400:
 *         description: Bad request - only processing orders can be completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/complete",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.completeOrder),
  asyncHandler(orderController.completeOrder)
);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     description: Mark an order as cancelled
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Bad request - completed orders cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/cancel",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("order", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(orderValidationSchemas.cancelOrder),
  asyncHandler(orderController.cancelOrder)
);

export default router;
