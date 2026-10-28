import { AssessmentYear, ReliefConfig, TaxCalculationResult, YearTaxData } from '../types/tax';

export const ASSESSMENT_YEARS: AssessmentYear[] = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

/**
 * Complete LHDN Borang BE Reliefs Configuration from YA 2019 to YA 2026
 * Incorporates:
 * - Budget 2020/2021 special relief for tech gadgets & childcare increase
 * - Budget 2022 EV charging facility introduction & SOCSO increase to RM350
 * - Budget 2023 tax bracket reductions & medical limit to RM10k
 * - Budget 2024 separate Sports relief (F8b) up to RM1,000
 * - Budget 2025/2026 medical expansion to grandparents, education & medical insurance increased to RM4,000, disabled self to RM7,000
 */
export const RELIEFS_CATALOG: ReliefConfig[] = [
  {
    id: 'rel_individual',
    code: 'F1',
    title: 'Individu & Saudara Tanggungan (Individual & Relatives)',
    desc: 'Automatic standard relief for resident individuals.',
    categoryGroup: 'basic',
    locked: true,
    defaultVal: 9000,
    maxLimits: {
      '2019': 9000,
      '2020': 9000,
      '2021': 9000,
      '2022': 9000,
      '2023': 9000,
      '2024': 9000,
      '2025': 9000,
      '2026': 9000,
    },
  },
  {
    id: 'rel_med_parent',
    code: 'F2',
    title: 'Perbelanjaan Perubatan Ibu Bapa & Datuk/Nenek (Parents/Grandparents)',
    desc: 'Medical care, dental, clinic, carer & medical examination for parents (extended to grandparents in YA25/26).',
    categoryGroup: 'medical',
    maxLimits: {
      '2019': 5000,
      '2020': 5000,
      '2021': 8000,
      '2022': 8000,
      '2023': 8000,
      '2024': 8000,
      '2025': 8000,
      '2026': 8000,
    },
  },
  {
    id: 'rel_equip',
    code: 'F3',
    title: 'Peralatan Sokongan Asas OKU (Basic Supporting Equipment)',
    desc: 'Special supporting equipment for self, spouse, child or parent with certified disability.',
    categoryGroup: 'basic',
    maxLimits: {
      '2019': 6000,
      '2020': 6000,
      '2021': 6000,
      '2022': 6000,
      '2023': 6000,
      '2024': 6000,
      '2025': 6000,
      '2026': 6000,
    },
  },
  {
    id: 'rel_disabled_self',
    code: 'F4',
    title: 'Individu Kurang Upaya (Disabled Individual - Self)',
    desc: 'Additional relief for certified disabled individuals (JKM registered).',
    categoryGroup: 'basic',
    maxLimits: {
      '2019': 6000,
      '2020': 6000,
      '2021': 6000,
      '2022': 6000,
      '2023': 6000,
      '2024': 6000,
      '2025': 7000,
      '2026': 7000,
    },
  },
  {
    id: 'rel_edu',
    code: 'F5',
    title: 'Yuran Pengajian Diri Sendiri (Education Fees - Self)',
    desc: 'Postgraduate (Masters/PhD in any field) or non-postgraduate in Technical, Vocational, Industrial, Law, Scientific or IT, plus upskilling/reskilling up to RM2,000.',
    categoryGroup: 'education_retirement',
    maxLimits: {
      '2019': 7000,
      '2020': 7000,
      '2021': 7000,
      '2022': 7000,
      '2023': 7000,
      '2024': 7000,
      '2025': 7000,
      '2026': 7000,
    },
  },
  {
    id: 'rel_med_serious',
    code: 'F6',
    title: 'Rawatan Penyakit Serius, Perubatan & Pemeriksaan Kesihatan (Medical & Health)',
    desc: 'Self, spouse or child: serious illness, fertility treatment, COVID/diagnostic test (RM1k), complete medical checkup (RM1k), dental treatment (RM1k), and learning disabilities/autism assessment (up to RM4k).',
    categoryGroup: 'medical',
    maxLimits: {
      '2019': 6000,
      '2020': 6000,
      '2021': 8000,
      '2022': 8000,
      '2023': 10000,
      '2024': 10000,
      '2025': 10000,
      '2026': 10000,
    },
  },
  {
    id: 'rel_lifestyle',
    code: 'F8',
    title: 'Gaya Hidup: Komputer, Buku, Telefon, Internet (Lifestyle)',
    desc: 'Books, journals, PC, laptop, tablet, smartphone, broadband home internet subscription.',
    categoryGroup: 'lifestyle_sports',
    maxLimits: {
      '2019': 2500,
      '2020': 2500,
      '2021': 2500,
      '2022': 2500,
      '2023': 2500,
      '2024': 2500,
      '2025': 2500,
      '2026': 2500,
    },
  },
  {
    id: 'rel_sports',
    code: 'F8b',
    title: 'Gaya Hidup Sukan: Peralatan, Gim & Yuran Sukan (Sports Activities)',
    desc: 'Sports equipment, sports venue rental, gym memberships, swimming, training fees under Sports Development Act 1997.',
    categoryGroup: 'lifestyle_sports',
    maxLimits: {
      '2019': 500,
      '2020': 500,
      '2021': 500,
      '2022': 500,
      '2023': 500,
      '2024': 1000,
      '2025': 1000,
      '2026': 1000,
    },
  },
  {
    id: 'rel_breastfeeding',
    code: 'F9',
    title: 'Peralatan Penyusuan Ibu (Breastfeeding Equipment)',
    desc: 'Breastfeeding equipment for child aged 2 years and below (claimable once every 2 assessment years).',
    categoryGroup: 'family',
    maxLimits: {
      '2019': 1000,
      '2020': 1000,
      '2021': 1000,
      '2022': 1000,
      '2023': 1000,
      '2024': 1000,
      '2025': 1000,
      '2026': 1000,
    },
  },
  {
    id: 'rel_childcare',
    code: 'F10',
    title: 'Yuran Taman Asuhan / Tadika Berdaftar (Childcare / Kindergarten)',
    desc: 'Child care center (TASKA registered with JKM) or kindergarten (TADIKA registered with JPN) for child aged 6 years and below.',
    categoryGroup: 'family',
    maxLimits: {
      '2019': 1000,
      '2020': 3000,
      '2021': 3000,
      '2022': 3000,
      '2023': 3000,
      '2024': 3000,
      '2025': 3000,
      '2026': 3000,
    },
  },
  {
    id: 'rel_sspn',
    code: 'F11',
    title: 'Tabungan Bersih Skim SSPN (National Education Savings Scheme)',
    desc: 'Net deposit into SSPN-i / SSPN-Prime accounts (Total deposits minus withdrawals for the year).',
    categoryGroup: 'education_retirement',
    maxLimits: {
      '2019': 8000,
      '2020': 8000,
      '2021': 8000,
      '2022': 8000,
      '2023': 8000,
      '2024': 8000,
      '2025': 8000,
      '2026': 8000,
    },
  },
  {
    id: 'rel_spouse',
    code: 'F12',
    title: 'Suami / Isteri / Alimoni Bekas Isteri (Spouse / Alimony)',
    desc: 'Husband or wife living together having no source of income, or payment of alimony to former wife.',
    categoryGroup: 'family',
    maxLimits: {
      '2019': 4000,
      '2020': 4000,
      '2021': 4000,
      '2022': 4000,
      '2023': 4000,
      '2024': 4000,
      '2025': 4000,
      '2026': 4000,
    },
  },
  {
    id: 'rel_disabled_spouse',
    code: 'F13',
    title: 'Suami / Isteri Kurang Upaya (Disabled Spouse)',
    desc: 'Additional relief if spouse is a certified disabled person.',
    categoryGroup: 'family',
    maxLimits: {
      '2019': 3500,
      '2020': 3500,
      '2021': 5000,
      '2022': 5000,
      '2023': 5000,
      '2024': 5000,
      '2025': 6000,
      '2026': 6000,
    },
  },
  {
    id: 'rel_child_under18',
    code: 'F14a',
    title: 'Anak Bawah 18 Tahun (Child Under 18)',
    desc: 'RM2,000 per unmarried child under the age of 18 years at any time in the year.',
    categoryGroup: 'family',
    maxLimits: {
      '2019': 20000,
      '2020': 20000,
      '2021': 20000,
      '2022': 20000,
      '2023': 20000,
      '2024': 20000,
      '2025': 20000,
      '2026': 20000,
    },
  },
  {
    id: 'rel_child_study',
    code: 'F14b',
    title: 'Anak 18+ Tahun Belajar Sepenuh Masa (Child in Higher Education)',
    desc: 'RM8,000 per unmarried child aged 18+ receiving full-time higher education at college/university (Diploma/Degree & above).',
    categoryGroup: 'family',
    maxLimits: {
      '2019': 32000,
      '2020': 32000,
      '2021': 32000,
      '2022': 32000,
      '2023': 32000,
      '2024': 32000,
      '2025': 32000,
      '2026': 32000,
    },
  },
  {
    id: 'rel_child_disabled',
    code: 'F14c',
    title: 'Anak Kurang Upaya (Disabled Child)',
    desc: 'RM6,000 per disabled child (plus additional RM8,000 if receiving higher education in diploma/degree).',
    categoryGroup: 'family',
    maxLimits: {
      '2019': 14000,
      '2020': 14000,
      '2021': 14000,
      '2022': 14000,
      '2023': 14000,
      '2024': 14000,
      '2025': 14000,
      '2026': 14000,
    },
  },
  {
    id: 'rel_life_ins',
    code: 'F15a',
    title: 'Insurans Nyawa / Takaful Hayat (Life Insurance & Voluntary Pension)',
    desc: 'Life insurance premiums, voluntary contributions to pension funds (excluding mandatory EPF).',
    categoryGroup: 'education_retirement',
    maxLimits: {
      '2019': 3000,
      '2020': 3000,
      '2021': 3000,
      '2022': 3000,
      '2023': 3000,
      '2024': 3000,
      '2025': 3000,
      '2026': 3000,
    },
  },
  {
    id: 'rel_kwsp',
    code: 'F15b',
    title: 'Caruman KWSP / Kumpulan Wang Simpanan Pekerja (EPF)',
    desc: 'Statutory or voluntary contributions to approved schemes (KWSP/EPF).',
    categoryGroup: 'education_retirement',
    maxLimits: {
      '2019': 4000,
      '2020': 4000,
      '2021': 4000,
      '2022': 4000,
      '2023': 4000,
      '2024': 4000,
      '2025': 4000,
      '2026': 4000,
    },
  },
  {
    id: 'rel_prs',
    code: 'F16',
    title: 'Skim Persaraan Swasta (PRS) & Anuiti Tertunda',
    desc: 'Contributions to Private Retirement Schemes (PRS) approved by Securities Commission or deferred annuity.',
    categoryGroup: 'education_retirement',
    maxLimits: {
      '2019': 3000,
      '2020': 3000,
      '2021': 3000,
      '2022': 3000,
      '2023': 3000,
      '2024': 3000,
      '2025': 3000,
      '2026': 3000,
    },
  },
  {
    id: 'rel_med_ins',
    code: 'F17',
    title: 'Insurans Pendidikan & Perubatan (Education & Medical Insurance)',
    desc: 'Insurance premium for medical benefits and education policies for self, spouse, or child. (Increased to RM4,000 in Budget 2025).',
    categoryGroup: 'education_retirement',
    maxLimits: {
      '2019': 3000,
      '2020': 3000,
      '2021': 3000,
      '2022': 3000,
      '2023': 3000,
      '2024': 3000,
      '2025': 4000,
      '2026': 4000,
    },
  },
  {
    id: 'rel_perkeso',
    code: 'F18',
    title: 'Caruman PERKESO / SOCSO (Termasuk EIS)',
    desc: 'Employee contributions to Social Security Organization (SOCSO) and Employment Insurance System (EIS).',
    categoryGroup: 'basic',
    maxLimits: {
      '2019': 250,
      '2020': 250,
      '2021': 250,
      '2022': 350,
      '2023': 350,
      '2024': 350,
      '2025': 350,
      '2026': 350,
    },
  },
  {
    id: 'rel_ev',
    code: 'F20',
    title: 'Kemudahan Pengecasan Kenderaan Elektrik (EV Charging Equipment)',
    desc: 'Expenses on installation, rental, purchase or subscription of EV charging facilities.',
    categoryGroup: 'green_tech',
    maxLimits: {
      '2019': 0,
      '2020': 0,
      '2021': 0,
      '2022': 2500,
      '2023': 2500,
      '2024': 2500,
      '2025': 2500,
      '2026': 2500,
    },
  },
];

export interface TaxBracket {
  limit: number;
  rate: number;
  base: number;
}

/**
 * Returns the exact LHDN Tax Brackets for Resident Individuals for a given YA
 */
export function getTaxBracketsForYear(year: AssessmentYear): TaxBracket[] {
  const numericYear = parseInt(year, 10);

  if (numericYear >= 2023) {
    // YA 2023 - 2026 Brackets (Budget 2023 revision)
    return [
      { limit: 5000, rate: 0.00, base: 0 },
      { limit: 20000, rate: 0.01, base: 0 },
      { limit: 35000, rate: 0.03, base: 150 },
      { limit: 50000, rate: 0.06, base: 600 },
      { limit: 70000, rate: 0.11, base: 1500 },
      { limit: 100000, rate: 0.19, base: 3700 },
      { limit: 400000, rate: 0.25, base: 9400 },
      { limit: 600000, rate: 0.26, base: 84400 },
      { limit: 2000000, rate: 0.28, base: 136400 },
      { limit: Infinity, rate: 0.30, base: 528400 },
    ];
  } else {
    // YA 2019 - 2022 Brackets
    return [
      { limit: 5000, rate: 0.00, base: 0 },
      { limit: 20000, rate: 0.01, base: 0 },
      { limit: 35000, rate: 0.03, base: 150 },
      { limit: 50000, rate: 0.08, base: 600 },
      { limit: 70000, rate: 0.14, base: 1800 },
      { limit: 100000, rate: 0.21, base: 4600 },
      { limit: 250000, rate: 0.24, base: 10900 },
      { limit: 400000, rate: 0.245, base: 46900 },
      { limit: 600000, rate: 0.25, base: 83650 },
      { limit: 1000000, rate: 0.26, base: 133650 },
      { limit: 2000000, rate: 0.28, base: 237650 },
      { limit: Infinity, rate: 0.30, base: 517650 },
    ];
  }
}

/**
 * Calculates complete Borang BE tax computation
 */
export function calculateTax(
  year: AssessmentYear,
  yearData: YearTaxData,
  claimSpouseRebate = false
): TaxCalculationResult {
  const { emp = 0, rent = 0, other = 0, donations = 0, pcb = 0, zakat = 0 } = yearData.income;
  const statutoryEmployment = Math.max(0, emp);
  const statutoryRentsAndOther = Math.max(0, rent + other);
  const aggregateIncome = statutoryEmployment + statutoryRentsAndOther;

  // Sec 44(6) Donations capped at 10% of Aggregate Income
  const donationCap = aggregateIncome * 0.10;
  const allowableDonations = Math.min(Math.max(0, donations), donationCap);
  const totalIncome = Math.max(0, aggregateIncome - allowableDonations);

  // Compute Allowable Reliefs (capping to the specific Assessment Year limit)
  let totalReliefsClaimed = 0;
  RELIEFS_CATALOG.forEach((relief) => {
    const rawVal = yearData.reliefs[relief.id] ?? (relief.defaultVal || 0);
    const maxForYear = relief.maxLimits[year] ?? 0;
    const allowable = Math.min(Math.max(0, rawVal), maxForYear);
    totalReliefsClaimed += allowable;
  });

  // Chargeable Income (Pendapatan Bercukai)
  const chargeableIncome = Math.max(0, totalIncome - totalReliefsClaimed);

  // Calculate bracket tax
  const brackets = getTaxBracketsForYear(year);
  let baseTax = 0;
  let balanceTax = 0;
  let lowerLimit = 0;
  let currentBracketRate = 0;

  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i];
    if (chargeableIncome <= b.limit) {
      baseTax = b.base;
      balanceTax = (chargeableIncome - lowerLimit) * b.rate;
      currentBracketRate = b.rate;
      break;
    }
    lowerLimit = b.limit;
  }

  const grossTax = Math.max(0, baseTax + balanceTax);

  // Rebates under Section 6A
  // 1. Individual rebate: RM400 if Chargeable Income <= RM35,000
  let taxRebateIndividual = 0;
  if (chargeableIncome > 0 && chargeableIncome <= 35000) {
    taxRebateIndividual = 400;
  }

  // 2. Spouse rebate: RM400 if spouse relief claimed and Chargeable Income <= RM35,000
  let taxRebateSpouse = 0;
  if (claimSpouseRebate && chargeableIncome > 0 && chargeableIncome <= 35000) {
    taxRebateSpouse = 400;
  }

  // 3. Zakat / Fitrah rebate (limited to gross tax after individual/spouse rebate)
  const availableTaxBeforeZakat = Math.max(0, grossTax - taxRebateIndividual - taxRebateSpouse);
  const taxRebateZakat = Math.min(Math.max(0, zakat), availableTaxBeforeZakat);

  const totalRebates = taxRebateIndividual + taxRebateSpouse + taxRebateZakat;
  const netTaxCharged = Math.max(0, grossTax - totalRebates);

  // Net Tax Outcome: Net Tax Charged - PCB
  // If outcome < 0: Refund (Cukai Terlebih Bayar)
  // If outcome > 0: Balance Payable (Baki Cukai Kena Bayar)
  const finalTaxOutcome = netTaxCharged - pcb;
  const isRefund = finalTaxOutcome < 0;

  const effectiveTaxRate = totalIncome > 0 ? (netTaxCharged / totalIncome) * 100 : 0;

  return {
    statutoryEmployment,
    statutoryRentsAndOther,
    aggregateIncome,
    allowableDonations,
    totalIncome,
    totalReliefsClaimed,
    chargeableIncome,
    baseTax,
    balanceTax,
    grossTax,
    taxRebateIndividual,
    taxRebateSpouse,
    taxRebateZakat,
    totalRebates,
    netTaxCharged,
    pcbPaid: pcb,
    finalTaxOutcome,
    isRefund,
    effectiveTaxRate,
    currentBracketRate,
  };
}

/**
 * Currency formatter for Malaysian Ringgit
 */
export function formatMYR(amount: number): string {
  return 'RM ' + Math.abs(amount).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Intelligent Tax Savings Planner & Relief Headroom Detector
 */
export interface TaxSavingOpportunity {
  reliefId: string;
  code: string;
  title: string;
  currentUtilized: number;
  maxCap: number;
  headroom: number;
  marginalRate: number;
  potentialTaxSaved: number;
  actionText: string;
}

export function findTaxSavingOpportunities(
  year: AssessmentYear,
  yearData: YearTaxData
): TaxSavingOpportunity[] {
  const currentCalc = calculateTax(year, yearData);
  const marginalRate = currentCalc.currentBracketRate;

  if (marginalRate <= 0) {
    return [];
  }

  const opportunities: TaxSavingOpportunity[] = [];
  const priorityReliefs = [
    { id: 'rel_sspn', action: 'Deposit into SSPN-Prime/SSPN-i account before 31 Dec' },
    { id: 'rel_sports', action: 'Purchase approved sports gear, pay gym pass or registration' },
    { id: 'rel_lifestyle', action: 'Claim computer, smartphone, books or internet bill' },
    { id: 'rel_prs', action: 'Top up Private Retirement Scheme (PRS) with an approved provider' },
    { id: 'rel_life_ins', action: 'Check your annual life insurance / takaful premium certificate' },
    { id: 'rel_med_ins', action: 'Include all family medical & education insurance policies' },
    { id: 'rel_med_parent', action: 'Collect medical receipts for parents dental / check-ups' },
  ];

  priorityReliefs.forEach((item) => {
    const config = RELIEFS_CATALOG.find((r) => r.id === item.id);
    if (!config) return;

    const maxCap = config.maxLimits[year] || 0;
    if (maxCap <= 0) return;

    const currentVal = yearData.reliefs[item.id] || 0;
    const allowableVal = Math.min(currentVal, maxCap);
    const headroom = Math.max(0, maxCap - allowableVal);

    if (headroom > 50) {
      const potentialTaxSaved = headroom * marginalRate;
      opportunities.push({
        reliefId: item.id,
        code: config.code,
        title: config.title,
        currentUtilized: allowableVal,
        maxCap,
        headroom,
        marginalRate,
        potentialTaxSaved,
        actionText: item.action,
      });
    }
  });

  return opportunities.sort((a, b) => b.potentialTaxSaved - a.potentialTaxSaved);
}
