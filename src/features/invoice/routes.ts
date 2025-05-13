import { Router } from "express";
import invoiceController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import invoiceValidationSchemas from "./validation";
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
 *   name: Invoices
 *   description: Invoice management API
 */

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: Get a list of invoices
 *     tags: [Invoices]
 *     description: Retrieve a paginated list of invoices with filtering options
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
 *         description: Number of invoices per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering invoices
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [invoiceNumber, invoiceDate, dueDate, totalAmount, status, createdAt]
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
 *         description: Filter by invoice status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by customer ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Filter by minimum amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Filter by maximum amount
 *       - in: query
 *         name: isPaid
 *         schema:
 *           type: boolean
 *         description: Filter paid/unpaid invoices
 *       - in: query
 *         name: isOverdue
 *         schema:
 *           type: boolean
 *         description: Filter overdue invoices
 *     responses:
 *       200:
 *         description: A paginated list of invoices
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
 *                   example: Invoices retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoices:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
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
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(invoiceValidationSchemas.getInvoiceList),
  asyncHandler(invoiceController.getInvoiceList)
);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     summary: Get an invoice by ID
 *     tags: [Invoices]
 *     description: Retrieve detailed information about an invoice by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details retrieved successfully
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
 *                   example: Invoice retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(invoiceValidationSchemas.getInvoiceById),
  asyncHandler(invoiceController.getInvoiceById)
);

/**
 * @swagger
 * /api/v1/invoices/number/{invoiceNumber}:
 *   get:
 *     summary: Get an invoice by invoice number
 *     tags: [Invoices]
 *     description: Retrieve detailed information about an invoice by its invoice number
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice Number
 *     responses:
 *       200:
 *         description: Invoice details retrieved successfully
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
 *                   example: Invoice retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/number/:invoiceNumber",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(invoiceValidationSchemas.getInvoiceByNumber),
  asyncHandler(invoiceController.getInvoiceByNumber)
);

/**
 * @swagger
 * /api/v1/invoices/customer/{customerId}:
 *   get:
 *     summary: Get invoices by customer ID
 *     tags: [Invoices]
 *     description: Retrieve all invoices for a specific customer
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
 *         description: Customer invoices retrieved successfully
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
 *                   example: Customer invoices retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/customer/:customerId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(
    invoiceValidationSchemas.getInvoicesByCustomerId
  ),
  asyncHandler(invoiceController.getInvoicesByCustomerId)
);

/**
 * @swagger
 * /api/v1/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     description: Create a new invoice with items and other details
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
 *               - invoiceDate
 *               - dueDate
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the customer
 *               invoiceDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the invoice
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for payment
 *               notes:
 *                 type: string
 *                 description: Additional notes for the invoice
 *               status:
 *                 type: string
 *                 enum: [draft, pending, paid, cancelled, overdue]
 *                 default: draft
 *                 description: Invoice status
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - description
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     description:
 *                       type: string
 *                       description: Description of the item
 *                     quantity:
 *                       type: number
 *                       description: Quantity of the item
 *                     unitPrice:
 *                       type: number
 *                       description: Price per unit
 *                     taxRate:
 *                       type: number
 *                       description: Tax rate for the item (in percent)
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the related product (if applicable)
 *               discount:
 *                 type: number
 *                 description: Discount amount for the entire invoice
 *               taxAmount:
 *                 type: number
 *                 description: Total tax amount
 *               shippingAmount:
 *                 type: number
 *                 description: Shipping cost
 *               billingAddressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the billing address
 *               shippingAddressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the shipping address
 *     responses:
 *       201:
 *         description: Invoice created successfully
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
 *                   example: Invoice created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
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
  PermissionMiddleware.hasPermission("invoice", PermissionAction.CREATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.createInvoice),
  asyncHandler(invoiceController.createInvoice)
);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoices]
 *     description: Update an existing invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               invoiceDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the invoice
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for payment
 *               notes:
 *                 type: string
 *                 description: Additional notes for the invoice
 *               status:
 *                 type: string
 *                 enum: [draft, pending, paid, cancelled, overdue]
 *                 description: Invoice status
 *               discount:
 *                 type: number
 *                 description: Discount amount for the entire invoice
 *               taxAmount:
 *                 type: number
 *                 description: Total tax amount
 *               shippingAmount:
 *                 type: number
 *                 description: Shipping cost
 *               billingAddressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the billing address
 *               shippingAddressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the shipping address
 *     responses:
 *       200:
 *         description: Invoice updated successfully
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
 *                   example: Invoice updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.updateInvoice),
  asyncHandler(invoiceController.updateInvoice)
);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     description: Delete an invoice (only if it's in draft status)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
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
 *                   example: Invoice deleted successfully
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
 *         description: Invoice not found
 *       409:
 *         description: Conflict - invoice cannot be deleted (not in draft status)
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.DELETE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.deleteInvoice),
  asyncHandler(invoiceController.deleteInvoice)
);

/**
 * @swagger
 * /api/v1/invoices/{invoiceId}/items:
 *   get:
 *     summary: Get invoice items
 *     tags: [Invoices]
 *     description: Get all items for a specific invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice items retrieved successfully
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
 *                   example: Invoice items retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvoiceItem'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:invoiceId/items",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(invoiceValidationSchemas.getInvoiceItems),
  asyncHandler(invoiceController.getInvoiceItems)
);

/**
 * @swagger
 * /api/v1/invoices/{invoiceId}/items:
 *   post:
 *     summary: Add invoice item
 *     tags: [Invoices]
 *     description: Add a new item to an existing invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - quantity
 *               - unitPrice
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the item
 *               quantity:
 *                 type: number
 *                 description: Quantity of the item
 *               unitPrice:
 *                 type: number
 *                 description: Price per unit
 *               taxRate:
 *                 type: number
 *                 description: Tax rate for the item (in percent)
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the related product (if applicable)
 *     responses:
 *       201:
 *         description: Invoice item added successfully
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
 *                   example: Invoice item added successfully
 *                 data:
 *                   $ref: '#/components/schemas/InvoiceItem'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       409:
 *         description: Conflict - invoice is not in draft or pending status
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:invoiceId/items",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.addInvoiceItem),
  asyncHandler(invoiceController.addInvoiceItem)
);

/**
 * @swagger
 * /api/v1/invoices/items/{id}:
 *   put:
 *     summary: Update invoice item
 *     tags: [Invoices]
 *     description: Update an existing invoice item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the item
 *               quantity:
 *                 type: number
 *                 description: Quantity of the item
 *               unitPrice:
 *                 type: number
 *                 description: Price per unit
 *               taxRate:
 *                 type: number
 *                 description: Tax rate for the item (in percent)
 *     responses:
 *       200:
 *         description: Invoice item updated successfully
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
 *                   example: Invoice item updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/InvoiceItem'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice item not found
 *       409:
 *         description: Conflict - parent invoice is not in draft or pending status
 *       500:
 *         description: Internal server error
 */
router.put(
  "/items/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.updateInvoiceItem),
  asyncHandler(invoiceController.updateInvoiceItem)
);

/**
 * @swagger
 * /api/v1/invoices/items/{id}:
 *   delete:
 *     summary: Delete invoice item
 *     tags: [Invoices]
 *     description: Delete an invoice item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice Item ID
 *     responses:
 *       200:
 *         description: Invoice item deleted successfully
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
 *                   example: Invoice item deleted successfully
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
 *         description: Invoice item not found
 *       409:
 *         description: Conflict - parent invoice is not in draft or pending status
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/items/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.deleteInvoiceItem),
  asyncHandler(invoiceController.deleteInvoiceItem)
);

/**
 * @swagger
 * /api/v1/invoices/{invoiceId}/payments:
 *   get:
 *     summary: Get invoice payments
 *     tags: [Invoices]
 *     description: Get all payments for a specific invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice payments retrieved successfully
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
 *                   example: Invoice payments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvoicePayment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:invoiceId/payments",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(invoiceValidationSchemas.getInvoicePayments),
  asyncHandler(invoiceController.getInvoicePayments)
);

/**
 * @swagger
 * /api/v1/invoices/{invoiceId}/payments:
 *   post:
 *     summary: Add invoice payment
 *     tags: [Invoices]
 *     description: Add a new payment to an invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentDate
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, bank_transfer, check, other]
 *                 description: Method of payment
 *               reference:
 *                 type: string
 *                 description: Payment reference number or description
 *               notes:
 *                 type: string
 *                 description: Additional notes about the payment
 *     responses:
 *       201:
 *         description: Invoice payment added successfully
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
 *                   example: Invoice payment added successfully
 *                 data:
 *                   $ref: '#/components/schemas/InvoicePayment'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       409:
 *         description: Conflict - invoice is cancelled or payment exceeds remaining balance
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:invoiceId/payments",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.addInvoicePayment),
  asyncHandler(invoiceController.addInvoicePayment)
);

/**
 * @swagger
 * /api/v1/invoices/{id}/mark-paid:
 *   post:
 *     summary: Mark invoice as paid
 *     tags: [Invoices]
 *     description: Mark an invoice as fully paid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentDate
 *               - paymentMethod
 *             properties:
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, bank_transfer, check, other]
 *                 description: Method of payment
 *               reference:
 *                 type: string
 *                 description: Payment reference number or description
 *               notes:
 *                 type: string
 *                 description: Additional notes about the payment
 *     responses:
 *       200:
 *         description: Invoice marked as paid successfully
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
 *                   example: Invoice marked as paid successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       409:
 *         description: Conflict - invoice is cancelled or already fully paid
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/mark-paid",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.markInvoiceAsPaid),
  asyncHandler(invoiceController.markInvoiceAsPaid)
);

/**
 * @swagger
 * /api/v1/invoices/{id}/mark-sent:
 *   post:
 *     summary: Mark invoice as sent
 *     tags: [Invoices]
 *     description: Mark an invoice as sent to the customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice marked as sent successfully
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
 *                   example: Invoice marked as sent successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       409:
 *         description: Conflict - invoice is not in draft status
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/mark-sent",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.markInvoiceAsSent),
  asyncHandler(invoiceController.markInvoiceAsSent)
);

/**
 * @swagger
 * /api/v1/invoices/{id}/cancel:
 *   post:
 *     summary: Cancel invoice
 *     tags: [Invoices]
 *     description: Cancel an existing invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Invoice cancelled successfully
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
 *                   example: Invoice cancelled successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       409:
 *         description: Conflict - invoice is already cancelled or fully paid
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/cancel",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(invoiceValidationSchemas.cancelInvoice),
  asyncHandler(invoiceController.cancelInvoice)
);

/**
 * @swagger
 * /api/v1/invoices/{id}/pdf:
 *   get:
 *     summary: Generate invoice PDF
 *     tags: [Invoices]
 *     description: Generate and download a PDF version of the invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id/pdf",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(invoiceValidationSchemas.generateInvoicePdf),
  asyncHandler(invoiceController.generateInvoicePdf)
);

/**
 * @swagger
 * /api/v1/invoices/{id}/email:
 *   post:
 *     summary: Send invoice by email
 *     tags: [Invoices]
 *     description: Send the invoice to a specified email address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send the invoice to
 *     responses:
 *       200:
 *         description: Invoice sent by email successfully
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
 *                   example: Invoice sent by email successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/email",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(invoiceValidationSchemas.sendInvoiceByEmail),
  asyncHandler(invoiceController.sendInvoiceByEmail)
);

/**
 * @swagger
 * /api/v1/invoices/statistics:
 *   get:
 *     summary: Get invoice statistics
 *     tags: [Invoices]
 *     description: Calculate statistics about invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by customer ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Invoice statistics calculated successfully
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
 *                   example: Invoice statistics calculated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalInvoices:
 *                       type: integer
 *                       example: 120
 *                     totalAmount:
 *                       type: number
 *                       example: 45600.50
 *                     paidAmount:
 *                       type: number
 *                       example: 32400.25
 *                     overdueAmount:
 *                       type: number
 *                       example: 8200.75
 *                     pendingAmount:
 *                       type: number
 *                       example: 5000.00
 *                     statusCounts:
 *                       type: object
 *                       properties:
 *                         draft:
 *                           type: integer
 *                           example: 15
 *                         pending:
 *                           type: integer
 *                           example: 25
 *                         paid:
 *                           type: integer
 *                           example: 60
 *                         overdue:
 *                           type: integer
 *                           example: 12
 *                         cancelled:
 *                           type: integer
 *                           example: 8
 *                     monthlyTotals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2023-01"
 *                           total:
 *                             type: number
 *                             example: 5230.45
 *                           count:
 *                             type: integer
 *                             example: 12
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("invoice", PermissionAction.READ),
  ValidationUtil.validateRequest(
    invoiceValidationSchemas.calculateInvoiceStatistics
  ),
  asyncHandler(invoiceController.calculateInvoiceStatistics)
);

export default router;
