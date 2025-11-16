export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export const OrderStatus = {
  PENDING: 'PENDING' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELLED: 'CANCELLED' as const,
};

export interface OrderItem {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  price: number;
  item?: {
    id: number;
    name: string;
    sellingPrice: number;
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  organizationId: number;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  orderItems: OrderItem[];
}

export interface CreateOrderItemDto {
  itemId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  orderNumber: string;
  userId: number;
  orderItems: CreateOrderItemDto[];
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  orderItems?: CreateOrderItemDto[];
}
