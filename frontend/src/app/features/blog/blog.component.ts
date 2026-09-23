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
      <header class="page-head animate-fade-in-up">
        <div class="head-pill-tag">
          <span class="pulse-beacon"></span>
          <span>Sovereign Fiscal Intelligence &amp; Policy Telemetry</span>
        </div>
        <h1 class="page-title">Insights &amp; Fiscal Analysis</h1>
        <p class="page-subtitle muted">
          Empirical investigations on public expenditure velocity, treasury single accounts, DBT pipelining, and scheme utilization across India's 36 States and UTs.
        </p>
      </header>

      <!-- Filters -->
      <div class="tab-bar-wrapper animate-fade-in-up delay-100">
        <div class="tab-bar">
          <button 
            *ngFor="let cat of categories" 
            class="tab-btn"
            [class.active]="selectedCategory === cat"
            (click)="filterByCategory(cat)">
            <span>{{ cat }}</span>
            <span class="tab-count-badge">{{ getCategoryCount(cat) }}</span>
          </button>
        </div>
      </div>

      <!-- Hero Article -->
      <section 
        *ngIf="featuredArticle && selectedCategory === 'All'" 
        class="hero-article animate-fade-in-up delay-200" 
        appHoverTilt 
        [maxTilt]="3"
        (click)="openArticle(featuredArticle)">
        
        <div class="hero-glow-bar"></div>
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

      <!-- Article Grid (4x2 Balanced Layout with Pro 3D Depth) -->
      <section class="blog-grid">
        <article 
          *ngFor="let post of gridArticles; let i = index" 
          class="blog-card card animate-fade-in-up" 
          [ngStyle]="{'animation-delay': (150 + (i * 50)) + 'ms'}"
          appHoverTilt
          [maxTilt]="6"
          (click)="openArticle(post)">
          
          <!-- 3D Top Accent Glow Bar -->
          <div class="card-glow-bar"></div>

          <!-- Card Image Wrap with Parallax Hover Zoom & Floating Chips -->
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
        <p class="lead">{{ selectedArticle.excerpt }}</p>
        
        <!-- Enhanced Content Formatting -->
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

    /* Page Header */
    .head-pill-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: rgba(13, 148, 136, 0.08);
      border: 1px solid rgba(13, 148, 136, 0.22);
      color: #0F766E;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 0.85rem;
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
      font-size: 2.25rem;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.025em;
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 1.05rem;
      color: #475569;
      max-width: 760px;
      line-height: 1.55;
      margin: 0 0 2rem 0;
    }

    /* Tab Filters */
    .tab-bar-wrapper {
      margin-bottom: 2.25rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .tab-bar {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 0.35rem;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.25);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      border: 1px solid transparent;
      background: transparent;
      color: #475569;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tab-btn:hover {
      color: #0F172A;
      background: rgba(255, 255, 255, 0.9);
    }

    .tab-btn.active {
      background: #0D9488;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.32);
    }

    .tab-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.08);
      color: #475569;
      line-height: 1;
    }

    .tab-btn.active .tab-count-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
    }

    /* ══ HERO ARTICLE 3D CARD ══ */
    .hero-article {
      position: relative;
      display: flex;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 
        0 8px 30px -4px rgba(15, 23, 42, 0.07),
        0 20px 40px -10px rgba(13, 148, 136, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.95);
      margin-bottom: 2.75rem;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.9);
      transition: box-shadow 0.35s ease, border-color 0.35s ease;
    }

    .hero-article:hover {
      box-shadow: 
        0 24px 50px -12px rgba(13, 148, 136, 0.22),
        0 12px 28px -6px rgba(15, 23, 42, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 1);
      border-color: rgba(13, 148, 136, 0.35);
    }

    .hero-glow-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3.5px;
      background: linear-gradient(90deg, #0D9488 0%, #06B6D4 50%, #3B82F6 100%);
      z-index: 5;
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
      filter: brightness(1.03);
    }

    .hero-image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 100%);
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
      background: rgba(15, 23, 42, 0.75);
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

    /* ══ ARTICLE 3D GRID CARDS ══ */
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
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.85);
      box-shadow: 
        0 4px 12px -2px rgba(15, 23, 42, 0.05),
        0 10px 24px -4px rgba(15, 23, 42, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.95);
      transform-style: preserve-3d;
      perspective: 1100px;
      transition: box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease;
    }

    /* Specular light sheen highlight across card on hover */
    .blog-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        125deg,
        transparent 30%,
        rgba(255, 255, 255, 0.35) 48%,
        rgba(255, 255, 255, 0.65) 50%,
        rgba(255, 255, 255, 0.35) 52%,
        transparent 70%
      );
      transform: translateX(-150%);
      transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 10;
    }

    .blog-card:hover::before {
      transform: translateX(150%);
    }

    .blog-card:hover {
      box-shadow: 
        0 22px 48px -12px rgba(13, 148, 136, 0.22),
        0 10px 20px -6px rgba(15, 23, 42, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 1);
      border-color: rgba(13, 148, 136, 0.35);
    }

    .card-glow-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #0D9488 0%, #06B6D4 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 5;
    }

    .blog-card:hover .card-glow-bar {
      opacity: 1;
    }

    /* Card Image with Parallax Scale & Dark Overlay */
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
      filter: brightness(1.04);
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
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #F0FDFA;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
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
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #0F172A;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.6);
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

    /* ══ ARTICLE DETAIL VIEW ══ */
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
      background: rgba(255, 255, 255, 0.85);
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

    .article-body .lead {
      font-size: 1.3rem;
      color: #0F172A;
      font-weight: 500;
      line-height: 1.6;
      margin-bottom: 2.25rem;
      padding-left: 1.25rem;
      border-left: 4px solid #0D9488;
    }

    ::ng-deep .content-text p {
      margin-bottom: 1.5rem;
    }

    ::ng-deep .content-text .article-h2 {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0F172A;
      margin: 2.5rem 0 1.25rem 0;
      line-height: 1.3;
    }

    ::ng-deep .content-text .article-h3 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0F172A;
      margin: 2rem 0 1rem 0;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    ::ng-deep .content-text .article-h3::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #0D9488;
    }

    ::ng-deep .content-text .article-list {
      margin: 1.25rem 0 1.75rem 1.75rem;
      padding: 0;
    }

    ::ng-deep .content-text .article-list li {
      margin-bottom: 0.75rem;
      line-height: 1.7;
    }

    ::ng-deep .content-text strong {
      color: #0F172A;
      font-weight: 700;
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
    return text
      .split('\n\n')
      .map(paragraph => {
        let trimmed = paragraph.trim();
        if (trimmed.startsWith('### ')) {
          return `<h3 class="article-h3">${trimmed.substring(4)}</h3>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h2 class="article-h2">${trimmed.substring(3)}</h2>`;
        }
        // Bold formatting
        let formatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // List items
        if (trimmed.startsWith('- ') || trimmed.startsWith('1. ') || trimmed.includes('\n- ') || trimmed.includes('\n1. ')) {
          const lines = trimmed.split('\n');
          const isOrdered = /^\d+\.\s/.test(lines[0]);
          const tag = isOrdered ? 'ol' : 'ul';
          const listItems = lines
            .map(line => {
              const cleaned = line.replace(/^[-*]\s+|\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return `<li>${cleaned}</li>`;
            })
            .join('');
          return `<${tag} class="article-list">${listItems}</${tag}>`;
        }
        return `<p>${formatted}</p>`;
      })
      .join('');
  }
}
