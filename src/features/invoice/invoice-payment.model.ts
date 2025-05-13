import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import {
  InvoicePaymentInterface,
  PaymentMethod,
} from "./interfaces/interfaces";

// Define optional fields for creation
interface InvoicePaymentCreationInterface
  extends Optional<InvoicePaymentInterface, "id" | "createdAt" | "updatedAt"> {}

// Invoice Payment model definition
class InvoicePayment
  extends Model<InvoicePaymentInterface, InvoicePaymentCreationInterface>
  implements InvoicePaymentInterface
{
  public id!: string;
  public invoiceId!: string;
  public amount!: number;
  public paymentDate!: Date;
  public paymentMethod!: string;
  public reference!: string | null;
  public notes!: string | null;
  public createdBy!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InvoicePayment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "invoices",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paymentMethod: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [Object.values(PaymentMethod)],
      },
    },
    reference: {
      type: new DataTypes.STRING(100),
      allowNull: true,
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
    tableName: "invoice_payments",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["invoiceId"],
      },
      {
        fields: ["paymentDate"],
      },
    ],
  }
);

export default InvoicePayment;
