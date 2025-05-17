import CylinderCategory from "./models/cylinder-category.model";
import CylinderMovement from "./models/cylinder-movement.model";
import associationRegistry from "../../common/utils/db/AssociationRegistry";

// Register all associations for the Cylinder models
const MODULE_NAME = "cylinder";

// Category-Movement associations
associationRegistry.registerHasMany(
  CylinderCategory,
  CylinderMovement,
  {
    foreignKey: "categoryId",
    as: "movements",
  },
  MODULE_NAME
);

associationRegistry.registerBelongsTo(
  CylinderMovement,
  CylinderCategory,
  {
    foreignKey: "categoryId",
    as: "category",
  },
  MODULE_NAME
);
