import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import {
  CylinderMovementInterface,
  CylinderMovementType,
} from "./interfaces/interfaces";

// Define optional fields for creation
interface CylinderMovementCreationInterface
  extends Optional<
    CylinderMovementInterface,
    "id" | "createdAt" | "updatedAt"
  > {}

// Cylinder Movement model definition
class CylinderMovement
  extends Model<CylinderMovementInterface, CylinderMovementCreationInterface>
  implements CylinderMovementInterface
{
  public id!: string;
  public cylinderId!: string;
  public movementType!: string;
  public fromLocation!: string | null;
  public toLocation!: string | null;
  public fromStatus!: string | null;
  public toStatus!: string;
  public quantity!: number;
  public transactionDate!: Date;
  public customerId!: string | null;
  public customerName!: string | null;
  public invoiceId!: string | null;
  public invoiceNumber!: string | null;
  public performedBy!: string;
  public notes!: string | null;
  public createdBy!: string;

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
    cylinderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "cylinders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    movementType: {
      type: new DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [Object.values(CylinderMovementType)],
      },
    },
    fromLocation: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    toLocation: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    fromStatus: {
      type: new DataTypes.STRING(20),
      allowNull: true,
    },
    toStatus: {
      type: new DataTypes.STRING(20),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customerName: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    invoiceNumber: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "cylinder_movements",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for cylinder ID searches
        fields: ["cylinderId"],
      },
      {
        // Index for movement type searches
        fields: ["movementType"],
      },
      {
        // Index for transaction date searches
        fields: ["transactionDate"],
      },
      {
        // Index for customer searches
        fields: ["customerId"],
      },
      {
        // Index for invoice searches
        fields: ["invoiceId"],
      },
    ],
  }
);

export default CylinderMovement;
