# Fleet Management Module

This module provides a comprehensive system for managing gas delivery and tanker trucks, including maintenance scheduling and tracking.

## Features

- **Vehicle Management**

  - Track different types of vehicles (delivery trucks, gas tankers)
  - Maintain detailed vehicle information (make, model, year, VIN, license plate, etc.)
  - Monitor vehicle status (active, maintenance, out-of-service, retired)
  - Record vehicle specs like capacity and fuel consumption

- **Maintenance Tracking**

  - Schedule preventive maintenance
  - Record repair history
  - Track maintenance costs
  - Set up maintenance due dates and mileage reminders

- **Driver Assignments**

  - Assign drivers to vehicles
  - Track which drivers are responsible for which vehicles

- **Reporting and Analytics**
  - View vehicles requiring maintenance
  - Get fleet status summaries
  - Track maintenance histories
  - Monitor vehicle availability

## API Endpoints

### Vehicles

- `GET /api/v1/fleet/vehicles` - Get a list of all vehicles
- `GET /api/v1/fleet/vehicles/:id` - Get details for a specific vehicle
- `POST /api/v1/fleet/vehicles` - Add a new vehicle
- `PUT /api/v1/fleet/vehicles/:id` - Update a vehicle
- `DELETE /api/v1/fleet/vehicles/:id` - Delete a vehicle
- `PATCH /api/v1/fleet/vehicles/:id/status` - Update a vehicle's status
- `PATCH /api/v1/fleet/vehicles/:id/mileage` - Update a vehicle's mileage
- `PATCH /api/v1/fleet/vehicles/:id/driver` - Assign a driver to a vehicle
- `GET /api/v1/fleet/vehicles/status/:status` - Get vehicles by status
- `GET /api/v1/fleet/vehicles/type/:type` - Get vehicles by type
- `GET /api/v1/fleet/vehicles/maintenance/required` - Get vehicles requiring maintenance

### Maintenance Records

- `GET /api/v1/fleet/maintenance` - Get all maintenance records
- `GET /api/v1/fleet/maintenance/:id` - Get a specific maintenance record
- `POST /api/v1/fleet/maintenance` - Create a maintenance record
- `PUT /api/v1/fleet/maintenance/:id` - Update a maintenance record
- `DELETE /api/v1/fleet/maintenance/:id` - Delete a maintenance record
- `GET /api/v1/fleet/vehicles/:vehicleId/maintenance` - Get maintenance history for a vehicle
- `PATCH /api/v1/fleet/maintenance/:id/status` - Update maintenance status
- `GET /api/v1/fleet/maintenance/upcoming` - Get upcoming maintenance schedule
- `GET /api/v1/fleet/maintenance/status/:status` - Get maintenance records by status
- `POST /api/v1/fleet/vehicles/:vehicleId/maintenance/schedule` - Schedule maintenance for a vehicle

### Fleet Summary

- `GET /api/v1/fleet/summary` - Get fleet summary statistics

## Models

### FleetVehicle

The primary vehicle model with fields for tracking all aspects of delivery and tanker trucks.

### MaintenanceRecord

Tracks all maintenance activities performed on vehicles with costs and future maintenance predictions.

## Implementation

This module uses Sequelize for database operations with PostgreSQL and follows the repository pattern for data access. It includes comprehensive validation and error handling.
