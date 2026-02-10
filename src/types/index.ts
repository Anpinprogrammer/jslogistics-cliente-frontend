export type OrderStatus = 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type ServiceType = 'standard' | 'express' | 'same-day' | 'international';
export type PaymentStatus = 'pending' | 'paid' | 'credited';
export type TxType = 'charge' | 'payment';
export type TxStatus = 'paid' | 'unpaid';

export interface TimelineEvent {
  event: string;
  location: string;
  timestamp: string | null;
  completed: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  trackingNumber: string;
  senderCompany: string;
  senderContact: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientContact: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  packageDescription: string;
  weightKg: number;
  dimensionsCm: string;
  declaredValueCOP: number;
  serviceType: ServiceType;
  shippingCostCOP: number;
  paymentStatus: PaymentStatus;
  invoiceNumber: string | null;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  deliveredAt: string | null;
  timeline: TimelineEvent[];
}

export interface Transaction {
  id: string;
  clientId: string;
  orderId: string | null;
  type: TxType;
  amount: number;
  description: string;
  date: string;
  status: TxStatus;
}

export interface User {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  nit: string;
  creditLimit: number;
  balance: number;
  createdAt: string;
  role: 'client' | 'admin';
  active: boolean;
}

export interface FinanceSummary {
  balance: number;
  totalCharged: number;
  totalPaid: number;
  pendingCharges: number;
  creditLimit: number;
  availableCredit: number;
  totalOrders: number;
  deliveredOrders: number;
  activeOrders: number;
  recentTransactions: Transaction[];
}

export interface CreateOrderPayload {
  recipientName: string;
  recipientContact: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  packageDescription: string;
  weightKg: number;
  dimensionsCm: string;
  declaredValueCOP: number;
  serviceType: ServiceType;
}

export interface AuthResponse {
  token: string;
  user: User;
}
