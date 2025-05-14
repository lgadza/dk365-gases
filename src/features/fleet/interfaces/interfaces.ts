/**
 * Fleet Vehicle Interface
 */
export interface FleetVehicleInterface {
  id: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: string;
  capacity?: number;
  capacityUnit?: string;
  fuelType: string;
  fuelConsumptionRate?: number;
  purchaseDate?: Date;
  purchaseCost?: number;
  currentMileage: number;
  assignedDriverId?: string;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  nextMaintenanceMileage?: number;
  notes?: string;
  registrationExpiryDate?: Date;
  insuranceExpiryDate?: Date;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  gpsTrackingId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Maintenance Record Interface
 */
export interface MaintenanceRecordInterface {
  id: string;
  vehicleId: string;
  serviceDate: Date;
  serviceType: string;
  description: string;
  cost: number;
  serviceProvider?: string;
  technician?: string;
  mileageAtService: number;
  partsReplaced?: string;
  laborHours?: number;
  nextServiceDueDate?: Date;
  nextServiceDueMileage?: number;
  status: string;
  notes?: string;
  invoiceNumber?: string;
  workOrderNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
