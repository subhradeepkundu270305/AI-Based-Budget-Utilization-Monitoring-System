import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Budget, Department } from '../../core/models';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBannerComponent } from '../../shared/status-banner.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, InrPipe, StatusBannerComponent],
  template: `
    <header class="page-head animate-fade-in-up">
      <div>
        <h1>Budget allocations</h1>
        <p class="muted">Scheme-wise grants by financial year</p>
      </div>
    </header>
    <form class="filters animate-fade-in-up delay-100" [formGroup]="filters" (ngSubmit)="load()">
      <select formControlName="financialYear">
        <option value="">All years</option>
        <option value="2025-26">2025-26</option>
        <option value="2026-27">2026-27</option>
      </select>
      <select formControlName="department">
        <option value="">All departments</option>
        @for (d of departments; track d._id) {
          <option [value]="d._id">{{ d.name }}</option>
        }
      </select>
      <select formControlName="status">
        <option value="">All statuses</option>
        <option value="Active">Active</option>
        <option value="Closed">Closed</option>
      </select>
      <button class="btn btn-secondary" type="submit">Filter</button>
    </form>
    <app-status-banner [loading]="loading" [error]="error" [empty]="!loading && !error && items.length === 0" />
    @if (canEdit) {
      <form class="card form-grid animate-fade-in-up delay-200" [formGroup]="form" (ngSubmit)="save()">
        <h2>{{ editingId ? 'Edit allocation' : 'New allocation' }}</h2>
        @if (formError) {
          <div class="banner banner-error">{{ formError }}</div>
        }
        <label>Financial year <input formControlName="financialYear" placeholder="2026-27" /></label>
        <label>Department
          <select formControlName="department">
            <option value="">Select</option>
            @for (d of departments; track d._id) {
              <option [value]="d._id">{{ d.name }}</option>
            }
          </select>
        </label>
        <label>Scheme / category <input formControlName="scheme" /></label>
        <label>Allocated amount (&#8377;) <input type="number" formControlName="allocatedAmount" /></label>
        <label>Allocation date <input type="date" formControlName="allocationDate" /></label>
        <label>Period start <input type="date" formControlName="periodStart" /></label>
        <label>Period end <input type="date" formControlName="periodEnd" /></label>
        <label>Status
          <select formControlName="status">
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </label>
        <div class="actions">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving">Save</button>
          <button class="btn btn-ghost" type="button" (click)="resetForm()">Clear</button>
        </div>
      </form>
    }
    <div class="table-wrap card animate-fade-in-up delay-300">
      <table>
        <thead>
          <tr>
            <th>Year</th><th>Department</th><th>Scheme</th><th>Allocated</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (b of items; track b._id) {
            <tr>
              <td>{{ b.financialYear }}</td>
              <td>{{ deptName(b) }}</td>
              <td>{{ b.scheme }}</td>
              <td>{{ b.allocatedAmount | inr }}</td>
              <td><span class="badge">{{ b.status }}</span></td>
              <td>
                @if (canEdit) {
                  <button class="btn btn-ghost" type="button" (click)="edit(b)">Edit</button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="pager animate-fade-in-up delay-400">
      <button class="btn btn-ghost" type="button" [disabled]="page <= 1" (click)="pageChange(-1)">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button class="btn btn-ghost" type="button" [disabled]="page >= totalPages" (click)="pageChange(1)">Next</button>
    </div>
  `,
})
export class BudgetsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  items: Budget[] = [];
  departments: Department[] = [];
  loading = true;
  saving = false;
  error: string | null = null;
  formError: string | null = null;
  page = 1;
  totalPages = 1;
  editingId: string | null = null;
  canEdit = this.auth.hasRole(['Admin', 'FinanceOfficer']);

  filters = this.fb.group({ financialYear: [''], department: [''], status: [''] });
  form = this.fb.group({
    financialYear: ['2026-27', [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
    department: ['', Validators.required],
    scheme: ['', [Validators.required, Validators.minLength(3)]],
    allocatedAmount: [1, [Validators.required, Validators.min(1)]],
    allocationDate: ['', Validators.required],
    periodStart: ['', Validators.required],
    periodEnd: ['', Validators.required],
    status: ['Active', Validators.required],
  });

  ngOnInit() {
    this.api.departments(1, 100).subscribe({ next: (r) => (this.departments = r.data) });
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    const f = this.filters.getRawValue() as any;
    this.api.budgets({ ...f, page: this.page, limit: 10 }).subscribe({
      next: (res) => {
        this.items = res.data;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load budgets.';
      },
    });
  }

  pageChange(delta: number) {
    this.page += delta;
    this.load();
  }

  deptName(b: Budget) {
    return typeof b.department === 'object' ? b.department.name : b.department;
  }

  edit(b: Budget) {
    this.editingId = b._id;
    this.form.patchValue({
      financialYear: b.financialYear,
      department: typeof b.department === 'object' ? b.department._id : b.department,
      scheme: b.scheme,
      allocatedAmount: b.allocatedAmount,
      allocationDate: b.allocationDate?.slice(0, 10),
      periodStart: b.periodStart?.slice(0, 10),
      periodEnd: b.periodEnd?.slice(0, 10),
      status: b.status,
    });
  }

  resetForm() {
    this.editingId = null;
    this.form.reset({ financialYear: '2026-27', status: 'Active', allocatedAmount: 1 });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.formError = null;
    const body = this.form.getRawValue();
    const req = this.editingId ? this.api.updateBudget(this.editingId, body) : this.api.createBudget(body);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.resetForm();
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.error || 'Save failed.';
      },
    });
  }
}
