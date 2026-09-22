import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Department, Role } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="gov-auth-viewport">
      <!-- ══════════════════════════════════════════════════════════
           1. AMBIENT FINANCIAL & BUDGET THEMED BACKGROUND
      ══════════════════════════════════════════════════════════ -->

      <!-- Light Subtle Gradient Washes (Executive Saffron, Fiscal Teal, Emerald) -->
      <div class="ambient-light-wash">
        <div class="wash-orb orb-teal"></div>
        <div class="wash-orb orb-emerald"></div>
        <div class="wash-orb orb-saffron"></div>
        <div class="wash-orb orb-sky"></div>
      </div>

      <!-- Financial Dot Matrix & Coordinate Grid -->
      <div class="financial-grid-pattern"></div>

      <!-- ══════════════════════════════════════════════════════════
           2. ANIMATED FINANCIAL SPLINE GRAPHS & FISCAL CHARTS
      ══════════════════════════════════════════════════════════ -->
      
      <!-- Vector Financial Trendlines (Undulating Spline Curves) -->
      <div class="bg-financial-charts">
        <!-- Top Undulating Spline Graph -->
        <svg class="spline-chart spline-top" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="regBudgetGradTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0D9488" stop-opacity="0.22" />
              <stop offset="50%" stop-color="#10B981" stop-opacity="0.20" />
              <stop offset="100%" stop-color="#0284C7" stop-opacity="0.15" />
            </linearGradient>
            <linearGradient id="regFillGradTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0D9488" stop-opacity="0.06" />
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path class="animated-area" d="M0,160 C320,240 480,80 800,140 C1120,200 1280,60 1440,110 L1440,320 L0,320 Z" fill="url(#regFillGradTop)" />
          <path class="animated-spline spline-1" d="M0,160 C320,240 480,80 800,140 C1120,200 1280,60 1440,110" stroke="url(#regBudgetGradTop)" stroke-width="2.5" stroke-linecap="round" />
          <path class="animated-spline spline-dashed" d="M0,200 C280,110 540,230 900,170 C1200,120 1350,180 1440,150" stroke="#0D9488" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="6,8" />
        </svg>

        <!-- Bottom Wave Spline -->
        <svg class="spline-chart spline-bottom" viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="regBudgetGradBottom" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#10B981" stop-opacity="0.2" />
              <stop offset="60%" stop-color="#0D9488" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#083E48" stop-opacity="0.20" />
            </linearGradient>
          </defs>
          <path class="animated-spline spline-2" d="M0,140 C240,60 520,210 820,130 C1100,60 1320,170 1440,120" stroke="url(#regBudgetGradBottom)" stroke-width="2.2" stroke-linecap="round" />
        </svg>

        <!-- Subtle Left & Right Financial Bar Graph Silhouettes -->
        <div class="bg-bars-cluster cluster-left">
          <div class="fin-bar bar-1"></div>
          <div class="fin-bar bar-2"></div>
          <div class="fin-bar bar-3"></div>
          <div class="fin-bar bar-4"></div>
          <div class="fin-bar bar-5"></div>
        </div>

        <div class="bg-bars-cluster cluster-right">
          <div class="fin-bar bar-6"></div>
          <div class="fin-bar bar-7"></div>
          <div class="fin-bar bar-8"></div>
          <div class="fin-bar bar-9"></div>
          <div class="fin-bar bar-10"></div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════
           3. MOVING INDIAN RUPEE & BUDGET TELEMETRY BADGES
      ══════════════════════════════════════════════════════════ -->
      
      <!-- Floating Indian Rupee (₹) Financial Symbols -->
      <div class="floating-currency-symbols" aria-hidden="true">
        <!-- Floating Rupee Disc 1 (Top Left) -->
        <div class="rupee-coin coin-1">
          <span class="rupee-char">₹</span>
          <span class="coin-glint"></span>
        </div>
        <!-- Floating Rupee Disc 2 (Top Right) -->
        <div class="rupee-coin coin-2">
          <span class="rupee-char">₹</span>
        </div>
        <!-- Floating Rupee Disc 3 (Bottom Left) -->
        <div class="rupee-coin coin-3">
          <span class="rupee-char">₹</span>
        </div>
        <!-- Floating Rupee Disc 4 (Bottom Right) -->
        <div class="rupee-coin coin-4">
          <span class="rupee-char">₹</span>
        </div>

        <!-- Ambient Floating Currency & Percentage Glyphs -->
        <span class="float-glyph glyph-1">PFMS</span>
        <span class="float-glyph glyph-2">₹ Cr</span>
        <span class="float-glyph glyph-3">NIC-GOV</span>
        <span class="float-glyph glyph-4">▲ Access</span>
        <span class="float-glyph glyph-5">ISO 27001</span>
        <span class="float-glyph glyph-6">₹ Lakh Cr</span>
      </div>

      <!-- Floating Minimal Live Registration Badges -->
      <div class="live-fiscal-chips">
        <div class="fiscal-chip chip-top-left">
          <span class="chip-dot dot-emerald"></span>
          <span class="chip-label">Official Portal: <strong>Clearance Verified</strong></span>
          <span class="chip-tag">Secure</span>
        </div>

        <div class="fiscal-chip chip-top-right">
          <span class="chip-icon">🏛️</span>
          <span class="chip-label">Role-Based: <strong>Admin / Officer / Head</strong></span>
        </div>

        <div class="fiscal-chip chip-bottom-left">
          <span class="chip-icon">🔒</span>
          <span class="chip-label">Encrypted: <strong>AES-256 TLS</strong></span>
        </div>

        <div class="fiscal-chip chip-bottom-right">
          <span class="chip-icon">🇮🇳</span>
          <span class="chip-label">Public Finance: <strong>NIC Platform</strong></span>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════
           4. 3D PEARLESCENT METALLIC LIGHT CARD CONTAINER
      ══════════════════════════════════════════════════════════ -->
      <div 
        class="gov-card-wrapper"
        [class.shake-card]="shaking"
        (mousemove)="onMouseMove($event)"
        (mouseleave)="onMouseLeave()"
        [style.transform]="cardTransform"
      >
        <!-- Soft Ambient Light Glow Behind Card -->
        <div class="card-ambient-shadow"></div>

        <!-- Main Light Glassmorphic Card -->
        <div class="gov-auth-card">
          <!-- Dynamic Pearlescent Glare Highlight (Tracks Cursor) -->
          <div 
            class="pearlescent-glare" 
            [style.opacity]="glareOpacity"
            [style.background]="glareBackground"
          ></div>

          <!-- Top Official Header -->
          <div class="gov-brand-header">
            <div class="logo-bezel-container">
              <img src="/logo.png" alt="Official Budget Monitor Logo" class="gov-logo-img" />
              <div class="logo-soft-halo"></div>
            </div>

            <div class="gov-tricolor-badge">
              <span class="badge-flag">🇮🇳</span>
              <span class="badge-title">GOVERNMENT OF INDIA &bull; PUBLIC FINANCE</span>
            </div>

            <h1 class="portal-main-title">Request Access</h1>
            <p class="portal-tagline">Department Official &amp; Financial Authority Registration</p>

            <div class="reg-notice-pill">
              <span class="notice-icon">ℹ️</span>
              <span>Initial registration grants Central Admin rights. Subsequent accounts require verified Admin clearance.</span>
            </div>
          </div>

          <!-- Error Banner -->
          @if (error) {
            <div class="gov-error-banner animate-fade-in" role="alert">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ error }}</span>
            </div>
          }

          <!-- Success Info Banner -->
          @if (info) {
            <div class="gov-success-banner animate-fade-in" role="alert">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{{ info }}</span>
            </div>
          }

          <!-- Form Fields -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="gov-form-fields">
            
            <!-- Full Name Input -->
            <div class="form-input-group">
              <div class="label-meta-row">
                <label for="reg-name" class="gov-field-label">Full Name &amp; Title</label>
                <span class="gov-field-hint">e.g. Officer / Director</span>
              </div>
              <div class="gov-input-capsule" [class.input-error]="form.controls.name.touched && form.controls.name.invalid">
                <span class="capsule-prefix-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input
                  id="reg-name"
                  type="text"
                  formControlName="name"
                  autocomplete="name"
                  placeholder="e.g. Subhradeep Kundu"
                  class="gov-text-input"
                />
              </div>
              @if (form.controls.name.touched && form.controls.name.invalid) {
                <small class="gov-error-hint">Full name is required (minimum 2 characters).</small>
              }
            </div>

            <!-- Email Input -->
            <div class="form-input-group">
              <div class="label-meta-row">
                <label for="reg-email" class="gov-field-label">Official Email Address</label>
                <span class="gov-field-hint">PFMS / NIC Email</span>
              </div>
              <div class="gov-input-capsule" [class.input-error]="form.controls.email.touched && form.controls.email.invalid">
                <span class="capsule-prefix-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  id="reg-email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  placeholder="name@budgetmonitor.gov.in"
                  class="gov-text-input"
                />
              </div>
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <small class="gov-error-hint">Please enter a valid government or organizational email.</small>
              }
            </div>

            <!-- Password Input -->
            <div class="form-input-group">
              <div class="label-meta-row">
                <label for="reg-password" class="gov-field-label">Security Password</label>
                <span class="security-level-tag">Min 8 Chars</span>
              </div>
              <div class="gov-input-capsule" [class.input-error]="form.controls.password.touched && form.controls.password.invalid">
                <span class="capsule-prefix-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  id="reg-password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="new-password"
                  placeholder="Create strong security password"
                  class="gov-text-input"
                />
                <button 
                  type="button" 
                  class="pwd-visibility-toggle" 
                  (click)="showPassword = !showPassword"
                  title="{{ showPassword ? 'Hide password' : 'Show password' }}"
                  aria-label="Toggle password visibility"
                >
                  <svg *ngIf="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg *ngIf="showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <small class="gov-error-hint">Password must be at least 8 characters with secure credentials.</small>
              }
            </div>

            <!-- Role Selection (Universal Styled Dropdown) -->
            <div class="form-input-group">
              <div class="label-meta-row">
                <label for="reg-role" class="gov-field-label">Authorized Role</label>
                <span class="gov-field-hint">Access Hierarchy</span>
              </div>
              <div class="gov-select-capsule">
                <span class="capsule-prefix-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </span>
                <select id="reg-role" formControlName="role" class="gov-select-control">
                  <option value="Admin">Admin &bull; Full Central Authority</option>
                  <option value="FinanceOfficer">Finance Officer &bull; Allocation &amp; Audit Oversight</option>
                  <option value="DepartmentHead">Department Head &bull; Ministry/Sector Lead</option>
                  <option value="User">User &bull; Senior Budget Analyst</option>
                </select>
                <span class="select-chevron-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            </div>

            <!-- Department Selection (if DepartmentHead) -->
            @if (form.controls.role.value === 'DepartmentHead') {
              <div class="form-input-group animate-fade-in">
                <div class="label-meta-row">
                  <label for="reg-dept" class="gov-field-label">Assigned Department</label>
                  <span class="gov-field-hint">Portfolio Lead</span>
                </div>
                <div class="gov-select-capsule">
                  <span class="capsule-prefix-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="9" y1="22" x2="9" y2="22.01"></line>
                      <line x1="15" y1="22" x2="15" y2="22.01"></line>
                      <line x1="12" y1="18" x2="12" y2="18.01"></line>
                      <line x1="12" y1="14" x2="12" y2="14.01"></line>
                      <line x1="12" y1="10" x2="12" y2="10.01"></line>
                      <line x1="12" y1="6" x2="12" y2="6.01"></line>
                    </svg>
                  </span>
                  <select id="reg-dept" formControlName="departmentId" class="gov-select-control">
                    <option value="">Select Government Department</option>
                    @for (d of departments; track d._id) {
                      <option [value]="d._id">{{ d.name }}</option>
                    }
                  </select>
                  <span class="select-chevron-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            }

            <!-- Submit Button with 3D Bevel & Light Sheen -->
            <button
              class="gov-submit-btn"
              type="submit"
              [disabled]="form.invalid || loading"
            >
              <div class="sheen-light-sweep"></div>
              @if (loading) {
                <div class="gov-btn-spinner"></div>
                <span>Creating Authorized Account…</span>
              } @else {
                <span class="btn-caption">Register &amp; Request Authorization</span>
                <span class="btn-arrow-symbol">→</span>
              }
            </button>
          </form>

          <!-- Back to Login Link -->
          <p class="gov-register-link-row">
            Already have an authorized credential? 
            <a routerLink="/login" class="gov-anchor-link">Back to Sign In →</a>
          </p>

          <!-- Official Portal Security Seal -->
          <div class="gov-security-footer">
            <div class="sec-item">
              <span class="sec-icon">🔒</span>
              <span>NIC Verified</span>
            </div>
            <span class="sec-divider">&bull;</span>
            <div class="sec-item">
              <span>Digital India</span>
            </div>
            <span class="sec-divider">&bull;</span>
            <div class="sec-item">
              <span>ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ══════════════════════════════════════════════════════════════════
       ELEGANT LIGHT THEME GOVERNMENT BUDGET REGISTER / ACCESS PAGE
    ══════════════════════════════════════════════════════════════════ */
    :host {
      display: block;
      width: 100%;
    }

    .gov-auth-viewport {
      min-height: 100vh;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      /* Refined Government Public Portal Light Background */
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #EFF6FF 100%);
      padding: 40px 20px;
      box-sizing: border-box;
      perspective: 1200px;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ══ 1. AMBIENT LIGHT MESH WASHES ══ */
    .ambient-light-wash {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .wash-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      will-change: transform;
      animation: floatWash 24s ease-in-out infinite alternate;
    }

    .orb-teal {
      top: -8%;
      left: 12%;
      width: 580px;
      height: 580px;
      background: radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, rgba(13, 148, 136, 0.01) 60%, transparent 80%);
      animation-duration: 26s;
    }

    .orb-emerald {
      bottom: -10%;
      right: 14%;
      width: 540px;
      height: 540px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, rgba(16, 185, 129, 0.01) 60%, transparent 80%);
      animation-duration: 30s;
      animation-delay: -5s;
    }

    .orb-saffron {
      top: 30%;
      right: -5%;
      width: 460px;
      height: 460px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.01) 60%, transparent 80%);
      animation-duration: 22s;
      animation-delay: -10s;
    }

    .orb-sky {
      bottom: 20%;
      left: -6%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.07) 0%, rgba(14, 165, 233, 0.01) 60%, transparent 80%);
      animation-duration: 28s;
      animation-delay: -14s;
    }

    @keyframes floatWash {
      0%   { transform: translate(0px, 0px) scale(1); }
      50%  { transform: translate(35px, 25px) scale(1.08); }
      100% { transform: translate(-25px, 35px) scale(0.95); }
    }

    /* ══ FINANCIAL DOT-MATRIX / COORDINATE GRID ══ */
    .financial-grid-pattern {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background-image: 
        radial-gradient(rgba(148, 163, 184, 0.22) 1.2px, transparent 1.2px),
        linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px);
      background-size: 36px 36px, 108px 108px, 108px 108px;
      mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.3) 80%, transparent 100%);
      -webkit-mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.3) 80%, transparent 100%);
    }

    /* ══ 2. BACKGROUND FINANCIAL SPLINE CHARTS & TRENDLINES ══ */
    .bg-financial-charts {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      overflow: hidden;
    }

    .spline-chart {
      position: absolute;
      width: 100%;
      left: 0;
    }

    .spline-top {
      top: 0;
      height: 320px;
    }

    .spline-bottom {
      bottom: 0;
      height: 280px;
    }

    .animated-spline {
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: drawSpline 12s ease-in-out infinite alternate;
    }

    .spline-1 {
      animation-duration: 16s;
    }

    .spline-2 {
      animation-duration: 20s;
      animation-delay: -3s;
    }

    .spline-dashed {
      stroke-dasharray: 8, 8;
      animation: dashStream 35s linear infinite;
    }

    @keyframes drawSpline {
      0%   { stroke-dashoffset: 600; opacity: 0.6; }
      50%  { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: -300; opacity: 0.7; }
    }

    @keyframes dashStream {
      from { stroke-dashoffset: 0; }
      to   { stroke-dashoffset: -1000; }
    }

    .animated-area {
      animation: areaFloat 12s ease-in-out infinite alternate;
    }

    @keyframes areaFloat {
      0%   { transform: translateY(0); opacity: 0.8; }
      100% { transform: translateY(8px); opacity: 1; }
    }

    /* Financial Bar Graph Silhouettes */
    .bg-bars-cluster {
      position: absolute;
      bottom: 80px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      opacity: 0.45;
    }

    .cluster-left {
      left: 40px;
    }

    .cluster-right {
      right: 40px;
    }

    .fin-bar {
      width: 14px;
      border-radius: 6px 6px 0 0;
      background: linear-gradient(180deg, rgba(13, 148, 136, 0.25) 0%, rgba(13, 148, 136, 0.04) 100%);
      animation: barOscillate 6s ease-in-out infinite alternate;
      border-top: 2px solid rgba(13, 148, 136, 0.4);
    }

    .bar-1 { height: 60px;  animation-delay: 0s; }
    .bar-2 { height: 95px;  animation-delay: 0.8s; background: linear-gradient(180deg, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0.04) 100%); border-color: rgba(16, 185, 129, 0.45); }
    .bar-3 { height: 130px; animation-delay: 1.6s; }
    .bar-4 { height: 80px;  animation-delay: 2.4s; }
    .bar-5 { height: 110px; animation-delay: 1.2s; background: linear-gradient(180deg, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0.04) 100%); border-color: rgba(14, 165, 233, 0.4); }

    .bar-6 { height: 120px; animation-delay: 0.4s; }
    .bar-7 { height: 75px;  animation-delay: 1.8s; background: linear-gradient(180deg, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0.04) 100%); border-color: rgba(16, 185, 129, 0.45); }
    .bar-8 { height: 140px; animation-delay: 2.8s; }
    .bar-9 { height: 90px;  animation-delay: 1.4s; background: linear-gradient(180deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.04) 100%); border-color: rgba(245, 158, 11, 0.4); }
    .bar-10 { height: 65px; animation-delay: 0.9s; }

    @keyframes barOscillate {
      0%   { transform: scaleY(0.85); }
      100% { transform: scaleY(1.18); }
    }

    /* ══ 3. MOVING RUPEE SYMBOLS & TELEMETRY ══ */
    .floating-currency-symbols {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
    }

    .rupee-coin {
      position: absolute;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      user-select: none;
      box-shadow: 
        0 10px 25px -5px rgba(15, 23, 42, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: coinFloat 14s ease-in-out infinite alternate;
    }

    .coin-1 {
      top: 14%;
      left: 9%;
      width: 58px;
      height: 58px;
      font-size: 1.6rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 250, 0.85));
      border: 1.5px solid rgba(13, 148, 136, 0.35);
      color: #0D9488;
      animation-duration: 16s;
    }

    .coin-2 {
      top: 18%;
      right: 10%;
      width: 68px;
      height: 68px;
      font-size: 1.9rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(236, 253, 245, 0.85));
      border: 1.5px solid rgba(16, 185, 129, 0.35);
      color: #059669;
      animation-duration: 20s;
      animation-delay: -4s;
    }

    .coin-3 {
      bottom: 16%;
      left: 11%;
      width: 52px;
      height: 52px;
      font-size: 1.45rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 249, 255, 0.85));
      border: 1.5px solid rgba(14, 165, 233, 0.35);
      color: #0284C7;
      animation-duration: 18s;
      animation-delay: -8s;
    }

    .coin-4 {
      bottom: 22%;
      right: 12%;
      width: 48px;
      height: 48px;
      font-size: 1.35rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 243, 199, 0.85));
      border: 1.5px solid rgba(245, 158, 11, 0.35);
      color: #D97706;
      animation-duration: 22s;
      animation-delay: -12s;
    }

    @keyframes coinFloat {
      0%   { transform: translateY(0px) rotate(0deg); }
      50%  { transform: translateY(-22px) rotate(8deg); }
      100% { transform: translateY(14px) rotate(-6deg); }
    }

    .float-glyph {
      position: absolute;
      font-weight: 700;
      color: #64748B;
      opacity: 0.4;
      letter-spacing: 0.05em;
      animation: glyphDrift 24s ease-in-out infinite alternate;
      user-select: none;
    }

    .glyph-1 { top: 38%; left: 6%; font-size: 1.15rem; color: #0D9488; animation-delay: 0s; }
    .glyph-2 { top: 52%; right: 7%; font-size: 0.95rem; color: #059669; animation-delay: -6s; }
    .glyph-3 { bottom: 35%; left: 8%; font-size: 0.9rem; color: #0284C7; animation-delay: -12s; }
    .glyph-4 { top: 8%; left: 32%; font-size: 1rem; color: #0F766E; animation-delay: -18s; }
    .glyph-5 { bottom: 10%; right: 28%; font-size: 1.1rem; color: #0D9488; animation-delay: -4s; }
    .glyph-6 { top: 12%; right: 30%; font-size: 0.85rem; color: #D97706; animation-delay: -10s; }

    @keyframes glyphDrift {
      0%   { transform: translate(0, 0); opacity: 0.3; }
      50%  { transform: translate(18px, -18px); opacity: 0.6; }
      100% { transform: translate(-14px, 14px); opacity: 0.35; }
    }

    .live-fiscal-chips {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
    }

    .fiscal-chip {
      position: absolute;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(203, 213, 225, 0.8);
      border-radius: 999px;
      box-shadow: 
        0 8px 20px -4px rgba(15, 23, 42, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.02);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      font-size: 0.82rem;
      color: #334155;
      font-weight: 500;
      animation: chipLevitate 12s ease-in-out infinite alternate;
    }

    .chip-top-left {
      top: 60px;
      left: 70px;
      animation-duration: 13s;
    }

    .chip-top-right {
      top: 65px;
      right: 70px;
      animation-duration: 15s;
      animation-delay: -4s;
    }

    .chip-bottom-left {
      bottom: 55px;
      left: 70px;
      animation-duration: 16s;
      animation-delay: -8s;
    }

    .chip-bottom-right {
      bottom: 60px;
      right: 70px;
      animation-duration: 14s;
      animation-delay: -12s;
    }

    @keyframes chipLevitate {
      0%   { transform: translateY(0); }
      100% { transform: translateY(-12px); }
    }

    .chip-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot-emerald {
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: pulseDot 2s ease-in-out infinite;
    }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.3); opacity: 0.6; }
    }

    .chip-tag {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }

    /* ══ 4. 3D CARD WRAPPER & GLASSMORPHIC CONTAINER ══ */
    .gov-card-wrapper {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 500px;
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      transform-style: preserve-3d;
      will-change: transform;
    }

    .shake-card {
      animation: cardShake 0.36s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @keyframes cardShake {
      10%, 90% { transform: translate3d(-3px, 0, 0); }
      20%, 80% { transform: translate3d(5px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
      40%, 60% { transform: translate3d(5px, 0, 0); }
    }

    .card-ambient-shadow {
      position: absolute;
      inset: -4px;
      border-radius: 28px;
      background: radial-gradient(circle at 50% 50%, rgba(13, 148, 136, 0.14), rgba(16, 185, 129, 0.08) 50%, transparent 80%);
      filter: blur(24px);
      z-index: -1;
      opacity: 0.75;
      transition: opacity 0.3s ease;
    }

    .gov-auth-card {
      position: relative;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-radius: 24px;
      padding: 36px 36px 30px;
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: 
        0 25px 50px -12px rgba(15, 23, 42, 0.09),
        0 0 0 1px rgba(226, 232, 240, 0.85),
        0 8px 24px -4px rgba(13, 148, 136, 0.06);
      overflow: hidden;
      transform-style: preserve-3d;
    }

    .pearlescent-glare {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 25;
      border-radius: 24px;
      transition: opacity 0.25s ease;
      mix-blend-mode: overlay;
    }

    /* ══ BRAND HEADER ══ */
    .gov-brand-header {
      text-align: center;
      margin-bottom: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo-bezel-container {
      position: relative;
      width: 64px;
      height: 64px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gov-logo-img {
      width: 54px;
      height: 54px;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 6px 12px rgba(15, 23, 42, 0.12));
    }

    .logo-soft-halo {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(13, 148, 136, 0.22) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 75%);
      animation: pulseLogoHalo 4s ease-in-out infinite alternate;
      z-index: 1;
    }

    @keyframes pulseLogoHalo {
      0%   { transform: scale(0.92); opacity: 0.5; }
      100% { transform: scale(1.15); opacity: 0.9; }
    }

    .gov-tricolor-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #334155;
      margin-bottom: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }

    .badge-flag {
      font-size: 0.82rem;
    }

    .portal-main-title {
      font-size: 1.8rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0F172A;
      margin: 0 0 6px;
      background: linear-gradient(135deg, #0F172A 40%, #083E48 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .portal-tagline {
      font-size: 0.85rem;
      color: #64748B;
      margin: 0 0 12px;
      font-weight: 500;
      line-height: 1.45;
      max-width: 360px;
    }

    .reg-notice-pill {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      padding: 8px 12px;
      background: #EFF6FF;
      border: 1px solid #DBEAFE;
      border-radius: 10px;
      font-size: 0.74rem;
      color: #1E40AF;
      line-height: 1.4;
      text-align: left;
    }

    .notice-icon {
      flex-shrink: 0;
      font-size: 0.82rem;
    }

    /* ══ BANNERS ══ */
    .gov-error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 12px;
      color: #DC2626;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 18px;
      box-shadow: 0 2px 6px rgba(220, 38, 38, 0.06);
    }

    .gov-success-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 12px;
      color: #059669;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 18px;
      box-shadow: 0 2px 6px rgba(5, 150, 105, 0.06);
    }

    .animate-fade-in {
      animation: fadeInAlert 0.3s ease-out;
    }

    @keyframes fadeInAlert {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ══ FORM CONTROLS ══ */
    .gov-form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-input-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .label-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .gov-field-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #1E293B;
      letter-spacing: 0.01em;
    }

    .gov-field-hint {
      font-size: 0.72rem;
      color: #94A3B8;
      font-weight: 500;
    }

    .security-level-tag {
      font-size: 0.68rem;
      font-weight: 600;
      color: #0D9488;
      background: #F0FDFA;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid #CCFBF1;
    }

    /* Input Capsule */
    .gov-input-capsule {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 12px;
      padding: 2px 14px;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .gov-input-capsule:focus-within {
      border-color: #0D9488;
      background: #FFFFFF;
      box-shadow: 
        0 0 0 4px rgba(13, 148, 136, 0.12),
        0 4px 12px rgba(13, 148, 136, 0.06);
      transform: translateY(-1px);
    }

    .gov-input-capsule.input-error {
      border-color: #EF4444;
      background: #FFF5F5;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .capsule-prefix-icon {
      color: #94A3B8;
      display: flex;
      align-items: center;
      margin-right: 10px;
      transition: color 0.2s ease;
      flex-shrink: 0;
    }

    .gov-input-capsule:focus-within .capsule-prefix-icon {
      color: #0D9488;
    }

    .gov-text-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.92rem;
      color: #0F172A;
      font-weight: 500;
      padding: 10px 0;
      min-width: 0;
    }

    .gov-text-input::placeholder {
      color: #94A3B8;
      font-weight: 400;
    }

    .pwd-visibility-toggle {
      background: transparent;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.18s ease;
    }

    .pwd-visibility-toggle:hover {
      color: #1E293B;
      background: #F1F5F9;
    }

    /* Select Dropdown Capsule */
    .gov-select-capsule {
      position: relative;
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 12px;
      padding: 0 14px;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .gov-select-capsule:focus-within {
      border-color: #0D9488;
      box-shadow: 
        0 0 0 4px rgba(13, 148, 136, 0.12),
        0 4px 12px rgba(13, 148, 136, 0.06);
      transform: translateY(-1px);
    }

    .gov-select-capsule:focus-within .capsule-prefix-icon {
      color: #0D9488;
    }

    .gov-select-control {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.88rem;
      color: #0F172A;
      font-weight: 600;
      padding: 11px 26px 11px 0;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      min-width: 0;
    }

    .gov-select-control option {
      background: #FFFFFF;
      color: #0F172A;
      font-weight: 500;
      padding: 8px 12px;
    }

    .select-chevron-icon {
      position: absolute;
      right: 12px;
      pointer-events: none;
      color: #0D9488;
      display: flex;
      align-items: center;
      transition: transform 0.2s ease;
    }

    .gov-select-capsule:focus-within .select-chevron-icon {
      transform: rotate(180deg);
      color: #083E48;
    }

    .gov-error-hint {
      font-size: 0.74rem;
      color: #EF4444;
      font-weight: 500;
      margin-top: 2px;
    }

    /* ══ SUBMIT BUTTON ══ */
    .gov-submit-btn {
      position: relative;
      overflow: hidden;
      margin-top: 6px;
      width: 100%;
      height: 48px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(135deg, #0D9488 0%, #0F766E 50%, #083E48 100%);
      color: #FFFFFF;
      font-size: 0.94rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      box-shadow: 
        0 10px 25px -4px rgba(13, 148, 136, 0.35),
        0 2px 4px rgba(0, 0, 0, 0.06),
        inset 0 1px 1px rgba(255, 255, 255, 0.25);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .gov-submit-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 
        0 14px 30px -4px rgba(13, 148, 136, 0.45),
        0 4px 10px rgba(0, 0, 0, 0.1),
        inset 0 1px 1px rgba(255, 255, 255, 0.35);
    }

    .gov-submit-btn:active:not(:disabled) {
      transform: translateY(1px) scale(0.99);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
    }

    .gov-submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .sheen-light-sweep {
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
      transform: skewX(-20deg);
      transition: left 0.75s ease;
    }

    .gov-submit-btn:hover .sheen-light-sweep {
      left: 140%;
    }

    .btn-arrow-symbol {
      font-size: 1.1rem;
      transition: transform 0.2s ease;
    }

    .gov-submit-btn:hover .btn-arrow-symbol {
      transform: translateX(3px);
    }

    .gov-btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spinSpinner 0.7s linear infinite;
    }

    @keyframes spinSpinner {
      to { transform: rotate(360deg); }
    }

    /* ══ BACK TO SIGN IN ══ */
    .gov-register-link-row {
      text-align: center;
      margin: 18px 0 0;
      font-size: 0.82rem;
      color: #64748B;
      font-weight: 500;
    }

    .gov-anchor-link {
      color: #0D9488;
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
      transition: color 0.15s ease;
    }

    .gov-anchor-link:hover {
      color: #083E48;
      text-decoration: underline;
    }

    /* ══ SECURITY FOOTER ══ */
    .gov-security-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 22px;
      font-size: 0.72rem;
      color: #94A3B8;
      font-weight: 500;
    }

    .sec-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .sec-divider {
      color: #CBD5E1;
    }

    /* ══ RESPONSIVE ADAPTATIONS ══ */
    @media (max-width: 1024px) {
      .live-fiscal-chips { display: none; }
      .bg-bars-cluster { display: none; }
    }

    @media (max-width: 640px) {
      .gov-auth-viewport {
        padding: 20px 14px;
      }
      .gov-auth-card {
        padding: 28px 20px 24px;
        border-radius: 20px;
      }
      .portal-main-title {
        font-size: 1.55rem;
      }
      .floating-currency-symbols {
        display: none;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  loading = false;
  shaking = false;
  showPassword = false;
  error: string | null = null;
  info: string | null = null;
  departments: Department[] = [];

  // 3D Tilt and Pearlescent Glare State
  cardTransform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  glareOpacity = 0;
  glareBackground = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 70%)';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['Admin' as Role, Validators.required],
    departmentId: [''],
  });

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.api.departments().subscribe({
        next: (res) => (this.departments = res.data),
        error: () => (this.departments = []),
      });
    }
  }

  onMouseMove(e: MouseEvent) {
    const cardEl = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - cardEl.left;
    const y = e.clientY - cardEl.top;
    const centerX = cardEl.width / 2;
    const centerY = cardEl.height / 2;

    // Gentle 3D tilt calculation
    const rotateX = ((y - centerY) / centerY) * -5.5;
    const rotateY = ((x - centerX) / centerX) * 5.5;

    this.cardTransform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    
    // Position pearlescent light sheen over the cursor
    const glareX = ((x / cardEl.width) * 100).toFixed(1);
    const glareY = ((y / cardEl.height) * 100).toFixed(1);
    this.glareOpacity = 0.55;
    this.glareBackground = `radial-gradient(circle 380px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 80%)`;
  }

  onMouseLeave() {
    this.cardTransform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    this.glareOpacity = 0;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.triggerShake();
      return;
    }
    this.loading = true;
    this.error = null;
    this.info = null;
    const v = this.form.getRawValue();
    this.auth
      .register({
        name: v.name!,
        email: v.email!,
        password: v.password!,
        role: v.role!,
        departmentId: v.role === 'DepartmentHead' ? v.departmentId : null,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.accessToken) {
            this.router.navigate(['/dashboard']);
          } else {
            this.info = 'Account successfully registered. You can now sign in.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error || 'Registration request could not be completed. Please verify details.';
          this.triggerShake();
        },
      });
  }

  private triggerShake() {
    this.shaking = false;
    setTimeout(() => { this.shaking = true; }, 10);
    setTimeout(() => { this.shaking = false; }, 360);
  }
}
