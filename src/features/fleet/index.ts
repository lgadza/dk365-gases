import FleetVehicle from "./model";
import MaintenanceRecord from "./maintenance.model";
import fleetService from "./service";
import fleetController from "./controller";
import fleetRepository from "./repository";
import fleetValidationSchemas from "./validation";
import fleetRoutes from "./routes";
import {
  FleetVehicleInterface,
  MaintenanceRecordInterface,
} from "./interfaces/interfaces";
import {
  FleetVehicleDetailDTO,
  FleetVehicleBaseDTO,
  CreateFleetVehicleDTO,
  UpdateFleetVehicleDTO,
  FleetVehicleListQueryParams,
  PaginatedFleetVehicleListDTO,
  MaintenanceRecordDetailDTO,
  MaintenanceRecordBaseDTO,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceRecordListQueryParams,
  PaginatedMaintenanceRecordListDTO,
  FleetVehicleStatusSummaryDTO,
  MaintenanceScheduleSummaryDTO,
  FleetDTOMapper,
} from "./dto";
import { IFleetRepository, IFleetService } from "./interfaces/services";

export {
  FleetVehicle,
  MaintenanceRecord,
  fleetService,
  fleetController,
  fleetRepository,
  fleetValidationSchemas,
  fleetRoutes,
  FleetVehicleInterface,
  MaintenanceRecordInterface,
  FleetVehicleDetailDTO,
  FleetVehicleBaseDTO,
  CreateFleetVehicleDTO,
  UpdateFleetVehicleDTO,
  FleetVehicleListQueryParams,
  PaginatedFleetVehicleListDTO,
  MaintenanceRecordDetailDTO,
  MaintenanceRecordBaseDTO,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceRecordListQueryParams,
  PaginatedMaintenanceRecordListDTO,
  FleetVehicleStatusSummaryDTO,
  MaintenanceScheduleSummaryDTO,
  FleetDTOMapper,
  IFleetRepository,
  IFleetService,
};

export default FleetVehicle;
