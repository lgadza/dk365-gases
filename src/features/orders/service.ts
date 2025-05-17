import { IOrderService, IOrderRepository } from "./interfaces/services";
import { OrderStatus, PaymentStatus } from "./model";
import {
  OrderBaseDTO,
  OrderDetailDTO,
  OrderDetailWithCategoryDTO,
  OrderDetailedDTO,
  CreateOrderDTO,
  UpdateOrderDTO,
  CreateOrderDetailDTO,
  UpdateOrderDetailDTO,
  OrderListQueryParams,
  PaginatedOrderListDTO,
  OrderDTOMapper,
} from "./dto";
import repository from "./repository";
import userService from "../users/service";
import addressService from "../address/service";
import cylinderService from "../cylinder/service";
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

export class OrderService implements IOrderService {
  private repository: IOrderRepository;
  private readonly CACHE_PREFIX = "order:";
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(repository: IOrderRepository) {
    this.repository = repository;
  }

  /**
   * Get order by ID with full details
   */
  public async getOrderById(id: string): Promise<OrderDetailedDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedOrder = await cache.get(cacheKey);

      if (cachedOrder) {
        return JSON.parse(cachedOrder);
      }

      // Get from database if not in cache
      const order = await this.repository.findOrderById(id);
      if (!order) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Get order details
      const orderDetails = await this.repository.findOrderDetailsByOrderId(id);

      // Format customer name if available
      let customerName = "";
      if ((order as any).customer) {
        const customer = (order as any).customer;
        customerName = `${customer.firstName} ${customer.lastName}`.trim();
      }

      // Format driver name if available
      let driverName = "";
      if ((order as any).driver) {
        const driver = (order as any).driver;
        driverName = `${driver.firstName} ${driver.lastName}`.trim();
      }

      // Map to DTO
      const orderDTO: OrderDetailedDTO = {
        ...OrderDTOMapper.toBaseDTO(order),
        customerName: customerName,
        customer: (order as any).customer
          ? {
              id: (order as any).customer.id,
              name: customerName,
              email: (order as any).customer.email,
              phone: (order as any).customer.phone,
            }
          : undefined,
        driver: (order as any).driver
          ? {
              id: (order as any).driver.id,
              name: driverName,
              phone: (order as any).driver.phone,
            }
          : undefined,
        deliveryAddress: (order as any).deliveryAddress
          ? {
              id: (order as any).deliveryAddress.id,
              formattedAddress: this.formatAddress(
                (order as any).deliveryAddress
              ),
            }
          : undefined,
        completedAt: order.completedAt ? order.completedAt.toISOString() : null,
        notes: order.notes,
        orderDetails: orderDetails.map((detail) =>
          this.mapOrderDetailWithCategory(detail)
        ),
      };

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(orderDTO), this.CACHE_TTL);

      return orderDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getOrderById service:", error);
      throw new AppError("Failed to get order");
    }
  }

  /**
   * Get order detail by ID
   */
  public async getOrderDetailById(
    id: string
  ): Promise<OrderDetailWithCategoryDTO> {
    try {
      const orderDetail = await this.repository.findOrderDetailById(id);
      if (!orderDetail) {
        throw new NotFoundError(`Order detail with ID ${id} not found`);
      }

      return this.mapOrderDetailWithCategory(orderDetail);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getOrderDetailById service:", error);
      throw new AppError("Failed to get order detail");
    }
  }

  /**
   * Create a new order with details
   */
  public async createOrder(
    orderData: CreateOrderDTO
  ): Promise<OrderDetailedDTO> {
    try {
      // Validate the order data
      await this.validateOrderData(orderData);

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Calculate subtotals for each detail
        const orderDetails = orderData.orderDetails.map((detail) => ({
          ...detail,
          subtotal: detail.quantity * detail.unitPrice,
        }));

        // Create the order with initial total of 0
        const newOrder = await this.repository.createOrder(
          {
            customerId: orderData.customerId,
            orderStatus: orderData.orderStatus || OrderStatus.PENDING,
            paymentStatus: orderData.paymentStatus || PaymentStatus.UNPAID,
            totalAmount: 0,
            deliveryMethod: orderData.deliveryMethod,
            deliveryAddressId: orderData.deliveryAddressId || null,
            driverId: orderData.driverId || null,
            completedAt: null,
            notes: orderData.notes || null,
          },
          transaction
        );

        // Create order details
        await this.repository.createOrderDetails(
          orderDetails.map((detail) => ({
            orderId: newOrder.id,
            cylinderCategoryId: detail.cylinderCategoryId,
            transactionType: detail.transactionType,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            subtotal: detail.subtotal,
            cylinderCondition: detail.cylinderCondition,
            notes: detail.notes || null,
          })),
          transaction
        );

        // Calculate and update the total
        const totalAmount = await this.repository.calculateOrderTotal(
          newOrder.id,
          transaction
        );
        await this.repository.updateOrder(
          newOrder.id,
          { totalAmount },
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Return the full order details
        return this.getOrderById(newOrder.id);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createOrder service:", error);
      throw new AppError("Failed to create order");
    }
  }

  /**
   * Update an order
   */
  public async updateOrder(
    id: string,
    orderData: UpdateOrderDTO
  ): Promise<OrderDetailedDTO> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(id);
      if (!existingOrder) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Validate update data
      if (orderData.deliveryAddressId) {
        try {
          await addressService.getAddressById(orderData.deliveryAddressId);
        } catch (error) {
          throw new BadRequestError("Invalid delivery address ID");
        }
      }

      if (orderData.driverId) {
        try {
          await userService.getUserById(orderData.driverId);
        } catch (error) {
          throw new BadRequestError("Invalid driver ID");
        }
      }

      // Update the order
      await this.repository.updateOrder(id, orderData);

      // Clear cache
      await this.clearOrderCache(id);

      // Return the updated order
      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateOrder service:", error);
      throw new AppError("Failed to update order");
    }
  }

  /**
   * Add details to an existing order
   */
  public async addOrderDetail(
    orderDetail: CreateOrderDetailDTO
  ): Promise<OrderDetailWithCategoryDTO> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(
        orderDetail.orderId
      );
      if (!existingOrder) {
        throw new NotFoundError(
          `Order with ID ${orderDetail.orderId} not found`
        );
      }

      // Validate cylinder category
      try {
        await cylinderService.getCategoryById(orderDetail.cylinderCategoryId);
      } catch (error) {
        throw new BadRequestError("Invalid cylinder category ID");
      }

      // Calculate subtotal
      const subtotal = orderDetail.quantity * orderDetail.unitPrice;

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Create order detail
        const newOrderDetail = await this.repository.createOrderDetails(
          [
            {
              orderId: orderDetail.orderId,
              cylinderCategoryId: orderDetail.cylinderCategoryId,
              transactionType: orderDetail.transactionType,
              quantity: orderDetail.quantity,
              unitPrice: orderDetail.unitPrice,
              subtotal,
              cylinderCondition: orderDetail.cylinderCondition,
              notes: orderDetail.notes || null,
            },
          ],
          transaction
        );

        // Recalculate and update the order total
        const totalAmount = await this.repository.calculateOrderTotal(
          orderDetail.orderId,
          transaction
        );
        await this.repository.updateOrder(
          orderDetail.orderId,
          { totalAmount },
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Clear cache
        await this.clearOrderCache(orderDetail.orderId);

        // Get and return the complete order detail
        return this.getOrderDetailById(newOrderDetail[0].id);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in addOrderDetail service:", error);
      throw new AppError("Failed to add order detail");
    }
  }

  /**
   * Update an order detail
   */
  public async updateOrderDetail(
    id: string,
    orderDetailData: UpdateOrderDetailDTO
  ): Promise<OrderDetailWithCategoryDTO> {
    try {
      // Check if order detail exists
      const existingOrderDetail = await this.repository.findOrderDetailById(id);
      if (!existingOrderDetail) {
        throw new NotFoundError(`Order detail with ID ${id} not found`);
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Calculate new subtotal if quantity or unitPrice changes
        let subtotal: number | undefined;
        if (
          orderDetailData.quantity !== undefined ||
          orderDetailData.unitPrice !== undefined
        ) {
          const quantity =
            orderDetailData.quantity ?? existingOrderDetail.quantity;
          const unitPrice =
            orderDetailData.unitPrice ?? existingOrderDetail.unitPrice;
          subtotal = quantity * Number(unitPrice);
        }

        // Update order detail
        await this.repository.updateOrderDetail(
          id,
          {
            ...orderDetailData,
            ...(subtotal !== undefined ? { subtotal } : {}),
          },
          transaction
        );

        // Recalculate and update the order total
        const totalAmount = await this.repository.calculateOrderTotal(
          existingOrderDetail.orderId,
          transaction
        );
        await this.repository.updateOrder(
          existingOrderDetail.orderId,
          { totalAmount },
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Clear cache
        await this.clearOrderCache(existingOrderDetail.orderId);

        // Get and return the updated order detail
        return this.getOrderDetailById(id);
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateOrderDetail service:", error);
      throw new AppError("Failed to update order detail");
    }
  }

  /**
   * Delete an order (soft delete)
   */
  public async deleteOrder(id: string): Promise<boolean> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(id);
      if (!existingOrder) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Check if order can be deleted (only pending orders)
      if (existingOrder.orderStatus !== OrderStatus.PENDING) {
        throw new ConflictError(
          "Only pending orders can be deleted. Please cancel the order instead."
        );
      }

      // Delete the order (soft delete)
      const result = await this.repository.deleteOrder(id);

      // Clear cache
      await this.clearOrderCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteOrder service:", error);
      throw new AppError("Failed to delete order");
    }
  }

  /**
   * Delete an order detail
   */
  public async deleteOrderDetail(id: string): Promise<boolean> {
    try {
      // Check if order detail exists
      const existingOrderDetail = await this.repository.findOrderDetailById(id);
      if (!existingOrderDetail) {
        throw new NotFoundError(`Order detail with ID ${id} not found`);
      }

      // Check order status (only allow delete for pending orders)
      const order = await this.repository.findOrderById(
        existingOrderDetail.orderId
      );
      if (!order || order.orderStatus !== OrderStatus.PENDING) {
        throw new ConflictError(
          "Order details can only be deleted for pending orders"
        );
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Delete the order detail
        const result = await this.repository.deleteOrderDetail(id, transaction);

        // Recalculate and update the order total
        const totalAmount = await this.repository.calculateOrderTotal(
          existingOrderDetail.orderId,
          transaction
        );
        await this.repository.updateOrder(
          existingOrderDetail.orderId,
          { totalAmount },
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Clear cache
        await this.clearOrderCache(existingOrderDetail.orderId);

        return result;
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteOrderDetail service:", error);
      throw new AppError("Failed to delete order detail");
    }
  }

  /**
   * Get paginated order list
   */
  public async getOrderList(
    params: OrderListQueryParams
  ): Promise<PaginatedOrderListDTO> {
    try {
      const { orders, total } = await this.repository.getOrderList(params);

      // Map to DTOs and format customer names
      const orderDTOs = await Promise.all(
        orders.map(async (order) => {
          // Format customer name if available
          let customerName = "";
          if ((order as any).customer) {
            const customer = (order as any).customer;
            customerName = `${customer.firstName} ${customer.lastName}`.trim();
          }

          return {
            ...OrderDTOMapper.toBaseDTO(order),
            customerName,
          };
        })
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        orders: orderDTOs,
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
      logger.error("Error in getOrderList service:", error);
      throw new AppError("Failed to get order list");
    }
  }

  /**
   * Get orders by customer ID
   */
  public async getOrdersByCustomerId(
    customerId: string
  ): Promise<OrderBaseDTO[]> {
    try {
      const orders = await this.repository.getOrdersByCustomerId(customerId);
      return orders.map((order) => OrderDTOMapper.toBaseDTO(order));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getOrdersByCustomerId service:", error);
      throw new AppError("Failed to get customer orders");
    }
  }

  /**
   * Get orders by driver ID
   */
  public async getOrdersByDriverId(driverId: string): Promise<OrderBaseDTO[]> {
    try {
      const orders = await this.repository.getOrdersByDriverId(driverId);
      return orders.map((order) => OrderDTOMapper.toBaseDTO(order));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getOrdersByDriverId service:", error);
      throw new AppError("Failed to get driver orders");
    }
  }

  /**
   * Update order status
   */
  public async updateOrderStatus(
    id: string,
    orderStatus: string,
    notes?: string
  ): Promise<OrderDetailedDTO> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(id);
      if (!existingOrder) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Validate order status
      if (!Object.values(OrderStatus).includes(orderStatus as OrderStatus)) {
        throw new BadRequestError("Invalid order status");
      }

      // Check for status transitions
      this.validateStatusTransition(
        existingOrder.orderStatus,
        orderStatus as OrderStatus
      );

      // Update fields based on status
      const updateData: any = {
        orderStatus: orderStatus as OrderStatus,
      };

      // Add notes if provided
      if (notes) {
        updateData.notes = notes;
      }

      // Set completedAt if status is completed
      if (orderStatus === OrderStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      // Update the order
      await this.repository.updateOrder(id, updateData);

      // Clear cache
      await this.clearOrderCache(id);

      // Return the updated order
      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateOrderStatus service:", error);
      throw new AppError("Failed to update order status");
    }
  }

  /**
   * Update payment status
   */
  public async updatePaymentStatus(
    id: string,
    paymentStatus: string,
    notes?: string
  ): Promise<OrderDetailedDTO> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(id);
      if (!existingOrder) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Validate payment status
      if (
        !Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)
      ) {
        throw new BadRequestError("Invalid payment status");
      }

      // Update fields
      const updateData: any = {
        paymentStatus: paymentStatus as PaymentStatus,
      };

      // Add notes if provided
      if (notes) {
        updateData.notes = notes;
      }

      // Update the order
      await this.repository.updateOrder(id, updateData);

      // Clear cache
      await this.clearOrderCache(id);

      // Return the updated order
      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updatePaymentStatus service:", error);
      throw new AppError("Failed to update payment status");
    }
  }

  /**
   * Assign driver to order
   */
  public async assignDriver(
    id: string,
    driverId: string
  ): Promise<OrderDetailedDTO> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(id);
      if (!existingOrder) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Validate driver exists
      try {
        await userService.getUserById(driverId);
      } catch (error) {
        throw new BadRequestError("Invalid driver ID");
      }

      // Update the order
      await this.repository.updateOrder(id, { driverId });

      // Clear cache
      await this.clearOrderCache(id);

      // Return the updated order
      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in assignDriver service:", error);
      throw new AppError("Failed to assign driver");
    }
  }

  /**
   * Complete an order
   */
  public async completeOrder(
    id: string,
    notes?: string
  ): Promise<OrderDetailedDTO> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(id);
      if (!existingOrder) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Validate current status
      if (
        existingOrder.orderStatus !== OrderStatus.PROCESSING &&
        existingOrder.orderStatus !== OrderStatus.PENDING
      ) {
        throw new BadRequestError(
          "Only orders in processing or pending status can be completed"
        );
      }

      // Update fields
      const updateData: any = {
        orderStatus: OrderStatus.COMPLETED,
        completedAt: new Date(),
      };

      // Add notes if provided
      if (notes) {
        updateData.notes = notes;
      }

      // Update the order
      await this.repository.updateOrder(id, updateData);

      // Clear cache
      await this.clearOrderCache(id);

      // Return the updated order
      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in completeOrder service:", error);
      throw new AppError("Failed to complete order");
    }
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(
    id: string,
    reason?: string
  ): Promise<OrderDetailedDTO> {
    try {
      // Check if order exists
      const existingOrder = await this.repository.findOrderById(id);
      if (!existingOrder) {
        throw new NotFoundError(`Order with ID ${id} not found`);
      }

      // Validate current status
      if (existingOrder.orderStatus === OrderStatus.COMPLETED) {
        throw new BadRequestError("Completed orders cannot be cancelled");
      }

      // Update fields
      const updateData: any = {
        orderStatus: OrderStatus.CANCELLED,
      };

      // Add cancellation reason if provided
      if (reason) {
        updateData.notes = reason;
      }

      // Update the payment status too
      updateData.paymentStatus = PaymentStatus.CANCELLED;

      // Update the order
      await this.repository.updateOrder(id, updateData);

      // Clear cache
      await this.clearOrderCache(id);

      // Return the updated order
      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in cancelOrder service:", error);
      throw new AppError("Failed to cancel order");
    }
  }

  /**
   * Map OrderDetail with category information
   */
  private mapOrderDetailWithCategory(detail: any): OrderDetailWithCategoryDTO {
    // Convert the detail entity to DTO
    const detailDTO = OrderDTOMapper.toOrderDetailDTO(detail);

    // Add category information if available
    if (detail.cylinderCategory) {
      return {
        ...detailDTO,
        cylinderCategory: {
          id: detail.cylinderCategory.id,
          name: detail.cylinderCategory.name,
          capacity: detail.cylinderCategory.capacity,
          gasType: detail.cylinderCategory.gasType,
        },
      };
    }

    return detailDTO;
  }

  /**
   * Format address object into string
   */
  private formatAddress(address: any): string {
    if (!address) return "";

    const parts = [
      address.buildingNumber,
      address.street,
      address.addressLine2,
      address.city,
      address.province,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  }

  /**
   * Validate order data before creation
   */
  private async validateOrderData(orderData: CreateOrderDTO): Promise<void> {
    // Check if customer exists
    try {
      await userService.getUserById(orderData.customerId);
    } catch (error) {
      throw new BadRequestError("Invalid customer ID");
    }

    // Check delivery address if delivery method is delivery
    if (
      orderData.deliveryMethod === "delivery" &&
      !orderData.deliveryAddressId
    ) {
      throw new BadRequestError(
        "Delivery address is required for delivery orders"
      );
    }

    // Validate delivery address if provided
    if (orderData.deliveryAddressId) {
      try {
        await addressService.getAddressById(orderData.deliveryAddressId);
      } catch (error) {
        throw new BadRequestError("Invalid delivery address ID");
      }
    }

    // Validate driver if provided
    if (orderData.driverId) {
      try {
        await userService.getUserById(orderData.driverId);
      } catch (error) {
        throw new BadRequestError("Invalid driver ID");
      }
    }

    // Check if order has at least one order detail
    if (!orderData.orderDetails || orderData.orderDetails.length === 0) {
      throw new BadRequestError("Order must have at least one item");
    }

    // Validate each order detail
    for (const detail of orderData.orderDetails) {
      // Check if cylinder category exists
      try {
        await cylinderService.getCategoryById(detail.cylinderCategoryId);
      } catch (error) {
        throw new BadRequestError(
          `Invalid cylinder category ID: ${detail.cylinderCategoryId}`
        );
      }
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    // Define valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.PROCESSING,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [], // No valid transitions from completed
      [OrderStatus.CANCELLED]: [], // No valid transitions from cancelled
      [OrderStatus.FAILED]: [], // No valid transitions from failed
    };

    if (currentStatus === newStatus) {
      return; // No status change, so it's valid
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Clear order cache
   */
  private async clearOrderCache(orderId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${orderId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new OrderService(repository);
