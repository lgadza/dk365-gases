import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { OrderInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface OrderCreationInterface extends Optional<OrderInterface, "id"> {}

// Enum types
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  PARTIALLY_PAID = "partially_paid",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum DeliveryMethod {
  PICKUP = "pickup",
  DELIVERY = "delivery",
}

// Order model definition
class Order
  extends Model<OrderInterface, OrderCreationInterface>
  implements OrderInterface
{
  public id!: string;
  public customerId!: string;
  public orderStatus!: OrderStatus;
  public paymentStatus!: PaymentStatus;
  public totalAmount!: number;
  public deliveryMethod!: DeliveryMethod;
  public deliveryAddressId!: string | null;
  public driverId!: string | null;
  public completedAt!: Date | null;
  public notes!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    orderStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.UNPAID,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    deliveryMethod: {
      type: DataTypes.ENUM(...Object.values(DeliveryMethod)),
      allowNull: false,
      defaultValue: DeliveryMethod.PICKUP,
    },
    deliveryAddressId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["customerId"],
      },
      {
        fields: ["orderStatus"],
      },
      {
        fields: ["paymentStatus"],
      },
      {
        fields: ["driverId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

export default Order;
