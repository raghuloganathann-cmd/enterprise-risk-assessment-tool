// =============================================
//  ENTERPRISE RISK ASSESSMENT TOOL — DATA
// =============================================

const CATEGORIES = ['Operational','Financial','Compliance','Cybersecurity','Strategic','Reputational','Legal'];
const DEPARTMENTS = ['IT','Finance','HR','Legal','Operations','Marketing','Supply Chain'];
const STATUSES    = ['Open','Mitigating','Monitoring','Resolved'];

// Seed data
let risks = [
  {
    id: 1,
    title: 'Data breach via phishing',
    category: 'Cybersecurity',
    dept: 'IT',
    likelihood: 4, impact: 5,
    status: 'Mitigating',
    owner: 'Alex Kim',
    desc: 'Risk of credential theft through sophisticated phishing campaigns targeting C-suite executives and finance teams.',
    mitigation: 'Mandatory security awareness training, email filtering, MFA enforcement, and incident response playbook activated.',
    createdAt: '2025-01-10'
  },
  {
    id: 2,
    title: 'GDPR regulatory non-compliance',
    category: 'Compliance',
    dept: 'Legal',
    likelihood: 3, impact: 5,
    status: 'Open',
    owner: 'Priya Mehta',
    desc: 'Potential violations of GDPR data processing requirements due to inconsistent data handling procedures across EU operations.',
    mitigation: 'Legal audit commissioned. Data mapping exercise in progress. DPO hired to oversee remediation.',
    createdAt: '2025-01-15'
  },
  {
    id: 3,
    title: 'Key supplier insolvency',
    category: 'Operational',
    dept: 'Supply Chain',
    likelihood: 2, impact: 4,
    status: 'Monitoring',
    owner: 'James Liu',
    desc: 'Single-source dependency on critical component supplier showing financial distress signals. Disruption could halt production for 4–8 weeks.',
    mitigation: 'Identified two alternate suppliers. Increased safety stock to 12 weeks. Monthly financial health checks on supplier.',
    createdAt: '2025-01-18'
  },
  {
    id: 4,
    title: 'Foreign exchange exposure',
    category: 'Financial',
    dept: 'Finance',
    likelihood: 4, impact: 3,
    status: 'Monitoring',
    owner: 'Clara Torres',
    desc: 'High volatility in USD/EUR and USD/GBP pairs significantly affecting reported earnings and cash flow forecasts.',
    mitigation: 'Forward contracts covering 60% of expected FX exposure. Treasury policy updated. Hedging strategy review quarterly.',
    createdAt: '2025-01-22'
  },
  {
    id: 5,
    title: 'Critical talent attrition',
    category: 'Operational',
    dept: 'HR',
    likelihood: 3, impact: 3,
    status: 'Mitigating',
    owner: 'Sam Okafor',
    desc: 'Elevated attrition in senior engineering and product management roles amid aggressive competitive hiring. 18% turnover vs 9% target.',
    mitigation: 'Compensation benchmark study completed. Retention bonuses issued. Career development plans rolled out. Flexible work policy extended.',
    createdAt: '2025-02-01'
  },
  {
    id: 6,
    title: 'Product liability lawsuit (EU)',
    category: 'Legal',
    dept: 'Legal',
    likelihood: 2, impact: 5,
    status: 'Open',
    owner: 'Priya Mehta',
    desc: 'Pending class-action litigation in Germany regarding alleged product defects. Potential damages estimated at €12M–€40M.',
    mitigation: 'External legal counsel retained. Settlement negotiations initiated. Product recall assessment underway.',
    createdAt: '2025-02-05'
  },
  {
    id: 7,
    title: 'Social media reputational incident',
    category: 'Reputational',
    dept: 'Marketing',
    likelihood: 2, impact: 4,
    status: 'Open',
    owner: 'Dana Brooks',
    desc: 'Customer service failures trending on social media. Brand sentiment score declined 14 points over Q1.',
    mitigation: 'Crisis communications plan activated. Executive response team assembled. Social listening tools deployed.',
    createdAt: '2025-02-10'
  },
  {
    id: 8,
    title: 'Cloud platform outage dependency',
    category: 'Cybersecurity',
    dept: 'IT',
    likelihood: 3, impact: 4,
    status: 'Resolved',
    owner: 'Alex Kim',
    desc: 'Critical SaaS platform (CRM + ERP) single-region deployment causing full downtime risk. Previous outage caused 18-hour disruption.',
    mitigation: 'Multi-region failover implemented. RTO reduced to 30 min. DR testing completed. BCP updated.',
    createdAt: '2025-02-15'
  },
  {
    id: 9,
    title: 'Interest rate sensitivity',
    category: 'Financial',
    dept: 'Finance',
    likelihood: 3, impact: 3,
    status: 'Monitoring',
    owner: 'Clara Torres',
    desc: 'Variable-rate debt portfolio exposed to central bank rate changes. 100bps increase adds $2.4M to annual interest expense.',
    mitigation: 'Interest rate swap covering 40% of floating debt. Fixed-rate refinancing being explored for Q3.',
    createdAt: '2025-02-20'
  },
  {
    id: 10,
    title: 'AI governance & ethics risk',
    category: 'Strategic',
    dept: 'IT',
    likelihood: 2, impact: 3,
    status: 'Monitoring',
    owner: 'Alex Kim',
    desc: 'Rapid AI adoption without formal governance framework creates potential for biased decisions, regulatory scrutiny, and IP exposure.',
    mitigation: 'AI ethics committee established. Model risk framework being drafted. Vendor due diligence checklist in use.',
    createdAt: '2025-03-01'
  },
  {
    id: 11,
    title: 'Market share erosion (new entrant)',
    category: 'Strategic',
    dept: 'Marketing',
    likelihood: 3, impact: 4,
    status: 'Open',
    owner: 'Dana Brooks',
    desc: 'Well-funded competitor launched in APAC with aggressive pricing. Projected 8% revenue impact in core segment.',
    mitigation: 'Competitive response strategy approved by board. Product roadmap accelerated. Pricing strategy review initiated.',
    createdAt: '2025-03-05'
  },
  {
    id: 12,
    title: 'Insider threat data exfiltration',
    category: 'Cybersecurity',
    dept: 'IT',
    likelihood: 1, impact: 5,
    status: 'Monitoring',
    owner: 'Alex Kim',
    desc: 'Risk of intentional or accidental data exfiltration by employees or contractors with privileged system access.',
    mitigation: 'DLP tools deployed. Privileged access management (PAM) implemented. Background checks enhanced for new hires.',
    createdAt: '2025-03-10'
  }
];

let nextId = risks.length + 1;
