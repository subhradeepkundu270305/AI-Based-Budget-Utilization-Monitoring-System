import { Directive, ElementRef, OnInit, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit {
  @Input() delay: number = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Initial state: hidden
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(20px)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)');
    
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'none');
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 0.4s ease');
    }
  }

  ngOnInit() {
    if (this.delay > 0) {
      this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.delay}ms`);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
          
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!prefersReducedMotion) {
            this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
          }
          
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.el.nativeElement);
  }
}
