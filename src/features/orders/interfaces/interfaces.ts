import { OrderStatus, PaymentStatus, DeliveryMethod } from "../model";
import { TransactionType, CylinderCondition } from "../order-detail.model";

/**
 * Base Order interface
 */
export interface OrderInterface {
  id: string;
  customerId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddressId: string | null;
  driverId: string | null;
  completedAt: Date | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Order Detail interface
 */
export interface OrderDetailInterface {
  id: string;
  orderId: string;
  cylinderCategoryId: string;
  transactionType: TransactionType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  cylinderCondition: CylinderCondition;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
