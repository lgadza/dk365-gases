import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { CylinderTypeInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface CylinderTypeCreationInterface
  extends Optional<CylinderTypeInterface, "id" | "createdAt" | "updatedAt"> {}

// Cylinder Type model definition
class CylinderType
  extends Model<CylinderTypeInterface, CylinderTypeCreationInterface>
  implements CylinderTypeInterface
{
  public id!: string;
  public name!: string;
  public description!: string | null;
  public capacity!: number;
  public gasType!: string;
  public material!: string;
  public height!: number | null;
  public diameter!: number | null;
  public weight!: number | null;
  public color!: string | null;
  public valveType!: string | null;
  public standardPressure!: number | null;
  public maxPressure!: number | null;
  public image!: string | null;
  public isActive!: boolean;
  public createdBy!: string;
  public updatedBy!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CylinderType.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gasType: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    material: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    height: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    diameter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    color: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    valveType: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    standardPressure: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isNumeric: true,
        min: 0,
      },
    },
    maxPressure: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isNumeric: true,
        min: 0,
      },
    },
    image: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
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
    tableName: "cylinder_types",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for name searches
        fields: ["name"],
      },
      {
        // Index for gas type searches
        fields: ["gasType"],
      },
      {
        // Index for active status
        fields: ["isActive"],
      },
    ],
  }
);

export default CylinderType;
