import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Department } from '../../core/models';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBannerComponent } from '../../shared/status-banner.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule, InrPipe, StatusBannerComponent],
  template: `
    <header class="page-head animate-fade-in-up">
      <div>
        <h1>Department-wise reports</h1>
        <p class="muted">Financial summaries with CSV and PDF export</p>
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
      <button class="btn btn-secondary" type="submit">Apply</button>
      <button class="btn btn-primary" type="button" (click)="export('csv')">Export CSV</button>
      <button class="btn btn-primary" type="button" (click)="export('pdf')">Export PDF</button>
    </form>
    @if (exportError) {
      <div class="banner banner-error animate-fade-in-up delay-100">{{ exportError }}</div>
    }
    <app-status-banner [loading]="loading" [error]="error" [empty]="!loading && !error && rows.length === 0" />
    <div class="stack animate-fade-in-up delay-200">
      @for (row of rows; track row.departmentId) {
        <article class="card report-card">
          <h2>{{ row.name }} <small>{{ row.code }}</small></h2>
          <p>{{ row.spent | inr }} of {{ row.allocated | inr }} spent ({{ row.utilizationPct }}%)</p>
          <table>
            <thead><tr><th>Scheme</th><th>Year</th><th>Allocated</th><th>Spent</th><th>Util %</th></tr></thead>
            <tbody>
              @for (b of row.budgets; track b.id) {
                <tr>
                  <td>{{ b.scheme }}</td>
                  <td>{{ b.financialYear }}</td>
                  <td>{{ b.allocatedAmount | inr }}</td>
                  <td>{{ b.spent | inr }}</td>
                  <td>{{ b.utilizationPct }}%</td>
                </tr>
              }
            </tbody>
          </table>
        </article>
      }
    </div>
  `,
})
export class ReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  rows: any[] = [];
  departments: Department[] = [];
  loading = true;
  error: string | null = null;
  exportError: string | null = null;
  filters = this.fb.group({ financialYear: [''], department: [''] });

  ngOnInit() {
    this.api.departments(1, 100).subscribe({ next: (r) => (this.departments = r.data) });
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.api.departmentReports(this.filters.getRawValue() as any).subscribe({
      next: (res) => {
        this.rows = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load reports.';
      },
    });
  }

  export(kind: 'pdf' | 'csv') {
    this.exportError = null;
    this.api.exportReport(kind, this.filters.getRawValue() as any).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-report.${kind}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportError = 'Export failed.';
      },
    });
  }
}
