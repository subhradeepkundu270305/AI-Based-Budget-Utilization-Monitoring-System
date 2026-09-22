import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../core/api.service';
import { DashboardData } from '../../core/models';
import { InrPipe } from '../../shared/inr.pipe';
import { StatusBannerComponent } from '../../shared/status-banner.component';
import { HeatmapComponent } from './heatmap.component';
import { StateDataService, StateData } from '../../core/state-data.service';
import { FinoraService } from '../../core/finora.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 3D Soft Shadow & Depth Plugin for Chart.js
const chart3dEffectsPlugin = {
  id: 'chart3dEffects',
  beforeDatasetsDraw(chart: any) {
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.shadowOffsetX = 1;
  },
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart;
    ctx.restore();
  }
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, InrPipe, StatusBannerComponent, HeatmapComponent, CommonModule, RouterModule],
  template: `
    <!-- ═══════════════════════════════════════════════════════
         NATIONAL OVERVIEW VIEW
    ═══════════════════════════════════════════════════════ -->
    <header class="page-head animate-fade-in-up" *ngIf="!selectedStateReport">
      <div>
        <h1>National Utilization Dashboard</h1>
        <p class="muted">Live allocation, macro-economic spend, and state-wise anomaly alerts</p>
      </div>
    </header>
    
    <app-status-banner [loading]="loading" [error]="error" [empty]="!loading && !error && !data" emptyText="No dashboard data yet." />
    
    @if (data && !selectedStateReport) {
      <section class="kpi-grid animate-fade-in-up delay-100">
        <article class="card kpi hover-tilt">
          <span><span class="kpi-icon">💼</span> Allocated</span>
          <strong>{{ data.kpis.allocated | inr }}</strong>
          <small class="kpi-sub">Total Union Budget Grant</small>
        </article>
        <article class="card kpi hover-tilt">
          <span><span class="kpi-icon">💳</span> Spent</span>
          <strong>{{ data.kpis.spent | inr }}</strong>
          <small class="kpi-sub">Total Expenditure Recorded</small>
        </article>
        <article class="card kpi hover-tilt">
          <span><span class="kpi-icon">📊</span> Utilization</span>
          <strong [style.color]="data.kpis.utilizationPct > 95 ? 'var(--color-danger)' : 'var(--color-primary)'">
            {{ data.kpis.utilizationPct }}%
          </strong>
          <small class="kpi-sub">Overall Trajectory Pace</small>
        </article>
        <article class="card kpi hover-tilt">
          <span><span class="kpi-icon">🚨</span> Open alerts</span>
          <strong [style.color]="data.kpis.openAlerts > 0 ? 'var(--color-warning)' : 'var(--color-success)'">
            {{ data.kpis.openAlerts }}
          </strong>
          <small class="kpi-sub">Anomalies Needing Action</small>
        </article>
      </section>

      <!-- Heatmap Interactive Section with Deep-Dive connector -->
      <section class="animate-fade-in-up delay-200" style="margin-bottom: var(--space-6);">
        <app-heatmap (openStateReport)="onSelectStateReport($event)"></app-heatmap>
      </section>

      <!-- Expanded 3D Analytics Grid -->
      <section class="chart-grid-3d">
        <!-- 1. Monthly Expenditure Velocity -->
        <article class="chart-card-3d animate-fade-in-up delay-300" data-chart-id="velocity" [class.is-extruded]="selectedVelocityIdx !== null">
          <div class="chart-card-top">
            <div class="chart-title-group">
              <div class="chart-badge-3d velocity-badge">
                <span class="pulse-dot"></span>
                <span>VELOCITY 3D</span>
              </div>
              <h2>Monthly Expenditure Velocity</h2>
              <p class="chart-sub">Absorption pace & macro disbursement velocity across Union Ministries</p>
            </div>
            <div class="chart-toolbar-3d">
              <button class="btn-3d-action" (click)="replayVelocity()" title="Replay 3D Wave Growth">
                <span class="btn-icon" [class.spin]="isReplayingVelocity">↻</span>
                <span>Replay Wave</span>
              </button>
              <span class="depth-badge">⚡ 3D Active</span>
            </div>
          </div>
          
          <!-- 3D Extrusion Telemetry HUD Banner (Appears when bar is clicked) -->
          @if (selectedVelocityBar) {
            <div class="extrusion-hud animate-pop-in">
              <div class="hud-item">
                <span class="hud-lbl">ELEVATED MONTH</span>
                <span class="hud-val text-accent">{{ selectedVelocityBar.month }}</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">ACTUAL DISBURSED</span>
                <span class="hud-val">{{ selectedVelocityBar.spent | inr }}</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">3D EXTRUSION LEAP</span>
                <span class="hud-tag">▲ +{{ selectedVelocityBar.growthPct }}% Dynamic Lift</span>
              </div>
              <button class="hud-dismiss" (click)="resetVelocityExtrusion()">✕ Reset Elevation</button>
            </div>
          } @else {
            <div class="click-hint-banner">
              <span>💡 Click any bar to extrude 3D elevation upwards & view velocity breakdown</span>
            </div>
          }

          <div class="canvas-3d-stage">
            <div class="ambient-glow-ground velocity-glow"></div>
            <canvas baseChart [type]="'bar'" [data]="barData" [options]="barOptions" [plugins]="chartPlugins" (chartClick)="onVelocityChartClick($event)"></canvas>
          </div>
        </article>

        <!-- 2. Utilization Trend (vs Ideal Pace) -->
        <article class="chart-card-3d animate-fade-in-up delay-300" data-chart-id="trend">
          <div class="chart-card-top">
            <div class="chart-title-group">
              <div class="chart-badge-3d trend-badge">
                <span class="pulse-dot"></span>
                <span>PACE 3D</span>
              </div>
              <h2>Utilization Trend (vs Ideal Pace)</h2>
              <p class="chart-sub">Cumulative expenditure trajectory vs 8.33%/month linear benchmark</p>
            </div>
            <div class="chart-toolbar-3d">
              <button class="btn-3d-action" (click)="replayTrend()" title="Replay 3D Draw Wave">
                <span class="btn-icon" [class.spin]="isReplayingTrend">↻</span>
                <span>Replay Pace</span>
              </button>
              <span class="depth-badge">🎯 Benchmarked</span>
            </div>
          </div>

          @if (selectedTrendPoint) {
            <div class="extrusion-hud animate-pop-in">
              <div class="hud-item">
                <span class="hud-lbl">INSPECTED MONTH</span>
                <span class="hud-val text-accent">{{ selectedTrendPoint.month }}</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">ACTUAL TRAJECTORY</span>
                <span class="hud-val">{{ selectedTrendPoint.actual.toFixed(1) }}%</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">IDEAL BENCHMARK</span>
                <span class="hud-val">{{ selectedTrendPoint.ideal.toFixed(1) }}%</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">VARIANCE DELTA</span>
                <span class="hud-tag" [class.negative]="selectedTrendPoint.variance < 0">
                  {{ selectedTrendPoint.variance >= 0 ? '▲ +' : '▼ ' }}{{ selectedTrendPoint.variance.toFixed(1) }}%
                </span>
              </div>
              <button class="hud-dismiss" (click)="selectedTrendPoint = null">✕ Close</button>
            </div>
          } @else {
            <div class="click-hint-banner">
              <span>💡 Click any vertex node to compare actual pace vs ideal benchmark</span>
            </div>
          }

          <div class="canvas-3d-stage">
            <div class="ambient-glow-ground trend-glow"></div>
            <canvas baseChart [type]="'line'" [data]="lineData" [options]="lineOptions" [plugins]="chartPlugins" (chartClick)="onTrendChartClick($event)"></canvas>
          </div>
        </article>

        <!-- 3. Top & Bottom States (by %) -->
        <article class="chart-card-3d animate-fade-in-up delay-400" data-chart-id="states">
          <div class="chart-card-top">
            <div class="chart-title-group">
              <div class="chart-badge-3d states-badge">
                <span class="pulse-dot"></span>
                <span>REGIONAL 3D</span>
              </div>
              <h2>Top & Bottom States (by %)</h2>
              <p class="chart-sub">Extremes in fund absorption performance across Indian States & UTs</p>
            </div>
            <div class="chart-toolbar-3d">
              <button class="btn-3d-action" (click)="replayStates()" title="Replay 3D Horizontal Bars">
                <span class="btn-icon" [class.spin]="isReplayingStates">↻</span>
                <span>Replay Bars</span>
              </button>
              <span class="depth-badge">🏛️ 36 Regions</span>
            </div>
          </div>

          @if (selectedStateBar) {
            <div class="extrusion-hud animate-pop-in">
              <div class="hud-item">
                <span class="hud-lbl">SELECTED STATE</span>
                <span class="hud-val text-accent">{{ selectedStateBar.name }}</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">UTILIZATION</span>
                <span class="hud-val">{{ selectedStateBar.utilizationPct }}%</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">PACE BENCHMARK</span>
                <span class="hud-tag" [ngClass]="getRiskClass(selectedStateBar.utilizationPct)">
                  {{ getRiskLabel(selectedStateBar.utilizationPct) }}
                </span>
              </div>
              <button class="btn-deepdive-action" (click)="onSelectStateReport(selectedStateBar)">
                Open 5-Yr Deep Dive →
              </button>
              <button class="hud-dismiss" (click)="selectedStateBar = null">✕</button>
            </div>
          } @else {
            <div class="click-hint-banner">
              <span>💡 Click any state bar to highlight absorption pace & open its ledger</span>
            </div>
          }

          <div class="canvas-3d-stage">
            <div class="ambient-glow-ground states-glow"></div>
            <canvas baseChart [type]="'bar'" [data]="topStatesData" [options]="horizontalBarOptions" [plugins]="chartPlugins" (chartClick)="onStatesChartClick($event)"></canvas>
          </div>
        </article>

        <!-- 4. Spend by Category -->
        <article class="chart-card-3d animate-fade-in-up delay-400" data-chart-id="category">
          <div class="chart-card-top">
            <div class="chart-title-group">
              <div class="chart-badge-3d category-badge">
                <span class="pulse-dot"></span>
                <span>SECTORS 3D</span>
              </div>
              <h2>Spend by Category</h2>
              <p class="chart-sub">Sovereign allocation breakdown across vital national sectors</p>
            </div>
            <div class="chart-toolbar-3d">
              <button class="btn-3d-action" (click)="replayCategory()" title="Replay 3D Doughnut Rotate">
                <span class="btn-icon" [class.spin]="isReplayingCategory">↻</span>
                <span>Replay Torus</span>
              </button>
              <span class="depth-badge">🥧 Torus 3D</span>
            </div>
          </div>

          @if (selectedCategorySlice) {
            <div class="extrusion-hud animate-pop-in">
              <div class="hud-item">
                <span class="hud-lbl">EXPLODED SECTOR</span>
                <span class="hud-val text-accent">{{ selectedCategorySlice.name }}</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">TOTAL EXPENDITURE</span>
                <span class="hud-val">{{ selectedCategorySlice.spent | inr }}</span>
              </div>
              <div class="hud-item">
                <span class="hud-lbl">SECTOR SHARE</span>
                <span class="hud-tag">✦ {{ selectedCategorySlice.pct }}% Total Spend</span>
              </div>
              <button class="hud-dismiss" (click)="resetCategorySlice()">✕ Reset Orbit</button>
            </div>
          } @else {
            <div class="click-hint-banner">
              <span>💡 Hover or click any sector arc to pop it out in 3D orbit</span>
            </div>
          }

          <div class="canvas-3d-stage doughnut-stage">
            <div class="ambient-glow-ground cat-glow"></div>
            <div class="doughnut-container">
              <canvas baseChart [type]="'doughnut'" [data]="pieCatData" [options]="pieOptions" [plugins]="chartPlugins" (chartClick)="onCategoryChartClick($event)" (chartHover)="onCategoryChartHover($event)"></canvas>
              
              <!-- Center Holographic Telemetry Badge inside the Doughnut Hole -->
              <div class="torus-center-telemetry">
                <span class="torus-icon">🏛️</span>
                <span class="torus-sub">{{ activeCategoryHover?.name || 'TOTAL UNION SPEND' }}</span>
                <span class="torus-val">{{ (activeCategoryHover?.spent || totalCategorySpent) | inr }}</span>
                <span class="torus-badge">{{ activeCategoryHover ? (activeCategoryHover.pct + '% Share') : 'All Sectors' }}</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    }

    <!-- ═══════════════════════════════════════════════════════
         STATE FISCAL DEEP-DIVE ANALYTICS VIEW
    ═══════════════════════════════════════════════════════ -->
    @if (selectedStateReport) {
      <div class="state-deep-dive animate-fade-in-up" [class.scanning-active]="isScanning">
        
        <!-- ══ PRO HOLOGRAPHIC SCANNING OVERLAY ══ -->
        @if (isScanning) {
          <div class="report-scan-overlay">
            <div class="scan-grid-matrix"></div>

            <!-- Holographic Telemetry HUD -->
            <div class="scan-hud-panel">
              <div class="hud-header">
                <div class="hud-brand">
                  <span class="hud-sparkle">✦</span>
                  <span class="hud-title">FINORA AI TELEMETRY SCANNER</span>
                </div>
                <span class="hud-status-badge">LIVE SCANNING</span>
              </div>

              <div class="hud-state-name">{{ selectedStateReport.name }} &bull; FY 2026-27 Ledger</div>

              <div class="hud-bar-track">
                <div class="hud-bar-fill"></div>
              </div>

              <div class="hud-metrics-row">
                <span>Allocated: <strong>₹{{ selectedStateReport.allocated | inr }}</strong></span>
                <span>Utilized: <strong>₹{{ selectedStateReport.spent | inr }}</strong></span>
                <span>Pace: <strong>{{ selectedStateReport.utilizationPct }}%</strong></span>
              </div>
            </div>

            <!-- Animated Laser Scan Line & Trailing Beam -->
            <div class="laser-scanner-rig">
              <div class="laser-trailing-field"></div>
              <div class="laser-beam-line"></div>
              <div class="laser-reticle left"></div>
              <div class="laser-reticle right"></div>
            </div>
          </div>
        }

        <!-- Top Action Bar -->
        <div class="state-report-header card">
          <div class="header-left">
            <button class="btn btn-secondary back-btn" (click)="closeStateReport()">
              <span class="back-arrow">←</span>
              <span>Back to National Map</span>
            </button>
            <div class="state-title-block">
              <div class="state-flag-badge">📍</div>
              <div>
                <h1>{{ selectedStateReport.name }}</h1>
                <p class="muted">Comprehensive Fiscal Performance & Analytics Report (FY 2026-27)</p>
              </div>
            </div>
          </div>

          <div class="header-right">
            <!-- Quick State Switcher Dropdown with Prefix Pin -->
            <div class="state-selector-wrap">
              <span class="selector-prefix-icon" title="State location">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <select class="state-select" [value]="selectedStateReport.name" (change)="onSwitchState($event)" title="Switch state analytics">
                <option *ngFor="let s of allStatesList" [value]="s.name">{{ s.name }} ({{ s.utilizationPct }}%)</option>
              </select>
            </div>

            <!-- ✦ AI Summary Button (Placed between Switch State and Download Report) -->
            <button 
              class="btn btn-ai-summary" 
              (click)="runAiSummaryScan()" 
              [disabled]="isScanning"
              title="Scan report and generate Finora AI executive analysis"
            >
              <span class="ai-sparkle-icon" [class.pulse-spin]="isScanning">✦</span>
              <span class="ai-btn-title">{{ isScanning ? 'Scanning Telemetry…' : 'AI Summary' }}</span>
              <span class="ai-badge-chip" *ngIf="!isScanning">Finora</span>
            </button>

            <!-- Download PDF Report -->
            <button class="btn btn-primary export-pdf-btn" (click)="exportStatePdf()" [disabled]="downloadingPdf">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{{ downloadingPdf ? 'Generating PDF...' : 'Download PDF Report' }}</span>
            </button>
          </div>
        </div>

        <!-- Executive Summary & Risk Assessment Card -->
        <article class="card executive-summary-card animate-fade-in-up delay-1">
          <div class="summary-top">
            <div class="risk-badge-group">
              <span class="report-badge">Executive Assessment</span>
              <span class="risk-badge" [ngClass]="getRiskClass(selectedStateReport.utilizationPct)">
                {{ getRiskLabel(selectedStateReport.utilizationPct) }}
              </span>
            </div>
            <span class="timestamp-sub">Source: PFMS Integration Live Telemetry</span>
          </div>
          <p class="summary-text">{{ selectedStateReport.summary }}</p>
        </article>

        <!-- 4-Column 3D State KPIs -->
        <section class="kpi-grid animate-fade-in-up delay-2">
          <article class="card kpi hover-tilt">
            <span><span class="kpi-icon">💼</span> Total Allocated</span>
            <strong>{{ selectedStateReport.allocated | inr }}</strong>
            <small class="kpi-sub">Central & State Grants</small>
          </article>

          <article class="card kpi hover-tilt">
            <span><span class="kpi-icon">💳</span> Total Utilized</span>
            <strong>{{ selectedStateReport.spent | inr }}</strong>
            <small class="kpi-sub">Verified Disbursals</small>
          </article>

          <article class="card kpi hover-tilt">
            <span><span class="kpi-icon">📊</span> Absorption Rate</span>
            <strong [style.color]="getSeverityColor(selectedStateReport.utilizationPct)">
              {{ selectedStateReport.utilizationPct }}%
            </strong>
            <small class="kpi-sub">{{ getPaceBenchmark(selectedStateReport.utilizationPct) }}</small>
          </article>

          <article class="card kpi hover-tilt">
            <span><span class="kpi-icon">⚖️</span> Remaining Balance</span>
            <strong [style.color]="selectedStateReport.allocated < selectedStateReport.spent ? 'var(--color-danger)' : 'var(--text-heading)'">
              {{ (selectedStateReport.allocated - selectedStateReport.spent) | inr }}
            </strong>
            <small class="kpi-sub">Available Funds</small>
          </article>
        </section>

        <!-- Analytics Charts: 5-Year History + Sector Doughnut -->
        <section class="chart-grid animate-fade-in-up delay-3">
          <!-- 5-Year Fiscal Growth Chart -->
          <article class="card hover-tilt">
            <div class="chart-card-head">
              <div>
                <h2>5-Year Fiscal History (Allocation vs Spend)</h2>
                <p class="muted">Growth in capital sanctions against actual ground disbursement (2020-2024)</p>
              </div>
              <span class="badge bg-primary">5-Year Trend</span>
            </div>
            <div style="height: 320px; position: relative;">
              <canvas baseChart [type]="'bar'" [data]="stateHistoryChartData" [options]="stateHistoryChartOptions"></canvas>
            </div>
          </article>

          <!-- Sector-wise Breakdown Doughnut -->
          <article class="card hover-tilt">
            <div class="chart-card-head">
              <div>
                <h2>Sector-wise Expenditure Distribution</h2>
                <p class="muted">Resource distribution across Education, Health, Rural & Urban Infra</p>
              </div>
              <span class="badge bg-success">Sector Share</span>
            </div>
            <div style="height: 320px; position: relative;">
              <canvas baseChart [type]="'doughnut'" [data]="stateCategoryChartData" [options]="pieOptions"></canvas>
            </div>
          </article>
        </section>

        <!-- Cumulative Spend Run-Rate Velocity -->
        <section class="animate-fade-in-up delay-4" style="margin-bottom: var(--space-6);">
          <article class="card hover-tilt">
            <div class="chart-card-head">
              <div>
                <h2>Cumulative 6-Month Expenditure Run-Rate</h2>
                <p class="muted">Progressive monthly disbursements tracking pace toward annual target</p>
              </div>
              <span class="badge bg-warning">Run Rate Velocity</span>
            </div>
            <div style="height: 280px; position: relative;">
              <canvas baseChart [type]="'line'" [data]="stateTrendChartData" [options]="stateTrendChartOptions"></canvas>
            </div>
          </article>
        </section>

        <!-- Active Anomalies for this State -->
        <section class="animate-fade-in-up delay-4" style="margin-bottom: var(--space-6);" *ngIf="selectedStateReport.alerts.length > 0">
          <div class="section-heading-row">
            <h2>Active Anomalies & Flagged Risks ({{ selectedStateReport.alerts.length }})</h2>
            <a routerLink="/alerts" class="view-all-link">Inspect Anomaly Center →</a>
          </div>
          <div class="stack">
            <article *ngFor="let a of selectedStateReport.alerts" class="card alert-card">
              <div class="alert-meta">
                <span class="badge" [ngClass]="a.severity === 'High' ? 'bg-danger' : 'bg-warning'">{{ a.severity }} SEVERITY</span>
                <span class="badge bg-muted">{{ a.type }}</span>
                <span class="muted">PFMS Auto-Detector Rule</span>
              </div>
              <p style="font-weight: 700; font-size: 0.95rem;">{{ a.message }}</p>
              <p class="muted">Recommended Action: Expedite department sanction approvals and clear pending vendor verification to normalize absorption rate.</p>
            </article>
          </div>
        </section>

        <!-- Flagship Programs Table -->
        <section class="animate-fade-in-up delay-5" style="margin-bottom: var(--space-6);">
          <div class="section-heading-row">
            <h2>Flagship Programs & Centrally Sponsored Schemes</h2>
          </div>
          <div class="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>Scheme / Program</th>
                  <th>Sector Focus</th>
                  <th>State Allocation Share</th>
                  <th>Estimated Disbursed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let scheme of selectedStateReport.topSchemes; let i = index">
                  <td><strong>{{ scheme }}</strong></td>
                  <td>{{ selectedStateReport.categoryBreakdown[i % selectedStateReport.categoryBreakdown.length].category }}</td>
                  <td>{{ (selectedStateReport.allocated * (0.35 - i * 0.08)) | inr }}</td>
                  <td>{{ (selectedStateReport.spent * (0.35 - i * 0.08)) | inr }}</td>
                  <td><span class="badge bg-success">Active Ongoing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 768px) {
      .chart-grid { grid-template-columns: 1fr; }
    }

    /* ═══════════════════════════════════════════════════════
       3D ANALYTICS CARDS & STAGES
    ═══════════════════════════════════════════════════════ */
    .chart-grid-3d {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(520px, 1fr));
      gap: 1.75rem;
      margin-bottom: 2.5rem;
      perspective: 1200px;
    }
    @media (max-width: 900px) {
      .chart-grid-3d { grid-template-columns: 1fr; }
    }

    .chart-card-3d {
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid rgba(226, 232, 240, 0.85);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow:
        0 10px 25px -5px rgba(15, 23, 42, 0.06),
        0 20px 48px -12px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.95);
      position: relative;
      overflow: hidden;
      transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease;
      transform-style: preserve-3d;
      backdrop-filter: blur(16px);
    }
    .chart-card-3d:hover {
      transform: translateY(-5px) rotateX(1.5deg);
      box-shadow:
        0 16px 36px -6px rgba(15, 23, 42, 0.1),
        0 30px 60px -15px rgba(15, 23, 42, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 1);
      border-color: rgba(99, 102, 241, 0.4);
    }
    .chart-card-3d.is-extruded {
      border-color: #F59E0B;
      box-shadow:
        0 16px 40px -8px rgba(245, 158, 11, 0.2),
        0 0 0 1px rgba(245, 158, 11, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 1);
    }

    .chart-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .chart-title-group h2 {
      margin: 0.35rem 0 0.15rem 0;
      font-size: 1.18rem;
      font-weight: 800;
      color: var(--text-heading);
      letter-spacing: -0.015em;
    }
    .chart-sub {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .chart-badge-3d {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .velocity-badge {
      background: rgba(99, 102, 241, 0.12);
      color: #4F46E5;
      border: 1px solid rgba(99, 102, 241, 0.25);
    }
    .trend-badge {
      background: rgba(13, 148, 136, 0.12);
      color: #0D9488;
      border: 1px solid rgba(13, 148, 136, 0.25);
    }
    .states-badge {
      background: rgba(245, 158, 11, 0.12);
      color: #D97706;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .category-badge {
      background: rgba(139, 92, 246, 0.12);
      color: #7C3AED;
      border: 1px solid rgba(139, 92, 246, 0.25);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
      animation: pulseGlow 1.8s infinite ease-in-out;
    }

    .chart-toolbar-3d {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-3d-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      border: 1.5px solid rgba(148, 163, 184, 0.3);
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-body);
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.04);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .btn-3d-action:hover {
      background: #F8FAFC;
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
    }
    .btn-icon.spin {
      animation: spinIcon 0.8s linear infinite;
    }
    .depth-badge {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      background: rgba(241, 245, 249, 0.9);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid rgba(203, 213, 225, 0.6);
    }

    .click-hint-banner {
      display: flex;
      align-items: center;
      background: rgba(248, 250, 252, 0.8);
      border: 1px dashed rgba(203, 213, 225, 0.8);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .extrusion-hud {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.98) 100%);
      color: #F8FAFC;
      padding: 10px 16px;
      border-radius: 12px;
      margin-bottom: 14px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.12);
      animation: hudPopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .hud-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hud-lbl {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #94A3B8;
      text-transform: uppercase;
    }
    .hud-val {
      font-size: 0.92rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .hud-val.text-accent {
      color: #38BDF8;
    }
    .hud-tag {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .hud-tag.negative {
      background: rgba(225, 29, 72, 0.2);
      color: #FB7185;
      border-color: rgba(251, 113, 133, 0.3);
    }
    .hud-dismiss {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #F8FAFC;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .hud-dismiss:hover {
      background: rgba(255, 255, 255, 0.22);
    }
    .btn-deepdive-action {
      background: linear-gradient(135deg, #0D9488 0%, #059669 100%);
      color: #FFFFFF;
      border: none;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .btn-deepdive-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.5);
    }

    .canvas-3d-stage {
      position: relative;
      min-height: 280px;
    }
    .ambient-glow-ground {
      position: absolute;
      bottom: 10px;
      left: 10%;
      right: 10%;
      height: 60px;
      filter: blur(28px);
      pointer-events: none;
      border-radius: 50%;
      opacity: 0.35;
      z-index: 0;
    }
    .velocity-glow { background: radial-gradient(circle, #6366F1, transparent 70%); }
    .trend-glow    { background: radial-gradient(circle, #0D9488, transparent 70%); }
    .states-glow   { background: radial-gradient(circle, #F59E0B, transparent 70%); }
    .cat-glow      { background: radial-gradient(circle, #8B5CF6, transparent 70%); }

    .doughnut-stage {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .doughnut-container {
      position: relative;
      width: 100%;
      max-width: 480px;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .torus-center-telemetry {
      position: absolute;
      top: 50%;
      left: 36%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 130px;
    }
    @media (max-width: 600px) {
      .torus-center-telemetry { left: 50%; }
    }
    .torus-icon {
      font-size: 1.4rem;
      margin-bottom: 2px;
    }
    .torus-sub {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .torus-val {
      font-size: 0.98rem;
      font-weight: 800;
      color: var(--text-heading);
      letter-spacing: -0.02em;
    }
    .torus-badge {
      font-size: 0.62rem;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.12);
      color: #4F46E5;
      margin-top: 2px;
    }

    @keyframes pulseGlow {
      0%, 100% { opacity: 0.5; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.15); }
    }
    @keyframes spinIcon {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes hudPopIn {
      0%   { opacity: 0; transform: translateY(-8px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* State Deep-Dive Styles */
    .state-deep-dive {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .state-report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
      padding: var(--space-5) var(--space-6);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.5rem 1rem;
      font-size: var(--text-sm);
      font-weight: 700;
    }
    .back-arrow {
      font-size: 1.1rem;
      transition: transform 0.2s ease;
    }
    .back-btn:hover .back-arrow {
      transform: translateX(-4px);
    }

    .state-title-block {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .state-flag-badge {
      font-size: 2rem;
      flex-shrink: 0;
    }
    .state-title-block h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .state-selector-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .state-selector-wrap:hover {
      transform: translateY(-2px);
    }
    .selector-prefix-icon {
      position: absolute;
      left: 12px;
      color: var(--color-primary);
      pointer-events: none;
      z-index: 2;
      display: flex;
      align-items: center;
      transition: transform 0.25s ease, color 0.25s ease;
    }
    .state-selector-wrap:hover .selector-prefix-icon {
      transform: scale(1.15) rotate(-6deg);
      color: var(--color-accent);
    }
    .state-selector-wrap .state-select {
      height: 42px;
      padding: 0.4rem 2.4rem 0.4rem 2.3rem;
      font-size: var(--text-sm);
      font-weight: 700;
      border-radius: var(--radius-md);
      background-color: rgba(255, 255, 255, 0.95);
      border: 1.5px solid rgba(148, 163, 184, 0.35);
      color: var(--text-heading);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .state-selector-wrap .state-select:hover {
      background-color: #ffffff;
      border-color: var(--color-primary);
      box-shadow: 0 6px 18px rgba(79, 70, 229, 0.15);
    }
    .state-selector-wrap .state-select:focus {
      border-color: var(--color-primary);
      background-color: #ffffff;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.18), 0 8px 24px rgba(15, 23, 42, 0.08);
      outline: none;
    }
    .btn-ai-summary {
      height: 42px;
    }
    .export-pdf-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      height: 42px;
      padding: 0 1.25rem;
    }

    /* Executive summary */
    .executive-summary-card {
      padding: var(--space-5) var(--space-6);
      border-left: 4px solid var(--color-primary);
    }
    .summary-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }
    .risk-badge-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .report-badge {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-primary);
      background: var(--color-primary-lt);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
    }
    .risk-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }
    .risk-optimal { background: rgba(16, 185, 129, 0.15); color: #047857; }
    .risk-lagging { background: rgba(239, 68, 68, 0.15); color: #BE123C; }
    .risk-over    { background: rgba(245, 158, 11, 0.15); color: #B45309; }

    .timestamp-sub {
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-weight: 500;
    }
    .summary-text {
      font-size: var(--text-sm);
      line-height: 1.6;
      color: var(--text-heading);
      margin: 0;
    }

    .chart-card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
      gap: var(--space-3);
    }
    .chart-card-head h2 {
      margin: 0 0 2px;
      font-size: 1.15rem;
    }

    .section-heading-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    .section-heading-row h2 {
      margin: 0;
      font-size: 1.2rem;
    }
    .view-all-link {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
    }
    .view-all-link:hover {
      text-decoration: underline;
    }

    /* ═══════════════════════════════════════════════════════
       ✦ AI SUMMARY BUTTON & HOLOGRAPHIC SCANNER
    ═══════════════════════════════════════════════════════ */
    .btn-ai-summary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0.45rem 1rem;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #EC4899 100%);
      color: #ffffff;
      font-size: var(--text-sm);
      font-weight: 700;
      border: 1.5px solid rgba(255, 255, 255, 0.45);
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }
    .btn-ai-summary:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 8px 22px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      border-color: rgba(255, 255, 255, 0.8);
    }
    .btn-ai-summary:active:not(:disabled) {
      transform: scale(0.96);
    }
    .btn-ai-summary:disabled {
      opacity: 0.75;
      cursor: wait;
    }

    .ai-sparkle-icon {
      font-size: 1rem;
      color: #FDE047;
      transition: transform 0.3s;
    }
    .ai-sparkle-icon.pulse-spin {
      animation: spinSparkle 1.2s linear infinite;
    }
    .ai-badge-chip {
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: rgba(255, 255, 255, 0.25);
      padding: 1px 6px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* ── Holographic Scanning Overlay ── */
    .state-deep-dive {
      position: relative;
    }
    .state-deep-dive.scanning-active {
      user-select: none;
    }

    .report-scan-overlay {
      position: absolute;
      inset: -12px;
      z-index: 100;
      pointer-events: none;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: rgba(15, 23, 42, 0.16);
      backdrop-filter: blur(1.5px);
      animation: fadeInOverlay 0.3s ease;
    }

    .scan-grid-matrix {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.12) 1px, transparent 1px);
      background-size: 36px 36px;
      opacity: 0.7;
    }

    /* Floating HUD telemetry card */
    .scan-hud-panel {
      position: fixed;
      top: calc(var(--header-height) + 24px);
      left: 50%;
      transform: translateX(-50%);
      width: 450px;
      max-width: 90vw;
      z-index: 130;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1.5px solid rgba(129, 140, 248, 0.6);
      border-radius: 20px;
      padding: 16px 22px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 35px rgba(99, 102, 241, 0.4);
      animation: hudPopup 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .hud-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      font-size: 0.74rem;
      color: #A5B4FC;
      letter-spacing: 0.06em;
    }
    .hud-sparkle {
      color: #F59E0B;
      font-size: 0.85rem;
      animation: spinSparkle 4s linear infinite;
    }
    .hud-status-badge {
      font-size: 0.65rem;
      font-weight: 800;
      color: #10B981;
      background: rgba(16, 185, 129, 0.18);
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(16, 185, 129, 0.35);
      letter-spacing: 0.05em;
    }
    .hud-state-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .hud-bar-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .hud-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #38BDF8, #818CF8, #EC4899);
      width: 0%;
      animation: hudProgressFill 2.2s ease-in-out forwards;
    }
    .hud-metrics-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.74rem;
      color: #C7D2FE;
    }
    .hud-metrics-row strong {
      color: #ffffff;
    }

    /* Laser Scanner Rig */
    .laser-scanner-rig {
      position: absolute;
      left: 0;
      right: 0;
      height: 180px;
      pointer-events: none;
      animation: laserSweepDown 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .laser-beam-line {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent 0%, #38BDF8 20%, #818CF8 50%, #EC4899 80%, transparent 100%);
      box-shadow: 0 0 16px 4px #818CF8, 0 0 40px 10px rgba(56, 189, 248, 0.6);
    }
    .laser-trailing-field {
      position: absolute;
      top: 0;
      bottom: 4px;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.15) 60%, rgba(129, 140, 248, 0.35) 100%);
    }
    .laser-reticle {
      position: absolute;
      bottom: -8px;
      width: 20px;
      height: 20px;
      border: 2px solid #38BDF8;
      border-radius: 50%;
      box-shadow: 0 0 12px #38BDF8;
    }
    .laser-reticle.left  { left: 24px; }
    .laser-reticle.right { right: 24px; }

    /* Keyframes */
    @keyframes laserSweepDown {
      0% {
        top: -120px;
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        top: calc(100% - 60px);
        opacity: 0;
      }
    }
    @keyframes hudProgressFill {
      0%   { width: 0%; }
      100% { width: 100%; }
    }
    @keyframes hudPopup {
      0% {
        opacity: 0;
        transform: translate(-50%, -15px) scale(0.92);
      }
      100% {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }
    }
    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes spinSparkle {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  data: DashboardData | null = null;

  chartPlugins = [chart3dEffectsPlugin];

  // Viewport scroll-trigger observer
  scrollObserver: IntersectionObserver | null = null;
  lastAnimatedMap: Record<string, number> = {};
  
  // National charts
  lineData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  barData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  pieCatData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  topStatesData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  // 1. Monthly Expenditure Velocity 3D state
  originalSpendTrendData: { month: string; spent: number }[] = [];
  selectedVelocityIdx: number | null = null;
  selectedVelocityBar: { month: string; spent: number; growthPct: number } | null = null;
  isReplayingVelocity = false;

  // 2. Utilization Trend (vs Ideal Pace) 3D state
  selectedTrendIdx: number | null = null;
  selectedTrendPoint: { month: string; actual: number; ideal: number; variance: number } | null = null;
  isReplayingTrend = false;

  // 3. Top & Bottom States 3D state
  topBottomStatesList: StateData[] = [];
  selectedStateBar: StateData | null = null;
  isReplayingStates = false;

  // 4. Spend by Category 3D Torus state
  totalCategorySpent = 0;
  selectedCategoryIdx: number | null = null;
  selectedCategorySlice: { name: string; spent: number; pct: number } | null = null;
  activeCategoryHover: { name: string; spent: number; pct: number } | null = null;
  isReplayingCategory = false;
  
  // State Deep-Dive data & charts
  selectedStateReport: StateData | null = null;
  allStatesList: StateData[] = [];
  downloadingPdf = false;
  isScanning = false;
  
  stateHistoryChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  stateCategoryChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  stateTrendChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  
  stateHistoryChartOptions: any;
  stateTrendChartOptions: any;

  // Common chart defaults
  commonOptions: any = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart'
    }
  };

  // 1. 3D Bar Options: Monthly Expenditure Velocity with Growing Wave Animation
  barOptions: any = {
    ...this.commonOptions,
    aspectRatio: 1.8,
    layout: { padding: { top: 12, bottom: 4, left: 4, right: 4 } },
    animation: {
      duration: 1300,
      easing: 'easeOutQuart'
    },
    animations: {
      y: {
        type: 'number',
        duration: 1200,
        easing: 'easeOutQuart',
        delay: (ctx: any) => (ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 85 : 0),
        from: (ctx: any) => {
          if (ctx.type === 'data' && ctx.chart?.scales?.y) {
            return ctx.chart.scales.y.getPixelForValue(0);
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (item: any) => ` Disbursed: ₹${Number(item.raw).toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: '#64748B' }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          callback: (v: any) => '₹' + (Number(v) >= 10000000 ? (Number(v) / 10000000).toFixed(1) + ' Cr' : Number(v).toLocaleString('en-IN')),
          font: { family: 'Inter', size: 11 },
          color: '#64748B'
        }
      }
    },
    onClick: (_e: any, elements: any[]) => {
      if (elements && elements.length > 0) {
        this.handleVelocityBarClick(elements[0].index);
      }
    }
  };

  // 2. 3D Line Options: Utilization Trend with Wave Draw & Point Spheres
  lineOptions: any = {
    ...this.commonOptions,
    aspectRatio: 1.8,
    layout: { padding: { top: 12, bottom: 4, left: 4, right: 4 } },
    animation: {
      duration: 1400,
      easing: 'easeOutQuart'
    },
    animations: {
      y: {
        type: 'number',
        duration: 1200,
        easing: 'easeOutCubic',
        delay: (ctx: any) => (ctx.type === 'data' ? ctx.dataIndex * 70 : 0)
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, boxWidth: 8, padding: 12, font: { family: 'Inter', size: 12, weight: 600 } }
      },
      tooltip: {
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (item: any) => ` ${item.dataset.label}: ${Number(item.raw).toFixed(1)}%`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: '#64748B' }
      },
      y: {
        beginAtZero: true,
        max: 110,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { callback: (v: any) => v + '%', font: { family: 'Inter', size: 11 }, color: '#64748B' }
      }
    },
    onClick: (_e: any, elements: any[]) => {
      if (elements && elements.length > 0) {
        this.handleTrendPointClick(elements[0].index);
      }
    }
  };

  // 3. 3D Horizontal Bar Options: Top & Bottom States with Horizontal Wave Grow
  horizontalBarOptions: any = {
    ...this.commonOptions,
    aspectRatio: 1.8,
    indexAxis: 'y',
    layout: { padding: { top: 10, bottom: 4, left: 4, right: 12 } },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart'
    },
    animations: {
      x: {
        type: 'number',
        duration: 1100,
        easing: 'easeOutQuart',
        delay: (ctx: any) => (ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 85 : 0),
        from: (ctx: any) => {
          if (ctx.type === 'data' && ctx.chart?.scales?.x) {
            return ctx.chart.scales.x.getPixelForValue(0);
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (item: any) => ` Utilization: ${item.raw}% (Click to Inspect)`
        }
      }
    },
    scales: {
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 700 }, color: '#334155' }
      },
      x: {
        beginAtZero: true,
        max: 120,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { callback: (v: any) => v + '%', font: { family: 'Inter', size: 11 }, color: '#64748B' }
      }
    },
    onClick: (_e: any, elements: any[]) => {
      if (elements && elements.length > 0) {
        this.handleStateBarClick(elements[0].index);
      }
    }
  };

  // 4. 3D Torus Doughnut Options: Spend by Category
  pieOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    layout: { padding: 10 },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1300,
      easing: 'easeOutCirc'
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
          font: { family: 'Inter', size: 11, weight: 600 },
          color: '#334155'
        }
      },
      tooltip: {
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (item: any) => {
            const val = Number(item.raw);
            const pct = this.totalCategorySpent > 0 ? ((val / this.totalCategorySpent) * 100).toFixed(1) : '0';
            return ` ${item.label}: ₹${val.toLocaleString('en-IN')} (${pct}%)`;
          }
        }
      }
    },
    onClick: (_e: any, elements: any[]) => {
      if (elements && elements.length > 0) {
        this.handleCategoryClick(elements[0].index);
      }
    }
  };

  constructor(
    private api: ApiService, 
    private stateDataService: StateDataService,
    private route: ActivatedRoute,
    private finoraService: FinoraService
  ) {
    this.allStatesList = this.stateDataService.getAllStates().sort((a,b) => a.name.localeCompare(b.name));
    this.initReportChartOptions();
  }

  runAiSummaryScan() {
    if (!this.selectedStateReport || this.isScanning) return;
    this.isScanning = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Laser scan animation sweeps through the report for 2.2s before generating AI summary in Finora
    setTimeout(() => {
      this.isScanning = false;
      if (this.selectedStateReport) {
        this.finoraService.triggerStateSummaryScan(this.selectedStateReport);
      }
    }, 2200);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['state']) {
        const targetState = this.allStatesList.find(
          s => s.name.toLowerCase() === params['state'].toLowerCase() ||
               s.id.toLowerCase() === params['state'].toLowerCase()
        );
        if (targetState) {
          this.onSelectStateReport(targetState);
        }
      }
    });

    this.api.dashboard().subscribe({
      next: (data) => {
        this.data = data;
        this.originalSpendTrendData = [...data.spendTrend];
        this.totalCategorySpent = data.byCategory.reduce((acc, c) => acc + c.spent, 0);

        const sortedByUtil = [...this.allStatesList].sort((a,b) => b.utilizationPct - a.utilizationPct);
        const top3 = sortedByUtil.slice(0, 3);
        const bottom3 = sortedByUtil.slice(-3);
        this.topBottomStatesList = [...top3, ...bottom3];

        // Initialize label metadata with empty datasets so canvases are primed to animate on scroll
        this.barData = { labels: data.spendTrend.map((t) => t.month), datasets: [] };
        this.lineData = { labels: data.spendTrend.map((t) => t.month), datasets: [] };
        this.topStatesData = { labels: this.topBottomStatesList.map(s => s.name), datasets: [] };
        this.pieCatData = { labels: data.byCategory.map((c) => c._id), datasets: [] };

        this.loading = false;

        // Set up viewport scroll observer: as soon as the user scrolls to the section, the charts animate
        setTimeout(() => this.setupScrollObservers(), 100);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load dashboard.';
      },
    });
  }

  ngOnDestroy() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = null;
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // VIEWPORT SCROLL-TRIGGER ANIMATION SYSTEM
  // ═════════════════════════════════════════════════════════════════

  setupScrollObservers() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      this.renderAllCharts();
      return;
    }

    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const chartId = entry.target.getAttribute('data-chart-id');
        if (entry.isIntersecting && chartId) {
          entry.target.classList.add('in-view');
          this.triggerChartAnimation(chartId);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    const cards = document.querySelectorAll('.chart-card-3d[data-chart-id]');
    cards.forEach(card => this.scrollObserver?.observe(card));
  }

  triggerChartAnimation(chartId: string) {
    const now = Date.now();
    const last = this.lastAnimatedMap[chartId] || 0;
    
    // Animate on first viewport entrance or if re-entered after 2.5s
    if (now - last > 2500) {
      this.lastAnimatedMap[chartId] = now;
      if (chartId === 'velocity') {
        this.renderVelocityChart();
      } else if (chartId === 'trend') {
        this.renderTrendChart();
      } else if (chartId === 'states') {
        this.renderStatesChart();
      } else if (chartId === 'category') {
        this.renderCategoryChart();
      }
    }
  }

  renderVelocityChart() {
    if (this.barData.datasets && this.barData.datasets.length > 0) {
      this.barData = { labels: this.barData.labels, datasets: [] };
      setTimeout(() => this.buildVelocityChartData(), 40);
    } else {
      this.buildVelocityChartData();
    }
  }

  renderTrendChart() {
    if (this.lineData.datasets && this.lineData.datasets.length > 0) {
      this.lineData = { labels: this.lineData.labels, datasets: [] };
      setTimeout(() => this.buildTrendChartData(), 40);
    } else {
      this.buildTrendChartData();
    }
  }

  renderStatesChart() {
    if (this.topStatesData.datasets && this.topStatesData.datasets.length > 0) {
      this.topStatesData = { labels: this.topStatesData.labels, datasets: [] };
      setTimeout(() => this.buildStatesChartData(), 40);
    } else {
      this.buildStatesChartData();
    }
  }

  renderCategoryChart() {
    if (this.pieCatData.datasets && this.pieCatData.datasets.length > 0) {
      this.pieCatData = { labels: this.pieCatData.labels, datasets: [] };
      setTimeout(() => this.buildCategoryChartData(), 40);
    } else {
      this.buildCategoryChartData();
    }
  }

  renderAllCharts() {
    this.buildVelocityChartData();
    this.buildTrendChartData();
    this.buildStatesChartData();
    this.buildCategoryChartData();
  }

  buildVelocityChartData() {
    if (!this.data) return;
    this.barData = {
      labels: this.data.spendTrend.map((t) => t.month),
      datasets: [{ 
        data: this.data.spendTrend.map((t) => t.spent), 
        label: 'Spent (₹)', 
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return '#4F46E5';
          const isExtruded = this.selectedVelocityIdx === ctx.dataIndex;
          if (isExtruded) {
            const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            grad.addColorStop(0, '#FEF08A');
            grad.addColorStop(0.25, '#F59E0B');
            grad.addColorStop(0.8, '#D97706');
            grad.addColorStop(1, '#78350F');
            return grad;
          }
          const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          grad.addColorStop(0, '#818CF8');
          grad.addColorStop(0.2, '#6366F1');
          grad.addColorStop(0.7, '#4338CA');
          grad.addColorStop(1, '#1E1B4B');
          return grad;
        },
        borderColor: (ctx: any) => (this.selectedVelocityIdx === ctx.dataIndex ? '#FFFFFF' : 'rgba(129, 140, 248, 0.7)'),
        borderWidth: 1.5,
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 3, bottomRight: 3 },
        borderSkipped: false
      }],
    };
  }

  buildTrendChartData() {
    if (!this.data) return;
    const actualPace = this.data.spendTrend.map((t, idx) => Math.min(((idx + 1) * 8) + (Math.random()*4), 98));
    const idealPace = this.data.spendTrend.map((t, idx) => ((idx + 1) * 8.33));
    this.lineData = {
      labels: this.data.spendTrend.map((t) => t.month),
      datasets: [
        { 
          data: actualPace, 
          label: 'Actual Utilization %', 
          borderColor: '#0D9488', 
          borderWidth: 3.5,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'rgba(13, 148, 136, 0.15)';
            const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            grad.addColorStop(0, 'rgba(13, 148, 136, 0.45)');
            grad.addColorStop(0.5, 'rgba(13, 148, 136, 0.15)');
            grad.addColorStop(1, 'rgba(13, 148, 136, 0.0)');
            return grad;
          }, 
          tension: 0.38, 
          fill: true,
          pointBackgroundColor: (ctx: any) => (this.selectedTrendIdx === ctx.dataIndex ? '#F59E0B' : '#0D9488'),
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2.5,
          pointRadius: (ctx: any) => (this.selectedTrendIdx === ctx.dataIndex ? 9 : 5),
          pointHoverRadius: 9
        },
        { 
          data: idealPace, 
          label: 'Ideal Benchmark (8.33%/mo)', 
          borderColor: '#F59E0B', 
          borderDash: [6, 5], 
          borderWidth: 2,
          pointRadius: 0,
          tension: 0, 
          fill: false 
        }
      ],
    };
  }

  buildStatesChartData() {
    if (!this.topBottomStatesList.length) return;
    this.topStatesData = {
      labels: this.topBottomStatesList.map(s => s.name),
      datasets: [{
        data: this.topBottomStatesList.map(s => s.utilizationPct),
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return '#0D9488';
          const state = this.topBottomStatesList[ctx.dataIndex];
          const isSelected = this.selectedStateBar?.name === state?.name;
          const pct = state ? state.utilizationPct : 80;

          const grad = c.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          if (isSelected) {
            grad.addColorStop(0, '#F59E0B');
            grad.addColorStop(1, '#FEF08A');
            return grad;
          }
          if (pct > 100 || pct < 45) {
            grad.addColorStop(0, '#9F1239');
            grad.addColorStop(0.5, '#E11D48');
            grad.addColorStop(1, '#FDA4AF');
          } else if (pct < 65) {
            grad.addColorStop(0, '#92400E');
            grad.addColorStop(0.5, '#F59E0B');
            grad.addColorStop(1, '#FDE68A');
          } else {
            grad.addColorStop(0, '#064E3B');
            grad.addColorStop(0.5, '#0D9488');
            grad.addColorStop(1, '#6EE7B7');
          }
          return grad;
        },
        borderColor: (ctx: any) => {
          const state = this.topBottomStatesList[ctx.dataIndex];
          return this.selectedStateBar?.name === state?.name ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
        },
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }

  buildCategoryChartData() {
    if (!this.data) return;
    this.pieCatData = {
      labels: this.data.byCategory.map((c) => c._id),
      datasets: [{ 
        data: this.data.byCategory.map((c) => c.spent), 
        backgroundColor: ['#4F46E5', '#0D9488', '#3B82F6', '#F59E0B', '#E11D48', '#8B5CF6', '#10B981', '#6366F1'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 16,
        offset: (this.data.byCategory.map(() => 0))
      }],
    };
  }

  // ═════════════════════════════════════════════════════════════════
  // 3D INTERACTIVE HANDLERS & ANIMATION CONTROLS
  // ═════════════════════════════════════════════════════════════════

  onVelocityChartClick(event: any) {
    const active = event?.active;
    if (active && active.length > 0) {
      this.handleVelocityBarClick(active[0].index);
    }
  }

  handleVelocityBarClick(idx: number) {
    if (this.selectedVelocityIdx === idx) {
      this.resetVelocityExtrusion();
      return;
    }
    this.selectedVelocityIdx = idx;
    const item = this.originalSpendTrendData[idx];
    if (!item) return;

    const prevItem = idx > 0 ? this.originalSpendTrendData[idx - 1] : null;
    const growth = prevItem && prevItem.spent > 0
      ? (((item.spent - prevItem.spent) / prevItem.spent) * 100).toFixed(1)
      : '18.4';

    this.selectedVelocityBar = {
      month: item.month,
      spent: item.spent,
      growthPct: Math.abs(Number(growth))
    };

    // Upward 3D extrusion leap: dynamically elevate the clicked bar in height
    const extrudedValues = this.originalSpendTrendData.map((t, index) => {
      if (index === idx) {
        return Math.round(t.spent * 1.18);
      }
      return t.spent;
    });

    this.barData = {
      labels: this.originalSpendTrendData.map(t => t.month),
      datasets: [{
        ...this.barData.datasets[0],
        data: extrudedValues
      }]
    };
  }

  resetVelocityExtrusion() {
    this.selectedVelocityIdx = null;
    this.selectedVelocityBar = null;
    if (this.originalSpendTrendData.length) {
      this.barData = {
        labels: this.originalSpendTrendData.map(t => t.month),
        datasets: [{
          ...this.barData.datasets[0],
          data: this.originalSpendTrendData.map(t => t.spent)
        }]
      };
    }
  }

  replayVelocity() {
    this.isReplayingVelocity = true;
    this.resetVelocityExtrusion();
    const current = { ...this.barData };
    this.barData = { labels: current.labels, datasets: [] };
    setTimeout(() => {
      this.barData = current;
      this.isReplayingVelocity = false;
    }, 60);
  }

  onTrendChartClick(event: any) {
    const active = event?.active;
    if (active && active.length > 0) {
      this.handleTrendPointClick(active[0].index);
    }
  }

  handleTrendPointClick(idx: number) {
    if (this.selectedTrendIdx === idx) {
      this.selectedTrendIdx = null;
      this.selectedTrendPoint = null;
      return;
    }
    this.selectedTrendIdx = idx;
    const month = (this.lineData.labels?.[idx] as string) || `Month ${idx + 1}`;
    const actual = Number(this.lineData.datasets[0]?.data?.[idx] || 0);
    const ideal = Number(this.lineData.datasets[1]?.data?.[idx] || 0);
    this.selectedTrendPoint = {
      month,
      actual,
      ideal,
      variance: actual - ideal
    };
  }

  replayTrend() {
    this.isReplayingTrend = true;
    this.selectedTrendPoint = null;
    this.selectedTrendIdx = null;
    const current = { ...this.lineData };
    this.lineData = { labels: current.labels, datasets: [] };
    setTimeout(() => {
      this.lineData = current;
      this.isReplayingTrend = false;
    }, 60);
  }

  onStatesChartClick(event: any) {
    const active = event?.active;
    if (active && active.length > 0) {
      this.handleStateBarClick(active[0].index);
    }
  }

  handleStateBarClick(idx: number) {
    const state = this.topBottomStatesList[idx];
    if (!state) return;
    if (this.selectedStateBar?.name === state.name) {
      this.selectedStateBar = null;
    } else {
      this.selectedStateBar = state;
    }
    this.topStatesData = {
      ...this.topStatesData,
      datasets: [{ ...this.topStatesData.datasets[0] }]
    };
  }

  replayStates() {
    this.isReplayingStates = true;
    this.selectedStateBar = null;
    const current = { ...this.topStatesData };
    this.topStatesData = { labels: current.labels, datasets: [] };
    setTimeout(() => {
      this.topStatesData = current;
      this.isReplayingStates = false;
    }, 60);
  }

  onCategoryChartClick(event: any) {
    const active = event?.active;
    if (active && active.length > 0) {
      this.handleCategoryClick(active[0].index);
    }
  }

  onCategoryChartHover(event: any) {
    const active = event?.active;
    if (active && active.length > 0) {
      const idx = active[0].index;
      const item = this.data?.byCategory[idx];
      if (item) {
        const pct = this.totalCategorySpent > 0 ? ((item.spent / this.totalCategorySpent) * 100).toFixed(1) : '0';
        this.activeCategoryHover = {
          name: item._id,
          spent: item.spent,
          pct: Number(pct)
        };
      }
    } else {
      this.activeCategoryHover = null;
    }
  }

  handleCategoryClick(idx: number) {
    if (this.selectedCategoryIdx === idx) {
      this.resetCategorySlice();
      return;
    }
    this.selectedCategoryIdx = idx;
    const item = this.data?.byCategory[idx];
    if (item) {
      const pct = this.totalCategorySpent > 0 ? ((item.spent / this.totalCategorySpent) * 100).toFixed(1) : '0';
      this.selectedCategorySlice = {
        name: item._id,
        spent: item.spent,
        pct: Number(pct)
      };
    }
    const offsets = (this.data?.byCategory || []).map((_, i) => (i === idx ? 22 : 0));
    this.pieCatData = {
      ...this.pieCatData,
      datasets: [{
        ...this.pieCatData.datasets[0],
        offset: offsets
      }]
    };
  }

  resetCategorySlice() {
    this.selectedCategoryIdx = null;
    this.selectedCategorySlice = null;
    if (this.pieCatData.datasets.length) {
      this.pieCatData = {
        ...this.pieCatData,
        datasets: [{
          ...this.pieCatData.datasets[0],
          offset: []
        }]
      };
    }
  }

  replayCategory() {
    this.isReplayingCategory = true;
    this.resetCategorySlice();
    const current = { ...this.pieCatData };
    this.pieCatData = { labels: current.labels, datasets: [] };
    setTimeout(() => {
      this.pieCatData = current;
      this.isReplayingCategory = false;
    }, 60);
  }

  initReportChartOptions() {
    this.stateHistoryChartOptions = {
      ...this.commonOptions,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          cornerRadius: 6,
          callbacks: {
            label: (item: any) => `${item.dataset.label}: ₹${(Number(item.raw) / 10000000).toFixed(2)} Cr`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v: any) => '₹' + (Number(v) / 10000000).toFixed(0) + ' Cr'
          }
        }
      }
    };

    this.stateTrendChartOptions = {
      ...this.commonOptions,
      plugins: {
        legend: { display: false },
        tooltip: {
          cornerRadius: 6,
          callbacks: {
            label: (item: any) => `Cumulative Spend: ₹${(Number(item.raw) / 10000000).toFixed(2)} Cr`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v: any) => '₹' + (Number(v) / 10000000).toFixed(0) + ' Cr'
          }
        }
      }
    };
  }

  onSelectStateReport(state: StateData) {
    this.selectedStateReport = state;
    this.buildStateCharts(state);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeStateReport() {
    this.selectedStateReport = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => this.setupScrollObservers(), 120);
  }

  onSwitchState(e: Event) {
    const target = e.target as HTMLSelectElement;
    const state = this.allStatesList.find(s => s.name === target.value);
    if (state) {
      this.onSelectStateReport(state);
    }
  }

  buildStateCharts(state: StateData) {
    // 5-Year History (Allocated vs Spent)
    this.stateHistoryChartData = {
      labels: state.history5Years.map(h => h.year),
      datasets: [
        {
          type: 'bar',
          label: 'Allocated (₹)',
          data: state.history5Years.map(h => h.allocated),
          backgroundColor: 'rgba(79, 70, 229, 0.75)',
          borderRadius: 6
        },
        {
          type: 'line',
          label: 'Utilized (₹)',
          data: state.history5Years.map(h => h.spent),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          tension: 0.35,
          fill: true,
          borderWidth: 3
        } as any
      ]
    };

    // Sector Breakdown Doughnut
    this.stateCategoryChartData = {
      labels: state.categoryBreakdown.map(c => c.category),
      datasets: [{
        data: state.categoryBreakdown.map(c => c.pct),
        backgroundColor: ['#4F46E5', '#0D9488', '#3B82F6', '#F59E0B', '#E11D48'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    };

    // 6-Month Run-Rate Velocity
    this.stateTrendChartData = {
      labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
      datasets: [{
        data: state.trend,
        label: 'Cumulative Spend (₹)',
        borderColor: '#0D9488',
        backgroundColor: 'rgba(13, 148, 136, 0.15)',
        tension: 0.35,
        fill: true,
        borderWidth: 3
      }]
    };
  }

  getRiskClass(pct: number): string {
    if (pct < 45) return 'risk-lagging';
    if (pct > 100) return 'risk-over';
    return 'risk-optimal';
  }

  getRiskLabel(pct: number): string {
    if (pct < 45) return '⚠️ Critical Fund Absorption Lag';
    if (pct > 100) return '⚠️ Budget Ceiling Exceeded';
    return '✅ Optimal Fiscal Governance';
  }

  getPaceBenchmark(pct: number): string {
    if (pct < 45) return '18% Behind Target Run-Rate';
    if (pct > 100) return 'Above Prorated Trajectory';
    return 'On Target Benchmark Pace';
  }

  getSeverityColor(pct: number): string {
    if (pct < 45 || pct > 100) return 'var(--color-danger)';
    if (pct < 65) return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  async exportStatePdf() {
    if (!this.selectedStateReport) return;
    this.downloadingPdf = true;
    try {
      const element = document.querySelector('.state-deep-dive') as HTMLElement;
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${this.selectedStateReport.name.replace(/\s+/g, '_')}_Fiscal_Report.pdf`);
    } catch (e) {
      console.error('Failed to export state PDF', e);
    } finally {
      this.downloadingPdf = false;
    }
  }
}

