import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { InvoiceInterface, InvoiceStatus } from "./interfaces/interfaces";
import InvoiceItem from "./invoice-item.model";
import InvoicePayment from "./invoice-payment.model";

// Define optional fields for creation (fields with default values or generated values like ID)
interface InvoiceCreationInterface
  extends Optional<InvoiceInterface, "id" | "createdAt" | "updatedAt"> {}

// Invoice model definition
class Invoice
  extends Model<InvoiceInterface, InvoiceCreationInterface>
  implements InvoiceInterface
{
  public id!: string;
  public invoiceNumber!: string;
  public customerId!: string;
  public customerName!: string;
  public billingAddressId!: string | null;
  public shippingAddressId!: string | null;
  public issueDate!: Date;
  public dueDate!: Date;
  public status!: string;
  public subtotal!: number;
  public taxAmount!: number;
  public discountAmount!: number;
  public totalAmount!: number;
  public notes!: string | null;
  public paymentTerms!: string;
  public paymentMethod!: string | null;
  public currency!: string;
  public exchangeRate!: number | null;
  public isPaid!: boolean;
  public paidAmount!: number;
  public paidDate!: Date | null;
  public createdBy!: string;
  public updatedBy!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Check if invoice is overdue
  public isOverdue(): boolean {
    const today = new Date();
    return !this.isPaid && today > this.dueDate;
  }

  // Calculate remaining amount to be paid
  public getRemainingAmount(): number {
    return this.totalAmount - this.paidAmount;
  }

  // Check if invoice is partially paid
  public isPartiallyPaid(): boolean {
    return this.paidAmount > 0 && this.paidAmount < this.totalAmount;
  }
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    invoiceNumber: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customerName: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    billingAddressId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    shippingAddressId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: new DataTypes.STRING(20),
      allowNull: false,
      defaultValue: InvoiceStatus.DRAFT,
      validate: {
        isIn: [Object.values(InvoiceStatus)],
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTerms: {
      type: new DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Net 30",
    },
    paymentMethod: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    currency: {
      type: new DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paidDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "invoices",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for invoice number searches
        fields: ["invoiceNumber"],
        unique: true,
      },
      {
        // Index for customer searches
        fields: ["customerId"],
      },
      {
        // Index for status searches
        fields: ["status"],
      },
      {
        // Index for date range searches
        fields: ["issueDate"],
      },
      {
        // Index for due date searches
        fields: ["dueDate"],
      },
      {
        // Index for payment status
        fields: ["isPaid"],
      },
    ],
  }
);

// Setup associations
Invoice.hasMany(InvoiceItem, {
  sourceKey: "id",
  foreignKey: "invoiceId",
  as: "items",
  onDelete: "CASCADE",
});

Invoice.hasMany(InvoicePayment, {
  sourceKey: "id",
  foreignKey: "invoiceId",
  as: "payments",
  onDelete: "CASCADE",
});

export default Invoice;
