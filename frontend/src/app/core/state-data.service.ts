import { Injectable } from '@angular/core';

export interface StateData {
  id: string; // matches GeoJSON ID or name
  name: string;
  allocated: number;
  spent: number;
  utilizationPct: number;
  categoryBreakdown: { category: string; pct: number }[];
  trend: number[]; // 6-12 month spend values
  alerts: { severity: string; type: string; message: string }[];
  topSchemes: string[];
  history5Years: { year: string; allocated: number; spent: number }[];
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class StateDataService {
  private mockData: Record<string, StateData> = {};

  constructor() {
    this.generateMockData();
  }

  private generateMockData() {
    const states = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
      "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
      "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
      "Uttar Pradesh", "Uttarakhand", "West Bengal",
      "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];

    states.forEach(state => {
      const base = 5000 + (state.length * 1000) + (Math.random() * 5000); 
      let utilTarget = 65 + (Math.random() * 20);
      const rand = Math.random();
      if (rand < 0.1) utilTarget = 30 + (Math.random() * 10);
      else if (rand > 0.9) utilTarget = 98 + (Math.random() * 15);

      const spent = (base * utilTarget) / 100;

      const trend = [];
      let currentSpend = 0;
      for (let i = 0; i < 6; i++) {
        const monthly = (spent / 6) * (0.8 + Math.random() * 0.4);
        currentSpend += monthly;
        trend.push(currentSpend);
      }

      const alerts = [];
      if (utilTarget < 40) {
        alerts.push({ severity: 'High', type: 'UnderUtilization', message: `Spend is critically low at ${utilTarget.toFixed(1)}%.` });
      } else if (utilTarget > 105) {
        alerts.push({ severity: 'High', type: 'Overspending', message: `State has exceeded allocated budget by ${(utilTarget - 100).toFixed(1)}%.` });
      }
      if (Math.random() > 0.8) {
        alerts.push({ severity: 'Medium', type: 'Spike', message: 'Unusual spike in infrastructure spend detected last month.' });
      }

      // Generate 5 years history
      const history5Years = [];
      let pastBase = base * 0.7;
      for (let i = 2020; i <= 2024; i++) {
        const pastUtil = utilTarget + (Math.random() * 10 - 5);
        history5Years.push({
          year: i.toString(),
          allocated: pastBase * 10000000,
          spent: (pastBase * pastUtil / 100) * 10000000
        });
        pastBase *= 1.08; // 8% growth per year
      }

      const summary = `The fiscal report for ${state} indicates an overall budget utilization of ${utilTarget.toFixed(1)}% for the current financial year. Historically, the state has shown a ${utilTarget > 75 ? 'robust' : 'moderate'} capacity for fund absorption. Key sectors like Education and Health constitute the majority of expenditures. ${alerts.length > 0 ? 'However, there are critical alerts requiring immediate attention to ensure fiscal discipline and optimal resource allocation.' : 'The expenditure pace is largely in line with idealized trajectories, indicating stable financial governance.'}`;

      this.mockData[state] = {
        id: state,
        name: state,
        allocated: base * 10000000,
        spent: spent * 10000000,
        utilizationPct: Number(utilTarget.toFixed(1)),
        categoryBreakdown: [
          { category: 'Education', pct: 30 },
          { category: 'Health', pct: 25 },
          { category: 'Infrastructure', pct: 20 },
          { category: 'Rural Dev', pct: 15 },
          { category: 'Urban Dev', pct: 10 }
        ],
        trend: trend.map(t => t * 10000000),
        alerts,
        topSchemes: ['Samagra Shiksha', 'National Health Mission', 'Pradhan Mantri Awas Yojana'],
        history5Years,
        summary
      };
    });
  }

  getAllStates(): StateData[] {
    return Object.values(this.mockData);
  }

  getStateData(stateName: string): StateData | undefined {
    return this.mockData[stateName];
  }
}
