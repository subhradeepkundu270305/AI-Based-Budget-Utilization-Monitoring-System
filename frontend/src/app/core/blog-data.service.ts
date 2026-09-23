import { Injectable } from '@angular/core';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BlogDataService {
  private mockPosts: BlogPost[] = [
    {
      id: 'obs-2025',
      title: 'Twenty Years of Fiscal Transparency in India: Open Budgets, PFMS, and the Road Ahead',
      excerpt: 'Over twenty years of fiscal federalism, FRBM frameworks, and PFMS rollouts, India has modernized public money management across Union and State treasuries. Yet, citizen participatory oversight and district-level social audits remain vital frontiers.',
      content: `India's fiscal reporting architecture has undergone an unprecedented transformation over the last two decades. From physical budget volumes to comprehensive digital dissemination through the Union Budget Portal, PFMS, and State e-Kosh systems, public accessibility to expenditure data has never been higher.

However, the India Budget Transparency Review 2025 highlights key areas for advancement: while national-level budget transparency and legislative oversight score high (82/100 and 91/100 respectively), institutional mechanisms for direct citizen participation at the municipal and panchayat levels require deeper statutory backing.

### Key National Findings

1. **The Digital Leap**: Central and State governments now publish granular expenditure heads online in real-time, providing unprecedented visibility into the ₹48.2 Lakh Crore national budget pipeline.
2. **The Social Audit Frontier**: While MGNREGA mandates institutionalized Gram Sabha social audits, extending similar community scorecards to Centrally Sponsored Schemes like Jal Jeevan Mission and PMGSY is essential.
3. **Sub-National Disbursal Acceleration**: The transition to Single Nodal Agency (SNA) accounts under PFMS has reduced parked state funds by over 42%, ensuring just-in-time treasury releases to district implementation agencies.

### Policy Pathways for 2026-2030

To convert digital transparency into grassroots social impact, policy frameworks must mandate citizen-facing executive budget summaries in regional languages, institutionalize quarterly district development coordination hearings (DISHA), and deploy automated AI alert engines that prevent funds from lapsing before reaching primary healthcare and rural school facilities.`,
      category: 'Fiscal Federalism',
      author: 'Dr. Sanjeev Sanyal & Vivek Ramkumar',
      date: 'Sep 18, 2026',
      readTime: '9 min read',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      featured: true
    },
    {
      id: 'gender-gap',
      title: 'Gender-Responsive Budgeting in India: Moving from Statement 13 to Measurable District Outcomes',
      excerpt: 'Analyzing the Union Budget Gender Statement across 36 States & UTs: ensuring women-centric capital outlays in rural water grids, maternal healthcare, and female labor force participation.',
      content: `Gender-responsive budgeting (GRB) in India has been institutionalized since 2005 through Statement 13 of the Union Budget, categorizing outlays across 100% women-specific schemes (Part A) and 30%+ women-benefitting schemes (Part B).

An empirical analysis across 36 States and Union Territories indicates that while aggregate gender allocations have crossed ₹3.2 Lakh Crore in FY 2025-26, bridging the gap requires embedding gender audit metrics into core infrastructure investments such as last-mile rural transport, street lighting, and piped sanitation.

### Key Observations

- In high-performing districts where Direct Benefit Transfers for maternal nutrition (PMMVY) are integrated with frontline ASHA digital reporting, scheme drop-off rates fell by 31%.
- Linking women self-help groups (SHGs) under Deendayal Antyodaya Yojana (DAY-NRLM) with community procurement tenders has enabled ₹42,000 Cr in direct micro-enterprise economic value.`,
      category: 'Gender Budgeting',
      author: 'Priyanka Samy, Dr. Sunita Roy',
      date: 'Sep 15, 2026',
      readTime: '7 min read',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80'
    },
    {
      id: 'sanitation-swachh-bharat',
      title: 'Swachh Bharat & Municipal Sanitation: Fiscal Transparency in Urban Infrastructure Outlays',
      excerpt: 'How data-driven expenditure tracking and automated contractor milestone verification under Swachh Bharat Mission (Urban 2.0) are optimizing municipal budget utilization.',
      content: `Under Swachh Bharat Mission (Urban 2.0) and AMRUT, municipal corporations across India are managing thousands of crores in mechanized sanitation, sewage treatment plants, and solid waste processing facilities.

By auditing procurement tenders and contractor payment milestones through digital treasury interfaces, city administrators can ensure that capital expenditure for permanent STP infrastructure is prioritized over recurring short-term operational leases.

### Six Policy Recommendations for Urban Local Bodies

1. Transition from manual municipal voucher audits to PFMS-integrated e-billing.
2. Establish citizen ward committees for public verification of sanitation asset completion.
3. Integrate real-time IoT sensor data into municipal waste transport billing to eliminate ghost mileage claims.
4. Mandate open contracting standards for all municipal solid waste tenders exceeding ₹50 Lakh.
5. Ring-fence minimum sanitation appropriations within State Finance Commission transfers to tier-2 and tier-3 towns.
6. Conduct mandatory quarterly grievance redressal sessions with sanitation worker collectives.`,
      category: 'Public Services',
      author: 'Ravi Verma, Shalini Nair',
      date: 'Aug 21, 2026',
      readTime: '8 min read',
      imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&q=80'
    },
    {
      id: 'ai-public-finance',
      title: 'AI in PFMS: Machine Learning in India’s Public Financial Management System',
      excerpt: 'From real-time anomaly detection in state treasury pipelines to predictive cash-flow forecasting: examining the operational impact of AI on India’s public expenditure.',
      content: `Artificial intelligence is rapidly transitioning from an experimental policy concept into an operational pillar of India's Public Financial Management System (PFMS) and the Comptroller and Auditor General (CAG) digital audit pipeline.

Traditionally, public expenditure audit was retrospective, analyzing vouchers long after funds had been spent or unspent balances had lapsed at financial year-end.

### Real-World AI Interventions in India

- **Automated Pacing Anomaly Engines**: Machine learning algorithms compare daily departmental burn rates against historic seasonal benchmarks. If a department rushes to spend 65% of its capital grant in the final 15 days of March, the system flags a "March Rush" anomaly alert in real-time.
- **Contractor Duplicate Detection**: Natural Language Processing models identify duplicate GSTIN billings, overlapping invoice line items, and undisclosed vendor ties across state and central e-procurement portals.
- **Predictive DBT Reconciliation**: Predictive models forecast Aadhaar payment bridge settlement delays and bank server timeouts, enabling proactive re-routing before welfare transfers stall.`,
      category: 'AI & Governance',
      author: 'Dr. Siddharth Rao, Neha Deshmukh',
      date: 'Aug 04, 2026',
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
    },
    {
      id: 'union-budget-2026',
      title: 'Union Budget 2026: Key Allocations, Infrastructure Push and Fiscal Consolidation',
      excerpt: 'An exhaustive analysis of the national budget presentation: balancing capital expenditure growth, fiscal deficit glide paths, and welfare scheme delivery across 36 States and UTs.',
      content: `The Union Budget 2026 strikes a careful balance between sustained capital investment and adherence to fiscal consolidation targets. Capital expenditure has been pegged at an historic ₹11.11 Lakh Crore, representing 3.4% of GDP.

Key focus areas include the expansion of dedicated freight corridors, solar park grid integration, and targeted viability gap funding for sub-national green urban transit projects.`,
      category: 'Union Budget',
      author: 'Aanya Sharma',
      date: 'Feb 04, 2026',
      readTime: '8 min read',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
    },
    {
      id: 'state-fiscal-health',
      title: 'Sub-National Debt & Fiscal Health: An Empirical Study of State Budget Allocation Lags',
      excerpt: 'Examining why some states experience persistent under-utilization in Centrally Sponsored Schemes while simultaneously accumulating off-budget debt liabilities.',
      content: `The Reserve Bank of India’s latest study on state finances underscores significant divergence in fiscal capacity across Indian states. 

While front-runner states demonstrate utilization rates exceeding 78% by Q3, several sub-national governments struggle with counterpart funding delays, complex administrative sanction hierarchies, and fragmented treasury single account (TSA) compliance.`,
      category: 'State Finances',
      author: 'Rajiv Menon',
      date: 'Jan 22, 2026',
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80'
    },
    {
      id: 'samagra-shiksha-audit',
      title: 'Auditing Education Disbursements: Are Centrally Sponsored Funds Reaching Schools?',
      excerpt: 'Tracking the fund flow pipeline of national education grants from central treasuries to frontline classrooms, identifying delays in teacher training and infrastructure grants.',
      content: `Education remains the single largest human capital appropriation in public budgets. Yet, field surveys across 2,400 schools reveal that non-salary capital grants for laboratories and sanitation often arrive less than six weeks before the fiscal year-end, compelling hasty expenditures without adequate quality assurance.`,
      category: 'Policy Analysis',
      author: 'Meera Das',
      date: 'Dec 10, 2025',
      readTime: '10 min read',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80'
    },
    {
      id: 'dbt-leakage-reduction',
      title: 'Direct Benefit Transfers (DBT) Pipelining: Reducing Intermediary Friction Across 36 States',
      excerpt: 'Analyzing the systemic shift from physical cash disbursement to digital biometric transfers, and the remaining challenges in Aadhaar-linked payment reconciliation.',
      content: `Over ₹34 Lakh Crore has been disbursed through India's DBT pipeline over the past decade, yielding cumulative estimated savings of over ₹2.7 Lakh Crore by eliminating ghost beneficiaries. We examine the next frontier of DBT: automated reconciliation and real-time grievance remediation.`,
      category: 'Data Stories',
      author: 'Dr. Siddharth Rao',
      date: 'Nov 14, 2025',
      readTime: '7 min read',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80'
    },
    {
      id: 'sna-sparsh-treasury',
      title: 'SNA-SPARSH & Just-in-Time Funding: Eliminating ₹40,000 Cr in Idle State Float',
      excerpt: 'How the Ministry of Finance transitioned Centrally Sponsored Schemes from bulk parked advances to zero-balance just-in-time treasury transfers across 36 States.',
      content: `The implementation of the Single Nodal Agency (SNA) SPARSH model by the Department of Expenditure, Ministry of Finance, represents one of the most consequential structural reforms in Indian public financial administration since the inception of the Public Financial Management System (PFMS).

For decades, the central transfer mechanism for Centrally Sponsored Schemes (CSS) relied on disbursing bulk advance tranches into thousands of commercial bank accounts operated by state departments and implementation societies. This legacy structure resulted in severe fiscal friction: an estimated ₹1.2 Lakh Crore in unspent public funds sat "parked" as idle float, while the Union government continued issuing sovereign treasury bills and paying interest on borrowings to fund daily outlays.

### The Architectural Shift to Just-in-Time Disbursal

Under the SNA-SPARSH paradigm, the parked-money model has been fundamentally dismantled:

1. **Zero-Balance Auxiliary Accounts**: State implementation agencies no longer hold stagnant liquidity balances. Instead, their accounts are pegged as zero-balance ledgers linked directly to the Consolidated Fund of the State in the Reserve Bank of India (RBI).
2. **Event-Driven Treasury Debits**: Central and State shares of scheme funding are debited only when a validated vendor invoice, work completion certificate, or Direct Benefit Transfer (DBT) debit order is finalized.
3. **Interest Savings & Debt Compression**: By eliminating ₹40,000+ Crore of persistent idle float across health, rural roads, and water supply grids, the Union government has averted approximately ₹10,500 Crore in annual borrowing interest overheads.

### Empirical Velocity Across 36 States

Data audited across 36 States and Union Territories reveals significant governance dividends:
- **Disbursement Cycle Compression**: Average turnaround time between project milestone sanction and vendor account credit contracted from 28 days to under 48 hours.
- **Counterpart Matching Efficiency**: Automated PFMS rules now prevent subsequent Central tranche releases until the corresponding State Matching Share has been verified in the central ledger, curtailing state fiscal diversion.

### The Next Frontier: Algorithmic Verification
The next phase of SNA-SPARSH integration couples real-time banking rails with automated satellite GIS verification (PM Gati Shakti) and machine learning anomaly engines, ensuring public funds are mobilized only when ground-level physical progress matches expenditure claims.`,
      category: 'Treasury Reforms',
      author: 'Sanjay Malhotra & V. Anantha Nageswaran',
      date: 'Oct 28, 2025',
      readTime: '8 min read',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
    }
  ];

  constructor() {}

  getPosts(): BlogPost[] {
    return this.mockPosts;
  }

  getPostById(id: string): BlogPost | undefined {
    return this.mockPosts.find(p => p.id === id);
  }

  getCategories(): string[] {
    const cats = new Set(this.mockPosts.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }
}
