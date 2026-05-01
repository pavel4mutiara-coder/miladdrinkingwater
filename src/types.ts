import { Timestamp } from 'firebase/firestore';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  name: string;
  type: string;
  createdAt: Timestamp;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  partsReplaced: string;
  description: string;
  cost: number;
  createdAt: Timestamp;
}

export interface VehicleIncome {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  createdAt: Timestamp;
}

export interface Dealer {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: Timestamp;
}

export interface WaterSale {
  id: string;
  dealerId: string;
  date: string; // YYYY-MM-DD
  productType: '20L Jar' | '5L Bottle' | 'Other';
  quantity: number;
  rate: number;
  totalAmount: number;
  createdAt: Timestamp;
}

export interface CompanyExpense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  amount: number;
  createdAt: Timestamp;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  createdAt: Timestamp;
}
