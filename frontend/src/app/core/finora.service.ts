import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StateData } from './state-data.service';

export interface StateScanSummaryEvent {
  state: StateData;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinoraService {
  private scanRequest$ = new Subject<StateScanSummaryEvent>();
  scanRequest = this.scanRequest$.asObservable();

  triggerStateSummaryScan(state: StateData) {
    this.scanRequest$.next({
      state,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
}
