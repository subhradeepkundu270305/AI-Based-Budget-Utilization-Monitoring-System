import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogDataService, BlogPost } from '../../core/blog-data.service';
import { HoverTiltDirective } from '../../shared/hover-tilt.directive';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HoverTiltDirective],
  template: `
    <div *ngIf="!selectedArticle">
      <header class="page-head animate-fade-in-up">
        <div>
          <h1>Insights & Analysis</h1>
          <p class="muted">Latest perspectives on public finance, budgets, and scheme utilization.</p>
        </div>
      </header>

      <!-- Filters -->
      <div class="tab-bar animate-fade-in-up delay-100" style="margin-bottom: 2rem;">
        <button 
          *ngFor="let cat of categories" 
          [class.active]="selectedCategory === cat"
          (click)="filterByCategory(cat)">
          {{ cat }}
        </button>
      </div>

      <!-- Hero Article -->
      <section *ngIf="featuredArticle && selectedCategory === 'All'" class="hero-article animate-fade-in-up delay-200" appHoverTilt (click)="openArticle(featuredArticle)">
        <div class="hero-image" [style.backgroundImage]="'url(' + featuredArticle.imageUrl + ')'"></div>
        <div class="hero-content">
          <span class="badge bg-primary" style="margin-bottom: 1rem;">{{ featuredArticle.category }}</span>
          <h2>{{ featuredArticle.title }}</h2>
          <p class="excerpt">{{ featuredArticle.excerpt }}</p>
          <div class="meta">
            <span>By {{ featuredArticle.author }}</span> &bull; 
            <span>{{ featuredArticle.date }}</span> &bull; 
            <span>{{ featuredArticle.readTime }}</span>
          </div>
        </div>
      </section>

      <!-- Article Grid -->
      <section class="blog-grid">
        <article 
          *ngFor="let post of gridArticles; let i = index" 
          class="blog-card card animate-fade-in-up" 
          [ngStyle]="{'animation-delay': (200 + (i * 60)) + 'ms'}"
          appHoverTilt
          (click)="openArticle(post)">
          
          <div class="card-img" [style.backgroundImage]="'url(' + post.imageUrl + ')'"></div>
          <div class="card-body">
            <span class="badge" style="background: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-muted); margin-bottom: 0.75rem;">
              {{ post.category }}
            </span>
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt }}</p>
            <div class="meta">
              <span>{{ post.author }}</span>
              <span>{{ post.date }}</span>
            </div>
          </div>
        </article>
      </section>
    </div>

    <!-- Article Detail View -->
    <div *ngIf="selectedArticle" class="article-detail animate-fade-in-up">
      <button class="btn btn-ghost" style="margin-bottom: 2rem;" (click)="closeArticle()">
        &larr; Back to Insights
      </button>

      <div class="article-header">
        <span class="badge bg-primary" style="margin-bottom: 1rem;">{{ selectedArticle.category }}</span>
        <h1>{{ selectedArticle.title }}</h1>
        <div class="meta-large">
          <div class="author-block">
            <div class="avatar">{{ selectedArticle.author.charAt(0) }}</div>
            <div>
              <strong>{{ selectedArticle.author }}</strong>
              <div class="muted">{{ selectedArticle.date }} &bull; {{ selectedArticle.readTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <img [src]="selectedArticle.imageUrl" [alt]="selectedArticle.title" class="article-hero-img" />

      <div class="article-body">
        <p class="lead">{{ selectedArticle.excerpt }}</p>
        
        <!-- Mock Content Formatting -->
        <div class="content-text" [innerHTML]="formatContent(selectedArticle.content)"></div>
        
        <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
          <h3 style="margin-bottom: 1rem;">Related Insights</h3>
          <div class="blog-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
            <article 
              *ngFor="let rel of relatedArticles" 
              class="blog-card card" 
              appHoverTilt
              (click)="openArticle(rel)">
              <div class="card-img" [style.backgroundImage]="'url(' + rel.imageUrl + ')'" style="height: 140px;"></div>
              <div class="card-body">
                <h3 style="font-size: 1.05rem;">{{ rel.title }}</h3>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-article {
      display: flex;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08);
      margin-bottom: 3rem;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.85);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .hero-article:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.15);
    }
    .hero-image {
      flex: 1;
      min-height: 350px;
      background-size: cover;
      background-position: center;
    }
    .hero-content {
      flex: 1;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .hero-content h2 {
      font-size: 2rem;
      color: var(--text-heading);
      margin-bottom: 1rem;
      line-height: 1.3;
    }
    .hero-content .excerpt {
      font-size: 1.1rem;
      color: var(--text-body);
      margin-bottom: 1.5rem;
    }
    .meta {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    
    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.75rem;
      margin-bottom: 3rem;
    }
    .blog-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      border-radius: var(--radius-xl);
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .blog-card:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: 0 20px 35px -8px rgba(79, 70, 229, 0.16);
    }
    .card-img {
      height: 200px;
      background-size: cover;
      background-position: center;
    }
    .card-body {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .card-body h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }
    .card-body p {
      color: var(--text-body);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-body .meta {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
      margin-top: auto;
    }

    /* Detail View */
    .article-detail {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }
    .article-header {
      margin-bottom: 2rem;
    }
    .article-header h1 {
      font-size: 2.5rem;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 1.5rem;
    }
    .meta-large {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 0;
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
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
    }
    .article-hero-img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: var(--radius-lg);
      margin-bottom: 3rem;
      box-shadow: var(--shadow-sm);
    }
    .article-body {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #334155;
    }
    .article-body .lead {
      font-size: 1.3rem;
      color: var(--text-heading);
      font-weight: 500;
      margin-bottom: 2rem;
    }
    ::ng-deep .content-text p {
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .hero-article { flex-direction: column; }
      .hero-image { min-height: 250px; }
      .hero-content { padding: 1.5rem; }
      .article-header h1 { font-size: 2rem; }
      .article-hero-img { height: 250px; }
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

  openArticle(post: BlogPost) {
    this.selectedArticle = post;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Pick 2 random related articles
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
    return text.split('\n\n').map(p => `<p>${p}</p>`).join('');
  }
}
