export type Role = 'Admin' | 'FinanceOfficer' | 'DepartmentHead' | 'User';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | { _id: string; name?: string; code?: string } | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  headUserId?: User | string | null;
  createdAt?: string;
}

export interface Budget {
  _id: string;
  financialYear: string;
  department: Department | string;
  allocatedAmount: number;
  allocationDate: string;
  periodStart: string;
  periodEnd: string;
  scheme: string;
  status: 'Active' | 'Closed';
  createdBy?: User | string;
}

export interface Expenditure {
  _id: string;
  budgetId: Budget | string;
  amountSpent: number;
  category: string;
  date: string;
  description: string;
  supportingDocUrl?: string | null;
  recordedBy?: User | string;
  createdAt?: string;
}

export interface AlertItem {
  _id: string;
  departmentId: Department | string;
  budgetId: Budget | string;
  type: 'UnderUtilization' | 'Overspending' | 'Spike' | 'PaceDeviation';
  severity: 'Low' | 'Medium' | 'High';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: User | string | null;
  resolvedAt?: string | null;
}

export interface Thresholds {
  _id?: string;
  underUtilizationPct: number;
  underUtilizationTimeElapsedPct: number;
  spikeThresholdPct: number;
  paceDeviationPct: number;
}

export interface DashboardData {
  kpis: {
    allocated: number;
    spent: number;
    remaining: number;
    utilizationPct: number;
    openAlerts: number;
    departments: number;
  };
  byDepartment: { name: string; code: string; allocated: number; spent: number; utilizationPct: number }[];
  byCategory: { _id: string; spent: number }[];
  spendTrend: { month: string; spent: number }[];
  alertsByType: { _id: string; count: number }[];
}
