import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { IncomeTab } from './components/IncomeTab';
import { ReliefsTab } from './components/ReliefsTab';
import { ReceiptVaultTab } from './components/ReceiptVaultTab';
import { MultiYearCompareTab } from './components/MultiYearCompareTab';
import { CameraOCRModal } from './components/CameraOCRModal';
import { PDFImporterModal } from './components/PDFImporterModal';
import { ProfileModal } from './components/ProfileModal';
import {
  AssessmentYear,
  StoredReceipt,
  TaxAppState,
  TaxpayerProfile,
  YearTaxData,
} from './types/tax';
import {
  createDefaultState,
  createEmptyYearData,
  exportDatabaseJSON,
  importDatabaseJSON,
  loadAppState,
  saveAppState,
} from './utils/storage';
import { exportBorangBEPDF } from './utils/pdfGenerator';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<TaxAppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isOCROpen, setIsOCROpen] = useState<boolean>(false);
  const [isDocImportOpen, setIsDocImportOpen] = useState<boolean>(false);
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState<string>('all');

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever appState changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper selectors
  const currentProfileState = appState.profiles[appState.activeProfileId];
  const activeYear = currentProfileState.activeYear;
  const currentYearData = currentProfileState.years[activeYear] || createEmptyYearData();
  const profile = currentProfileState.profile;

  // Handlers
  const handleYearChange = (newYear: AssessmentYear) => {
    setAppState((prev) => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [prev.activeProfileId]: {
          ...prev.profiles[prev.activeProfileId],
          activeYear: newYear,
        },
      },
    }));
    showToast(`Tahun Taksiran ditukar ke YA ${newYear}`);
  };

  const handleUpdateIncome = (field: keyof YearTaxData['income'], value: number) => {
    setAppState((prev) => {
      const p = prev.profiles[prev.activeProfileId];
      const yr = p.years[p.activeYear] || createEmptyYearData();
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...p,
            years: {
              ...p.years,
              [p.activeYear]: {
                ...yr,
                income: {
                  ...yr.income,
                  [field]: value,
                },
              },
            },
          },
        },
      };
    });
  };

  const handleUpdateRelief = (reliefId: string, value: number) => {
    setAppState((prev) => {
      const p = prev.profiles[prev.activeProfileId];
      const yr = p.years[p.activeYear] || createEmptyYearData();
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...p,
            years: {
              ...p.years,
              [p.activeYear]: {
                ...yr,
                reliefs: {
                  ...yr.reliefs,
                  [reliefId]: value,
                },
              },
            },
          },
        },
      };
    });
  };

  const handleAddReceipt = (newReceipt: Omit<StoredReceipt, 'id' | 'createdAt'>) => {
    const receiptItem: StoredReceipt = {
      ...newReceipt,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    setAppState((prev) => {
      const p = prev.profiles[prev.activeProfileId];
      const yr = p.years[p.activeYear] || createEmptyYearData();

      // Automatically add receipt amount to corresponding relief or donation!
      const updatedIncome = { ...yr.income };
      const updatedReliefs = { ...yr.reliefs };

      if (receiptItem.category === 'donation') {
        updatedIncome.donations = (updatedIncome.donations || 0) + receiptItem.amount;
      } else if (receiptItem.category !== 'other') {
        updatedReliefs[receiptItem.category] =
          (updatedReliefs[receiptItem.category] || 0) + receiptItem.amount;
      }

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...p,
            years: {
              ...p.years,
              [p.activeYear]: {
                ...yr,
                income: updatedIncome,
                reliefs: updatedReliefs,
                receipts: [receiptItem, ...yr.receipts],
              },
            },
          },
        },
      };
    });

    showToast(`Resit disimpan & ditautkan ke pelepasan (${receiptItem.merchant})!`);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    setAppState((prev) => {
      const p = prev.profiles[prev.activeProfileId];
      const yr = p.years[p.activeYear] || createEmptyYearData();
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...p,
            years: {
              ...p.years,
              [p.activeYear]: {
                ...yr,
                receipts: yr.receipts.filter((r) => r.id !== receiptId),
              },
            },
          },
        },
      };
    });
    showToast('Rekod resit dipadam.');
  };

  const handleSaveProfile = (updatedProfile: TaxpayerProfile) => {
    setAppState((prev) => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [prev.activeProfileId]: {
          ...prev.profiles[prev.activeProfileId],
          profile: updatedProfile,
        },
      },
    }));
    showToast('Profil pembayar cukai dikemas kini.');
  };

  const handleResetCurrentYear = () => {
    if (confirm(`Set semula semua data bagi Tahun Taksiran ${activeYear}? Tindakan ini tidak boleh diundur.`)) {
      setAppState((prev) => {
        const p = prev.profiles[prev.activeProfileId];
        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            [prev.activeProfileId]: {
              ...p,
              years: {
                ...p.years,
                [activeYear]: createEmptyYearData(),
              },
            },
          },
        };
      });
      showToast(`Data YA ${activeYear} telah dikosongkan.`);
    }
  };

  const handleImportJSONFile = async (file: File) => {
    try {
      const imported = await importDatabaseJSON(file);
      setAppState(imported);
      showToast('Pangkalan data cukai berjaya dipulihkan!');
    } catch (err: any) {
      alert(`Gagal memuat naik fail sandaran: ${err.message}`);
    }
  };

  const handleApplyDocumentImport = (
    targetYear: AssessmentYear,
    data: {
      income: Partial<YearTaxData['income']>;
      reliefs: Record<string, number>;
      taxpayerName?: string;
      taxFileNo?: string;
    }
  ) => {
    setAppState((prev) => {
      const p = prev.profiles[prev.activeProfileId];
      const yr = p.years[targetYear] || createEmptyYearData();

      const mergedReliefs = { ...yr.reliefs };
      Object.entries(data.reliefs).forEach(([k, v]) => {
        if (v > 0) mergedReliefs[k] = v;
      });

      const updatedProfile = { ...p.profile };
      if (data.taxpayerName) updatedProfile.name = data.taxpayerName;
      if (data.taxFileNo) updatedProfile.taxFileNo = data.taxFileNo;

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...p,
            activeYear: targetYear,
            profile: updatedProfile,
            years: {
              ...p.years,
              [targetYear]: {
                ...yr,
                income: {
                  ...yr.income,
                  ...data.income,
                },
                reliefs: mergedReliefs,
              },
            },
          },
        },
      };
    });

    showToast(`Dokumen berjaya diimport ke Tahun Taksiran YA ${targetYear}!`);
  };

  const handleNavigateToVaultCategory = (categoryId: string) => {
    setVaultCategoryFilter(categoryId);
    setActiveTab('vault');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeYear={activeYear}
        onChangeYear={handleYearChange}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onExportPDF={() => {
          exportBorangBEPDF(activeYear, currentYearData, profile);
          showToast('Laporan rasmi Borang BE PDF telah dijana!');
        }}
        onExportJSON={() => {
          exportDatabaseJSON(appState);
          showToast('Sandaran pangkalan data JSON dimuat turun.');
        }}
        onImportJSON={handleImportJSONFile}
        onResetYear={handleResetCurrentYear}
        onOpenOCR={() => setIsOCROpen(true)}
        onOpenDocImport={() => setIsDocImportOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            year={activeYear}
            yearData={currentYearData}
            profile={profile}
            onNavigateToTab={setActiveTab}
            onOpenOCR={() => setIsOCROpen(true)}
          />
        )}

        {activeTab === 'income' && (
          <IncomeTab
            year={activeYear}
            yearData={currentYearData}
            onUpdateIncome={handleUpdateIncome}
          />
        )}

        {activeTab === 'reliefs' && (
          <ReliefsTab
            year={activeYear}
            yearData={currentYearData}
            onUpdateRelief={handleUpdateRelief}
            onNavigateToVaultWithCategory={handleNavigateToVaultCategory}
          />
        )}

        {activeTab === 'vault' && (
          <ReceiptVaultTab
            year={activeYear}
            yearData={currentYearData}
            onAddReceipt={handleAddReceipt}
            onDeleteReceipt={handleDeleteReceipt}
            onOpenOCRModal={() => setIsOCROpen(true)}
            selectedCategoryFilter={vaultCategoryFilter}
          />
        )}

        {activeTab === 'compare' && (
          <MultiYearCompareTab
            state={appState}
            profile={profile}
            onSelectYear={(yr) => {
              handleYearChange(yr);
              setActiveTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <CameraOCRModal
        isOpen={isOCROpen}
        onClose={() => setIsOCROpen(false)}
        year={activeYear}
        onReceiptExtracted={handleAddReceipt}
      />

      <PDFImporterModal
        isOpen={isDocImportOpen}
        onClose={() => setIsDocImportOpen(false)}
        activeYear={activeYear}
        onApplyImportedData={handleApplyDocumentImport}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
