import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { FleetVehicleInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface FleetVehicleCreationInterface
  extends Optional<FleetVehicleInterface, "id"> {}

// Fleet Vehicle model definition
class FleetVehicle
  extends Model<FleetVehicleInterface, FleetVehicleCreationInterface>
  implements FleetVehicleInterface
{
  public id!: string;
  public vehicleType!: string;
  public make!: string;
  public model!: string;
  public year!: number;
  public vin!: string;
  public licensePlate!: string;
  public status!: string;
  public capacity?: number;
  public capacityUnit?: string;
  public fuelType!: string;
  public fuelConsumptionRate?: number;
  public purchaseDate?: Date;
  public purchaseCost?: number;
  public currentMileage!: number;
  public assignedDriverId?: string;
  public lastMaintenanceDate?: Date;
  public nextMaintenanceDate?: Date;
  public nextMaintenanceMileage?: number;
  public notes?: string;
  public registrationExpiryDate?: Date;
  public insuranceExpiryDate?: Date;
  public insuranceProvider?: string;
  public insurancePolicyNumber?: string;
  public gpsTrackingId?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FleetVehicle.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    vehicleType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Type of vehicle (delivery, tanker, etc.)",
    },
    make: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vin: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    licensePlate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
      comment: "Vehicle status (active, maintenance, out-of-service)",
    },
    capacity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Cargo or tank capacity",
    },
    capacityUnit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Unit of capacity measurement (liters, kg, cubic meters)",
    },
    fuelType: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    fuelConsumptionRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Average fuel consumption (L/100km or mpg)",
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    purchaseCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currentMileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    assignedDriverId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the assigned driver (reference to User table)",
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextMaintenanceMileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    registrationExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    insuranceExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    insuranceProvider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    insurancePolicyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    gpsTrackingId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID or reference for GPS tracking system",
    },
  },
  {
    tableName: "fleet_vehicles",
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ["status"],
      },
      {
        fields: ["vehicleType"],
      },
      {
        fields: ["assignedDriverId"],
      },
      {
        fields: ["nextMaintenanceDate"],
      },
    ],
  }
);

export default FleetVehicle;
