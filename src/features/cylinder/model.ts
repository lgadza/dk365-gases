import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { CylinderInterface, CylinderStatus } from "./interfaces/interfaces";
import CylinderType from "./cylinder-type.model";

// Define optional fields for creation (fields with default values or generated values like ID)
interface CylinderCreationInterface
  extends Optional<CylinderInterface, "id" | "createdAt" | "updatedAt"> {}

// Cylinder model definition
class Cylinder
  extends Model<CylinderInterface, CylinderCreationInterface>
  implements CylinderInterface
{
  public id!: string;
  public serialNumber!: string;
  public cylinderTypeId!: string;
  public manufacturerId!: string | null;
  public manufacturerName!: string | null;
  public manufacturingDate!: Date | null;
  public lastInspectionDate!: Date | null;
  public nextInspectionDate!: Date | null;
  public capacity!: number;
  public color!: string | null;
  public status!: string;
  public location!: string | null;
  public currentGasType!: string | null;
  public fillLevel!: number | null;
  public tare!: number | null;
  public valveType!: string | null;
  public currentPressure!: number | null;
  public maxPressure!: number | null;
  public batchNumber!: string | null;
  public notes!: string | null;
  public barcode!: string | null;
  public rfidTag!: string | null;
  public isActive!: boolean;
  public lastFilled!: Date | null;
  public lastLeakTest!: Date | null;
  public lastMaintenanceDate!: Date | null;
  public maintenanceDueDate!: Date | null;
  public assignedCustomerId!: string | null;
  public assignedCustomerName!: string | null;
  public createdBy!: string;
  public updatedBy!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Declare the association with CylinderType for TypeScript
  public readonly type?: CylinderType;

  // Check if cylinder needs inspection
  public needsInspection(daysThreshold: number = 30): boolean {
    if (!this.nextInspectionDate) return false;

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.nextInspectionDate <= thresholdDate;
  }

  // Check if cylinder is due for maintenance
  public needsMaintenance(daysThreshold: number = 30): boolean {
    if (!this.maintenanceDueDate) return false;

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.maintenanceDueDate <= thresholdDate;
  }

  // Calculate days until next inspection
  public daysUntilInspection(): number | null {
    if (!this.nextInspectionDate) return null;

    const today = new Date();
    const diffTime = this.nextInspectionDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get fill percentage
  public getFillPercentage(): number | null {
    if (this.fillLevel === null || this.capacity === 0) return null;
    return (this.fillLevel / this.capacity) * 100;
  }
}

Cylinder.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    serialNumber: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    cylinderTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "cylinder_types",
        key: "id",
      },
    },
    manufacturerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    manufacturerName: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    manufacturingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    lastInspectionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nextInspectionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    color: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: new DataTypes.STRING(20),
      allowNull: false,
      defaultValue: CylinderStatus.AVAILABLE,
      validate: {
        isIn: [Object.values(CylinderStatus)],
      },
    },
    location: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    currentGasType: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    fillLevel: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    valveType: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    currentPressure: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    maxPressure: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    batchNumber: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    barcode: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    rfidTag: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastFilled: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLeakTest: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    lastMaintenanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    maintenanceDueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    assignedCustomerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    assignedCustomerName: {
      type: new DataTypes.STRING(100),
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
    tableName: "cylinders",
    sequelize,
    timestamps: true,
  }
);

// Setup association - this must be executed after both models are initialized
Cylinder.belongsTo(CylinderType, {
  foreignKey: "cylinderTypeId",
  as: "type",
});

export default Cylinder;
