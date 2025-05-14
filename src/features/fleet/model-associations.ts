import FleetVehicle from "./model";
import MaintenanceRecord from "./maintenance.model";
import associationRegistry from "../../common/utils/db/AssociationRegistry";

// Register all associations for the Fleet models
const MODULE_NAME = "fleet";

// FleetVehicle-MaintenanceRecord associations
associationRegistry.registerHasMany(
  FleetVehicle,
  MaintenanceRecord,
  {
    foreignKey: "vehicleId",
    as: "maintenanceRecords",
  },
  MODULE_NAME
);

associationRegistry.registerBelongsTo(
  MaintenanceRecord,
  FleetVehicle,
  {
    foreignKey: "vehicleId",
    as: "vehicle",
  },
  MODULE_NAME
);
