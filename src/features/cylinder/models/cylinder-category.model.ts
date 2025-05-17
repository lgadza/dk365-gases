import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { CylinderCategoryInterface } from "../interfaces/interfaces";

// Define optional fields for creation
interface CylinderCategoryCreationInterface
  extends Optional<CylinderCategoryInterface, "id"> {}

// Cylinder Category model definition
class CylinderCategory
  extends Model<CylinderCategoryInterface, CylinderCategoryCreationInterface>
  implements CylinderCategoryInterface
{
  public id!: string;
  public categoryName!: string;
  public description?: string;
  public totalQuantity!: number;
  public filledQuantity!: number;
  public emptyQuantity!: number;
  public location?: string;
  public lastRestocked?: Date;
  public price?: number;
  public depositAmount?: number;
  public cylinderWeight?: number;
  public gasType?: string;
  public status!: string;
  public notes?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CylinderCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    categoryName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    filledQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    emptyQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastRestocked: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cylinderWeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    gasType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "cylinder_categories",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["categoryName"],
      },
      {
        fields: ["location"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["gasType"],
      },
    ],
  }
);

export default CylinderCategory;
