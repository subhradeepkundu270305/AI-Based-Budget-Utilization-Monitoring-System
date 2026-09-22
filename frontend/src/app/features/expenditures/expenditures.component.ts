import { SlicePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/api.service';
import { Budget, Expenditure } from '../../core/models';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBannerComponent } from '../../shared/status-banner.component';

@Component({
  selector: 'app-expenditures',
  standalone: true,
  imports: [ReactiveFormsModule, InrPipe, StatusBannerComponent, SlicePipe],
  template: `
    <header class="page-head animate-fade-in-up">
      <div>
        <h1>Expenditure tracking</h1>
        <p class="muted">Record vouchers against an active scheme budget</p>
      </div>
    </header>
    <form class="card form-grid animate-fade-in-up delay-100" [formGroup]="form" (ngSubmit)="save()">
      <h2>Record transaction</h2>
      @if (formError) {
        <div class="banner banner-error">{{ formError }}</div>
      }
      <label>Budget
        <select formControlName="budgetId">
          <option value="">Select scheme</option>
          @for (b of budgets; track b._id) {
            <option [value]="b._id">{{ b.scheme }} ({{ b.financialYear }})</option>
          }
        </select>
      </label>
      <label>Amount (&#8377;) <input type="number" formControlName="amountSpent" /></label>
      <label>Category <input formControlName="category" /></label>
      <label>Date <input type="date" formControlName="date" /></label>
      <label class="span-2">Description <textarea formControlName="description" rows="3"></textarea></label>
      <label>Supporting document <input type="file" (change)="onFile($event)" /></label>
      <div class="actions">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving">Save voucher</button>
      </div>
    </form>
    <form class="filters animate-fade-in-up delay-200" [formGroup]="filters" (ngSubmit)="load()">
      <select formControlName="budgetId">
        <option value="">All budgets</option>
        @for (b of budgets; track b._id) {
          <option [value]="b._id">{{ b.scheme }}</option>
        }
      </select>
      <input type="date" formControlName="from" />
      <input type="date" formControlName="to" />
      <button class="btn btn-secondary" type="submit">Filter</button>
    </form>
    <app-status-banner [loading]="loading" [error]="error" [empty]="!loading && !error && items.length === 0" />
    <div class="table-wrap card animate-fade-in-up delay-300">
      <table>
        <thead>
          <tr><th>Date</th><th>Scheme</th><th>Category</th><th>Amount</th><th>Description</th><th>Document</th></tr>
        </thead>
        <tbody>
          @for (e of items; track e._id) {
            <tr>
              <td>{{ e.date | slice:0:10 }}</td>
              <td>{{ schemeName(e) }}</td>
              <td>{{ e.category }}</td>
              <td>{{ e.amountSpent | inr }}</td>
              <td>{{ e.description }}</td>
              <td>
                @if (e.supportingDocUrl) {
                  <a [href]="fileUrl(e.supportingDocUrl)" target="_blank" rel="noopener">View</a>
                } @else {
                  —
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
export class ExpendituresComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  items: Expenditure[] = [];
  budgets: Budget[] = [];
  loading = true;
  saving = false;
  error: string | null = null;
  formError: string | null = null;
  page = 1;
  totalPages = 1;
  file: File | null = null;

  filters = this.fb.group({ budgetId: [''], from: [''], to: [''] });
  form = this.fb.group({
    budgetId: ['', Validators.required],
    amountSpent: [1, [Validators.required, Validators.min(0.01)]],
    category: ['', [Validators.required, Validators.minLength(2)]],
    date: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit() {
    this.api.budgets({ status: 'Active', limit: 100 } as any).subscribe({ next: (r) => (this.budgets = r.data) });
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    const f = this.filters.getRawValue() as any;
    this.api.expenditures({ ...f, page: this.page, limit: 10 }).subscribe({
      next: (res) => {
        this.items = res.data;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load expenditures.';
      },
    });
  }

  pageChange(delta: number) {
    this.page += delta;
    this.load();
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0] || null;
  }

  schemeName(e: Expenditure) {
    return typeof e.budgetId === 'object' ? e.budgetId.scheme : e.budgetId;
  }

  fileUrl(path: string) {
    if (path.startsWith('http')) return path;
    if (environment.apiUrl.startsWith('http')) {
      return environment.apiUrl.replace(/\/api$/, '') + path;
    }
    return path;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.formError = null;
    this.api.createExpenditure(this.form.getRawValue() as any).subscribe({
      next: (res) => {
        const created = res.data;
        const finish = () => {
          this.saving = false;
          this.form.reset({ amountSpent: 1 });
          this.file = null;
          this.load();
        };
        if (this.file) {
          this.api.uploadDocument(created._id, this.file).subscribe({
            next: finish,
            error: (err) => {
              this.saving = false;
              this.formError = err.error?.error || 'Voucher saved but upload failed.';
              this.load();
            },
          });
        } else finish();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err.error?.error || 'Could not record expenditure.';
      },
    });
  }
}
