require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const { loadEnv } = require("../config/env");
const { connectDb } = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");
const Budget = require("../models/Budget");
const Expenditure = require("../models/Expenditure");
const Alert = require("../models/Alert");
const AuditLog = require("../models/AuditLog");
const ThresholdConfig = require("../models/ThresholdConfig");
const RefreshToken = require("../models/RefreshToken");
const { hashPassword } = require("../utils/tokens");
const { runDetectionAll } = require("../services/anomalyEngine");

const crore = (n) => n * 10_000_000;

async function seed() {
  const env = loadEnv();
  await connectDb(env.mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Budget.deleteMany({}),
    Expenditure.deleteMany({}),
    Alert.deleteMany({}),
    AuditLog.deleteMany({}),
    ThresholdConfig.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);

  await ThresholdConfig.create({
    key: "default",
    underUtilizationPct: 40,
    underUtilizationTimeElapsedPct: 70,
    spikeThresholdPct: 25,
    paceDeviationPct: 20,
  });

  const deptDefs = [
    { name: "Department of School Education and Literacy", code: "DSEL" },
    { name: "Department of Rural Development", code: "DRD" },
    { name: "Department of Health and Family Welfare", code: "DHFW" },
    { name: "Ministry of Road Transport and Highways", code: "MORTH" },
    { name: "Ministry of Housing and Urban Affairs", code: "MOHUA" },
    { name: "Department of Drinking Water and Sanitation", code: "DDWS" },
    { name: "Department of Agriculture and Farmers Welfare", code: "DAFW" },
  ];
  const departments = await Department.insertMany(deptDefs);
  const byCode = Object.fromEntries(departments.map((d) => [d.code, d]));

  const passwordHash = await hashPassword("Password@123");

  const admin = await User.create({
    name: "Mr. Subhradeep Kundu",
    email: "admin@budgetmonitor.gov.in",
    passwordHash,
    role: "Admin",
    isActive: true,
  });

  // Demo normal user — read-only dashboard access
  const demoUser = await User.create({
    name: "Subhradeep Kundu",
    email: "user@budgetmonitor.gov.in",
    passwordHash,
    role: "User",
    isActive: true,
  });

  const finance = await User.create({
    name: "Mr. Ajay Seth",
    email: "finance@budgetmonitor.gov.in",
    passwordHash,
    role: "FinanceOfficer",
    isActive: true,
  });

  const heads = [];
  const headMeta = [
    ["DSEL", "Mr. T. K. Anil Kumar", "education.head@budgetmonitor.gov.in"],
    ["DRD", "Mr. Rohit Kansal", "rural.head@budgetmonitor.gov.in"],
    ["DHFW", "Mrs. Punya Salila Srivastava", "health.head@budgetmonitor.gov.in"],
    ["MORTH", "Mr. V. Umashankar", "roads.head@budgetmonitor.gov.in"],
    ["MOHUA", "Mr. Satendra Singh", "housing.head@budgetmonitor.gov.in"],
    ["DDWS", "Mr. Ashok Kaluram Meena", "water.head@budgetmonitor.gov.in"],
    ["DAFW", "Mr. Atish Chandra", "agriculture.head@budgetmonitor.gov.in"],
  ];
  for (const [code, name, email] of headMeta) {
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "DepartmentHead",
      departmentId: byCode[code]._id,
      isActive: true,
    });
    heads.push(user);
    byCode[code].headUserId = user._id;
    await byCode[code].save();
  }

  const schemes = {
    DSEL: [
      { fy: "2024-25", scheme: "Samagra Shiksha Abhiyan", amount: crore(36000), start: "2024-04-01", end: "2025-03-31" },
      { fy: "2025-26", scheme: "Samagra Shiksha Abhiyan", amount: crore(37453), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Samagra Shiksha Abhiyan", amount: crore(41020), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2025-26", scheme: "PM-POSHAN (Mid-Day Meal)", amount: crore(11600), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "PM-POSHAN (Mid-Day Meal)", amount: crore(12467), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "STARS Project", amount: crore(800), start: "2026-04-01", end: "2027-03-31" },
    ],
    DRD: [
      { fy: "2024-25", scheme: "Mahatma Gandhi NREGA", amount: crore(80000), start: "2024-04-01", end: "2025-03-31" },
      { fy: "2025-26", scheme: "Mahatma Gandhi NREGA", amount: crore(86000), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Mahatma Gandhi NREGA", amount: crore(89500), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2025-26", scheme: "Pradhan Mantri Gram Sadak Yojana", amount: crore(19000), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Pradhan Mantri Gram Sadak Yojana", amount: crore(20500), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "National Rural Livelihood Mission", amount: crore(14129), start: "2026-04-01", end: "2027-03-31" },
    ],
    DHFW: [
      { fy: "2024-25", scheme: "National Health Mission", amount: crore(34000), start: "2024-04-01", end: "2025-03-31" },
      { fy: "2025-26", scheme: "National Health Mission", amount: crore(36000), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "National Health Mission", amount: crore(38250), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2025-26", scheme: "Ayushman Bharat (PM-JAY)", amount: crore(7200), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Ayushman Bharat (PM-JAY)", amount: crore(7500), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "PM-ABHIM", amount: crore(4200), start: "2026-04-01", end: "2027-03-31" },
    ],
    MORTH: [
      { fy: "2024-25", scheme: "National Highways (capital outlay)", amount: crore(150000), start: "2024-04-01", end: "2025-03-31" },
      { fy: "2025-26", scheme: "National Highways (capital outlay)", amount: crore(164000), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "National Highways (capital outlay)", amount: crore(172800), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "Road Safety Fund", amount: crore(350), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "Parvatmala Pariyojana", amount: crore(1500), start: "2026-04-01", end: "2027-03-31" },
    ],
    MOHUA: [
      { fy: "2024-25", scheme: "Pradhan Mantri Awas Yojana — Urban", amount: crore(20000), start: "2024-04-01", end: "2025-03-31" },
      { fy: "2025-26", scheme: "Pradhan Mantri Awas Yojana — Urban", amount: crore(22137), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Pradhan Mantri Awas Yojana — Urban", amount: crore(25480), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2025-26", scheme: "Smart Cities Mission", amount: crore(8000), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Smart Cities Mission", amount: crore(2400), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "AMRUT", amount: crore(8000), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "Swachh Bharat Mission (Urban)", amount: crore(5000), start: "2026-04-01", end: "2027-03-31" },
    ],
    DDWS: [
      { fy: "2024-25", scheme: "Jal Jeevan Mission", amount: crore(65000), start: "2024-04-01", end: "2025-03-31" },
      { fy: "2025-26", scheme: "Jal Jeevan Mission", amount: crore(69694), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Jal Jeevan Mission", amount: crore(72200), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2025-26", scheme: "Swachh Bharat Mission (Gramin)", amount: crore(7192), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "Swachh Bharat Mission (Gramin)", amount: crore(7500), start: "2026-04-01", end: "2027-03-31" },
    ],
    DAFW: [
      { fy: "2024-25", scheme: "PM-KISAN income support", amount: crore(60000), start: "2024-04-01", end: "2025-03-31" },
      { fy: "2025-26", scheme: "PM-KISAN income support", amount: crore(60000), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "PM-KISAN income support", amount: crore(63500), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2025-26", scheme: "PM Fasal Bima Yojana", amount: crore(13625), start: "2025-04-01", end: "2026-03-31" },
      { fy: "2026-27", scheme: "PM Fasal Bima Yojana", amount: crore(14600), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "Krishi Unnati Yojana", amount: crore(7400), start: "2026-04-01", end: "2027-03-31" },
      { fy: "2026-27", scheme: "RKVY", amount: crore(7150), start: "2026-04-01", end: "2027-03-31" },
    ],
  };

  const budgets = {};
  for (const [code, items] of Object.entries(schemes)) {
    for (const item of items) {
      const status = (item.fy === "2024-25" || (item.fy === "2025-26" && code !== "DSEL")) ? "Closed" : "Active";
      const budget = await Budget.create({
        financialYear: item.fy,
        department: byCode[code]._id,
        allocatedAmount: item.amount,
        allocationDate: new Date(item.start),
        periodStart: new Date(item.start),
        periodEnd: new Date(item.end),
        scheme: item.scheme,
        status,
        createdBy: finance._id,
      });
      budgets[`${code}-${item.fy}-${item.scheme}`] = budget;
    }
  }

  const headByCode = Object.fromEntries(heads.map((h) => [String(h.departmentId), h]));

  function exp(budget, amount, category, date, description, recordedBy) {
    if (!budget) return null;
    return {
      budgetId: budget._id,
      amountSpent: amount,
      category,
      date: new Date(date),
      description,
      supportingDocUrl: null,
      recordedBy,
    };
  }

  const rows = [];
  
  // Historical data for 2024-25 to make the charts look fuller
  const morth24 = budgets["MORTH-2024-25-National Highways (capital outlay)"];
  const morthHead = headByCode[String(byCode.MORTH._id)];
  rows.push(
    exp(morth24, crore(35000), "Capital works", "2024-05-15", "Q1 NHAI infusion", morthHead._id),
    exp(morth24, crore(40000), "Capital works", "2024-08-20", "Q2 NHAI infusion", morthHead._id),
    exp(morth24, crore(38000), "Capital works", "2024-11-10", "Q3 NHAI infusion", morthHead._id),
    exp(morth24, crore(36000), "Capital works", "2025-02-25", "Q4 NHAI infusion", morthHead._id)
  );

  const dafw24 = budgets["DAFW-2024-25-PM-KISAN income support"];
  const dafwHead = headByCode[String(byCode.DAFW._id)];
  rows.push(
    exp(dafw24, crore(15000), "Direct benefit transfer", "2024-04-15", "13th instalment", dafwHead._id),
    exp(dafw24, crore(15000), "Direct benefit transfer", "2024-08-10", "14th instalment", dafwHead._id),
    exp(dafw24, crore(15000), "Direct benefit transfer", "2024-12-05", "15th instalment", dafwHead._id)
  );

  // DSEL 2025-26: under-utilization (~18% spent, period fully elapsed, still Active)
  const dselOld = budgets["DSEL-2025-26-Samagra Shiksha Abhiyan"];
  const dselHead = headByCode[String(byCode.DSEL._id)];
  rows.push(
    exp(dselOld, crore(2180), "Teacher training", "2025-06-12", "NISHTHA teacher training grants to states", dselHead._id),
    exp(dselOld, crore(2450), "Infrastructure", "2025-09-03", "Additional classrooms and ICT labs (Phase I)", dselHead._id),
    exp(dselOld, crore(1980), "Textbooks and uniforms", "2025-11-18", "Free textbooks and uniforms for government schools", dselHead._id)
  );
  
  // DSEL Mid Day Meal 2025-26
  const dselMdmOld = budgets["DSEL-2025-26-PM-POSHAN (Mid-Day Meal)"];
  rows.push(
    exp(dselMdmOld, crore(2500), "Food grains", "2025-05-10", "FCI payment for grains", dselHead._id),
    exp(dselMdmOld, crore(3100), "Cooking cost", "2025-08-15", "Q2 Cooking costs transferred to states", dselHead._id),
    exp(dselMdmOld, crore(2900), "Honorarium", "2025-11-20", "Cook-cum-helper honorarium", dselHead._id),
    exp(dselMdmOld, crore(2800), "Food grains", "2026-02-10", "Q4 FCI payments", dselHead._id)
  );

  // DSEL 2026-27: on-pace ~45%
  const dselNew = budgets["DSEL-2026-27-Samagra Shiksha Abhiyan"];
  rows.push(
    exp(dselNew, crore(6200), "Teacher salaries (scheme)", "2026-05-20", "Q1 salary support under Samagra Shiksha", dselHead._id),
    exp(dselNew, crore(7100), "Infrastructure", "2026-07-14", "School infrastructure and digital classrooms", dselHead._id),
    exp(dselNew, crore(5400), "Inclusive education", "2026-09-02", "Inclusive education and KGBV hostels", dselHead._id)
  );
  
  const dselMdmNew = budgets["DSEL-2026-27-PM-POSHAN (Mid-Day Meal)"];
  rows.push(
    exp(dselMdmNew, crore(2800), "Food grains", "2026-04-15", "Q1 FCI payments", dselHead._id),
    exp(dselMdmNew, crore(3200), "Cooking cost", "2026-07-10", "Q2 Cooking costs", dselHead._id)
  );

  // DRD MGNREGA — historically fully utilized, current year healthy
  const drdHead = headByCode[String(byCode.DRD._id)];
  rows.push(
    exp(budgets["DRD-2025-26-Mahatma Gandhi NREGA"], crore(28000), "Wage payments", "2025-06-30", "Wage payments — Q1 FY 2025-26", drdHead._id),
    exp(budgets["DRD-2025-26-Mahatma Gandhi NREGA"], crore(26500), "Wage payments", "2025-09-30", "Wage payments — Q2 FY 2025-26", drdHead._id),
    exp(budgets["DRD-2025-26-Mahatma Gandhi NREGA"], crore(17200), "Material component", "2025-12-20", "Material ratio works under MGNREGA", drdHead._id),
    exp(budgets["DRD-2025-26-Mahatma Gandhi NREGA"], crore(13800), "Wage payments", "2026-03-10", "Wage payments — Q4 FY 2025-26", drdHead._id),
    exp(budgets["DRD-2026-27-Mahatma Gandhi NREGA"], crore(18500), "Wage payments", "2026-05-15", "Wage payments — Q1 FY 2026-27", drdHead._id),
    exp(budgets["DRD-2026-27-Mahatma Gandhi NREGA"], crore(21200), "Wage payments", "2026-08-12", "Wage payments — monsoon works", drdHead._id),
    exp(budgets["DRD-2026-27-Pradhan Mantri Gram Sadak Yojana"], crore(4500), "Capital works", "2026-05-20", "PMGSY road construction Phase III", drdHead._id),
    exp(budgets["DRD-2026-27-Pradhan Mantri Gram Sadak Yojana"], crore(5200), "Capital works", "2026-08-30", "Rural connectivity projects", drdHead._id)
  );

  // DHFW current year: pace deviation (very slow spend vs ~47% elapsed)
  const dhfwHead = headByCode[String(byCode.DHFW._id)];
  rows.push(
    exp(budgets["DHFW-2025-26-National Health Mission"], crore(9800), "Health systems", "2025-07-01", "NHM state PIP release — Q1-Q2", dhfwHead._id),
    exp(budgets["DHFW-2025-26-National Health Mission"], crore(11200), "Immunisation", "2025-11-02", "Universal Immunisation Programme procurement", dhfwHead._id),
    exp(budgets["DHFW-2025-26-National Health Mission"], crore(12100), "Health systems", "2026-02-18", "NHM Q4 releases to states", dhfwHead._id),
    exp(budgets["DHFW-2026-27-National Health Mission"], crore(1450), "Health systems", "2026-05-22", "Limited Q1 NHM release pending PIP approvals", dhfwHead._id),
    exp(budgets["DHFW-2026-27-National Health Mission"], crore(980), "Diagnostics", "2026-08-08", "Free diagnostics reagents — delayed tender", dhfwHead._id),
    exp(budgets["DHFW-2026-27-Ayushman Bharat (PM-JAY)"], crore(1500), "Insurance premium", "2026-04-25", "PM-JAY premium subsidies", dhfwHead._id),
    exp(budgets["DHFW-2026-27-Ayushman Bharat (PM-JAY)"], crore(1800), "Insurance premium", "2026-07-15", "Hospital claims settlement support", dhfwHead._id)
  );

  // MORTH healthy utilization
  rows.push(
    exp(budgets["MORTH-2025-26-National Highways (capital outlay)"], crore(42000), "Capital works", "2025-06-15", "NHAI capital infusion — Q1", morthHead._id),
    exp(budgets["MORTH-2025-26-National Highways (capital outlay)"], crore(45500), "Capital works", "2025-10-10", "Bharatmala / NH works — Q2-Q3", morthHead._id),
    exp(budgets["MORTH-2025-26-National Highways (capital outlay)"], crore(51000), "Capital works", "2026-02-20", "NHAI capital infusion — Q4", morthHead._id),
    exp(budgets["MORTH-2026-27-National Highways (capital outlay)"], crore(28000), "Capital works", "2026-05-18", "NHAI capital infusion — Q1 FY 2026-27", morthHead._id),
    exp(budgets["MORTH-2026-27-National Highways (capital outlay)"], crore(33500), "Capital works", "2026-08-22", "Corridor construction progress payments", morthHead._id),
    exp(budgets["MORTH-2026-27-Parvatmala Pariyojana"], crore(250), "Capital works", "2026-06-10", "Ropeway projects initial mobilization", morthHead._id)
  );

  // MOHUA 2026-27: spending spike — small spends then one voucher >25% of remaining
  const mohuaHead = headByCode[String(byCode.MOHUA._id)];
  rows.push(
    exp(budgets["MOHUA-2025-26-Pradhan Mantri Awas Yojana — Urban"], crore(7200), "Housing subsidy", "2025-07-11", "PMAY-U central assistance to ULBs", mohuaHead._id),
    exp(budgets["MOHUA-2025-26-Pradhan Mantri Awas Yojana — Urban"], crore(8100), "Housing subsidy", "2025-12-04", "PMAY-U vertical: BLC / AHP", mohuaHead._id),
    exp(budgets["MOHUA-2025-26-Pradhan Mantri Awas Yojana — Urban"], crore(5400), "Urban amenities", "2026-03-01", "AMRUT 2.0 tied grants", mohuaHead._id),
    exp(budgets["MOHUA-2026-27-Pradhan Mantri Awas Yojana — Urban"], crore(1800), "Capacity building", "2026-05-06", "CMMU / SLTC support to states", mohuaHead._id),
    exp(budgets["MOHUA-2026-27-Pradhan Mantri Awas Yojana — Urban"], crore(2200), "Housing subsidy", "2026-06-20", "First instalment of PMAY-U central share", mohuaHead._id),
    exp(
      budgets["MOHUA-2026-27-Pradhan Mantri Awas Yojana — Urban"],
      crore(9800),
      "Housing subsidy",
      "2026-09-05",
      "Bulk central assistance to 14 states after delayed utilisation certificates — single large voucher",
      mohuaHead._id
    ),
    exp(budgets["MOHUA-2026-27-Swachh Bharat Mission (Urban)"], crore(1200), "Sanitation", "2026-05-15", "SBM-U legacy waste remediation", mohuaHead._id),
    exp(budgets["MOHUA-2026-27-AMRUT"], crore(2100), "Water supply", "2026-07-22", "AMRUT 2.0 water tap connections", mohuaHead._id)
  );

  // DDWS Jal Jeevan — moderate
  const ddwsHead = headByCode[String(byCode.DDWS._id)];
  rows.push(
    exp(budgets["DDWS-2025-26-Jal Jeevan Mission"], crore(18000), "Rural water supply", "2025-06-25", "JJM FHTC works — Q1", ddwsHead._id),
    exp(budgets["DDWS-2025-26-Jal Jeevan Mission"], crore(21000), "Rural water supply", "2025-10-30", "JJM FHTC works — Q2-Q3", ddwsHead._id),
    exp(budgets["DDWS-2025-26-Jal Jeevan Mission"], crore(19500), "Quality monitoring", "2026-02-12", "Water quality labs and O&M", ddwsHead._id),
    exp(budgets["DDWS-2026-27-Jal Jeevan Mission"], crore(14200), "Rural water supply", "2026-05-28", "JJM state releases — Q1", ddwsHead._id),
    exp(budgets["DDWS-2026-27-Jal Jeevan Mission"], crore(16800), "Rural water supply", "2026-08-16", "Har Ghar Jal remaining habitations", ddwsHead._id),
    exp(budgets["DDWS-2026-27-Swachh Bharat Mission (Gramin)"], crore(2100), "Sanitation", "2026-06-05", "ODF Plus solid waste management", ddwsHead._id)
  );

  // DAFW PM-KISAN — quarterly instalments
  rows.push(
    exp(budgets["DAFW-2025-26-PM-KISAN income support"], crore(14500), "Direct benefit transfer", "2025-04-20", "PM-KISAN 16th instalment", dafwHead._id),
    exp(budgets["DAFW-2025-26-PM-KISAN income support"], crore(14800), "Direct benefit transfer", "2025-08-05", "PM-KISAN 17th instalment", dafwHead._id),
    exp(budgets["DAFW-2025-26-PM-KISAN income support"], crore(15100), "Direct benefit transfer", "2025-12-01", "PM-KISAN 18th instalment", dafwHead._id),
    exp(budgets["DAFW-2025-26-PM-KISAN income support"], crore(14600), "Direct benefit transfer", "2026-03-08", "PM-KISAN 19th instalment", dafwHead._id),
    exp(budgets["DAFW-2026-27-PM-KISAN income support"], crore(15200), "Direct benefit transfer", "2026-04-18", "PM-KISAN 20th instalment", dafwHead._id),
    exp(budgets["DAFW-2026-27-PM-KISAN income support"], crore(15450), "Direct benefit transfer", "2026-08-10", "PM-KISAN 21st instalment", dafwHead._id),
    exp(budgets["DAFW-2026-27-PM Fasal Bima Yojana"], crore(3200), "Insurance premium", "2026-05-12", "Kharif crop insurance premium subsidy", dafwHead._id),
    exp(budgets["DAFW-2026-27-Krishi Unnati Yojana"], crore(1500), "Agriculture support", "2026-07-05", "Soil health card and mechanization", dafwHead._id)
  );

  const cleanRows = rows.filter(r => r !== null);
  await Expenditure.insertMany(cleanRows);

  await AuditLog.create({
    userId: admin._id,
    action: "seed.run",
    targetCollection: "System",
    targetId: "seed",
    changes: { before: null, after: { departments: departments.length, users: 2 + heads.length, budgets: Object.keys(budgets).length, expenditures: cleanRows.length } },
  });

  console.log("Seed complete.");
  console.log("Login accounts (password for all: Password@123)");
  console.log("  Admin:            admin@budgetmonitor.gov.in");
  console.log("  FinanceOfficer:   finance@budgetmonitor.gov.in");
  console.log("  DepartmentHead:   education.head@budgetmonitor.gov.in (and other *.head@ accounts)");
  console.log("Intentional anomalies (run POST /api/monitoring/run after start):");
  console.log("  UnderUtilization: Samagra Shiksha FY 2025-26 (DSEL)");
  console.log("  PaceDeviation:    National Health Mission FY 2026-27 (DHFW)");
  console.log("  Spike:            PMAY-U FY 2026-27 bulk voucher (MOHUA)");

  console.log("Running Anomaly Detection Engine to generate dummy open alerts...");
  await runDetectionAll();
  
  // Mark some alerts as resolved
  const allAlerts = await Alert.find().limit(5);
  for (const a of allAlerts) {
    a.resolved = true;
    a.resolvedBy = admin._id;
    a.resolvedAt = new Date(Date.now() - Math.random() * 1000000000); // Some random past date
    await a.save();
  }
  
  console.log("Dummy alerts (open and resolved) generated successfully!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
