import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { StateDataService, StateData } from '../../core/state-data.service';
import { InrPipe } from '../../shared/inr.pipe';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, InrPipe],
  template: `
    <div class="heatmap-container" [class.drawer-active]="selectedState">
      
      <!-- Holographic Ambient Backlight Aura -->
      <div class="map-ambient-aura"></div>

      <!-- Main Map Viewport Area -->
      <div class="map-experience-area">
        
        <!-- Top Command Header Bar -->
        <div class="map-command-bar">
          <div class="command-title-group">
            <div class="command-eyebrow">
              <span class="live-dot-pulse"></span>
              <span>PFMS 2.0 GIS GEO-TELEMETRY &bull; 36 STATES &amp; UTs</span>
            </div>
            <div class="title-with-badge">
              <h2 class="command-title">India Fiscal Utilization Heatmap</h2>
              <span class="badge-gis-tag">INTERACTIVE 3D GIS</span>
            </div>
            <p class="command-subtitle">
              Sub-national expenditure velocity, capital absorption trajectories, and real-time CAG anomaly sentinel.
            </p>
          </div>

          <!-- Controls Right Toolbar -->
          <div class="command-actions-toolbar">
            <!-- Reset Button -->
            <button *ngIf="selectedState || activeFilter !== 'all'" (click)="resetSelection()" class="btn-ctrl btn-reset">
              <span>✕ Reset Map</span>
            </button>
          </div>
        </div>

        <!-- Telemetry Macro Metrics Ribbon -->
        <div class="telemetry-ribbon">
          <div class="macro-metric-pill">
            <div class="macro-pct-badge" [style.color]="getSeverityColor(macro.avgUtilization)">
              {{ macro.avgUtilization }}%
            </div>
            <div class="macro-text-block">
              <span class="macro-title">National Absorption</span>
              <span class="macro-sub">Weighted Trajectory Pace</span>
            </div>
          </div>

          <div class="macro-metric-pill">
            <span class="macro-icon">🏛️</span>
            <div class="macro-text-block">
              <span class="macro-title">{{ macro.totalSpent | inr }}</span>
              <span class="macro-sub">Total Disbursed (FY 26-27)</span>
            </div>
          </div>

          <div class="macro-metric-pill">
            <span class="macro-icon">⚡</span>
            <div class="macro-text-block">
              <span class="macro-title">{{ macro.optimalCount }} States Optimal</span>
              <span class="macro-sub">{{ macro.moderateCount }} Balanced &bull; {{ macro.laggingCount }} Lagging</span>
            </div>
          </div>

          <div class="macro-metric-pill" [class.has-alerts]="macro.alertsCount > 0">
            <span class="macro-icon">🚨</span>
            <div class="macro-text-block">
              <span class="macro-title">{{ macro.alertsCount }} Active Alerts</span>
              <span class="macro-sub">Automated Audit Watch</span>
            </div>
          </div>
        </div>

        <!-- Filter Segmented Row & Legend -->
        <div class="filter-segment-bar">
          <div class="filter-pills-list">
            <button class="filter-chip" [class.active]="activeFilter === 'all'" (click)="setFilter('all')">
              <span>All States (36)</span>
            </button>
            <button class="filter-chip chip-optimal" [class.active]="activeFilter === 'optimal'" (click)="setFilter('optimal')">
              <span class="dot-dot"></span>
              <span>Optimal Pace ({{ macro.optimalCount }})</span>
            </button>
            <button class="filter-chip chip-moderate" [class.active]="activeFilter === 'moderate'" (click)="setFilter('moderate')">
              <span class="dot-dot"></span>
              <span>Moderate ({{ macro.moderateCount }})</span>
            </button>
            <button class="filter-chip chip-lagging" [class.active]="activeFilter === 'lagging'" (click)="setFilter('lagging')">
              <span class="dot-dot"></span>
              <span>Lagging / Over ({{ macro.laggingCount }})</span>
            </button>
            <button class="filter-chip chip-alerts" [class.active]="activeFilter === 'alerts'" (click)="setFilter('alerts')">
              <span class="dot-dot"></span>
              <span>🚨 Anomalies ({{ macro.alertsCount }})</span>
            </button>
          </div>

          <!-- Segmented Gradient Legend -->
          <div class="map-legend-box">
            <span class="leg-txt">&lt;45%</span>
            <div class="leg-segment s-lagging" title="Lagging (<45%)"></div>
            <div class="leg-segment s-mod" title="Moderate (45-74%)"></div>
            <div class="leg-segment s-opt" title="Optimal Target (75-100%)"></div>
            <div class="leg-segment s-over" title="Over-Trajectory (>100%)"></div>
            <span class="leg-txt">&gt;100%</span>
          </div>
        </div>

        <!-- 2D Planar Map Viewport with 3D Effects -->
        <div class="map-viewport" 
             (mousemove)="onMapMouseMove($event)" 
             (mouseleave)="onMapMouseLeave()">
          
          <!-- Subtle Ground Matrix Plate -->
          <div class="ground-matrix-plane">
            <div class="matrix-grid-pattern"></div>
            <div class="matrix-corner-tag top-left">PFMS 2.0 GIS &bull; 28.61° N, 77.20° E</div>
            <div class="matrix-corner-tag bottom-right">WGS 84 &bull; NATIONAL EXCHEQUER DATUM</div>
          </div>

          <!-- Main SVG Map Plane (Upright 2D with 3D Elevation) -->
          <div class="map-svg-plane">
            <div #mapContainer class="svg-container"></div>
          </div>

          <!-- High-Tech Floating Smart HUD Tooltip -->
          <div class="tooltip-hud" #tooltip></div>
        </div>
      </div>
      
      <!-- Smooth Floating Luxury HUD Side Drawer -->
      <aside class="side-drawer" [class.open]="selectedState">
        <div *ngIf="selectedState" class="drawer-content">
          
          <!-- Drawer Header -->
          <div class="summary-header">
            <div class="summary-title-wrap">
              <span class="state-pin">📍</span>
              <div>
                <h2>{{ selectedState.name }}</h2>
                <div class="summary-badges">
                  <span class="pace-pill" [ngClass]="getPaceClass(selectedState.utilizationPct)">
                    {{ getPaceLabel(selectedState.utilizationPct) }}
                  </span>
                  <span class="rank-pill">FY 2026-27 ACTIVE</span>
                </div>
              </div>
            </div>
            <button (click)="resetSelection()" class="drawer-close-btn" title="Close summary">✕</button>
          </div>

          <!-- Circular Utilization Hero 3D Ring -->
          <div class="utilization-gauge-card">
            <div class="gauge-ring-wrap">
              <svg class="gauge-svg" viewBox="0 0 120 120">
                <circle class="gauge-bg" cx="60" cy="60" r="50"></circle>
                <circle class="gauge-progress" cx="60" cy="60" r="50"
                  [style.stroke]="getSeverityColor(selectedState.utilizationPct)"
                  [style.strokeDashoffset]="getRingOffset(selectedState.utilizationPct)">
                </circle>
              </svg>
              <div class="gauge-value-wrap">
                <span class="gauge-pct" [style.color]="getSeverityColor(selectedState.utilizationPct)">
                  {{ selectedState.utilizationPct }}%
                </span>
                <span class="gauge-label">ABSORBED</span>
              </div>
            </div>
            <div class="gauge-stats">
              <div class="gauge-stat-item">
                <span class="sub-label">Allocated Budget</span>
                <strong>{{ selectedState.allocated | inr }}</strong>
              </div>
              <div class="gauge-stat-item">
                <span class="sub-label">Disbursed Spend</span>
                <strong>{{ selectedState.spent | inr }}</strong>
              </div>
              <div class="gauge-stat-item">
                <span class="sub-label">Available Balance</span>
                <strong [style.color]="selectedState.allocated < selectedState.spent ? 'var(--color-danger)' : '#10B981'">
                  {{ (selectedState.allocated - selectedState.spent) | inr }}
                </strong>
              </div>
            </div>
          </div>

          <!-- 5-Year YoY Historical Trend Mini Bars -->
          <div class="drawer-history-block" *ngIf="selectedState.history5Years?.length">
            <div class="block-head-row">
              <h3 class="block-title">5-Year Historical Absorption</h3>
              <span class="block-sub-badge">YoY PACING</span>
            </div>
            <div class="history-bars-row">
              <div *ngFor="let item of selectedState.history5Years" class="history-bar-col">
                <div class="bar-pair-track">
                  <div class="bar-fill-alloc" [style.height.%]="85" title="Allocated"></div>
                  <div class="bar-fill-spent" [style.height.%]="getHistoryPct(item.spent, item.allocated)" [style.background]="getSeverityColor(getHistoryPct(item.spent, item.allocated))" title="Spent"></div>
                </div>
                <span class="history-year-lbl">{{ item.year }}</span>
              </div>
            </div>
          </div>
          
          <!-- Active Anomalies -->
          <div *ngIf="selectedState.alerts.length > 0">
            <div class="block-head-row">
              <h3 class="block-title">Active Anomalies ({{ selectedState.alerts.length }})</h3>
              <span class="alert-count-pill">CAG FLAGGED</span>
            </div>
            <div class="drawer-alerts-stack">
              <div *ngFor="let alert of selectedState.alerts" class="drawer-alert" [class.warning]="alert.severity === 'Medium'">
                <div class="drawer-alert-header">
                  <span class="badge" [ngClass]="alert.severity === 'High' ? 'bg-danger' : 'bg-warning'">{{ alert.severity }}</span>
                  <span class="alert-type-name">{{ alert.type }}</span>
                </div>
                <p class="alert-msg">{{ alert.message }}</p>
              </div>
            </div>
          </div>
          
          <!-- Sector Breakdown -->
          <div>
            <div class="block-head-row">
              <h3 class="block-title">Key Sector Absorption</h3>
              <span class="block-sub-badge">DISTRIBUTION</span>
            </div>
            <div *ngFor="let cat of selectedState.categoryBreakdown" class="cat-bar-item">
              <div class="cat-label-row">
                <span>{{ cat.category }}</span>
                <strong>{{ cat.pct }}%</strong>
              </div>
              <div class="cat-bar-track">
                <div class="cat-bar-fill" [style.width.%]="cat.pct"></div>
              </div>
            </div>
          </div>
          
          <!-- Top Schemes -->
          <div>
            <div class="block-head-row">
              <h3 class="block-title">Flagship Centrally Sponsored Schemes</h3>
            </div>
            <div class="scheme-pills">
              <span *ngFor="let scheme of selectedState.topSchemes" class="scheme-pill">{{ scheme }}</span>
            </div>
          </div>
          
          <!-- Primary CTA Button -->
          <button class="view-report-cta" (click)="onViewReport()">
            <span>Open Detailed Fiscal Analytics</span>
            <span class="cta-arrow">➔</span>
          </button>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .heatmap-container {
      display: flex;
      position: relative;
      background: linear-gradient(135deg, rgba(8, 62, 72, 0.96) 0%, rgba(4, 30, 36, 0.98) 100%);
      border: 1px solid rgba(45, 212, 191, 0.25);
      border-radius: var(--radius-xl);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35), 0 0 30px rgba(13, 148, 136, 0.15);
      overflow: hidden;
      min-height: 580px;
    }

    .map-ambient-aura {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 500px;
      height: 500px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(45, 212, 191, 0.14) 0%, rgba(13, 148, 136, 0.05) 50%, transparent 75%);
      filter: blur(50px);
      border-radius: 50%;
      pointer-events: none;
    }

    .map-experience-area {
      flex: 1;
      padding: 24px 28px;
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Command Bar */
    .map-command-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 2px;
    }

    .command-title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .command-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #2DD4BF;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .live-dot-pulse {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2DD4BF;
      box-shadow: 0 0 8px #2DD4BF;
      animation: pulseLive 1.8s infinite;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .command-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .badge-gis-tag {
      font-size: 0.64rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 3px 9px;
      border-radius: 9999px;
      background: rgba(13, 148, 136, 0.35);
      border: 1px solid rgba(45, 212, 191, 0.45);
      color: #6EE7B7;
      box-shadow: 0 0 10px rgba(45, 212, 191, 0.2);
    }

    .command-subtitle {
      font-size: 0.84rem;
      color: #CCFBF1;
      opacity: 0.85;
      margin: 6px 0 0;
      line-height: 1.4;
    }

    /* Actions Toolbar */
    .command-actions-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-ctrl {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(45, 212, 191, 0.3);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(8px);
    }

    .btn-ctrl:hover {
      background: rgba(45, 212, 191, 0.2);
      border-color: #2DD4BF;
      transform: translateY(-1px);
    }

    .btn-reset {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #FECDD3;
    }
    .btn-reset:hover {
      background: rgba(239, 68, 68, 0.3);
      border-color: #F43F5E;
    }

    /* Telemetry Ribbon */
    .telemetry-ribbon {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      background: rgba(3, 23, 27, 0.65);
      padding: 12px 18px;
      border-radius: 14px;
      border: 1px solid rgba(45, 212, 191, 0.22);
    }

    .macro-metric-pill {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .macro-pct-badge {
      font-size: 1.2rem;
      font-weight: 800;
      line-height: 1;
      background: rgba(13, 148, 136, 0.2);
      border: 1px solid rgba(45, 212, 191, 0.35);
      padding: 6px 12px;
      border-radius: 8px;
      letter-spacing: -0.01em;
      flex-shrink: 0;
    }

    .macro-icon {
      font-size: 1.3rem;
      line-height: 1;
    }

    .macro-text-block {
      display: flex;
      flex-direction: column;
    }

    .macro-title {
      font-size: 0.9rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
    }

    .macro-sub {
      font-size: 0.7rem;
      color: #94A3B8;
      line-height: 1.25;
      margin-top: 2px;
    }

    .macro-metric-pill.has-alerts .macro-title {
      color: #F87171;
    }

    /* Filter Segment Bar */
    .filter-segment-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }

    .filter-pills-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 13px;
      font-size: 0.74rem;
      font-weight: 700;
      color: #CCFBF1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(45, 212, 191, 0.2);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-chip:hover {
      background: rgba(45, 212, 191, 0.15);
      color: #FFFFFF;
    }

    .filter-chip.active {
      background: #0D9488;
      border-color: #2DD4BF;
      color: #FFFFFF;
      box-shadow: 0 0 10px rgba(45, 212, 191, 0.4);
    }

    .dot-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }

    .chip-optimal .dot-dot { background: #10B981; }
    .chip-moderate .dot-dot { background: #06B6D4; }
    .chip-lagging .dot-dot { background: #F59E0B; }
    .chip-alerts .dot-dot { background: #EF4444; }

    /* Map Legend Box */
    .map-legend-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(3, 23, 27, 0.6);
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(45, 212, 191, 0.2);
    }
    .leg-txt {
      font-size: 0.7rem;
      color: #94A3B8;
      font-weight: 700;
    }
    .leg-segment {
      width: 22px;
      height: 8px;
      border-radius: 2px;
    }
    .s-lagging { background: #F59E0B; }
    .s-mod { background: #06B6D4; }
    .s-opt { background: #10B981; }
    .s-over { background: #E11D48; }

    /* Map Viewport Area */
    .map-viewport {
      position: relative;
      width: 100%;
      height: 520px;
      border-radius: 16px;
      overflow: hidden;
      background: rgba(3, 23, 27, 0.4);
      border: 1px solid rgba(45, 212, 191, 0.18);
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Subtle Ground Matrix */
    .ground-matrix-plane {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.55;
    }

    .matrix-grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(45, 212, 191, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(45, 212, 191, 0.1) 1px, transparent 1px);
      background-size: 32px 32px;
    }

    .matrix-corner-tag {
      position: absolute;
      font-family: monospace;
      font-size: 0.64rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: rgba(45, 212, 191, 0.55);
      padding: 8px 14px;
    }
    .matrix-corner-tag.top-left { top: 4px; left: 6px; }
    .matrix-corner-tag.bottom-right { bottom: 4px; right: 6px; }

    /* Map SVG Plane */
    .map-svg-plane {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 850px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    }

    .svg-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* State Paths Styling (D3) */
    ::ng-deep .state-path-3d {
      stroke: rgba(255, 255, 255, 0.65);
      stroke-width: 0.9px;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      transform-origin: center center;
    }

    ::ng-deep .state-path-3d:hover,
    ::ng-deep .state-path-3d.hovered-3d {
      stroke: #FFFFFF !important;
      stroke-width: 2.2px !important;
      opacity: 1 !important;
      filter: drop-shadow(0 14px 20px rgba(13, 148, 136, 0.7)) brightness(1.22) !important;
      transform: translateY(-6px) scale(1.02);
    }

    ::ng-deep .state-path-3d.selected-3d {
      fill: url(#grad-selected) !important;
      stroke: #A7F3D0 !important;
      stroke-width: 2.8px !important;
      opacity: 1 !important;
      filter: drop-shadow(0 16px 26px rgba(79, 70, 229, 0.7)) brightness(1.25) !important;
      transform: translateY(-8px) scale(1.025);
    }

    ::ng-deep .state-path-3d.dimmed {
      opacity: 0.22 !important;
      filter: grayscale(40%) !important;
    }

    ::ng-deep .state-path-3d.filter-highlight {
      opacity: 1 !important;
      stroke: #FFFFFF !important;
      stroke-width: 1.8px !important;
      filter: drop-shadow(0 8px 16px rgba(45, 212, 191, 0.5)) !important;
    }

    /* Beacon Pin Elements (No CSS transform on parent to preserve translate(cx, cy)) */
    ::ng-deep .pin-ripple {
      fill: none;
      stroke: #2DD4BF;
      stroke-width: 1.5;
      animation: pinSonar 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
    }
    ::ng-deep .pin-ripple.r2 {
      animation-delay: 1.1s;
    }

    @keyframes pinSonar {
      0%   { r: 3px; opacity: 1; }
      100% { r: 24px; opacity: 0; }
    }

    /* Smart HUD Tooltip (Flipping to avoid cropping) */
    .tooltip-hud {
      position: absolute;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 99;
    }

    ::ng-deep .tooltip-card {
      background: rgba(7, 59, 76, 0.95);
      border: 1px solid rgba(45, 212, 191, 0.55);
      border-radius: 12px;
      padding: 12px 14px;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55), 0 0 20px rgba(45, 212, 191, 0.2);
      backdrop-filter: blur(16px);
      width: 220px;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    ::ng-deep .tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    ::ng-deep .tooltip-pin { font-size: 1.1rem; }
    ::ng-deep .tooltip-title-wrap {
      display: flex;
      flex-direction: column;
    }
    ::ng-deep .tooltip-state-name {
      font-size: 0.92rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
    }
    ::ng-deep .tooltip-pace-pill {
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    ::ng-deep .tooltip-meter-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    ::ng-deep .tooltip-pct {
      font-size: 1.1rem;
      font-weight: 800;
      color: #2DD4BF;
    }
    ::ng-deep .tooltip-track {
      flex: 1;
      height: 5px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 3px;
      overflow: hidden;
    }
    ::ng-deep .tooltip-fill {
      height: 100%;
      border-radius: 3px;
    }
    ::ng-deep .tooltip-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      font-size: 0.68rem;
      background: rgba(3, 23, 27, 0.65);
      padding: 6px 8px;
      border-radius: 6px;
    }
    ::ng-deep .tooltip-stats-grid small { color: #94A3B8; display: block; font-weight: 600; }
    ::ng-deep .tooltip-stats-grid strong { color: #FFFFFF; font-weight: 700; }
    ::ng-deep .tooltip-alert {
      font-size: 0.64rem;
      color: #FCA5A5;
      background: rgba(239, 68, 68, 0.2);
      padding: 3px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
    ::ng-deep .tooltip-clean {
      font-size: 0.62rem;
      color: #A7F3D0;
    }
    ::ng-deep .tooltip-hint {
      font-size: 0.6rem;
      color: #2DD4BF;
      font-weight: 600;
      margin-top: 2px;
    }

    /* Floating Luxury Side Drawer */
    .side-drawer {
      position: absolute;
      top: 14px;
      right: 14px;
      bottom: 14px;
      width: 410px;
      max-width: calc(100% - 28px);
      background: rgba(7, 59, 76, 0.95);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(45, 212, 191, 0.4);
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(45, 212, 191, 0.2);
      transform: translateX(calc(100% + 24px));
      transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
      opacity: 0;
      z-index: 30;
      overflow-y: auto;
      pointer-events: none;
      color: #FFFFFF;
    }
    .side-drawer.open {
      transform: translateX(0);
      opacity: 1;
      pointer-events: auto;
    }
    .drawer-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(45, 212, 191, 0.2);
      padding-bottom: 14px;
    }
    .summary-title-wrap {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .state-pin {
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .summary-title-wrap h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 4px;
      letter-spacing: -0.02em;
    }
    .summary-badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .pace-pill {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .pace-optimal { background: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .pace-lagging { background: rgba(239, 68, 68, 0.2); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .pace-over    { background: rgba(245, 158, 11, 0.2); color: #FDE047; border: 1px solid rgba(245, 158, 11, 0.4); }
    .rank-pill    { font-size: 0.64rem; color: #94A3B8; font-weight: 700; }

    .drawer-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(45, 212, 191, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
      color: #CCFBF1;
      transition: all 0.2s ease;
    }
    .drawer-close-btn:hover {
      background: rgba(239, 68, 68, 0.25);
      color: #FFFFFF;
      border-color: #EF4444;
      transform: scale(1.1);
    }

    /* Gauge Hero */
    .utilization-gauge-card {
      background: rgba(3, 23, 27, 0.75);
      border: 1px solid rgba(45, 212, 191, 0.25);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 18px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    .gauge-ring-wrap {
      position: relative;
      width: 110px;
      height: 110px;
      flex-shrink: 0;
    }
    .gauge-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .gauge-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 7;
    }
    .gauge-progress {
      fill: none;
      stroke-width: 7;
      stroke-linecap: round;
      stroke-dasharray: 314.16;
      transition: stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .gauge-value-wrap {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6px;
    }
    .gauge-pct {
      font-size: 1.35rem;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .gauge-label {
      font-size: 0.62rem;
      color: #94A3B8;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }

    .gauge-stats {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .gauge-stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.76rem;
    }
    .gauge-stat-item .sub-label { color: #94A3B8; font-weight: 600; }
    .gauge-stat-item strong { color: #FFFFFF; font-weight: 700; }

    /* Block Head Rows */
    .block-head-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .block-title {
      font-size: 0.82rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #CCFBF1;
      margin: 0;
    }
    .block-sub-badge {
      font-size: 0.62rem;
      font-weight: 700;
      color: #2DD4BF;
      letter-spacing: 0.05em;
    }
    .alert-count-pill {
      font-size: 0.6rem;
      font-weight: 800;
      color: #F87171;
      background: rgba(239, 68, 68, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* 5-Year History Mini Bars */
    .drawer-history-block {
      background: rgba(3, 23, 27, 0.6);
      border: 1px solid rgba(45, 212, 191, 0.2);
      border-radius: 12px;
      padding: 12px 16px;
    }
    .history-bars-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      height: 70px;
      align-items: flex-end;
      margin-top: 8px;
    }
    .history-bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
    }
    .bar-pair-track {
      width: 14px;
      height: 48px;
      position: relative;
      display: flex;
      align-items: flex-end;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 3px 3px 0 0;
      overflow: hidden;
    }
    .bar-fill-alloc {
      position: absolute;
      inset: auto 0 0 0;
      background: rgba(45, 212, 191, 0.3);
      border-radius: 2px 2px 0 0;
    }
    .bar-fill-spent {
      position: absolute;
      inset: auto 0 0 0;
      background: #10B981;
      border-radius: 2px 2px 0 0;
      transition: height 0.6s ease;
    }
    .history-year-lbl {
      font-size: 0.64rem;
      color: #94A3B8;
      font-weight: 700;
      margin-top: 4px;
    }

    /* Alert cards in drawer */
    .drawer-alerts-stack {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .drawer-alert {
      padding: 10px 12px;
      border-radius: 8px;
      background: rgba(239, 68, 68, 0.15);
      border-left: 3px solid #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .drawer-alert.warning {
      background: rgba(245, 158, 11, 0.15);
      border-left: 3px solid #F59E0B;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .drawer-alert-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 3px;
    }
    .alert-type-name {
      font-size: 0.74rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .alert-msg {
      font-size: 0.74rem;
      margin: 0;
      color: #E2E8F0;
      line-height: 1.35;
    }
    .badge {
      font-size: 0.6rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .bg-danger { background: #E11D48; color: #FFFFFF; }
    .bg-warning { background: #D97706; color: #FFFFFF; }

    /* Category bar */
    .cat-bar-item { margin-bottom: 8px; }
    .cat-label-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.76rem;
      margin-bottom: 3px;
      color: #E2E8F0;
    }
    .cat-label-row strong { color: #2DD4BF; }
    .cat-bar-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      overflow: hidden;
    }
    .cat-bar-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #0D9488, #2DD4BF);
      transition: width 0.6s ease;
    }

    .scheme-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .scheme-pill {
      font-size: 0.68rem;
      padding: 3px 8px;
      background: rgba(45, 212, 191, 0.12);
      color: #CCFBF1;
      border-radius: 4px;
      font-weight: 600;
      border: 1px solid rgba(45, 212, 191, 0.25);
    }

    /* CTA View full report button */
    .view-report-cta {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 700;
      background: linear-gradient(135deg, #0D9488, #0F766E);
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.4);
      color: #FFFFFF;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .view-report-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(13, 148, 136, 0.55);
      background: linear-gradient(135deg, #0F766E, #115E59);
    }
    .view-report-cta:hover .cta-arrow {
      transform: translateX(4px);
    }
    .cta-arrow {
      transition: transform 0.2s ease;
    }

    /* Keyframes */
    @keyframes pulseLive {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .telemetry-ribbon { grid-template-columns: repeat(2, 1fr); }
      .map-viewport { height: 460px; }
      .side-drawer { width: 360px; }
    }

    @media (max-width: 768px) {
      .map-command-bar { flex-direction: column; align-items: stretch; }
      .command-actions-toolbar { justify-content: flex-start; }
      .telemetry-ribbon { grid-template-columns: 1fr; }
      .map-viewport { height: 400px; }
      .side-drawer {
        position: fixed;
        inset: auto 0 0 0;
        width: 100%;
        max-width: 100%;
        height: 75vh;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        transform: translateY(100%);
      }
      .side-drawer.open {
        transform: translateY(0);
      }
    }
  `]
})
export class HeatmapComponent implements OnInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltipElement!: ElementRef;
  
  selectedState: StateData | null = null;
  geoData: any;
  allStates: StateData[] = [];
  beaconGroup: any = null;

  @Output() openStateReport = new EventEmitter<StateData>();

  activeFilter: 'all' | 'optimal' | 'moderate' | 'lagging' | 'alerts' = 'all';

  macro = {
    totalAllocated: 0,
    totalSpent: 0,
    avgUtilization: 0,
    optimalCount: 0,
    moderateCount: 0,
    laggingCount: 0,
    alertsCount: 0
  };

  private readonly stateAliases: Record<string, string> = {
    'orissa': 'odisha',
    'uttaranchal': 'uttarakhand',
    'andamanandnicobar': 'andamanandnicobarislands',
    'dadraandnagarhaveli': 'dadraandnagarhavelianddamananddiu',
    'damananddiu': 'dadraandnagarhavelianddamananddiu'
  };

  constructor(private stateDataService: StateDataService) {}

  ngOnInit() {
    this.allStates = this.stateDataService.getAllStates();
    this.calculateMacro();
    this.initMap();
  }

  calculateMacro() {
    this.macro.totalAllocated = this.allStates.reduce((acc, s) => acc + s.allocated, 0);
    this.macro.totalSpent = this.allStates.reduce((acc, s) => acc + s.spent, 0);
    this.macro.avgUtilization = this.macro.totalAllocated > 0 
      ? Number(((this.macro.totalSpent / this.macro.totalAllocated) * 100).toFixed(1)) 
      : 78.4;
    this.macro.optimalCount = this.allStates.filter(s => s.utilizationPct >= 75 && s.utilizationPct <= 100).length;
    this.macro.moderateCount = this.allStates.filter(s => s.utilizationPct >= 50 && s.utilizationPct < 75).length;
    this.macro.laggingCount = this.allStates.filter(s => s.utilizationPct < 50 || s.utilizationPct > 100).length;
    this.macro.alertsCount = this.allStates.filter(s => s.alerts && s.alerts.length > 0).length;
  }

  onMapMouseMove(event: MouseEvent) {
    // Subtle 2D interactive responsiveness
  }

  onMapMouseLeave() {
    // Revert state
  }

  setFilter(filter: 'all' | 'optimal' | 'moderate' | 'lagging' | 'alerts') {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (!this.geoData) return;
    const element = this.mapContainer.nativeElement;
    const states = d3.select(element).selectAll('.state-path-3d');

    if (this.activeFilter === 'all') {
      states.classed('dimmed', false).classed('filter-highlight', false);
      return;
    }

    states.each((d: any, i, nodes) => {
      const stateName = d.properties.NAME_1 || d.properties.st_nm;
      const data = this.matchState(stateName);
      const el = d3.select(nodes[i] as Element);
      let match = false;
      if (data) {
        if (this.activeFilter === 'optimal' && data.utilizationPct >= 75 && data.utilizationPct <= 100) match = true;
        if (this.activeFilter === 'moderate' && data.utilizationPct >= 50 && data.utilizationPct < 75) match = true;
        if (this.activeFilter === 'lagging' && (data.utilizationPct < 50 || data.utilizationPct > 100)) match = true;
        if (this.activeFilter === 'alerts' && data.alerts && data.alerts.length > 0) match = true;
      }
      el.classed('dimmed', !match);
      el.classed('filter-highlight', match);
    });
  }

  async initMap() {
    try {
      const response = await fetch('/assets/india-states.geojson');
      this.geoData = await response.json();
      this.drawMap();
    } catch (e) {
      console.error('Failed to load map data', e);
      this.mapContainer.nativeElement.innerHTML = '<p class="text-muted" style="color: #94A3B8; text-align: center; padding-top: 40px;">Map data unavailable. Ensure india-states.geojson is in assets.</p>';
    }
  }

  drawMap() {
    if (!this.geoData) return;
    const element = this.mapContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const width = 850;
    const height = 580;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('overflow', 'visible');

    // Defs with gradients & filters
    const defs = svg.append('defs');

    // Gradient: Optimal (Emerald/Teal)
    const gOpt = defs.append('linearGradient').attr('id', 'grad-optimal').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gOpt.append('stop').attr('offset', '0%').attr('stop-color', '#10B981');
    gOpt.append('stop').attr('offset', '70%').attr('stop-color', '#0D9488');
    gOpt.append('stop').attr('offset', '100%').attr('stop-color', '#042F2E');

    // Gradient: Moderate (Cyan / Ocean)
    const gMod = defs.append('linearGradient').attr('id', 'grad-moderate').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gMod.append('stop').attr('offset', '0%').attr('stop-color', '#06B6D4');
    gMod.append('stop').attr('offset', '65%').attr('stop-color', '#0284C7');
    gMod.append('stop').attr('offset', '100%').attr('stop-color', '#0F172A');

    // Gradient: Lagging (Golden Amber / Rose)
    const gLag = defs.append('linearGradient').attr('id', 'grad-lagging').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gLag.append('stop').attr('offset', '0%').attr('stop-color', '#F59E0B');
    gLag.append('stop').attr('offset', '65%').attr('stop-color', '#D97706');
    gLag.append('stop').attr('offset', '100%').attr('stop-color', '#451A03');

    // Gradient: Critical / Overspend (Crimson / Violet)
    const gCrit = defs.append('linearGradient').attr('id', 'grad-critical').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gCrit.append('stop').attr('offset', '0%').attr('stop-color', '#FB7185');
    gCrit.append('stop').attr('offset', '65%').attr('stop-color', '#E11D48');
    gCrit.append('stop').attr('offset', '100%').attr('stop-color', '#4C0519');

    // Gradient: Selected (Glowing Indigo/Violet)
    const gSel = defs.append('linearGradient').attr('id', 'grad-selected').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    gSel.append('stop').attr('offset', '0%').attr('stop-color', '#818CF8');
    gSel.append('stop').attr('offset', '70%').attr('stop-color', '#4F46E5');
    gSel.append('stop').attr('offset', '100%').attr('stop-color', '#1E1B4B');

    // Drop shadow filter for 3D state elevation
    const fShadow = defs.append('filter').attr('id', 'stateShadow3D').attr('x', '-15%').attr('y', '-15%').attr('width', '135%').attr('height', '135%');
    fShadow.append('feDropShadow').attr('dx', '0').attr('dy', '4').attr('stdDeviation', '4').attr('flood-color', '#073B4C').attr('flood-opacity', '0.45');

    // Setup projection for India
    const projection = d3.geoMercator().fitSize([width, height], this.geoData);
    const path = d3.geoPath().projection(projection);

    // Layer 1: Ground Drop-Shadow of India landmass (realistic 3D elevation)
    const shadowGroup = svg.append('g').attr('class', 'india-shadow-layer').attr('transform', 'translate(8, 14)');
    shadowGroup.selectAll('path')
      .data(this.geoData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', 'rgba(2, 18, 22, 0.4)')
      .attr('filter', 'blur(6px)');

    // Layer 2: Main State Polygons
    const statesGroup = svg.append('g').attr('class', 'states-layer');
    const tooltip = d3.select(this.tooltipElement.nativeElement);

    statesGroup.selectAll('path')
      .data(this.geoData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('class', 'state-path-3d')
      .attr('filter', 'url(#stateShadow3D)')
      .attr('fill', (d: any) => {
        const stateName = d.properties.NAME_1 || d.properties.st_nm;
        const data = this.matchState(stateName);
        return this.getStateGradient(data?.utilizationPct);
      })
      .on('mouseenter', (event, d: any) => {
        const stateName = d.properties.NAME_1 || d.properties.st_nm;
        const data = this.matchState(stateName);
        this.renderTooltip(event, stateName, data);
        if (!this.selectedState) {
          statesGroup.selectAll('.state-path-3d').classed('dimmed', true);
          d3.select(event.currentTarget as Element).classed('dimmed', false).classed('hovered-3d', true);
        }
      })
      .on('mousemove', (event) => {
        this.moveTooltip(event);
      })
      .on('mouseleave', (event) => {
        tooltip.style('opacity', 0);
        d3.select(event.currentTarget as Element).classed('hovered-3d', false);
        if (!this.selectedState) {
          this.applyFilter();
        }
      })
      .on('click', (event, d: any) => {
        const stateName = d.properties.NAME_1 || d.properties.st_nm;
        const data = this.matchState(stateName);
        if (data) {
          this.selectState(data, d, path);
        }
      });

    // Layer 3: Dynamic 3D Holographic Beacon Layer (Renders over selected state)
    this.beaconGroup = svg.append('g').attr('class', 'beacon-layer').style('pointer-events', 'none');
  }

  selectState(state: StateData, feature: any, path: any) {
    this.selectedState = state;
    const element = this.mapContainer.nativeElement;
    const statesGroup = d3.select(element).select('.states-layer');

    statesGroup.selectAll('.state-path-3d')
      .classed('selected-3d', false)
      .classed('dimmed', true);

    statesGroup.selectAll('.state-path-3d')
      .filter((d: any) => {
        const name = d.properties.NAME_1 || d.properties.st_nm;
        return this.matchState(name)?.name === state.name;
      })
      .classed('selected-3d', true)
      .classed('dimmed', false);

    this.renderBeacon(feature, path, state);
  }

  renderBeacon(feature: any, path: any, state: StateData) {
    if (!this.beaconGroup) return;
    this.beaconGroup.selectAll('*').remove();

    const centroid = path.centroid(feature);
    if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return;
    const [cx, cy] = centroid;

    // Root placed strictly at [cx, cy] (no CSS transform on this root group)
    const root = this.beaconGroup.append('g')
      .attr('class', 'beacon-pin-root')
      .attr('transform', `translate(${cx}, ${cy})`);

    // Ground target pulse circles at the exact centroid
    root.append('circle').attr('r', 16).attr('class', 'pin-ripple r2');
    root.append('circle').attr('r', 9).attr('class', 'pin-ripple r1');
    root.append('circle').attr('r', 4.5).attr('fill', '#FFFFFF').attr('stroke', '#2DD4BF').attr('stroke-width', 2);

    // Vertical pin needle rising 32px
    root.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', -30)
      .attr('stroke', '#2DD4BF')
      .attr('stroke-width', 2.2)
      .attr('stroke-linecap', 'round')
      .attr('filter', 'drop-shadow(0 0 4px #2DD4BF)');

    // 3D Pin Head Badge floating at (0, -42)
    const tag = root.append('g')
      .attr('class', 'pin-head-tag')
      .attr('transform', 'translate(0, -42)');

    const stateLabel = `${state.name} • ${state.utilizationPct}%`;
    const labelWidth = Math.max(stateLabel.length * 7.5 + 24, 110);
    const halfWidth = labelWidth / 2;

    tag.append('rect')
      .attr('x', -halfWidth)
      .attr('y', -12)
      .attr('width', labelWidth)
      .attr('height', 24)
      .attr('rx', 12)
      .attr('fill', '#042F2E')
      .attr('stroke', '#2DD4BF')
      .attr('stroke-width', 1.8)
      .attr('filter', 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))');

    tag.append('text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '10.5')
      .attr('font-weight', '800')
      .attr('letter-spacing', '0.02em')
      .text(stateLabel);
  }

  resetSelection() {
    this.selectedState = null;
    this.activeFilter = 'all';
    if (this.beaconGroup) {
      this.beaconGroup.selectAll('*').remove();
    }
    const element = this.mapContainer.nativeElement;
    d3.select(element).selectAll('.state-path-3d')
      .classed('selected-3d', false)
      .classed('dimmed', false)
      .classed('filter-highlight', false);
  }

  renderTooltip(event: MouseEvent, stateName: string, data: StateData | undefined) {
    const tooltip = d3.select(this.tooltipElement.nativeElement);
    if (!data) {
      tooltip.html(`
        <div class="tooltip-card">
          <div class="tooltip-state-name">${stateName}</div>
          <div class="tooltip-hint">Union Territory / External Jurisdiction</div>
        </div>
      `).style('opacity', 1);
      this.moveTooltip(event);
      return;
    }

    const paceClass = this.getPaceClass(data.utilizationPct);
    const paceLabel = this.getPaceLabel(data.utilizationPct);
    const alertHtml = data.alerts.length > 0 
      ? `<div class="tooltip-alert">🚨 ${data.alerts.length} CAG Audit Alert${data.alerts.length > 1 ? 's' : ''}</div>`
      : `<div class="tooltip-clean">✓ Zero Critical Anomalies</div>`;

    tooltip.html(`
      <div class="tooltip-card">
        <div class="tooltip-header">
          <span class="tooltip-pin">📍</span>
          <div class="tooltip-title-wrap">
            <div class="tooltip-state-name">${stateName}</div>
            <span class="tooltip-pace-pill ${paceClass}">${paceLabel}</span>
          </div>
        </div>
        <div class="tooltip-meter-row">
          <div class="tooltip-pct">${data.utilizationPct}%</div>
          <div class="tooltip-track">
            <div class="tooltip-fill" style="width: ${Math.min(data.utilizationPct, 100)}%; background: ${this.getSeverityColor(data.utilizationPct)}"></div>
          </div>
        </div>
        <div class="tooltip-stats-grid">
          <div><small>Allocated</small><strong>₹${(data.allocated / 10000000).toFixed(0)} Cr</strong></div>
          <div><small>Disbursed</small><strong>₹${(data.spent / 10000000).toFixed(0)} Cr</strong></div>
        </div>
        ${alertHtml}
        <div class="tooltip-hint">Click state to open telemetry drawer ➔</div>
      </div>
    `).style('opacity', 1);

    this.moveTooltip(event);
  }

  moveTooltip(event: MouseEvent) {
    const tooltip = d3.select(this.tooltipElement.nativeElement);
    const viewport = this.mapContainer.nativeElement.closest('.map-viewport');
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();

    const tipEl = this.tooltipElement.nativeElement;
    const tipWidth = tipEl.offsetWidth || 220;
    const tipHeight = tipEl.offsetHeight || 150;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let left = mouseX + 16;
    let top = mouseY + 16;

    // Flip horizontally if near right boundary
    if (left + tipWidth > rect.width - 16) {
      left = mouseX - tipWidth - 16;
    }

    // Flip vertically if near bottom boundary (prevents cropping on lower states like Andaman, Tamil Nadu, Kerala)
    if (top + tipHeight > rect.height - 16) {
      top = mouseY - tipHeight - 16;
    }

    // Clamp strictly within viewport
    left = Math.max(12, Math.min(left, rect.width - tipWidth - 12));
    top = Math.max(12, Math.min(top, rect.height - tipHeight - 12));

    tooltip.style('left', `${left}px`).style('top', `${top}px`);
  }

  matchState(name: string): StateData | undefined {
    if (!name) return undefined;
    let clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (this.stateAliases[clean]) clean = this.stateAliases[clean];
    return this.allStates.find(s => {
      const sClean = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return sClean === clean || sClean.includes(clean) || clean.includes(sClean);
    });
  }

  getStateGradient(pct?: number): string {
    if (pct === undefined || pct === null) return 'url(#grad-moderate)';
    if (pct > 100) return 'url(#grad-critical)';
    if (pct >= 75) return 'url(#grad-optimal)';
    if (pct >= 50) return 'url(#grad-moderate)';
    return 'url(#grad-lagging)';
  }

  onViewReport() {
    if (this.selectedState) {
      this.openStateReport.emit(this.selectedState);
    }
  }

  getPaceLabel(pct: number): string {
    if (pct < 45) return 'Lagging Spend';
    if (pct > 100) return 'Over-Trajectory';
    return 'Optimal Pace';
  }

  getPaceClass(pct: number): string {
    if (pct < 45) return 'pace-lagging';
    if (pct > 100) return 'pace-over';
    return 'pace-optimal';
  }

  getRingOffset(pct: number): number {
    const r = 50;
    const c = 2 * Math.PI * r; // 314.159
    const capped = Math.min(Math.max(pct, 0), 100);
    return c - (capped / 100) * c;
  }

  getHistoryPct(spent: number, allocated: number): number {
    if (!allocated) return 0;
    return Math.min(Math.round((spent / allocated) * 100), 100);
  }

  getSeverityColor(pct: number): string {
    if (pct < 40 || pct > 100) return '#E11D48';
    if (pct < 60) return '#F59E0B';
    return '#10B981';
  }
}
