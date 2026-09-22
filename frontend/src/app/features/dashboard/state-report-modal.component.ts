import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateData } from '../../core/state-data.service';
import { InrPipe } from '../../shared/inr.pipe';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-state-report-modal',
  standalone: true,
  imports: [CommonModule, InrPipe],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()" #reportContent>
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="/logo.png" alt="Logo" style="height: 40px; width: 40px; object-fit: contain;">
            <div>
              <h2 style="margin: 0;">{{ data.name }} - Comprehensive Fiscal Report</h2>
              <p class="muted" style="margin: 0; font-size: 0.9rem;">Generated on {{ currentDate | date:'medium' }}</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary" (click)="downloadPdf()" [disabled]="downloading">
              {{ downloading ? 'Generating PDF...' : 'Download PDF' }}
            </button>
            <button class="btn btn-ghost" (click)="close.emit()">Close</button>
          </div>
        </div>

        <div class="modal-body" id="pdf-content">
          <!-- Executive Summary -->
          <div class="report-section">
            <h3>Executive Summary</h3>
            <p style="line-height: 1.6;">{{ data.summary }}</p>
            
            <div class="kpi-grid">
              <div class="kpi-card">
                <span class="muted">Total Allocated</span>
                <strong>{{ data.allocated | inr }}</strong>
              </div>
              <div class="kpi-card">
                <span class="muted">Total Utilized</span>
                <strong>{{ data.spent | inr }}</strong>
              </div>
              <div class="kpi-card">
                <span class="muted">Utilization Rate</span>
                <strong [style.color]="data.utilizationPct < 40 ? 'var(--red)' : (data.utilizationPct > 100 ? 'var(--orange)' : 'var(--emerald)')">{{ data.utilizationPct }}%</strong>
              </div>
            </div>
          </div>

          <!-- Alerts -->
          <div class="report-section" *ngIf="data.alerts.length > 0">
            <h3>Active Alerts & Anomalies</h3>
            <div class="alert-list">
              <div class="alert-item" *ngFor="let alert of data.alerts" [ngClass]="alert.severity.toLowerCase()">
                <strong>{{ alert.type }}:</strong> {{ alert.message }}
              </div>
            </div>
          </div>

          <!-- History Chart -->
          <div class="report-section">
            <h3>5-Year Fiscal History</h3>
            <div style="position: relative; height: 300px; width: 100%;">
              <canvas #historyChart></canvas>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="report-section" style="page-break-inside: avoid;">
            <h3>Sector-wise Breakdown</h3>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Share (%)</th>
                  <th>Estimated Utilization</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cat of data.categoryBreakdown">
                  <td>{{ cat.category }}</td>
                  <td>{{ cat.pct }}%</td>
                  <td>{{ (data.spent * cat.pct / 100) | inr }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    .modal-content {
      background: #fff;
      border-radius: 12px;
      width: 100%;
      max-width: 900px;
      max-height: 95vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .modal-header {
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface);
      border-radius: 12px 12px 0 0;
    }
    .modal-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
      background: #fff;
      border-radius: 0 0 12px 12px;
    }
    .report-section {
      margin-bottom: 2rem;
    }
    .report-section h3 {
      border-bottom: 2px solid var(--indigo);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      color: var(--navy);
      font-size: 1.1rem;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .kpi-card {
      background: var(--navy-lt);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .kpi-card span {
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.85rem;
    }
    .kpi-card strong {
      font-size: 1.25rem;
      color: var(--navy);
    }
    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .alert-item {
      padding: 0.75rem;
      border-radius: 6px;
      background: #fff5f5;
      border: 1px solid #fc8181;
      color: #c53030;
      font-size: 0.9rem;
    }
    .alert-item.medium {
      background: #fffaf0;
      border-color: #f6ad55;
      color: #c05621;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.5rem;
      font-size: 0.95rem;
    }
    .report-table th, .report-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .report-table th {
      background: var(--surface);
      font-weight: 600;
      color: var(--navy);
    }
    /* Hide scrollbar during PDF capture if needed */
    .pdf-capture-mode {
      overflow: visible !important;
      max-height: none !important;
    }
  `]
})
export class StateReportModalComponent implements AfterViewInit, OnDestroy {
  @Input() data!: StateData;
  @Output() close = new EventEmitter<void>();
  
  @ViewChild('historyChart') historyChartRef!: ElementRef;
  private chartInstance: any;
  currentDate = new Date();
  downloading = false;

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  renderChart() {
    if (!this.historyChartRef || !this.data.history5Years) return;

    const ctx = this.historyChartRef.nativeElement.getContext('2d');
    const labels = this.data.history5Years.map(h => h.year);
    const allocated = this.data.history5Years.map(h => h.allocated);
    const spent = this.data.history5Years.map(h => h.spent);

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Allocated (₹)',
            data: allocated,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1
          },
          {
            label: 'Utilized (₹)',
            data: spent,
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)',
            type: 'line',
            tension: 0.3,
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                if (Number(value) >= 10000000) return '₹' + (Number(value) / 10000000).toFixed(0) + ' Cr';
                return value;
              }
            }
          }
        },
        animation: { duration: 0 } // disable animation for reliable PDF generation
      }
    });
  }

  async downloadPdf() {
    this.downloading = true;
    try {
      const element = document.getElementById('pdf-content');
      if (!element) return;

      // Scroll to top to avoid html2canvas cutoff bugs
      element.scrollTop = 0;
      
      // Briefly remove constraints so html2canvas captures full height
      element.classList.add('pdf-capture-mode');

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        scrollY: -window.scrollY
      });
      
      element.classList.remove('pdf-capture-mode');

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Header offset
      const topMargin = 30;
      
      pdf.setFontSize(16);
      pdf.text(`Comprehensive Fiscal Report - ${this.data.name}`, 15, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${this.currentDate.toLocaleString()}`, 15, 22);

      // Handle multi-page if the image height exceeds one page
      let heightLeft = imgHeight;
      let position = topMargin;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= (pageHeight - topMargin);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight; 
        // Example: if image is 400mm and page is 297mm.
        // First page prints 0 to 297mm. We want next page to shift up by 297mm.
        // position needs to be - (pageHeight - topMargin) for the 2nd page, etc.
        pdf.addPage();
        // Calculate vertical offset for subsequent pages
        const yOffset = topMargin - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${this.data.name.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      this.downloading = false;
    }
  }
}
