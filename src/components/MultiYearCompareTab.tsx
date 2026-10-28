import React, { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { AssessmentYear, TaxAppState, TaxpayerProfile } from '../types/tax';
import { ASSESSMENT_YEARS, calculateTax, formatMYR } from '../utils/taxEngine';

interface MultiYearCompareTabProps {
  state: TaxAppState;
  profile: TaxpayerProfile;
  onSelectYear: (year: AssessmentYear) => void;
}

export const MultiYearCompareTab: React.FC<MultiYearCompareTabProps> = ({
  state,
  profile,
  onSelectYear,
}) => {
  const currentProfileState = state.profiles[state.activeProfileId];
  const [selectedMetric, setSelectedMetric] = useState<'income' | 'reliefs' | 'tax' | 'net'>('tax');

  // Compute metrics for all years
  const yearMetrics: Record<AssessmentYear, any> = {} as any;
  ASSESSMENT_YEARS.forEach((yr) => {
    const yrData = currentProfileState.years[yr];
    const calc = calculateTax(yr, yrData, profile.maritalStatus === 'MARRIED_COMBINED');
    yearMetrics[yr] = {
      ...calc,
      receiptCount: yrData.receipts.length,
    };
  });

  // Calculate highest values for progress bar normalization
  const maxAggregate = Math.max(...ASSESSMENT_YEARS.map((y) => yearMetrics[y].aggregateIncome), 1000);
  const maxReliefs = Math.max(...ASSESSMENT_YEARS.map((y) => yearMetrics[y].totalReliefsClaimed), 1000);
  const maxTax = Math.max(...ASSESSMENT_YEARS.map((y) => yearMetrics[y].netTaxCharged), 1000);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              Analisis Sejarah &amp; Perancangan Cukai
            </span>
            <span className="text-xs text-slate-400 font-semibold">Tahun Taksiran 2019 - 2026</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Perbandingan Penyata Cukai Multi-Tahun
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis pertumbuhan pendapatan berkanun, kecekapan pelepasan cukai, dan sejarah bayaran balik (refund) LHDN anda.
          </p>
        </div>

        {/* Metric Selector for Trend Visualization */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedMetric('tax')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedMetric === 'tax' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cukai Dikenakan
          </button>
          <button
            onClick={() => setSelectedMetric('reliefs')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedMetric === 'reliefs' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pelepasan Dituntut
          </button>
          <button
            onClick={() => setSelectedMetric('income')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedMetric === 'income' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendapatan Agregat
          </button>
        </div>
      </div>

      {/* Visual Chart Trends (Bars) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-900" />
            Carta Trend Sejarah (2019 - 2026):{' '}
            <span className="text-blue-900">
              {selectedMetric === 'tax'
                ? 'Jumlah Cukai Dikenakan (B12)'
                : selectedMetric === 'reliefs'
                ? 'Pelepasan Cukai Dituntut (B9)'
                : 'Pendapatan Agregat (B4)'}
            </span>
          </h3>
          <span className="text-xs text-slate-400">Klik tahun untuk bertukar taksiran</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-4">
          {ASSESSMENT_YEARS.map((yr) => {
            const m = yearMetrics[yr];
            const val =
              selectedMetric === 'tax'
                ? m.netTaxCharged
                : selectedMetric === 'reliefs'
                ? m.totalReliefsClaimed
                : m.aggregateIncome;
            const maxVal =
              selectedMetric === 'tax'
                ? maxTax
                : selectedMetric === 'reliefs'
                ? maxReliefs
                : maxAggregate;
            const heightPercent = maxVal > 0 ? Math.max(10, (val / maxVal) * 100) : 10;
            const isCurrentActive = currentProfileState.activeYear === yr;

            return (
              <div
                key={yr}
                onClick={() => onSelectYear(yr)}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all hover:scale-102 flex flex-col justify-end ${
                  isCurrentActive
                    ? 'bg-blue-50/70 border-blue-900/40 shadow-xs ring-2 ring-blue-900/10'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="h-28 flex items-end justify-center mb-2">
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                      selectedMetric === 'tax'
                        ? 'bg-blue-900'
                        : selectedMetric === 'reliefs'
                        ? 'bg-emerald-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>

                <span className="text-[11px] font-mono font-bold text-slate-900 truncate">
                  {formatMYR(val)}
                </span>
                <span className="text-xs font-black text-slate-700 mt-1 block">
                  YA {yr}
                </span>

                {isCurrentActive && (
                  <span className="text-[9px] font-bold bg-blue-900 text-white rounded py-0.5 mt-1 block">
                    Aktif
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Multi-Year Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
          <h4 className="font-bold text-sm text-slate-900">
            Jadual Terperinci Parameter Borang BE (2019 - 2026)
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Kadar cukai &amp; had pelepasan mengikut warta statutori LHDNM tahun berkenaan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5 min-w-[200px]">Parameter Taksiran LHDN</th>
                {ASSESSMENT_YEARS.map((yr) => (
                  <th
                    key={yr}
                    className={`p-3.5 text-right min-w-[110px] ${
                      currentProfileState.activeYear === yr ? 'bg-blue-100/60 text-blue-950 font-black' : ''
                    }`}
                  >
                    YA {yr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {/* Row 1: Employment */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-700">B1. Pendapatan Penggajian</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono">
                    {formatMYR(yearMetrics[yr].statutoryEmployment)}
                  </td>
                ))}
              </tr>

              {/* Row 2: Aggregate Income */}
              <tr className="hover:bg-slate-50 font-bold bg-slate-50/40">
                <td className="p-3 text-slate-900">B4. Jumlah Pendapatan Agregat</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono text-slate-900">
                    {formatMYR(yearMetrics[yr].aggregateIncome)}
                  </td>
                ))}
              </tr>

              {/* Row 3: Donations */}
              <tr className="hover:bg-slate-50 text-slate-600">
                <td className="p-3">B5. Derma Diluluskan (Maks 10%)</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono text-emerald-700">
                    - {formatMYR(yearMetrics[yr].allowableDonations)}
                  </td>
                ))}
              </tr>

              {/* Row 4: Total Reliefs Claimed */}
              <tr className="hover:bg-slate-50 font-semibold text-emerald-700">
                <td className="p-3">B9. Jumlah Pelepasan Dibenarkan</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono">
                    - {formatMYR(yearMetrics[yr].totalReliefsClaimed)}
                  </td>
                ))}
              </tr>

              {/* Row 5: Chargeable Income */}
              <tr className="hover:bg-slate-50 font-bold bg-blue-50/30 text-blue-950">
                <td className="p-3">B10. Pendapatan Bercukai (Chargeable)</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono">
                    {formatMYR(yearMetrics[yr].chargeableIncome)}
                  </td>
                ))}
              </tr>

              {/* Row 6: Gross Tax */}
              <tr className="hover:bg-slate-50 text-slate-600">
                <td className="p-3">B11. Cukai Jadual Berperingkat</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono">
                    {formatMYR(yearMetrics[yr].grossTax)}
                  </td>
                ))}
              </tr>

              {/* Row 7: Rebates */}
              <tr className="hover:bg-slate-50 text-slate-600">
                <td className="p-3">Rebat Seksyen 6A &amp; Zakat</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono text-emerald-700">
                    - {formatMYR(yearMetrics[yr].totalRebates)}
                  </td>
                ))}
              </tr>

              {/* Row 8: Net Tax Charged */}
              <tr className="hover:bg-slate-50 font-bold border-t border-slate-200">
                <td className="p-3 text-slate-900">B12. Jumlah Cukai Dikenakan</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono text-slate-900">
                    {formatMYR(yearMetrics[yr].netTaxCharged)}
                  </td>
                ))}
              </tr>

              {/* Row 9: Effective Tax Rate */}
              <tr className="hover:bg-slate-50 text-slate-500 text-[11px]">
                <td className="p-3">Kadar Cukai Efektif (%)</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono font-semibold">
                    {yearMetrics[yr].effectiveTaxRate.toFixed(2)}%
                  </td>
                ))}
              </tr>

              {/* Row 10: PCB Paid */}
              <tr className="hover:bg-slate-50 text-emerald-700">
                <td className="p-3">B18. PCB Telah Dibayar</td>
                {ASSESSMENT_YEARS.map((yr) => (
                  <td key={yr} className="p-3 text-right font-mono">
                    - {formatMYR(yearMetrics[yr].pcbPaid)}
                  </td>
                ))}
              </tr>

              {/* Row 11: Final Net Outcome (Refund / Payable) */}
              <tr className="border-t-2 border-slate-300 font-black text-sm">
                <td className="p-3.5 text-slate-900">B19. Keputusan Bersih Cukai</td>
                {ASSESSMENT_YEARS.map((yr) => {
                  const m = yearMetrics[yr];
                  if (m.isRefund) {
                    return (
                      <td key={yr} className="p-3.5 text-right font-mono text-emerald-600 bg-emerald-50/50">
                        + {formatMYR(Math.abs(m.finalTaxOutcome))} (Refund)
                      </td>
                    );
                  } else {
                    return (
                      <td key={yr} className="p-3.5 text-right font-mono text-rose-600 bg-rose-50/50">
                        {formatMYR(m.finalTaxOutcome)}
                      </td>
                    );
                  }
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
