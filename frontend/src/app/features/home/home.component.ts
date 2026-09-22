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

export interface SchemeTelemetry {
  id: string;
  code: string;
  name: string;
  shortName: string;
  ministry: string;
  implementingAgency: string;
  category: string;
  imageUrl: string;
  description: string;
  fyAllocation: string;
  fyAllocationPrev: string;
  expenditureToDate: string;
  utilizationRate: number;
  velocityStatus: 'Optimal' | 'Accelerated' | 'Under Review';
  fundSharingRatio: string;
  physicalKPIs: {
    label: string;
    achieved: string;
    target: string;
    unit: string;
    percentage: number;
    icon: string;
  }[];
  quarterlyPacing: {
    quarter: string;
    targetPct: number;
    actualPct: number;
    amountCr: string;
  }[];
  topStates: { name: string; rate: number; expenditureCr: string }[];
  laggingStates: { name: string; rate: number; expenditureCr: string }[];
  telemetryHighlights: {
    title: string;
    status: 'success' | 'warning' | 'info';
    detail: string;
  }[];
  trackingSystem: string;
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

          <!-- Slides Track with Side-by-Side Overflow (Infinite Circular Loop) -->
          <div class="carousel-track-wrapper">
            <div 
              class="carousel-track" 
              [style.transform]="getTrackTransform()"
              [style.transition]="isTransitionDisabled ? 'none' : 'transform 0.52s cubic-bezier(0.2, 0.9, 0.3, 1)'"
              (transitionend)="onTransitionEnd()"
            >
              <div 
                *ngFor="let slide of displaySlides; let i = index" 
                class="carousel-card-wrap"
                [class.active-card]="i === currentVirtualIndex"
                [class.prev-card]="i === currentVirtualIndex - 1"
                [class.next-card]="i === currentVirtualIndex + 1"
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

        <!-- Carousel Indicators / Dot Pills (Synchronized to Active Real Slide) -->
        <div class="carousel-indicators">
          <button 
            *ngFor="let s of carouselSlides; let i = index" 
            class="indicator-pill" 
            [class.active]="i === getRealIndex()"
            (click)="goToRealSlide(i)"
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
              <a [routerLink]="['/event-register']" [queryParams]="{ eventId: 'national-briefing-2025' }" class="btn-orange-cta">
                <span>JOIN NATIONAL BRIEFINGS</span>
                <span class="cta-arrow">→</span>
              </a>
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

            <!-- Right Graphic: 3D Holographic PFMS Telemetry Core -->
            <div class="resource-graphic-col">
              <div class="hologram-telemetry-stage" appHoverTilt [maxTilt]="10">
                <!-- Ambient Backlight Aura -->
                <div class="holo-ambient-glow"></div>

                <!-- 3D Perspective Scene Canvas -->
                <div class="holo-3d-scene">
                  
                  <!-- Isometric Ground Matrix Plate -->
                  <div class="iso-ground-plane">
                    <div class="ground-grid-matrix"></div>
                    <div class="ground-concentric-pulse p1"></div>
                    <div class="ground-concentric-pulse p2"></div>
                    <div class="ground-concentric-pulse p3"></div>
                    <div class="ground-axis ground-axis-x"></div>
                    <div class="ground-axis ground-axis-y"></div>
                  </div>

                  <!-- Upward Holographic Light Pillar -->
                  <div class="holo-beam-column">
                    <div class="beam-core-glow"></div>
                    <div class="beam-scanlines"></div>
                  </div>

                  <!-- Concentric 3D Gyroscopic Telemetry Rings -->
                  <!-- Ring 1: Outer Governance Ring -->
                  <div class="gyro-ring gyro-ring-outer">
                    <div class="ring-tracker tracker-outer">
                      <span class="satellite-pill">PFMS 2.0 GATEWAY</span>
                    </div>
                    <div class="ring-tracker tracker-outer-opposite">
                      <span class="satellite-beacon-dot"></span>
                    </div>
                  </div>

                  <!-- Ring 2: Middle SNA & APBS Transfer Ring -->
                  <div class="gyro-ring gyro-ring-middle">
                    <div class="ring-tracker tracker-middle">
                      <span class="satellite-pill amber">SNA &bull; APBS</span>
                    </div>
                  </div>

                  <!-- Ring 3: Inner Velocity Ring -->
                  <div class="gyro-ring gyro-ring-inner">
                    <div class="inner-energy-pulse"></div>
                  </div>

                  <!-- Central Floating 3D Fiscal Core -->
                  <div class="holo-central-core">
                    <div class="core-float-wrapper">
                      <div class="core-shield-prism">
                        <div class="core-symbol-wrap">
                          <span class="core-symbol">&#8377;</span>
                        </div>
                        <div class="core-orbital-halo">
                          <span class="dot d1"></span>
                          <span class="dot d2"></span>
                          <span class="dot d3"></span>
                          <span class="dot d4"></span>
                        </div>
                      </div>
                      <div class="core-shadow-ground"></div>
                    </div>
                  </div>

                  <!-- Dynamic SVG Neon Stream Energy Vectors -->
                  <svg class="holo-svg-streams" viewBox="0 0 460 420" fill="none">
                    <defs>
                      <linearGradient id="streamGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#0D9488" stop-opacity="0.1"/>
                        <stop offset="50%" stop-color="#2DD4BF" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#A7F3D0" stop-opacity="1"/>
                      </linearGradient>
                      <linearGradient id="streamGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#059669" stop-opacity="0.1"/>
                        <stop offset="50%" stop-color="#34D399" stop-opacity="0.9"/>
                        <stop offset="100%" stop-color="#6EE7B7" stop-opacity="1"/>
                      </linearGradient>
                      <filter id="neonBeamGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    <!-- Stream 1: To Top-Right DBT Chip -->
                    <path d="M 230 310 C 240 240, 320 220, 345 140" 
                          class="energy-stream-line s1" 
                          stroke="url(#streamGrad1)" 
                          stroke-width="2.2" 
                          stroke-dasharray="10 14" 
                          filter="url(#neonBeamGlow)"/>

                    <!-- Stream 2: To Bottom-Left CAG Chip -->
                    <path d="M 230 310 C 190 280, 110 270, 95 240" 
                          class="energy-stream-line s2" 
                          stroke="url(#streamGrad2)" 
                          stroke-width="2" 
                          stroke-dasharray="8 12" 
                          filter="url(#neonBeamGlow)"/>

                    <!-- Stream 3: To Top-Left Pacing Chip -->
                    <path d="M 230 310 C 210 230, 140 180, 125 110" 
                          class="energy-stream-line s3" 
                          stroke="url(#streamGrad1)" 
                          stroke-width="2" 
                          stroke-dasharray="12 16" 
                          filter="url(#neonBeamGlow)"/>
                  </svg>

                  <!-- 3D Layered Glassmorphic Telemetry HUD Chips (Floating in True Depth) -->
                  
                  <!-- HUD Card 1: Top Right (Z-depth: 55px) -->
                  <div class="hud-chip chip-top-right">
                    <div class="hud-chip-inner">
                      <div class="hud-header">
                        <span class="hud-indicator-dot pulse-teal"></span>
                        <span class="hud-category">LIVE PFMS 2.0 FLOW</span>
                        <span class="hud-badge-green">99.8% APBS</span>
                      </div>
                      <div class="hud-value-row">
                        <span class="hud-primary-val">&#8377;4.20 <small class="unit-cr">Lakh Cr</small></span>
                      </div>
                      <div class="hud-sub-desc">
                        Direct Benefit Transfer &bull; Zero Intermediaries
                      </div>
                      <!-- Live Velocity Wave Bars -->
                      <div class="hud-spark-bars">
                        <span class="bar b1"></span>
                        <span class="bar b2"></span>
                        <span class="bar b3"></span>
                        <span class="bar b4"></span>
                        <span class="bar b5"></span>
                        <span class="bar b6"></span>
                        <span class="bar b7"></span>
                      </div>
                    </div>
                  </div>

                  <!-- HUD Card 2: Bottom Left (Z-depth: 65px) -->
                  <div class="hud-chip chip-bottom-left">
                    <div class="hud-chip-inner">
                      <div class="hud-header">
                        <span class="hud-indicator-dot pulse-emerald"></span>
                        <span class="hud-category">CAG AUDIT SENTINEL</span>
                        <span class="hud-badge-tag">CLEAN PASS</span>
                      </div>
                      <div class="hud-value-row">
                        <span class="hud-primary-val text-emerald">91.4 <small class="unit-cr">/ 100</small></span>
                      </div>
                      <div class="hud-sub-desc">
                        Real-Time Anomaly Interception Across 36 States &amp; UTs
                      </div>
                      <div class="hud-telemetry-micro-tags">
                        <span class="micro-tag">&#10003; 0 Unreconciled</span>
                        <span class="micro-tag">&#10003; Automated Audit</span>
                      </div>
                    </div>
                  </div>

                  <!-- HUD Card 3: Top Left (Z-depth: 40px) -->
                  <div class="hud-chip chip-top-left">
                    <div class="hud-chip-inner">
                      <div class="hud-header">
                        <span class="hud-category">CAPITAL PACING</span>
                        <span class="hud-speed-badge">&#9889; OPTIMAL</span>
                      </div>
                      <div class="hud-value-row">
                        <span class="hud-primary-val text-cyan">82% <small class="unit-cr">Pacing</small></span>
                      </div>
                      <div class="hud-progress-track">
                        <div class="hud-progress-fill"></div>
                      </div>
                      <div class="hud-sub-tiny">Pacing aligned with Q4 targets</div>
                    </div>
                  </div>

                  <!-- HUD Pill 4: Bottom Center Live Ticker (Z-depth: 48px) -->
                  <div class="hud-chip chip-bottom-ticker">
                    <div class="ticker-content">
                      <span class="ticker-live-icon">&#10022;</span>
                      <span class="ticker-text"><strong>4,280 Tx/sec</strong> &bull; 1.28 Billion Aadhaar Validations &bull; Instant Settlement</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           4. KEY PRIORITY SECTORS & SCHEME TELEMETRY (100% India-Centric)
      ══════════════════════════════════════════════════════════ -->
      <section class="key-topics-section">
        <div class="topics-inner-wrap">
          
          <!-- Perfectly Aligned Header Row -->
          <div class="topics-header-row">
            <div class="topics-title-col">
              <span class="topics-eyebrow">CENTRAL BUDGET TELEMETRY &bull; FY 2026-27</span>
              <h2 class="topics-title">Key Priority Sectors</h2>
            </div>
            <div class="topics-intro-col">
              <p class="topics-intro-text">
                Explore deep dives into India's highest allocated central schemes, state absorption trajectories, and district-level social infrastructure funding.
              </p>
              <div class="topics-meta-badge">
                <span class="pulse-indicator"></span>
                <span>Live PFMS Telemetry &bull; 6 Flagship Missions Monitored</span>
              </div>
            </div>
          </div>

          <!-- 6-Card Priority Schemes Grid -->
          <div class="topics-grid">
            <div 
              *ngFor="let scheme of prioritySchemes" 
              class="topic-card" 
              appHoverTilt 
              [maxTilt]="6"
              (click)="openSchemeModal(scheme)"
            >
              <div class="topic-img-frame">
                <img 
                  [src]="scheme.imageUrl" 
                  [alt]="scheme.name"
                  class="topic-img"
                  loading="lazy"
                />
                <span class="scheme-category-badge">{{ scheme.category }}</span>
              </div>
              <div class="topic-body">
                <div class="topic-ministry-tag">{{ scheme.ministry }}</div>
                <h3 class="topic-name">{{ scheme.name }}</h3>
                <p class="topic-desc">{{ scheme.description }}</p>

                <!-- Scheme Telemetry Mini Dashboard Strip -->
                <div class="scheme-mini-metrics">
                  <div class="mini-metric-item">
                    <span class="mini-label">Budget Outlay</span>
                    <strong class="mini-val">{{ scheme.fyAllocation }}</strong>
                  </div>
                  <div class="mini-metric-item">
                    <span class="mini-label">PFMS Absorbed</span>
                    <strong class="mini-val val-teal">{{ scheme.utilizationRate }}%</strong>
                  </div>
                  <div class="mini-metric-item">
                    <span class="mini-label">Pacing</span>
                    <span class="pacing-pill" [ngClass]="getPacingClass(scheme.velocityStatus)">
                      {{ scheme.velocityStatus }}
                    </span>
                  </div>
                </div>

                <div class="scheme-progress-bar-wrap">
                  <div class="scheme-progress-bar-fill" [style.width.%]="scheme.utilizationRate"></div>
                </div>

                <!-- Action Button -->
                <div class="topic-footer-row">
                  <button type="button" class="btn-telemetry-explore" (click)="openSchemeModal(scheme, $event)">
                    <span>Explore Scheme Telemetry</span>
                    <span class="link-circle-arrow">➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           5. LATEST INSIGHTS & LATEST EVENT SECTION (3D ANIMATIONS)
      ══════════════════════════════════════════════════════════ -->
      <section class="insights-events-section">
        <div class="insights-events-wrap">
          <!-- Left 3 Columns: LATEST INSIGHTS with 3D Tilt & Elevation -->
          <div class="insights-block">
            <div class="insights-header-row">
              <h2 class="insights-title">LATEST FISCAL INSIGHTS</h2>
              <a routerLink="/blog" class="insights-view-more">
                <span>View more</span>
                <span class="link-circle-arrow">➔</span>
              </a>
            </div>

            <div class="insights-cards-row">
              <!-- Insight 1 (3D Animated) -->
              <article class="insight-card card-3d" appHoverTilt [maxTilt]="7" routerLink="/blog">
                <div class="insight-thumb-box">
                  <img 
                    src="/assets/dbt-transfer.jpg" 
                    alt="Direct benefit transfer in rural India"
                    class="insight-thumb-img"
                    loading="lazy"
                  />
                  <span class="insight-tag-badge">DIRECT BENEFIT TRANSFER</span>
                </div>
                <div class="insight-content">
                  <h3 class="insight-headline">The Evolution of Direct Benefit Transfers: Eliminating Ghost Intermediaries in Rural Welfare</h3>
                  <div class="insight-date">SEP 15, 2026</div>
                  <div class="insight-authors">Dr. Rajeshwar Sharma, NITI Aayog Senior Fellow</div>
                </div>
              </article>

              <!-- Insight 2 (3D Animated) -->
              <article class="insight-card card-3d" appHoverTilt [maxTilt]="7" routerLink="/blog">
                <div class="insight-thumb-box">
                  <img 
                    src="/assets/state-capex-infra.jpg" 
                    alt="State capital expenditure and infrastructure"
                    class="insight-thumb-img"
                    loading="lazy"
                  />
                  <span class="insight-tag-badge">CAPEX VELOCITY</span>
                </div>
                <div class="insight-content">
                  <h3 class="insight-headline">State Capital Expenditure Velocity: How Maharashtra &amp; Gujarat Maintained 80%+ Absorption</h3>
                  <div class="insight-date">AUG 21, 2026</div>
                  <div class="insight-authors">P. K. Venkataraman, National Institute of Public Finance</div>
                </div>
              </article>

              <!-- Insight 3 (3D Animated) -->
              <article class="insight-card card-3d" appHoverTilt [maxTilt]="7" routerLink="/blog">
                <div class="insight-thumb-box">
                  <img 
                    src="/assets/pfms-ai-data.jpg" 
                    alt="AI in public finance and treasury oversight"
                    class="insight-thumb-img"
                    loading="lazy"
                  />
                  <span class="insight-tag-badge">PFMS AI OVERSIGHT</span>
                </div>
                <div class="insight-content">
                  <h3 class="insight-headline">AI in Public Finance: How Machine Learning Prevents March Rushes and Expenditure Surges in PFMS</h3>
                  <div class="insight-date">AUG 04, 2026</div>
                  <div class="insight-authors">Ananya Sen, Digital India Research Lead</div>
                </div>
              </article>
            </div>
          </div>

          <!-- Right Column: LATEST EVENT (3D Animated) -->
          <div class="event-featured-col">
            <div class="event-card-container card-3d" appHoverTilt [maxTilt]="6">
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
           SCHEME TELEMETRY DEEP-DIVE MODAL (RESEARCH-BACKED METRICS)
      ══════════════════════════════════════════════════════════ -->
      <div 
        *ngIf="isSchemeModalOpen && selectedScheme" 
        class="scheme-modal-backdrop animate-fade-in" 
        (click)="closeSchemeModal()"
      >
        <div class="scheme-modal-glass" (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="scheme-modal-header">
            <div class="scheme-header-info">
              <div class="scheme-code-badge">
                <span class="pulse-indicator"></span>
                <span>PFMS TELEMETRY DEEP DIVE &bull; {{ selectedScheme.code }}</span>
              </div>
              <h2 class="scheme-modal-title">{{ selectedScheme.name }}</h2>
              <div class="scheme-header-sub">
                <span class="scheme-meta-item">🏛️ {{ selectedScheme.ministry }}</span>
                <span class="scheme-meta-sep">&bull;</span>
                <span class="scheme-meta-item">🎯 {{ selectedScheme.implementingAgency }}</span>
                <span class="scheme-meta-sep">&bull;</span>
                <span class="scheme-meta-item tag-sponsored">{{ selectedScheme.category }}</span>
              </div>
            </div>
            <button class="scheme-modal-close" (click)="closeSchemeModal()" aria-label="Close modal">✕</button>
          </div>

          <!-- Top 4 Live Telemetry KPIs -->
          <div class="scheme-kpi-banner">
            <div class="kpi-banner-card">
              <span class="kpi-banner-label">UNION BUDGET OUTLAY (FY 26-27)</span>
              <div class="kpi-banner-value">{{ selectedScheme.fyAllocation }}</div>
              <span class="kpi-banner-sub">Prev FY: {{ selectedScheme.fyAllocationPrev }}</span>
            </div>
            <div class="kpi-banner-card">
              <span class="kpi-banner-label">DISBURSED EXPENDITURE</span>
              <div class="kpi-banner-value val-teal">{{ selectedScheme.expenditureToDate }}</div>
              <span class="kpi-banner-sub">PFMS Authenticated</span>
            </div>
            <div class="kpi-banner-card">
              <span class="kpi-banner-label">EXPENDITURE VELOCITY</span>
              <div class="kpi-banner-value val-emerald">{{ selectedScheme.utilizationRate }}%</div>
              <div class="pacing-badge-row">
                <span class="pacing-pill" [ngClass]="getPacingClass(selectedScheme.velocityStatus)">
                  {{ selectedScheme.velocityStatus }} Pacing
                </span>
              </div>
            </div>
            <div class="kpi-banner-card">
              <span class="kpi-banner-label">CENTRE : STATE SHARE</span>
              <div class="kpi-banner-value">{{ selectedScheme.fundSharingRatio.split(' ')[0] }}</div>
              <span class="kpi-banner-sub">{{ selectedScheme.fundSharingRatio }}</span>
            </div>
          </div>

          <!-- Interactive Deep-Dive Tabs -->
          <div class="scheme-tabs-nav">
            <button 
              type="button" 
              class="scheme-tab-btn" 
              [class.active]="activeSchemeTab === 'kpis'" 
              (click)="activeSchemeTab = 'kpis'"
            >
              <span>📊 Physical Milestones &amp; Ground KPIs</span>
            </button>
            <button 
              type="button" 
              class="scheme-tab-btn" 
              [class.active]="activeSchemeTab === 'pacing'" 
              (click)="activeSchemeTab = 'pacing'"
            >
              <span>📈 Quarterly Pacing Velocity</span>
            </button>
            <button 
              type="button" 
              class="scheme-tab-btn" 
              [class.active]="activeSchemeTab === 'states'" 
              (click)="activeSchemeTab = 'states'"
            >
              <span>🗺️ State Absorption Leaderboard</span>
            </button>
            <button 
              type="button" 
              class="scheme-tab-btn" 
              [class.active]="activeSchemeTab === 'alerts'" 
              (click)="activeSchemeTab = 'alerts'"
            >
              <span>⚡ PFMS Telemetry &amp; AI Alerts</span>
            </button>
          </div>

          <!-- Tab Content Body -->
          <div class="scheme-modal-body">
            
            <!-- TAB 1: PHYSICAL KPIS -->
            <div *ngIf="activeSchemeTab === 'kpis'" class="tab-pane animate-fade-in">
              <div class="pane-headline">
                <h3>Verifiable Physical Deliverables &amp; Infrastructure Milestones</h3>
                <p>Ground delivery metrics tracked through geo-tagged field surveys and digital outcome registers.</p>
              </div>
              <div class="physical-kpi-grid">
                <div *ngFor="let kpi of selectedScheme.physicalKPIs" class="kpi-detail-card">
                  <div class="kpi-top">
                    <span class="kpi-icon">{{ kpi.icon }}</span>
                    <span class="kpi-completion-badge">{{ kpi.percentage }}%</span>
                  </div>
                  <h4 class="kpi-label">{{ kpi.label }}</h4>
                  <div class="kpi-numbers">
                    <strong>{{ kpi.achieved }}</strong>
                    <span class="kpi-target-label">/ target {{ kpi.target }} {{ kpi.unit }}</span>
                  </div>
                  <div class="kpi-bar-track">
                    <div class="kpi-bar-fill" [style.width.%]="kpi.percentage"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: QUARTERLY PACING -->
            <div *ngIf="activeSchemeTab === 'pacing'" class="tab-pane animate-fade-in">
              <div class="pane-headline">
                <h3>Fiscal Pacing Velocity (Actual Disbursed vs Ideal Target)</h3>
                <p>Eliminating March rushes by enforcing quarterly expenditure glide-paths under MoF guidelines.</p>
              </div>
              <div class="pacing-cards-grid">
                <div *ngFor="let pace of selectedScheme.quarterlyPacing" class="pacing-card">
                  <div class="pacing-quarter-badge">{{ pace.quarter }}</div>
                  <div class="pacing-stat-main">
                    <div class="stat-amt">{{ pace.amountCr }}</div>
                    <div class="stat-sub">Actual Disbursed</div>
                  </div>
                  <div class="pacing-comparison">
                    <div class="comp-item">
                      <span>Actual Pacing:</span>
                      <strong class="text-teal">{{ pace.actualPct }}%</strong>
                    </div>
                    <div class="comp-item">
                      <span>Target Glide:</span>
                      <strong>{{ pace.targetPct }}%</strong>
                    </div>
                  </div>
                  <div class="pacing-double-bars">
                    <div class="bar-row">
                      <span class="bar-lbl">Act</span>
                      <div class="track"><div class="fill-act" [style.width.%]="pace.actualPct"></div></div>
                    </div>
                    <div class="bar-row">
                      <span class="bar-lbl">Tgt</span>
                      <div class="track"><div class="fill-tgt" [style.width.%]="pace.targetPct"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 3: STATE ABSORPTION LEADERBOARD -->
            <div *ngIf="activeSchemeTab === 'states'" class="tab-pane animate-fade-in">
              <div class="pane-headline">
                <h3>Inter-State Fund Absorption &amp; Execution Disparity</h3>
                <p>Comparing high-velocity state implementation agencies with states exhibiting unspent balances.</p>
              </div>
              <div class="states-comparison-grid">
                <!-- Top Performing States -->
                <div class="state-group-box top-group">
                  <div class="group-title-row">
                    <span class="group-icon">🏆</span>
                    <h4>Top Performing States (Highest Absorption)</h4>
                  </div>
                  <div class="state-rows-list">
                    <div *ngFor="let st of selectedScheme.topStates; let idx = index" class="state-row-item">
                      <div class="st-rank">#{{ idx + 1 }}</div>
                      <div class="st-name">{{ st.name }}</div>
                      <div class="st-expenditure">{{ st.expenditureCr }}</div>
                      <div class="st-rate-badge badge-green">{{ st.rate }}%</div>
                    </div>
                  </div>
                </div>

                <!-- Lagging States -->
                <div class="state-group-box lag-group">
                  <div class="group-title-row">
                    <span class="group-icon">⚠️</span>
                    <h4>Watchlist &amp; Under-Absorbing States</h4>
                  </div>
                  <div class="state-rows-list">
                    <div *ngFor="let st of selectedScheme.laggingStates" class="state-row-item">
                      <div class="st-rank-lag">!</div>
                      <div class="st-name">{{ st.name }}</div>
                      <div class="st-expenditure">{{ st.expenditureCr }}</div>
                      <div class="st-rate-badge badge-amber">{{ st.rate }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 4: PFMS & AI ALERTS -->
            <div *ngIf="activeSchemeTab === 'alerts'" class="tab-pane animate-fade-in">
              <div class="pane-headline">
                <h3>Automated PFMS Telemetry &amp; Anomaly Detection Feeds</h3>
                <p>AI-driven surveillance flags unspent parking, voucher bunching, and DBT pipeline latency.</p>
              </div>
              <div class="telemetry-alerts-list">
                <div *ngFor="let alert of selectedScheme.telemetryHighlights" class="alert-item-card" [ngClass]="'status-' + alert.status">
                  <div class="alert-icon-col">
                    <span *ngIf="alert.status === 'success'">✅</span>
                    <span *ngIf="alert.status === 'warning'">⚠️</span>
                    <span *ngIf="alert.status === 'info'">ℹ️</span>
                  </div>
                  <div class="alert-body-col">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-detail">{{ alert.detail }}</div>
                  </div>
                  <div class="alert-badge">{{ alert.status | uppercase }}</div>
                </div>
              </div>
              <div class="tracking-architecture-box">
                <span class="arch-label">Active Monitoring Architecture:</span>
                <code>{{ selectedScheme.trackingSystem }}</code>
              </div>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="scheme-modal-footer">
            <div class="footer-left-info">
              <span>Source: Union Budget FY 2026-27 &bull; PFMS Public Financial Telemetry</span>
            </div>
            <div class="footer-btn-group">
              <button type="button" class="btn-modal-ghost" (click)="closeSchemeModal()">
                Close
              </button>
              <a routerLink="/dashboard" class="btn-modal-action" (click)="closeSchemeModal()">
                <span>Open in Full Dashboard Telemetry</span>
                <span>➔</span>
              </a>
            </div>
          </div>

        </div>
      </div>

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
      will-change: transform;
    }

    .carousel-card-wrap {
      flex: 0 0 70%;
      max-width: 70%;
      padding: 0 14px;
      box-sizing: border-box;
      opacity: 0.55;
      transform: scale(0.95);
      transition: opacity 0.52s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.52s cubic-bezier(0.2, 0.9, 0.3, 1);
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
      text-decoration: none;
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

    /* ══ 3D HOLOGRAPHIC PFMS TELEMETRY CORE (Featured Review) ══ */
    .resource-graphic-col {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1200px;
      min-height: 440px;
    }

    .hologram-telemetry-stage {
      position: relative;
      width: 100%;
      max-width: 470px;
      height: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform-style: preserve-3d;
      user-select: none;
      transition: transform 0.15s ease-out;
    }

    .holo-ambient-glow {
      position: absolute;
      width: 380px;
      height: 380px;
      background: radial-gradient(circle, rgba(45, 212, 191, 0.24) 0%, rgba(13, 148, 136, 0.1) 45%, transparent 72%);
      filter: blur(40px);
      border-radius: 50%;
      pointer-events: none;
      animation: holoGlowAura 6s ease-in-out infinite alternate;
    }

    .holo-3d-scene {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Isometric Ground Matrix Plate */
    .iso-ground-plane {
      position: absolute;
      bottom: 25px;
      width: 360px;
      height: 360px;
      transform: rotateX(68deg) rotateZ(-32deg);
      transform-style: preserve-3d;
      border-radius: 50%;
      border: 1.5px dashed rgba(45, 212, 191, 0.4);
      background: radial-gradient(circle, rgba(7, 59, 76, 0.85) 0%, rgba(3, 23, 27, 0.55) 70%, transparent 100%);
      box-shadow: 0 0 50px rgba(20, 184, 166, 0.3), inset 0 0 45px rgba(20, 184, 166, 0.2);
      overflow: visible;
    }

    .ground-grid-matrix {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-image: 
        linear-gradient(rgba(45, 212, 191, 0.14) 1px, transparent 1px),
        linear-gradient(90deg, rgba(45, 212, 191, 0.14) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .ground-axis {
      position: absolute;
      background: rgba(45, 212, 191, 0.45);
    }

    .ground-axis-x {
      top: 50%;
      left: 8%;
      right: 8%;
      height: 1px;
    }

    .ground-axis-y {
      left: 50%;
      top: 8%;
      bottom: 8%;
      width: 1px;
    }

    .ground-concentric-pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 80px;
      margin: -40px 0 0 -40px;
      border-radius: 50%;
      border: 1.5px solid rgba(45, 212, 191, 0.75);
      box-shadow: 0 0 16px rgba(45, 212, 191, 0.4);
      animation: sonarPulse 4.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
    }

    .ground-concentric-pulse.p2 {
      animation-delay: 1.5s;
    }

    .ground-concentric-pulse.p3 {
      animation-delay: 3s;
    }

    /* Upward Holographic Light Pillar */
    .holo-beam-column {
      position: absolute;
      bottom: 75px;
      width: 120px;
      height: 240px;
      background: linear-gradient(to top, rgba(45, 212, 191, 0.42) 0%, rgba(20, 184, 166, 0.14) 55%, transparent 100%);
      clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
      pointer-events: none;
      filter: blur(1px);
      animation: holoBeamFlicker 3.5s ease-in-out infinite alternate;
    }

    .beam-core-glow {
      position: absolute;
      bottom: 0;
      left: 35%;
      right: 35%;
      height: 70%;
      background: linear-gradient(to top, rgba(255, 255, 255, 0.5) 0%, rgba(45, 212, 191, 0.4) 40%, transparent 100%);
      filter: blur(3px);
    }

    .beam-scanlines {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(45, 212, 191, 0.15) 4px, rgba(45, 212, 191, 0.15) 8px);
      animation: scanlineScroll 6s linear infinite;
    }

    /* Concentric 3D Gyroscopic Telemetry Rings */
    .gyro-ring {
      position: absolute;
      border-radius: 50%;
      transform-style: preserve-3d;
      pointer-events: none;
    }

    .gyro-ring-outer {
      width: 320px;
      height: 320px;
      border: 1.5px solid rgba(45, 212, 191, 0.4);
      box-shadow: 0 0 20px rgba(45, 212, 191, 0.15);
      transform: rotateX(66deg) rotateY(16deg);
      animation: rotateOuterGyro 28s linear infinite;
    }

    .gyro-ring-middle {
      width: 240px;
      height: 240px;
      border: 1.5px dashed rgba(52, 211, 153, 0.55);
      box-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
      transform: rotateX(62deg) rotateY(-18deg);
      animation: rotateMiddleGyro 20s linear infinite;
    }

    .gyro-ring-inner {
      width: 170px;
      height: 170px;
      border: 2px solid rgba(45, 212, 191, 0.7);
      border-top-color: #6EE7B7;
      border-bottom-color: #0D9488;
      box-shadow: 0 0 22px rgba(45, 212, 191, 0.4), inset 0 0 15px rgba(45, 212, 191, 0.3);
      transform: rotateX(72deg) rotateY(0deg);
      animation: rotateInnerGyro 12s linear infinite;
    }

    .ring-tracker {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
    }

    .tracker-middle {
      top: auto;
      bottom: -10px;
    }

    .tracker-outer-opposite {
      top: auto;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
    }

    .satellite-pill {
      display: inline-flex;
      align-items: center;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 3px 9px;
      border-radius: 9999px;
      background: rgba(7, 59, 76, 0.92);
      border: 1px solid #2DD4BF;
      color: #2DD4BF;
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.45);
      white-space: nowrap;
    }

    .satellite-pill.amber {
      border-color: #F59E0B;
      color: #FDE047;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
    }

    .satellite-beacon-dot {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2DD4BF;
      box-shadow: 0 0 10px #2DD4BF;
    }

    /* Central Floating 3D Fiscal Hologram Core */
    .holo-central-core {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%) translateZ(32px);
      transform-style: preserve-3d;
      pointer-events: none;
    }

    .core-float-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: holoFloatCore 4s ease-in-out infinite alternate;
    }

    .core-shield-prism {
      position: relative;
      width: 76px;
      height: 76px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(45, 212, 191, 0.3) 0%, rgba(13, 148, 136, 0.6) 50%, rgba(7, 59, 76, 0.85) 100%);
      border: 2px solid rgba(45, 212, 191, 0.8);
      box-shadow: 
        0 0 35px rgba(45, 212, 191, 0.55),
        0 15px 35px rgba(0, 0, 0, 0.4),
        inset 0 0 20px rgba(45, 212, 191, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
    }

    .core-symbol-wrap {
      font-size: 2.3rem;
      font-weight: 900;
      color: #FFFFFF;
      text-shadow: 
        0 0 12px rgba(45, 212, 191, 0.95),
        0 0 25px rgba(45, 212, 191, 0.7);
      line-height: 1;
    }

    .core-orbital-halo {
      position: absolute;
      inset: -14px;
      border-radius: 50%;
      border: 1px dashed rgba(45, 212, 191, 0.4);
      animation: rotateClock 12s linear infinite;
    }

    .core-orbital-halo .dot {
      position: absolute;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #2DD4BF;
      box-shadow: 0 0 8px #2DD4BF;
    }

    .core-orbital-halo .d1 { top: -2.5px; left: 50%; transform: translateX(-50%); }
    .core-orbital-halo .d2 { bottom: -2.5px; left: 50%; transform: translateX(-50%); }
    .core-orbital-halo .d3 { left: -2.5px; top: 50%; transform: translateY(-50%); }
    .core-orbital-halo .d4 { right: -2.5px; top: 50%; transform: translateY(-50%); }

    .core-shadow-ground {
      width: 80px;
      height: 22px;
      background: radial-gradient(ellipse, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
      border-radius: 50%;
      margin-top: 25px;
      filter: blur(4px);
      animation: shadowPulse 4s ease-in-out infinite alternate;
    }

    /* Dynamic SVG Streams */
    .holo-svg-streams {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    }

    .energy-stream-line {
      animation: energyDashFlow 2.8s linear infinite;
    }

    .energy-stream-line.s2 {
      animation-duration: 3.2s;
    }

    .energy-stream-line.s3 {
      animation-duration: 2.5s;
    }

    /* 3D Glassmorphic HUD Chips */
    .hud-chip {
      position: absolute;
      transform-style: preserve-3d;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
      cursor: pointer;
    }

    .hud-chip:hover {
      transform: translate3d(var(--tx), var(--ty), calc(var(--tz) + 16px)) scale(1.04) !important;
      z-index: 10;
    }

    .hud-chip-inner {
      background: rgba(7, 59, 76, 0.85);
      border: 1px solid rgba(45, 212, 191, 0.4);
      border-radius: 14px;
      padding: 12px 16px;
      box-shadow: 
        0 14px 32px rgba(0, 0, 0, 0.45),
        0 0 20px rgba(45, 212, 191, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(14px);
      min-width: 180px;
    }

    .chip-top-right {
      --tx: 90px;
      --ty: -115px;
      --tz: 55px;
      transform: translate3d(var(--tx), var(--ty), var(--tz));
      animation: floatChip1 5s ease-in-out infinite alternate;
    }

    .chip-bottom-left {
      --tx: -105px;
      --ty: 95px;
      --tz: 65px;
      transform: translate3d(var(--tx), var(--ty), var(--tz));
      animation: floatChip2 5.5s ease-in-out infinite alternate;
    }

    .chip-top-left {
      --tx: -115px;
      --ty: -80px;
      --tz: 40px;
      transform: translate3d(var(--tx), var(--ty), var(--tz));
      animation: floatChip3 4.8s ease-in-out infinite alternate;
    }

    .chip-bottom-ticker {
      --tx: 0px;
      --ty: 165px;
      --tz: 48px;
      transform: translate3d(var(--tx), var(--ty), var(--tz));
    }

    .hud-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }

    .hud-category {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      color: #94A3B8;
      text-transform: uppercase;
    }

    .hud-badge-green {
      margin-left: auto;
      font-size: 0.6rem;
      font-weight: 700;
      color: #10B981;
      background: rgba(16, 185, 129, 0.15);
      padding: 1px 6px;
      border-radius: 4px;
      border: 0.5px solid rgba(16, 185, 129, 0.3);
    }

    .hud-badge-tag {
      margin-left: auto;
      font-size: 0.58rem;
      font-weight: 800;
      color: #34D399;
      background: rgba(5, 150, 105, 0.2);
      padding: 1px 5px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .hud-speed-badge {
      margin-left: auto;
      font-size: 0.6rem;
      font-weight: 800;
      color: #22D3EE;
      background: rgba(6, 182, 212, 0.18);
      padding: 1px 6px;
      border-radius: 4px;
    }

    .hud-indicator-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .pulse-teal {
      background: #2DD4BF;
      box-shadow: 0 0 8px #2DD4BF;
      animation: indicatorBlink 1.8s infinite;
    }

    .pulse-emerald {
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: indicatorBlink 2.2s infinite;
    }

    .hud-value-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .hud-primary-val {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.1;
      letter-spacing: -0.01em;
    }

    .hud-primary-val.text-emerald {
      color: #34D399;
    }

    .hud-primary-val.text-cyan {
      color: #22D3EE;
    }

    .hud-primary-val small.unit-cr {
      font-size: 0.72rem;
      font-weight: 600;
      color: #CCFBF1;
      margin-left: 3px;
    }

    .hud-sub-desc {
      font-size: 0.66rem;
      color: #94A3B8;
      line-height: 1.35;
    }

    .hud-sub-tiny {
      font-size: 0.6rem;
      color: #64748B;
      margin-top: 3px;
    }

    .hud-telemetry-micro-tags {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }

    .micro-tag {
      font-size: 0.58rem;
      color: #A7F3D0;
      background: rgba(16, 185, 129, 0.12);
      padding: 1px 5px;
      border-radius: 3px;
    }

    .hud-progress-track {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin: 6px 0 2px;
    }

    .hud-progress-fill {
      width: 82%;
      height: 100%;
      background: linear-gradient(90deg, #0D9488, #22D3EE);
      border-radius: 2px;
      animation: progressPulse 3s ease-in-out infinite alternate;
    }

    .hud-spark-bars {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 14px;
      margin-top: 6px;
    }

    .hud-spark-bars .bar {
      flex: 1;
      background: linear-gradient(to top, #0D9488, #2DD4BF);
      border-radius: 2px 2px 0 0;
      animation: sparkBarWave 1.4s ease-in-out infinite alternate;
    }

    .hud-spark-bars .b1 { height: 40%; animation-delay: 0.1s; }
    .hud-spark-bars .b2 { height: 75%; animation-delay: 0.3s; }
    .hud-spark-bars .b3 { height: 50%; animation-delay: 0.2s; }
    .hud-spark-bars .b4 { height: 90%; animation-delay: 0.5s; }
    .hud-spark-bars .b5 { height: 65%; animation-delay: 0.15s; }
    .hud-spark-bars .b6 { height: 80%; animation-delay: 0.4s; }
    .hud-spark-bars .b7 { height: 100%; animation-delay: 0.25s; }

    .chip-bottom-ticker .ticker-content {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(3, 23, 27, 0.88);
      border: 1px solid rgba(45, 212, 191, 0.35);
      border-radius: 9999px;
      padding: 6px 14px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(45, 212, 191, 0.2);
      backdrop-filter: blur(10px);
      white-space: nowrap;
    }

    .ticker-live-icon {
      color: #2DD4BF;
      font-size: 0.72rem;
      animation: indicatorBlink 1.5s infinite;
    }

    .ticker-text {
      font-size: 0.66rem;
      color: #CCFBF1;
      letter-spacing: 0.02em;
    }

    .ticker-text strong {
      color: #FFFFFF;
      font-weight: 700;
    }

    /* 3D Keyframe Animations */
    @keyframes rotateOuterGyro {
      from { transform: rotateX(66deg) rotateY(16deg) rotateZ(0deg); }
      to   { transform: rotateX(66deg) rotateY(16deg) rotateZ(360deg); }
    }

    @keyframes rotateMiddleGyro {
      from { transform: rotateX(62deg) rotateY(-18deg) rotateZ(360deg); }
      to   { transform: rotateX(62deg) rotateY(-18deg) rotateZ(0deg); }
    }

    @keyframes rotateInnerGyro {
      from { transform: rotateX(72deg) rotateY(0deg) rotateZ(0deg); }
      to   { transform: rotateX(72deg) rotateY(0deg) rotateZ(360deg); }
    }

    @keyframes holoFloatCore {
      0%   { transform: translateY(0px); }
      100% { transform: translateY(-12px); }
    }

    @keyframes shadowPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(0.8); opacity: 0.35; }
    }

    @keyframes floatChip1 {
      0%   { transform: translate3d(var(--tx), var(--ty), var(--tz)); }
      100% { transform: translate3d(var(--tx), calc(var(--ty) - 8px), var(--tz)); }
    }

    @keyframes floatChip2 {
      0%   { transform: translate3d(var(--tx), var(--ty), var(--tz)); }
      100% { transform: translate3d(var(--tx), calc(var(--ty) + 7px), var(--tz)); }
    }

    @keyframes floatChip3 {
      0%   { transform: translate3d(var(--tx), var(--ty), var(--tz)); }
      100% { transform: translate3d(var(--tx), calc(var(--ty) - 6px), var(--tz)); }
    }

    @keyframes energyDashFlow {
      0%   { stroke-dashoffset: 48; }
      100% { stroke-dashoffset: 0; }
    }

    @keyframes sparkBarWave {
      0%   { transform: scaleY(0.4); }
      100% { transform: scaleY(1.1); }
    }

    @keyframes indicatorBlink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.4; transform: scale(0.85); }
    }

    @keyframes holoGlowAura {
      0%   { transform: scale(0.9); opacity: 0.5; }
      100% { transform: scale(1.1); opacity: 0.85; }
    }

    @keyframes holoBeamFlicker {
      0%   { opacity: 0.75; }
      100% { opacity: 0.95; }
    }

    @keyframes sonarPulse {
      0%   { transform: scale(0.2); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    @keyframes scanlineScroll {
      from { background-position: 0 0; }
      to   { background-position: 0 40px; }
    }

    @keyframes progressPulse {
      0%   { opacity: 0.85; }
      100% { opacity: 1; }
    }

    /* ══ 4. KEY PRIORITY SECTORS & SCHEME TELEMETRY ══ */
    .key-topics-section {
      padding: 90px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .topics-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 48px;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
    }

    .topics-title-col {
      flex: 0 0 auto;
      max-width: 480px;
    }

    .topics-eyebrow {
      display: inline-block;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0D9488;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .topics-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #083E48;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin: 0;
    }

    .topics-intro-col {
      flex: 1;
      max-width: 620px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 4px;
    }

    .topics-intro-text {
      font-size: 0.98rem;
      line-height: 1.65;
      color: #475569;
      margin: 0;
    }

    .topics-meta-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #0F766E;
      background: rgba(204, 251, 241, 0.65);
      border: 1px solid rgba(45, 212, 191, 0.45);
      padding: 5px 14px;
      border-radius: 9999px;
      width: fit-content;
    }

    .pulse-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #0D9488;
      box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.7);
      animation: pulseTeal 1.8s infinite;
    }

    @keyframes pulseTeal {
      0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.7); }
      70%  { transform: scale(1); box-shadow: 0 0 0 8px rgba(13, 148, 136, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
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
      border: 1px solid rgba(13, 148, 136, 0.18);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transform-style: preserve-3d;
      perspective: 1200px;
      will-change: transform, box-shadow;
      transition: box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
      position: relative;
    }

    .topic-card:hover {
      box-shadow: 0 22px 45px rgba(13, 148, 136, 0.2), 0 8px 18px rgba(8, 62, 72, 0.08);
      border-color: #0D9488;
    }

    .topic-img-frame {
      height: 200px;
      overflow: hidden;
      position: relative;
      transform: translateZ(12px);
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

    .scheme-category-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(8, 62, 72, 0.85);
      backdrop-filter: blur(8px);
      color: #5EEAD4;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.04em;
      border: 1px solid rgba(45, 212, 191, 0.3);
    }

    .topic-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      flex: 1;
      transform: translateZ(16px);
    }

    .topic-ministry-tag {
      font-size: 0.72rem;
      font-weight: 800;
      color: #0D9488;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .topic-name {
      font-size: 1.18rem;
      font-weight: 800;
      color: #083E48;
      line-height: 1.35;
      margin: 0 0 8px;
      transition: color 0.2s ease;
    }

    .topic-card:hover .topic-name {
      color: #0F766E;
    }

    .topic-desc {
      font-size: 0.86rem;
      line-height: 1.55;
      color: #64748B;
      margin: 0 0 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .scheme-mini-metrics {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border-radius: 10px;
      padding: 10px 14px;
      border: 1px solid rgba(226, 232, 240, 0.8);
      margin-bottom: 10px;
    }

    .mini-metric-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mini-label {
      font-size: 0.66rem;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .mini-val {
      font-size: 0.88rem;
      font-weight: 800;
      color: #0F172A;
    }

    .val-teal {
      color: #0D9488 !important;
    }

    .scheme-progress-bar-wrap {
      width: 100%;
      height: 6px;
      background: #E2E8F0;
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .scheme-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #14B8A6 0%, #0D9488 100%);
      border-radius: 9999px;
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pacing-pill {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .pacing-optimal {
      background: #ECFDF5;
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .pacing-accelerated {
      background: #EFF6FF;
      color: #2563EB;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .pacing-review {
      background: #FFFBEB;
      color: #D97706;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .topic-footer-row {
      margin-top: auto;
    }

    .btn-telemetry-explore {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(240, 253, 250, 0.9);
      color: #0D9488;
      border: 1.5px solid rgba(13, 148, 136, 0.35);
      border-radius: 12px;
      padding: 10px 16px;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .topic-card:hover .btn-telemetry-explore,
    .btn-telemetry-explore:hover {
      background: #0D9488;
      color: #FFFFFF;
      border-color: #0D9488;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      transform: translateY(-2px);
    }

    /* ══ 5. LATEST INSIGHTS & LATEST EVENT (3D CARDS) ══ */
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

    /* ══ 3D CARD ANIMATIONS & ELEVATION ══ */
    .insight-card.card-3d,
    .event-card-container.card-3d {
      transform-style: preserve-3d;
      perspective: 1200px;
      position: relative;
      background: #FFFFFF;
      transition: box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
      will-change: transform, box-shadow;
    }

    .insight-card.card-3d::before,
    .event-card-container.card-3d::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 50%, rgba(13, 148, 136, 0.04) 100%);
      pointer-events: none;
      z-index: 2;
      opacity: 0;
      transition: opacity 0.35s ease;
    }

    .insight-card.card-3d:hover::before,
    .event-card-container.card-3d:hover::before {
      opacity: 1;
    }

    .insight-card {
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(8, 62, 72, 0.06);
      border: 1px solid rgba(13, 148, 136, 0.18);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
    }

    .insight-card.card-3d:hover {
      box-shadow: 0 24px 48px -12px rgba(8, 62, 72, 0.18), 0 12px 24px -8px rgba(13, 148, 136, 0.2);
      border-color: #0D9488;
    }

    .insight-thumb-box {
      height: 165px;
      overflow: hidden;
      position: relative;
      transform: translateZ(14px);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .insight-tag-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(8, 62, 72, 0.88);
      backdrop-filter: blur(6px);
      color: #5EEAD4;
      font-size: 0.62rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.06em;
      border: 1px solid rgba(45, 212, 191, 0.3);
    }

    .insight-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .insight-card:hover .insight-thumb-img {
      transform: scale(1.08);
    }

    .insight-card.card-3d:hover .insight-thumb-box {
      transform: translateZ(22px);
    }

    .insight-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
      transform: translateZ(18px);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .insight-subtag {
      font-size: 0.65rem;
      font-weight: 800;
      color: #0D9488;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    .insight-headline {
      font-size: 0.98rem;
      font-weight: 700;
      line-height: 1.45;
      color: #0F172A;
      margin: 0 0 12px;
      flex: 1;
      transition: color 0.2s ease, transform 0.3s ease;
    }

    .insight-card.card-3d:hover .insight-headline {
      transform: translateZ(26px);
      color: #0D9488;
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

    /* Right Column: Featured Event Card (3D Animated) */
    .event-card-container {
      background: #FFFFFF;
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(8, 62, 72, 0.09);
      border: 1.5px solid rgba(13, 148, 136, 0.22);
      display: flex;
      flex-direction: column;
    }

    .event-card-container.card-3d:hover {
      box-shadow: 0 26px 54px -14px rgba(8, 62, 72, 0.22), 0 14px 28px -8px rgba(13, 148, 136, 0.24);
      border-color: #0D9488;
    }

    .event-kicker {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0D9488;
      text-transform: uppercase;
      padding: 14px 22px;
      background: rgba(240, 253, 250, 0.85);
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
      display: block;
      transform: translateZ(10px);
    }

    .event-poster-wrap {
      height: 200px;
      position: relative;
      overflow: hidden;
      transform: translateZ(14px);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .event-card-container.card-3d:hover .event-poster-wrap {
      transform: translateZ(24px);
    }

    .event-poster-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .event-card-container:hover .event-poster-img {
      transform: scale(1.05);
    }

    .event-poster-overlay {
      position: absolute;
      bottom: 10px;
      left: 10px;
    }

    .event-mode-badge {
      background: rgba(8, 62, 72, 0.88);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(45, 212, 191, 0.3);
    }

    .event-details-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transform: translateZ(18px);
    }

    .event-main-title {
      font-size: 1.18rem;
      font-weight: 800;
      line-height: 1.35;
      color: #083E48;
      margin: 0;
      transition: color 0.2s ease, transform 0.3s ease;
    }

    .event-card-container.card-3d:hover .event-main-title {
      color: #0F766E;
      transform: translateZ(28px);
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
      transition: all 0.25s ease;
      transform: translateZ(24px);
    }

    .event-card-container.card-3d:hover .btn-register-event {
      transform: translateZ(32px) translateY(-2px);
      box-shadow: 0 8px 22px rgba(13, 148, 136, 0.45);
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

    /* ══ SCHEME TELEMETRY MODAL ══ */
    .scheme-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(8, 30, 36, 0.8);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-y: auto;
    }

    .scheme-modal-glass {
      background: #FFFFFF;
      border: 1px solid rgba(13, 148, 136, 0.3);
      border-radius: 24px;
      max-width: 960px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(24px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .scheme-modal-header {
      padding: 24px 28px;
      background: linear-gradient(135deg, #083E48 0%, #0A4F5C 100%);
      color: #FFFFFF;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }

    .scheme-code-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #5EEAD4;
      background: rgba(13, 148, 136, 0.35);
      border: 1px solid rgba(45, 212, 191, 0.4);
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .scheme-modal-title {
      font-size: 1.55rem;
      font-weight: 800;
      margin: 0 0 8px;
      line-height: 1.25;
      color: #FFFFFF;
    }

    .scheme-header-sub {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.8rem;
      color: #CCFBF1;
    }

    .scheme-meta-sep {
      opacity: 0.6;
    }

    .tag-sponsored {
      background: rgba(45, 212, 191, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
    }

    .scheme-modal-close {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .scheme-modal-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.08);
    }

    .scheme-kpi-banner {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 20px 28px;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
    }

    .kpi-banner-card {
      background: #FFFFFF;
      border-radius: 14px;
      padding: 14px 16px;
      border: 1px solid rgba(13, 148, 136, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .kpi-banner-label {
      font-size: 0.66rem;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.06em;
      display: block;
      margin-bottom: 4px;
    }

    .kpi-banner-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.2;
    }

    .val-emerald {
      color: #059669 !important;
    }

    .kpi-banner-sub {
      font-size: 0.72rem;
      color: #64748B;
      margin-top: 4px;
      display: block;
    }

    .scheme-tabs-nav {
      display: flex;
      border-bottom: 1px solid #E2E8F0;
      background: #FFFFFF;
      padding: 0 28px;
      gap: 8px;
      overflow-x: auto;
    }

    .scheme-tab-btn {
      padding: 14px 18px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      font-size: 0.86rem;
      font-weight: 700;
      color: #64748B;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .scheme-tab-btn:hover {
      color: #0D9488;
    }

    .scheme-tab-btn.active {
      color: #0D9488;
      border-bottom-color: #0D9488;
      background: rgba(240, 253, 250, 0.6);
    }

    .scheme-modal-body {
      padding: 24px 28px;
      overflow-y: auto;
      flex: 1;
    }

    .pane-headline {
      margin-bottom: 20px;
    }

    .pane-headline h3 {
      font-size: 1.12rem;
      font-weight: 800;
      color: #083E48;
      margin: 0 0 4px;
    }

    .pane-headline p {
      font-size: 0.85rem;
      color: #64748B;
      margin: 0;
    }

    .physical-kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .kpi-detail-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 16px 18px;
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .kpi-icon {
      font-size: 1.4rem;
    }

    .kpi-completion-badge {
      font-size: 0.76rem;
      font-weight: 800;
      color: #0D9488;
      background: rgba(204, 251, 241, 0.8);
      padding: 3px 8px;
      border-radius: 9999px;
    }

    .kpi-label {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1E293B;
      margin: 0 0 6px;
    }

    .kpi-numbers {
      font-size: 0.82rem;
      color: #64748B;
      margin-bottom: 10px;
    }

    .kpi-numbers strong {
      font-size: 1.05rem;
      color: #0F172A;
      margin-right: 4px;
    }

    .kpi-bar-track {
      height: 7px;
      background: #E2E8F0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .kpi-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #14B8A6, #0D9488);
      border-radius: 9999px;
    }

    /* Tab 2: Pacing */
    .pacing-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .pacing-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pacing-quarter-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: #0D9488;
      background: rgba(13, 148, 136, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      width: fit-content;
    }

    .stat-amt {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0F172A;
    }

    .stat-sub {
      font-size: 0.7rem;
      color: #64748B;
    }

    .pacing-comparison {
      display: flex;
      justify-content: space-between;
      font-size: 0.76rem;
      border-top: 1px dashed #CBD5E1;
      padding-top: 6px;
    }

    .pacing-double-bars {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 4px;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748B;
    }

    .bar-lbl {
      width: 20px;
    }

    .bar-row .track {
      flex: 1;
      height: 6px;
      background: #E2E8F0;
      border-radius: 4px;
      overflow: hidden;
    }

    .fill-act {
      height: 100%;
      background: #0D9488;
      border-radius: 4px;
    }

    .fill-tgt {
      height: 100%;
      background: #94A3B8;
      border-radius: 4px;
    }

    /* Tab 3: States */
    .states-comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .state-group-box {
      border-radius: 16px;
      padding: 18px;
      border: 1px solid;
    }

    .top-group {
      background: #F0FDF4;
      border-color: rgba(34, 197, 94, 0.3);
    }

    .lag-group {
      background: #FFFBEB;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .group-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }

    .group-title-row h4 {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }

    .state-rows-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .state-row-item {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      font-size: 0.84rem;
    }

    .st-rank {
      font-weight: 800;
      color: #059669;
      width: 28px;
    }

    .st-rank-lag {
      font-weight: 800;
      color: #D97706;
      width: 28px;
    }

    .st-name {
      flex: 1;
      font-weight: 700;
      color: #1E293B;
    }

    .st-expenditure {
      color: #64748B;
      font-size: 0.8rem;
      margin-right: 12px;
    }

    .st-rate-badge {
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.76rem;
    }

    .badge-green {
      background: #DCFCE7;
      color: #15803D;
    }

    .badge-amber {
      background: #FEF3C7;
      color: #B45309;
    }

    /* Tab 4: Alerts */
    .telemetry-alerts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .alert-item-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid;
    }

    .status-success {
      background: #F0FDF4;
      border-color: rgba(34, 197, 94, 0.3);
    }

    .status-warning {
      background: #FFFBEB;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .status-info {
      background: #F0FDFA;
      border-color: rgba(13, 148, 136, 0.3);
    }

    .alert-body-col {
      flex: 1;
    }

    .alert-title {
      font-size: 0.9rem;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 2px;
    }

    .alert-detail {
      font-size: 0.82rem;
      color: #475569;
      line-height: 1.5;
    }

    .alert-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
    }

    .tracking-architecture-box {
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      padding: 12px 16px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.8rem;
    }

    .arch-label {
      font-weight: 700;
      color: #475569;
    }

    .tracking-architecture-box code {
      color: #0D9488;
      font-weight: 700;
      background: #FFFFFF;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
    }

    /* Modal Footer */
    .scheme-modal-footer {
      padding: 16px 28px;
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .footer-left-info {
      font-size: 0.74rem;
      color: #64748B;
    }

    .footer-btn-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-modal-ghost {
      padding: 9px 18px;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      color: #475569;
      font-weight: 700;
      font-size: 0.84rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-modal-ghost:hover {
      background: #F1F5F9;
      color: #0F172A;
    }

    .btn-modal-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 20px;
      background: #0D9488;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.84rem;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-modal-action:hover {
      background: #0F766E;
      transform: translateY(-1px);
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
      .resource-graphic-col { display: flex; justify-content: center; min-height: 400px; }
      .hologram-telemetry-stage { transform: scale(0.92); margin: 0 auto; }
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
      .resource-graphic-col { min-height: 360px; }
      .hologram-telemetry-stage { transform: scale(0.76); height: 360px; margin: 0 auto; }
      .key-topics-section { padding: 60px 16px; }
      .topics-header-row { flex-direction: column; align-items: flex-start; gap: 14px; }
      .topics-title { font-size: 1.65rem; }
      .topics-grid { grid-template-columns: 1fr; gap: 20px; }
      .insights-events-section { padding: 60px 16px 80px; }
      .insights-cards-row { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; gap: 10px; }
      .radio-pill-group { flex-direction: column; }
      .modal-dialog-glass { padding: 20px 16px; }

      /* Scheme Telemetry Modal Mobile */
      .scheme-modal-glass { max-height: 94vh; border-radius: 18px; }
      .scheme-modal-header { padding: 18px 20px; }
      .scheme-modal-title { font-size: 1.25rem; }
      .scheme-kpi-banner { grid-template-columns: 1fr 1fr; gap: 10px; padding: 14px 16px; }
      .scheme-tabs-nav { padding: 0 16px; }
      .scheme-tab-btn { padding: 12px 14px; font-size: 0.8rem; }
      .scheme-modal-body { padding: 18px 16px; }
      .physical-kpi-grid { grid-template-columns: 1fr; gap: 12px; }
      .pacing-cards-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .states-comparison-grid { grid-template-columns: 1fr; gap: 14px; }
      .scheme-modal-footer { flex-direction: column; align-items: stretch; gap: 10px; padding: 14px 16px; }
      .footer-btn-group { justify-content: flex-end; }
    }

    @media (max-width: 480px) {
      .resource-graphic-col { min-height: 310px; }
      .hologram-telemetry-stage { transform: scale(0.64); height: 310px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  // 15 virtual slides (3 sets of 5 slides)
  // Base set is indices 5 to 9. Center slide (Slide 3) is at index 5 + 2 = 7.
  currentVirtualIndex = 7;
  isTransitionDisabled = false;
  private autoSlideTimer: any = null;

  // 100% India-Centric Carousel Slides (5 Flagship Events)
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

  get displaySlides(): EventItem[] {
    return [...this.carouselSlides, ...this.carouselSlides, ...this.carouselSlides];
  }

  // ════ 6 PRIORITY SCHEMES (RESEARCH-BACKED TELEMETRY) ════
  prioritySchemes: SchemeTelemetry[] = [
    {
      id: 'scheme-nhm',
      code: 'GOI-SCH-NHM-2026',
      name: 'Primary & Maternal Healthcare (NHM & PM-ABHIM)',
      shortName: 'National Health Mission',
      ministry: 'Ministry of Health and Family Welfare (MoHFW)',
      implementingAgency: 'National Health Authority (NHA) & State Health Societies',
      category: 'Centrally Sponsored Scheme (CSS)',
      imageUrl: '/assets/healthcare-nhm.jpg',
      description: 'Transforming primary healthcare infrastructure, Janani Suraksha maternal health support, free diagnostic tests, and operationalizing 1.73 Lakh Ayushman Arogya Mandirs across India.',
      fyAllocation: '₹38,189 Cr',
      fyAllocationPrev: '₹36,785 Cr',
      expenditureToDate: '₹32,995 Cr',
      utilizationRate: 86.4,
      velocityStatus: 'Optimal',
      fundSharingRatio: '60:40 (General States), 90:10 (NE/Himalayan)',
      physicalKPIs: [
        { label: 'Ayushman Arogya Mandirs Operationalized', achieved: '1,73,500', target: '1,75,000', unit: 'centres', percentage: 99.1, icon: '🏥' },
        { label: 'Maternal Mortality Ratio (MMR Reduction)', achieved: '97', target: '70', unit: 'per 100k births', percentage: 85.2, icon: '🤱' },
        { label: 'Real-Time DVDMS Drug Inventory Online', achieved: '94.8%', target: '100%', unit: 'PHC saturation', percentage: 94.8, icon: '💊' },
        { label: 'eSanjeevani Tele-consultations Logged', achieved: '28.4 Cr', target: '30 Cr', unit: 'consultations', percentage: 94.7, icon: '📱' }
      ],
      quarterlyPacing: [
        { quarter: 'Q1 (Apr - Jun)', targetPct: 22, actualPct: 22.8, amountCr: '₹8,707 Cr' },
        { quarter: 'Q2 (Jul - Sep)', targetPct: 48, actualPct: 47.5, amountCr: '₹18,140 Cr' },
        { quarter: 'Q3 (Oct - Dec)', targetPct: 70, actualPct: 71.2, amountCr: '₹27,190 Cr' },
        { quarter: 'Q4 (Projected)', targetPct: 92, actualPct: 86.4, amountCr: '₹32,995 Cr' }
      ],
      topStates: [
        { name: 'Tamil Nadu', rate: 94.2, expenditureCr: '₹3,120 Cr' },
        { name: 'Kerala', rate: 92.8, expenditureCr: '₹1,840 Cr' },
        { name: 'Gujarat', rate: 90.5, expenditureCr: '₹2,680 Cr' }
      ],
      laggingStates: [
        { name: 'Bihar', rate: 69.4, expenditureCr: '₹2,910 Cr' },
        { name: 'Jharkhand', rate: 71.2, expenditureCr: '₹1,180 Cr' },
        { name: 'Nagaland', rate: 68.1, expenditureCr: '₹340 Cr' }
      ],
      telemetryHighlights: [
        { title: 'SNA-SPARROW Integration Active', status: 'success', detail: '99.4% State Health Society bank accounts mapped to zero-balance Single Nodal Accounts with automated sweep.' },
        { title: 'Aspirational District Drug Supply Alert', status: 'info', detail: 'Real-time telemetry verified zero stock-outs of essential antibiotics across 72 aspirational district hospitals.' },
        { title: 'Q4 Expenditure Surge Watchlist', status: 'warning', detail: '3 northeastern state treasuries flagged for delayed Q3 bill submissions; automated advance release paused until reconciliation.' }
      ],
      trackingSystem: 'PFMS Single Nodal Agency (SNA) + SPARROW + DVDMS Drug Logistics'
    },
    {
      id: 'scheme-jjm',
      code: 'GOI-SCH-JJM-2026',
      name: 'Drinking Water Grid (Jal Jeevan Mission - Har Ghar Jal)',
      shortName: 'Jal Jeevan Mission',
      ministry: 'Ministry of Jal Shakti',
      implementingAgency: 'National Jal Jeevan Mission (NJJM) & State Water & Sanitation Missions',
      category: 'Centrally Sponsored Scheme (CSS)',
      imageUrl: '/assets/jal-jeevan-water.jpg',
      description: 'Algorithmic expenditure tracking delivering potable tap water supply to 15.3+ Crore rural households, supported by IoT-based water quantity & quality sensors across 6 lakh villages.',
      fyAllocation: '₹70,163 Cr',
      fyAllocationPrev: '₹69,926 Cr',
      expenditureToDate: '₹58,024 Cr',
      utilizationRate: 82.7,
      velocityStatus: 'Optimal',
      fundSharingRatio: '50:50 (General States), 90:10 (NE/Himalayan), 100% (UTs)',
      physicalKPIs: [
        { label: 'Functional Household Tap Connections (FHTC)', achieved: '15.34 Cr', target: '19.32 Cr', unit: 'households', percentage: 79.4, icon: '🚰' },
        { label: 'Har Ghar Jal Certified Gram Panchayats', achieved: '2,14,000', target: '2,40,000', unit: 'villages', percentage: 89.2, icon: '🏡' },
        { label: 'IoT Sensor Telemetry Real-Time Grids', achieved: '2,180', target: '2,500', unit: 'grids', percentage: 87.2, icon: '📡' },
        { label: 'Schools & Anganwadi Tap Water Coverage', achieved: '9.28 Lakh', target: '9.80 Lakh', unit: 'institutions', percentage: 94.7, icon: '🏫' }
      ],
      quarterlyPacing: [
        { quarter: 'Q1 (Apr - Jun)', targetPct: 20, actualPct: 18.5, amountCr: '₹12,980 Cr' },
        { quarter: 'Q2 (Jul - Sep)', targetPct: 45, actualPct: 41.2, amountCr: '₹28,907 Cr' },
        { quarter: 'Q3 (Oct - Dec)', targetPct: 70, actualPct: 66.8, amountCr: '₹46,868 Cr' },
        { quarter: 'Q4 (Projected)', targetPct: 90, actualPct: 82.7, amountCr: '₹58,024 Cr' }
      ],
      topStates: [
        { name: 'Goa & Telangana', rate: 100, expenditureCr: '₹1,450 Cr' },
        { name: 'Gujarat', rate: 99.8, expenditureCr: '₹4,820 Cr' },
        { name: 'Haryana', rate: 100, expenditureCr: '₹2,180 Cr' }
      ],
      laggingStates: [
        { name: 'West Bengal', rate: 52.6, expenditureCr: '₹3,840 Cr' },
        { name: 'Rajasthan', rate: 55.4, expenditureCr: '₹4,120 Cr' },
        { name: 'Jharkhand', rate: 53.1, expenditureCr: '₹1,950 Cr' }
      ],
      telemetryHighlights: [
        { title: 'Automated SNA Release Mechanism', status: 'success', detail: 'Real-time validation against previous tranche expenditure vouchers before triggering RBI e-Kuber central grant releases.' },
        { title: 'Water Quality Telemetry Feed', status: 'info', detail: '98.6% compliance on residual chlorine and bacteriological purity in 2,180 continuous telemetry pilot villages.' },
        { title: 'Unspent State Balance Parking Flag', status: 'warning', detail: '₹4,120 Cr unspent central funds identified across 4 state water mission accounts; state treasuries served reminder.' }
      ],
      trackingSystem: 'JJM Integrated Telemetry Platform + PFMS SNA Dashboard + IoT Sensor Grid'
    },
    {
      id: 'scheme-pmgsy',
      code: 'GOI-SCH-PMGSY-2026',
      name: 'DBT & Rural Connectivity (PMGSY - Phase III & IV)',
      shortName: 'PM Gram Sadak Yojana',
      ministry: 'Ministry of Rural Development (MoRD)',
      implementingAgency: 'National Rural Infrastructure Development Agency (NRIDA)',
      category: 'Centrally Sponsored Scheme (CSS)',
      imageUrl: '/assets/pmgsy-roads.jpg',
      description: 'All-weather rural road construction linking 1.62 lakh habitations and modernizing 1,25,000 km of rural agricultural market access routes with GIS geo-tagged telemetry.',
      fyAllocation: '₹19,000 Cr',
      fyAllocationPrev: '₹17,000 Cr',
      expenditureToDate: '₹16,948 Cr',
      utilizationRate: 89.2,
      velocityStatus: 'Optimal',
      fundSharingRatio: '60:40 (General States), 90:10 (NE/Himalayan)',
      physicalKPIs: [
        { label: 'Eligible Habitations Fully Connected', achieved: '1,62,400', target: '1,64,000', unit: 'habitations', percentage: 99.0, icon: '🛣️' },
        { label: 'Total Rural Road Length Constructed', achieved: '7,52,400', target: '7,80,000', unit: 'km', percentage: 96.5, icon: '🚜' },
        { label: 'Green Technology Roads (Cold Mix/Plastic)', achieved: '78,500', target: '60,000', unit: 'km', percentage: 130.8, icon: '🌱' },
        { label: 'GIS Geo-referenced Network Mappings', achieved: '99.8%', target: '100%', unit: 'verification', percentage: 99.8, icon: '📍' }
      ],
      quarterlyPacing: [
        { quarter: 'Q1 (Apr - Jun)', targetPct: 22, actualPct: 24.1, amountCr: '₹4,579 Cr' },
        { quarter: 'Q2 (Jul - Sep)', targetPct: 48, actualPct: 51.3, amountCr: '₹9,747 Cr' },
        { quarter: 'Q3 (Oct - Dec)', targetPct: 72, actualPct: 74.6, amountCr: '₹14,174 Cr' },
        { quarter: 'Q4 (Projected)', targetPct: 94, actualPct: 89.2, amountCr: '₹16,948 Cr' }
      ],
      topStates: [
        { name: 'Madhya Pradesh', rate: 95.1, expenditureCr: '₹2,480 Cr' },
        { name: 'Maharashtra', rate: 93.4, expenditureCr: '₹1,920 Cr' },
        { name: 'Uttar Pradesh', rate: 91.8, expenditureCr: '₹3,150 Cr' }
      ],
      laggingStates: [
        { name: 'Manipur', rate: 62.3, expenditureCr: '₹310 Cr' },
        { name: 'Meghalaya', rate: 66.5, expenditureCr: '₹290 Cr' },
        { name: 'Jammu & Kashmir', rate: 74.2, expenditureCr: '₹840 Cr' }
      ],
      telemetryHighlights: [
        { title: 'OMMAS-PFMS Electronic Reconciliation', status: 'success', detail: '100% contractor milestones authenticated through mobile GIS before release of e-payment vouchers via PFMS.' },
        { title: 'Meri Sadak Citizen Feedback Loop', status: 'info', detail: '96.2% citizen maintenance requests verified and rectified within 30-day statutory SLA across all states.' },
        { title: 'Terrain Delay Anomaly', status: 'warning', detail: 'Monsoon landslide recovery in 6 Himalayan hill districts experiencing 45-day contractor completion extensions.' }
      ],
      trackingSystem: 'Online Management, Monitoring and Accounting System (OMMAS) + PFMS e-Payment'
    },
    {
      id: 'scheme-pmkisan',
      code: 'GOI-SCH-KISAN-2026',
      name: 'Direct Farmer Income Support (PM-KISAN)',
      shortName: 'PM-KISAN',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      implementingAgency: 'PM-KISAN Central Project Management Unit & State Agriculture Depts',
      category: 'Central Sector Scheme (100% Central Funding)',
      imageUrl: '/assets/dbt-transfer.jpg',
      description: 'Direct income support of ₹6,000/year in 3 equal tranches to 11.2 Crore landholder farmer families across India via Aadhaar Payment Bridge System (APBS) with zero intermediaries.',
      fyAllocation: '₹60,000 Cr',
      fyAllocationPrev: '₹60,000 Cr',
      expenditureToDate: '₹58,860 Cr',
      utilizationRate: 98.1,
      velocityStatus: 'Accelerated',
      fundSharingRatio: '100% Central Sector (Zero State Contribution Required)',
      physicalKPIs: [
        { label: 'Active Beneficiary Farmer Families', achieved: '11.2 Cr', target: '11.5 Cr', unit: 'families', percentage: 97.4, icon: '🌾' },
        { label: 'Direct Aadhaar Bank Payout Success Rate', achieved: '99.8%', target: '100%', unit: 'transfers', percentage: 99.8, icon: '💳' },
        { label: 'Land Records & e-KYC Biometric Seeding', achieved: '99.1%', target: '100%', unit: 'verified', percentage: 99.1, icon: '📑' },
        { label: 'Cumulative Payout Since Launch', achieved: '₹3.24L Cr', target: '₹3.30L Cr', unit: 'disbursed', percentage: 98.2, icon: '💰' }
      ],
      quarterlyPacing: [
        { quarter: 'Tranche 1 (Apr - Jul)', targetPct: 33.3, actualPct: 33.1, amountCr: '₹19,860 Cr' },
        { quarter: 'Tranche 2 (Aug - Nov)', targetPct: 66.6, actualPct: 66.2, amountCr: '₹39,720 Cr' },
        { quarter: 'Tranche 3 (Dec - Mar)', targetPct: 100, actualPct: 98.1, amountCr: '₹58,860 Cr' }
      ],
      topStates: [
        { name: 'Uttar Pradesh', rate: 99.4, expenditureCr: '₹14,100 Cr' },
        { name: 'Madhya Pradesh', rate: 98.9, expenditureCr: '₹6,280 Cr' },
        { name: 'Maharashtra', rate: 98.6, expenditureCr: '₹7,140 Cr' }
      ],
      laggingStates: [
        { name: 'West Bengal', rate: 91.2, expenditureCr: '₹3,450 Cr' },
        { name: 'Nagaland', rate: 92.4, expenditureCr: '₹180 Cr' }
      ],
      telemetryHighlights: [
        { title: 'Zero Ghost Account Disbursals', status: 'success', detail: 'Automated exclusion engine cross-checks income tax databases, institutional landholders, and Aadhaar death registers.' },
        { title: 'Sub-second NPCI Gateway Latency', status: 'info', detail: 'PFMS to NPCI payment instruction turnaround averaged 84ms across the 18th nationwide installment cycle.' },
        { title: 'Bank Account Invalidation Sweep', status: 'info', detail: '0.12% return transfers immediately routed for beneficiary SMS notification and district CSC re-validation.' }
      ],
      trackingSystem: 'PM-KISAN National Portal + PFMS APBS Gateway + NPCI Aadhaar Bridge'
    },
    {
      id: 'scheme-samagra',
      code: 'GOI-SCH-EDU-2026',
      name: 'Quality Education & PM-SHRI Exemplar Schools',
      shortName: 'Samagra Shiksha',
      ministry: 'Ministry of Education (MoE)',
      implementingAgency: 'Department of School Education & Literacy & State Implementation Societies',
      category: 'Centrally Sponsored Scheme (CSS)',
      imageUrl: '/assets/pfms-ai-data.jpg',
      description: 'Holistic pre-school to class 12 educational funding, upgrading 14,500 schools into PM-SHRI model institutions with smart STEM labs, DIKSHA digital content, and inclusive classrooms.',
      fyAllocation: '₹43,550 Cr',
      fyAllocationPrev: '₹37,500 Cr',
      expenditureToDate: '₹37,100 Cr',
      utilizationRate: 85.3,
      velocityStatus: 'Optimal',
      fundSharingRatio: '60:40 (General States), 90:10 (NE/Himalayan), 100% (UTs)',
      physicalKPIs: [
        { label: 'PM-SHRI Model Schools Approved', achieved: '14,500', target: '14,500', unit: 'schools', percentage: 100.0, icon: '🏫' },
        { label: 'Elementary Gross Enrollment Retention', achieved: '98.4%', target: '100%', unit: 'retention', percentage: 98.4, icon: '📚' },
        { label: 'DIKSHA Digital Interactive Learning Usage', achieved: '5.2B', target: '5.0B', unit: 'sessions', percentage: 104.0, icon: '💻' },
        { label: 'CWSN Inclusive Education Grants', achieved: '24.8 Lakh', target: '26.0 Lakh', unit: 'students', percentage: 95.4, icon: '🤝' }
      ],
      quarterlyPacing: [
        { quarter: 'Q1 (Apr - Jun)', targetPct: 22, actualPct: 21.4, amountCr: '₹9,320 Cr' },
        { quarter: 'Q2 (Jul - Sep)', targetPct: 48, actualPct: 46.2, amountCr: '₹20,120 Cr' },
        { quarter: 'Q3 (Oct - Dec)', targetPct: 70, actualPct: 69.8, amountCr: '₹30,400 Cr' },
        { quarter: 'Q4 (Projected)', targetPct: 91, actualPct: 85.3, amountCr: '₹37,100 Cr' }
      ],
      topStates: [
        { name: 'Gujarat', rate: 93.1, expenditureCr: '₹2,840 Cr' },
        { name: 'Himachal Pradesh', rate: 91.8, expenditureCr: '₹920 Cr' },
        { name: 'Punjab', rate: 90.4, expenditureCr: '₹1,480 Cr' }
      ],
      laggingStates: [
        { name: 'Bihar', rate: 70.2, expenditureCr: '₹3,450 Cr' },
        { name: 'Assam', rate: 73.5, expenditureCr: '₹1,260 Cr' },
        { name: 'Odisha', rate: 76.1, expenditureCr: '₹1,640 Cr' }
      ],
      telemetryHighlights: [
        { title: 'Vidya Samiksha Kendra (VSK) Sync', status: 'success', detail: 'Real-time teacher attendance, student learning outcomes, and infrastructural readiness mapped in 24 states.' },
        { title: 'ICT Lab Procurement Clearance', status: 'info', detail: '100% hardware procurement for PM-SHRI labs transacted via GeM (Government e-Marketplace) with PFMS billing.' },
        { title: 'Teacher Salary Grant Tranche Gap', status: 'warning', detail: '2 eastern states exhibited 3-week delays in transferring central matching grants from consolidated fund to SIS.' }
      ],
      trackingSystem: 'Unified District Information System for Education (UDISE+) + Vidya Samiksha Kendra + PFMS'
    },
    {
      id: 'scheme-pmay',
      code: 'GOI-SCH-PMAY-2026',
      name: 'Affordable Housing for All (PMAY Gramin & Urban)',
      shortName: 'PM Awas Yojana',
      ministry: 'Ministry of Rural Development & Ministry of Housing and Urban Affairs',
      implementingAgency: 'State Rural Development & Housing Boards',
      category: 'Centrally Sponsored Scheme (CSS)',
      imageUrl: '/assets/state-capex-infra.jpg',
      description: 'Ensuring pucca houses with clean cooking fuel, electricity, and tap water for 3.42+ Crore poor families through milestone-based geo-tagged direct benefit disbursements.',
      fyAllocation: '₹54,500 Cr',
      fyAllocationPrev: '₹54,103 Cr',
      expenditureToDate: '₹49,867 Cr',
      utilizationRate: 91.5,
      velocityStatus: 'Accelerated',
      fundSharingRatio: '60:40 (General States), 90:10 (NE/Himalayan)',
      physicalKPIs: [
        { label: 'Pucca Houses Constructed & Handed Over', achieved: '3.42 Cr', target: '3.50 Cr', unit: 'houses', percentage: 97.7, icon: '🏠' },
        { label: 'Basic Amenities Convergence Saturation', achieved: '100%', target: '100%', unit: 'LPG+Power+Tap', percentage: 100.0, icon: '💡' },
        { label: 'Geo-tagged Milestone Inspections', achieved: '13.6 Cr', target: '14.0 Cr', unit: 'photos', percentage: 97.1, icon: '📸' },
        { label: 'Women Head of Household Sole/Joint Titles', achieved: '74.2%', target: '75.0%', unit: 'registered', percentage: 98.9, icon: '👩' }
      ],
      quarterlyPacing: [
        { quarter: 'Q1 (Apr - Jun)', targetPct: 22, actualPct: 24.5, amountCr: '₹13,352 Cr' },
        { quarter: 'Q2 (Jul - Sep)', targetPct: 48, actualPct: 50.8, amountCr: '₹27,686 Cr' },
        { quarter: 'Q3 (Oct - Dec)', targetPct: 72, actualPct: 73.9, amountCr: '₹40,275 Cr' },
        { quarter: 'Q4 (Projected)', targetPct: 95, actualPct: 91.5, amountCr: '₹49,867 Cr' }
      ],
      topStates: [
        { name: 'Odisha', rate: 96.4, expenditureCr: '₹4,890 Cr' },
        { name: 'Madhya Pradesh', rate: 95.8, expenditureCr: '₹5,720 Cr' },
        { name: 'Rajasthan', rate: 94.2, expenditureCr: '₹4,310 Cr' }
      ],
      laggingStates: [
        { name: 'West Bengal', rate: 71.8, expenditureCr: '₹3,920 Cr' },
        { name: 'Nagaland', rate: 73.2, expenditureCr: '₹280 Cr' }
      ],
      telemetryHighlights: [
        { title: 'AwaasApp 4-Stage Photo Verification', status: 'success', detail: 'Plinth, lintel, roof, and completion stages validated with satellite GPS coordinates before PFMS tranche trigger.' },
        { title: 'Direct Aadhaar DBT to Bank Account', status: 'info', detail: 'Average latency of 48 hours between field inspector geo-tagging approval and beneficiary bank credit.' },
        { title: 'Title Registration Verification', status: 'success', detail: 'Zero unverified land deed titles recorded; 74.2% sole or joint ownership registered in female family head names.' }
      ],
      trackingSystem: 'AwaasSoft + AwaasApp Geo-telemetry + PFMS Direct DBT Gateways'
    }
  ];

  // Scheme Modal State
  isSchemeModalOpen = false;
  selectedScheme: SchemeTelemetry | null = null;
  activeSchemeTab: 'kpis' | 'pacing' | 'states' | 'alerts' = 'kpis';

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

  // ══ INFINITE CIRCULAR CAROUSEL LOGIC ══
  startAutoSlide() {
    this.pauseCarousel();
    this.autoSlideTimer = setInterval(() => {
      this.nextSlide();
    }, 4000); // Peppier, smoother pace
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
    this.currentVirtualIndex++;
  }

  prevSlide() {
    this.currentVirtualIndex--;
  }

  onTransitionEnd() {
    const count = this.carouselSlides.length; // 5
    // Seamless silent modulo reset when sliding out of middle set
    if (this.currentVirtualIndex >= count * 2) {
      this.isTransitionDisabled = true;
      this.currentVirtualIndex -= count;
      setTimeout(() => {
        this.isTransitionDisabled = false;
      }, 30);
    } else if (this.currentVirtualIndex < count) {
      this.isTransitionDisabled = true;
      this.currentVirtualIndex += count;
      setTimeout(() => {
        this.isTransitionDisabled = false;
      }, 30);
    }
  }

  getRealIndex(): number {
    const count = this.carouselSlides.length;
    return ((this.currentVirtualIndex % count) + count) % count;
  }

  goToRealSlide(realIndex: number) {
    const currentReal = this.getRealIndex();
    let diff = realIndex - currentReal;
    if (diff > 2) diff -= 5;
    if (diff < -2) diff += 5;
    this.currentVirtualIndex += diff;
  }

  onCardClick(index: number) {
    if (index !== this.currentVirtualIndex) {
      this.currentVirtualIndex = index;
    }
  }

  getTrackTransform(): string {
    const cardWidthPercent = 70;
    const centerOffset = 15; // (100 - 70) / 2
    const offset = centerOffset - (this.currentVirtualIndex * cardWidthPercent);
    return `translateX(${offset}%)`;
  }

  // ══ SCHEME TELEMETRY MODAL METHODS ══
  openSchemeModal(scheme: SchemeTelemetry, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedScheme = scheme;
    this.activeSchemeTab = 'kpis';
    this.isSchemeModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeSchemeModal() {
    this.isSchemeModalOpen = false;
    this.selectedScheme = null;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  getPacingClass(status: string): string {
    switch (status) {
      case 'Optimal': return 'pacing-optimal';
      case 'Accelerated': return 'pacing-accelerated';
      default: return 'pacing-review';
    }
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
