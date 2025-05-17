import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { CylinderMovementInterface } from "../interfaces/interfaces";
import CylinderCategory from "./cylinder-category.model";

// Define optional fields for creation
interface CylinderMovementCreationInterface
  extends Optional<CylinderMovementInterface, "id"> {}

// Cylinder Movement model definition
class CylinderMovement
  extends Model<CylinderMovementInterface, CylinderMovementCreationInterface>
  implements CylinderMovementInterface
{
  public id!: string;
  public categoryId!: string;
  public quantity!: number;
  public fromLocation!: string;
  public toLocation!: string;
  public movementType!: string;
  public customerId?: string;
  public driverId?: string;
  public invoiceId?: string;
  public timestamp!: Date;
  public status!: string;
  public notes?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CylinderMovement.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: CylinderCategory,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fromLocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    toLocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    movementType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Type of movement (sale, exchange, return, restock)",
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "completed",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "cylinder_movements",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["categoryId"],
      },
      {
        fields: ["movementType"],
      },
      {
        fields: ["timestamp"],
      },
      {
        fields: ["customerId"],
      },
      {
        fields: ["driverId"],
      },
      {
        fields: ["invoiceId"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

export default CylinderMovement;
