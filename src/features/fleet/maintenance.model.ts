import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { MaintenanceRecordInterface } from "./interfaces/interfaces";
import FleetVehicle from "./model";

// Define optional fields for creation
interface MaintenanceRecordCreationInterface
  extends Optional<MaintenanceRecordInterface, "id"> {}

// Maintenance Record model definition
class MaintenanceRecord
  extends Model<MaintenanceRecordInterface, MaintenanceRecordCreationInterface>
  implements MaintenanceRecordInterface
{
  public id!: string;
  public vehicleId!: string;
  public serviceDate!: Date;
  public serviceType!: string;
  public description!: string;
  public cost!: number;
  public serviceProvider?: string;
  public technician?: string;
  public mileageAtService!: number;
  public partsReplaced?: string;
  public laborHours?: number;
  public nextServiceDueDate?: Date;
  public nextServiceDueMileage?: number;
  public status!: string;
  public notes?: string;
  public invoiceNumber?: string;
  public workOrderNumber?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaintenanceRecord.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FleetVehicle,
        key: "id",
      },
    },
    serviceDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    serviceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Type of service (routine, repair, inspection, etc.)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    serviceProvider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    technician: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mileageAtService: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    partsReplaced: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    laborHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    nextServiceDueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextServiceDueMileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "completed",
      comment: "Status of maintenance (scheduled, in-progress, completed)",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    workOrderNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "fleet_maintenance_records",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["vehicleId"],
      },
      {
        fields: ["serviceDate"],
      },
      {
        fields: ["serviceType"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["nextServiceDueDate"],
      },
    ],
  }
);

export default MaintenanceRecord;
