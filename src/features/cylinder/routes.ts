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
 *   description: Gas cylinder inventory management API
 */

/**
 * Cylinder routes
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderList),
  asyncHandler(cylinderController.getCylinderList)
);

router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderById),
  asyncHandler(cylinderController.getCylinderById)
);

router.get(
  "/serial/:serialNumber",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylinderBySerialNumber
  ),
  asyncHandler(cylinderController.getCylinderBySerialNumber)
);

router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.createCylinder),
  asyncHandler(cylinderController.createCylinder)
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

router.get(
  "/type/:typeId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylindersByTypeId
  ),
  asyncHandler(cylinderController.getCylindersByTypeId)
);

router.get(
  "/customer/:customerId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylindersByCustomerId
  ),
  asyncHandler(cylinderController.getCylindersByCustomerId)
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
  "/inspection/due",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylindersForInspection
  ),
  asyncHandler(cylinderController.getCylindersForInspection)
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

/**
 * Cylinder type routes
 */
router.get(
  "/types",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderTypeList),
  asyncHandler(cylinderController.getCylinderTypeList)
);

router.get(
  "/types/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(cylinderValidationSchemas.getCylinderTypeById),
  asyncHandler(cylinderController.getCylinderTypeById)
);

router.post(
  "/types",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.createCylinderType),
  asyncHandler(cylinderController.createCylinderType)
);

router.put(
  "/types/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.updateCylinderType),
  asyncHandler(cylinderController.updateCylinderType)
);

router.delete(
  "/types/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.DELETE),
  ValidationUtil.validateRequest(cylinderValidationSchemas.deleteCylinderType),
  asyncHandler(cylinderController.deleteCylinderType)
);

/**
 * Cylinder movement routes
 */
router.get(
  "/movements",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylinderMovementList
  ),
  asyncHandler(cylinderController.getCylinderMovementList)
);

router.get(
  "/movements/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.getCylinderMovementById
  ),
  asyncHandler(cylinderController.getCylinderMovementById)
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

router.post(
  "/movements",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.recordCylinderMovement
  ),
  asyncHandler(cylinderController.recordCylinderMovement)
);

router.put(
  "/movements/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.updateCylinderMovement
  ),
  asyncHandler(cylinderController.updateCylinderMovement)
);

router.delete(
  "/movements/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.deleteCylinderMovement
  ),
  asyncHandler(cylinderController.deleteCylinderMovement)
);

/**
 * Reports and exports
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

router.get(
  "/export/csv",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("cylinder", PermissionAction.READ),
  ValidationUtil.validateRequest(
    cylinderValidationSchemas.exportCylindersToCSV
  ),
  asyncHandler(cylinderController.exportCylindersToCSV)
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

export default router;
