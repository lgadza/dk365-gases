import Order from "./model";
import OrderDetail from "./order-detail.model";
import User from "../users/model";
import Address from "../address/model";
import CylinderCategory from "../cylinder/models/cylinder-category.model";
import associationRegistry from "../../common/utils/db/AssociationRegistry";

// Register all associations for the Order models
const MODULE_NAME = "orders";

// Order-OrderDetail associations
associationRegistry.registerHasMany(
  Order,
  OrderDetail,
  {
    foreignKey: "orderId",
    as: "orderDetails",
  },
  MODULE_NAME
);

associationRegistry.registerBelongsTo(
  OrderDetail,
  Order,
  {
    foreignKey: "orderId",
    as: "order",
  },
  MODULE_NAME
);

// Order-User associations (customer)
associationRegistry.registerBelongsTo(
  Order,
  User,
  {
    foreignKey: "customerId",
    as: "customer",
  },
  MODULE_NAME
);

// Order-User associations (driver)
associationRegistry.registerBelongsTo(
  Order,
  User,
  {
    foreignKey: "driverId",
    as: "driver",
    constraints: false,
  },
  MODULE_NAME
);

// Order-Address associations
associationRegistry.registerBelongsTo(
  Order,
  Address,
  {
    foreignKey: "deliveryAddressId",
    as: "deliveryAddress",
    constraints: false,
  },
  MODULE_NAME
);

// OrderDetail-CylinderCategory associations
associationRegistry.registerBelongsTo(
  OrderDetail,
  CylinderCategory,
  {
    foreignKey: "cylinderCategoryId",
    as: "cylinderCategory",
  },
  MODULE_NAME
);
