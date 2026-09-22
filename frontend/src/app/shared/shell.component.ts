import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';

interface SearchItem {
  title: string;
  category: 'Scheme' | 'State' | 'Module';
  subtitle: string;
  icon: string;
  route: string;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <div class="app-shell">

      <!-- ══ TOP NAVBAR ══ -->
      <nav class="top-navbar glass-navbar">
        <div class="navbar-container">

          <!-- Left: Brand Logo & Title -->
          <div class="navbar-left">
            <a routerLink="/home" class="brand" title="Return to Home Landing Page">
              <img src="/logo.png" alt="Logo" class="brand-logo" />
              <div class="brand-text">
                <span class="brand-name">Budget Monitor</span>
                <span class="brand-sub">Government of India &bull; Fiscal Oversight</span>
              </div>
            </a>
          </div>

          <!-- Center: Horizontal Navigation Items -->
          <div class="navbar-center">
            <nav class="navbar-nav-links">
              <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="top-nav-item">
                <span>Home</span>
              </a>
              <a routerLink="/dashboard" routerLinkActive="active" class="top-nav-item">
                <span>Dashboard</span>
              </a>
              <a routerLink="/budgets" routerLinkActive="active" class="top-nav-item">
                <span>Budgets</span>
              </a>
              <a routerLink="/expenditures" routerLinkActive="active" class="top-nav-item">
                <span>Expenditures</span>
              </a>
              <a routerLink="/reports" routerLinkActive="active" class="top-nav-item">
                <span>Departments</span>
              </a>
              <a routerLink="/alerts" routerLinkActive="active" class="top-nav-item alert-link">
                <span>Alerts</span>
                <span class="nav-alert-chip" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </a>
              <a routerLink="/blog" routerLinkActive="active" class="top-nav-item">
                <span>Insights</span>
              </a>
              @if (auth.hasRole(['Admin'])) {
                <a routerLink="/admin" routerLinkActive="active" class="top-nav-item admin-link">
                  <span>Admin</span>
                </a>
              }
            </nav>
          </div>

          <!-- Right: Search, Notifications, Auth/User Pill, & Mobile Toggle -->
          <div class="navbar-right">
            <!-- Interactive Quick Search Bar -->
            <div class="search-wrap" [class.active]="searchOpen || searchQuery.length > 0">
              <div class="search-input-box" (click)="openSearch($event)">
                <svg class="search-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  class="search-input" 
                  [(ngModel)]="searchQuery" 
                  (focus)="searchOpen = true"
                  (input)="searchOpen = true"
                  placeholder="Quick search schemes, states…" 
                  autocomplete="off"
                />
                @if (searchQuery) {
                  <button class="clear-search-btn" (click)="clearSearch($event)" title="Clear search">✕</button>
                }
                <kbd class="search-kbd">⌘K</kbd>
              </div>

              <!-- Quick Search Dropdown -->
              @if (searchOpen) {
                <div class="search-dropdown glass-panel" (click)="$event.stopPropagation()">
                  <div class="search-dropdown-header">
                    <span>⚡ Quick Search &amp; Topic Shortcuts</span>
                    <small class="muted" *ngIf="searchQuery">Filtering for "{{ searchQuery }}"</small>
                  </div>

                  <div class="search-results-list">
                    @if (filteredSearchItems.length === 0) {
                      <div class="search-no-results">
                        <span class="no-res-icon">🔍</span>
                        <p>No matches found for "{{ searchQuery }}"</p>
                        <small class="muted">Try searching for "Health", "Maharashtra", "Shiksha", or "Alerts"</small>
                      </div>
                    }

                    @for (item of filteredSearchItems; track item.title) {
                      <div class="search-result-item" (click)="navigateTo(item)">
                        <div class="search-item-icon" [ngClass]="item.category.toLowerCase()">
                          {{ item.icon }}
                        </div>
                        <div class="search-item-info">
                          <div class="search-item-title-row">
                            <span class="search-item-title">{{ item.title }}</span>
                            <span class="search-item-category-tag" [ngClass]="item.category.toLowerCase()">{{ item.category }}</span>
                          </div>
                          <span class="search-item-subtitle">{{ item.subtitle }}</span>
                        </div>
                        <span class="search-item-arrow">→</span>
                      </div>
                    }
                  </div>

                  <div class="search-dropdown-footer">
                    <span>Select any topic to navigate directly to telemetry &amp; reports</span>
                  </div>
                </div>
              }
            </div>

            <!-- Notification Bell -->
            <div class="notif-wrap" [class.open]="notifOpen">
              <button class="icon-btn notif-btn" (click)="toggleNotif($event)" title="Notifications" [class.has-unread]="unreadCount > 0">
                <svg class="bell-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="notif-dot" *ngIf="unreadCount > 0">
                  <span class="notif-ping"></span>
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Notification Dropdown -->
              <div class="notif-panel glass-panel" *ngIf="notifOpen" (click)="$event.stopPropagation()">
                <div class="notif-header">
                  <div class="notif-title-group">
                    <strong>Notifications</strong>
                    <span class="notif-badge-pill" *ngIf="unreadCount > 0">{{ unreadCount }} new</span>
                  </div>
                  <button class="mark-all-btn" (click)="markAllRead()" *ngIf="unreadCount > 0">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;margin-right:3px;">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Mark all read
                  </button>
                </div>

                <!-- Notification Category Tabs -->
                <div class="notif-sub-tabs">
                  <button [class.active]="notifFilter === 'all'" (click)="notifFilter = 'all'">All ({{ notifications.length }})</button>
                  <button [class.active]="notifFilter === 'unread'" (click)="notifFilter = 'unread'">Unread ({{ unreadCount }})</button>
                  <button [class.active]="notifFilter === 'alerts'" (click)="notifFilter = 'alerts'">Alerts ({{ alertCount }})</button>
                </div>

                <div class="notif-list">
                  <div *ngIf="filteredNotifications.length === 0" class="notif-empty-state">
                    <span class="empty-icon">🎉</span>
                    <p class="empty-title">All caught up!</p>
                    <small class="muted">No notifications under this filter.</small>
                  </div>
                  <div class="notif-item" *ngFor="let n of filteredNotifications" [class.unread]="!n.read" (click)="markRead(n)">
                    <div class="notif-icon-circle" [ngClass]="n.type">
                      {{ n.icon }}
                    </div>
                    <div class="notif-body">
                      <div class="notif-meta-row">
                        <span class="notif-tag" [ngClass]="n.type">{{ n.category }}</span>
                        <span class="notif-time">{{ n.time }}</span>
                      </div>
                      <div class="notif-title">{{ n.title }}</div>
                    </div>
                    <span class="notif-unread-dot" *ngIf="!n.read"></span>
                  </div>
                </div>

                <div class="notif-footer">
                  <a routerLink="/alerts" (click)="notifOpen=false" class="notif-view-link">
                    View all anomaly alerts center
                    <span class="arrow-icon">→</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Conditional Auth / Profile Section -->
            @if (auth.isLoggedIn()) {
              <!-- User Pill -->
              <div class="user-pill">
                <div class="user-avatar" [title]="auth.user()?.name || ''">{{ initials }}</div>
                <div class="user-info">
                  <span class="user-name">{{ auth.user()?.name }}</span>
                  <span class="user-role">{{ auth.user()?.role }}</span>
                </div>
                <button class="sign-out-btn" type="button" (click)="auth.logout()" title="Sign Out">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            } @else {
              <!-- Unauthenticated Action Buttons -->
              <div class="auth-action-group">
                <a routerLink="/login" class="nav-signin-btn">
                  <span>Sign In</span>
                </a>
                <a routerLink="/register" class="nav-register-btn">
                  <span>Request Access</span>
                </a>
              </div>
            }

            <!-- Mobile Hamburger Toggle -->
            <button class="mobile-toggle-btn" (click)="mobileMenuOpen = !mobileMenuOpen" [class.open]="mobileMenuOpen" aria-label="Toggle navigation">
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
            </button>
          </div>

        </div>

        <!-- Mobile Drawer Overlay & Menu -->
        @if (mobileMenuOpen) {
          <div class="mobile-drawer glass-panel" (click)="$event.stopPropagation()">
            <div class="mobile-nav-links">
              <a routerLink="/home" (click)="mobileMenuOpen=false" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="mobile-nav-item">
                <span class="m-icon">🏠</span>
                <span>Home</span>
              </a>
              <a routerLink="/dashboard" (click)="mobileMenuOpen=false" routerLinkActive="active" class="mobile-nav-item">
                <span class="m-icon">📊</span>
                <span>National Dashboard</span>
              </a>
              <a routerLink="/budgets" (click)="mobileMenuOpen=false" routerLinkActive="active" class="mobile-nav-item">
                <span class="m-icon">💰</span>
                <span>Budget Allocation</span>
              </a>
              <a routerLink="/expenditures" (click)="mobileMenuOpen=false" routerLinkActive="active" class="mobile-nav-item">
                <span class="m-icon">📑</span>
                <span>Expenditures</span>
              </a>
              <a routerLink="/reports" (click)="mobileMenuOpen=false" routerLinkActive="active" class="mobile-nav-item">
                <span class="m-icon">🏛️</span>
                <span>Departments</span>
              </a>
              <a routerLink="/alerts" (click)="mobileMenuOpen=false" routerLinkActive="active" class="mobile-nav-item">
                <span class="m-icon">🚨</span>
                <span>Anomaly Alerts</span>
                <span class="nav-alert-chip" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </a>
              <a routerLink="/blog" (click)="mobileMenuOpen=false" routerLinkActive="active" class="mobile-nav-item">
                <span class="m-icon">📰</span>
                <span>Fiscal Insights</span>
              </a>
              @if (auth.hasRole(['Admin'])) {
                <a routerLink="/admin" (click)="mobileMenuOpen=false" routerLinkActive="active" class="mobile-nav-item">
                  <span class="m-icon">⚙️</span>
                  <span>Admin Settings</span>
                </a>
              }
            </div>

            <div class="mobile-drawer-footer">
              @if (auth.isLoggedIn()) {
                <div class="mobile-user-row">
                  <div class="user-avatar">{{ initials }}</div>
                  <div class="mobile-user-meta">
                    <strong class="mobile-user-name">{{ auth.user()?.name }}</strong>
                    <span class="mobile-user-role">{{ auth.user()?.role }}</span>
                  </div>
                </div>
                <button class="btn btn-outline mobile-signout-btn" (click)="auth.logout(); mobileMenuOpen=false">Sign Out</button>
              } @else {
                <div class="mobile-auth-btns">
                  <a routerLink="/login" (click)="mobileMenuOpen=false" class="nav-signin-btn mobile-btn">Sign In</a>
                  <a routerLink="/register" (click)="mobileMenuOpen=false" class="nav-register-btn mobile-btn">Request Access</a>
                </div>
              }
            </div>
          </div>
        }
      </nav>

      <!-- ══ MAIN BODY (WITHOUT SIDEBAR) ══ -->
      <div class="shell-body">
        <div class="main-wrapper">
          <main class="main-content">
            <router-outlet />
          </main>

          <!-- ══ PRO ENTERPRISE FOOTER WITH SCROLLING MARQUEE (INTERNATIONALBUDGET.ORG STYLE) ══ -->
          <footer class="app-footer pro-footer">
            
            <!-- 1. Scrolling Continuous Marquee Ticker -->
            <div class="footer-marquee-strip">
              <div class="marquee-track">
                <div class="marquee-content">
                  <span class="marquee-item"><span class="m-dot">🏛️</span> Ministry of Finance</span>
                  <span class="marquee-item"><span class="m-dot">⚡</span> PFMS Central Gateway (99.98% SLA)</span>
                  <span class="marquee-item"><span class="m-dot">📊</span> NITI Aayog Fiscal Monitoring</span>
                  <span class="marquee-item"><span class="m-dot">⚖️</span> Comptroller &amp; Auditor General (CAG)</span>
                  <span class="marquee-item"><span class="m-dot">🏦</span> Reserve Bank of India</span>
                  <span class="marquee-item"><span class="m-dot">🌐</span> Digital India Governance</span>
                  <span class="marquee-item"><span class="m-dot">🇮🇳</span> 36 States &amp; Union Territories</span>
                  <span class="marquee-item"><span class="m-dot">💳</span> DBT Mission &amp; Aadhaar Bridge</span>
                  <span class="marquee-item"><span class="m-dot">🛒</span> GeM Public Procurement</span>
                  <span class="marquee-item"><span class="m-dot">📈</span> National Institute of Public Finance (NIPFP)</span>
                </div>
                <div class="marquee-content" aria-hidden="true">
                  <span class="marquee-item"><span class="m-dot">🏛️</span> Ministry of Finance</span>
                  <span class="marquee-item"><span class="m-dot">⚡</span> PFMS Central Gateway (99.98% SLA)</span>
                  <span class="marquee-item"><span class="m-dot">📊</span> NITI Aayog Fiscal Monitoring</span>
                  <span class="marquee-item"><span class="m-dot">⚖️</span> Comptroller &amp; Auditor General (CAG)</span>
                  <span class="marquee-item"><span class="m-dot">🏦</span> Reserve Bank of India</span>
                  <span class="marquee-item"><span class="m-dot">🌐</span> Digital India Governance</span>
                  <span class="marquee-item"><span class="m-dot">🇮🇳</span> 36 States &amp; Union Territories</span>
                  <span class="marquee-item"><span class="m-dot">💳</span> DBT Mission &amp; Aadhaar Bridge</span>
                  <span class="marquee-item"><span class="m-dot">🛒</span> GeM Public Procurement</span>
                  <span class="marquee-item"><span class="m-dot">📈</span> National Institute of Public Finance (NIPFP)</span>
                </div>
              </div>
            </div>

            <!-- 2. Top Telemetry Status Bar -->
            <div class="footer-telemetry-bar">
              <div class="telemetry-pill">
                <span class="live-pulse"></span>
                <span>PFMS Central Gateway: <strong>Active (99.98% SLA)</strong></span>
              </div>
              <div class="telemetry-pill">
                <span class="telemetry-icon">🔒</span>
                <span>AES-256 TLS Data Encryption</span>
              </div>
              <div class="telemetry-pill">
                <span class="telemetry-icon">⚡</span>
                <span>Telemetry Sync Latency: <strong>18.4ms</strong></span>
              </div>
              <div class="telemetry-pill">
                <span class="telemetry-icon">🏛️</span>
                <span>Ministry of Finance Verified: <strong>FY 2024-25</strong></span>
              </div>
            </div>

            <!-- 3. 4-Column Mega Grid -->
            <div class="footer-grid">
              <!-- Column 1: Brand & Mission -->
              <div class="footer-col brand-col">
                <div class="footer-brand-wrap">
                  <img src="/logo.png" alt="Logo" class="footer-logo" />
                  <div>
                    <strong class="footer-brand">Budget Monitor</strong>
                    <span class="footer-brand-sub">Government of India &bull; Fiscal Oversight</span>
                  </div>
                </div>
                <p class="footer-desc">
                  National AI-driven expenditure monitoring platform ensuring transparent budget utilization, automated anomaly detection, and real-time PFMS synchronization across all 36 States &amp; Union Territories.
                </p>
                <div class="trust-badge">
                  <span class="emblem-flag">🇮🇳</span>
                  <span>सत्यमेव जयते | Digital India Initiative</span>
                </div>
              </div>

              <!-- Column 2: Core Platform Modules -->
              <div class="footer-col">
                <strong class="footer-heading">Platform Modules</strong>
                <ul class="footer-links">
                  <li><a routerLink="/dashboard">National Utilization Dashboard</a></li>
                  <li><a routerLink="/budgets">Union Budget Allocation Matrix</a></li>
                  <li><a routerLink="/expenditures">Verified PFMS Expenditure Ledger</a></li>
                  <li><a routerLink="/reports">Departmental Utilization Audits</a></li>
                  <li><a routerLink="/alerts">Real-Time Anomaly Alerts</a></li>
                </ul>
              </div>

              <!-- Column 3: Intelligence & Governance -->
              <div class="footer-col">
                <strong class="footer-heading">Intelligence &amp; Governance</strong>
                <ul class="footer-links">
                  <li><a href="javascript:void(0)" (click)="openFinoraFromFooter()">Finora AI Budget Assistant</a></li>
                  <li><a routerLink="/blog">Fiscal Insights &amp; Policy Briefs</a></li>
                  <li><a routerLink="/admin">Anomaly Threshold Configuration</a></li>
                  <li><a routerLink="/admin">System Audit Logs &amp; Integrity</a></li>
                  <li><a href="javascript:void(0)">Public Transparency API Gateway</a></li>
                </ul>
              </div>

              <!-- Column 4: Helpdesk & Fiscal Digest -->
              <div class="footer-col digest-col">
                <strong class="footer-heading">National Fiscal Digest</strong>
                <p class="footer-desc">Subscribe to verified utilization digests and real-time treasury alerts.</p>
                
                <div class="digest-form">
                  <input type="email" [(ngModel)]="digestEmail" placeholder="officer@nic.in" />
                  <button class="btn btn-primary digest-btn" (click)="subscribeDigest()">
                    {{ subscribed ? 'Subscribed ✓' : 'Subscribe' }}
                  </button>
                </div>

                <div class="footer-contacts">
                  <div class="contact-line">
                    <span class="contact-label">NIC Helpdesk:</span>
                    <a href="mailto:pfms-support@nic.in" class="contact-val">pfms-support&#64;nic.in</a>
                  </div>
                  <div class="contact-line">
                    <span class="contact-label">Toll-Free:</span>
                    <span class="contact-val">1800-11-2026 (24x7 National Desk)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Bottom Legal & Compliance Bar -->
            <div class="footer-bottom">
              <div class="footer-bottom-left">
                <span>&copy; 2026 AI-Based Budget Utilization Monitoring System. All rights reserved. Government of India.</span>
                <span class="cert-pill">ISO 27001 Certified &bull; GIGW 2.0 Compliant</span>
              </div>
              <div class="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">RTI Disclosures</a>
                <a href="#">Cyber Security Guidelines</a>
                <span class="version-tag">v2.6.4 Enterprise</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <!-- ══ FLOATING SCROLL TO TOP BUTTON (EXACT IBP STYLE) ══ -->
      <button 
        id="scroll-btn" 
        [class.show]="showScrollTop" 
        (click)="scrollToTop()" 
        title="Scroll to Top"
        aria-label="Scroll to Top"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════
       GLASS TOP NAVBAR WITH MINIMAL FISCAL GREEN PALETTE
    ═══════════════════════════════════════════════════════ */
    .top-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      z-index: 1000;
      display: flex;
      align-items: center;
      padding: 0;
    }
    .glass-navbar {
      background: linear-gradient(90deg, rgba(255,255,255,0.97), rgba(244,249,248,0.98)) !important;
      backdrop-filter: blur(24px) saturate(200%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
      border-bottom: 1px solid rgba(13, 148, 136, 0.15) !important;
      box-shadow: 0 4px 24px rgba(8, 62, 72, 0.05) !important;
    }
    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1680px;
      margin: 0 auto;
      padding: 0 16px;
      gap: 8px;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .navbar-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 1 auto;
      min-width: 0;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ── BRAND ── */
    .brand { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      text-decoration: none;
      cursor: pointer;
      flex-shrink: 0;
    }
    .brand-logo { 
      width: 35px; 
      height: 35px; 
      object-fit: contain; 
      filter: drop-shadow(0 3px 8px rgba(13, 148, 136, 0.3)); 
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .brand:hover .brand-logo {
      transform: scale(1.08) rotate(-4deg);
    }
    .brand-text { line-height: 1.15; }
    .brand-name { 
      background: linear-gradient(135deg, #0D9488, #083E48); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent; 
      font-size: 1.08rem; 
      font-weight: 800; 
      display: block; 
      letter-spacing: -0.02em; 
      white-space: nowrap;
    }
    .brand-sub { 
      color: #0F766E; 
      font-size: 0.68rem; 
      display: block; 
      font-weight: 600; 
      white-space: nowrap;
    }

    /* ── HORIZONTAL NAV LINKS IN CENTER ── */
    .navbar-nav-links {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 3px 4px;
      background: rgba(240, 253, 250, 0.75);
      border: 1px solid rgba(13, 148, 136, 0.2);
      border-radius: 9999px;
      flex-shrink: 0;
      flex-wrap: nowrap;
    }
    .top-nav-item {
      display: inline-flex;
      align-items: center;
      padding: 5px 10px;
      border-radius: 9999px;
      font-size: 0.81rem;
      font-weight: 600;
      color: #334155;
      text-decoration: none;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      white-space: nowrap;
    }
    .top-nav-item:hover {
      color: #0D9488;
      background: rgba(255, 255, 255, 0.9);
      transform: translateY(-1px);
    }
    .top-nav-item.active {
      color: #ffffff;
      background: linear-gradient(135deg, #0D9488, #0F766E);
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.32);
    }
    .nav-alert-chip {
      font-size: 0.62rem;
      font-weight: 800;
      background: #E11D48;
      color: #ffffff;
      padding: 1px 5px;
      border-radius: 9999px;
      margin-left: 5px;
      box-shadow: 0 2px 5px rgba(225, 29, 72, 0.3);
    }
    .top-nav-item.active .nav-alert-chip {
      background: #ffffff;
      color: #E11D48;
    }

    /* ── INTERACTIVE QUICK SEARCH BAR ── */
    .search-wrap { 
      position: relative; 
      flex-shrink: 0;
    }
    .search-input-box {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.9);
      border: 1.5px solid rgba(13, 148, 136, 0.25);
      border-radius: 9999px;
      padding: 0 8px 0 32px;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
      cursor: text;
    }
    .search-wrap.active .search-input-box,
    .search-input-box:focus-within {
      background: #ffffff;
      border-color: #0D9488;
      box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.15), 0 8px 20px rgba(15, 23, 42, 0.08);
      transform: scale(1.01);
    }
    .search-svg-icon {
      position: absolute;
      left: 10px;
      color: #0D9488;
      transition: color 0.2s, transform 0.2s;
    }
    .search-input-box:focus-within .search-svg-icon {
      color: #0F766E;
      transform: scale(1.1);
    }
    .search-input {
      width: 130px;
      padding: 0.42rem 0.2rem;
      border: none;
      background: transparent;
      font-size: 0.8rem;
      color: var(--text-heading);
      outline: none;
      transition: width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .search-input-box:focus-within .search-input,
    .search-wrap.active .search-input {
      width: 190px;
    }
    .clear-search-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 2px 6px;
      border-radius: 50%;
      transition: all 0.15s;
    }
    .clear-search-btn:hover {
      background: #E2E8F0;
      color: #1E293B;
    }
    .search-kbd {
      background: rgba(240, 253, 250, 0.9);
      border: 1px solid rgba(13, 148, 136, 0.3);
      border-radius: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #0F766E;
      padding: 1px 5px;
      pointer-events: none;
      font-family: inherit;
    }

    /* Quick Search Dropdown */
    .search-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 420px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border: 1px solid rgba(13, 148, 136, 0.2);
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 45px -10px rgba(8, 62, 72, 0.18), 0 0 0 1px rgba(13, 148, 136, 0.12);
      z-index: 1200;
      overflow: hidden;
      animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top right;
    }
    .search-dropdown-header {
      padding: 12px 16px;
      background: rgba(240, 253, 250, 0.85);
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
      font-size: 0.76rem;
      font-weight: 700;
      color: #083E48;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .search-results-list {
      max-height: 360px;
      overflow-y: auto;
      padding: 6px 0;
    }
    .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      cursor: pointer;
      transition: all 0.15s ease;
      border-left: 3px solid transparent;
    }
    .search-result-item:hover {
      background: rgba(13, 148, 136, 0.08);
      border-left-color: #0D9488;
      padding-left: 20px;
    }
    .search-item-icon {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      flex-shrink: 0;
      background: rgba(240, 253, 250, 0.8);
      border: 1px solid rgba(13, 148, 136, 0.2);
    }
    .search-item-icon.scheme { background: rgba(13, 148, 136, 0.12); border-color: rgba(13, 148, 136, 0.25); color: #0D9488; }
    .search-item-icon.state  { background: rgba(5, 150, 105, 0.12); border-color: rgba(5, 150, 105, 0.25); color: #059669; }
    .search-item-icon.module { background: rgba(217, 119, 6, 0.12); border-color: rgba(217, 119, 6, 0.25); color: #D97706; }

    .search-item-info {
      flex: 1;
      min-width: 0;
    }
    .search-item-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }
    .search-item-title {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--text-heading);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .search-item-category-tag {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 5px;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }
    .search-item-category-tag.scheme { background: rgba(13, 148, 136, 0.15); color: #0D9488; }
    .search-item-category-tag.state  { background: rgba(5, 150, 105, 0.15); color: #059669; }
    .search-item-category-tag.module { background: rgba(217, 119, 6, 0.15); color: #D97706; }

    .search-item-subtitle {
      font-size: 0.72rem;
      color: var(--text-muted);
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .search-item-arrow {
      color: #94A3B8;
      font-size: 0.85rem;
      transition: transform 0.2s, color 0.2s;
    }
    .search-result-item:hover .search-item-arrow {
      transform: translateX(4px);
      color: #0D9488;
    }
    .search-no-results {
      padding: 24px;
      text-align: center;
    }
    .no-res-icon { font-size: 1.8rem; display: block; margin-bottom: 6px; }
    .search-dropdown-footer {
      padding: 8px 16px;
      background: rgba(240, 253, 250, 0.8);
      border-top: 1px solid rgba(13, 148, 136, 0.15);
      font-size: 0.7rem;
      color: #0F766E;
      text-align: center;
    }

    /* ═══════════════════════════════════════════════════════
       NOTIFICATIONS
    ═══════════════════════════════════════════════════════ */
    .notif-wrap { position: relative; }
    .icon-btn {
      display: flex; 
      align-items: center; 
      justify-content: center;
      width: 40px; 
      height: 40px; 
      border-radius: 50%;
      border: 1px solid rgba(13, 148, 136, 0.25);
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      cursor: pointer;
      position: relative;
      transition: all var(--dur-fast) var(--ease-spring);
      box-shadow: 0 2px 8px rgba(8, 62, 72, 0.04);
      color: #083E48;
    }
    .icon-btn:hover {
      background: #ffffff;
      border-color: #0D9488;
      transform: scale(1.08) translateY(-1px);
      box-shadow: 0 6px 16px rgba(13, 148, 136, 0.25);
      color: #0D9488;
    }
    .icon-btn:hover .bell-icon {
      animation: bellSwing 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
    @keyframes bellSwing {
      0%   { transform: rotate(0); }
      20%  { transform: rotate(14deg); }
      40%  { transform: rotate(-12deg); }
      60%  { transform: rotate(8deg); }
      80%  { transform: rotate(-4deg); }
      100% { transform: rotate(0); }
    }
    .notif-dot {
      position: absolute; 
      top: -1px; 
      right: -1px;
      min-width: 17px; 
      height: 17px; 
      padding: 0 4px;
      background: linear-gradient(135deg, #EF4444, #BE123C);
      border-radius: 9999px;
      font-size: 0.62rem; 
      font-weight: 800;
      color: #fff;
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.45);
    }
    .notif-ping {
      position: absolute;
      inset: -4px;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.4);
      animation: pingGlow 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      z-index: -1;
    }
    @keyframes pingGlow {
      75%, 100% { transform: scale(1.8); opacity: 0; }
    }

    /* Glass Notification Panel */
    .notif-panel {
      position: absolute; 
      top: calc(100% + 12px); 
      right: 0;
      width: 380px;
      background: rgba(255,255,255,0.98);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border: 1px solid rgba(13, 148, 136, 0.2);
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 45px -10px rgba(8, 62, 72, 0.18), 0 0 0 1px rgba(13, 148, 136, 0.1);
      z-index: 1200;
      overflow: hidden;
      animation: scaleIn var(--dur-moderate) var(--ease-spring);
      transform-origin: top right;
    }
    .notif-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: var(--space-4) var(--space-5) var(--space-3);
      background: rgba(240, 253, 250, 0.7);
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
    }
    .notif-title-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .notif-title-group strong {
      font-size: 0.92rem;
      color: #083E48;
      font-weight: 700;
    }
    .notif-badge-pill {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.12rem 0.5rem;
      background: #CCFBF1;
      color: #0F766E;
      border-radius: 9999px;
      border: 1px solid rgba(13, 148, 136, 0.25);
    }
    .mark-all-btn {
      display: inline-flex;
      align-items: center;
      font-size: var(--text-xs);
      color: #0D9488;
      background: rgba(13, 148, 136, 0.1);
      padding: 0.3rem 0.65rem;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s var(--ease-spring);
    }
    .mark-all-btn:hover {
      background: #0D9488;
      color: #fff;
      transform: translateY(-1px);
    }
    .notif-sub-tabs {
      display: flex;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-4);
      background: rgba(240, 253, 250, 0.5);
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
    }
    .notif-sub-tabs button {
      flex: 1;
      padding: 0.32rem 0.45rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .notif-sub-tabs button:hover {
      color: #0D9488;
      background: rgba(255, 255, 255, 0.6);
    }
    .notif-sub-tabs button.active {
      color: #fff;
      background: linear-gradient(135deg, #0D9488, #0F766E);
      box-shadow: 0 2px 6px rgba(13, 148, 136, 0.3);
    }
    .notif-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .notif-item {
      display: flex; 
      align-items: flex-start; 
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease-out);
      position: relative;
      border-bottom: 1px solid rgba(148,163,184,0.12);
    }
    .notif-item.unread {
      background: linear-gradient(90deg, rgba(13, 148, 136, 0.06) 0%, transparent 100%);
    }
    .notif-item:hover {
      background: rgba(240, 253, 250, 0.9);
      padding-left: 20px;
    }
    .notif-icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
      background: rgba(148, 163, 184, 0.12);
      border: 1px solid rgba(148, 163, 184, 0.2);
    }
    .notif-icon-circle.danger  { background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.25); }
    .notif-icon-circle.warning { background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.25); }
    .notif-icon-circle.success { background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.25); }
    .notif-icon-circle.primary { background: rgba(13, 148, 136, 0.12); border-color: rgba(13, 148, 136, 0.25); }
    .notif-body  { flex: 1; min-width: 0; }
    .notif-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .notif-tag {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .notif-tag.danger  { color: #E11D48; }
    .notif-tag.warning { color: #D97706; }
    .notif-tag.success { color: #059669; }
    .notif-tag.primary { color: #0D9488; }
    .notif-title { font-size: 0.8rem; color: var(--text-heading); font-weight: 500; line-height: 1.3; }
    .notif-time  { font-size: 0.7rem; color: var(--text-muted); font-weight: 500; }
    .notif-unread-dot {
      width: 7px; 
      height: 7px;
      background: #0D9488;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 6px;
      box-shadow: 0 0 6px rgba(13, 148, 136, 0.7);
    }
    .notif-empty-state {
      padding: var(--space-5) var(--space-4);
      text-align: center;
    }
    .empty-icon { font-size: 2rem; display: block; margin-bottom: var(--space-2); }
    .empty-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-heading); margin-bottom: 2px; }
    .notif-footer {
      padding: var(--space-3) var(--space-4);
      background: rgba(240, 253, 250, 0.7);
      border-top: 1px solid rgba(13, 148, 136, 0.15);
      text-align: center;
    }
    .notif-view-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: #0D9488;
      font-size: 0.74rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .notif-view-link:hover { color: #0F766E; }
    .notif-view-link:hover .arrow-icon { transform: translateX(3px); }

    /* ── AUTH ACTION GROUP (LOGGED OUT) ── */
    .auth-action-group {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-left: var(--space-2);
    }
    .nav-signin-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 15px;
      font-size: 0.84rem;
      font-weight: 600;
      color: #334155;
      background: rgba(255, 255, 255, 0.9);
      border: 1.5px solid rgba(13, 148, 136, 0.35);
      border-radius: 9999px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-signin-btn:hover {
      color: #0D9488;
      border-color: #0D9488;
      background: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
    }
    .nav-register-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 18px;
      font-size: 0.84rem;
      font-weight: 700;
      color: #ffffff;
      background: linear-gradient(135deg, #0D9488, #083E48);
      border: 1.5px solid transparent;
      border-radius: 9999px;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
    }
    .nav-register-btn:hover {
      transform: translateY(-1px) scale(1.02);
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.4);
    }

    /* ── USER PILL (LOGGED IN) ── */
    .user-pill {
      display: flex; 
      align-items: center; 
      gap: 10px;
      padding-left: var(--space-3);
      border-left: 1px solid rgba(13, 148, 136, 0.3);
    }
    .user-avatar {
      width: 36px; 
      height: 36px; 
      border-radius: 50%;
      background: linear-gradient(135deg, #0D9488, #083E48);
      color: #fff; 
      font-weight: 800; 
      font-size: 0.88rem;
      display: flex; 
      align-items: center; 
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 3px 10px rgba(13, 148, 136, 0.3);
      transition: transform var(--dur-fast) var(--ease-spring);
    }
    .user-pill:hover .user-avatar { transform: scale(1.08) rotate(4deg); }
    .user-info   { display: flex; flex-direction: column; line-height: 1.15; }
    .user-name   { font-weight: 700; font-size: 0.82rem; color: var(--text-heading); white-space: nowrap; }
    .user-role   { font-size: 0.68rem; color: var(--text-muted); font-weight: 500; }
    .sign-out-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.74rem; 
      font-weight: 600;
      padding: 0.35rem 0.65rem; 
      background: rgba(148, 163, 184, 0.12);
      color: #64748B;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .sign-out-btn:hover {
      background: #FFE4E6;
      color: #E11D48;
      transform: translateY(-1px);
    }

    /* ── MOBILE HAMBURGER BUTTON ── */
    .mobile-toggle-btn {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 38px;
      height: 38px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(13, 148, 136, 0.3);
      border-radius: 8px;
      cursor: pointer;
      padding: 8px;
    }
    .hamburger-bar {
      width: 100%;
      height: 2px;
      background: #083E48;
      border-radius: 2px;
      transition: all 0.25s ease;
    }
    .mobile-toggle-btn.open .hamburger-bar:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .mobile-toggle-btn.open .hamburger-bar:nth-child(2) {
      opacity: 0;
    }
    .mobile-toggle-btn.open .hamburger-bar:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* ── MOBILE DRAWER ── */
    .mobile-drawer {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.99);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(13, 148, 136, 0.25);
      box-shadow: 0 20px 40px rgba(8, 62, 72, 0.15);
      padding: 16px 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      text-decoration: none;
      color: #334155;
      font-size: 0.92rem;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .mobile-nav-item:hover, .mobile-nav-item.active {
      background: rgba(13, 148, 136, 0.1);
      color: #0D9488;
    }
    .m-icon { font-size: 1.1rem; }
    .mobile-drawer-footer {
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      padding-top: 16px;
    }
    .mobile-user-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .mobile-user-name { font-size: 0.9rem; color: #0F172A; display: block; }
    .mobile-user-role { font-size: 0.72rem; color: #64748B; }
    .mobile-signout-btn { width: 100%; }
    .mobile-auth-btns {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .mobile-btn { width: 100%; text-align: center; }

    /* ═══════════════════════════════════════════════════════
       PRO ENTERPRISE SOVEREIGN FOOTER WITH SCROLLING MARQUEE
    ═══════════════════════════════════════════════════════ */
    .pro-footer {
      background: linear-gradient(180deg, #073B45 0%, #031F24 100%);
      color: #E2E8F0;
      border-top: 1px solid rgba(45, 212, 191, 0.25);
      box-shadow: 0 -8px 32px rgba(3, 31, 36, 0.4);
      padding: 0;
      margin-top: auto;
      position: relative;
    }

    /* 1. Scrolling Continuous Marquee Ticker */
    .footer-marquee-strip {
      overflow: hidden;
      background: rgba(3, 23, 27, 0.95);
      border-bottom: 1px solid rgba(45, 212, 191, 0.18);
      padding: 11px 0;
      white-space: nowrap;
      user-select: none;
    }
    .marquee-track {
      display: flex;
      width: max-content;
      animation: scrollMarquee 32s linear infinite;
    }
    .marquee-track:hover {
      animation-play-state: paused;
    }
    @keyframes scrollMarquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-content {
      display: flex;
      align-items: center;
      gap: 40px;
      padding-right: 40px;
    }
    .marquee-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      color: #CCFBF1;
      letter-spacing: 0.02em;
    }
    .m-dot {
      font-size: 0.95rem;
    }

    /* 2. Top Telemetry Status Bar */
    .footer-telemetry-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px var(--space-6);
      background: rgba(4, 34, 40, 0.9);
      border-bottom: 1px solid rgba(45, 212, 191, 0.15);
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.76rem;
      color: #99F6E4;
    }
    .telemetry-pill {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .live-pulse {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10B981;
      animation: pulseGreen 1.5s infinite;
    }
    .telemetry-pill strong {
      color: #FFFFFF;
      font-weight: 700;
    }
    .telemetry-icon {
      font-size: 0.85rem;
    }

    /* 3. 4-Column Grid */
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.2fr 1.6fr;
      gap: var(--space-6);
      padding: var(--space-7) var(--space-6) var(--space-6);
    }
    .footer-brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .footer-logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(45, 212, 191, 0.4));
    }
    .footer-brand {
      color: #5EEAD4;
      font-size: 1.25rem;
      font-weight: 800;
      display: block;
      line-height: 1.1;
    }
    .footer-brand-sub {
      font-size: 0.75rem;
      color: #99F6E4;
      font-weight: 600;
    }
    .footer-desc {
      color: #94A3B8;
      font-size: 0.84rem;
      line-height: 1.6;
      margin-bottom: 16px;
      max-width: 320px;
    }
    .trust-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(45, 212, 191, 0.3);
      border-radius: 8px;
      font-size: 0.74rem;
      font-weight: 700;
      color: #F0FDFA;
    }
    .emblem-flag {
      font-size: 1.1rem;
    }

    .footer-heading {
      font-size: 0.82rem;
      color: #F0FDFA;
      display: block;
      margin-bottom: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-links a {
      color: #CCFBF1;
      text-decoration: none;
      font-size: 0.84rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: inline-block;
    }
    .footer-links a:hover {
      color: #F59E0B;
      transform: translateX(4px);
    }

    /* Digest column */
    .digest-form {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .digest-form input {
      flex: 1;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid rgba(45, 212, 191, 0.3);
      background: rgba(255, 255, 255, 0.1);
      font-size: 0.84rem;
      color: #FFFFFF;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .digest-form input::placeholder {
      color: #94A3B8;
    }
    .digest-form input:focus {
      border-color: #2DD4BF;
      box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.25);
      background: rgba(255, 255, 255, 0.16);
    }
    .digest-btn {
      padding: 8px 16px;
      font-size: 0.82rem;
      border-radius: 10px;
      white-space: nowrap;
      background: linear-gradient(135deg, #0D9488, #059669);
    }

    .footer-contacts {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.78rem;
    }
    .contact-line {
      display: flex;
      gap: 6px;
    }
    .contact-label {
      color: #94A3B8;
      font-weight: 600;
    }
    .contact-val {
      color: #5EEAD4;
      font-weight: 600;
      text-decoration: none;
    }
    a.contact-val:hover {
      color: #F59E0B;
    }

    /* 4. Bottom Legal Bar */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px var(--space-6);
      border-top: 1px solid rgba(45, 212, 191, 0.15);
      font-size: 0.76rem;
      color: #94A3B8;
      background: rgba(3, 23, 27, 0.95);
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-bottom-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .cert-pill {
      background: rgba(45, 212, 191, 0.12);
      color: #5EEAD4;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.72rem;
    }
    .footer-legal {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footer-legal a {
      color: #94A3B8;
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer-legal a:hover {
      color: #5EEAD4;
    }
    .version-tag {
      font-weight: 700;
      color: #5EEAD4;
      background: rgba(45, 212, 191, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* ══ FLOATING SCROLL TO TOP BUTTON (IBP STYLE) ══ */
    #scroll-btn {
      opacity: 0;
      visibility: hidden;
      width: 44px;
      height: 44px;
      color: #ffffff;
      background: linear-gradient(135deg, #083E48, #0D9488);
      position: fixed;
      right: 28px;
      bottom: 28px;
      border: 1.5px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      box-shadow: 0 6px 20px rgba(8, 62, 72, 0.35);
      transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s;
      z-index: 990;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    #scroll-btn.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(-4px);
    }
    #scroll-btn:hover {
      transform: translateY(-8px) scale(1.08);
      background: linear-gradient(135deg, #0D9488, #0F766E);
      box-shadow: 0 10px 25px rgba(13, 148, 136, 0.45);
    }

    /* ═══════════════════════════════════════════════════════
       ANIMATIONS & RESPONSIVE MEDIA QUERIES (LAPTOP, TABLET, MOBILE)
    ═══════════════════════════════════════════════════════ */
    @keyframes pulseGreen {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95) translateY(-6px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Laptop Responsive Adjustments (1240px - 1420px) */
    @media (max-width: 1420px) {
      .navbar-nav-links .top-nav-item {
        padding: 5px 8px;
        font-size: 0.78rem;
      }
      .brand-sub { display: none; }
      .search-input { width: 110px; }
      .search-input-box:focus-within .search-input,
      .search-wrap.active .search-input { width: 160px; }
      .user-name { max-width: 95px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }

    /* Laptop Compact (1024px - 1240px) */
    @media (max-width: 1240px) {
      .navbar-container { padding: 0 10px; gap: 6px; }
      .navbar-nav-links .top-nav-item {
        padding: 4px 6px;
        font-size: 0.74rem;
      }
      .search-input { width: 85px; }
      .search-input-box:focus-within .search-input,
      .search-wrap.active .search-input { width: 140px; }
      .search-kbd { display: none; }
    }

    /* Tablet Responsive Adjustments (768px - 1024px) */
    @media (max-width: 1024px) {
      .navbar-center { display: none; }
      .mobile-toggle-btn { display: flex; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      #scroll-btn { right: 20px; bottom: 20px; }
    }

    /* Mobile Responsive Adjustments (< 768px) */
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr; }
      .user-info { display: none; }
      .search-wrap { display: none; }
      .footer-telemetry-bar { flex-direction: column; align-items: flex-start; }
      #scroll-btn { right: 18px; bottom: 18px; width: 38px; height: 38px; }
    }
  `]
})
export class ShellComponent {
  private router = inject(Router);
  
  mobileMenuOpen = false;
  notifOpen = false;
  searchOpen = false;
  searchQuery = '';
  notifFilter: 'all' | 'unread' | 'alerts' = 'all';
  digestEmail = '';
  subscribed = false;
  showScrollTop = false;

  // Search Index & Shortcuts (100% India-Centric)
  searchCatalog: SearchItem[] = [
    // Flagship Central Schemes
    { title: 'Samagra Shiksha Scheme', category: 'Scheme', subtitle: 'Ministry of Education &amp; Literacy', icon: '🎓', route: '/budgets', queryParams: { scheme: 'Samagra Shiksha' } },
    { title: 'National Health Mission (NHM)', category: 'Scheme', subtitle: 'Ministry of Health &amp; Family Welfare', icon: '🏥', route: '/budgets', queryParams: { scheme: 'NHM' } },
    { title: 'Pradhan Mantri Awas Yojana (PMAY)', category: 'Scheme', subtitle: 'Ministry of Housing &amp; Urban Affairs', icon: '🏠', route: '/budgets', queryParams: { scheme: 'PMAY' } },
    { title: 'Jal Jeevan Mission (Har Ghar Jal)', category: 'Scheme', subtitle: 'Department of Drinking Water &amp; Sanitation', icon: '🚰', route: '/budgets', queryParams: { scheme: 'Jal Jeevan' } },
    { title: 'PMGSY Rural Connectivity', category: 'Scheme', subtitle: 'Ministry of Rural Development', icon: '🛣️', route: '/budgets', queryParams: { scheme: 'PMGSY' } },

    // State Deep Dives
    { title: 'Maharashtra State Analytics', category: 'State', subtitle: 'Fiscal Run-rate: 76.5% | ₹2.84L Cr Grant', icon: '📍', route: '/dashboard', queryParams: { state: 'Maharashtra' } },
    { title: 'Uttar Pradesh Utilization Matrix', category: 'State', subtitle: 'Fiscal Run-rate: 68.2% | ₹3.12L Cr Grant', icon: '📍', route: '/dashboard', queryParams: { state: 'Uttar Pradesh' } },
    { title: 'Tamil Nadu Trajectory & Milestones', category: 'State', subtitle: 'Fiscal Run-rate: 71.4% | ₹2.10L Cr Grant', icon: '📍', route: '/dashboard', queryParams: { state: 'Tamil Nadu' } },
    { title: 'Gujarat Infrastructure Ledger', category: 'State', subtitle: 'Fiscal Run-rate: 82.1% | ₹1.95L Cr Grant', icon: '📍', route: '/dashboard', queryParams: { state: 'Gujarat' } },
    { title: 'Karnataka Public Works & Tech', category: 'State', subtitle: 'Fiscal Run-rate: 64.9% | ₹1.82L Cr Grant', icon: '📍', route: '/dashboard', queryParams: { state: 'Karnataka' } },
    { title: 'Bihar Health & Rural Infrastructure', category: 'State', subtitle: 'Fiscal Run-rate: 59.4% | ₹1.74L Cr Grant', icon: '📍', route: '/dashboard', queryParams: { state: 'Bihar' } },

    // Core System Modules
    { title: 'Home National Portal', category: 'Module', subtitle: 'National budget overview, summits & policy research', icon: '🏛️', route: '/home' },
    { title: 'India Budget Transparency Review 2025', category: 'Module', subtitle: 'National transparency benchmarks & district audit scores', icon: '🌐', route: '/home' },
    { title: 'Public Finance Insights & Analysis', category: 'Module', subtitle: 'Peer-reviewed articles, DBT studies & treasury policy briefs', icon: '📰', route: '/blog' },
    { title: 'Active Anomaly Alerts & Deviations', category: 'Module', subtitle: '21 Open anomalies requiring official action', icon: '🚨', route: '/alerts' },
    { title: 'Department Utilization Audits', category: 'Module', subtitle: 'Comparative cross-department absorption reports', icon: '🏛️', route: '/reports' },
    { title: 'PFMS Expenditure Ledger', category: 'Module', subtitle: 'Itemized vouchers, invoices, and transaction logs', icon: '📑', route: '/expenditures' },
    { title: 'Union Budget Allocation Matrix', category: 'Module', subtitle: 'FY 2024-25 scheme-wise grants & allocations', icon: '💰', route: '/budgets' },
    { title: 'National Utilization Dashboard', category: 'Module', subtitle: 'India Heatmap, macro KPIs, and velocity charts', icon: '📊', route: '/dashboard' }
  ];

  notifications = [
    { id:1, type:'danger',  category:'UnderUtilization', icon:'🚨', title:'Samagra Shiksha FY25-26 spend lagging at 34%', time:'2h ago', read:false },
    { id:2, type:'warning', category:'Spike Anomaly',     icon:'⚡', title:'PMAY-U bulk voucher ₹420 Cr in single day', time:'5h ago', read:false },
    { id:3, type:'warning', category:'Pace Deviation',    icon:'📉', title:'National Health Mission running 18% below trajectory', time:'Yesterday', read:false },
    { id:4, type:'success', category:'Milestone Review',  icon:'✅', title:'Quarterly fiscal review report generated successfully', time:'2d ago', read:true },
    { id:5, type:'primary', category:'System Config',     icon:'📋', title:'Anomaly detection thresholds updated by Admin', time:'3d ago', read:true },
  ];

  constructor(readonly auth: AuthService) {}

  get unreadCount() { return this.notifications.filter(n => !n.read).length; }
  get alertCount() { return this.notifications.filter(n => n.type === 'danger' || n.type === 'warning').length; }

  get filteredNotifications() {
    if (this.notifFilter === 'unread') return this.notifications.filter(n => !n.read);
    if (this.notifFilter === 'alerts') return this.notifications.filter(n => n.type === 'danger' || n.type === 'warning');
    return this.notifications;
  }

  get filteredSearchItems() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.searchCatalog;
    return this.searchCatalog.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }

  get initials() {
    const name = this.auth.user()?.name || '';
    return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('');
  }

  toggleNotif(e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) this.searchOpen = false;
  }

  markRead(n: any) { n.read = true; }
  markAllRead()    { this.notifications.forEach(n => n.read = true); }

  openSearch(e: MouseEvent) {
    e.stopPropagation();
    this.searchOpen = true;
    this.notifOpen = false;
  }

  clearSearch(e: MouseEvent) {
    e.stopPropagation();
    this.searchQuery = '';
  }

  navigateTo(item: SearchItem) {
    this.searchOpen = false;
    this.searchQuery = '';
    if (item.queryParams) {
      this.router.navigate([item.route], { queryParams: item.queryParams });
    } else {
      this.router.navigate([item.route]);
    }
  }

  openFinoraFromFooter() {
    const toggleBtn = document.querySelector('.launcher-container') as HTMLElement;
    if (toggleBtn) {
      toggleBtn.click();
    }
  }

  subscribeDigest() {
    if (this.digestEmail && this.digestEmail.includes('@')) {
      this.subscribed = true;
      setTimeout(() => {
        this.digestEmail = '';
      }, 3000);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 300;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.notif-wrap')) {
      this.notifOpen = false;
    }
    if (!target.closest('.search-wrap')) {
      this.searchOpen = false;
    }
    if (!target.closest('.mobile-toggle-btn') && !target.closest('.mobile-drawer')) {
      this.mobileMenuOpen = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    // Ctrl+K or Cmd+K opens search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.searchOpen = true;
      const input = document.querySelector('.search-input') as HTMLInputElement;
      if (input) input.focus();
    }
    // Escape closes search & notifications
    if (e.key === 'Escape') {
      this.searchOpen = false;
      this.notifOpen = false;
      this.mobileMenuOpen = false;
    }
  }
}
