import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { InvoiceItemInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface InvoiceItemCreationInterface
  extends Optional<
    InvoiceItemInterface,
    "id" | "taxAmount" | "subtotal" | "total" | "createdAt" | "updatedAt"
  > {}

// Invoice Item model definition
class InvoiceItem
  extends Model<InvoiceItemInterface, InvoiceItemCreationInterface>
  implements InvoiceItemInterface
{
  public id!: string;
  public invoiceId!: string;
  public productId!: string;
  public productName!: string;
  public description!: string | null;
  public quantity!: number;
  public unitPrice!: number;
  public unitOfMeasurement!: string;
  public taxRate!: number;
  public taxAmount!: number;
  public subtotal!: number;
  public total!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Calculate subtotal
  public calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }

  // Calculate tax amount
  public calculateTaxAmount(): number {
    return this.subtotal * (this.taxRate / 100);
  }

  // Calculate total
  public calculateTotal(): number {
    return this.subtotal + this.taxAmount;
  }
}

InvoiceItem.init(
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productName: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    unitOfMeasurement: {
      type: new DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "unit",
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
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
    tableName: "invoice_items",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["invoiceId"],
      },
      {
        fields: ["productId"],
      },
    ],
    hooks: {
      beforeCreate: (item: InvoiceItem) => {
        item.subtotal = item.calculateSubtotal();
        item.taxAmount = item.calculateTaxAmount();
        item.total = item.calculateTotal();
      },
      beforeUpdate: (item: InvoiceItem) => {
        item.subtotal = item.calculateSubtotal();
        item.taxAmount = item.calculateTaxAmount();
        item.total = item.calculateTotal();
      },
    },
  }
);

export default InvoiceItem;
