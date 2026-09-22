import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AlertItem,
  Budget,
  DashboardData,
  Department,
  Expenditure,
  Paginated,
  Thresholds,
  User,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private params(obj: Record<string, string | number | boolean | undefined | null>) {
    let p = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return p;
  }

  departments(page = 1, limit = 50) {
    return this.http.get<Paginated<Department>>(`${this.api}/departments`, { params: this.params({ page, limit }) });
  }

  createDepartment(body: Partial<Department>) {
    return this.http.post<{ data: Department }>(`${this.api}/departments`, body);
  }

  updateDepartment(id: string, body: Partial<Department>) {
    return this.http.patch<{ data: Department }>(`${this.api}/departments/${id}`, body);
  }

  deleteDepartment(id: string) {
    return this.http.delete(`${this.api}/departments/${id}`);
  }

  users(query: Record<string, string | number | undefined> = {}) {
    return this.http.get<Paginated<User>>(`${this.api}/users`, { params: this.params(query) });
  }

  createUser(body: Record<string, unknown>) {
    return this.http.post<{ data: User }>(`${this.api}/users`, body);
  }

  updateUser(id: string, body: Record<string, unknown>) {
    return this.http.patch<{ data: User }>(`${this.api}/users/${id}`, body);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.api}/users/${id}`);
  }

  budgets(query: Record<string, string | number | undefined> = {}) {
    return this.http.get<Paginated<Budget>>(`${this.api}/budgets`, { params: this.params(query) });
  }

  createBudget(body: Record<string, unknown>) {
    return this.http.post<{ data: Budget }>(`${this.api}/budgets`, body);
  }

  updateBudget(id: string, body: Record<string, unknown>) {
    return this.http.patch<{ data: Budget }>(`${this.api}/budgets/${id}`, body);
  }

  expenditures(query: Record<string, string | number | undefined> = {}) {
    return this.http.get<Paginated<Expenditure>>(`${this.api}/expenditures`, { params: this.params(query) });
  }

  createExpenditure(body: Record<string, unknown>) {
    return this.http.post<{ data: Expenditure }>(`${this.api}/expenditures`, body);
  }

  uploadDocument(id: string, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ data: Expenditure }>(`${this.api}/expenditures/${id}/document`, fd);
  }

  alerts(query: Record<string, string | number | undefined> = {}) {
    return this.http.get<Paginated<AlertItem>>(`${this.api}/alerts`, { params: this.params(query) });
  }

  resolveAlert(id: string) {
    return this.http.post<{ data: AlertItem }>(`${this.api}/alerts/${id}/resolve`, {});
  }

  runMonitoring() {
    return this.http.post(`${this.api}/monitoring/run`, {});
  }

  dashboard(financialYear?: string) {
    return this.http.get<DashboardData>(`${this.api}/reports/dashboard`, {
      params: this.params({ financialYear }),
    });
  }

  departmentReports(query: Record<string, string | undefined> = {}) {
    return this.http.get<{ data: any[] }>(`${this.api}/reports/departments`, { params: this.params(query) });
  }

  exportReport(kind: 'pdf' | 'csv', query: Record<string, string | undefined> = {}) {
    return this.http.get(`${this.api}/reports/export/${kind}`, {
      params: this.params(query),
      responseType: 'blob',
    });
  }

  chat(message: string) {
    return this.http.post<{ reply: string }>(`${this.api}/chat`, { message });
  }

  thresholds() {
    return this.http.get<{ data: Thresholds }>(`${this.api}/admin/thresholds`);
  }

  updateThresholds(body: Partial<Thresholds>) {
    return this.http.patch<{ data: Thresholds }>(`${this.api}/admin/thresholds`, body);
  }

  auditLogs(query: Record<string, string | number | undefined> = {}) {
    return this.http.get<Paginated<any>>(`${this.api}/admin/audit-logs`, { params: this.params(query) });
  }
}
