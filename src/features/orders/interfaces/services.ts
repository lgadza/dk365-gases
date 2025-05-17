import { OrderInterface, OrderDetailInterface } from "./interfaces";
import {
  OrderDetailDTO,
  OrderDetailWithCategoryDTO,
  OrderBaseDTO,
  OrderDetailedDTO,
  CreateOrderDTO,
  UpdateOrderDTO,
  CreateOrderDetailDTO,
  UpdateOrderDetailDTO,
  OrderListQueryParams,
  PaginatedOrderListDTO,
} from "../dto";
import { Transaction } from "sequelize";

export interface IOrderRepository {
  /**
   * Find an order by ID
   */
  findOrderById(id: string): Promise<OrderInterface | null>;

  /**
   * Find order details by order ID
   */
  findOrderDetailsByOrderId(orderId: string): Promise<OrderDetailInterface[]>;

  /**
   * Find an order detail by ID
   */
  findOrderDetailById(id: string): Promise<OrderDetailInterface | null>;

  /**
   * Create a new order
   */
  createOrder(
    orderData: Omit<OrderInterface, "id" | "createdAt" | "updatedAt">,
    transaction?: Transaction
  ): Promise<OrderInterface>;

  /**
   * Create order details
   */
  createOrderDetails(
    orderDetails: Omit<
      OrderDetailInterface,
      "id" | "createdAt" | "updatedAt"
    >[],
    transaction?: Transaction
  ): Promise<OrderDetailInterface[]>;

  /**
   * Update an order
   */
  updateOrder(
    id: string,
    orderData: Partial<OrderInterface>,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Update an order detail
   */
  updateOrderDetail(
    id: string,
    orderDetailData: Partial<OrderDetailInterface>,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete an order (soft delete)
   */
  deleteOrder(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Delete an order detail
   */
  deleteOrderDetail(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get order list with filtering and pagination
   */
  getOrderList(params: OrderListQueryParams): Promise<{
    orders: OrderInterface[];
    total: number;
  }>;

  /**
   * Get orders by customer ID
   */
  getOrdersByCustomerId(customerId: string): Promise<OrderInterface[]>;

  /**
   * Get orders by driver ID
   */
  getOrdersByDriverId(driverId: string): Promise<OrderInterface[]>;

  /**
   * Calculate order total from order details
   */
  calculateOrderTotal(
    orderId: string,
    transaction?: Transaction
  ): Promise<number>;
}

export interface IOrderService {
  /**
   * Get order by ID with full details
   */
  getOrderById(id: string): Promise<OrderDetailedDTO>;

  /**
   * Get order detail by ID
   */
  getOrderDetailById(id: string): Promise<OrderDetailWithCategoryDTO>;

  /**
   * Create a new order with details
   */
  createOrder(orderData: CreateOrderDTO): Promise<OrderDetailedDTO>;

  /**
   * Update an order
   */
  updateOrder(id: string, orderData: UpdateOrderDTO): Promise<OrderDetailedDTO>;

  /**
   * Add details to an existing order
   */
  addOrderDetail(
    orderDetail: CreateOrderDetailDTO
  ): Promise<OrderDetailWithCategoryDTO>;

  /**
   * Update an order detail
   */
  updateOrderDetail(
    id: string,
    orderDetailData: UpdateOrderDetailDTO
  ): Promise<OrderDetailWithCategoryDTO>;

  /**
   * Delete an order (soft delete)
   */
  deleteOrder(id: string): Promise<boolean>;

  /**
   * Delete an order detail
   */
  deleteOrderDetail(id: string): Promise<boolean>;

  /**
   * Get paginated order list
   */
  getOrderList(params: OrderListQueryParams): Promise<PaginatedOrderListDTO>;

  /**
   * Get orders by customer ID
   */
  getOrdersByCustomerId(customerId: string): Promise<OrderBaseDTO[]>;

  /**
   * Get orders by driver ID
   */
  getOrdersByDriverId(driverId: string): Promise<OrderBaseDTO[]>;

  /**
   * Update order status
   */
  updateOrderStatus(
    id: string,
    orderStatus: string,
    notes?: string
  ): Promise<OrderDetailedDTO>;

  /**
   * Update payment status
   */
  updatePaymentStatus(
    id: string,
    paymentStatus: string,
    notes?: string
  ): Promise<OrderDetailedDTO>;

  /**
   * Assign driver to order
   */
  assignDriver(id: string, driverId: string): Promise<OrderDetailedDTO>;

  /**
   * Complete an order
   */
  completeOrder(id: string, notes?: string): Promise<OrderDetailedDTO>;

  /**
   * Cancel an order
   */
  cancelOrder(id: string, reason?: string): Promise<OrderDetailedDTO>;
}
