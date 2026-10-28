import { AssessmentYear, TaxAppState, TaxpayerProfile, YearTaxData } from '../types/tax';
import { ASSESSMENT_YEARS, RELIEFS_CATALOG } from './taxEngine';

const STORAGE_KEY = 'MYTAX_VAULT_MALAYSIA_V2';

export const DEFAULT_PROFILE: TaxpayerProfile = {
  name: 'Dr. Hafizuddin Muhd',
  taxFileNo: 'SG 28941029010',
  icNumber: '901024-03-5123',
  residentStatus: 'RESIDENT',
  maritalStatus: 'SINGLE',
  numberOfChildren: 0,
  pinLockEnabled: false,
};

export function createEmptyYearData(): YearTaxData {
  const initialReliefs: Record<string, number> = {};
  RELIEFS_CATALOG.forEach((r) => {
    initialReliefs[r.id] = r.defaultVal || 0;
  });

  return {
    income: {
      emp: 0,
      rent: 0,
      other: 0,
      donations: 0,
      pcb: 0,
      zakat: 0,
    },
    reliefs: initialReliefs,
    receipts: [],
    notes: '',
  };
}

/**
 * Creates rich demo data spanning 2022 to 2026 so the user can immediately play around,
 * test the dashboard, multi-year comparison, and PDF export!
 */
export function createDefaultState(): TaxAppState {
  const defaultYears: Record<AssessmentYear, YearTaxData> = {} as any;

  ASSESSMENT_YEARS.forEach((yr) => {
    defaultYears[yr] = createEmptyYearData();
  });

  // Seed YA 2023 with realistic figures
  defaultYears['2023'].income = {
    emp: 84000,
    rent: 0,
    other: 0,
    donations: 500,
    pcb: 5400,
    zakat: 300,
  };
  defaultYears['2023'].reliefs = {
    rel_individual: 9000,
    rel_lifestyle: 2500,
    rel_sports: 500,
    rel_sspn: 4000,
    rel_life_ins: 3000,
    rel_kwsp: 4000,
    rel_med_ins: 2400,
    rel_perkeso: 350,
    rel_med_serious: 850,
  };

  // Seed YA 2024 with realistic figures
  defaultYears['2024'].income = {
    emp: 96000,
    rent: 6000,
    other: 0,
    donations: 1200,
    pcb: 7200,
    zakat: 500,
  };
  defaultYears['2024'].reliefs = {
    rel_individual: 9000,
    rel_lifestyle: 2500,
    rel_sports: 1000,
    rel_sspn: 6000,
    rel_life_ins: 3000,
    rel_kwsp: 4000,
    rel_med_ins: 3000,
    rel_perkeso: 350,
    rel_med_parent: 1500,
    rel_edu: 2000,
  };
  defaultYears['2024'].receipts = [
    {
      id: 'rec_2024_01',
      date: '2024-03-15',
      merchant: 'Harvey Norman Mid Valley',
      description: 'iPad 10th Gen for research & professional work',
      amount: 2099.0,
      category: 'rel_lifestyle',
      driveLink: 'https://drive.google.com/drive/folders/lhdn-audit-2024',
      verifiedAudit: true,
      ocrConfidence: 98,
      items: ['Apple iPad 10th Gen WiFi 64GB', 'USB-C Cable'],
      createdAt: Date.now() - 10000000,
    },
    {
      id: 'rec_2024_02',
      date: '2024-05-20',
      merchant: 'Decathlon Cyberjaya',
      description: 'Badminton racket & running shoes for workout',
      amount: 480.0,
      category: 'rel_sports',
      driveLink: 'https://drive.google.com/file/d/decathlon-receipt-2024/view',
      verifiedAudit: true,
      ocrConfidence: 96,
      items: ['Perfly BR 990 Pro Racket', 'Kiprun Long Distance Shoes'],
      createdAt: Date.now() - 8000000,
    },
    {
      id: 'rec_2024_03',
      date: '2024-08-10',
      merchant: 'PTPTN Online',
      description: 'Annual SSPN-Prime deposit for future savings',
      amount: 6000.0,
      category: 'rel_sspn',
      driveLink: 'https://drive.google.com/file/d/sspn-resit-deposit-2024/view',
      verifiedAudit: true,
      ocrConfidence: 100,
      items: ['SSPN-Prime Account Contribution'],
      createdAt: Date.now() - 5000000,
    },
  ];

  // Seed YA 2025 with active entries
  defaultYears['2025'].income = {
    emp: 110000,
    rent: 9600,
    other: 0,
    donations: 2000,
    pcb: 10800,
    zakat: 1000,
  };
  defaultYears['2025'].reliefs = {
    rel_individual: 9000,
    rel_lifestyle: 2200,
    rel_sports: 900,
    rel_sspn: 8000,
    rel_life_ins: 3000,
    rel_kwsp: 4000,
    rel_prs: 3000,
    rel_med_ins: 3800,
    rel_perkeso: 350,
    rel_med_parent: 3400,
    rel_med_serious: 1200,
    rel_ev: 2500,
  };
  defaultYears['2025'].receipts = [
    {
      id: 'rec_2025_01',
      date: '2025-02-14',
      merchant: 'Popular Book Store KLCC',
      description: 'Medical reference textbooks & journals',
      amount: 450.0,
      category: 'rel_lifestyle',
      driveLink: 'https://drive.google.com/file/d/popular-books-2025/view',
      verifiedAudit: true,
      ocrConfidence: 97,
      items: ['Clinical Medicine 10th Ed', 'Health Economics Handbook'],
      createdAt: Date.now() - 4000000,
    },
    {
      id: 'rec_2025_02',
      date: '2025-04-18',
      merchant: 'Klinik Pakar Perubatan Sunway',
      description: 'Executive comprehensive health screening & lab tests',
      amount: 1200.0,
      category: 'rel_med_serious',
      driveLink: 'https://drive.google.com/file/d/medical-screening-2025/view',
      verifiedAudit: true,
      ocrConfidence: 99,
      items: ['Executive Health Screening Package', 'Full Blood Profile', 'ECG'],
      createdAt: Date.now() - 2000000,
    },
    {
      id: 'rec_2025_03',
      date: '2025-06-22',
      merchant: 'Gentari EV Charging Network',
      description: 'Home EV Wallbox 7kW AC charger installation & permit',
      amount: 2500.0,
      category: 'rel_ev',
      driveLink: 'https://drive.google.com/file/d/gentari-ev-wallbox-2025/view',
      verifiedAudit: true,
      ocrConfidence: 95,
      items: ['Gentari Home AC 7kW Charger', 'Suruhanjaya Tenaga Installation'],
      createdAt: Date.now() - 1000000,
    },
  ];

  // Seed YA 2026 (Planning ahead!)
  defaultYears['2026'].income = {
    emp: 120000,
    rent: 12000,
    other: 0,
    donations: 2500,
    pcb: 12500,
    zakat: 1200,
  };
  defaultYears['2026'].reliefs = {
    rel_individual: 9000,
    rel_lifestyle: 1500,
    rel_sports: 600,
    rel_sspn: 5000,
    rel_life_ins: 3000,
    rel_kwsp: 4000,
    rel_prs: 1500,
    rel_med_ins: 4000,
    rel_perkeso: 350,
  };

  return {
    version: 2,
    activeProfileId: 'profile_1',
    profiles: {
      profile_1: {
        profile: DEFAULT_PROFILE,
        activeYear: '2025',
        years: defaultYears,
      },
    },
  };
}

export function loadAppState(): TaxAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.profiles && parsed.activeProfileId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load tax state from localStorage:', e);
  }
  const defaultState = createDefaultState();
  saveAppState(defaultState);
  return defaultState;
}

export function saveAppState(state: TaxAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save tax state to localStorage:', e);
  }
}

export function exportDatabaseJSON(state: TaxAppState): void {
  const jsonString = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MyTax_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDatabaseJSON(file: File): Promise<TaxAppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.profiles && parsed.activeProfileId) {
          saveAppState(parsed);
          resolve(parsed);
        } else {
          reject(new Error('Invalid MyTax Vault JSON format.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error reading backup file.'));
    reader.readAsText(file);
  });
}
