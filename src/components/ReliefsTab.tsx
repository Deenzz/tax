import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { AssessmentYear, ReliefConfig, YearTaxData } from '../types/tax';
import { formatMYR, RELIEFS_CATALOG } from '../utils/taxEngine';

interface ReliefsTabProps {
  year: AssessmentYear;
  yearData: YearTaxData;
  onUpdateRelief: (reliefId: string, value: number) => void;
  onNavigateToVaultWithCategory?: (categoryId: string) => void;
}

export const ReliefsTab: React.FC<ReliefsTabProps> = ({
  year,
  yearData,
  onUpdateRelief,
  onNavigateToVaultWithCategory,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate total allowable reliefs
  let totalAllowable = 0;
  RELIEFS_CATALOG.forEach((r) => {
    const rawVal = yearData.reliefs[r.id] ?? (r.defaultVal || 0);
    const max = r.maxLimits[year] ?? 0;
    totalAllowable += Math.min(rawVal, max);
  });

  const categoryGroups = [
    { id: 'all', label: 'Semua Pelepasan (21+)' },
    { id: 'basic', label: 'Asas & OKU' },
    { id: 'lifestyle_sports', label: 'Gaya Hidup & Sukan' },
    { id: 'medical', label: 'Kesihatan & Perubatan' },
    { id: 'family', label: 'Keluarga & Anak' },
    { id: 'education_retirement', label: 'Pendidikan, KWSP & Insurans' },
    { id: 'green_tech', label: 'Teknologi Hijau (EV)' },
  ];

  // Count receipts linked to each relief
  const receiptCountsByRelief: Record<string, { count: number; total: number }> = {};
  yearData.receipts.forEach((rec) => {
    if (!receiptCountsByRelief[rec.category]) {
      receiptCountsByRelief[rec.category] = { count: 0, total: 0 };
    }
    receiptCountsByRelief[rec.category].count += 1;
    receiptCountsByRelief[rec.category].total += rec.amount;
  });

  const filteredReliefs = RELIEFS_CATALOG.filter((r) => {
    const matchesGroup = selectedGroup === 'all' || r.categoryGroup === selectedGroup;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
              Bahagian F Borang BE
            </span>
            <span className="text-xs text-slate-400 font-semibold">Tahun Taksiran YA {year}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Pelepasan Cukai Individu (Tax Reliefs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Had pelepasan diselaraskan mengikut undang-undang LHDN Malaysia bagi tahun taksiran yang dipilih.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl text-right">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Jumlah Pelepasan Dibenarkan (B9)
          </span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {formatMYR(totalAllowable)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categoryGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedGroup === group.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kod atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 outline-none font-medium"
          />
        </div>
      </div>

      {/* Reliefs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReliefs.map((relief) => {
          const maxLimit = relief.maxLimits[year] ?? 0;
          const userVal = yearData.reliefs[relief.id] ?? (relief.defaultVal || 0);
          const isOverCap = userVal > maxLimit;
          const allowableVal = Math.min(userVal, maxLimit);
          const isFull = allowableVal >= maxLimit && maxLimit > 0;
          const linkedReceipts = receiptCountsByRelief[relief.id];

          return (
            <div
              key={relief.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-2xs hover:shadow-sm ${
                isFull
                  ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                  : isOverCap
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                {/* Code and Cap Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-mono">
                      {relief.code}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                      {relief.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
                    Had: {formatMYR(maxLimit)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {relief.desc}
                </p>

                {/* Linked Receipts Count Badge */}
                {linkedReceipts && linkedReceipts.count > 0 && (
                  <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px]">
                    <span className="text-blue-900 font-semibold flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-blue-700" />
                      {linkedReceipts.count} resit di Peti Resit ({formatMYR(linkedReceipts.total)})
                    </span>
                    {onNavigateToVaultWithCategory && (
                      <button
                        onClick={() => onNavigateToVaultWithCategory(relief.id)}
                        className="text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Lihat &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    RM
                  </span>
                  <input
                    type="number"
                    value={userVal || ''}
                    disabled={relief.locked}
                    onChange={(e) =>
                      onUpdateRelief(relief.id, parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className={`w-full pl-10 pr-3 py-2 text-xs font-mono font-bold rounded-xl border outline-none transition ${
                      relief.locked
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
                        : 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-slate-900'
                    }`}
                  />
                </div>

                {/* Status indicators */}
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">
                    Dibenarkan:{' '}
                    <strong className="text-slate-900">{formatMYR(allowableVal)}</strong>
                  </span>
                  {maxLimit > allowableVal && (
                    <span className="text-amber-700 font-bold">
                      Baki Had: {formatMYR(maxLimit - allowableVal)}
                    </span>
                  )}
                  {isFull && (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Maksimum
                    </span>
                  )}
                </div>

                {isOverCap && (
                  <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Melebihi had! Nilai dituntut dikadkan kepada {formatMYR(maxLimit)}.
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
