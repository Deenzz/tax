export type AssessmentYear = '2019' | '2020' | '2021' | '2022' | '2023' | '2024' | '2025' | '2026';

export interface ReliefConfig {
  id: string;
  code: string;
  title: string;
  desc: string;
  categoryGroup: 'basic' | 'medical' | 'lifestyle_sports' | 'family' | 'education_retirement' | 'green_tech';
  // Maximum allowable limits by assessment year
  maxLimits: Record<AssessmentYear, number>;
  locked?: boolean;
  defaultVal?: number;
}

export interface StoredReceipt {
  id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  category: string;
  driveLink?: string;
  imageUrl?: string; // base64 or object URL for offline inspection
  paymentMethod?: string;
  verifiedAudit: boolean;
  ocrConfidence?: number;
  items?: string[];
  createdAt: number;
}

export interface YearTaxData {
  income: {
    emp: number;       // B1 Statutory Employment Income
    rent: number;      // B2 Statutory Rental Income
    other: number;     // B3 Interest, Discounts, Royalties, Pensions
    donations: number;  // B5 Approved Section 44(6) Donations
    pcb: number;        // B18 Potongan Cukai Bulanan (Monthly Tax Deductions)
    zakat: number;      // Zakat / Fitrah payment for rebate
  };
  reliefs: Record<string, number>;
  receipts: StoredReceipt[];
  notes?: string;
}

export interface TaxpayerProfile {
  name: string;
  taxFileNo: string;   // e.g. SG 12345678010
  icNumber: string;    // Malaysian MyKad / Passport
  residentStatus: 'RESIDENT' | 'NON_RESIDENT';
  maritalStatus: 'SINGLE' | 'MARRIED_SEPARATE' | 'MARRIED_COMBINED' | 'DIVORCED';
  numberOfChildren: number;
  pinLockEnabled: boolean;
  pinCode?: string;
}

export interface TaxAppState {
  version: number;
  activeProfileId: string;
  profiles: {
    [profileId: string]: {
      profile: TaxpayerProfile;
      activeYear: AssessmentYear;
      years: Record<AssessmentYear, YearTaxData>;
    };
  };
}

export interface TaxCalculationResult {
  statutoryEmployment: number;
  statutoryRentsAndOther: number;
  aggregateIncome: number;
  allowableDonations: number;
  totalIncome: number;
  totalReliefsClaimed: number;
  chargeableIncome: number;
  baseTax: number;
  balanceTax: number;
  grossTax: number;
  taxRebateIndividual: number;
  taxRebateSpouse: number;
  taxRebateZakat: number;
  totalRebates: number;
  netTaxCharged: number;
  pcbPaid: number;
  finalTaxOutcome: number; // positive = balance payable, negative = refund
  isRefund: boolean;
  effectiveTaxRate: number;
  currentBracketRate: number;
}
