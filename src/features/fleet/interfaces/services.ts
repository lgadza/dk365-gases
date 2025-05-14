import { Transaction } from "sequelize";
import {
  FleetVehicleInterface,
  MaintenanceRecordInterface,
} from "./interfaces";
import {
  FleetVehicleDetailDTO,
  CreateFleetVehicleDTO,
  UpdateFleetVehicleDTO,
  FleetVehicleListQueryParams,
  PaginatedFleetVehicleListDTO,
  MaintenanceRecordDetailDTO,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceRecordListQueryParams,
  PaginatedMaintenanceRecordListDTO,
  FleetVehicleStatusSummaryDTO,
  MaintenanceScheduleSummaryDTO,
} from "../dto";

export interface IFleetRepository {
  // Vehicle operations
  findVehicleById(id: string): Promise<FleetVehicleInterface | null>;
  createVehicle(
    vehicleData: CreateFleetVehicleDTO,
    transaction?: Transaction
  ): Promise<FleetVehicleInterface>;
  updateVehicle(
    id: string,
    vehicleData: UpdateFleetVehicleDTO,
    transaction?: Transaction
  ): Promise<boolean>;
  deleteVehicle(id: string, transaction?: Transaction): Promise<boolean>;
  getVehicleList(params: FleetVehicleListQueryParams): Promise<{
    vehicles: FleetVehicleInterface[];
    total: number;
  }>;
  updateVehicleStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean>;
  updateVehicleMileage(
    id: string,
    mileage: number,
    transaction?: Transaction
  ): Promise<boolean>;
  assignDriverToVehicle(
    id: string,
    driverId: string | null,
    transaction?: Transaction
  ): Promise<boolean>;
  getVehiclesByStatus(status: string): Promise<FleetVehicleInterface[]>;
  getVehiclesByType(vehicleType: string): Promise<FleetVehicleInterface[]>;
  getVehiclesRequiringMaintenance(): Promise<FleetVehicleInterface[]>;
  getVehicleStatusSummary(): Promise<Record<string, number>>;

  // Maintenance operations
  findMaintenanceById(id: string): Promise<MaintenanceRecordInterface | null>;
  createMaintenance(
    maintenanceData: CreateMaintenanceRecordDTO,
    transaction?: Transaction
  ): Promise<MaintenanceRecordInterface>;
  updateMaintenance(
    id: string,
    maintenanceData: UpdateMaintenanceRecordDTO,
    transaction?: Transaction
  ): Promise<boolean>;
  deleteMaintenance(id: string, transaction?: Transaction): Promise<boolean>;
  getMaintenanceList(params: MaintenanceRecordListQueryParams): Promise<{
    records: MaintenanceRecordInterface[];
    total: number;
  }>;
  getVehicleMaintenanceHistory(
    vehicleId: string
  ): Promise<MaintenanceRecordInterface[]>;
  updateMaintenanceStatus(
    id: string,
    status: string,
    transaction?: Transaction
  ): Promise<boolean>;
  getUpcomingMaintenanceSchedule(): Promise<MaintenanceRecordInterface[]>;
  getMaintenanceByStatus(status: string): Promise<MaintenanceRecordInterface[]>;
}

export interface IFleetService {
  // Vehicle operations
  getVehicleById(id: string): Promise<FleetVehicleDetailDTO>;
  createVehicle(
    vehicleData: CreateFleetVehicleDTO
  ): Promise<FleetVehicleDetailDTO>;
  updateVehicle(
    id: string,
    vehicleData: UpdateFleetVehicleDTO
  ): Promise<FleetVehicleDetailDTO>;
  deleteVehicle(id: string): Promise<boolean>;
  getVehicleList(
    params: FleetVehicleListQueryParams
  ): Promise<PaginatedFleetVehicleListDTO>;
  updateVehicleStatus(
    id: string,
    status: string
  ): Promise<FleetVehicleDetailDTO>;
  updateVehicleMileage(
    id: string,
    mileage: number
  ): Promise<FleetVehicleDetailDTO>;
  assignDriverToVehicle(
    id: string,
    driverId: string | null
  ): Promise<FleetVehicleDetailDTO>;
  getVehiclesByStatus(status: string): Promise<FleetVehicleDetailDTO[]>;
  getVehiclesByType(vehicleType: string): Promise<FleetVehicleDetailDTO[]>;
  getVehiclesRequiringMaintenance(): Promise<FleetVehicleDetailDTO[]>;
  getFleetSummary(): Promise<FleetVehicleStatusSummaryDTO>;

  // Maintenance operations
  getMaintenanceById(id: string): Promise<MaintenanceRecordDetailDTO>;
  createMaintenance(
    maintenanceData: CreateMaintenanceRecordDTO
  ): Promise<MaintenanceRecordDetailDTO>;
  updateMaintenance(
    id: string,
    maintenanceData: UpdateMaintenanceRecordDTO
  ): Promise<MaintenanceRecordDetailDTO>;
  deleteMaintenance(id: string): Promise<boolean>;
  getMaintenanceList(
    params: MaintenanceRecordListQueryParams
  ): Promise<PaginatedMaintenanceRecordListDTO>;
  getVehicleMaintenanceHistory(
    vehicleId: string
  ): Promise<MaintenanceRecordDetailDTO[]>;
  updateMaintenanceStatus(
    id: string,
    status: string
  ): Promise<MaintenanceRecordDetailDTO>;
  getUpcomingMaintenanceSchedule(): Promise<MaintenanceScheduleSummaryDTO>;
  getMaintenanceByStatus(status: string): Promise<MaintenanceRecordDetailDTO[]>;
  scheduleVehicleMaintenance(
    vehicleId: string,
    maintenanceData: CreateMaintenanceRecordDTO
  ): Promise<MaintenanceRecordDetailDTO>;
}
