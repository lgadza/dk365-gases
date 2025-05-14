import { ICylinderService, ICylinderRepository } from "./interfaces/services";
import {
  CylinderDetailDTO,
  CreateCylinderDTO,
  UpdateCylinderDTO,
  PaginatedCylinderListDTO,
  CylinderListQueryParams,
  CylinderTypeDTO,
  CreateCylinderTypeDTO,
  UpdateCylinderTypeDTO,
  PaginatedCylinderTypeListDTO,
  CylinderTypeListQueryParams,
  CylinderMovementDTO,
  CreateCylinderMovementDTO,
  UpdateCylinderMovementDTO,
  PaginatedCylinderMovementListDTO,
  CylinderMovementListQueryParams,
  CylinderStatsDTO,
  CylinderDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";
import cache from "@/common/utils/cache/cacheUtil";
import {
  CylinderStatus,
  CylinderMovementType,
  CylinderTypeInterface,
} from "./interfaces/interfaces";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import bwipjs from "bwip-js";
import { createObjectCsvStringifier } from "csv-writer";
import Cylinder from "./model";
import CylinderType from "./cylinder-type.model";
import CylinderMovement from "./cylinder-movement.model";
import { Op } from "sequelize";

export class CylinderService implements ICylinderService {
  // Change from private to public for debugging purposes
  public repository: ICylinderRepository;
  private readonly CACHE_PREFIX = "cylinder:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ICylinderRepository) {
    this.repository = repository;
  }

  /**
   * Get cylinder by ID
   */
  public async getCylinderById(id: string): Promise<CylinderDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedCylinder = await cache.get(cacheKey);

      if (cachedCylinder) {
        return JSON.parse(cachedCylinder);
      }

      // Get from database if not in cache
      const cylinder = await this.repository.findCylinderById(id);
      if (!cylinder) {
        throw new NotFoundError(`Cylinder with ID ${id} not found`);
      }

      const cylinderType = await this.repository.findCylinderTypeById(
        cylinder.cylinderTypeId
      );

      // Map to DTO
      const cylinderDTO = CylinderDTOMapper.toDetailDTO(
        cylinder,
        cylinderType || undefined
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(cylinderDTO), this.CACHE_TTL);

      return cylinderDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderById service:", error);
      throw new AppError("Failed to get cylinder");
    }
  }

  /**
   * Get cylinder by serial number
   */
  public async getCylinderBySerialNumber(
    serialNumber: string
  ): Promise<CylinderDetailDTO> {
    try {
      const cylinder = await this.repository.findCylinderBySerialNumber(
        serialNumber
      );
      if (!cylinder) {
        throw new NotFoundError(
          `Cylinder with serial number ${serialNumber} not found`
        );
      }

      // Use the existing getCylinderById method to get the full details
      return this.getCylinderById(cylinder.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderBySerialNumber service:", error);
      throw new AppError("Failed to get cylinder by serial number");
    }
  }

  /**
   * Create a new cylinder
   */
  public async createCylinder(
    cylinderData: CreateCylinderDTO
  ): Promise<CylinderDetailDTO> {
    try {
      // Check if cylinder type exists
      const cylinderType = await this.repository.findCylinderTypeById(
        cylinderData.cylinderTypeId
      );
      if (!cylinderType) {
        throw new BadRequestError(
          `Cylinder type with ID ${cylinderData.cylinderTypeId} not found`
        );
      }

      // Check if serial number is already in use
      const existingCylinder = await this.repository.findCylinderBySerialNumber(
        cylinderData.serialNumber
      );
      if (existingCylinder) {
        throw new ConflictError(
          `Cylinder with serial number ${cylinderData.serialNumber} already exists`
        );
      }

      // Ensure dates are properly converted to Date objects
      if (
        cylinderData.manufacturingDate &&
        !(cylinderData.manufacturingDate instanceof Date)
      ) {
        cylinderData.manufacturingDate = new Date(
          cylinderData.manufacturingDate
        );
      }

      if (
        cylinderData.lastInspectionDate &&
        !(cylinderData.lastInspectionDate instanceof Date)
      ) {
        cylinderData.lastInspectionDate = new Date(
          cylinderData.lastInspectionDate
        );
      }

      if (
        cylinderData.nextInspectionDate &&
        !(cylinderData.nextInspectionDate instanceof Date)
      ) {
        cylinderData.nextInspectionDate = new Date(
          cylinderData.nextInspectionDate
        );
      }

      if (
        cylinderData.lastFilled &&
        !(cylinderData.lastFilled instanceof Date)
      ) {
        cylinderData.lastFilled = new Date(cylinderData.lastFilled);
      }

      if (
        cylinderData.lastLeakTest &&
        !(cylinderData.lastLeakTest instanceof Date)
      ) {
        cylinderData.lastLeakTest = new Date(cylinderData.lastLeakTest);
      }

      if (
        cylinderData.lastMaintenanceDate &&
        !(cylinderData.lastMaintenanceDate instanceof Date)
      ) {
        cylinderData.lastMaintenanceDate = new Date(
          cylinderData.lastMaintenanceDate
        );
      }

      if (
        cylinderData.maintenanceDueDate &&
        !(cylinderData.maintenanceDueDate instanceof Date)
      ) {
        cylinderData.maintenanceDueDate = new Date(
          cylinderData.maintenanceDueDate
        );
      }

      // Create the cylinder
      const newCylinder = await this.repository.createCylinder(cylinderData);

      // Get the complete cylinder
      return this.getCylinderById(newCylinder.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createCylinder service:", error);
      throw new AppError("Failed to create cylinder");
    }
  }

  /**
   * Update a cylinder
   */
  public async updateCylinder(
    id: string,
    cylinderData: UpdateCylinderDTO
  ): Promise<CylinderDetailDTO> {
    try {
      // Check if cylinder exists
      const existingCylinder = await this.repository.findCylinderById(id);
      if (!existingCylinder) {
        throw new NotFoundError(`Cylinder with ID ${id} not found`);
      }

      // Check if cylinder type exists if it's being updated
      if (cylinderData.cylinderTypeId) {
        const cylinderType = await this.repository.findCylinderTypeById(
          cylinderData.cylinderTypeId
        );
        if (!cylinderType) {
          throw new BadRequestError(
            `Cylinder type with ID ${cylinderData.cylinderTypeId} not found`
          );
        }
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Update cylinder
        await this.repository.updateCylinder(id, cylinderData, transaction);

        // If status is being changed, record a movement
        if (
          cylinderData.status &&
          cylinderData.status !== existingCylinder.status
        ) {
          const movementData: CreateCylinderMovementDTO = {
            cylinderId: id,
            movementType: CylinderMovementType.TRANSFER,
            fromStatus: existingCylinder.status,
            toStatus: cylinderData.status,
            transactionDate: new Date(),
            performedBy: cylinderData.updatedBy,
            createdBy: cylinderData.updatedBy,
          };

          // If location is also being changed, include in movement
          if (cylinderData.location !== undefined) {
            movementData.fromLocation = existingCylinder.location;
            movementData.toLocation = cylinderData.location;
          }

          await this.repository.createCylinderMovement(
            movementData,
            transaction
          );
        }

        // Commit the transaction
        await transaction.commit();

        // Clear cache
        await this.clearCylinderCache(id);

        // Get the updated cylinder
        return this.getCylinderById(id);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateCylinder service:", error);
      throw new AppError("Failed to update cylinder");
    }
  }

  /**
   * Delete a cylinder
   */
  public async deleteCylinder(id: string): Promise<boolean> {
    try {
      // Check if cylinder exists
      const existingCylinder = await this.repository.findCylinderById(id);
      if (!existingCylinder) {
        throw new NotFoundError(`Cylinder with ID ${id} not found`);
      }

      // Delete the cylinder
      const result = await this.repository.deleteCylinder(id);

      // Clear cache
      await this.clearCylinderCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteCylinder service:", error);
      throw new AppError("Failed to delete cylinder");
    }
  }

  /**
   * Get paginated cylinder list
   */
  public async getCylinderList(
    params: CylinderListQueryParams
  ): Promise<PaginatedCylinderListDTO> {
    try {
      // Log the incoming parameters for debugging
      logger.debug(
        "Getting cylinder list with params:",
        JSON.stringify(params)
      );

      // Ensure isActive is not restricting results unless explicitly set
      if (params.isActive === undefined) {
        // Don't filter by active status by default
        delete params.isActive;
      }

      const { cylinders, total } = await this.repository.getCylinderList(
        params
      );

      // Log the database query result counts
      logger.debug(
        `Cylinder database query returned ${cylinders.length} cylinders out of ${total} total`
      );

      if (cylinders.length === 0 && total === 0) {
        // This is suspicious - check if there are any cylinders at all
        const rawCount = await Cylinder.count();
        logger.debug(`Raw cylinder count in database: ${rawCount}`);

        if (rawCount > 0) {
          logger.warn(
            "Database has cylinders but query returned none. Check filters and permissions."
          );
        }
      }

      // Get all type IDs for efficiency
      const typeIds = [
        ...new Set(cylinders.map((cylinder) => cylinder.cylinderTypeId)),
      ];

      // Fetch all types in one query
      const types: Record<string, CylinderTypeInterface> = {};
      const cylinderTypes = await CylinderType.findAll({
        where: { id: { [Op.in]: typeIds } },
      });

      for (const type of cylinderTypes) {
        types[type.id] = type;
      }

      // Map to DTOs
      const cylinderDTOs = cylinders.map((cylinder) => {
        const type = types[cylinder.cylinderTypeId];
        const typeName = type ? type.name : "Unknown Type";
        const gasTypeName = type ? type.gasType : "Unknown Gas";

        return CylinderDTOMapper.toSimpleDTO(cylinder, typeName, gasTypeName);
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        cylinders: cylinderDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderList service:", error);
      throw new AppError("Failed to get cylinder list");
    }
  }

  /**
   * Get cylinders by type ID
   */
  public async getCylindersByTypeId(
    typeId: string
  ): Promise<CylinderDetailDTO[]> {
    try {
      // Check if cylinder type exists
      const cylinderType = await this.repository.findCylinderTypeById(typeId);
      if (!cylinderType) {
        throw new NotFoundError(`Cylinder type with ID ${typeId} not found`);
      }

      const cylinders = await this.repository.findCylindersByTypeId(typeId);

      // Map to DTOs
      return cylinders.map((cylinder) =>
        CylinderDTOMapper.toDetailDTO(cylinder, cylinderType)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylindersByTypeId service:", error);
      throw new AppError("Failed to get cylinders by type");
    }
  }

  /**
   * Get cylinders by customer ID
   */
  public async getCylindersByCustomerId(
    customerId: string
  ): Promise<CylinderDetailDTO[]> {
    try {
      const cylinders = await this.repository.findCylindersByCustomerId(
        customerId
      );

      // Get all type IDs for efficiency
      const typeIds = [
        ...new Set(cylinders.map((cylinder) => cylinder.cylinderTypeId)),
      ];

      // Fetch all types in one query
      const types: Record<string, CylinderTypeInterface> = {};
      const cylinderTypes = await CylinderType.findAll({
        where: { id: { [Op.in]: typeIds } },
      });

      for (const type of cylinderTypes) {
        types[type.id] = type;
      }

      // Map to DTOs
      return Promise.all(
        cylinders.map(async (cylinder) => {
          const type = types[cylinder.cylinderTypeId];
          return CylinderDTOMapper.toDetailDTO(cylinder, type);
        })
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylindersByCustomerId service:", error);
      throw new AppError("Failed to get customer cylinders");
    }
  }

  /**
   * Get cylinders by status
   */
  public async getCylindersByStatus(
    status: string
  ): Promise<CylinderDetailDTO[]> {
    try {
      // Validate status
      if (!Object.values(CylinderStatus).includes(status as CylinderStatus)) {
        throw new BadRequestError(`Invalid cylinder status: ${status}`);
      }

      const cylinders = await this.repository.findCylindersByStatus(status);

      // Get all type IDs for efficiency
      const typeIds = [
        ...new Set(cylinders.map((cylinder) => cylinder.cylinderTypeId)),
      ];

      // Fetch all types in one query
      const types: Record<string, CylinderTypeInterface> = {};
      const cylinderTypes = await CylinderType.findAll({
        where: { id: { [Op.in]: typeIds } },
      });

      for (const type of cylinderTypes) {
        types[type.id] = type;
      }

      // Map to DTOs
      return Promise.all(
        cylinders.map(async (cylinder) => {
          const type = types[cylinder.cylinderTypeId];
          return CylinderDTOMapper.toDetailDTO(cylinder, type);
        })
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylindersByStatus service:", error);
      throw new AppError("Failed to get cylinders by status");
    }
  }

  /**
   * Get cylinders due for inspection
   */
  public async getCylindersForInspection(
    daysThreshold: number = 30
  ): Promise<CylinderDetailDTO[]> {
    try {
      const cylinders = await this.repository.findCylindersForInspection(
        daysThreshold
      );

      // Get all type IDs for efficiency
      const typeIds = [
        ...new Set(cylinders.map((cylinder) => cylinder.cylinderTypeId)),
      ];

      // Fetch all types in one query
      const types: Record<string, CylinderTypeInterface> = {};
      const cylinderTypes = await CylinderType.findAll({
        where: { id: { [Op.in]: typeIds } },
      });

      for (const type of cylinderTypes) {
        types[type.id] = type;
      }

      // Map to DTOs
      return Promise.all(
        cylinders.map(async (cylinder) => {
          const type = types[cylinder.cylinderTypeId];
          return CylinderDTOMapper.toDetailDTO(cylinder, type);
        })
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylindersForInspection service:", error);
      throw new AppError("Failed to get cylinders for inspection");
    }
  }

  /**
   * Update cylinder status
   */
  public async updateCylinderStatus(
    id: string,
    status: string
  ): Promise<CylinderDetailDTO> {
    try {
      // Check if cylinder exists
      const existingCylinder = await this.repository.findCylinderById(id);
      if (!existingCylinder) {
        throw new NotFoundError(`Cylinder with ID ${id} not found`);
      }

      // Validate status
      if (!Object.values(CylinderStatus).includes(status as CylinderStatus)) {
        throw new BadRequestError(`Invalid cylinder status: ${status}`);
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Update status
        await this.repository.updateCylinderStatus(id, status, transaction);

        // Record a movement
        const movementData: CreateCylinderMovementDTO = {
          cylinderId: id,
          movementType: this.determineMovementTypeFromStatus(status),
          fromStatus: existingCylinder.status,
          toStatus: status,
          transactionDate: new Date(),
          performedBy: existingCylinder.updatedBy || existingCylinder.createdBy,
          createdBy: existingCylinder.updatedBy || existingCylinder.createdBy,
        };

        await this.repository.createCylinderMovement(movementData, transaction);

        // Commit the transaction
        await transaction.commit();

        // Clear cache
        await this.clearCylinderCache(id);

        // Get the updated cylinder
        return this.getCylinderById(id);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateCylinderStatus service:", error);
      throw new AppError("Failed to update cylinder status");
    }
  }

  /**
   * Get cylinder type by ID
   */
  public async getCylinderTypeById(id: string): Promise<CylinderTypeDTO> {
    try {
      const cylinderType = await this.repository.findCylinderTypeById(id);
      if (!cylinderType) {
        throw new NotFoundError(`Cylinder type with ID ${id} not found`);
      }

      return CylinderDTOMapper.toCylinderTypeDTO(cylinderType);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderTypeById service:", error);
      throw new AppError("Failed to get cylinder type");
    }
  }

  /**
   * Create a new cylinder type
   */
  public async createCylinderType(
    typeData: CreateCylinderTypeDTO
  ): Promise<CylinderTypeDTO> {
    try {
      const newType = await this.repository.createCylinderType(typeData);
      return CylinderDTOMapper.toCylinderTypeDTO(newType);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createCylinderType service:", error);
      throw new AppError("Failed to create cylinder type");
    }
  }

  /**
   * Update a cylinder type
   */
  public async updateCylinderType(
    id: string,
    typeData: UpdateCylinderTypeDTO
  ): Promise<CylinderTypeDTO> {
    try {
      // Check if cylinder type exists
      const existingType = await this.repository.findCylinderTypeById(id);
      if (!existingType) {
        throw new NotFoundError(`Cylinder type with ID ${id} not found`);
      }

      // Update type
      await this.repository.updateCylinderType(id, typeData);

      // Get the updated type
      const updatedType = await this.repository.findCylinderTypeById(id);
      if (!updatedType) {
        throw new NotFoundError(
          `Cylinder type with ID ${id} not found after update`
        );
      }

      return CylinderDTOMapper.toCylinderTypeDTO(updatedType);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateCylinderType service:", error);
      throw new AppError("Failed to update cylinder type");
    }
  }

  /**
   * Delete a cylinder type
   */
  public async deleteCylinderType(id: string): Promise<boolean> {
    try {
      // Check if cylinder type exists
      const existingType = await this.repository.findCylinderTypeById(id);
      if (!existingType) {
        throw new NotFoundError(`Cylinder type with ID ${id} not found`);
      }

      // Check if there are cylinders using this type
      const cylinders = await this.repository.findCylindersByTypeId(id);
      if (cylinders.length > 0) {
        throw new ConflictError(
          `Cannot delete cylinder type: ${cylinders.length} cylinders are using this type`
        );
      }

      // Delete the type
      return await this.repository.deleteCylinderType(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteCylinderType service:", error);
      throw new AppError("Failed to delete cylinder type");
    }
  }

  /**
   * Get paginated cylinder type list
   */
  public async getCylinderTypeList(
    params: CylinderTypeListQueryParams
  ): Promise<PaginatedCylinderTypeListDTO> {
    try {
      const { types, total } = await this.repository.getCylinderTypeList(
        params
      );

      // Map to DTOs
      const typeDTOs = types.map((type) =>
        CylinderDTOMapper.toCylinderTypeDTO(type)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        types: typeDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderTypeList service:", error);
      throw new AppError("Failed to get cylinder type list");
    }
  }

  /**
   * Record a cylinder movement
   */
  public async recordCylinderMovement(
    movementData: CreateCylinderMovementDTO
  ): Promise<CylinderMovementDTO> {
    try {
      // Check if cylinder exists
      const cylinder = await this.repository.findCylinderById(
        movementData.cylinderId
      );
      if (!cylinder) {
        throw new NotFoundError(
          `Cylinder with ID ${movementData.cylinderId} not found`
        );
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Create the movement
        const movement = await this.repository.createCylinderMovement(
          movementData,
          transaction
        );

        // Update cylinder status if a new status is provided
        if (
          movementData.toStatus &&
          movementData.toStatus !== cylinder.status
        ) {
          await this.repository.updateCylinderStatus(
            cylinder.id,
            movementData.toStatus,
            transaction
          );
        }

        // Update cylinder location if provided
        if (
          movementData.toLocation &&
          movementData.toLocation !== cylinder.location
        ) {
          await this.repository.updateCylinder(
            cylinder.id,
            {
              location: movementData.toLocation,
              updatedBy: movementData.createdBy,
            },
            transaction
          );
        }

        // Commit the transaction
        await transaction.commit();

        // Clear cylinder cache
        await this.clearCylinderCache(cylinder.id);

        // Return movement DTO
        return CylinderDTOMapper.toCylinderMovementDTO(
          movement,
          cylinder.serialNumber,
          "System" // Here we would normally fetch the user name
        );
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in recordCylinderMovement service:", error);
      throw new AppError("Failed to record cylinder movement");
    }
  }

  /**
   * Update a cylinder movement
   */
  public async updateCylinderMovement(
    id: string,
    movementData: UpdateCylinderMovementDTO
  ): Promise<CylinderMovementDTO> {
    try {
      // Check if movement exists
      const existingMovement = await this.repository.findCylinderMovementById(
        id
      );
      if (!existingMovement) {
        throw new NotFoundError(`Cylinder movement with ID ${id} not found`);
      }

      // Update movement
      await this.repository.updateCylinderMovement(id, movementData);

      // Get the updated movement
      const updatedMovement = await this.repository.findCylinderMovementById(
        id
      );
      if (!updatedMovement) {
        throw new NotFoundError(
          `Cylinder movement with ID ${id} not found after update`
        );
      }

      // Get the cylinder for additional info
      const cylinder = await this.repository.findCylinderById(
        updatedMovement.cylinderId
      );

      return CylinderDTOMapper.toCylinderMovementDTO(
        updatedMovement,
        cylinder ? cylinder.serialNumber : "Unknown",
        "System" // Here we would normally fetch the user name
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateCylinderMovement service:", error);
      throw new AppError("Failed to update cylinder movement");
    }
  }

  /**
   * Delete a cylinder movement
   */
  public async deleteCylinderMovement(id: string): Promise<boolean> {
    try {
      // Check if movement exists
      const existingMovement = await this.repository.findCylinderMovementById(
        id
      );
      if (!existingMovement) {
        throw new NotFoundError(`Cylinder movement with ID ${id} not found`);
      }

      // Delete the movement
      return await this.repository.deleteCylinderMovement(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteCylinderMovement service:", error);
      throw new AppError("Failed to delete cylinder movement");
    }
  }

  /**
   * Get cylinder movement by ID
   */
  public async getCylinderMovementById(
    id: string
  ): Promise<CylinderMovementDTO> {
    try {
      const movement = await this.repository.findCylinderMovementById(id);
      if (!movement) {
        throw new NotFoundError(`Cylinder movement with ID ${id} not found`);
      }

      // Get the cylinder for additional info
      const cylinder = await this.repository.findCylinderById(
        movement.cylinderId
      );

      return CylinderDTOMapper.toCylinderMovementDTO(
        movement,
        cylinder ? cylinder.serialNumber : "Unknown",
        "System" // Here we would normally fetch the user name
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderMovementById service:", error);
      throw new AppError("Failed to get cylinder movement");
    }
  }

  /**
   * Get cylinder movements by cylinder ID
   */
  public async getCylinderMovementsByCylinderId(
    cylinderId: string
  ): Promise<CylinderMovementDTO[]> {
    try {
      // Check if cylinder exists
      const cylinder = await this.repository.findCylinderById(cylinderId);
      if (!cylinder) {
        throw new NotFoundError(`Cylinder with ID ${cylinderId} not found`);
      }

      const movements = await this.repository.getCylinderMovementsByCylinderId(
        cylinderId
      );

      return movements.map((movement) =>
        CylinderDTOMapper.toCylinderMovementDTO(
          movement,
          cylinder.serialNumber,
          "System" // Here we would normally fetch the user name
        )
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderMovementsByCylinderId service:", error);
      throw new AppError("Failed to get cylinder movements");
    }
  }

  /**
   * Get paginated cylinder movement list
   */
  public async getCylinderMovementList(
    params: CylinderMovementListQueryParams
  ): Promise<PaginatedCylinderMovementListDTO> {
    try {
      const { movements, total } =
        await this.repository.getCylinderMovementList(params);

      // Get all cylinder IDs for efficiency
      const cylinderIds = [
        ...new Set(movements.map((movement) => movement.cylinderId)),
      ];

      // Fetch all cylinders in one query
      const cylinders: Record<string, string> = {};
      const cylinderEntities = await Cylinder.findAll({
        attributes: ["id", "serialNumber"],
        where: { id: { [Op.in]: cylinderIds } },
      });

      for (const cylinder of cylinderEntities) {
        cylinders[cylinder.id] = cylinder.serialNumber;
      }

      // Map to DTOs
      const movementDTOs = movements.map((movement) => {
        const serialNumber = cylinders[movement.cylinderId] || "Unknown";
        return CylinderDTOMapper.toCylinderMovementDTO(
          movement,
          serialNumber,
          "System" // Here we would normally fetch the user name
        );
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        movements: movementDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCylinderMovementList service:", error);
      throw new AppError("Failed to get cylinder movement list");
    }
  }

  /**
   * Calculate cylinder inventory statistics
   */
  public async calculateCylinderStats(): Promise<CylinderStatsDTO> {
    try {
      // Get all cylinders with their type information
      const allCylinders = await Cylinder.findAll({
        include: [{ model: CylinderType, as: "type" }],
      });

      // Calculate statistics
      const stats: CylinderStatsDTO = {
        totalCylinders: allCylinders.length,
        activeCylinders: allCylinders.filter((c) => c.isActive).length,
        byStatus: {},
        byGasType: {},
        byLocation: {},
        byCylinderType: {},
        needInspection: 0,
        needMaintenance: 0,
        availableForFilling: 0,
        loaned: 0,
        loanedByCustomer: {},
      };

      // Process each cylinder
      for (const cylinder of allCylinders) {
        // By status
        if (!stats.byStatus[cylinder.status]) {
          stats.byStatus[cylinder.status] = 0;
        }
        stats.byStatus[cylinder.status]++;

        // By gas type (from cylinder type)
        // Cast cylinder to any to access the 'type' property that comes from the include
        const cylinderWithType = cylinder as any;
        const gasType = cylinderWithType.type
          ? cylinderWithType.type.gasType
          : "unknown";
        if (!stats.byGasType[gasType]) {
          stats.byGasType[gasType] = 0;
        }
        stats.byGasType[gasType]++;

        // By location
        if (cylinder.location) {
          if (!stats.byLocation[cylinder.location]) {
            stats.byLocation[cylinder.location] = 0;
          }
          stats.byLocation[cylinder.location]++;
        }

        // By cylinder type
        const typeName = cylinderWithType.type
          ? cylinderWithType.type.name
          : "unknown";
        if (!stats.byCylinderType[typeName]) {
          stats.byCylinderType[typeName] = 0;
        }
        stats.byCylinderType[typeName]++;

        // Needs inspection
        const cylinderInstance =
          cylinder instanceof Cylinder
            ? cylinder
            : Object.assign(new Cylinder(), cylinder);

        if (cylinderInstance.needsInspection()) {
          stats.needInspection++;
        }

        // Needs maintenance
        if (cylinderInstance.needsMaintenance()) {
          stats.needMaintenance++;
        }

        // Available for filling
        if (
          cylinder.status === CylinderStatus.EMPTY ||
          cylinder.status === CylinderStatus.AVAILABLE
        ) {
          stats.availableForFilling++;
        }

        // Loaned cylinders
        if (cylinder.status === CylinderStatus.LOANED) {
          stats.loaned++;
          if (cylinder.assignedCustomerId && cylinder.assignedCustomerName) {
            if (!stats.loanedByCustomer[cylinder.assignedCustomerName]) {
              stats.loanedByCustomer[cylinder.assignedCustomerName] = 0;
            }
            stats.loanedByCustomer[cylinder.assignedCustomerName]++;
          }
        }
      }

      return stats;
    } catch (error) {
      logger.error("Error in calculateCylinderStats service:", error);
      throw new AppError("Failed to calculate cylinder statistics");
    }
  }

  /**
   * Generate cylinder inventory report
   */
  public async generateInventoryReport(
    params?: Partial<CylinderListQueryParams>
  ): Promise<Buffer> {
    try {
      // Get cylinders based on parameters
      const { cylinders } = await this.repository.getCylinderList(params || {});

      // Create a PDF document
      const pdfBuffer: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      // Collect PDF data chunks
      doc.on("data", (chunk) => pdfBuffer.push(chunk));

      // Build PDF content
      // Header
      doc.fontSize(20).text("CYLINDER INVENTORY REPORT", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Filter criteria if provided
      if (params) {
        doc.fontSize(14).text("Filter Criteria");
        if (params.status) doc.fontSize(12).text(`Status: ${params.status}`);
        if (params.gasType)
          doc.fontSize(12).text(`Gas Type: ${params.gasType}`);
        if (params.location)
          doc.fontSize(12).text(`Location: ${params.location}`);
        if (params.cylinderTypeId)
          doc.fontSize(12).text(`Cylinder Type ID: ${params.cylinderTypeId}`);
        if (params.customerId)
          doc.fontSize(12).text(`Customer ID: ${params.customerId}`);
        if (params.needsInspection)
          doc.fontSize(12).text("Needs Inspection: Yes");
        if (params.needsMaintenance)
          doc.fontSize(12).text("Needs Maintenance: Yes");
        doc.moveDown();
      }

      // Summary
      doc.fontSize(14).text("Summary");
      doc.fontSize(12).text(`Total Cylinders: ${cylinders.length}`);

      // Count by status
      const statusCounts: Record<string, number> = {};
      for (const cylinder of cylinders) {
        if (!statusCounts[cylinder.status]) {
          statusCounts[cylinder.status] = 0;
        }
        statusCounts[cylinder.status]++;
      }

      for (const [status, count] of Object.entries(statusCounts)) {
        doc.text(`${status}: ${count}`);
      }

      doc.moveDown();

      // Table of cylinders
      doc.fontSize(14).text("Cylinder Details");
      doc.moveDown(0.5);

      // Table headers
      const tableTop = doc.y;
      const serialNumberX = 50;
      const typeX = 150;
      const statusX = 250;
      const locationX = 350;
      const nextInspectionX = 450;

      doc
        .fontSize(10)
        .text("Serial #", serialNumberX, tableTop)
        .text("Type", typeX, tableTop)
        .text("Status", statusX, tableTop)
        .text("Location", locationX, tableTop)
        .text("Next Inspection", nextInspectionX, tableTop);

      // Add cylinders
      let tableRowY = tableTop + 20;

      for (const cylinder of cylinders) {
        // Get type
        const type = await this.repository.findCylinderTypeById(
          cylinder.cylinderTypeId
        );
        const typeName = type ? type.name : "Unknown";

        doc
          .fontSize(10)
          .text(cylinder.serialNumber, serialNumberX, tableRowY)
          .text(typeName, typeX, tableRowY)
          .text(cylinder.status, statusX, tableRowY)
          .text(cylinder.location || "N/A", locationX, tableRowY)
          .text(
            cylinder.nextInspectionDate
              ? cylinder.nextInspectionDate.toLocaleDateString()
              : "N/A",
            nextInspectionX,
            tableRowY
          );

        tableRowY += 20;

        // Add a new page if we're near the bottom
        if (tableRowY > doc.page.height - 50) {
          doc.addPage();
          tableRowY = 50;
        }
      }

      // Finalize the PDF
      doc.end();

      // Return the PDF as a Buffer
      return Buffer.concat(pdfBuffer);
    } catch (error) {
      logger.error("Error in generateInventoryReport service:", error);
      throw new AppError("Failed to generate inventory report");
    }
  }

  /**
   * Export cylinder data to CSV
   */
  public async exportCylindersToCSV(
    params?: Partial<CylinderListQueryParams>
  ): Promise<string> {
    try {
      // Get cylinders based on parameters
      const { cylinders } = await this.repository.getCylinderList(params || {});

      // Get all type IDs for efficiency
      const typeIds = [
        ...new Set(cylinders.map((cylinder) => cylinder.cylinderTypeId)),
      ];

      // Fetch all types in one query
      const types: Record<string, CylinderTypeInterface> = {};
      const cylinderTypes = await CylinderType.findAll({
        where: { id: { [Op.in]: typeIds } },
      });

      for (const type of cylinderTypes) {
        types[type.id] = type;
      }

      // Create CSV header and data
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "serialNumber", title: "Serial Number" },
          { id: "type", title: "Type" },
          { id: "gasType", title: "Gas Type" },
          { id: "capacity", title: "Capacity" },
          { id: "status", title: "Status" },
          { id: "location", title: "Location" },
          { id: "fillLevel", title: "Fill Level" },
          { id: "nextInspection", title: "Next Inspection" },
          { id: "maintenanceDue", title: "Maintenance Due" },
          { id: "customer", title: "Assigned Customer" },
        ],
      });

      const records = cylinders.map((cylinder) => {
        const type = types[cylinder.cylinderTypeId];

        return {
          serialNumber: cylinder.serialNumber,
          type: type ? type.name : "Unknown",
          gasType: type ? type.gasType : "Unknown",
          capacity: cylinder.capacity,
          status: cylinder.status,
          location: cylinder.location || "N/A",
          fillLevel: cylinder.fillLevel ? `${cylinder.fillLevel}` : "N/A",
          nextInspection: cylinder.nextInspectionDate
            ? cylinder.nextInspectionDate.toLocaleDateString()
            : "N/A",
          maintenanceDue: cylinder.maintenanceDueDate
            ? cylinder.maintenanceDueDate.toLocaleDateString()
            : "N/A",
          customer: cylinder.assignedCustomerName || "N/A",
        };
      });

      // Generate CSV
      return (
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(records)
      );
    } catch (error) {
      logger.error("Error in exportCylindersToCSV service:", error);
      throw new AppError("Failed to export cylinders to CSV");
    }
  }

  /**
   * Generate QR code for a cylinder
   */
  public async generateCylinderQRCode(id: string): Promise<Buffer> {
    try {
      // Check if cylinder exists
      const cylinder = await this.repository.findCylinderById(id);
      if (!cylinder) {
        throw new NotFoundError(`Cylinder with ID ${id} not found`);
      }

      // Data to encode in QR
      const qrData = {
        id: cylinder.id,
        serialNumber: cylinder.serialNumber,
        capacity: cylinder.capacity,
        type: cylinder.cylinderTypeId,
        url: `https://yourdomain.com/cylinders/${cylinder.id}`,
      };

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

      // Convert data URL to buffer
      const data = qrCodeDataURL.split(",")[1];
      return Buffer.from(data, "base64");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in generateCylinderQRCode service:", error);
      throw new AppError("Failed to generate cylinder QR code");
    }
  }

  /**
   * Generate barcode for a cylinder
   */
  public async generateCylinderBarcode(id: string): Promise<Buffer> {
    try {
      // Check if cylinder exists
      const cylinder = await this.repository.findCylinderById(id);
      if (!cylinder) {
        throw new NotFoundError(`Cylinder with ID ${id} not found`);
      }

      // Generate barcode
      const barcodeBuffer = await new Promise<Buffer>((resolve, reject) => {
        bwipjs.toBuffer(
          {
            bcid: "code128",
            text: cylinder.serialNumber,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: "center",
          },
          (err, png) => {
            if (err) reject(err);
            else resolve(png);
          }
        );
      });

      return barcodeBuffer;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in generateCylinderBarcode service:", error);
      throw new AppError("Failed to generate cylinder barcode");
    }
  }

  /**
   * Helper method to determine movement type from status
   */
  private determineMovementTypeFromStatus(status: string): string {
    switch (status) {
      case CylinderStatus.FILLED:
        return CylinderMovementType.FILL;
      case CylinderStatus.EMPTY:
        return CylinderMovementType.EMPTY;
      case CylinderStatus.LOANED:
        return CylinderMovementType.LOAN;
      case CylinderStatus.AVAILABLE:
        return CylinderMovementType.RETURN;
      case CylinderStatus.MAINTENANCE:
        return CylinderMovementType.MAINTENANCE;
      case CylinderStatus.TESTING:
        return CylinderMovementType.INSPECTION;
      case CylinderStatus.DAMAGED:
      case CylinderStatus.SCRAPPED:
        return CylinderMovementType.DISPOSE;
      default:
        return CylinderMovementType.TRANSFER;
    }
  }

  /**
   * Clear cylinder cache
   */
  private async clearCylinderCache(cylinderId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${cylinderId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new CylinderService(repository);
