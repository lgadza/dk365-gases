import { IOrderRepository } from "./interfaces/services";
import { OrderInterface, OrderDetailInterface } from "./interfaces/interfaces";
import Order, { OrderStatus } from "./model"; // Import the OrderStatus enum
import OrderDetail from "./order-detail.model";
import User from "../users/model";
import Address from "../address/model";
import CylinderCategory from "../cylinder/models/cylinder-category.model";
import {
  Transaction,
  Op,
  WhereOptions,
  Includeable,
  Sequelize,
  literal,
} from "sequelize";
import { OrderListQueryParams } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";

export class OrderRepository implements IOrderRepository {
  /**
   * Find an order by ID
   */
  public async findOrderById(id: string): Promise<OrderInterface | null> {
    try {
      return await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
          {
            model: User,
            as: "driver",
            attributes: ["id", "firstName", "lastName", "phone"],
          },
          {
            model: Address,
            as: "deliveryAddress",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding order by ID:", error);
      throw new DatabaseError("Database error while finding order", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderId: id },
      });
    }
  }

  /**
   * Find order details by order ID
   */
  public async findOrderDetailsByOrderId(
    orderId: string
  ): Promise<OrderDetailInterface[]> {
    try {
      return await OrderDetail.findAll({
        where: { orderId },
        include: [
          {
            model: CylinderCategory,
            as: "cylinderCategory",
          },
        ],
        order: [["createdAt", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding order details by order ID:", error);
      throw new DatabaseError("Database error while finding order details", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderId },
      });
    }
  }

  /**
   * Find an order detail by ID
   */
  public async findOrderDetailById(
    id: string
  ): Promise<OrderDetailInterface | null> {
    try {
      return await OrderDetail.findByPk(id, {
        include: [
          {
            model: CylinderCategory,
            as: "cylinderCategory",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding order detail by ID:", error);
      throw new DatabaseError("Database error while finding order detail", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderDetailId: id },
      });
    }
  }

  /**
   * Create a new order
   */
  public async createOrder(
    orderData: Omit<OrderInterface, "id" | "createdAt" | "updatedAt">,
    transaction?: Transaction
  ): Promise<OrderInterface> {
    try {
      return await Order.create(orderData as any, { transaction });
    } catch (error) {
      logger.error("Error creating order:", error);
      throw new DatabaseError("Database error while creating order", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Create order details
   */
  public async createOrderDetails(
    orderDetails: Omit<
      OrderDetailInterface,
      "id" | "createdAt" | "updatedAt"
    >[],
    transaction?: Transaction
  ): Promise<OrderDetailInterface[]> {
    try {
      return await OrderDetail.bulkCreate(orderDetails as any, { transaction });
    } catch (error) {
      logger.error("Error creating order details:", error);
      throw new DatabaseError("Database error while creating order details", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update an order
   */
  public async updateOrder(
    id: string,
    orderData: Partial<OrderInterface>,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Order.update(orderData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating order:", error);
      throw new DatabaseError("Database error while updating order", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderId: id },
      });
    }
  }

  /**
   * Update an order detail
   */
  public async updateOrderDetail(
    id: string,
    orderDetailData: Partial<OrderDetailInterface>,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await OrderDetail.update(orderDetailData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating order detail:", error);
      throw new DatabaseError("Database error while updating order detail", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderDetailId: id },
      });
    }
  }

  /**
   * Delete an order (soft delete)
   */
  public async deleteOrder(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Soft delete by updating status to CANCELLED - fixed to use enum value
      const [updated] = await Order.update(
        { orderStatus: OrderStatus.CANCELLED }, // Use enum value instead of string literal
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error deleting order:", error);
      throw new DatabaseError("Database error while deleting order", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderId: id },
      });
    }
  }

  /**
   * Delete an order detail
   */
  public async deleteOrderDetail(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await OrderDetail.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting order detail:", error);
      throw new DatabaseError("Database error while deleting order detail", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderDetailId: id },
      });
    }
  }

  /**
   * Get order list with filtering and pagination
   */
  public async getOrderList(params: OrderListQueryParams): Promise<{
    orders: OrderInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        customerId,
        driverId,
        orderStatus,
        paymentStatus,
        deliveryMethod,
        fromDate,
        toDate,
        minAmount,
        maxAmount,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (customerId) {
        where.customerId = customerId;
      }

      if (driverId) {
        where.driverId = driverId;
      }

      if (orderStatus) {
        where.orderStatus = orderStatus;
      }

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      if (deliveryMethod) {
        where.deliveryMethod = deliveryMethod;
      }

      if (fromDate) {
        where.createdAt = {
          ...(where.createdAt || {}),
          [Op.gte]: new Date(fromDate),
        };
      }

      if (toDate) {
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999); // End of day
        where.createdAt = {
          ...(where.createdAt || {}),
          [Op.lte]: toDateObj,
        };
      }

      if (minAmount) {
        where.totalAmount = {
          ...(where.totalAmount || {}),
          [Op.gte]: minAmount,
        };
      }

      if (maxAmount) {
        where.totalAmount = {
          ...(where.totalAmount || {}),
          [Op.lte]: maxAmount,
        };
      }

      // Search - match against order ID or customer info
      if (search) {
        const includes: Includeable[] = [
          {
            model: User,
            as: "customer",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
            where: {
              [Op.or]: [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
              ],
            },
            required: false,
          },
        ];

        // Also search by order ID prefix
        where[Op.or as unknown as string] = [
          { id: { [Op.iLike]: `%${search}%` } },
          Sequelize.literal(
            `"customer"."firstName" ILIKE '%${search}%' OR "customer"."lastName" ILIKE '%${search}%'`
          ),
        ];
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Set up includes
      const includes: Includeable[] = [
        {
          model: User,
          as: "customer",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ];

      // Get orders and total count
      const { count, rows } = await Order.findAndCountAll({
        where,
        include: includes,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true,
      });

      return {
        orders: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting order list:", error);
      throw new DatabaseError("Database error while getting order list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Get orders by customer ID
   */
  public async getOrdersByCustomerId(
    customerId: string
  ): Promise<OrderInterface[]> {
    try {
      return await Order.findAll({
        where: { customerId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting orders by customer ID:", error);
      throw new DatabaseError("Database error while getting customer orders", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, customerId },
      });
    }
  }

  /**
   * Get orders by driver ID
   */
  public async getOrdersByDriverId(
    driverId: string
  ): Promise<OrderInterface[]> {
    try {
      return await Order.findAll({
        where: { driverId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error getting orders by driver ID:", error);
      throw new DatabaseError("Database error while getting driver orders", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, driverId },
      });
    }
  }

  /**
   * Calculate order total from order details
   */
  public async calculateOrderTotal(
    orderId: string,
    transaction?: Transaction
  ): Promise<number> {
    try {
      const result = await OrderDetail.findAll({
        where: { orderId },
        attributes: [[Sequelize.fn("SUM", Sequelize.col("subtotal")), "total"]],
        transaction,
        raw: true,
      });

      const total =
        result && result[0] && (result[0] as any).total
          ? Number((result[0] as any).total)
          : 0;
      return total;
    } catch (error) {
      logger.error("Error calculating order total:", error);
      throw new DatabaseError("Database error while calculating order total", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, orderId },
      });
    }
  }
}

// Create and export repository instance
export default new OrderRepository();
