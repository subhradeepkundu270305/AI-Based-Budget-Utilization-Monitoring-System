import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogDataService, BlogPost } from '../../core/blog-data.service';
import { HoverTiltDirective } from '../../shared/hover-tilt.directive';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HoverTiltDirective],
  template: `
    <div *ngIf="!selectedArticle" class="insights-container">
      <!-- Unified Aligned Page Header -->
      <header class="insights-header-box animate-fade-in-up">
        <div class="head-pill-tag">
          <span class="pulse-beacon"></span>
          <span>Sovereign Fiscal Intelligence &amp; Policy Telemetry</span>
        </div>
        <h1 class="page-title">Insights &amp; Fiscal Analysis</h1>
        <p class="page-subtitle">
          Empirical investigations on public expenditure velocity, treasury single accounts, DBT pipelining, and scheme utilization across India's 36 States and UTs.
        </p>
      </header>

      <!-- Symmetric Category Navigation Bar -->
      <nav class="category-nav-bar animate-fade-in-up delay-100" aria-label="Article categories">
        <div class="category-pills-row">
          <button 
            *ngFor="let cat of categories" 
            class="category-btn"
            [class.active]="selectedCategory === cat"
            (click)="filterByCategory(cat)">
            <span class="cat-name">{{ cat }}</span>
            <span class="cat-count">{{ getCategoryCount(cat) }}</span>
          </button>
        </div>
      </nav>

      <!-- Hero Article with 3D Metallic Depth -->
      <section 
        *ngIf="featuredArticle && selectedCategory === 'All'" 
        class="hero-article animate-fade-in-up delay-200" 
        appHoverTilt 
        [maxTilt]="3"
        (click)="openArticle(featuredArticle)">
        
        <div class="hero-metallic-bar"></div>
        
        <div class="hero-image-wrap">
          <div class="hero-image" [style.backgroundImage]="'url(' + featuredArticle.imageUrl + ')'"></div>
          <div class="hero-image-overlay"></div>
          <div class="hero-badge-overlay">
            <span class="hero-featured-pill">
              <span class="sparkle-icon">★</span>
              <span>Featured National Analysis</span>
            </span>
          </div>
        </div>

        <div class="hero-content">
          <div class="hero-meta-top">
            <span class="badge badge-primary-subtle">{{ featuredArticle.category }}</span>
            <span class="hero-read-time">
              <svg class="clock-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ featuredArticle.readTime }}
            </span>
          </div>

          <h2 class="hero-title">{{ featuredArticle.title }}</h2>
          <p class="hero-excerpt">{{ featuredArticle.excerpt }}</p>

          <div class="hero-footer">
            <div class="hero-author-meta">
              <div class="hero-avatar">{{ featuredArticle.author.charAt(0) }}</div>
              <div class="hero-author-info">
                <strong class="hero-author-name">{{ featuredArticle.author }}</strong>
                <span class="hero-date">{{ featuredArticle.date }}</span>
              </div>
            </div>

            <button class="hero-cta-btn">
              <span>Read Full Analysis</span>
              <svg class="cta-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Article Grid (Balanced 4x2 Layout with Metallic 3D Visual Depth) -->
      <section class="blog-grid">
        <article 
          *ngFor="let post of gridArticles; let i = index" 
          class="blog-card card animate-fade-in-up" 
          [ngStyle]="{'animation-delay': (120 + (i * 45)) + 'ms'}"
          appHoverTilt
          [maxTilt]="5"
          (click)="openArticle(post)">
          
          <!-- 3D Metallic Top Shimmer Bar -->
          <div class="card-metallic-shimmer"></div>

          <!-- Card Image Wrap with Parallax Hover Zoom & Floating Badges -->
          <div class="card-img-wrap">
            <div class="card-img" [style.backgroundImage]="'url(' + post.imageUrl + ')'"></div>
            <div class="card-img-overlay"></div>
            
            <div class="card-badges-floating">
              <span class="category-chip">
                <span class="chip-dot"></span>
                {{ post.category }}
              </span>
              <span class="read-chip">
                <svg class="clock-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {{ post.readTime }}
              </span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="card-body">
            <h3 class="card-title">{{ post.title }}</h3>
            <p class="card-excerpt">{{ post.excerpt }}</p>
            
            <div class="card-footer">
              <div class="author-meta">
                <div class="author-avatar-mini">{{ post.author.charAt(0) }}</div>
                <div class="author-info">
                  <span class="author-name">{{ post.author }}</span>
                  <span class="author-date">{{ post.date }}</span>
                </div>
              </div>

              <div class="card-action-btn" title="Read Insight">
                <svg class="action-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>

    <!-- Article Detail View -->
    <div *ngIf="selectedArticle" class="article-detail animate-fade-in-up">
      <button class="btn-back-insights" (click)="closeArticle()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back to Insights</span>
      </button>

      <div class="article-header">
        <div class="detail-tag-row">
          <span class="badge badge-primary-subtle">{{ selectedArticle.category }}</span>
          <span class="detail-read-pill">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ selectedArticle.readTime }}
          </span>
        </div>

        <h1 class="article-heading">{{ selectedArticle.title }}</h1>
        
        <div class="meta-large">
          <div class="author-block">
            <div class="avatar">{{ selectedArticle.author.charAt(0) }}</div>
            <div>
              <strong class="author-title">{{ selectedArticle.author }}</strong>
              <div class="muted detail-date-line">Published {{ selectedArticle.date }} &bull; Verified Fiscal Report</div>
            </div>
          </div>
          <div class="detail-share-badge">
            <span class="official-dot"></span>
            <span>Audited Telemetry</span>
          </div>
        </div>
      </div>

      <div class="article-hero-wrap">
        <img [src]="selectedArticle.imageUrl" [alt]="selectedArticle.title" class="article-hero-img" />
        <div class="article-hero-caption">Photo telemetry: verified public finance and policy documentation archive</div>
      </div>

      <div class="article-body">
        <div class="lead-box">
          <div class="lead-quote-mark">“</div>
          <p class="lead">{{ selectedArticle.excerpt }}</p>
        </div>
        
        <!-- Structured Content Formatting with Numbered Point Cards -->
        <div class="content-text" [innerHTML]="formatContent(selectedArticle.content)"></div>
        
        <!-- Related Articles Section -->
        <div class="related-section">
          <div class="related-header">
            <h3>Related Policy Insights</h3>
            <span class="related-subtitle">Continue exploring public expenditure analyses</span>
          </div>

          <div class="blog-grid related-grid">
            <article 
              *ngFor="let rel of relatedArticles" 
              class="blog-card card" 
              appHoverTilt
              [maxTilt]="5"
              (click)="openArticle(rel)">
              <div class="card-metallic-shimmer"></div>
              <div class="card-img-wrap" style="height: 150px;">
                <div class="card-img" [style.backgroundImage]="'url(' + rel.imageUrl + ')'"></div>
                <div class="card-img-overlay"></div>
                <div class="card-badges-floating">
                  <span class="category-chip">{{ rel.category }}</span>
                </div>
              </div>
              <div class="card-body" style="padding: 1.25rem;">
                <h3 class="card-title" style="font-size: 1.05rem; -webkit-line-clamp: 2;">{{ rel.title }}</h3>
                <div class="card-footer" style="padding-top: 0.75rem; margin-top: 0.5rem;">
                  <span class="author-name" style="font-size: 0.8rem;">{{ rel.author }}</span>
                  <span class="card-action-btn" style="width: 28px; height: 28px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .insights-container {
      max-width: 1400px;
      margin: 0 auto;
      padding-bottom: 3.5rem;
    }

    /* ══ UNIFIED LEFT-ALIGNED HEADER ══ */
    .insights-header-box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      margin-bottom: 2rem;
    }

    .head-pill-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: rgba(13, 148, 136, 0.08);
      border: 1px solid rgba(13, 148, 136, 0.22);
      color: #0F766E;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .pulse-beacon {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #0D9488;
      box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.6);
      animation: beaconPulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes beaconPulse {
      0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.6); }
      70% { box-shadow: 0 0 0 8px rgba(13, 148, 136, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
    }

    .page-title {
      font-size: 2.35rem;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.025em;
      margin: 0 0 0.55rem 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 1.05rem;
      color: #475569;
      max-width: 820px;
      line-height: 1.6;
      margin: 0;
    }

    /* ══ SYMMETRIC CATEGORY NAVIGATION PILLS ══ */
    .category-nav-bar {
      margin-bottom: 2.5rem;
      width: 100%;
    }

    .category-pills-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.6rem;
    }

    .category-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 1rem;
      border-radius: 999px;
      border: 1px solid rgba(203, 213, 225, 0.75);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: #334155;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .category-btn:hover {
      background: #FFFFFF;
      color: #0D9488;
      border-color: rgba(13, 148, 136, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.12), inset 0 1px 0 #FFFFFF;
    }

    .category-btn.active {
      background: linear-gradient(135deg, #0D9488 0%, #083E48 100%);
      color: #FFFFFF;
      border-color: #0D9488;
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.3);
    }

    .cat-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.18);
      color: #475569;
      line-height: 1;
      transition: all 0.2s ease;
    }

    .category-btn.active .cat-count {
      background: rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
    }

    /* ══ HERO ARTICLE WITH METALLIC BEZEL & 3D DEPTH ══ */
    .hero-article {
      position: relative;
      display: flex;
      background: linear-gradient(150deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.90) 100%);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 
        0 8px 30px -4px rgba(15, 23, 42, 0.07),
        0 20px 40px -10px rgba(13, 148, 136, 0.08),
        inset 0 1px 1px 0 rgba(255, 255, 255, 1),
        inset 0 -1px 2px 0 rgba(203, 213, 225, 0.35);
      margin-bottom: 2.75rem;
      cursor: pointer;
      border: 1px solid rgba(226, 232, 240, 0.85);
      transition: box-shadow 0.35s ease, border-color 0.35s ease;
    }

    .hero-article:hover {
      box-shadow: 
        0 24px 50px -12px rgba(13, 148, 136, 0.22),
        0 12px 28px -6px rgba(15, 23, 42, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 1),
        inset 0 -1px 2px rgba(13, 148, 136, 0.15);
      border-color: rgba(13, 148, 136, 0.35);
    }

    .hero-metallic-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3.5px;
      background: linear-gradient(90deg, #0D9488 0%, #2DD4BF 25%, #A7F3D0 45%, #38BDF8 70%, #0D9488 100%);
      background-size: 200% 100%;
      z-index: 5;
    }

    .hero-article:hover .hero-metallic-bar {
      background-position: 100% 0;
      transition: background-position 1.5s ease;
    }

    .hero-image-wrap {
      flex: 1.1;
      position: relative;
      overflow: hidden;
      min-height: 380px;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
    }

    .hero-article:hover .hero-image {
      transform: scale(1.05);
      filter: brightness(1.03) contrast(1.02);
    }

    .hero-image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 100%);
      pointer-events: none;
    }

    .hero-badge-overlay {
      position: absolute;
      top: 1.25rem;
      left: 1.25rem;
      z-index: 4;
    }

    .hero-featured-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #F0FDFA;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .sparkle-icon {
      color: #F59E0B;
      font-size: 0.85rem;
    }

    .hero-content {
      flex: 1.2;
      padding: 3rem 3.25rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .hero-meta-top {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.15rem;
    }

    .badge-primary-subtle {
      background: rgba(13, 148, 136, 0.12);
      color: #0D9488;
      border: 1px solid rgba(13, 148, 136, 0.28);
      font-weight: 700;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
    }

    .hero-read-time {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      color: #64748B;
      font-weight: 500;
    }

    .clock-svg {
      opacity: 0.75;
    }

    .hero-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 1rem;
      line-height: 1.3;
      letter-spacing: -0.02em;
      transition: color 0.25s ease;
    }

    .hero-article:hover .hero-title {
      color: #0D9488;
    }

    .hero-excerpt {
      font-size: 1.02rem;
      color: #475569;
      line-height: 1.65;
      margin-bottom: 2rem;
    }

    .hero-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
    }

    .hero-author-meta {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .hero-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0D9488 0%, #083E48 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
    }

    .hero-author-info {
      display: flex;
      flex-direction: column;
    }

    .hero-author-name {
      font-size: 0.95rem;
      color: #0F172A;
      font-weight: 700;
    }

    .hero-date {
      font-size: 0.8rem;
      color: #64748B;
    }

    .hero-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: 999px;
      background: #0D9488;
      color: #FFFFFF;
      font-size: 0.85rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .hero-article:hover .hero-cta-btn {
      background: #0F766E;
      transform: translateX(3px);
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.45);
    }

    .hero-article:hover .cta-arrow {
      transform: translateX(3px);
    }

    .cta-arrow {
      transition: transform 0.25s ease;
    }

    /* ══ ARTICLE 3D METALLIC GRID CARDS ══ */
    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.75rem;
      margin-bottom: 3.5rem;
    }

    @media (min-width: 1200px) {
      .blog-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .blog-card {
      position: relative;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      border-radius: var(--radius-xl);
      background: linear-gradient(150deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 50%, rgba(241, 245, 249, 0.90) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(226, 232, 240, 0.85);
      box-shadow: 
        0 4px 16px -2px rgba(15, 23, 42, 0.05),
        0 10px 24px -4px rgba(13, 148, 136, 0.05),
        inset 0 1px 1px 0 rgba(255, 255, 255, 1),
        inset 0 -1px 2px 0 rgba(203, 213, 225, 0.3);
      transform-style: preserve-3d;
      perspective: 1100px;
      transition: box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease;
    }

    /* Metallic Glint Sweep across card on hover */
    .blog-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -160%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        115deg,
        transparent 20%,
        rgba(255, 255, 255, 0.05) 35%,
        rgba(255, 255, 255, 0.65) 47%,
        rgba(204, 251, 241, 0.9) 50%,
        rgba(255, 255, 255, 0.65) 53%,
        rgba(255, 255, 255, 0.05) 65%,
        transparent 80%
      );
      transform: skewX(-22deg);
      pointer-events: none;
      z-index: 10;
      transition: none;
    }

    .blog-card:hover::before {
      left: 170%;
      transition: left 0.85s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .blog-card:hover {
      box-shadow: 
        0 24px 50px -10px rgba(13, 148, 136, 0.22),
        0 10px 20px -5px rgba(15, 23, 42, 0.08),
        inset 0 1px 2px rgba(255, 255, 255, 1),
        inset 0 -1px 2px rgba(13, 148, 136, 0.15);
      border-color: rgba(13, 148, 136, 0.42);
    }

    .card-metallic-shimmer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(
        90deg, 
        #0D9488 0%, 
        #2DD4BF 25%, 
        #A7F3D0 45%, 
        #38BDF8 65%, 
        #0D9488 100%
      );
      background-size: 200% 100%;
      opacity: 0.55;
      transition: opacity 0.35s ease, background-position 1.2s ease;
      z-index: 5;
    }

    .blog-card:hover .card-metallic-shimmer {
      opacity: 1;
      background-position: 100% 0;
    }

    /* Card Image with Parallax Scale & Dark Vignette Overlay */
    .card-img-wrap {
      position: relative;
      height: 205px;
      overflow: hidden;
      background: #E2E8F0;
    }

    .card-img {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
    }

    .blog-card:hover .card-img {
      transform: scale(1.08);
      filter: brightness(1.03) contrast(1.03);
    }

    .card-img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 100%);
      pointer-events: none;
    }

    .card-badges-floating {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      right: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 4;
    }

    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(15, 23, 42, 0.74);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #F0FDFA;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.22);
    }

    .chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2DD4BF;
      box-shadow: 0 0 6px #2DD4BF;
    }

    .read-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #0F172A;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.75);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    /* Card Body */
    .card-body {
      padding: 1.35rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .card-title {
      font-size: 1.12rem;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 0.65rem 0;
      line-height: 1.4;
      letter-spacing: -0.015em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.25s ease;
    }

    .blog-card:hover .card-title {
      color: #0D9488;
    }

    .card-excerpt {
      color: #475569;
      font-size: 0.88rem;
      line-height: 1.55;
      margin: 0 0 1.25rem 0;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Card Footer */
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      padding-top: 0.95rem;
      margin-top: auto;
    }

    .author-meta {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      overflow: hidden;
    }

    .author-avatar-mini {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0D9488 0%, #083E48 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
    }

    .author-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .author-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #0F172A;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .author-date {
      font-size: 0.72rem;
      color: #64748B;
    }

    .card-action-btn {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 50%;
      background: rgba(13, 148, 136, 0.08);
      color: #0D9488;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .blog-card:hover .card-action-btn {
      background: #0D9488;
      color: #FFFFFF;
      transform: scale(1.08);
      box-shadow: 0 4px 10px rgba(13, 148, 136, 0.35);
    }

    .action-arrow {
      transition: transform 0.25s ease;
    }

    .blog-card:hover .action-arrow {
      transform: translateX(2px);
    }

    /* ══ ARTICLE DETAIL VIEW (REFINED & PRO STRUCTURED) ══ */
    .article-detail {
      max-width: 860px;
      margin: 0 auto;
      padding-bottom: 4.5rem;
    }

    .btn-back-insights {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1.15rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: #0F172A;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 2rem;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
    }

    .btn-back-insights:hover {
      background: #FFFFFF;
      transform: translateX(-3px);
      border-color: #0D9488;
      color: #0D9488;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
    }

    .article-header {
      margin-bottom: 2.25rem;
    }

    .detail-tag-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .detail-read-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      color: #64748B;
      font-weight: 500;
    }

    .article-heading {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.25;
      color: #0F172A;
      margin-bottom: 1.75rem;
    }

    .meta-large {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(148, 163, 184, 0.25);
      border-bottom: 1px solid rgba(148, 163, 184, 0.25);
      padding: 1.15rem 0;
    }

    .author-block {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0D9488 0%, #083E48 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
    }

    .author-title {
      font-size: 1rem;
      color: #0F172A;
    }

    .detail-date-line {
      font-size: 0.82rem;
      color: #64748B;
    }

    .detail-share-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #059669;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .official-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 6px #10B981;
    }

    .article-hero-wrap {
      margin-bottom: 2.75rem;
    }

    .article-hero-img {
      width: 100%;
      height: 440px;
      object-fit: cover;
      border-radius: var(--radius-xl);
      box-shadow: 0 12px 35px -5px rgba(15, 23, 42, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.9);
      display: block;
    }

    .article-hero-caption {
      font-size: 0.78rem;
      color: #64748B;
      font-style: italic;
      margin-top: 0.5rem;
      text-align: right;
    }

    .article-body {
      font-size: 1.1rem;
      line-height: 1.85;
      color: #334155;
    }

    .lead-box {
      position: relative;
      background: rgba(240, 253, 250, 0.75);
      border-left: 4px solid #0D9488;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      padding: 1.5rem 1.75rem;
      margin-bottom: 2.5rem;
      border-top: 1px solid rgba(13, 148, 136, 0.15);
      border-right: 1px solid rgba(13, 148, 136, 0.15);
      border-bottom: 1px solid rgba(13, 148, 136, 0.15);
    }

    .lead-quote-mark {
      position: absolute;
      top: 0.25rem;
      right: 1rem;
      font-size: 3.5rem;
      line-height: 1;
      color: rgba(13, 148, 136, 0.12);
      font-family: serif;
      pointer-events: none;
    }

    .lead-box .lead {
      font-size: 1.22rem;
      color: #0F172A;
      font-weight: 500;
      line-height: 1.65;
      margin: 0;
    }

    /* ══ CONTENT TEXT FORMATTING ══ */
    ::ng-deep .content-text .detail-p {
      font-size: 1.12rem;
      line-height: 1.85;
      color: #334155;
      margin-bottom: 1.75rem;
    }

    ::ng-deep .content-text .detail-h3-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 2.75rem 0 1.35rem 0;
    }

    ::ng-deep .content-text .h3-teal-bar {
      width: 4px;
      height: 24px;
      border-radius: 999px;
      background: linear-gradient(to bottom, #0D9488, #2DD4BF);
      box-shadow: 0 0 8px rgba(13, 148, 136, 0.4);
    }

    ::ng-deep .content-text .detail-h3 {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
      letter-spacing: -0.02em;
    }

    ::ng-deep .content-text .detail-h2-wrap {
      margin: 3rem 0 1.5rem 0;
    }

    ::ng-deep .content-text .detail-h2 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
      letter-spacing: -0.02em;
    }

    ::ng-deep .content-text .detail-ol {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0 2.25rem 0;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    ::ng-deep .content-text .detail-ol-item {
      display: flex;
      align-items: flex-start;
      gap: 1.15rem;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.4rem;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03), inset 0 1px 0 #FFFFFF;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    }

    ::ng-deep .content-text .detail-ol-item:hover {
      transform: translateX(4px);
      box-shadow: 0 8px 20px rgba(13, 148, 136, 0.12), inset 0 1px 0 #FFFFFF;
      border-color: rgba(13, 148, 136, 0.35);
    }

    ::ng-deep .content-text .detail-num-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 34px;
      height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg, #0D9488 0%, #083E48 100%);
      color: #FFFFFF;
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      box-shadow: 0 3px 8px rgba(13, 148, 136, 0.3);
      flex-shrink: 0;
    }

    ::ng-deep .content-text .detail-ul {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0 2.25rem 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    ::ng-deep .content-text .detail-ul-item {
      display: flex;
      align-items: flex-start;
      gap: 1.15rem;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: var(--radius-md);
      padding: 1.15rem 1.35rem;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03), inset 0 1px 0 #FFFFFF;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    }

    ::ng-deep .content-text .detail-ul-item:hover {
      transform: translateX(4px);
      box-shadow: 0 8px 20px rgba(13, 148, 136, 0.12), inset 0 1px 0 #FFFFFF;
      border-color: rgba(13, 148, 136, 0.35);
    }

    ::ng-deep .content-text .detail-bullet-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0D9488;
      box-shadow: 0 0 8px #2DD4BF;
      margin-top: 0.65rem;
      flex-shrink: 0;
    }

    ::ng-deep .content-text .detail-item-content {
      font-size: 1.05rem;
      line-height: 1.75;
      color: #334155;
      flex: 1;
    }

    ::ng-deep .content-text .detail-bold {
      color: #0F172A;
      font-weight: 700;
    }

    ::ng-deep .content-text .detail-code {
      background: rgba(15, 23, 42, 0.06);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.92rem;
      color: #0F766E;
    }

    /* Related Section */
    .related-section {
      margin-top: 4.5rem;
      padding-top: 2.5rem;
      border-top: 1px solid rgba(148, 163, 184, 0.25);
    }

    .related-header {
      margin-bottom: 1.75rem;
    }

    .related-header h3 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 0.25rem 0;
    }

    .related-subtitle {
      font-size: 0.9rem;
      color: #64748B;
    }

    .related-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 900px) {
      .hero-article { flex-direction: column; }
      .hero-image-wrap { min-height: 260px; }
      .hero-content { padding: 2rem; }
      .article-heading { font-size: 2rem; }
      .article-hero-img { height: 280px; }
    }
  `]
})
export class BlogComponent implements OnInit {
  articles: BlogPost[] = [];
  categories: string[] = [];
  selectedCategory: string = 'All';
  
  featuredArticle: BlogPost | null = null;
  gridArticles: BlogPost[] = [];
  
  selectedArticle: BlogPost | null = null;
  relatedArticles: BlogPost[] = [];

  constructor(private blogData: BlogDataService) {}

  ngOnInit() {
    this.articles = this.blogData.getPosts();
    this.categories = this.blogData.getCategories();
    this.filterByCategory('All');
  }

  filterByCategory(cat: string) {
    this.selectedCategory = cat;
    let filtered = cat === 'All' ? [...this.articles] : this.articles.filter(a => a.category === cat);
    
    if (cat === 'All') {
      this.featuredArticle = filtered.find(a => a.featured) || filtered[0];
      this.gridArticles = filtered.filter(a => a.id !== this.featuredArticle?.id);
    } else {
      this.featuredArticle = null;
      this.gridArticles = filtered;
    }
  }

  getCategoryCount(cat: string): number {
    if (cat === 'All') {
      return this.articles.length;
    }
    return this.articles.filter(a => a.category === cat).length;
  }

  openArticle(post: BlogPost) {
    this.selectedArticle = post;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Pick 2 related articles from different IDs
    this.relatedArticles = this.articles
      .filter(a => a.id !== post.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
  }

  closeArticle() {
    this.selectedArticle = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatContent(text: string): string {
    if (!text) return '';

    const lines = text.split(/\r?\n/);
    const htmlBlocks: string[] = [];
    let inOrderedList = false;
    let inUnorderedList = false;
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const rawP = currentParagraph.join(' ').trim();
        if (rawP) {
          htmlBlocks.push(`<p class="detail-p">${this.parseInline(rawP)}</p>`);
        }
        currentParagraph = [];
      }
    };

    const closeLists = () => {
      if (inOrderedList) {
        htmlBlocks.push('</ol>');
        inOrderedList = false;
      }
      if (inUnorderedList) {
        htmlBlocks.push('</ul>');
        inUnorderedList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushParagraph();
        closeLists();
        continue;
      }

      // Heading 3
      if (line.startsWith('### ')) {
        flushParagraph();
        closeLists();
        const headingText = this.parseInline(line.substring(4));
        htmlBlocks.push(`
          <div class="detail-h3-wrap">
            <span class="h3-teal-bar"></span>
            <h3 class="detail-h3">${headingText}</h3>
          </div>
        `);
        continue;
      }

      // Heading 2
      if (line.startsWith('## ')) {
        flushParagraph();
        closeLists();
        const headingText = this.parseInline(line.substring(3));
        htmlBlocks.push(`
          <div class="detail-h2-wrap">
            <h2 class="detail-h2">${headingText}</h2>
          </div>
        `);
        continue;
      }

      // Numbered List
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        flushParagraph();
        if (inUnorderedList) {
          htmlBlocks.push('</ul>');
          inUnorderedList = false;
        }
        if (!inOrderedList) {
          htmlBlocks.push('<ol class="detail-ol">');
          inOrderedList = true;
        }
        const num = numMatch[1];
        const content = this.parseInline(numMatch[2]);
        htmlBlocks.push(`
          <li class="detail-ol-item">
            <span class="detail-num-badge">${num.padStart(2, '0')}</span>
            <div class="detail-item-content">${content}</div>
          </li>
        `);
        continue;
      }

      // Bullet List
      const bulletMatch = line.match(/^[-*]\s+(.*)/);
      if (bulletMatch) {
        flushParagraph();
        if (inOrderedList) {
          htmlBlocks.push('</ol>');
          inOrderedList = false;
        }
        if (!inUnorderedList) {
          htmlBlocks.push('<ul class="detail-ul">');
          inUnorderedList = true;
        }
        const content = this.parseInline(bulletMatch[1]);
        htmlBlocks.push(`
          <li class="detail-ul-item">
            <span class="detail-bullet-dot"></span>
            <div class="detail-item-content">${content}</div>
          </li>
        `);
        continue;
      }

      // Regular paragraph line
      if (inOrderedList || inUnorderedList) {
        closeLists();
      }
      currentParagraph.push(line);
    }

    flushParagraph();
    closeLists();

    return htmlBlocks.join('\n');
  }

  parseInline(str: string): string {
    if (!str) return '';
    return str
      .replace(/\*\*(.*?)\*\*/g, (match, p1) => `<strong class="detail-bold">${p1}</strong>`)
      .replace(/\*(.*?)\*/g, (match, p1) => `<em class="detail-italic">${p1}</em>`)
      .replace(/`([^`]+)`/g, (match, p1) => `<code class="detail-code">${p1}</code>`);
  }
}
