import { Component, OnInit, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { StateDataService, StateData } from '../../core/state-data.service';
import { InrPipe } from '../../shared/inr.pipe';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, InrPipe],
  template: `
    <div class="heatmap-container">
      <div class="map-wrapper">
        <div class="map-top-bar">
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-heading); margin: 0 0 4px;">India Utilization Heatmap</h2>
            <p class="muted" style="margin: 0; font-size: 0.8rem;">Click any state for fiscal insights or deep-dive report</p>
          </div>
          <div class="map-legend">
            <span>Low (0%)</span>
            <div class="legend-bar"></div>
            <span>Target (100%)</span>
            <button *ngIf="selectedState" (click)="resetSelection()" class="btn btn-ghost reset-btn">Reset Map</button>
          </div>
        </div>
        <div #mapContainer class="svg-container"></div>
        <div class="tooltip" #tooltip></div>
      </div>
      
      <!-- Smooth Floating HUD Drawer (no map squashing) -->
      <aside class="side-drawer" [class.open]="selectedState">
        <div *ngIf="selectedState" class="drawer-content">
          <div class="summary-header">
            <div class="summary-title-wrap">
              <span class="state-pin">📍</span>
              <div>
                <h2>{{ selectedState.name }}</h2>
                <div class="summary-badges">
                  <span class="pace-pill" [ngClass]="getPaceClass(selectedState.utilizationPct)">
                    {{ getPaceLabel(selectedState.utilizationPct) }}
                  </span>
                  <span class="rank-pill">FY 2026-27</span>
                </div>
              </div>
            </div>
            <button (click)="resetSelection()" class="drawer-close-btn" title="Close summary">✕</button>
          </div>

          <!-- Circular Utilization Hero Ring -->
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
                <span class="gauge-label">UTILIZED</span>
              </div>
            </div>
            <div class="gauge-stats">
              <div class="gauge-stat-item">
                <span class="sub-label">Allocated</span>
                <strong>{{ selectedState.allocated | inr }}</strong>
              </div>
              <div class="gauge-stat-item">
                <span class="sub-label">Disbursed</span>
                <strong>{{ selectedState.spent | inr }}</strong>
              </div>
              <div class="gauge-stat-item">
                <span class="sub-label">Balance</span>
                <strong [style.color]="selectedState.allocated < selectedState.spent ? 'var(--color-danger)' : 'var(--color-primary)'">
                  {{ (selectedState.allocated - selectedState.spent) | inr }}
                </strong>
              </div>
            </div>
          </div>
          
          <!-- Active Alerts -->
          <div *ngIf="selectedState.alerts.length > 0">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem;">
              Active Anomalies ({{ selectedState.alerts.length }})
            </h3>
            <div class="stack" style="gap: 0.5rem;">
              <div *ngFor="let alert of selectedState.alerts" class="drawer-alert" [class.warning]="alert.severity === 'Medium'">
                <div class="drawer-alert-header">
                  <span class="badge" [ngClass]="alert.severity === 'High' ? 'bg-danger' : 'bg-warning'">{{ alert.severity }}</span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-heading);">{{ alert.type }}</span>
                </div>
                <p style="font-size: 0.8rem; margin: 0; color: var(--text-heading); line-height: 1.4;">{{ alert.message }}</p>
              </div>
            </div>
          </div>
          
          <!-- Sector Breakdown -->
          <div>
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem;">
              Sector Breakdown
            </h3>
            <div *ngFor="let cat of selectedState.categoryBreakdown" class="cat-bar-item">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
                <span style="font-weight: 600; color: var(--text-heading);">{{ cat.category }}</span>
                <strong>{{ cat.pct }}%</strong>
              </div>
              <div class="cat-bar-track">
                <div class="cat-bar-fill" [style.width.%]="cat.pct"></div>
              </div>
            </div>
          </div>
          
          <!-- Top Schemes -->
          <div>
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem;">
              Flagship Programs
            </h3>
            <div class="scheme-pills">
              <span *ngFor="let scheme of selectedState.topSchemes" class="scheme-pill">{{ scheme }}</span>
            </div>
          </div>
          
          <button class="view-report-cta btn btn-primary" (click)="onViewReport()">
            <span>Open Detailed Fiscal Analytics</span>
            <span class="cta-arrow">→</span>
          </button>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .heatmap-container {
      display: flex;
      position: relative;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      min-height: 520px;
    }
    .map-wrapper {
      flex: 1;
      padding: var(--space-5);
      position: relative;
      width: 100%;
    }
    .map-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }
    .map-legend {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .legend-bar {
      width: 110px;
      height: 8px;
      background: linear-gradient(to right, #0F9D8C, #F5A524, #E5484D);
      border-radius: 4px;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
    }
    .reset-btn {
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: var(--radius-sm);
    }
    .svg-container {
      width: 100%;
      height: 460px;
      position: relative;
    }
    ::ng-deep .state-path {
      stroke: #ffffff;
      stroke-width: 0.75px;
      transition: all 0.25s ease;
      cursor: pointer;
    }
    ::ng-deep .state-path:hover {
      opacity: 0.85;
      stroke: var(--color-primary);
      stroke-width: 2px;
      filter: drop-shadow(0 2px 8px rgba(79, 70, 229, 0.35));
    }
    ::ng-deep .state-path.dimmed {
      opacity: 0.25;
    }
    ::ng-deep .state-path.selected {
      stroke: #1E1B4B;
      stroke-width: 2.5px;
      opacity: 1;
      filter: drop-shadow(0 0 10px rgba(79, 70, 229, 0.5));
    }
    .tooltip {
      position: absolute;
      padding: 0.5rem 0.85rem;
      background: rgba(15, 23, 42, 0.92);
      color: #fff;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 50;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
    }
    
    /* Floating Luxury Side Drawer */
    .side-drawer {
      position: absolute;
      top: 14px;
      right: 14px;
      bottom: 14px;
      width: 410px;
      max-width: calc(100% - 28px);
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(24px) saturate(200%);
      -webkit-backdrop-filter: blur(24px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(79, 70, 229, 0.08);
      transform: translateX(calc(100% + 24px));
      transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
      opacity: 0;
      z-index: 30;
      overflow-y: auto;
      pointer-events: none;
    }
    .side-drawer.open {
      transform: translateX(0);
      opacity: 1;
      pointer-events: auto;
    }
    .drawer-content {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      padding-bottom: var(--space-3);
    }
    .summary-title-wrap {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }
    .state-pin {
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .summary-title-wrap h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-heading);
      margin: 0 0 4px;
      letter-spacing: -0.02em;
    }
    .summary-badges {
      display: flex;
      gap: var(--space-2);
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
    .pace-optimal { background: rgba(16, 185, 129, 0.15); color: #047857; border: 1px solid rgba(16, 185, 129, 0.3); }
    .pace-lagging { background: rgba(239, 68, 68, 0.15); color: #BE123C; border: 1px solid rgba(239, 68, 68, 0.3); }
    .pace-over    { background: rgba(245, 158, 11, 0.15); color: #B45309; border: 1px solid rgba(245, 158, 11, 0.3); }
    .rank-pill    { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }

    .drawer-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(148, 163, 184, 0.15);
      border: 1px solid rgba(148, 163, 184, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-muted);
      transition: all 0.25s var(--ease-spring);
    }
    .drawer-close-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #EF4444;
      border-color: rgba(239, 68, 68, 0.3);
      transform: scale(1.1) rotate(90deg);
    }

    /* Gauge Hero */
    .utilization-gauge-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.8));
      border: 1px solid rgba(255, 255, 255, 0.95);
      border-radius: var(--radius-xl);
      padding: var(--space-4) var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1);
    }
    .gauge-ring-wrap {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }
    .gauge-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .gauge-bg {
      fill: none;
      stroke: rgba(148, 163, 184, 0.16);
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
      font-size: 1.3rem;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .gauge-label {
      font-size: 0.65rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.08em;
      margin-top: 3px;
    }

    .gauge-stats {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .gauge-stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-xs);
    }
    .gauge-stat-item .sub-label { color: var(--text-muted); font-weight: 600; }
    .gauge-stat-item strong { color: var(--text-heading); font-weight: 700; }

    /* Alert cards in drawer */
    .drawer-alert {
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: rgba(254, 242, 242, 0.85);
      border-left: 3px solid #E11D48;
      border: 1px solid rgba(225, 29, 72, 0.2);
    }
    .drawer-alert.warning {
      background: rgba(254, 243, 199, 0.85);
      border-left: 3px solid #D97706;
      border: 1px solid rgba(217, 119, 6, 0.2);
    }
    .drawer-alert-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: 2px;
    }

    /* Category bar */
    .cat-bar-item { margin-bottom: var(--space-2); }
    .cat-bar-track {
      width: 100%;
      height: 6px;
      background: rgba(148, 163, 184, 0.2);
      border-radius: 9999px;
      overflow: hidden;
    }
    .cat-bar-fill {
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
      transition: width 0.6s var(--ease-out);
    }

    .scheme-pills {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .scheme-pill {
      font-size: var(--text-xs);
      padding: 0.25rem 0.6rem;
      background: rgba(79, 70, 229, 0.08);
      color: var(--color-primary);
      border-radius: var(--radius-sm);
      font-weight: 600;
      border: 1px solid rgba(79, 70, 229, 0.15);
    }

    /* CTA View full report button */
    .view-report-cta {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
      color: #fff;
      transition: all 0.3s var(--ease-spring);
      cursor: pointer;
    }
    .view-report-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 26px rgba(79, 70, 229, 0.45);
    }
    .view-report-cta:hover .cta-arrow {
      transform: translateX(4px);
    }
    .cta-arrow {
      transition: transform 0.2s ease;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .side-drawer {
        position: fixed;
        inset: auto 0 0 0;
        width: 100%;
        max-width: 100%;
        height: 70vh;
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
  showReportModal = false;
  geoData: any;
  colorScale: any;

  @Output() openStateReport = new EventEmitter<StateData>();

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

  constructor(private stateDataService: StateDataService) {
    // Custom domain from 0% to 120%, color scale: teal -> amber -> coral
    this.colorScale = d3.scaleSequential()
      .domain([0, 100])
      .interpolator(d3.piecewise(d3.interpolateHsl, ["#0F9D8C", "#F5A524", "#E5484D"]));
  }

  ngOnInit() {
    this.initMap();
  }

  async initMap() {
    try {
      // Using a publicly available GeoJSON for Indian States.
      // NOTE: This acts as a placeholder shape file for visualization purposes.
      const response = await fetch('/assets/india-states.geojson');
      this.geoData = await response.json();
      this.drawMap();
    } catch (e) {
      console.error('Failed to load map data', e);
      // Fallback message
      this.mapContainer.nativeElement.innerHTML = '<p class="text-muted">Map data unavailable. Please run the script to download india-states.geojson to assets folder.</p>';
    }
  }

  drawMap() {
    const element = this.mapContainer.nativeElement;
    const width = element.clientWidth;
    const height = element.clientHeight;
    
    d3.select(element).selectAll('*').remove();
    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Setup projection for India
    const projection = d3.geoMercator()
      .fitSize([width, height], this.geoData);
      
    const path = d3.geoPath().projection(projection);

    const statesGroup = svg.append('g').attr('class', 'states');

    const tooltip = d3.select(this.tooltipElement.nativeElement);

    statesGroup.selectAll('path')
      .data(this.geoData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('class', 'state-path')
      .attr('fill', (d: any) => {
        // Map geojson names to our state service names
        // Note: Real implementation would need a strict ID map. We do a loose match.
        const stateName = d.properties.NAME_1 || d.properties.st_nm; 
        const stateData = this.matchState(stateName);
        if (stateData) return this.colorScale(stateData.utilizationPct);
        return '#E4E7EC'; // Default gray
      })
      .on('mouseover', (event, d: any) => {
        const stateName = d.properties.NAME_1 || d.properties.st_nm;
        const data = this.matchState(stateName);
        
        let content = `<strong>${stateName}</strong>`;
        if (data) {
          content += `<br/>Utilization: ${data.utilizationPct}%`;
          if (data.alerts.length > 0) {
            content += `<br/><span style="color:var(--color-danger)">● ${data.alerts.length} Alerts</span>`;
          }
        } else {
          content += `<br/>No data available`;
        }
        
        tooltip.style('opacity', 1).html(content);
        
        if (!this.selectedState) {
          statesGroup.selectAll('path').classed('dimmed', true);
          d3.select(event.currentTarget as Element).classed('dimmed', false);
        }
      })
      .on('mousemove', (event) => {
        // Position relative to map container
        const rect = element.getBoundingClientRect();
        tooltip
          .style('left', (event.clientX - rect.left + 15) + 'px')
          .style('top', (event.clientY - rect.top + 15) + 'px');
      })
      .on('mouseout', (event) => {
        tooltip.style('opacity', 0);
        if (!this.selectedState) {
          statesGroup.selectAll('path').classed('dimmed', false);
        }
      })
      .on('click', (event, d: any) => {
        const stateName = d.properties.NAME_1 || d.properties.st_nm;
        this.selectedState = this.matchState(stateName) || null;
        
        statesGroup.selectAll('path').classed('selected', false).classed('dimmed', true);
        d3.select(event.currentTarget as Element).classed('selected', true).classed('dimmed', false);
      });
  }

  resetSelection() {
    this.selectedState = null;
    const element = this.mapContainer.nativeElement;
    d3.select(element).selectAll('.state-path')
      .classed('selected', false)
      .classed('dimmed', false);
  }

  // Simple string matcher for differing geojson formats
  private matchState(name: string): StateData | undefined {
    if (!name) return undefined;
    const states = this.stateDataService.getAllStates();
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return states.find(s => s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean);
  }

  getSeverityColor(pct: number): string {
    if (pct < 40 || pct > 100) return 'var(--color-danger)';
    if (pct < 60) return 'var(--color-warning)';
    return 'var(--color-success)';
  }
}
