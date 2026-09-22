import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface EventDetails {
  id: string;
  tag: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  type: string;
  description: string;
  imageUrl: string;
  agenda?: string[];
  speakers?: { name: string; title: string; org: string }[];
}

@Component({
  selector: 'app-event-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="event-reg-viewport animate-fade-in-up">
      <!-- Breadcrumbs & Return Bar -->
      <div class="event-breadcrumb-bar">
        <div class="breadcrumb-container">
          <a routerLink="/home" class="btn-back-home">
            <span class="back-arrow">←</span>
            <span>Back to National Portal</span>
          </a>
          <div class="breadcrumb-trail">
            <span class="trail-item">Home</span>
            <span class="trail-sep">/</span>
            <span class="trail-item">National Conclaves &amp; Events</span>
            <span class="trail-sep">/</span>
            <span class="trail-item active">Official Delegate Registration</span>
          </div>
        </div>
      </div>

      <!-- Main Event Hero & Registration Grid -->
      <div class="event-reg-container">
        
        <!-- Left Column: Rich Event Overview & Agenda -->
        <div class="event-details-col">
          <div class="event-card-hero">
            <div class="event-hero-banner" [style.backgroundImage]="'url(' + currentEvent.imageUrl + ')'">
              <div class="event-hero-overlay"></div>
              <div class="event-hero-badge">
                <span class="event-tag-pill">{{ currentEvent.tag }}</span>
                <span class="event-type-badge">{{ currentEvent.type }}</span>
              </div>
            </div>

            <div class="event-hero-body">
              <h1 class="event-main-title">{{ currentEvent.title }}</h1>
              
              <div class="event-meta-tiles">
                <div class="meta-tile">
                  <span class="tile-icon">📅</span>
                  <div class="tile-info">
                    <span class="tile-label">Date &amp; Schedule</span>
                    <strong class="tile-val">{{ currentEvent.date }}</strong>
                    <small *ngIf="currentEvent.time" class="tile-sub">{{ currentEvent.time }}</small>
                  </div>
                </div>

                <div class="meta-tile">
                  <span class="tile-icon">📍</span>
                  <div class="tile-info">
                    <span class="tile-label">Venue &amp; Mode</span>
                    <strong class="tile-val">{{ currentEvent.location }}</strong>
                    <small class="tile-sub">Hybrid: In-Person &amp; NIC Live Webcast</small>
                  </div>
                </div>
              </div>

              <div class="event-narrative">
                <h3>About This National Session</h3>
                <p>{{ currentEvent.description }}</p>
              </div>

              <!-- Agenda Tracks -->
              <div class="event-agenda-section" *ngIf="currentEvent.agenda && currentEvent.agenda.length > 0">
                <h3>Executive Agenda Tracks</h3>
                <div class="agenda-timeline">
                  <div *ngFor="let track of currentEvent.agenda; let i = index" class="timeline-step">
                    <div class="step-num">0{{ i + 1 }}</div>
                    <div class="step-content">{{ track }}</div>
                  </div>
                </div>
              </div>

              <!-- Keynote Dignitaries -->
              <div class="event-speakers-section" *ngIf="currentEvent.speakers && currentEvent.speakers.length > 0">
                <h3>Featured Keynote Panelists</h3>
                <div class="speakers-grid">
                  <div *ngFor="let sp of currentEvent.speakers" class="speaker-card">
                    <div class="speaker-avatar-initial">{{ sp.name.charAt(0) }}</div>
                    <div class="speaker-info">
                      <strong>{{ sp.name }}</strong>
                      <span class="speaker-title">{{ sp.title }}</span>
                      <small class="speaker-org">{{ sp.org }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Security & Protocol Notice -->
              <div class="protocol-notice-box">
                <span class="notice-icon">🛡️</span>
                <div class="notice-text">
                  <strong>Official Delegate Protocol:</strong>
                  Admission is reserved for accredited officers from Central Ministries, State Finance Departments, CAG, and verified policy research institutions. Official Government ID is required at the Vigyan Bhawan entrance.
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Right Column: Registration Form & Live Ticket Pass -->
        <div class="event-form-col">
          
          <!-- State A: Form Input -->
          <div *ngIf="!submitted" class="registration-panel">
            <div class="panel-header">
              <div class="header-icon-box">🎟️</div>
              <div>
                <h2>Delegate Accreditation Form</h2>
                <p>Register to receive your official delegate credentials, access pass, and briefing deck.</p>
              </div>
            </div>

            <form (ngSubmit)="handleRegister()" class="reg-page-form">
              <!-- Name & Email -->
              <div class="form-grid-2">
                <div class="input-field-group">
                  <label>Full Name <span class="req">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-prefix">👤</span>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.name" 
                      name="name" 
                      required 
                      placeholder="e.g. Dr. Rajeshwar Sharma" 
                    />
                  </div>
                </div>

                <div class="input-field-group">
                  <label>Official Email <span class="req">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-prefix">✉️</span>
                    <input 
                      type="email" 
                      [(ngModel)]="formData.email" 
                      name="email" 
                      required 
                      placeholder="name@nic.in or officer@gov.in" 
                    />
                  </div>
                </div>
              </div>

              <!-- Phone & Organization -->
              <div class="form-grid-2">
                <div class="input-field-group">
                  <label>Mobile Number <span class="req">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-prefix">📱</span>
                    <input 
                      type="tel" 
                      [(ngModel)]="formData.phone" 
                      name="phone" 
                      required 
                      placeholder="+91 98765 43210" 
                    />
                  </div>
                </div>

                <div class="input-field-group">
                  <label>Organization / Ministry <span class="req">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-prefix">🏛️</span>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.organization" 
                      name="organization" 
                      required 
                      placeholder="Ministry of Finance / State Treasury" 
                    />
                  </div>
                </div>
              </div>

              <!-- Designation & Sector Category -->
              <div class="form-grid-2">
                <div class="input-field-group">
                  <label>Official Designation <span class="req">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-prefix">💼</span>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.designation" 
                      name="designation" 
                      required 
                      placeholder="Joint Secretary / Chief Controller" 
                    />
                  </div>
                </div>

                <div class="input-field-group">
                  <label>Sector Category <span class="req">*</span></label>
                  <div class="input-with-icon">
                    <span class="field-prefix">🌐</span>
                    <select [(ngModel)]="formData.sector" name="sector" class="select-input">
                      <option value="CentralMinistry">Central Ministry / Department (GoI)</option>
                      <option value="StateFinance">State Finance Department / Treasury</option>
                      <option value="CAG_Audit">Comptroller &amp; Auditor General (CAG)</option>
                      <option value="ThinkTank">Think Tank / Academic Institution</option>
                      <option value="CivilSociety">Civil Society / Public Oversight</option>
                      <option value="MediaResearch">Accredited Financial Media</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Mode Selection (Radio Group) -->
              <div class="mode-selection-group">
                <label class="mode-group-label">Attendance Preference</label>
                <div class="mode-options-grid">
                  <label class="mode-card" [class.selected]="formData.mode === 'in-person'">
                    <input type="radio" [(ngModel)]="formData.mode" name="mode" value="in-person" class="sr-only" />
                    <span class="mode-badge">🏛️ Physical In-Person</span>
                    <span class="mode-sub">Vigyan Bhawan, New Delhi (Includes Networking Luncheon)</span>
                  </label>

                  <label class="mode-card" [class.selected]="formData.mode === 'virtual'">
                    <input type="radio" [(ngModel)]="formData.mode" name="mode" value="virtual" class="sr-only" />
                    <span class="mode-badge">💻 Virtual Live Webcast</span>
                    <span class="mode-sub">Secure NIC High-Definition Webcast with Q&amp;A</span>
                  </label>
                </div>
              </div>

              <!-- Live Pass Preview Teaser -->
              <div class="live-pass-preview-box">
                <div class="pass-preview-header">
                  <span class="preview-tag">LIVE PASS PREVIEW</span>
                  <span class="preview-status">● Real-time Binding</span>
                </div>
                <div class="ticket-wireframe">
                  <div class="ticket-left">
                    <div class="ticket-emblem">🇮🇳</div>
                    <div class="ticket-identity">
                      <strong>{{ formData.name || 'DELEGATE NAME' }}</strong>
                      <span>{{ formData.organization || 'GOVERNMENT OF INDIA' }}</span>
                      <small>{{ formData.designation || 'ACCREDITED OFFICER' }}</small>
                    </div>
                  </div>
                  <div class="ticket-right">
                    <span class="pass-chip">{{ formData.mode === 'in-person' ? 'IN-PERSON VIP' : 'VIRTUAL WEBCAST' }}</span>
                    <span class="pass-barcode">|||||| ||| |||||||</span>
                  </div>
                </div>
              </div>

              <!-- Checkbox & Submit -->
              <div class="checkbox-line">
                <input type="checkbox" id="termsCheck" [(ngModel)]="formData.agree" name="agree" required />
                <label for="termsCheck">I confirm that the details provided are accurate and agree to receive official conclave briefing materials and calendar invites.</label>
              </div>

              <button 
                type="submit" 
                class="btn-submit-registration" 
                [disabled]="isSubmitting || !formData.name || !formData.email || !formData.organization || !formData.agree"
              >
                <span *ngIf="!isSubmitting">Confirm Accreditation &amp; Issue Pass →</span>
                <span *ngIf="isSubmitting">Generating Official Pass Credentials...</span>
              </button>
            </form>
          </div>

          <!-- State B: Success & Official Ticket Receipt -->
          <div *ngIf="submitted" class="success-panel animate-fade-in-up">
            <div class="success-icon-badge">✓</div>
            <h2>Accreditation Confirmed!</h2>
            <p class="success-sub">Your official delegate pass has been issued and registered with the Conclave Secretariat.</p>

            <!-- Formal Ticket Pass Card -->
            <div class="official-ticket-card" id="delegatePass">
              <div class="ticket-header-strip">
                <div class="ticket-org-brand">
                  <span class="ticket-flag">🇮🇳</span>
                  <div>
                    <strong>GOVERNMENT OF INDIA &bull; CONCLAVE SECRETARIAT</strong>
                    <small>Official Delegate Accreditation Pass</small>
                  </div>
                </div>
                <span class="ticket-tier-badge">ACCREDITED DELEGATE</span>
              </div>

              <div class="ticket-main-grid">
                <div class="ticket-data-col">
                  <div class="ticket-data-group">
                    <span class="data-label">EVENT</span>
                    <strong class="data-title">{{ currentEvent.title }}</strong>
                  </div>

                  <div class="ticket-data-row-2">
                    <div class="ticket-data-group">
                      <span class="data-label">DELEGATE NAME</span>
                      <strong class="data-val">{{ formData.name }}</strong>
                    </div>
                    <div class="ticket-data-group">
                      <span class="data-label">DESIGNATION</span>
                      <strong class="data-val">{{ formData.designation }}</strong>
                    </div>
                  </div>

                  <div class="ticket-data-row-2">
                    <div class="ticket-data-group">
                      <span class="data-label">MINISTRY / ENTITY</span>
                      <strong class="data-val">{{ formData.organization }}</strong>
                    </div>
                    <div class="ticket-data-group">
                      <span class="data-label">MODE</span>
                      <strong class="data-val highlight-teal">{{ formData.mode === 'in-person' ? 'Vigyan Bhawan (Physical)' : 'NIC Virtual Webcast' }}</strong>
                    </div>
                  </div>

                  <div class="ticket-data-row-2">
                    <div class="ticket-data-group">
                      <span class="data-label">DATE &amp; TIME</span>
                      <span class="data-val">{{ currentEvent.date }} &bull; {{ currentEvent.time || '10:00 AM IST' }}</span>
                    </div>
                    <div class="ticket-data-group">
                      <span class="data-label">PASS CODE</span>
                      <span class="pass-hex-code">{{ passCode }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right QR Code & Security Hologram -->
                <div class="ticket-security-col">
                  <div class="qr-code-box">
                    <div class="qr-mock-matrix">
                      <div class="qr-corner top-left"></div>
                      <div class="qr-corner top-right"></div>
                      <div class="qr-corner bottom-left"></div>
                      <div class="qr-center-pattern"></div>
                    </div>
                    <small class="qr-caption">SCAN AT ENTRY</small>
                  </div>
                  <div class="security-seal-badge">
                    <span class="seal-icon">✦</span>
                    <span>NIC VERIFIED</span>
                  </div>
                </div>
              </div>

              <div class="ticket-footer-strip">
                <span>Pass ID: {{ passCode }} &bull; Issued via AI-Based Budget Utilization Monitoring System</span>
                <span class="ticket-barcode">|||| |||||| ||||| |||||| ||||</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="success-actions-row">
              <button class="btn-print-pass" (click)="printPass()">
                <span>🖨️ Print / Save Pass</span>
              </button>
              <a routerLink="/home" class="btn-home-return">
                <span>Return to Portal</span>
              </a>
              <a routerLink="/dashboard" class="btn-dashboard-nav">
                <span>Open Dashboard →</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .event-reg-viewport {
      min-height: calc(100vh - var(--header-height));
      background: #F8FAFC;
      padding-bottom: 80px;
    }

    /* Breadcrumbs */
    .event-breadcrumb-bar {
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      padding: 14px 24px;
    }
    .breadcrumb-container {
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .btn-back-home {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.86rem;
      font-weight: 700;
      color: #0D9488;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-back-home:hover {
      color: #0F766E;
      transform: translateX(-3px);
    }
    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #64748B;
    }
    .trail-sep { color: #CBD5E1; }
    .trail-item.active {
      color: #083E48;
      font-weight: 700;
    }

    /* Main Container Grid */
    .event-reg-container {
      max-width: 1440px;
      margin: 36px auto 0;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 36px;
      align-items: start;
    }

    /* Left Column: Event Overview Card */
    .event-card-hero {
      background: #FFFFFF;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(13, 148, 136, 0.2);
      box-shadow: 0 10px 30px rgba(8, 62, 72, 0.08);
    }
    .event-hero-banner {
      height: 280px;
      position: relative;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: flex-end;
      padding: 24px;
    }
    .event-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(8, 62, 72, 0.2) 0%, rgba(8, 62, 72, 0.88) 100%);
    }
    .event-hero-badge {
      position: relative;
      z-index: 2;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .event-tag-pill {
      background: #0D9488;
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .event-type-badge {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .event-hero-body {
      padding: 32px;
    }
    .event-main-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #083E48;
      line-height: 1.3;
      margin: 0 0 24px;
    }
    .event-meta-tiles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }
    .meta-tile {
      background: #F0FDFA;
      border: 1px solid rgba(13, 148, 136, 0.2);
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tile-icon { font-size: 1.4rem; }
    .tile-info { display: flex; flex-direction: column; }
    .tile-label { font-size: 0.72rem; color: #64748B; font-weight: 600; text-transform: uppercase; }
    .tile-val { font-size: 0.92rem; color: #083E48; font-weight: 700; margin-top: 2px; }
    .tile-sub { font-size: 0.74rem; color: #0D9488; font-weight: 600; }

    .event-narrative h3, .event-agenda-section h3, .event-speakers-section h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #083E48;
      margin: 0 0 12px;
    }
    .event-narrative p {
      font-size: 0.94rem;
      line-height: 1.65;
      color: #334155;
      margin: 0 0 24px;
    }

    /* Agenda Timeline */
    .agenda-timeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 28px;
    }
    .timeline-step {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 14px;
    }
    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #0D9488;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.76rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-content {
      font-size: 0.88rem;
      color: #1E293B;
      font-weight: 600;
    }

    /* Speakers Grid */
    .speakers-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 28px;
    }
    .speaker-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
    }
    .speaker-avatar-initial {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0D9488, #083E48);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .speaker-info { display: flex; flex-direction: column; line-height: 1.25; }
    .speaker-info strong { font-size: 0.86rem; color: #083E48; }
    .speaker-title { font-size: 0.74rem; color: #64748B; font-weight: 600; }
    .speaker-org { font-size: 0.68rem; color: #0D9488; font-weight: 700; }

    .protocol-notice-box {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .notice-icon { font-size: 1.3rem; }
    .notice-text { font-size: 0.82rem; color: #92400E; line-height: 1.5; }
    .notice-text strong { display: block; margin-bottom: 2px; }

    /* Right Column: Registration Panel */
    .registration-panel {
      background: #FFFFFF;
      border-radius: 24px;
      border: 1px solid rgba(13, 148, 136, 0.25);
      box-shadow: 0 12px 36px rgba(8, 62, 72, 0.1);
      padding: 32px;
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 1px solid #E2E8F0;
    }
    .header-icon-box {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: #F0FDFA;
      border: 1px solid rgba(13, 148, 136, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .panel-header h2 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #083E48;
      margin: 0 0 4px;
    }
    .panel-header p {
      font-size: 0.84rem;
      color: #64748B;
      margin: 0;
    }

    .reg-page-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .input-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .input-field-group label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #334155;
    }
    .req { color: #E11D48; }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      transition: all 0.2s;
    }
    .input-with-icon:focus-within {
      border-color: #0D9488;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }
    .field-prefix {
      padding-left: 12px;
      font-size: 0.95rem;
      color: #64748B;
    }
    .input-with-icon input, .select-input {
      flex: 1;
      width: 100%;
      border: none;
      background: transparent;
      padding: 10px 12px;
      font-size: 0.88rem;
      color: #0F172A;
      outline: none;
      font-weight: 500;
    }

    /* Mode Selection Cards */
    .mode-selection-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .mode-group-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #334155;
    }
    .mode-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .mode-card {
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.2s;
    }
    .mode-card:hover {
      border-color: #0D9488;
      background: #F0FDFA;
    }
    .mode-card.selected {
      border-color: #0D9488;
      background: #F0FDFA;
      box-shadow: 0 0 0 2px #0D9488;
    }
    .mode-badge {
      font-size: 0.84rem;
      font-weight: 700;
      color: #083E48;
    }
    .mode-sub {
      font-size: 0.72rem;
      color: #64748B;
      line-height: 1.35;
    }

    /* Live Pass Preview Box */
    .live-pass-preview-box {
      background: linear-gradient(135deg, #073B45, #031F24);
      border-radius: 14px;
      padding: 14px 18px;
      color: #FFFFFF;
      box-shadow: 0 8px 24px rgba(3, 31, 36, 0.25);
    }
    .pass-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .preview-tag { color: #5EEAD4; letter-spacing: 0.06em; }
    .preview-status { color: #10B981; }
    .ticket-wireframe {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.08);
      border: 1px dashed rgba(45, 212, 191, 0.35);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .ticket-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ticket-emblem { font-size: 1.5rem; }
    .ticket-identity {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .ticket-identity strong { font-size: 0.88rem; color: #FFFFFF; }
    .ticket-identity span { font-size: 0.74rem; color: #99F6E4; }
    .ticket-identity small { font-size: 0.68rem; color: #94A3B8; }
    .ticket-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .pass-chip {
      background: #0D9488;
      color: #FFFFFF;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .pass-barcode {
      font-family: monospace;
      font-size: 0.72rem;
      letter-spacing: 2px;
      color: #5EEAD4;
    }

    .checkbox-line {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.78rem;
      color: #64748B;
      line-height: 1.4;
    }
    .checkbox-line input {
      margin-top: 3px;
      accent-color: #0D9488;
    }

    .btn-submit-registration {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #0D9488, #083E48);
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 800;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-submit-registration:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(13, 148, 136, 0.45);
    }
    .btn-submit-registration:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    /* Success Panel */
    .success-panel {
      background: #FFFFFF;
      border-radius: 24px;
      border: 1px solid rgba(13, 148, 136, 0.25);
      box-shadow: 0 12px 36px rgba(8, 62, 72, 0.1);
      padding: 36px;
      text-align: center;
    }
    .success-icon-badge {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #10B981;
      color: #FFFFFF;
      font-size: 1.8rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
    }
    .success-panel h2 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #083E48;
      margin: 0 0 6px;
    }
    .success-sub {
      font-size: 0.88rem;
      color: #64748B;
      margin: 0 0 24px;
    }

    /* Official Ticket Pass Card */
    .official-ticket-card {
      background: #FFFFFF;
      border: 2px solid #0D9488;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 28px;
      box-shadow: 0 12px 32px rgba(8, 62, 72, 0.12);
      text-align: left;
    }
    .ticket-header-strip {
      background: linear-gradient(135deg, #073B45, #031F24);
      color: #FFFFFF;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ticket-org-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ticket-flag { font-size: 1.4rem; }
    .ticket-org-brand strong { font-size: 0.78rem; display: block; color: #FFFFFF; }
    .ticket-org-brand small { font-size: 0.68rem; color: #5EEAD4; }
    .ticket-tier-badge {
      background: #0D9488;
      color: #FFFFFF;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .ticket-main-grid {
      display: grid;
      grid-template-columns: 1fr 140px;
      gap: 20px;
      padding: 20px;
      background: #FAFAFA;
    }
    .ticket-data-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .ticket-data-group {
      display: flex;
      flex-direction: column;
    }
    .data-label {
      font-size: 0.65rem;
      font-weight: 800;
      color: #94A3B8;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .data-title {
      font-size: 0.95rem;
      color: #083E48;
      line-height: 1.3;
    }
    .data-val {
      font-size: 0.86rem;
      color: #1E293B;
    }
    .highlight-teal { color: #0D9488; font-weight: 700; }
    .pass-hex-code {
      font-family: monospace;
      font-size: 0.86rem;
      font-weight: 800;
      color: #0D9488;
      background: #CCFBF1;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .ticket-data-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Security QR */
    .ticket-security-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border-left: 1.5px dashed #CBD5E1;
      padding-left: 16px;
    }
    .qr-code-box {
      width: 90px;
      height: 90px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .qr-mock-matrix {
      width: 64px;
      height: 64px;
      background: #0F172A;
      position: relative;
      border-radius: 4px;
    }
    .qr-corner {
      position: absolute;
      width: 16px;
      height: 16px;
      background: #FFFFFF;
      border: 3px solid #0F172A;
    }
    .top-left { top: 2px; left: 2px; }
    .top-right { top: 2px; right: 2px; }
    .bottom-left { bottom: 2px; left: 2px; }
    .qr-center-pattern {
      position: absolute;
      inset: 22px;
      background: #2DD4BF;
    }
    .qr-caption { font-size: 0.6rem; font-weight: 800; color: #64748B; margin-top: 2px; }
    .security-seal-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.65rem;
      font-weight: 800;
      color: #0D9488;
      background: #F0FDFA;
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px solid rgba(13, 148, 136, 0.2);
    }
    .seal-icon { color: #F59E0B; }

    .ticket-footer-strip {
      background: #F1F5F9;
      border-top: 1px solid #E2E8F0;
      padding: 8px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.7rem;
      color: #64748B;
    }
    .ticket-barcode {
      font-family: monospace;
      letter-spacing: 2px;
      font-size: 0.72rem;
      color: #083E48;
    }

    .success-actions-row {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-print-pass {
      padding: 11px 20px;
      background: #0D9488;
      color: #FFFFFF;
      border-radius: 10px;
      border: none;
      font-weight: 700;
      font-size: 0.86rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-print-pass:hover { background: #0F766E; }
    .btn-home-return {
      padding: 11px 20px;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      color: #334155;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.86rem;
      text-decoration: none;
    }
    .btn-dashboard-nav {
      padding: 11px 20px;
      background: #083E48;
      color: #FFFFFF;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.86rem;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .event-reg-container { grid-template-columns: 1fr; }
      .ticket-main-grid { grid-template-columns: 1fr; }
      .ticket-security-col { border-left: none; border-top: 1.5px dashed #CBD5E1; padding: 16px 0 0; }
    }
    @media (max-width: 640px) {
      .form-grid-2, .mode-options-grid, .ticket-data-row-2 { grid-template-columns: 1fr; }
      .event-meta-tiles { grid-template-columns: 1fr; }
      .registration-panel, .event-hero-body { padding: 20px; }
      .ticket-wireframe { flex-direction: column; align-items: flex-start; gap: 8px; }
    }
  `]
})
export class EventRegisterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  eventsCatalog: Record<string, EventDetails> = {
    'slide-1': {
      id: 'slide-1',
      tag: 'NATIONAL AUDIT REVIEW 2025/2026',
      title: 'From Sanction to Ground Delivery: Maximizing Capital Expenditure Velocity across States',
      date: 'Sep 28, 2026',
      time: '10:00 am – 1:30 pm IST',
      location: 'Central Secretariat & Virtual Live Webcast',
      type: 'National Flagship Audit',
      description: 'An in-depth fiscal assessment tracking how PFMS automation and DBT pipelines accelerated scheme fund absorption in Health, Jal Jeevan Mission, and Rural Roads across 36 States & UTs.',
      imageUrl: '/assets/carousel-slide-1.jpg',
      agenda: [
        'Single Nodal Agency (SNA) Just-in-Time Grant Disbursement Telemetry',
        'Mitigating Last-Quarter "March Rushes" in State Infrastructure Budgets',
        'Empowering District Development Coordination Committees (DISHA)'
      ],
      speakers: [
        { name: 'Dr. Vivek Joshi', title: 'Secretary (Expenditure)', org: 'Ministry of Finance, GoI' },
        { name: 'Smt. Sonali Singh', title: 'Controller General of Accounts', org: 'PFMS Division' },
        { name: 'Dr. K. Subramanian', title: 'Chief Economic Advisor', org: 'Govt. of India' }
      ]
    },
    'slide-2': {
      id: 'slide-2',
      tag: 'UPCOMING NATIONAL CONCLAVE',
      title: 'National Fiscal Conclave: Sub-National Debt Sustainability & Infrastructure Pacing',
      date: 'Oct 15, 2026',
      time: '10:30 am – 1:00 pm IST',
      location: 'Vigyan Bhawan, New Delhi & Virtual',
      type: 'National Inter-State Forum',
      description: 'Bringing together the Ministry of Finance, State Finance Secretaries, and NITI Aayog to streamline inter-governmental grant transfers and curb off-budget borrowings.',
      imageUrl: '/assets/carousel-slide-2.jpg',
      agenda: [
        'Inter-State Fiscal Space: Balancing Capex vs Revenue Deficit Glide Paths',
        'Treasury Single Account (TSA) Expansion to Autonomous Bodies',
        'State-Specific Incentive Schemes for Capital Expenditure (SASCI)'
      ],
      speakers: [
        { name: 'Shri B. V. R. Subrahmanyam', title: 'CEO', org: 'NITI Aayog' },
        { name: 'Shri T. V. Somanathan', title: 'Cabinet Secretary', org: 'Government of India' },
        { name: 'Dr. N. K. Singh', title: 'Chairman, 15th Finance Commission', org: 'Fiscal Advisory Board' }
      ]
    },
    'slide-3': {
      id: 'slide-3',
      tag: 'EXECUTIVE WORKSHOP',
      title: 'AI & Machine Learning in Public Finance: Automated Anomaly Detection in PFMS',
      date: 'Nov 04, 2026',
      time: '10:00 am – 1:30 pm IST',
      location: 'Bengaluru Innovation Hub & Live Webcast',
      type: 'Technical Executive Workshop',
      description: 'Hands-on technical session for Chief Controllers of Accounts and treasury auditors on deploying algorithmic pattern recognition to prevent March rushes and spike vouchers.',
      imageUrl: '/assets/carousel-slide-3.jpg',
      agenda: [
        'Machine Learning Models in Real-Time State Treasury Flow Analysis',
        'Automated Detection of Duplicate Contractor GSTIN Line Items',
        'Predictive Cash Balance Forecasting for State Treasuries'
      ],
      speakers: [
        { name: 'Dr. Siddharth Rao', title: 'Lead AI Architect', org: 'National Informatics Centre' },
        { name: 'Ms. Neha Deshmukh', title: 'Principal Data Scientist', org: 'PFMS Analytics Wing' }
      ]
    },
    'slide-4': {
      id: 'slide-4',
      tag: 'ANNUAL TRANSPARENCY BENCHMARK',
      title: 'India Budget Transparency & Utilization Review 2025: District Accountability',
      date: 'Nov 20, 2026',
      time: '11:00 am – 2:00 pm IST',
      location: 'India Habitat Centre, New Delhi & Virtual',
      type: 'National Transparency Benchmark',
      description: 'Comprehensive evaluation of budget transparency, participatory district planning, and legislative oversight covering all 780+ administrative districts and 36 States & UTs.',
      imageUrl: '/assets/carousel-slide-4.jpg',
      agenda: [
        'Launch of the 2025 District Fiscal Transparency Scorecards',
        'Gram Panchayat Public Hearing Protocols for Centrally Sponsored Schemes',
        'Open Fiscal Data API Access for Civil Society Monitors'
      ],
      speakers: [
        { name: 'Dr. Sanjeev Sanyal', title: 'Member, EAC-PM', org: 'Prime Minister Economic Advisory' },
        { name: 'Smt. Aruna Roy', title: 'Civic Oversight Convener', org: 'National Campaign for People\'s Right to Information' }
      ]
    },
    'slide-5': {
      id: 'slide-5',
      tag: 'FLAGSHIP WELFARE INITIATIVE',
      title: 'Direct Benefit Transfers & Rural Water Grids: Real-Time Telemetry & Zero Leakage',
      date: 'Dec 08, 2026',
      time: '10:30 am – 1:30 pm IST',
      location: 'Vigyan Bhawan, New Delhi & Live Webcast',
      type: 'National Welfare Summit',
      description: 'Reviewing ₹4.2 Lakh Crore annual DBT pipelines and IoT sensor data in Jal Jeevan Mission, ensuring every rupee reaches intended beneficiaries without administrative friction.',
      imageUrl: '/assets/water-grid-banner.jpg',
      agenda: [
        'Aadhaar Payment Bridge System (APBS) Settlement Speed Optimization',
        'IoT Telemetry in Functional Household Tap Water Connections (Jal Jeevan)',
        'Grievance Redressal Mechanisms in Frontline DBT Delivery'
      ],
      speakers: [
        { name: 'Shri V. Srinivas', title: 'Secretary (DARPG)', org: 'Dept of Administrative Reforms' },
        { name: 'Dr. Rajeshwar Sharma', title: 'Senior Fellow', org: 'NITI Aayog' }
      ]
    },
    'featured-national-workshop': {
      id: 'featured-national-workshop',
      tag: 'LATEST NATIONAL EVENT',
      title: 'National Workshop: Accelerating State Capital Expenditure & PFMS Integration',
      date: 'Oct 15, 2026',
      time: '10:30 am – 1:00 pm IST',
      location: 'Vigyan Bhawan, New Delhi & Live Webcast',
      type: 'Hybrid National Event',
      description: 'Special conference co-hosted by the Ministry of Finance and State Budget Directorates exploring real-time expenditure pacing, unspent balance return, and treasury digitization.',
      imageUrl: '/assets/national-event.jpg',
      agenda: [
        'Single Nodal Agency (SNA) SPARROW Integration',
        'Expediting Counterpart State Fund Releases for Central Schemes',
        'PFMS E-Bill Processing Guidelines for FY 2026-27'
      ],
      speakers: [
        { name: 'P. K. Venkataraman', title: 'Director', org: 'National Institute of Public Finance' },
        { name: 'Ananya Sen', title: 'Digital India Research Lead', org: 'Ministry of Electronics & IT' }
      ]
    },
    'national-briefing-2025': {
      id: 'national-briefing-2025',
      tag: 'GOVERNMENT OF INDIA BRIEFING',
      title: 'National Briefing: Strengthening Fiscal Accountability & Budget Transparency in India',
      date: 'Oct 22, 2026',
      time: '10:00 am – 1:00 pm IST',
      location: 'Vigyan Bhawan, New Delhi & Live Webcast',
      type: 'Official National Briefing',
      description: 'High-level national briefing co-hosted by the Ministry of Finance and State Treasuries on real-time PFMS data telemetry, tracking ₹16.03 Lakh Crore across 36 States & UTs, and eliminating fund absorption bottlenecks.',
      imageUrl: '/assets/carousel-slide-2.jpg',
      agenda: [
        'Real-Time Telemetry Mapping across 780+ Administrative Districts',
        'Direct Single Nodal Agency (SNA) Settlement Velocity and Zero-Balance Auditing',
        'State Capex Incentive Schemes and Timely Utilization Certificate Compliance',
        'Public Financial Management System (PFMS) AI Telemetry Demonstration'
      ],
      speakers: [
        { name: 'Dr. Vivek Joshi', title: 'Secretary (Expenditure)', org: 'Ministry of Finance, GoI' },
        { name: 'Shri B. V. R. Subrahmanyam', title: 'CEO', org: 'NITI Aayog' },
        { name: 'Smt. Sonali Singh', title: 'Controller General of Accounts', org: 'PFMS Division' }
      ]
    }
  };

  currentEvent: EventDetails = this.eventsCatalog['slide-2'];
  submitted = false;
  isSubmitting = false;
  passCode = '';

  formData = {
    name: '',
    email: '',
    phone: '',
    organization: '',
    designation: '',
    sector: 'CentralMinistry',
    mode: 'in-person',
    agree: true
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const eventId = params['eventId'] || params['id'];
      if (eventId && this.eventsCatalog[eventId]) {
        this.currentEvent = this.eventsCatalog[eventId];
      } else if (params['title']) {
        this.currentEvent = {
          id: 'custom-event',
          tag: params['tag'] || 'GOVERNMENT OF INDIA CONCLAVE',
          title: params['title'],
          date: params['date'] || 'Upcoming Session 2026',
          time: params['time'] || '10:30 am IST',
          location: params['location'] || 'Vigyan Bhawan, New Delhi',
          type: params['type'] || 'National Briefing',
          description: params['description'] || 'Official Government of India session on budget utilization and expenditure telemetry.',
          imageUrl: params['imageUrl'] || '/assets/national-event.jpg',
          agenda: [
            'National Budget Telemetry & Fiscal Run-rate Oversight',
            'Inter-State Grant Flow Disbursal Benchmarks',
            'District Level Public Verification & Grievance Redressal'
          ],
          speakers: [
            { name: 'Senior Treasury Representative', title: 'Joint Secretary', org: 'Ministry of Finance' }
          ]
        };
      }
    });
  }

  handleRegister() {
    if (!this.formData.name || !this.formData.email || !this.formData.organization) {
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitted = true;
      const rand = Math.floor(1000 + Math.random() * 9000);
      this.passCode = `GOI-CONF-2026-${rand}`;
    }, 700);
  }

  printPass() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
