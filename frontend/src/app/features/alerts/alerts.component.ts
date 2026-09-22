import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AlertItem } from '../../core/models';
import { StatusBannerComponent } from '../../shared/status-banner.component';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBannerComponent, DatePipe],
  template: `
    <header class="page-head animate-fade-in-up">
      <div>
        <h1>Anomaly alerts</h1>
        <p class="muted">Rule-based under-utilization, spikes, and pace deviation</p>
      </div>
      @if (canRun) {
        <button class="btn btn-primary" type="button" (click)="run()" [disabled]="running">
          {{ running ? 'Scanning\u2026' : 'Run detection' }}
        </button>
      }
    </header>
    @if (runMsg) {
      <div class="banner banner-ok animate-fade-in-up delay-100">{{ runMsg }}</div>
    }
    <form class="filters animate-fade-in-up delay-100" [formGroup]="filters" (ngSubmit)="load(true)">
      <select formControlName="resolved">
        <option value="">All</option>
        <option value="false">Unresolved</option>
        <option value="true">Resolved</option>
      </select>
      <select formControlName="type">
        <option value="">All types</option>
        <option value="UnderUtilization">Under-utilization</option>
        <option value="Overspending">Overspending</option>
        <option value="Spike">Spike</option>
        <option value="PaceDeviation">Pace deviation</option>
      </select>
      <button class="btn btn-secondary" type="submit">Filter</button>
    </form>
    <app-status-banner [loading]="loading" [error]="error" [empty]="!loading && !error && items.length === 0" emptyText="No alerts match the current filters." />
    <div class="stack animate-fade-in-up delay-200">
      @for (a of items; track a._id) {
        <article class="card alert-card">
          <div class="alert-meta">
            <span class="badge" [class]="'sev-' + a.severity.toLowerCase()">{{ a.severity }}</span>
            <span class="badge">{{ a.type }}</span>
            <span class="muted">{{ a.timestamp | date: 'medium' }}</span>
          </div>
          <p>{{ a.message }}</p>
          <p class="muted">{{ scheme(a) }}</p>
          @if (!a.resolved && canResolve) {
            <button class="btn btn-secondary" style="margin-top: 10px;" type="button" (click)="resolve(a)">Mark resolved</button>
          }
          @if (a.resolved) {
            <p class="muted" style="margin-top: 10px;">✅ Resolved {{ a.resolvedAt | date: 'medium' }}</p>
          }
        </article>
      }
    </div>
    <div class="pager animate-fade-in-up delay-300">
      <button class="btn btn-ghost" type="button" [disabled]="page <= 1" (click)="pageChange(-1)">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button class="btn btn-ghost" type="button" [disabled]="page >= totalPages" (click)="pageChange(1)">Next</button>
    </div>
  `,
})
export class AlertsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  items: AlertItem[] = [];
  loading = true;
  running = false;
  error: string | null = null;
  runMsg: string | null = null;
  page = 1;
  totalPages = 1;
  canRun = this.auth.hasRole(['Admin', 'FinanceOfficer']);
  canResolve = this.auth.hasRole(['Admin', 'FinanceOfficer']);

  filters = this.fb.group({ resolved: ['false'], type: [''] });

  ngOnInit() {
    this.load(true);
  }

  load(resetPage = false) {
    if (resetPage) this.page = 1;
    this.loading = true;
    this.error = null;
    const f = this.filters.getRawValue() as any;
    if (!f.type) delete f.type;
    if (!f.resolved) delete f.resolved;
    
    this.api.alerts({ ...f, page: this.page, limit: 10 }).subscribe({
      next: (res) => {
        this.items = res.data;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load alerts.';
      },
    });
  }

  pageChange(delta: number) {
    this.page += delta;
    this.load();
  }

  scheme(a: AlertItem) {
    return typeof a.budgetId === 'object' ? a.budgetId.scheme : '';
  }

  run() {
    this.running = true;
    this.runMsg = null;
    this.api.runMonitoring().subscribe({
      next: (res: any) => {
        this.running = false;
        this.runMsg = `Scanned ${res.budgetsScanned} budgets; created ${res.alertsCreated} new alerts.`;
        this.load();
      },
      error: (err) => {
        this.running = false;
        this.error = err.error?.error || 'Detection run failed.';
      },
    });
  }

  resolve(a: AlertItem) {
    this.api.resolveAlert(a._id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err.error?.error || 'Could not resolve alert.'),
    });
  }
}
