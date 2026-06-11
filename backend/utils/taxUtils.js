/**
 * Indian Tax Utility Functions (FY 2024-25 / AY 2025-26)
 * Covers both Old Regime and New Regime
 */

// ─── OLD REGIME SLABS ────────────────────────────────────────────────────────
// For individuals below 60 years
const OLD_REGIME_SLABS = [
  { min: 0,        max: 250000,  rate: 0    },
  { min: 250001,   max: 500000,  rate: 0.05 },
  { min: 500001,   max: 1000000, rate: 0.20 },
  { min: 1000001,  max: Infinity,rate: 0.30 },
];

// ─── NEW REGIME SLABS (default from FY 2024-25) ──────────────────────────────
const NEW_REGIME_SLABS = [
  { min: 0,        max: 300000,  rate: 0    },
  { min: 300001,   max: 700000,  rate: 0.05 },
  { min: 700001,   max: 1000000, rate: 0.10 },
  { min: 1000001,  max: 1200000, rate: 0.15 },
  { min: 1200001,  max: 1500000, rate: 0.20 },
  { min: 1500001,  max: Infinity,rate: 0.30 },
];

// ─── SURCHARGE RATES ─────────────────────────────────────────────────────────
const getSurchargeRate = (income) => {
  if (income <= 5000000)   return 0;
  if (income <= 10000000)  return 0.10;
  if (income <= 20000000)  return 0.15;
  if (income <= 50000000)  return 0.25;
  return 0.37; // Only applicable in Old Regime; capped at 25% in New
};

// ─── CESS ─────────────────────────────────────────────────────────────────────
const CESS_RATE = 0.04; // Health & Education Cess

// ─── HELPER: Calculate tax from slabs ────────────────────────────────────────
const calculateSlabTax = (income, slabs) => {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const taxableInSlab = Math.min(income, slab.max) - slab.min;
    tax += taxableInSlab * slab.rate;
  }
  return Math.round(tax);
};

// ─── OLD REGIME ──────────────────────────────────────────────────────────────
export const calculateOldRegimeTax = (grossIncome, deductions = {}) => {
  const {
    section80C       = 0,  // Max 1,50,000
    section80D       = 0,  // Max 25,000 (self) / 50,000 (senior parents)
    hra              = 0,
    lta              = 0,
    homeLoanInterest = 0,  // Section 24(b) Max 2,00,000
    nps              = 0,  // Section 80CCD(1B) Max 50,000
    otherDeductions  = 0,
  } = deductions;

  // Standard deduction for salaried: ₹50,000
  const standardDeduction = 50000;

  // Cap section 80C at 1.5 lakh
  const capped80C = Math.min(section80C, 150000);
  const capped80D = Math.min(section80D, 75000);
  const cappedNPS = Math.min(nps, 50000);
  const cappedHomeLoan = Math.min(homeLoanInterest, 200000);

  const totalDeductions =
    standardDeduction +
    capped80C +
    capped80D +
    hra +
    lta +
    cappedHomeLoan +
    cappedNPS +
    otherDeductions;

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  let tax = calculateSlabTax(taxableIncome, OLD_REGIME_SLABS);

  // Rebate u/s 87A: if taxable income ≤ 5L, tax = 0
  if (taxableIncome <= 500000) tax = 0;

  const surcharge = tax * getSurchargeRate(taxableIncome);
  const cess = (tax + surcharge) * CESS_RATE;
  const totalTax = Math.round(tax + surcharge + cess);

  return {
    regime: "Old Regime",
    grossIncome,
    totalDeductions,
    taxableIncome,
    baseTax: tax,
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax,
    effectiveRate: grossIncome > 0 ? ((totalTax / grossIncome) * 100).toFixed(2) : 0,
    monthlyTax: Math.round(totalTax / 12),
    deductionBreakdown: {
      standardDeduction,
      section80C: capped80C,
      section80D: capped80D,
      hra,
      lta,
      homeLoanInterest: cappedHomeLoan,
      nps: cappedNPS,
      otherDeductions,
    },
  };
};

// ─── NEW REGIME ──────────────────────────────────────────────────────────────
export const calculateNewRegimeTax = (grossIncome) => {
  // Standard deduction ₹75,000 in new regime (Budget 2024)
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);

  let tax = calculateSlabTax(taxableIncome, NEW_REGIME_SLABS);

  // Rebate u/s 87A: if taxable income ≤ 7L, tax = 0
  if (taxableIncome <= 700000) tax = 0;

  const surchargeRate = Math.min(getSurchargeRate(taxableIncome), 0.25); // capped at 25%
  const surcharge = tax * surchargeRate;
  const cess = (tax + surcharge) * CESS_RATE;
  const totalTax = Math.round(tax + surcharge + cess);

  return {
    regime: "New Regime",
    grossIncome,
    totalDeductions: standardDeduction,
    taxableIncome,
    baseTax: tax,
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax,
    effectiveRate: grossIncome > 0 ? ((totalTax / grossIncome) * 100).toFixed(2) : 0,
    monthlyTax: Math.round(totalTax / 12),
  };
};

// ─── COMPARE BOTH REGIMES ────────────────────────────────────────────────────
export const compareTaxRegimes = (grossIncome, deductions = {}) => {
  const oldRegime = calculateOldRegimeTax(grossIncome, deductions);
  const newRegime = calculateNewRegimeTax(grossIncome);

  const savings = oldRegime.totalTax - newRegime.totalTax;
  const recommended = savings > 0 ? "New Regime" : savings < 0 ? "Old Regime" : "Either";

  return {
    oldRegime,
    newRegime,
    comparison: {
      taxDifference: Math.abs(savings),
      savings: Math.abs(savings),
      recommended,
      reason:
        savings > 0
          ? `New Regime saves ₹${Math.abs(savings).toLocaleString("en-IN")} in taxes`
          : savings < 0
          ? `Old Regime saves ₹${Math.abs(savings).toLocaleString("en-IN")} with deductions`
          : "Both regimes result in equal tax",
    },
  };
};

// ─── TAX SAVING SUGGESTIONS ──────────────────────────────────────────────────
export const getTaxSavingSuggestions = (grossIncome, deductions = {}) => {
  const suggestions = [];

  const used80C = deductions.section80C || 0;
  if (used80C < 150000) {
    suggestions.push({
      section: "80C",
      maxLimit: 150000,
      currentUsage: used80C,
      remaining: 150000 - used80C,
      instruments: ["PPF", "ELSS Mutual Funds", "NSC", "Tax-saver FD", "LIC Premium", "EPF"],
      tip: `You can invest ₹${(150000 - used80C).toLocaleString("en-IN")} more under 80C`,
    });
  }

  const usedNPS = deductions.nps || 0;
  if (usedNPS < 50000) {
    suggestions.push({
      section: "80CCD(1B)",
      maxLimit: 50000,
      currentUsage: usedNPS,
      remaining: 50000 - usedNPS,
      instruments: ["NPS (National Pension System)"],
      tip: `Additional ₹${(50000 - usedNPS).toLocaleString("en-IN")} NPS contribution saves extra tax`,
    });
  }

  const used80D = deductions.section80D || 0;
  if (used80D < 25000) {
    suggestions.push({
      section: "80D",
      maxLimit: 25000,
      currentUsage: used80D,
      remaining: 25000 - used80D,
      instruments: ["Health Insurance Premium"],
      tip: `Health insurance premium up to ₹25,000 is tax-deductible`,
    });
  }

  return suggestions;
};
