import { Router } from "express";
import cylinderController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import cylinderValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../rbac/interfaces/roles.interface";

// Create routers
const router = Router();
const cylinderTypeRouter = Router();
const cylinderMovementRouter = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

/**
 * @swagger
 * tags:
 *   name: Cylinders
 *   description: Gas cylinder inventory management API
 */

// Mount sub-routers
router.use("/types", cylinderTypeRouter);
router.use("/movements", cylinderMovementRouter);

/**
 * Cylinder routes
 * Important: Specific routes (with fixed paths) must come BEFORE routes with parameters
 */

// Debug routes - only available in development
if (process.env.NODE_ENV === "development") {
  router.get(
    "/debug/database-access",
    asyncHandler(cylinderController.debugDatabaseAccess)
  );
}

// Special functionality routes (specific - come first)
router.get(
  "/inspection/due",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylindersForInspection
  ),
  asyncHandler(cylinderController.getCylindersForInspection)
);

router.get(
  "/stats",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.calculateCylinderStats
  ),
  asyncHandler(cylinderController.calculateCylinderStats)
);

router.get(
  "/export/csv",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.exportCylindersToCSV
  ),
  asyncHandler(cylinderController.exportCylindersToCSV)
);

// Lookup routes by specific criteria (come before generic ID route)
router.get(
  "/serial/:serialNumber",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylinderBySerialNumber
  ),
  asyncHandler(cylinderController.getCylinderBySerialNumber)
);

router.get(
  "/status/:status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylindersByStatus
  ),
  asyncHandler(cylinderController.getCylindersByStatus)
);

router.get(
  "/by-type/:typeId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylindersByTypeId
  ),
  asyncHandler(cylinderController.getCylindersByTypeId)
);

router.get(
  "/by-customer/:customerId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylindersByCustomerId
  ),
  asyncHandler(cylinderController.getCylindersByCustomerId)
);

// List route
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderList),
  asyncHandler(cylinderController.getCylinderList)
);

// Create route
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.createCylinder),
  asyncHandler(cylinderController.createCylinder)
);

// ID-specific routes (should be last among cylinder routes)
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderById),
  asyncHandler(cylinderController.getCylinderById)
);

router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.updateCylinder),
  asyncHandler(cylinderController.updateCylinder)
);

router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.DELETE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.deleteCylinder),
  asyncHandler(cylinderController.deleteCylinder)
);

router.put(
  "/:id/status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.updateCylinderStatus
  ),
  asyncHandler(cylinderController.updateCylinderStatus)
);

router.get(
  "/:id/qrcode",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.generateCylinderQRCode
  ),
  asyncHandler(cylinderController.generateCylinderQRCode)
);

router.get(
  "/:id/barcode",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.generateCylinderBarcode
  ),
  asyncHandler(cylinderController.generateCylinderBarcode)
);

router.get(
  "/:cylinderId/movements",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylinderMovementsByCylinderId
  ),
  asyncHandler(cylinderController.getCylinderMovementsByCylinderId)
);

/**
 * Cylinder type routes - mounted at /types
 */
// Add a dedicated search endpoint (POST to allow complex search criteria in body)
cylinderTypeRouter.post(
  "/search",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.searchCylinderTypes),
  asyncHandler(cylinderController.searchCylinderTypes)
);

cylinderTypeRouter.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderTypeList),
  asyncHandler(cylinderController.getCylinderTypeList)
);

cylinderTypeRouter.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.createCylinderType),
  asyncHandler(cylinderController.createCylinderType)
);

cylinderTypeRouter.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderTypeById),
  asyncHandler(cylinderController.getCylinderTypeById)
);

cylinderTypeRouter.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.updateCylinderType),
  asyncHandler(cylinderController.updateCylinderType)
);

cylinderTypeRouter.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.DELETE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.deleteCylinderType),
  asyncHandler(cylinderController.deleteCylinderType)
);

/**
 * Cylinder movement routes - mounted at /movements
 */
cylinderMovementRouter.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylinderMovementList
  ),
  asyncHandler(cylinderController.getCylinderMovementList)
);

cylinderMovementRouter.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.recordCylinderMovement
  ),
  asyncHandler(cylinderController.recordCylinderMovement)
);

cylinderMovementRouter.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylinderMovementById
  ),
  asyncHandler(cylinderController.getCylinderMovementById)
);

cylinderMovementRouter.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.updateCylinderMovement
  ),
  asyncHandler(cylinderController.updateCylinderMovement)
);

cylinderMovementRouter.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.deleteCylinderMovement
  ),
  asyncHandler(cylinderController.deleteCylinderMovement)
);

/**
 * Reports routes
 */
router.get(
  "/reports/inventory",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.generateInventoryReport
  ),
  asyncHandler(cylinderController.generateInventoryReport)
);

export default router;
