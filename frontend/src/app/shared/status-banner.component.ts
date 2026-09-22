import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-banner',
  standalone: true,
  template: `
    @if (loading) {
      <div class="banner banner-muted">Loading…</div>
    }
    @if (!loading && error) {
      <div class="banner banner-error">{{ error }}</div>
    }
    @if (!loading && !error && empty) {
      <div class="banner banner-muted">{{ emptyText }}</div>
    }
  `,
})
export class StatusBannerComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() empty = false;
  @Input() emptyText = 'No records found.';
}
