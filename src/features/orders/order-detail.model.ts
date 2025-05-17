import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { OrderDetailInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface OrderDetailCreationInterface
  extends Optional<OrderDetailInterface, "id"> {}

// Enum types
export enum TransactionType {
  SALE = "sale",
  EXCHANGE = "exchange",
  REFILL = "refill",
  RETURN = "return",
}

export enum CylinderCondition {
  FILLED = "filled",
  EMPTY = "empty",
  DAMAGED = "damaged",
}

// OrderDetail model definition
class OrderDetail
  extends Model<OrderDetailInterface, OrderDetailCreationInterface>
  implements OrderDetailInterface
{
  public id!: string;
  public orderId!: string;
  public cylinderCategoryId!: string;
  public transactionType!: TransactionType;
  public quantity!: number;
  public unitPrice!: number;
  public subtotal!: number;
  public cylinderCondition!: CylinderCondition;
  public notes!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    cylinderCategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    transactionType: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cylinderCondition: {
      type: DataTypes.ENUM(...Object.values(CylinderCondition)),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "order_details",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["orderId"],
      },
      {
        fields: ["cylinderCategoryId"],
      },
      {
        fields: ["transactionType"],
      },
    ],
  }
);

export default OrderDetail;
