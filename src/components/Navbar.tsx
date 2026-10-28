import React, { useState } from 'react';
import {
  FileText,
  Download,
  Upload,
  Calendar,
  ShieldCheck,
  User,
  Camera,
  FileSpreadsheet,
  Wifi,
  WifiOff,
  RotateCcw,
} from 'lucide-react';
import { AssessmentYear, TaxpayerProfile } from '../types/tax';
import { ASSESSMENT_YEARS } from '../utils/taxEngine';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeYear: AssessmentYear;
  onChangeYear: (year: AssessmentYear) => void;
  profile: TaxpayerProfile;
  onOpenProfile: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetYear: () => void;
  onOpenOCR: () => void;
  onOpenDocImport: () => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeYear,
  onChangeYear,
  profile,
  onOpenProfile,
  onExportPDF,
  onExportJSON,
  onImportJSON,
  onResetYear,
  onOpenOCR,
  onOpenDocImport,
  isOnline,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan / Dashboard', icon: FileText },
    { id: 'income', label: 'Pendapatan (Borang B)', icon: FileSpreadsheet },
    { id: 'reliefs', label: 'Pelepasan Cukai (F)', icon: ShieldCheck },
    { id: 'vault', label: 'Peti Resit & Google Drive', icon: Camera },
    { id: 'compare', label: 'Perbandingan Multi-Tahun', icon: Calendar },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-white px-4 lg:px-8 py-1.5 flex justify-between items-center text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LHDNM ITA 1967 Compliant
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            Pematuhan Seksyen 82A: Simpanan Audit Resit 7 Tahun
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden md:inline">Online Sync Ready</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden md:inline">Offline Mode (Local Storage)</span>
              </span>
            )}
          </div>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 text-slate-200 hover:text-white transition px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] max-w-[130px] truncate">{profile.name}</span>
            <span className="text-[10px] bg-blue-900 text-blue-200 px-1 rounded ml-1 hidden lg:inline">
              {profile.taxFileNo || 'SG File'}
            </span>
          </button>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-4 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-900 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/20">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-blue-950">
                MyTax<span className="text-amber-500">Vault</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Malaysia
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              LHDN Borang BE Personal Tax Vault & Audit Companion
            </p>
          </div>
        </div>

        {/* Global Assessment Year (YA) Switcher & Primary Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Assessment Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600 pl-2 hidden sm:inline">
              Tahun Taksiran:
            </span>
            <select
              value={activeYear}
              onChange={(e) => onChangeYear(e.target.value as AssessmentYear)}
              className="bg-white font-extrabold text-xs text-blue-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-800 outline-none shadow-xs cursor-pointer"
            >
              {ASSESSMENT_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  YA {yr} {yr === '2025' ? '★ (Semasa)' : yr === '2026' ? '🌱 (Bajet 26)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick AI OCR Scanner Button */}
          <button
            onClick={onOpenOCR}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
            title="Scan receipt with Camera or Image OCR"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span className="hidden md:inline">Imbas Resit (OCR)</span>
            <span className="md:hidden">Imbas</span>
          </button>

          {/* Import BE / EA PDF Button */}
          <button
            onClick={onOpenDocImport}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
            title="Import Borang BE or EA Form PDF"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            <span className="hidden md:inline">Import BE/EA PDF</span>
          </button>

          {/* Export PDF Report Button */}
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm shadow-blue-900/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Jana Laporan (PDF)</span>
          </button>

          {/* Backup & Restore Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
              title="Data Management"
            >
              <Upload className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setMenuOpen(false)}
              >
                <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Pengurusan Data
                </div>

                <button
                  onClick={onExportJSON}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-left"
                >
                  <Download className="w-4 h-4 text-teal-600" />
                  Eksport Sandaran (JSON)
                </button>

                <label className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-left cursor-pointer">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Pulihkan Sandaran (JSON)
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onImportJSON(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={onResetYear}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-medium text-left"
                >
                  <RotateCcw className="w-4 h-4" />
                  Set Semula Data YA {activeYear}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="px-4 lg:px-8 flex overflow-x-auto border-t border-slate-100 gap-1 bg-slate-50/70 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
