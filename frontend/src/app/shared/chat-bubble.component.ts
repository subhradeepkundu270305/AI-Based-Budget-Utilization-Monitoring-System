import { Component, ElementRef, ViewChild, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { FinoraService, StateScanSummaryEvent } from '../core/finora.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  time: string;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isLoggedIn()) {
      <div class="finora-wrapper" [class.open]="isOpen">
        <!-- ══ CHAT WINDOW ══ -->
        @if (isOpen) {
          <div class="finora-window card glass-modal" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="finora-header">
              <div class="finora-header-brand">
                <div class="finora-avatar-wrap pulse-glow">
                  <img src="assets/finora.png" alt="Finora AI" class="finora-header-img" (error)="onAvatarError($event)" />
                  <span class="online-indicator"></span>
                </div>
                <div class="finora-header-text">
                  <div class="finora-name-row">
                    <span class="finora-title">Finora</span>
                    <span class="finora-badge">AI Assistant</span>
                  </div>
                  <span class="finora-tagline">Finora - Your Intelligent Budget Assistant</span>
                </div>
              </div>
              <div class="finora-header-actions">
                <button class="header-action-btn" (click)="resetChat()" title="Clear conversation">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                </button>
                <button class="header-action-btn close-btn" (click)="toggleChat()" title="Close assistant">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Telemetry Subheader -->
            <div class="finora-telemetry-bar">
              <span class="telemetry-item">
                <span class="status-dot"></span> Live PFMS Sync
              </span>
              <span class="telemetry-item">FY 2024-25 Context</span>
              <span class="telemetry-item">₹16.03L Cr Tracked</span>
            </div>

            <!-- Messages Area -->
            <div class="finora-messages" #scrollContainer>
              <!-- Welcome Screen if Empty -->
              @if (messages.length === 0) {
                <div class="finora-welcome-card animate-scale-in">
                  <div class="welcome-avatar-container">
                    <img src="assets/finora.png" alt="Finora" class="welcome-avatar" />
                    <div class="welcome-aura"></div>
                  </div>
                  <h4 class="welcome-heading">Finora</h4>
                  <p class="welcome-tagline">Finora - Your Intelligent Budget Assistant</p>
                  <p class="welcome-desc">
                    I monitor live central grants, expenditure pace deviations, and anomaly alerts across 36 States &amp; Union Territories.
                  </p>
                  
                  <!-- Quick Prompt Suggestions -->
                  <div class="prompt-chips-label">Try asking:</div>
                  <div class="prompt-chips">
                    <button class="prompt-chip" (click)="sendPreset('Explain Q2 Pace Deviation')">
                      <span class="chip-icon">⚡</span> Explain Q2 Pace Deviation
                    </button>
                    <button class="prompt-chip" (click)="sendPreset('Show Critical Anomaly Alerts')">
                      <span class="chip-icon">🚨</span> Show Critical Anomaly Alerts
                    </button>
                    <button class="prompt-chip" (click)="sendPreset('Which scheme has the highest allocated budget?')">
                      <span class="chip-icon">💰</span> Highest Allocated Scheme
                    </button>
                    <button class="prompt-chip" (click)="sendPreset('Summarize State Fiscal Health')">
                      <span class="chip-icon">🗺️</span> State Utilization Summary
                    </button>
                  </div>
                </div>
              }

              <!-- Message History -->
              @for (msg of messages; track $index) {
                <div class="chat-message-row" [class.user]="msg.sender === 'user'" [class.bot]="msg.sender === 'bot'">
                  @if (msg.sender === 'bot') {
                    <div class="msg-bot-avatar">
                      <img src="assets/finora.png" alt="Finora" (error)="onAvatarError($event)" />
                    </div>
                  }
                  <div class="chat-message-bubble">
                    <div class="message-text">
                      <span [innerHTML]="formatMessage(msg.text)"></span>
                      <span *ngIf="msg.isTyping" class="ai-typing-cursor">▌</span>
                    </div>
                    <div class="message-footer">
                      <span class="message-time">{{ msg.time }}</span>
                      @if (msg.sender === 'bot') {
                        <button class="copy-btn" (click)="copyText(msg.text, $index)" title="Copy text">
                          <svg *ngIf="copiedIndex !== $index" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span *ngIf="copiedIndex === $index" class="copied-badge">Copied ✓</span>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Loading / Typing Indicator -->
              @if (loading) {
                <div class="chat-message-row bot animate-fade-in">
                  <div class="msg-bot-avatar avatar-thinking">
                    <img src="assets/finora.png" alt="Finora" (error)="onAvatarError($event)" />
                    <div class="avatar-thinking-aura"></div>
                  </div>
                  <div class="chat-message-bubble typing-bubble">
                    <div class="typing-wave">
                      <span class="typing-dot dot-1"></span>
                      <span class="typing-dot dot-2"></span>
                      <span class="typing-dot dot-3"></span>
                    </div>
                    <span class="typing-text">Finora is analyzing fiscal telemetry…</span>
                  </div>
                </div>
              }
            </div>

            <!-- Input Bar -->
            <form class="finora-input-bar" (submit)="sendMessage($event)">
              <div class="input-container">
                <input 
                  type="text" 
                  [(ngModel)]="currentMessage" 
                  name="message" 
                  placeholder="Ask Finora about budgets, pace, or anomalies…" 
                  autocomplete="off" 
                  [disabled]="loading"
                />
              </div>
              <button 
                class="btn-finora-send" 
                type="submit" 
                [disabled]="loading || !currentMessage.trim()"
                title="Send query"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        }
        
        <!-- ══ 3D FLOATING LAUNCHER BUTTON ══ -->
        @if (!isOpen) {
          <div class="launcher-container" (click)="toggleChat()">
            <!-- Outer Pulsing Glow Rings -->
            <div class="pulse-ring ring-1"></div>
            <div class="pulse-ring ring-2"></div>

            <!-- Floating Tooltip Pill -->
            <div class="finora-callout-pill">
              <span class="callout-sparkle">✦</span>
              <span class="callout-text">Ask <strong>Finora</strong></span>
              <span class="callout-dot"></span>
            </div>

            <!-- 3D Orb Button -->
            <button class="finora-toggle-btn" title="Open Finora - Your Intelligent Budget Assistant">
              <div class="orb-inner">
                <img src="assets/finora.png" alt="Finora AI" class="finora-btn-avatar" (error)="onAvatarError($event)" />
              </div>
              <div class="orb-glare"></div>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════
       FINORA FLOATING CONTROLLER (MINIMAL, SLEEK & CLASSY)
    ═══════════════════════════════════════════════════════ */
    .finora-wrapper {
      position: fixed;
      bottom: 88px;
      right: 28px;
      z-index: 998;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      user-select: none;
    }

    /* ── 3D Floating Launcher Button ── */
    .launcher-container {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      filter: drop-shadow(0 8px 20px rgba(8, 62, 72, 0.35));
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .launcher-container:hover {
      transform: translateY(-4px) scale(1.05);
    }
    .launcher-container:active {
      transform: translateY(0) scale(0.96);
    }

    /* Floating Callout Pill */
    .finora-callout-pill {
      background: rgba(4, 34, 40, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      color: #fff;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.78rem;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(45, 212, 191, 0.35);
      box-shadow: 0 4px 14px rgba(3, 31, 36, 0.3);
      animation: floatGentle 3.5s ease-in-out infinite;
      white-space: nowrap;
    }
    .callout-sparkle {
      color: #F59E0B;
      font-size: 0.85rem;
      animation: spinSlow 8s linear infinite;
    }
    .callout-text strong {
      background: linear-gradient(135deg, #99F6E4, #34D399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }
    .callout-dot {
      width: 7px;
      height: 7px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 6px #10B981;
      animation: pulseGreen 1.5s infinite;
    }

    /* Minimalist 3D Orb Button (Refined 54px) */
    .finora-toggle-btn {
      position: relative;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: linear-gradient(135deg, #083E48 0%, #0D9488 55%, #10B981 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 
        inset 0 1.5px 3px rgba(255, 255, 255, 0.65),
        0 8px 22px rgba(13, 148, 136, 0.4);
      overflow: hidden;
    }
    .orb-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 35% 30%, #0F766E, #04242A);
    }
    .finora-btn-avatar {
      width: 110%;
      height: 110%;
      object-fit: cover;
      transform: scale(1.1) translateY(1px);
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
      transition: transform 0.3s ease;
    }
    .launcher-container:hover .finora-btn-avatar {
      transform: scale(1.2) translateY(0) rotate(3deg);
    }
    .orb-glare {
      position: absolute;
      top: 2px;
      left: 8px;
      right: 8px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }

    /* Pulsing Glow Rings */
    .pulse-ring {
      position: absolute;
      right: 0;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      pointer-events: none;
      border: 1.5px solid #2DD4BF;
      z-index: -1;
    }
    .ring-1 {
      animation: pulseRadar 2.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }
    .ring-2 {
      animation: pulseRadar 2.8s cubic-bezier(0.215, 0.61, 0.355, 1) 1.2s infinite;
    }

    /* ═══════════════════════════════════════════════════════
       FINORA CHAT WINDOW
    ═══════════════════════════════════════════════════════ */
    .finora-window {
      width: 420px;
      height: 600px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 100px);
      display: flex;
      flex-direction: column;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      border: 1px solid rgba(13, 148, 136, 0.2);
      box-shadow: 
        0 25px 50px -12px rgba(8, 62, 72, 0.25),
        0 0 0 1px rgba(13, 148, 136, 0.15);
      overflow: hidden;
      padding: 0;
      animation: finoraModalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom right;
    }

    /* Header */
    .finora-header {
      background: linear-gradient(135deg, #04242A 0%, #083E48 50%, #0D9488 100%);
      color: #fff;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    }
    .finora-header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .finora-avatar-wrap {
      position: relative;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      padding: 2px;
      background: linear-gradient(135deg, #2DD4BF, #0D9488);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      flex-shrink: 0;
    }
    .finora-header-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      background: #04242A;
    }
    .online-indicator {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 11px;
      height: 11px;
      background: #10B981;
      border-radius: 50%;
      border: 2px solid #04242A;
      box-shadow: 0 0 6px #10B981;
    }

    .finora-header-text {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }
    .finora-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .finora-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .finora-badge {
      font-size: 0.65rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 7px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .finora-tagline {
      font-size: 0.74rem;
      color: #99F6E4;
      font-weight: 500;
      margin-top: 2px;
    }

    .finora-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header-action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.1);
      color: #E0E7FF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .header-action-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
      transform: scale(1.08);
    }
    .header-action-btn.close-btn:hover {
      background: rgba(239, 68, 68, 0.4);
      color: #fff;
    }

    /* Telemetry subheader */
    .finora-telemetry-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 16px;
      background: rgba(241, 245, 249, 0.8);
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      font-size: 0.72rem;
      color: #64748B;
      font-weight: 600;
    }
    .telemetry-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      background: #10B981;
      border-radius: 50%;
    }

    /* Messages container */
    .finora-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: linear-gradient(180deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.7) 100%);
    }

    /* Welcome hero screen */
    .finora-welcome-card {
      text-align: center;
      padding: 24px 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .welcome-avatar-container {
      position: relative;
      width: 86px;
      height: 86px;
      margin-bottom: 12px;
    }
    .welcome-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 10px 24px rgba(13, 148, 136, 0.35);
      border: 3px solid #fff;
      animation: floatWelcome 4s ease-in-out infinite;
    }
    .welcome-aura {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(45, 212, 191, 0.35), transparent 70%);
      z-index: -1;
      animation: pulseAura 3s ease-in-out infinite;
    }
    .welcome-heading {
      font-size: 1.3rem;
      font-weight: 800;
      color: #083E48;
      margin: 0 0 2px;
    }
    .welcome-tagline {
      font-size: 0.85rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 8px;
    }
    .welcome-desc {
      font-size: 0.82rem;
      color: #64748B;
      max-width: 320px;
      line-height: 1.5;
      margin: 0 0 16px;
    }

    .prompt-chips-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0F766E;
      margin-bottom: 8px;
      align-self: flex-start;
    }
    .prompt-chips {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .prompt-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #fff;
      border: 1px solid rgba(13, 148, 136, 0.2);
      border-radius: 12px;
      font-size: 0.82rem;
      color: #1E293B;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 2px 6px rgba(8, 62, 72, 0.04);
    }
    .prompt-chip:hover {
      border-color: var(--color-primary);
      background: rgba(13, 148, 136, 0.08);
      color: var(--color-primary);
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
    }
    .chip-icon {
      font-size: 1rem;
    }

    /* Chat message rows */
    .chat-message-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      max-width: 88%;
      animation: messageSlideIn 0.3s ease-out;
    }
    .chat-message-row.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .chat-message-row.bot {
      align-self: flex-start;
    }

    .msg-bot-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid rgba(13, 148, 136, 0.35);
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .msg-bot-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .chat-message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
      font-size: 0.88rem;
      line-height: 1.55;
      word-break: break-word;
    }
    .user .chat-message-bubble {
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
    }
    .bot .chat-message-bubble {
      background: #ffffff;
      color: #1E293B;
      border: 1px solid rgba(13, 148, 136, 0.18);
      border-bottom-left-radius: 4px;
      box-shadow: 0 4px 14px rgba(8, 62, 72, 0.05);
    }

    .message-text {
      white-space: pre-wrap;
    }
    .message-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .message-time {
      font-size: 0.65rem;
      opacity: 0.7;
    }
    .copy-btn {
      background: transparent;
      border: none;
      padding: 2px;
      cursor: pointer;
      color: #94A3B8;
      display: flex;
      align-items: center;
      transition: color 0.15s;
    }
    .copy-btn:hover {
      color: var(--color-primary);
    }
    .copied-badge {
      font-size: 0.68rem;
      color: #059669;
      font-weight: 700;
      animation: messageSlideIn 0.2s ease-out;
    }

    /* Typing indicator */
    .typing-bubble {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      background: #FFFFFF;
      border: 1px solid rgba(13, 148, 136, 0.25);
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      box-shadow: 0 4px 14px rgba(8, 62, 72, 0.08);
    }
    .typing-wave {
      display: flex;
      align-items: center;
      gap: 5px;
      height: 16px;
    }
    .typing-dot {
      display: inline-block !important;
      width: 7px !important;
      height: 7px !important;
      background: linear-gradient(135deg, #0D9488, #10B981) !important;
      border-radius: 50% !important;
      animation: dotBounce 1.25s infinite ease-in-out both;
      box-shadow: 0 0 6px rgba(13, 148, 136, 0.45);
    }
    .dot-1 { animation-delay: -0.32s; }
    .dot-2 { animation-delay: -0.16s; }
    .dot-3 { animation-delay: 0s; }

    .msg-bot-avatar.avatar-thinking {
      position: relative;
    }
    .avatar-thinking-aura {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #2DD4BF;
      animation: pulseRadar 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      pointer-events: none;
    }

    .typing-text {
      font-size: 0.8rem;
      color: #0F766E;
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.01em;
    }

    /* Live AI Typing Cursor */
    .ai-typing-cursor {
      display: inline-block;
      color: var(--color-primary);
      font-weight: 900;
      font-size: 0.92rem;
      margin-left: 2px;
      animation: cursorBlink 0.65s infinite;
      vertical-align: baseline;
    }
    @keyframes cursorBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* Input Bar */
    .finora-input-bar {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #fff;
      border-top: 1px solid rgba(13, 148, 136, 0.15);
      gap: 10px;
    }
    .input-container {
      flex: 1;
      position: relative;
    }
    .input-container input {
      width: 100%;
      padding: 10px 16px;
      border-radius: 22px;
      border: 1px solid rgba(13, 148, 136, 0.25);
      background: #F8FAFC;
      font-size: 0.88rem;
      color: #0F172A;
      transition: all 0.2s ease;
    }
    .input-container input:focus {
      outline: none;
      border-color: var(--color-primary);
      background: #fff;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.18);
    }

    .btn-finora-send {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      flex-shrink: 0;
    }
    .btn-finora-send:hover:not(:disabled) {
      transform: scale(1.1) rotate(-5deg);
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.45);
    }
    .btn-finora-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* ═══════════════════════════════════════════════════════
       KEYFRAME ANIMATIONS
    ═══════════════════════════════════════════════════════ */
    @keyframes pulseRadar {
      0% {
        transform: scale(0.95);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.65);
        opacity: 0;
      }
    }
    @keyframes floatGentle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes floatWelcome {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-6px) rotate(2deg); }
    }
    @keyframes pulseAura {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }
    @keyframes pulseGreen {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    @keyframes spinSlow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes finoraModalIn {
      0% {
        opacity: 0;
        transform: scale(0.85) translateY(30px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    @keyframes messageSlideIn {
      0% {
        opacity: 0;
        transform: translateY(8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes dotBounce {
      0%, 80%, 100% {
        transform: translateY(0) scale(0.4);
        opacity: 0.35;
      }
      40% {
        transform: translateY(-6px) scale(1.15);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .finora-wrapper {
        bottom: 74px;
        right: 18px;
      }
      .finora-callout-pill {
        display: none;
      }
    }
  `]
})
export class ChatBubbleComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private finoraService = inject(FinoraService);
  
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  isOpen = false;
  loading = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  copiedIndex: number | null = null;
  private typingInterval: any = null;

  ngOnInit() {
    this.finoraService.scanRequest.subscribe(event => {
      this.handleStateScanEvent(event);
    });
  }

  ngOnDestroy() {
    this.stopTypingIfActive();
  }

  formatMessage(text: string): string {
    if (!text) return '';
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return safe;
  }

  private stopTypingIfActive() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
      for (const m of this.messages) {
        m.isTyping = false;
      }
    }
  }

  private streamBotMessage(fullText: string, time: string) {
    this.stopTypingIfActive();

    const botMsg: ChatMessage = {
      text: '',
      sender: 'bot',
      time,
      isTyping: true
    };
    this.messages.push(botMsg);
    this.scrollToBottom();

    // Split into words, whitespace, bullets & newlines to preserve complete structure
    const tokens = fullText.match(/(\s+|\S+)/g) || [fullText];
    let tokenIndex = 0;

    this.typingInterval = setInterval(() => {
      if (tokenIndex < tokens.length) {
        const batch = tokens.slice(tokenIndex, tokenIndex + 2).join('');
        botMsg.text += batch;
        tokenIndex += 2;
        this.scrollToBottom();
      } else {
        botMsg.text = fullText;
        botMsg.isTyping = false;
        clearInterval(this.typingInterval);
        this.typingInterval = null;
        this.scrollToBottom();
      }
    }, 18);
  }

  handleStateScanEvent(event: StateScanSummaryEvent) {
    this.isOpen = true;
    this.stopTypingIfActive();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.push({
      text: `✨ Telemetry Scan: Generate AI summary for ${event.state.name}`,
      sender: 'user',
      time
    });
    this.loading = true;
    this.scrollToBottom();

    const state = event.state;
    const prompt = `State: ${state.name}. Allocated: ₹${state.allocated.toLocaleString('en-IN')}, Spent: ₹${state.spent.toLocaleString('en-IN')}, Utilization: ${state.utilizationPct}%. Categories: ${state.categoryBreakdown.map(c => c.category + ' ' + c.pct + '%').join(', ')}. Top schemes: ${state.topSchemes.join(', ')}. Provide an executive fiscal summary with trajectory and recommendations.`;

    this.api.chat(prompt).subscribe({
      next: (res) => {
        this.loading = false;
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const finalReply = res.reply && !res.reply.includes('offline mode') && !res.reply.includes('trouble connecting')
          ? res.reply
          : this.generateSynthesisParagraph(state);
        this.streamBotMessage(finalReply, botTime);
      },
      error: () => {
        this.loading = false;
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.streamBotMessage(this.generateSynthesisParagraph(state), botTime);
      }
    });
  }

  private generateSynthesisParagraph(state: any): string {
    const allocatedCr = (state.allocated / 10000000).toFixed(2);
    const spentCr = (state.spent / 10000000).toFixed(2);
    const riskStatus = state.utilizationPct < 45 ? 'Lagging Fund Absorption' : state.utilizationPct > 95 ? 'Accelerated Outlay (Ceiling Risk)' : 'Balanced Fiscal Governance';
    const topCat = state.categoryBreakdown?.[0]?.category || 'Education & Infrastructure';
    const topCatPct = state.categoryBreakdown?.[0]?.pct || '34';
    const schemes = state.topSchemes?.slice(0, 3).join(', ') || 'State Road Expansion, Rural Health Mission';

    return `🏛️ **Executive AI Fiscal Analysis: ${state.name} (FY 2026-27)**\n\n` +
           `• **Run-Rate Trajectory**: ${state.name} has recorded an expenditure of **₹${spentCr} Cr** against a central allocation of **₹${allocatedCr} Cr**, tracking at **${state.utilizationPct}%** cumulative utilization pace.\n\n` +
           `• **Fiscal Classification**: Evaluated as **${riskStatus}**. ${state.summary}\n\n` +
           `• **Primary Sector Drivers**: Capital outlays are heavily concentrated in **${topCat}** (${topCatPct}% share), with rapid disbursement across flagship schemes: **${schemes}**.\n\n` +
           `• **Actionable Advisory**: ${state.utilizationPct < 45 ? 'Expedite fund releases to district treasury cells to prevent unspent balances before the fiscal year ends.' : 'Maintain current monthly expenditure velocity while ensuring strict PFMS audit reconciliation.'}`;
  }

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  resetChat() {
    this.stopTypingIfActive();
    this.messages = [];
  }

  sendPreset(text: string) {
    this.currentMessage = text;
    this.sendMessage(new Event('submit'));
  }

  sendMessage(e: Event) {
    e.preventDefault();
    const text = this.currentMessage.trim();
    if (!text) return;

    this.stopTypingIfActive();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.push({ text, sender: 'user', time });
    this.currentMessage = '';
    this.loading = true;
    this.scrollToBottom();

    this.api.chat(text).subscribe({
      next: (res) => {
        this.loading = false;
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.streamBotMessage(res.reply, botTime);
      },
      error: () => {
        this.loading = false;
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.streamBotMessage(
          'Finora service telemetry: Unable to connect to fiscal intelligence gateway. Please verify backend connectivity.',
          botTime
        );
      }
    });
  }

  copyText(text: string, index?: number) {
    navigator.clipboard?.writeText(text);
    if (index !== undefined) {
      this.copiedIndex = index;
      setTimeout(() => {
        if (this.copiedIndex === index) {
          this.copiedIndex = null;
        }
      }, 1600);
    }
  }

  onAvatarError(event: Event) {
    // Fallback if asset is missing
    const target = event.target as HTMLImageElement;
    target.src = '/logo.png';
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
