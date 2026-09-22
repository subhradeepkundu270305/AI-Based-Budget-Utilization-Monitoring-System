import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverTilt]',
  standalone: true
})
export class HoverTiltDirective {
  @Input() maxTilt = 6; // max tilt in degrees

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');
    this.renderer.setStyle(this.el.nativeElement, 'transform-style', 'preserve-3d');
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left; // x position within the element
    const y = event.clientY - rect.top;  // y position within the element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -this.maxTilt;
    const rotateY = ((x - centerX) / centerX) * this.maxTilt;

    this.renderer.setStyle(
      this.el.nativeElement, 
      'transform', 
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(
      this.el.nativeElement, 
      'transform', 
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    );
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s ease-out');
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');
  }
}
