import Address from "./model";
import AddressLink from "./address-link.model";
import associationRegistry from "../../common/utils/db/AssociationRegistry";

// Register all associations for the Address models
const MODULE_NAME = "address";

// Address-AddressLink associations
associationRegistry.registerHasMany(
  Address,
  AddressLink,
  {
    foreignKey: "addressId",
    as: "links",
  },
  MODULE_NAME
);

associationRegistry.registerBelongsTo(
  AddressLink,
  Address,
  {
    foreignKey: "addressId",
    as: "address",
  },
  MODULE_NAME
);
