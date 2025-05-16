import express from "express";
import { Router } from "express";

// Import feature routers
import authRouter from "../../features/auth/routes";
import usersRouter from "../../features/users/routes";
import addressRouter from "../../features/address/routes";
import searchRouter from "../../features/search/routes";
import rbacRouter from "../../features/rbac/routes/roles.route";
import invoiceRouter from "../../features/invoice/routes";
import fleetRouter from "../../features/fleet/routes";
import roleRouter from "../../features/rbac/routes/roles.route";
// import cylinderRouter from "../../features/cylinder/routes";

const router: Router = express.Router();

// API v1 info endpoint
router.get("/", (req, res) => {
  res.json({
    version: "v1",
    status: "active",
    endpoints: {
      auth: "/auth",
      users: "/users",
      addresses: "/addresses",
      search: "/search",
      invoices: "/invoices",
      cylinders: "/cylinders",
      fleet: "/fleet",
      roles: "/roles",
      // List available endpoints as they are implemented
      // roles: '/rbac/roles',
      demo: "/demo",
    },
  });
});

// Demo route for testing
router.get("/demo", (req, res) => {
  res.json({
    message: "API v1 is working correctly",
    requestId: req.headers["x-request-id"],
    timestamp: new Date().toISOString(),
  });
});

// Register feature routes
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/addresses", addressRouter);
router.use("/search", searchRouter);
router.use("/rbac/roles", rbacRouter);
router.use("/invoices", invoiceRouter);
router.use("/fleet", fleetRouter);
router.use("/roles", roleRouter);
// router.use("/cylinders", cylinderRouter);

export default router;
