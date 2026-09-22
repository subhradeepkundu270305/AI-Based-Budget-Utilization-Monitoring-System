import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HoverTiltDirective } from '../../shared/hover-tilt.directive';

export interface EventItem {
  id: string;
  tag: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  type: string;
  description: string;
  imageUrl: string;
  linkText?: string;
}

export interface TopicItem {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  resourceCount: number;
}

export interface InsightItem {
  id: string;
  category: string;
  title: string;
  date: string;
  author: string;
  imageUrl: string;
  readTime: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HoverTiltDirective],
  template: `
    <div class="home-container animate-fade-in">

      <!-- ══════════════════════════════════════════════════════════
           1. HERO SECTION & SIDE-BY-SIDE SCROLLING CAROUSEL
      ══════════════════════════════════════════════════════════ -->
      <section class="hero-section">
        <!-- Top Institutional Header Headline (100% India-Centric) -->
        <div class="hero-top-bar">
          <div class="hero-tagline-wrap">
            <span class="pulse-chip">
              <span class="pulse-dot"></span>
              GOVERNMENT OF INDIA &bull; PUBLIC FINANCIAL MANAGEMENT SYSTEM (PFMS)
            </span>
            <h1 class="hero-headline">
              <span class="highlight-serif">AI-Based Budget Utilization Monitoring System</span> ensures public funds reach every citizen across India.
            </h1>
            <p class="hero-subtext">
              Transforming Union and State budget allocations into verifiable outcomes through automated PFMS telemetry synchronization, predictive expenditure pacing, and proactive anomaly detection across all 36 States &amp; Union Territories.
            </p>
          </div>

          <!-- Quick Navigation Link to Operational Dashboard -->
          <div class="hero-quick-ctas">
            <a routerLink="/dashboard" class="btn-hero-primary" title="Go to Operational Telemetry Dashboard">
              <span>Access Monitoring Dashboard</span>
              <span class="btn-arrow">→</span>
            </a>
            <a [routerLink]="['/event-register']" [queryParams]="{ eventId: 'slide-2' }" class="btn-hero-secondary">
              <span>Register for National Conclave</span>
            </a>
          </div>
        </div>

        <!-- Side-by-Side Scrolling Carousel Container -->
        <div class="carousel-viewport" (mouseenter)="pauseCarousel()" (mouseleave)="resumeCarousel()">
          <!-- Left Chevron Button -->
          <button class="carousel-nav-btn prev-btn" (click)="prevSlide()" aria-label="Previous slide" title="Previous event">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <!-- Slides Track with Side-by-Side Overflow -->
          <div class="carousel-track-wrapper">
            <div class="carousel-track" [style.transform]="getTrackTransform()">
              <div 
                *ngFor="let slide of carouselSlides; let i = index" 
                class="carousel-card-wrap"
                [class.active-card]="i === currentSlideIndex"
                [class.prev-card]="i === getPrevIndex()"
                [class.next-card]="i === getNextIndex()"
                (click)="onCardClick(i)"
              >
                <div class="carousel-card">
                  <!-- Background Event Image -->
                  <div class="card-bg-image" [style.backgroundImage]="'url(' + slide.imageUrl + ')'">
                    <div class="card-gradient-overlay"></div>
                  </div>

                  <!-- Floating Event Overlay Card Content (Bottom-Left) -->
                  <div class="card-content-overlay">
                    <span class="card-tag">{{ slide.tag }}</span>
                    <h2 class="card-title">{{ slide.title }}</h2>
                    <p class="card-desc">{{ slide.description }}</p>

                    <div class="card-action-row">
                      <a [routerLink]="['/event-register']" [queryParams]="{ eventId: slide.id }" class="btn-report-view" (click)="$event.stopPropagation()">
                        <span>{{ slide.linkText || 'REGISTER FOR BRIEFING' }}</span>
                        <span class="btn-arrow">→</span>
                      </a>
                      <a routerLink="/blog" class="btn-outline-text" (click)="$event.stopPropagation()">
                        <span>View Details</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Chevron Button -->
          <button class="carousel-nav-btn next-btn" (click)="nextSlide()" aria-label="Next slide" title="Next event">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Carousel Indicators / Dot Pills -->
        <div class="carousel-indicators">
          <button 
            *ngFor="let s of carouselSlides; let i = index" 
            class="indicator-pill" 
            [class.active]="i === currentSlideIndex"
            (click)="goToSlide(i)"
            [attr.aria-label]="'Go to slide ' + (i + 1)"
          ></button>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           2. ABOUT SECTION (100% India-Centric)
      ══════════════════════════════════════════════════════════ -->
      <section class="about-section">
        <div class="about-grid">
          <!-- Left Column: Multi-Photo Mosaic Grid -->
          <div class="about-photo-mosaic">
            <div class="photo-main-wrap">
              <img 
                src="/assets/mosaic-top.jpg" 
                alt="Gram Panchayat public audit hearings"
                class="mosaic-photo photo-top"
                loading="lazy"
              />
              <div class="photo-caption-badge">Gram Panchayat Public Hearings &bull; District-Level Verification</div>
            </div>
            <div class="photo-bottom-row">
              <div class="photo-thumb-wrap">
                <img 
                  src="/assets/mosaic-left.jpg" 
                  alt="State Treasury finance officer monitoring expenditure"
                  class="mosaic-photo photo-left"
                  loading="lazy"
                />
              </div>
              <div class="photo-thumb-wrap">
                <img 
                  src="/assets/mosaic-right.jpg" 
                  alt="Anganwadi & rural primary health clinic funding tracking"
                  class="mosaic-photo photo-right"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Institutional Narrative & Stats -->
          <div class="about-narrative">
            <span class="about-eyebrow">ABOUT THE PLATFORM</span>
            <h2 class="about-heading">
              Strengthening Fiscal Accountability &amp; Budget Transparency in India
            </h2>
            <p class="about-lead">
              We partner with the Ministry of Finance, State Treasuries, and public monitoring agencies across all 36 States &amp; Union Territories to ensure every rupee of public expenditure creates verifiable ground impact.
            </p>
            <p class="about-body">
              Powered by real-time Public Financial Management System (PFMS) data feeds, our platform monitors ₹16.03 Lakh Crore in Union and State budget allocations. We identify under-utilization, flag unnatural spending spikes, and democratize fiscal data for policy-makers, researchers, and citizens across India.
            </p>

            <!-- Impact Metrics -->
            <div class="about-metrics-row">
              <div class="metric-box">
                <span class="metric-num">36</span>
                <span class="metric-label">States &amp; UTs Fully Integrated</span>
              </div>
              <div class="metric-box">
                <span class="metric-num">₹16.03L Cr</span>
                <span class="metric-label">Union &amp; State Allocations Tracked</span>
              </div>
              <div class="metric-box">
                <span class="metric-num">780+</span>
                <span class="metric-label">Districts Telemetry-Mapped</span>
              </div>
            </div>

            <!-- Join Our Events CTA -->
            <div class="about-cta-row">
              <button class="btn-orange-cta" (click)="openRegisterModal(carouselSlides[1])">
                <span>JOIN NATIONAL BRIEFINGS</span>
                <span class="cta-arrow">→</span>
              </button>
              <a routerLink="/blog" class="link-learn-more">
                Explore India Fiscal Framework ➔
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           3. INDIA BUDGET TRANSPARENCY & OVERSIGHT REVIEW 2025
      ══════════════════════════════════════════════════════════ -->
      <section class="obs-teal-section">
        <div class="obs-inner-wrap">
          <!-- Top Row: Survey Title & National Mission Statement -->
          <div class="obs-header-row">
            <div class="obs-title-col">
              <h2 class="obs-main-title">India Budget Transparency Review 2025</h2>
            </div>
            <div class="obs-desc-col">
              <p class="obs-desc-text">
                The National Budget Transparency Review assesses fiscal openness, legislative scrutiny, and district-level fund absorption across India's 36 States &amp; UTs. Track how your state utilizes allocated central grants.
              </p>
              <a routerLink="/reports" class="obs-explore-link">
                <span>Explore State Data</span>
                <span class="link-circle-arrow">➔</span>
              </a>
            </div>
          </div>

          <div class="obs-divider"></div>

          <!-- Featured Resources Banner -->
          <div class="featured-resources-header">
            <span class="featured-tag-label">FEATURED RESEARCH &amp; AUDIT REPORTS</span>
            <a routerLink="/blog" class="featured-view-all">
              <span>View all</span>
              <span class="link-circle-arrow">➔</span>
            </a>
          </div>

          <!-- Large Featured Resource 20-Year Report Card -->
          <div class="featured-resource-card">
            <div class="resource-text-col">
              <span class="commemorative-tag">ANNUAL NATIONAL ASSESSMENT &bull; FY 2025-26</span>
              <h3 class="resource-card-title">
                Two Decades of Public Financial Management: Accelerating Expenditure Velocity and Eliminating Intermediary Leakages in India
              </h3>
              <p class="resource-card-body">
                Since the introduction of outcome budgeting and the nationwide expansion of the Public Financial Management System (PFMS), India's public finance architecture has modernized rapidly. With ₹4.2 Lakh Crore disbursed annually through Aadhaar-enabled Direct Benefit Transfers, transparency has reached unprecedented heights while automated anomaly checks safeguard public exchequer integrity.
              </p>

              <div class="resource-stats-strip">
                <div class="res-stat-pill">
                  <span class="stat-score">82/100</span>
                  <span class="stat-caption">National Transparency Score</span>
                </div>
                <div class="res-stat-pill">
                  <span class="stat-score">78/100</span>
                  <span class="stat-caption">Digital DBT Directness Score</span>
                </div>
                <div class="res-stat-pill">
                  <span class="stat-score">91/100</span>
                  <span class="stat-caption">CAG Audit Oversight Score</span>
                </div>
              </div>

              <div class="resource-links-row">
                <a routerLink="/blog" class="btn-teal-explore">
                  <span>Explore the Interactive Data</span>
                  <span class="link-circle-arrow">➔</span>
                </a>
                <a [routerLink]="['/event-register']" [queryParams]="{ eventId: 'slide-4' }" class="btn-briefing-pill">
                  <span>Download Executive Deck &amp; Register</span>
                </a>
              </div>
            </div>

            <!-- Right Graphic: Isometric Fiscal Accountability Wheels -->
            <div class="resource-graphic-col">
              <div class="isometric-illustration-box">
                <svg class="iso-svg" viewBox="0 0 460 380" fill="none">
                  <defs>
                    <linearGradient id="gearGradTeal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#2DD4BF" />
                      <stop offset="100%" stop-color="#0F766E" />
                    </linearGradient>
                    <linearGradient id="gearGradIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#34D399" />
                      <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                    <linearGradient id="accentYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FDE047" />
                      <stop offset="100%" stop-color="#EAB308" />
                    </linearGradient>
                  </defs>

                  <!-- Roads & Infrastructure Base -->
                  <path d="M40 320 L230 220 L420 320 L230 420 Z" fill="#0A3F4C" opacity="0.6"/>
                  <path d="M70 290 L230 200 L390 290" stroke="#14B8A6" stroke-width="3" stroke-dasharray="8 6" opacity="0.4"/>

                  <!-- Left Interlocking Gear: Transparency (Spins cleanly in place) -->
                  <g transform="translate(150, 230)">
                    <g class="gear-spin-clockwise">
                      <circle r="72" fill="url(#gearGradTeal)" />
                      <circle r="42" fill="#073B4C" />
                      <circle r="18" fill="#14B8A6" />
                      <rect x="-10" y="-86" width="20" height="14" rx="4" fill="#2DD4BF"/>
                      <rect x="-10" y="72" width="20" height="14" rx="4" fill="#2DD4BF"/>
                      <rect x="-86" y="-10" width="14" height="20" rx="4" fill="#2DD4BF"/>
                      <rect x="72" y="-10" width="14" height="20" rx="4" fill="#2DD4BF"/>
                      <rect x="-60" y="-60" width="18" height="18" rx="4" fill="#2DD4BF" transform="rotate(45)"/>
                      <rect x="42" y="42" width="18" height="18" rx="4" fill="#2DD4BF" transform="rotate(45)"/>
                      <text x="0" y="5" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="bold">TRANSPARENCY</text>
                    </g>
                  </g>

                  <!-- Right Interlocking Gear: Participation & PFMS (Spins cleanly in place) -->
                  <g transform="translate(290, 180)">
                    <g class="gear-spin-counter">
                      <circle r="65" fill="url(#gearGradIndigo)" />
                      <circle r="36" fill="#073B4C" />
                      <circle r="14" fill="#34D399" />
                      <rect x="-8" y="-76" width="16" height="12" rx="3" fill="#34D399"/>
                      <rect x="-8" y="64" width="16" height="12" rx="3" fill="#34D399"/>
                      <rect x="-76" y="-8" width="12" height="16" rx="3" fill="#34D399"/>
                      <rect x="64" y="-8" width="12" height="16" rx="3" fill="#34D399"/>
                      <text x="0" y="4" text-anchor="middle" fill="#FFFFFF" font-size="10" font-weight="bold">PFMS TELEMETRY</text>
                    </g>
                  </g>

                  <!-- Floating Citizens, Documents and Data Buildings -->
                  <rect x="240" y="80" width="80" height="42" rx="6" fill="url(#accentYellow)" />
                  <rect x="250" y="88" width="18" height="14" rx="2" fill="#0A3F4C" />
                  <rect x="274" y="88" width="18" height="14" rx="2" fill="#0A3F4C" />
                  <circle cx="258" cy="126" r="6" fill="#1E293B" />
                  <circle cx="304" cy="126" r="6" fill="#1E293B" />

                  <!-- Floating Audit Paper / Chart -->
                  <g transform="translate(60, 100)">
                    <rect width="65" height="85" rx="5" fill="#FFFFFF" opacity="0.9" />
                    <line x1="12" y1="20" x2="53" y2="20" stroke="#0F766E" stroke-width="4" stroke-linecap="round"/>
                    <line x1="12" y1="34" x2="45" y2="34" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
                    <line x1="12" y1="46" x2="50" y2="46" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
                    <line x1="12" y1="58" x2="38" y2="58" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="48" cy="68" r="8" fill="#10B981" />
                    <path d="M44 68 L47 71 L53 64" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
                  </g>

                  <!-- Advocate Figures -->
                  <circle cx="190" cy="120" r="10" fill="#F8FAFC" />
                  <path d="M180 145 C180 135 200 135 200 145 Z" fill="#2DD4BF" />

                  <circle cx="360" cy="140" r="9" fill="#F8FAFC" />
                  <path d="M352 162 C352 152 368 152 368 162 Z" fill="#F59E0B" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           4. KEY TOPICS SECTION (100% India-Centric)
      ══════════════════════════════════════════════════════════ -->
      <section class="key-topics-section">
        <div class="topics-inner-wrap">
          <div class="topics-header-row">
            <h2 class="topics-title">Key Priority Sectors</h2>
            <div class="topics-intro-col">
              <p class="topics-intro-text">
                Explore deep dives into India's highest allocated central schemes, state absorption trajectories, and district-level social infrastructure funding.
              </p>
              <a routerLink="/blog" class="topics-view-all">
                <span>View all</span>
                <span class="link-circle-arrow">➔</span>
              </a>
            </div>
          </div>

          <!-- 3-Column Topic Cards -->
          <div class="topics-grid">
            <!-- Topic 1: Primary & Maternal Healthcare -->
            <div class="topic-card" appHoverTilt routerLink="/blog">
              <div class="topic-img-frame">
                <img 
                  src="/assets/healthcare-nhm.jpg" 
                  alt="National Health Mission clinic"
                  class="topic-img"
                  loading="lazy"
                />
              </div>
              <div class="topic-body">
                <h3 class="topic-name">Primary &amp; Maternal Healthcare (NHM)</h3>
                <p class="topic-desc">Tracking National Health Mission grants, Janani Suraksha allocations, and district hospital supply chains across Uttar Pradesh, Bihar, and Rajasthan.</p>
                <span class="topic-link">
                  <span>Explore scheme telemetry</span>
                  <span class="link-circle-arrow">➔</span>
                </span>
              </div>
            </div>

            <!-- Topic 2: Direct Benefit Transfers & Rural Connectivity -->
            <div class="topic-card" appHoverTilt routerLink="/blog">
              <div class="topic-img-frame">
                <img 
                  src="/assets/pmgsy-roads.jpg" 
                  alt="Rural road and DBT digital payments"
                  class="topic-img"
                  loading="lazy"
                />
              </div>
              <div class="topic-body">
                <h3 class="topic-name">DBT &amp; Rural Connectivity (PMGSY)</h3>
                <p class="topic-desc">Monitoring ₹4.2L Cr annual DBT pipelines and PMGSY all-weather road construction linking 1.4 lakh remote habitations across all states.</p>
                <span class="topic-link">
                  <span>Explore scheme telemetry</span>
                  <span class="link-circle-arrow">➔</span>
                </span>
              </div>
            </div>

            <!-- Topic 3: Clean Water & Sanitation -->
            <div class="topic-card" appHoverTilt routerLink="/blog">
              <div class="topic-img-frame">
                <img 
                  src="/assets/jal-jeevan-water.jpg" 
                  alt="Jal Jeevan Mission drinking water pipeline"
                  class="topic-img"
                  loading="lazy"
                />
              </div>
              <div class="topic-body">
                <h3 class="topic-name">Drinking Water (Jal Jeevan Mission)</h3>
                <p class="topic-desc">Algorithmic expenditure tracking for functional household tap water connections across 6 lakh villages and state implementation agencies.</p>
                <span class="topic-link">
                  <span>Explore scheme telemetry</span>
                  <span class="link-circle-arrow">➔</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           5. LATEST INSIGHTS & LATEST EVENT SECTION (100% India-Centric)
      ══════════════════════════════════════════════════════════ -->
      <section class="insights-events-section">
        <div class="insights-events-wrap">
          <!-- Left 3 Columns: LATEST INSIGHTS -->
          <div class="insights-block">
            <div class="insights-header-row">
              <h2 class="insights-title">LATEST FISCAL INSIGHTS</h2>
              <a routerLink="/blog" class="insights-view-more">
                <span>View more</span>
                <span class="link-circle-arrow">➔</span>
              </a>
            </div>

            <div class="insights-cards-row">
              <!-- Insight 1 -->
              <article class="insight-card" routerLink="/blog">
                <div class="insight-thumb-box">
                  <img 
                    src="/assets/dbt-transfer.jpg" 
                    alt="Direct benefit transfer in rural India"
                    class="insight-thumb-img"
                    loading="lazy"
                  />
                </div>
                <div class="insight-content">
                  <h3 class="insight-headline">The Evolution of Direct Benefit Transfers: Eliminating Ghost Intermediaries in Rural Welfare</h3>
                  <div class="insight-date">SEP 15, 2026</div>
                  <div class="insight-authors">Dr. Rajeshwar Sharma, NITI Aayog Senior Fellow</div>
                </div>
              </article>

              <!-- Insight 2 -->
              <article class="insight-card" routerLink="/blog">
                <div class="insight-thumb-box">
                  <img 
                    src="/assets/state-capex-infra.jpg" 
                    alt="State capital expenditure and infrastructure"
                    class="insight-thumb-img"
                    loading="lazy"
                  />
                </div>
                <div class="insight-content">
                  <h3 class="insight-headline">State Capital Expenditure Velocity: How Maharashtra &amp; Gujarat Maintained 80%+ Absorption</h3>
                  <div class="insight-date">AUG 21, 2026</div>
                  <div class="insight-authors">P. K. Venkataraman, National Institute of Public Finance</div>
                </div>
              </article>

              <!-- Insight 3 -->
              <article class="insight-card" routerLink="/blog">
                <div class="insight-thumb-box">
                  <img 
                    src="/assets/pfms-ai-data.jpg" 
                    alt="AI in public finance and treasury oversight"
                    class="insight-thumb-img"
                    loading="lazy"
                  />
                </div>
                <div class="insight-content">
                  <span class="insight-subtag">PFMS AI OVERSIGHT</span>
                  <h3 class="insight-headline">AI in Public Finance: How Machine Learning Prevents March Rushes and Expenditure Surges in PFMS</h3>
                  <div class="insight-date">AUG 04, 2026</div>
                  <div class="insight-authors">Ananya Sen, Digital India Research Lead</div>
                </div>
              </article>
            </div>
          </div>

          <!-- Right Column: LATEST EVENT -->
          <div class="event-featured-col">
            <div class="event-card-container">
              <span class="event-kicker">LATEST NATIONAL EVENT</span>

              <!-- Event Poster Preview -->
              <div class="event-poster-wrap">
                <img 
                  src="/assets/national-event.jpg" 
                  alt="Vigyan Bhawan national public finance conference"
                  class="event-poster-img"
                  loading="lazy"
                />
                <div class="event-poster-overlay">
                  <span class="event-mode-badge">Hybrid &bull; Vigyan Bhawan &amp; Live Stream</span>
                </div>
              </div>

              <!-- Event Meta & Details -->
              <div class="event-details-body">
                <h3 class="event-main-title">
                  National Workshop: Accelerating State Capital Expenditure &amp; PFMS Integration
                </h3>

                <div class="event-time-block">
                  <div class="event-date-row">
                    <span class="time-icon">📅</span>
                    <strong>Oct 15, 2026</strong>
                  </div>
                  <div class="event-hours-row">
                    <span class="time-icon">⏰</span>
                    <span>10:30 am – 1:00 pm IST</span>
                  </div>
                </div>

                <div class="event-tag-chips">
                  <span class="evt-chip">PFMS 2.0</span>
                  <span class="evt-chip">Union Budget</span>
                  <span class="evt-chip">State Treasuries</span>
                  <span class="evt-chip">Public Works</span>
                </div>

                <!-- Registration Trigger CTA -->
                <a [routerLink]="['/event-register']" [queryParams]="{ eventId: 'featured-national-workshop' }" class="btn-register-event">
                  <span>Register for This Event</span>
                  <span class="btn-arrow">→</span>
                </a>

                <div class="event-view-all-row">
                  <a [routerLink]="['/event-register']" class="event-view-all-link">
                    <span>Register / View all Events</span>
                    <span class="link-circle-arrow">➔</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           6. COMPACT EVENT REGISTRATION MODAL (FITS IN ACTIVE VIEWPORT)
      ══════════════════════════════════════════════════════════ -->
      <div 
        *ngIf="isRegisterModalOpen" 
        class="modal-backdrop animate-fade-in" 
        (click)="closeRegisterModal()"
      >
        <div class="modal-dialog-glass" (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-badge-row">
              <span class="modal-icon-badge">🎟️</span>
              <span class="modal-kicker">OFFICIAL EVENT REGISTRATION</span>
            </div>
            <button class="modal-close-btn" (click)="closeRegisterModal()" aria-label="Close dialog">✕</button>
          </div>

          <!-- Event Summary Strip (Compact) -->
          <div class="modal-event-summary" *ngIf="selectedEvent">
            <div class="summary-info">
              <span class="summary-tag">{{ selectedEvent.tag }}</span>
              <h4 class="summary-title">{{ selectedEvent.title }}</h4>
              <div class="summary-time">📅 {{ selectedEvent.date }} &bull; 📍 {{ selectedEvent.location }}</div>
            </div>
          </div>

          <!-- Registration State 1: Compact Input Form -->
          <form *ngIf="!registrationSuccess" (ngSubmit)="submitRegistration()" class="registration-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Full Name <span class="required">*</span></label>
                <input 
                  type="text" 
                  class="form-input" 
                  name="attendeeName"
                  [(ngModel)]="regForm.name" 
                  required 
                  placeholder="e.g. Dr. Rajeshwar Sharma" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Official / Work Email <span class="required">*</span></label>
                <input 
                  type="email" 
                  class="form-input" 
                  name="attendeeEmail"
                  [(ngModel)]="regForm.email" 
                  required 
                  placeholder="name@gov.in or officer@nic.in" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Organization / Ministry <span class="required">*</span></label>
                <input 
                  type="text" 
                  class="form-input" 
                  name="attendeeOrg"
                  [(ngModel)]="regForm.organization" 
                  required 
                  placeholder="Ministry of Finance / State Treasury" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Sector / Jurisdiction</label>
                <select class="form-select" name="attendeeCountry" [(ngModel)]="regForm.country">
                  <option value="CentralMinistry">Central Ministry / Department</option>
                  <option value="StateTreasury">State Finance &amp; Treasury Directorate</option>
                  <option value="DistrictAdmin">District Collectorate / Administration</option>
                  <option value="Academia">Academic &amp; Research Institute (NIPFP, IIT, IIM)</option>
                  <option value="CivilSociety">Civil Society / Civic Auditor</option>
                  <option value="Other">Other Public Sector Enterprise</option>
                </select>
              </div>
            </div>

            <div class="form-row mode-row">
              <div class="form-group full-width">
                <label class="form-label">Attendance Preference</label>
                <div class="radio-pill-group">
                  <label class="radio-pill" [class.selected]="regForm.mode === 'virtual'">
                    <input type="radio" name="attendMode" value="virtual" [(ngModel)]="regForm.mode" />
                    <span>Virtual (Live Webcast &amp; Zoom)</span>
                  </label>
                  <label class="radio-pill" [class.selected]="regForm.mode === 'in-person'">
                    <input type="radio" name="attendMode" value="in-person" [(ngModel)]="regForm.mode" />
                    <span>In-Person Delegation (New Delhi)</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Opt-in Checkbox -->
            <label class="checkbox-label">
              <input type="checkbox" name="receiveDeck" [(ngModel)]="regForm.receiveDeck" />
              <span>Receive verified presentation deck, PFMS telemetry digest, and live recording.</span>
            </label>

            <!-- Submit Button -->
            <div class="modal-footer-row">
              <button type="button" class="btn-cancel" (click)="closeRegisterModal()">Cancel</button>
              <button 
                type="submit" 
                class="btn-confirm-reg" 
                [disabled]="!regForm.name || !regForm.email || !regForm.organization || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner"></span>
                <span>{{ isSubmitting ? 'Confirming…' : 'Complete Registration' }}</span>
                <span *ngIf="!isSubmitting">→</span>
              </button>
            </div>
          </form>

          <!-- Registration State 2: Verified Success Receipt Badge -->
          <div *ngIf="registrationSuccess" class="success-ticket-receipt animate-fade-in">
            <div class="ticket-header">
              <div class="ticket-check-circle">✓</div>
              <h3>Registration Confirmed!</h3>
              <p class="ticket-subtitle">Your digital access pass and calendar invite have been generated.</p>
            </div>

            <div class="pass-card">
              <div class="pass-row">
                <span class="pass-lbl">DELEGATE:</span>
                <span class="pass-val">{{ regForm.name }}</span>
              </div>
              <div class="pass-row">
                <span class="pass-lbl">ORGANIZATION:</span>
                <span class="pass-val">{{ regForm.organization }}</span>
              </div>
              <div class="pass-row">
                <span class="pass-lbl">EVENT:</span>
                <span class="pass-val">{{ selectedEvent?.title }}</span>
              </div>
              <div class="pass-row">
                <span class="pass-lbl">PASS CODE:</span>
                <span class="pass-code">{{ confirmedPassCode }}</span>
              </div>
              <div class="pass-row">
                <span class="pass-lbl">MODE:</span>
                <span class="pass-val">{{ regForm.mode === 'virtual' ? 'Virtual Webcast' : 'In-Person Delegation' }}</span>
              </div>
            </div>

            <div class="ticket-actions">
              <button class="btn-done" (click)="closeRegisterModal()">Done &bull; Return to Home</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════
       SOVEREIGN FISCAL THEME (TEAL, EMERALD & SAFFRON ACCENTS)
    ═══════════════════════════════════════════════════════ */
    :host {
      display: block;
      width: 100%;
    }

    .home-container {
      width: 100%;
      background: #F8FAFC;
      color: #0F172A;
      overflow-x: hidden;
    }

    /* ══ 1. HERO & SIDE-BY-SIDE CAROUSEL ══ */
    .hero-section {
      padding: 40px 0 60px;
      background: linear-gradient(180deg, rgba(240, 253, 250, 0.7) 0%, rgba(248, 250, 252, 1) 100%);
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
      position: relative;
    }

    .hero-top-bar {
      max-width: 1400px;
      margin: 0 auto 36px;
      padding: 0 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 32px;
    }

    .hero-tagline-wrap {
      max-width: 820px;
    }

    .pulse-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 14px;
      background: rgba(13, 148, 136, 0.1);
      border: 1px solid rgba(13, 148, 136, 0.25);
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 800;
      color: #0F766E;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10B981;
      animation: pulseGreen 1.5s infinite;
    }

    .hero-headline {
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1.25;
      color: #083E48;
      letter-spacing: -0.025em;
      margin: 0 0 16px;
    }

    .highlight-serif {
      font-family: inherit;
      background: linear-gradient(135deg, #0D9488, #059669);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }

    .hero-subtext {
      font-size: 1.05rem;
      line-height: 1.6;
      color: #475569;
      margin: 0;
    }

    .hero-quick-ctas {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 13px 26px;
      background: linear-gradient(135deg, #0D9488, #083E48);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.94rem;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 6px 20px rgba(13, 148, 136, 0.32);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
    }

    .btn-hero-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(13, 148, 136, 0.42);
    }

    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 11px 22px;
      background: rgba(255, 255, 255, 0.9);
      border: 1.5px solid rgba(13, 148, 136, 0.3);
      color: #0F766E;
      font-weight: 600;
      font-size: 0.88rem;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-hero-secondary:hover {
      background: #FFFFFF;
      border-color: #0D9488;
      color: #0D9488;
      transform: translateY(-1px);
    }

    /* Side-by-Side Carousel Viewport */
    .carousel-viewport {
      position: relative;
      width: 100%;
      overflow: hidden;
      padding: 10px 0 20px;
    }

    .carousel-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      border: 1.5px solid rgba(13, 148, 136, 0.3);
      color: #083E48;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 20;
      box-shadow: 0 6px 20px rgba(8, 62, 72, 0.15);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .carousel-nav-btn:hover {
      background: #0D9488;
      color: #FFFFFF;
      border-color: #0D9488;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 8px 25px rgba(13, 148, 136, 0.35);
    }

    .prev-btn { left: 24px; }
    .next-btn { right: 24px; }

    .carousel-track-wrapper {
      width: 100%;
      overflow: visible;
    }

    .carousel-track {
      display: flex;
      transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    .carousel-card-wrap {
      flex: 0 0 70%;
      max-width: 70%;
      padding: 0 14px;
      box-sizing: border-box;
      opacity: 0.55;
      transform: scale(0.95);
      transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .carousel-card-wrap.active-card {
      opacity: 1;
      transform: scale(1);
      cursor: default;
    }

    .carousel-card {
      position: relative;
      height: 480px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 45px rgba(8, 62, 72, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.9);
    }

    .card-bg-image {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      transition: transform 0.8s ease;
    }

    .carousel-card:hover .card-bg-image {
      transform: scale(1.03);
    }

    .card-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(8, 62, 72, 0.1) 0%, rgba(8, 62, 72, 0.85) 100%);
    }

    .card-content-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 40px;
      color: #FFFFFF;
      max-width: 760px;
    }

    .card-tag {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #5EEAD4;
      background: rgba(13, 148, 136, 0.35);
      border: 1px solid rgba(45, 212, 191, 0.5);
      padding: 4px 12px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 12px;
      backdrop-filter: blur(8px);
    }

    .card-title {
      font-size: 1.85rem;
      font-weight: 800;
      line-height: 1.25;
      color: #FFFFFF;
      margin: 0 0 10px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }

    .card-desc {
      font-size: 0.96rem;
      line-height: 1.5;
      color: #CCFBF1;
      margin: 0 0 20px;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-action-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-report-view {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      background: #0D9488;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.86rem;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4);
      transition: all 0.2s ease;
    }

    .btn-report-view:hover {
      background: #0F766E;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.5);
    }

    .btn-outline-text {
      color: #E2E8F0;
      font-weight: 600;
      font-size: 0.88rem;
      text-decoration: none;
      transition: color 0.2s;
    }

    .btn-outline-text:hover {
      color: #5EEAD4;
      text-decoration: underline;
    }

    .carousel-indicators {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
    }

    .indicator-pill {
      width: 32px;
      height: 5px;
      background: rgba(13, 148, 136, 0.25);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }

    .indicator-pill.active {
      width: 50px;
      background: #0D9488;
    }

    /* ══ 2. ABOUT SECTION ══ */
    .about-section {
      padding: 90px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
    }

    .about-photo-mosaic {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .photo-main-wrap {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(8, 62, 72, 0.12);
    }

    .mosaic-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }

    .photo-top {
      height: 290px;
    }

    .photo-main-wrap:hover .mosaic-photo {
      transform: scale(1.03);
    }

    .photo-caption-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      background: rgba(8, 62, 72, 0.88);
      backdrop-filter: blur(10px);
      color: #FFFFFF;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid rgba(45, 212, 191, 0.3);
    }

    .photo-bottom-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .photo-thumb-wrap {
      height: 170px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 24px rgba(8, 62, 72, 0.1);
    }

    .photo-thumb-wrap:hover .mosaic-photo {
      transform: scale(1.05);
    }

    .about-eyebrow {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0D9488;
      text-transform: uppercase;
      display: block;
      margin-bottom: 12px;
    }

    .about-heading {
      font-size: 2.1rem;
      font-weight: 800;
      line-height: 1.25;
      color: #083E48;
      margin: 0 0 20px;
      letter-spacing: -0.02em;
    }

    .about-lead {
      font-size: 1.05rem;
      font-weight: 600;
      line-height: 1.6;
      color: #334155;
      margin: 0 0 16px;
    }

    .about-body {
      font-size: 0.94rem;
      line-height: 1.65;
      color: #64748B;
      margin: 0 0 32px;
    }

    .about-metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 36px;
      background: #F0FDFA;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid rgba(13, 148, 136, 0.2);
    }

    .metric-box {
      display: flex;
      flex-direction: column;
    }

    .metric-num {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0D9488;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 0.76rem;
      color: #475569;
      font-weight: 600;
      line-height: 1.35;
    }

    .about-cta-row {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .btn-orange-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 13px 26px;
      background: linear-gradient(135deg, #EA580C, #C2410C);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.88rem;
      letter-spacing: 0.04em;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);
      transition: all 0.2s ease;
    }

    .btn-orange-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(234, 88, 12, 0.45);
    }

    .link-learn-more {
      color: #0D9488;
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      transition: color 0.2s;
    }

    .link-learn-more:hover {
      color: #0F766E;
      text-decoration: underline;
    }

    /* ══ 3. INDIA BUDGET TRANSPARENCY SECTION ══ */
    .obs-teal-section {
      background: linear-gradient(180deg, #083E48 0%, #05282F 100%);
      color: #FFFFFF;
      padding: 90px 32px;
      border-top: 1px solid rgba(45, 212, 191, 0.2);
      border-bottom: 1px solid rgba(45, 212, 191, 0.2);
    }

    .obs-inner-wrap {
      max-width: 1400px;
      margin: 0 auto;
    }

    .obs-header-row {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 48px;
      align-items: flex-start;
      margin-bottom: 40px;
    }

    .obs-main-title {
      font-size: 2.35rem;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin: 0;
    }

    .obs-desc-text {
      font-size: 1.05rem;
      line-height: 1.65;
      color: #CCFBF1;
      margin: 0 0 16px;
    }

    .obs-explore-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #5EEAD4;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s;
    }

    .obs-explore-link:hover {
      color: #FFFFFF;
      transform: translateX(4px);
    }

    .obs-divider {
      height: 1px;
      background: rgba(45, 212, 191, 0.2);
      margin-bottom: 40px;
    }

    .featured-resources-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .featured-tag-label {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #5EEAD4;
      text-transform: uppercase;
    }

    .featured-view-all {
      color: #CCFBF1;
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s;
    }

    .featured-view-all:hover {
      color: #FFFFFF;
    }

    .featured-resource-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(45, 212, 191, 0.25);
      border-radius: 24px;
      padding: 48px;
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 48px;
      align-items: center;
      backdrop-filter: blur(12px);
    }

    .commemorative-tag {
      font-size: 0.72rem;
      font-weight: 800;
      color: #F59E0B;
      letter-spacing: 0.06em;
      display: block;
      margin-bottom: 12px;
    }

    .resource-card-title {
      font-size: 1.7rem;
      font-weight: 800;
      line-height: 1.3;
      color: #FFFFFF;
      margin: 0 0 16px;
    }

    .resource-card-body {
      font-size: 0.94rem;
      line-height: 1.65;
      color: #CCFBF1;
      margin: 0 0 28px;
    }

    .resource-stats-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
      background: rgba(3, 23, 27, 0.6);
      padding: 18px;
      border-radius: 14px;
      border: 1px solid rgba(45, 212, 191, 0.2);
    }

    .res-stat-pill {
      display: flex;
      flex-direction: column;
    }

    .stat-score {
      font-size: 1.6rem;
      font-weight: 800;
      color: #2DD4BF;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .stat-caption {
      font-size: 0.74rem;
      color: #94A3B8;
      line-height: 1.3;
    }

    .resource-links-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .btn-teal-explore {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #0D9488;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.88rem;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
      transition: all 0.2s ease;
    }

    .btn-teal-explore:hover {
      background: #0F766E;
      transform: translateY(-2px);
    }

    .btn-briefing-pill {
      padding: 11px 22px;
      background: rgba(255, 255, 255, 0.1);
      border: 1.5px solid rgba(45, 212, 191, 0.4);
      color: #FFFFFF;
      font-weight: 600;
      font-size: 0.86rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-briefing-pill:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: #2DD4BF;
    }

    .isometric-illustration-box {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }

    .iso-svg {
      width: 100%;
      max-width: 460px;
      height: auto;
      overflow: visible;
    }

    .gear-spin-clockwise {
      transform-origin: 0px 0px;
      animation: rotateClock 24s linear infinite;
    }

    .gear-spin-counter {
      transform-origin: 0px 0px;
      animation: rotateCounter 24s linear infinite;
    }

    @keyframes rotateClock {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    @keyframes rotateCounter {
      from { transform: rotate(0deg); }
      to   { transform: rotate(-360deg); }
    }

    /* ══ 4. KEY TOPICS SECTION ══ */
    .key-topics-section {
      padding: 90px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .topics-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 32px;
      margin-bottom: 40px;
    }

    .topics-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: #083E48;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .topics-intro-col {
      max-width: 540px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .topics-intro-text {
      font-size: 0.94rem;
      line-height: 1.6;
      color: #64748B;
      margin: 0;
    }

    .topics-view-all {
      color: #0D9488;
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .topics-view-all:hover {
      text-decoration: underline;
    }

    .topics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }

    .topic-card {
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(8, 62, 72, 0.06);
      border: 1px solid rgba(13, 148, 136, 0.15);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .topic-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 36px rgba(13, 148, 136, 0.16);
      border-color: #0D9488;
    }

    .topic-img-frame {
      height: 220px;
      overflow: hidden;
    }

    .topic-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .topic-card:hover .topic-img {
      transform: scale(1.06);
    }

    .topic-body {
      padding: 26px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .topic-name {
      font-size: 1.22rem;
      font-weight: 800;
      color: #083E48;
      margin: 0 0 10px;
    }

    .topic-desc {
      font-size: 0.88rem;
      line-height: 1.6;
      color: #64748B;
      margin: 0 0 20px;
      flex: 1;
    }

    .topic-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #0D9488;
      font-weight: 700;
      font-size: 0.86rem;
      transition: transform 0.2s;
    }

    .topic-card:hover .topic-link {
      transform: translateX(4px);
    }

    /* ══ 5. LATEST INSIGHTS & LATEST EVENT ══ */
    .insights-events-section {
      padding: 90px 32px 110px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .insights-events-wrap {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 48px;
    }

    .insights-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }

    .insights-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: #083E48;
      letter-spacing: 0.04em;
      margin: 0;
    }

    .insights-view-more {
      color: #0D9488;
      font-weight: 700;
      font-size: 0.86rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .insights-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .insight-card {
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(8, 62, 72, 0.04);
      border: 1px solid rgba(13, 148, 136, 0.15);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .insight-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(13, 148, 136, 0.14);
      border-color: #0D9488;
    }

    .insight-thumb-box {
      height: 160px;
      overflow: hidden;
    }

    .insight-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .insight-card:hover .insight-thumb-img {
      transform: scale(1.05);
    }

    .insight-content {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .insight-subtag {
      font-size: 0.65rem;
      font-weight: 800;
      color: #0D9488;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    .insight-headline {
      font-size: 0.96rem;
      font-weight: 700;
      line-height: 1.4;
      color: #0F172A;
      margin: 0 0 12px;
      flex: 1;
    }

    .insight-date {
      font-size: 0.72rem;
      font-weight: 700;
      color: #0F766E;
      margin-bottom: 4px;
    }

    .insight-authors {
      font-size: 0.72rem;
      color: #64748B;
      line-height: 1.35;
    }

    /* Right Column: Featured Event Card */
    .event-card-container {
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(8, 62, 72, 0.08);
      border: 1.5px solid rgba(13, 148, 136, 0.2);
      display: flex;
      flex-direction: column;
    }

    .event-kicker {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0D9488;
      text-transform: uppercase;
      padding: 14px 20px;
      background: rgba(240, 253, 250, 0.8);
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
      display: block;
    }

    .event-poster-wrap {
      height: 190px;
      position: relative;
      overflow: hidden;
    }

    .event-poster-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .event-poster-overlay {
      position: absolute;
      bottom: 10px;
      left: 10px;
    }

    .event-mode-badge {
      background: rgba(8, 62, 72, 0.85);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(45, 212, 191, 0.3);
    }

    .event-details-body {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .event-main-title {
      font-size: 1.15rem;
      font-weight: 800;
      line-height: 1.35;
      color: #083E48;
      margin: 0;
    }

    .event-time-block {
      background: #F8FAFC;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.82rem;
      color: #334155;
    }

    .event-tag-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .evt-chip {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #F0FDFA;
      color: #0F766E;
      border: 1px solid rgba(13, 148, 136, 0.2);
    }

    .btn-register-event {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #0D9488, #083E48);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.88rem;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
      transition: all 0.2s ease;
    }

    .btn-register-event:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.4);
    }

    .event-view-all-row {
      text-align: center;
      margin-top: -4px;
    }

    .event-view-all-link {
      font-size: 0.78rem;
      color: #0D9488;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .event-view-all-link:hover {
      text-decoration: underline;
    }

    /* ══ 6. COMPACT REGISTRATION MODAL (FITS COMFORTABLY WITHOUT SCROLL) ══ */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(3, 31, 36, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow-y: auto;
    }

    .modal-dialog-glass {
      width: 100%;
      max-width: 580px;
      background: #FFFFFF;
      color: #0F172A;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
      padding: 24px 28px;
      position: relative;
      animation: modalEntrance 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      margin: auto;
    }

    @keyframes modalEntrance {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #E2E8F0;
    }

    .modal-badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-icon-badge {
      font-size: 1.15rem;
    }

    .modal-kicker {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #083E48;
      text-transform: uppercase;
    }

    .modal-close-btn {
      background: #F1F5F9;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748B;
      transition: all 0.2s;
    }

    .modal-close-btn:hover {
      background: #FFE4E6;
      color: #E11D48;
    }

    .modal-event-summary {
      background: #F0FDFA;
      border: 1px solid rgba(13, 148, 136, 0.25);
      border-radius: 12px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }

    .summary-tag {
      font-size: 0.65rem;
      font-weight: 800;
      color: #0F766E;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }

    .summary-title {
      font-size: 0.92rem;
      font-weight: 800;
      color: #083E48;
      margin: 0 0 2px;
      line-height: 1.25;
    }

    .summary-time {
      font-size: 0.74rem;
      color: #64748B;
    }

    .registration-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: #334155;
    }

    .required {
      color: #E11D48;
    }

    .form-input, .form-select {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1.5px solid #CBD5E1;
      font-size: 0.82rem;
      color: #0F172A;
      background: #FFFFFF;
      transition: all 0.2s;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #0D9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    }

    .radio-pill-group {
      display: flex;
      gap: 8px;
    }

    .radio-pill {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 10px;
      border-radius: 8px;
      background: #F8FAFC;
      border: 1.5px solid #CBD5E1;
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      color: #475569;
      transition: all 0.2s;
    }

    .radio-pill.selected {
      background: #F0FDFA;
      border-color: #0D9488;
      color: #0F766E;
      font-weight: 700;
    }

    .radio-pill input {
      display: none;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.74rem;
      color: #64748B;
      cursor: pointer;
      margin-top: 2px;
    }

    .modal-footer-row {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
    }

    .btn-cancel {
      padding: 8px 16px;
      background: #F1F5F9;
      border: none;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }

    .btn-confirm-reg {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 20px;
      background: linear-gradient(135deg, #0D9488, #083E48);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.84rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      transition: all 0.2s;
    }

    .btn-confirm-reg:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Success State */
    .success-ticket-receipt {
      text-align: center;
      padding: 10px 0;
    }

    .ticket-check-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #10B981;
      color: #FFFFFF;
      font-size: 1.5rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
    }

    .pass-card {
      background: #F8FAFC;
      border: 1.5px dashed rgba(13, 148, 136, 0.4);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
    }

    .pass-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
    }

    .pass-lbl {
      color: #64748B;
      font-weight: 600;
    }

    .pass-val {
      font-weight: 700;
      color: #083E48;
    }

    .pass-code {
      font-family: monospace;
      font-weight: 800;
      color: #0D9488;
      background: #CCFBF1;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .btn-done {
      width: 100%;
      padding: 11px;
      background: #083E48;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.88rem;
      border-radius: 10px;
      border: none;
      cursor: pointer;
    }

    /* ═══════════════════════════════════════════════════════
       RESPONSIVE BREAKPOINTS (LAPTOP, TABLET, MOBILE)
    ═══════════════════════════════════════════════════════ */
    /* Laptop / Small Desktop (1024px - 1280px) */
    @media (max-width: 1280px) {
      .hero-top-bar { padding: 0 24px; gap: 24px; }
      .hero-headline { font-size: 2rem; }
      .carousel-card-wrap { flex: 0 0 80%; max-width: 80%; }
      .about-grid { gap: 40px; }
      .featured-resource-card { padding: 36px; gap: 36px; }
      .topics-grid { gap: 24px; }
      .insights-events-wrap { gap: 32px; }
    }

    /* Tablet Landscape & Portrait (768px - 1024px) */
    @media (max-width: 1024px) {
      .hero-top-bar { flex-direction: column; align-items: flex-start; gap: 20px; }
      .carousel-card-wrap { flex: 0 0 88%; max-width: 88%; }
      .carousel-card { height: 420px; }
      .card-content-overlay { padding: 28px; }
      .card-title { font-size: 1.5rem; }
      .about-grid { grid-template-columns: 1fr; gap: 40px; }
      .photo-top { height: 260px; }
      .obs-header-row { grid-template-columns: 1fr; gap: 20px; }
      .featured-resource-card { grid-template-columns: 1fr; padding: 32px; gap: 28px; }
      .resource-graphic-col { display: flex; justify-content: center; }
      .topics-grid { grid-template-columns: 1fr 1fr; }
      .insights-events-wrap { grid-template-columns: 1fr; }
      .insights-cards-row { grid-template-columns: 1fr 1fr; }
    }

    /* Mobile Phones (< 768px) */
    @media (max-width: 768px) {
      .hero-section { padding: 24px 0 40px; }
      .hero-top-bar { padding: 0 16px; margin-bottom: 24px; }
      .hero-headline { font-size: 1.65rem; }
      .hero-subtext { font-size: 0.92rem; }
      .carousel-card-wrap { flex: 0 0 94%; max-width: 94%; padding: 0 8px; }
      .carousel-card { height: 380px; }
      .card-content-overlay { padding: 20px; }
      .card-title { font-size: 1.3rem; }
      .card-desc { display: none; }
      .carousel-nav-btn { width: 40px; height: 40px; }
      .prev-btn { left: 8px; }
      .next-btn { right: 8px; }
      .about-section { padding: 60px 16px; }
      .about-heading { font-size: 1.65rem; }
      .about-metrics-row { grid-template-columns: 1fr; gap: 12px; }
      .obs-teal-section { padding: 60px 16px; }
      .obs-main-title { font-size: 1.75rem; }
      .featured-resource-card { padding: 22px 18px; }
      .resource-card-title { font-size: 1.35rem; }
      .resource-stats-strip { grid-template-columns: 1fr; gap: 10px; }
      .key-topics-section { padding: 60px 16px; }
      .topics-header-row { flex-direction: column; align-items: flex-start; gap: 12px; }
      .topics-title { font-size: 1.65rem; }
      .topics-grid { grid-template-columns: 1fr; gap: 20px; }
      .insights-events-section { padding: 60px 16px 80px; }
      .insights-cards-row { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; gap: 10px; }
      .radio-pill-group { flex-direction: column; }
      .modal-dialog-glass { padding: 20px 16px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSlideIndex = 2; // Starts with the center slide (Slide 3 of 5)
  private autoSlideTimer: any = null;

  // 100% India-Centric Carousel Slides (5 Total, Starts Centered)
  carouselSlides: EventItem[] = [
    {
      id: 'slide-1',
      tag: 'NATIONAL AUDIT REVIEW 2025/2026',
      title: 'From Sanction to Ground Delivery: Maximizing Capital Expenditure Velocity across States',
      date: 'Sep 28, 2026',
      time: '10:00 am – 1:30 pm IST',
      location: 'Central Secretariat & Virtual Live Webcast',
      type: 'National Flagship Audit',
      description: 'An in-depth fiscal assessment tracking how PFMS automation and DBT pipelines accelerated scheme fund absorption in Health, Jal Jeevan Mission, and Rural Roads across 36 States & UTs.',
      imageUrl: '/assets/carousel-slide-1.jpg',
      linkText: 'VIEW NATIONAL REPORT'
    },
    {
      id: 'slide-2',
      tag: 'UPCOMING NATIONAL CONCLAVE',
      title: 'National Fiscal Conclave: Sub-National Debt Sustainability & Infrastructure Pacing',
      date: 'Oct 15, 2026',
      time: '10:30 am – 1:00 pm IST',
      location: 'Vigyan Bhawan, New Delhi & Virtual',
      type: 'National Inter-State Forum',
      description: 'Bringing together the Ministry of Finance, State Finance Secretaries, and NITI Aayog to streamline inter-governmental grant transfers and curb year-end parking of funds.',
      imageUrl: '/assets/carousel-slide-2.jpg',
      linkText: 'REGISTER FOR CONCLAVE'
    },
    {
      id: 'slide-3',
      tag: 'EXECUTIVE WORKSHOP',
      title: 'AI & Machine Learning in Public Finance: Automated Anomaly Detection in PFMS',
      date: 'Nov 04, 2026',
      time: '10:00 am – 1:30 pm IST',
      location: 'Bengaluru Innovation Hub & Live Webcast',
      type: 'Technical Executive Workshop',
      description: 'Hands-on technical session for Chief Controllers of Accounts and treasury auditors on deploying algorithmic pattern recognition to prevent March rushes and spike vouchers.',
      imageUrl: '/assets/carousel-slide-3.jpg',
      linkText: 'REGISTER FOR WORKSHOP'
    },
    {
      id: 'slide-4',
      tag: 'ANNUAL TRANSPARENCY BENCHMARK',
      title: 'India Budget Transparency & Utilization Review 2025: District Accountability',
      date: 'Nov 20, 2026',
      time: '11:00 am – 2:00 pm IST',
      location: 'India Habitat Centre, New Delhi & Virtual',
      type: 'National Fiscal Benchmark',
      description: 'Comprehensive evaluation of budget transparency, participatory district planning, and legislative oversight covering all 780+ administrative districts and 36 States & UTs.',
      imageUrl: '/assets/carousel-slide-4.jpg',
      linkText: 'REGISTER FOR BRIEFING'
    },
    {
      id: 'slide-5',
      tag: 'FLAGSHIP WELFARE INITIATIVE',
      title: 'Direct Benefit Transfers & Rural Water Grids: Real-Time Telemetry & Zero Leakage',
      date: 'Dec 08, 2026',
      time: '10:30 am – 1:30 pm IST',
      location: 'Vigyan Bhawan, New Delhi & Live Webcast',
      type: 'National Welfare Summit',
      description: 'Reviewing ₹4.2 Lakh Crore annual DBT pipelines and IoT sensor telemetry in Jal Jeevan Mission, ensuring zero leakage across 6 lakh habitations.',
      imageUrl: '/assets/water-grid-banner.jpg',
      linkText: 'REGISTER FOR SUMMIT'
    }
  ];

  featuredEvent: EventItem = {
    id: 'featured-national-workshop',
    tag: 'LATEST NATIONAL EVENT',
    title: 'National Workshop: Accelerating State Capital Expenditure & PFMS Integration',
    date: 'Oct 15, 2026',
    time: '10:30 am – 1:00 pm IST',
    location: 'Vigyan Bhawan, New Delhi & Live Webcast',
    type: 'Hybrid National Event',
    description: 'Special conference co-hosted by the Ministry of Finance and State Budget Directorates exploring real-time expenditure pacing, unspent balance return, and treasury digitization.',
    imageUrl: '/assets/national-event.jpg'
  };

  // Compact Modal State
  isRegisterModalOpen = false;
  selectedEvent: EventItem | null = null;
  isSubmitting = false;
  registrationSuccess = false;
  confirmedPassCode = '';

  regForm = {
    name: '',
    email: '',
    organization: '',
    country: 'CentralMinistry',
    mode: 'virtual',
    receiveDeck: true
  };

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.pauseCarousel();
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  // ══ CAROUSEL LOGIC ══
  startAutoSlide() {
    this.pauseCarousel();
    this.autoSlideTimer = setInterval(() => {
      this.nextSlide();
    }, 6500);
  }

  pauseCarousel() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  resumeCarousel() {
    this.startAutoSlide();
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.carouselSlides.length;
  }

  prevSlide() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.carouselSlides.length) % this.carouselSlides.length;
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
  }

  getPrevIndex(): number {
    return (this.currentSlideIndex - 1 + this.carouselSlides.length) % this.carouselSlides.length;
  }

  getNextIndex(): number {
    return (this.currentSlideIndex + 1) % this.carouselSlides.length;
  }

  onCardClick(index: number) {
    if (index !== this.currentSlideIndex) {
      this.goToSlide(index);
    }
  }

  getTrackTransform(): string {
    const cardWidthPercent = 70;
    const centerOffset = (100 - cardWidthPercent) / 2; // 15%
    const offset = centerOffset - (this.currentSlideIndex * cardWidthPercent);
    return `translateX(${offset}%)`;
  }

  // ══ MODAL LOGIC (COMPACT & VIEWPORT LOCKED) ══
  openRegisterModal(event: EventItem) {
    this.selectedEvent = event;
    this.registrationSuccess = false;
    this.isSubmitting = false;
    this.isRegisterModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
    this.selectedEvent = null;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  submitRegistration() {
    if (!this.regForm.name || !this.regForm.email || !this.regForm.organization) {
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.registrationSuccess = true;
      const randNum = Math.floor(1000 + Math.random() * 9000);
      this.confirmedPassCode = `GOI-CONF-2026-${randNum}`;
    }, 600);
  }
}
