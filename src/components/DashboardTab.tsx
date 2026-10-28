import React from 'react';
import {
  TrendingUp,
  Receipt,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Wallet,
  Building,
  HeartHandshake,
} from 'lucide-react';
import { AssessmentYear, TaxpayerProfile, YearTaxData } from '../types/tax';
import {
  calculateTax,
  findTaxSavingOpportunities,
  formatMYR,
  getTaxBracketsForYear,
  RELIEFS_CATALOG,
} from '../utils/taxEngine';

interface DashboardTabProps {
  year: AssessmentYear;
  yearData: YearTaxData;
  profile: TaxpayerProfile;
  onNavigateToTab: (tab: string) => void;
  onOpenOCR: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  year,
  yearData,
  profile,
  onNavigateToTab,
  onOpenOCR,
}) => {
  const calc = calculateTax(year, yearData, profile.maritalStatus === 'MARRIED_COMBINED');
  const brackets = getTaxBracketsForYear(year);
  const opportunities = findTaxSavingOpportunities(year, yearData);

  // Find user's active bracket details
  let activeBracketIndex = 0;
  let lowerLimit = 0;
  for (let i = 0; i < brackets.length; i++) {
    if (calc.chargeableIncome <= brackets[i].limit) {
      activeBracketIndex = i;
      break;
    }
    lowerLimit = brackets[i].limit;
  }
  const currentBracket = brackets[activeBracketIndex];
  const nextBracket = brackets[activeBracketIndex + 1];
  const bufferToNextBracket =
    currentBracket && currentBracket.limit !== Infinity
      ? Math.max(0, currentBracket.limit - calc.chargeableIncome)
      : 0;

  // Key priority reliefs for progress bars
  const featuredReliefIds = ['rel_lifestyle', 'rel_sports', 'rel_sspn', 'rel_med_ins', 'rel_prs', 'rel_med_parent'];
  const featuredReliefs = RELIEFS_CATALOG.filter((r) => featuredReliefIds.includes(r.id));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
              Tahun Taksiran YA {year}
            </span>
            <span className="text-slate-300 text-xs font-medium">
              Borang BE (Individu Pemastautin yang Tiada Punca Pendapatan Perniagaan)
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Selamat Datang, {profile.name}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Kadar Cukai Efektif Semasa:{' '}
            <span className="font-bold text-amber-300">{calc.effectiveTaxRate.toFixed(1)}%</span> | Kadar
            Marginal: <span className="font-bold text-amber-300">{(calc.currentBracketRate * 100).toFixed(0)}%</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOCR}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-blue-950" />
            <span>Imbas Resit Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Aggregate Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pendapatan Agregat (B4)
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatMYR(calc.aggregateIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Gaji (B1): {formatMYR(calc.statutoryEmployment)}</span>
            <button
              onClick={() => onNavigateToTab('income')}
              className="text-blue-700 font-bold hover:underline"
            >
              Ubah &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Total Allowable Reliefs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pelepasan Dituntut (B9)
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {formatMYR(calc.totalReliefsClaimed)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Termasuk automatik F1 RM9,000</span>
            <button
              onClick={() => onNavigateToTab('reliefs')}
              className="text-emerald-700 font-bold hover:underline"
            >
              Ubah &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Chargeable Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pendapatan Bercukai (B10)
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono tracking-tight">
            {formatMYR(calc.chargeableIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Kadar braket: {(calc.currentBracketRate * 100).toFixed(0)}%
          </div>
        </div>

        {/* Card 4: Net Tax Outcome (Refund vs Payable) */}
        <div
          className={`p-5 rounded-2xl border shadow-xs transition ${
            calc.isRefund
              ? 'bg-emerald-50/50 border-emerald-300'
              : 'bg-rose-50/50 border-rose-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              {calc.isRefund ? 'Cukai Terlebih Bayar (Refund)' : 'Baki Cukai Kena Bayar'}
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                calc.isRefund ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}
            >
              {calc.isRefund ? 'REFUND' : 'PAYABLE'}
            </span>
          </div>

          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              calc.isRefund ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatMYR(Math.abs(calc.finalTaxOutcome))}
          </div>

          <div className="mt-2 text-[11px] text-slate-600 font-medium">
            {calc.isRefund
              ? 'LHDN akan memulangkan terus ke akaun bank anda.'
              : 'Perlu dibayar kepada LHDN sebelum 30 April / 15 Mei.'}
          </div>
        </div>
      </div>

      {/* Progressive Tax Bracket Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-800" />
              Kedudukan Tangga Cukai LHDN (Tax Bracket Progress) - YA {year}
            </h3>
            <p className="text-xs text-slate-500">
              Ketahui braket cukai semasa dan baki penampan pendapatan sebelum melangkah ke braket lebih tinggi.
            </p>
          </div>
          {bufferToNextBracket > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900">
              Penampan ke braket seterusnya: <span className="font-bold">{formatMYR(bufferToNextBracket)}</span>
            </div>
          )}
        </div>

        {/* Visual Bracket Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {brackets.slice(0, 8).map((b, idx) => {
            const isActive = idx === activeBracketIndex;
            const isPassed = idx < activeBracketIndex;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-blue-900 border-blue-950 text-white shadow-md ring-2 ring-blue-500/30'
                    : isPassed
                    ? 'bg-slate-100 border-slate-200 text-slate-600'
                    : 'bg-white border-dashed border-slate-300 text-slate-400'
                }`}
              >
                <div className="text-[11px] font-bold">
                  {idx === 0
                    ? 'RM0 - 5k'
                    : idx === 1
                    ? '5k - 20k'
                    : idx === 2
                    ? '20k - 35k'
                    : idx === 3
                    ? '35k - 50k'
                    : idx === 4
                    ? '50k - 70k'
                    : idx === 5
                    ? '70k - 100k'
                    : idx === 6
                    ? '100k - 400k'
                    : '400k - 600k'}
                </div>
                <div
                  className={`text-xs font-black mt-1 ${
                    isActive ? 'text-amber-300' : isPassed ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {(b.rate * 100).toFixed(0)}%
                </div>
                {isActive && (
                  <div className="mt-1 text-[9px] bg-amber-400 text-slate-950 font-bold py-0.5 rounded">
                    Braket Anda
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Borang BE Computation Breakdown & Tax Optimizer Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Detailed Borang BE Computation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-900" />
                Penyata Pengiraan Cukai Rasmi (Borang BE Breakdown)
              </h3>
              <p className="text-xs text-slate-500">
                Susun atur mengikut format sebenar sistem e-Filing LHDN Malaysia.
              </p>
            </div>
            <span className="text-xs font-extrabold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
              Tahun Taksiran {year}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
              <span>B1. Pendapatan Berkanun Penggajian:</span>
              <span className="font-semibold text-slate-900 font-mono">
                {formatMYR(calc.statutoryEmployment)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
              <span>B2 &amp; B3. Pendapatan Sewa, Royalti, Faedah, Pencen:</span>
              <span className="font-semibold text-slate-900 font-mono">
                {formatMYR(calc.statutoryRentsAndOther)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b-2 border-slate-200 font-bold text-slate-900">
              <span>B4. JUMLAH PENDAPATAN AGREGAT (B1 + B2 + B3):</span>
              <span className="font-mono text-sm">{formatMYR(calc.aggregateIncome)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 text-emerald-700">
              <span>B5. Tolak: Derma Diluluskan Seksyen 44(6) (Had 10% Agregat):</span>
              <span className="font-mono font-semibold">- {formatMYR(calc.allowableDonations)}</span>
            </div>

            <div className="flex justify-between py-2 border-b-2 border-slate-200 font-bold text-slate-900">
              <span>B6. JUMLAH PENDAPATAN (B4 - B5):</span>
              <span className="font-mono text-sm">{formatMYR(calc.totalIncome)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 text-emerald-700">
              <span>B9. Tolak: Jumlah Pelepasan Cukai (Bahagian F):</span>
              <span className="font-mono font-semibold">- {formatMYR(calc.totalReliefsClaimed)}</span>
            </div>

            <div className="flex justify-between py-2.5 border-y-2 border-blue-900/30 bg-blue-50/50 px-3 rounded-lg font-black text-blue-950 text-sm">
              <span>B10. PENDAPATAN BERCUKAI (B6 - B9):</span>
              <span className="font-mono">{formatMYR(calc.chargeableIncome)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Pengiraan braket asas:</span>
              <span className="font-mono">{formatMYR(calc.baseTax)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Pengiraan baki braket marginal:</span>
              <span className="font-mono">{formatMYR(calc.balanceTax)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-emerald-700 border-t border-slate-100">
              <span>Rebat Cukai Seksyen 6A (Diri / Pasangan):</span>
              <span className="font-mono">- {formatMYR(calc.taxRebateIndividual + calc.taxRebateSpouse)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-emerald-700">
              <span>Rebat Cukai Zakat / Fitrah (Seksyen 6A(3)):</span>
              <span className="font-mono">- {formatMYR(calc.taxRebateZakat)}</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-slate-200 font-bold text-slate-900">
              <span>B12. JUMLAH CUKAI DIKENAKAN (Cukai Bersih):</span>
              <span className="font-mono text-sm">{formatMYR(calc.netTaxCharged)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-emerald-700 border-b border-slate-100">
              <span>B18. Tolak: Potongan Cukai Berjadual / Bulanan (PCB):</span>
              <span className="font-mono font-semibold">- {formatMYR(calc.pcbPaid)}</span>
            </div>

            {/* Final Outcome Banner */}
            <div
              className={`p-4 rounded-xl flex justify-between items-center mt-3 ${
                calc.isRefund ? 'bg-emerald-100/70 text-emerald-950' : 'bg-rose-100/70 text-rose-950'
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">
                  B19.{' '}
                  {calc.isRefund
                    ? 'Cukai Terlebih Bayar (LHDN Refund)'
                    : 'Baki Cukai Kena Dibayar (Payable)'}
                </span>
                <span className="text-[11px] opacity-80">
                  {calc.isRefund
                    ? 'Akan dikreditkan terus ke nombor akaun bank anda oleh LHDNM.'
                    : 'Perlu dilunaskan melalui portal ByrHASIL atau FPX sebelum tarikh akhir.'}
                </span>
              </div>
              <span className="text-xl font-black font-mono">
                {formatMYR(Math.abs(calc.finalTaxOutcome))}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Smart Tax Optimizer & Relief Utilization */}
        <div className="space-y-6">
          {/* Smart Tax Optimizer */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-sm">Penasihat Pintar Penjimatan Cukai</h3>
            </div>
            <p className="text-xs text-amber-950/80">
              Berdasarkan kadar cukai marginal anda (
              <span className="font-bold">{(calc.currentBracketRate * 100).toFixed(0)}%</span>), ini peluang
              pelepasan sah yang masih boleh dimanfaatkan sebelum 31 Disember:
            </p>

            <div className="space-y-2.5">
              {opportunities.slice(0, 3).map((opp, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-slate-800">
                      {opp.code}. {opp.title.split('(')[0]}
                    </span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Jimat ~{formatMYR(opp.potentialTaxSaved)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{opp.actionText}</p>
                  <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                    <span>Digunakan: {formatMYR(opp.currentUtilized)}</span>
                    <span className="font-bold text-amber-700">
                      Baki had: {formatMYR(opp.headroom)}
                    </span>
                  </div>
                </div>
              ))}

              {opportunities.length === 0 && (
                <div className="p-3 bg-white rounded-xl text-center text-xs text-slate-500">
                  Tahniah! Anda telah memanfaatkan hampir keseluruhan kuota pelepasan utama.
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateToTab('reliefs')}
              className="w-full text-center text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center justify-center gap-1 pt-1"
            >
              <span>Lihat Semua 21+ Kategori Pelepasan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Relief Progress Bars */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">Penggunaan Had Pelepasan Utama</h3>
              <button
                onClick={() => onNavigateToTab('reliefs')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Urus
              </button>
            </div>

            <div className="space-y-3.5">
              {featuredReliefs.map((r) => {
                const userVal = yearData.reliefs[r.id] || 0;
                const max = r.maxLimits[year] || 0;
                if (max <= 0) return null;
                const allowable = Math.min(userVal, max);
                const percent = Math.min(100, (allowable / max) * 100);

                return (
                  <div key={r.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">
                        {r.code} {r.title.split('(')[0]}
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatMYR(allowable)} / {formatMYR(max)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent >= 100
                            ? 'bg-emerald-500'
                            : percent > 60
                            ? 'bg-blue-600'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
