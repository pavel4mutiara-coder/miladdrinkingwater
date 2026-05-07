import { Timestamp } from 'firebase/firestore';

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  name: string;
  type: string;
  imageURL?: string;
  registrationNumber?: string;
  fitnessDate?: string;
  insuranceDate?: string;
  taxTokenDate?: string;
  createdAt: Timestamp;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  partsReplaced?: string;
  description: string;
  cost: number;
  mechanicName?: string;
  sparePartsCost?: number;
  nextServiceDate?: string;
  createdAt: Timestamp;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  address: string;
  nid: string;
  licenseNumber: string;
  emergencyContact: string;
  photoURL?: string;
  createdAt: Timestamp;
}

export interface CNG {
  id: string;
  cngNumber: string;
  driverId: string;
  dailyPayment: number;
  dueAmount: number;
  createdAt: Timestamp;
}

export interface CNGIncome {
  id: string;
  cngId: string;
  date: string;
  amount: number;
  createdAt: Timestamp;
}

export interface CNGExpense {
  id: string;
  cngId: string;
  date: string;
  type: 'Gas' | 'Repair' | 'Tire' | 'Battery' | 'Engine' | 'Other';
  amount: number;
  description?: string;
  createdAt: Timestamp;
}

export interface VehicleIncome {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  driverId?: string;
  driverName?: string;
  routeDetails?: string;
  createdAt: Timestamp;
}

export interface Dealer {
  id: string;
  name: string;
  address: string;
  phone: string;
  nid?: string;
  photoURL?: string;
  dueBalance: number;
  createdAt: Timestamp;
}

export interface WaterSale {
  id: string;
  dealerId: string;
  date: string; // YYYY-MM-DD
  productType: '20L Jar' | '5L Bottle' | 'Other';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  createdAt: Timestamp;
}

export interface CompanyExpense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  amount: number;
  dealerId?: string;
  createdAt: Timestamp;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  createdAt: Timestamp;
}
