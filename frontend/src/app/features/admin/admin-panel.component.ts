import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Department, Thresholds, User } from '../../core/models';
import { StatusBannerComponent } from '../../shared/status-banner.component';

type Tab = 'users' | 'departments' | 'thresholds' | 'audit';


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBannerComponent, DatePipe],
  template: `
    <header class="page-head">
      <div>
        <h1>Admin panel</h1>
        <p class="muted">Manage users, departments, thresholds, and audit logs</p>
      </div>
    </header>

    <!-- Tab bar -->
    <nav class="tab-bar">
      <button [class.active]="tab === 'users'" (click)="setTab('users')">Users</button>
      <button [class.active]="tab === 'departments'" (click)="setTab('departments')">Departments</button>
      <button [class.active]="tab === 'thresholds'" (click)="setTab('thresholds')">Thresholds</button>
      <button [class.active]="tab === 'audit'" (click)="setTab('audit')">Audit log</button>
    </nav>

    <!-- ─── USERS TAB ─── -->
    @if (tab === 'users') {
      <section>
        <app-status-banner [loading]="usersLoading" [error]="usersError" [empty]="!usersLoading && !usersError && users.length === 0" />
        <form class="card form-grid" [formGroup]="userForm" (ngSubmit)="saveUser()">
          <h2>{{ editingUserId ? 'Edit user' : 'New user' }}</h2>
          @if (userFormError) { <div class="banner banner-error">{{ userFormError }}</div> }
          <label>Name <input formControlName="name" /></label>
          @if (userForm.controls.name.touched && userForm.controls.name.invalid) {
            <small class="field-error">Name is required.</small>
          }
          <label>Email <input type="email" formControlName="email" /></label>
          @if (userForm.controls.email.touched && userForm.controls.email.invalid) {
            <small class="field-error">Valid email required.</small>
          }
          @if (!editingUserId) {
            <label>Password <input type="password" formControlName="password" /></label>
            @if (userForm.controls.password.touched && userForm.controls.password.invalid) {
              <small class="field-error">Min 8 characters.</small>
            }
          }
          <label>Role
            <select formControlName="role">
              <option value="Admin">Admin</option>
              <option value="FinanceOfficer">Finance Officer</option>
              <option value="DepartmentHead">Department Head</option>
              <option value="User">User</option>
            </select>
          </label>
          @if (userForm.controls.role.value === 'DepartmentHead') {
            <label>Department
              <select formControlName="departmentId">
                <option value="">Select</option>
                @for (d of departments; track d._id) {
                  <option [value]="d._id">{{ d.name }}</option>
                }
              </select>
            </label>
          }
          @if (editingUserId) {
            <label>Active
              <select formControlName="isActive">
                <option [value]="true">Active</option>
                <option [value]="false">Deactivated</option>
              </select>
            </label>
          }
          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="userForm.invalid || userSaving">
              {{ userSaving ? 'Saving…' : 'Save user' }}
            </button>
            @if (editingUserId) {
              <button class="btn btn-ghost" type="button" (click)="resetUserForm()">Cancel</button>
            }
          </div>
        </form>

        <div class="table-wrap card">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Active</th><th></th></tr>
            </thead>
            <tbody>
              @for (u of users; track u.id) {
                <tr>
                  <td>{{ u.name }}</td>
                  <td>{{ u.email }}</td>
                  <td><span class="badge">{{ u.role }}</span></td>
                  <td>{{ deptNameForUser(u) }}</td>
                  <td>{{ u.isActive ? '✓' : '✗' }}</td>
                  <td>
                    <button class="btn btn-ghost" type="button" (click)="editUser(u)">Edit</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="pager">
          <button class="btn btn-ghost" [disabled]="usersPage <= 1" (click)="usersPageChange(-1)">Previous</button>
          <span>Page {{ usersPage }} of {{ usersTotalPages }}</span>
          <button class="btn btn-ghost" [disabled]="usersPage >= usersTotalPages" (click)="usersPageChange(1)">Next</button>
        </div>
      </section>
    }

    <!-- ─── DEPARTMENTS TAB ─── -->
    @if (tab === 'departments') {
      <section>
        <app-status-banner [loading]="deptsLoading" [error]="deptsError" [empty]="!deptsLoading && !deptsError && departments.length === 0" />
        <form class="card form-grid" [formGroup]="deptForm" (ngSubmit)="saveDept()">
          <h2>{{ editingDeptId ? 'Edit department' : 'New department' }}</h2>
          @if (deptFormError) { <div class="banner banner-error">{{ deptFormError }}</div> }
          <label>Name <input formControlName="name" /></label>
          @if (deptForm.controls.name.touched && deptForm.controls.name.invalid) {
            <small class="field-error">Name required (min 3 chars).</small>
          }
          <label>Code <input formControlName="code" placeholder="e.g. DSEL" /></label>
          @if (deptForm.controls.code.touched && deptForm.controls.code.invalid) {
            <small class="field-error">Code required (2–10 uppercase letters).</small>
          }
          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="deptForm.invalid || deptSaving">
              {{ deptSaving ? 'Saving…' : 'Save department' }}
            </button>
            @if (editingDeptId) {
              <button class="btn btn-ghost" type="button" (click)="resetDeptForm()">Cancel</button>
            }
          </div>
        </form>

        <div class="table-wrap card">
          <table>
            <thead>
              <tr><th>Name</th><th>Code</th><th>Head</th><th></th></tr>
            </thead>
            <tbody>
              @for (d of departments; track d._id) {
                <tr>
                  <td>{{ d.name }}</td>
                  <td><span class="badge">{{ d.code }}</span></td>
                  <td>{{ headNameForDept(d) }}</td>
                  <td>
                    <button class="btn btn-ghost" type="button" (click)="editDept(d)">Edit</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }

    <!-- ─── THRESHOLDS TAB ─── -->
    @if (tab === 'thresholds') {
      <section>
        <div class="card form-grid">
          <h2>Detection thresholds</h2>
          <p class="muted">These values control when the anomaly detection engine generates an alert.</p>
          @if (thresholdsSaved) { <div class="banner banner-ok">Thresholds saved.</div> }
          @if (thresholdsError) { <div class="banner banner-error">{{ thresholdsError }}</div> }
          @if (thresholdsLoading) { <div class="banner banner-muted">Loading…</div> }
          @if (!thresholdsLoading && thresholds) {
            <form [formGroup]="thresholdForm" (ngSubmit)="saveThresholds()">
              <label>
                Under-utilization threshold (%)
                <input type="number" formControlName="underUtilizationPct" min="1" max="100" />
                @if (thresholdForm.controls.underUtilizationPct.invalid) {
                  <small class="field-error">1–100</small>
                }
                <small class="muted">Flag budget if utilization is below this % when time elapsed &gt; next threshold.</small>
              </label>
              <label>
                Time elapsed threshold for under-utilization (%)
                <input type="number" formControlName="underUtilizationTimeElapsedPct" min="1" max="100" />
                <small class="muted">Only flag under-utilization if this % of the period has passed.</small>
              </label>
              <label>
                Spike threshold (% of remaining budget)
                <input type="number" formControlName="spikeThresholdPct" min="1" max="100" />
                <small class="muted">Flag a single transaction if it exceeds this % of remaining allocation.</small>
              </label>
              <label>
                Pace deviation threshold (%)
                <input type="number" formControlName="paceDeviationPct" min="1" max="100" />
                <small class="muted">Flag if cumulative spend deviates more than this % from prorated expected spend.</small>
              </label>
              <div class="actions">
                <button class="btn btn-primary" type="submit" [disabled]="thresholdForm.invalid || thresholdSaving">
                  {{ thresholdSaving ? 'Saving…' : 'Save thresholds' }}
                </button>
              </div>
            </form>
          }
        </div>
      </section>
    }

    <!-- ─── AUDIT LOG TAB ─── -->
    @if (tab === 'audit') {
      <section>
        <app-status-banner [loading]="auditLoading" [error]="auditError" [empty]="!auditLoading && !auditError && auditLogs.length === 0" />
        <div class="table-wrap card">
          <table>
            <thead>
              <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Collection</th><th>Target ID</th></tr>
            </thead>
            <tbody>
              @for (log of auditLogs; track log._id) {
                <tr>
                  <td>{{ log.timestamp | date: 'medium' }}</td>
                  <td>{{ log.userId?.name || log.userId }}</td>
                  <td><span class="badge">{{ log.action }}</span></td>
                  <td>{{ log.targetCollection }}</td>
                  <td class="muted" style="font-size:0.78rem; max-width:120px; overflow:hidden; text-overflow:ellipsis;">{{ log.targetId }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="pager">
          <button class="btn btn-ghost" [disabled]="auditPage <= 1" (click)="auditPageChange(-1)">Previous</button>
          <span>Page {{ auditPage }} of {{ auditTotalPages }}</span>
          <button class="btn btn-ghost" [disabled]="auditPage >= auditTotalPages" (click)="auditPageChange(1)">Next</button>
        </div>
      </section>
    }
  `,
})
export class AdminPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  tab: Tab = 'users';

  // Users
  users: User[] = [];
  usersLoading = false;
  usersError: string | null = null;
  userSaving = false;
  userFormError: string | null = null;
  editingUserId: string | null = null;
  usersPage = 1;
  usersTotalPages = 1;
  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    role: ['FinanceOfficer' as string, Validators.required],
    departmentId: [''],
    isActive: [true],
  });

  // Departments
  departments: Department[] = [];
  deptsLoading = false;
  deptsError: string | null = null;
  deptSaving = false;
  deptFormError: string | null = null;
  editingDeptId: string | null = null;
  deptForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,10}$/)]],
  });

  // Thresholds
  thresholds: Thresholds | null = null;
  thresholdsLoading = false;
  thresholdsError: string | null = null;
  thresholdSaving = false;
  thresholdsSaved = false;
  thresholdForm = this.fb.group({
    underUtilizationPct: [40, [Validators.required, Validators.min(1), Validators.max(100)]],
    underUtilizationTimeElapsedPct: [70, [Validators.required, Validators.min(1), Validators.max(100)]],
    spikeThresholdPct: [25, [Validators.required, Validators.min(1), Validators.max(100)]],
    paceDeviationPct: [20, [Validators.required, Validators.min(1), Validators.max(100)]],
  });

  // Audit
  auditLogs: any[] = [];
  auditLoading = false;
  auditError: string | null = null;
  auditPage = 1;
  auditTotalPages = 1;

  ngOnInit() {
    this.loadUsers();
    this.loadDepartments();
  }

  setTab(t: Tab) {
    this.tab = t;
    if (t === 'thresholds' && !this.thresholds) this.loadThresholds();
    if (t === 'audit') this.loadAudit();
  }

  // ─── USERS ───
  loadUsers() {
    this.usersLoading = true;
    this.usersError = null;
    this.api.users({ page: this.usersPage, limit: 10 }).subscribe({
      next: (res) => {
        this.users = res.data;
        this.usersTotalPages = res.pagination.totalPages;
        this.usersLoading = false;
      },
      error: (err) => {
        this.usersLoading = false;
        this.usersError = err.error?.error || 'Failed to load users.';
      },
    });
  }

  usersPageChange(delta: number) {
    this.usersPage += delta;
    this.loadUsers();
  }

  editUser(u: User) {
    this.editingUserId = u.id;
    const deptId = u.departmentId ? (typeof u.departmentId === 'object' ? u.departmentId._id : u.departmentId) : '';
    this.userForm.patchValue({
      name: u.name,
      email: u.email,
      role: u.role,
      departmentId: deptId,
      isActive: u.isActive,
    });
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();
  }

  resetUserForm() {
    this.editingUserId = null;
    this.userFormError = null;
    this.userForm.reset({ role: 'FinanceOfficer', isActive: true });
    this.userForm.controls.password.setValidators([Validators.minLength(8)]);
    this.userForm.controls.password.updateValueAndValidity();
  }

  saveUser() {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.userSaving = true;
    this.userFormError = null;
    const v = this.userForm.getRawValue();
    const body: any = { name: v.name, email: v.email, role: v.role, isActive: v.isActive };
    if (!this.editingUserId && v.password) body.password = v.password;
    if (v.role === 'DepartmentHead') body.departmentId = v.departmentId;
    const req = this.editingUserId
      ? this.api.updateUser(this.editingUserId, body)
      : this.api.createUser(body);
    req.subscribe({
      next: () => {
        this.userSaving = false;
        this.resetUserForm();
        this.loadUsers();
      },
      error: (err) => {
        this.userSaving = false;
        this.userFormError = err.error?.error || 'Save failed.';
      },
    });
  }

  deptNameForUser(u: User): string {
    if (!u.departmentId) return '—';
    const d = typeof u.departmentId === 'object' ? u.departmentId : this.departments.find(x => x._id === u.departmentId);
    return d ? (typeof d === 'object' ? d.name || '' : '') : String(u.departmentId);
  }

  // ─── DEPARTMENTS ───
  loadDepartments() {
    this.deptsLoading = true;
    this.deptsError = null;
    this.api.departments(1, 100).subscribe({
      next: (res) => {
        this.departments = res.data;
        this.deptsLoading = false;
      },
      error: (err) => {
        this.deptsLoading = false;
        this.deptsError = err.error?.error || 'Failed to load departments.';
      },
    });
  }

  editDept(d: Department) {
    this.editingDeptId = d._id;
    this.deptForm.patchValue({ name: d.name, code: d.code });
  }

  resetDeptForm() {
    this.editingDeptId = null;
    this.deptFormError = null;
    this.deptForm.reset();
  }

  saveDept() {
    if (this.deptForm.invalid) { this.deptForm.markAllAsTouched(); return; }
    this.deptSaving = true;
    this.deptFormError = null;
    const body = this.deptForm.getRawValue() as any;
    const req = this.editingDeptId
      ? this.api.updateDepartment(this.editingDeptId, body)
      : this.api.createDepartment(body);
    req.subscribe({
      next: () => {
        this.deptSaving = false;
        this.resetDeptForm();
        this.loadDepartments();
      },
      error: (err) => {
        this.deptSaving = false;
        this.deptFormError = err.error?.error || 'Save failed.';
      },
    });
  }

  headNameForDept(d: Department): string {
    if (!d.headUserId) return '—';
    if (typeof d.headUserId === 'object') return (d.headUserId as User).name || '';
    const u = this.users.find(x => x.id === d.headUserId);
    return u ? u.name : String(d.headUserId);
  }

  // ─── THRESHOLDS ───
  loadThresholds() {
    this.thresholdsLoading = true;
    this.thresholdsError = null;
    this.api.thresholds().subscribe({
      next: (res) => {
        this.thresholds = res.data;
        this.thresholdForm.patchValue({
          underUtilizationPct: res.data.underUtilizationPct,
          underUtilizationTimeElapsedPct: res.data.underUtilizationTimeElapsedPct,
          spikeThresholdPct: res.data.spikeThresholdPct,
          paceDeviationPct: res.data.paceDeviationPct,
        });
        this.thresholdsLoading = false;
      },
      error: (err) => {
        this.thresholdsLoading = false;
        this.thresholdsError = err.error?.error || 'Failed to load thresholds.';
      },
    });
  }

  saveThresholds() {
    if (this.thresholdForm.invalid) { this.thresholdForm.markAllAsTouched(); return; }
    this.thresholdSaving = true;
    this.thresholdsSaved = false;
    this.thresholdsError = null;
    this.api.updateThresholds(this.thresholdForm.getRawValue() as any).subscribe({
      next: (res) => {
        this.thresholds = res.data;
        this.thresholdSaving = false;
        this.thresholdsSaved = true;
      },
      error: (err) => {
        this.thresholdSaving = false;
        this.thresholdsError = err.error?.error || 'Save failed.';
      },
    });
  }

  // ─── AUDIT LOG ───
  loadAudit() {
    this.auditLoading = true;
    this.auditError = null;
    this.api.auditLogs({ page: this.auditPage, limit: 15 }).subscribe({
      next: (res) => {
        this.auditLogs = res.data;
        this.auditTotalPages = res.pagination.totalPages;
        this.auditLoading = false;
      },
      error: (err) => {
        this.auditLoading = false;
        this.auditError = err.error?.error || 'Failed to load audit logs.';
      },
    });
  }

  auditPageChange(delta: number) {
    this.auditPage += delta;
    this.loadAudit();
  }
}
