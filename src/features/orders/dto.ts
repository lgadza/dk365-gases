import { OrderStatus, PaymentStatus, DeliveryMethod } from "./model";
import { TransactionType, CylinderCondition } from "./order-detail.model";
import { OrderInterface, OrderDetailInterface } from "./interfaces/interfaces";

/**
 * Base DTO for order information
 */
export interface OrderBaseDTO {
  id: string;
  customerId: string;
  customerName?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  deliveryMethod: DeliveryMethod;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order detail DTO
 */
export interface OrderDetailDTO {
  id: string;
  orderId: string;
  cylinderCategoryId: string;
  transactionType: TransactionType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  cylinderCondition: CylinderCondition;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order detail with category information
 */
export interface OrderDetailWithCategoryDTO extends OrderDetailDTO {
  cylinderCategory?: {
    id: string;
    name: string;
    capacity: number;
    gasType: string;
  };
}

/**
 * Detailed order DTO with customer, driver, address, and details
 */
export interface OrderDetailedDTO extends OrderBaseDTO {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
  deliveryAddress?: {
    id: string;
    formattedAddress: string;
  };
  completedAt: string | null;
  notes: string | null;
  orderDetails: OrderDetailWithCategoryDTO[];
}

/**
 * DTO for creating a new order
 */
export interface CreateOrderDTO {
  customerId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddressId?: string;
  driverId?: string;
  notes?: string;
  orderDetails: {
    cylinderCategoryId: string;
    transactionType: TransactionType;
    quantity: number;
    unitPrice: number;
    cylinderCondition: CylinderCondition;
    notes?: string;
  }[];
}

/**
 * DTO for updating an order
 */
export interface UpdateOrderDTO {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryMethod?: DeliveryMethod;
  deliveryAddressId?: string | null;
  driverId?: string | null;
  completedAt?: Date | null;
  notes?: string | null;
}

/**
 * DTO for creating an order detail
 */
export interface CreateOrderDetailDTO {
  orderId: string;
  cylinderCategoryId: string;
  transactionType: TransactionType;
  quantity: number;
  unitPrice: number;
  cylinderCondition: CylinderCondition;
  notes?: string;
}

/**
 * DTO for updating an order detail
 */
export interface UpdateOrderDetailDTO {
  transactionType?: TransactionType;
  quantity?: number;
  unitPrice?: number;
  cylinderCondition?: CylinderCondition;
  notes?: string | null;
}

/**
 * Query parameters for order list
 */
export interface OrderListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  customerId?: string;
  driverId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  deliveryMethod?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Paginated order list response
 */
export interface PaginatedOrderListDTO {
  orders: OrderBaseDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Mapper class for converting between Order entities and DTOs
 */
export class OrderDTOMapper {
  /**
   * Map Order entity to BaseDTO
   */
  public static toBaseDTO(order: OrderInterface): OrderBaseDTO {
    return {
      id: order.id,
      customerId: order.customerId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: Number(order.totalAmount),
      deliveryMethod: order.deliveryMethod,
      createdAt: order.createdAt
        ? order.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: order.updatedAt
        ? order.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }

  /**
   * Map OrderDetail entity to DTO
   */
  public static toOrderDetailDTO(detail: OrderDetailInterface): OrderDetailDTO {
    return {
      id: detail.id,
      orderId: detail.orderId,
      cylinderCategoryId: detail.cylinderCategoryId,
      transactionType: detail.transactionType,
      quantity: detail.quantity,
      unitPrice: Number(detail.unitPrice),
      subtotal: Number(detail.subtotal),
      cylinderCondition: detail.cylinderCondition,
      notes: detail.notes,
      createdAt: detail.createdAt
        ? detail.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: detail.updatedAt
        ? detail.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
