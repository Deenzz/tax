import React, { useState } from 'react';
import {
  Wallet,
  Home,
  Coins,
  HeartHandshake,
  CreditCard,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AssessmentYear, YearTaxData } from '../types/tax';
import { formatMYR } from '../utils/taxEngine';

interface IncomeTabProps {
  year: AssessmentYear;
  yearData: YearTaxData;
  onUpdateIncome: (field: keyof YearTaxData['income'], value: number) => void;
}

export const IncomeTab: React.FC<IncomeTabProps> = ({
  year,
  yearData,
  onUpdateIncome,
}) => {
  const [showEaHelper, setShowEaHelper] = useState(false);
  const [eaMonthlySalary, setEaMonthlySalary] = useState('');
  const [eaMonthlyAllowance, setEaMonthlyAllowance] = useState('');
  const [eaMonthlyPcb, setEaMonthlyPcb] = useState('');
  const [eaBonus, setEaBonus] = useState('');

  const { emp = 0, rent = 0, other = 0, donations = 0, pcb = 0, zakat = 0 } = yearData.income;
  const aggregate = emp + rent + other;
  const donationCap = aggregate * 0.10;
  const allowableDonations = Math.min(donations, donationCap);
  const isDonationOverCap = donations > donationCap;

  const handleApplyEaCalculator = () => {
    const monthlySal = parseFloat(eaMonthlySalary) || 0;
    const monthlyAll = parseFloat(eaMonthlyAllowance) || 0;
    const bonus = parseFloat(eaBonus) || 0;
    const monthlyPcbVal = parseFloat(eaMonthlyPcb) || 0;

    const annualEmployment = (monthlySal + monthlyAll) * 12 + bonus;
    const annualPcb = monthlyPcbVal * 12;

    if (annualEmployment > 0) {
      onUpdateIncome('emp', annualEmployment);
    }
    if (annualPcb > 0) {
      onUpdateIncome('pcb', annualPcb);
    }
    setShowEaHelper(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
              Bahagian B Borang BE
            </span>
            <span className="text-xs text-slate-400 font-semibold">Tahun Taksiran YA {year}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Pengisytiharan Pendapatan Berkanun &amp; PCB
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Masukkan amaun daripada Penyata Pendapatan EA Form anda atau pendapatan sewa &amp; lain-lain.
          </p>
        </div>

        <button
          onClick={() => setShowEaHelper(!showEaHelper)}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-blue-800" />
          <span>Kira Gaji Bulanan ke Tahunan (EA Helper)</span>
        </button>
      </div>

      {/* EA Form Helper Box */}
      {showEaHelper && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in slide-in-from-top duration-150">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-900" />
              <div>
                <h4 className="font-bold text-sm text-blue-950">
                  Pembantu Pengiraan Pantas EA Form (Monthly Salary Converter)
                </h4>
                <p className="text-xs text-blue-900/80">
                  Masukkan gaji pokok bulanan, elaun dan PCB bulanan untuk mengira jumlah setahun secara automatik.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEaHelper(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gaji Pokok Bulanan (RM)</label>
              <input
                type="number"
                placeholder="e.g. 7000"
                value={eaMonthlySalary}
                onChange={(e) => setEaMonthlySalary(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-white outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Elaun Bulanan (RM)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={eaMonthlyAllowance}
                onChange={(e) => setEaMonthlyAllowance(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-white outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bonus Tahunan (RM)</label>
              <input
                type="number"
                placeholder="e.g. 14000"
                value={eaBonus}
                onChange={(e) => setEaBonus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-white outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PCB Bulanan (RM)</label>
              <input
                type="number"
                placeholder="e.g. 450"
                value={eaMonthlyPcb}
                onChange={(e) => setEaMonthlyPcb(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-white outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleApplyEaCalculator}
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Gunakan Nilai Ini ke Bahagian B1 &amp; B18
            </button>
          </div>
        </div>
      )}

      {/* Main Income Declaration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* B1. Statutory Employment Income */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-900">B1</span>
              <h3 className="font-bold text-slate-900 text-sm">
                Pendapatan Berkanun Penggajian (Employment Income)
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Rujuk <strong>Bahagian B Penyata EA (C.P.8A)</strong>: Jumlah pendapatan kasar penggajian ditolak perbelanjaan dibenarkan bagi tugas rasmi.
          </p>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">RM</span>
            <input
              type="number"
              value={emp || ''}
              onChange={(e) => onUpdateIncome('emp', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none text-base bg-slate-50/50 focus:bg-white"
            />
          </div>
          <span className="text-[11px] text-slate-400 block">
            Termasuk gaji pokok, lebih masa, komisen, bonus, ganjaran dan elaun bercukai.
          </span>
        </div>

        {/* B2. Statutory Income from Rents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900">B2</span>
              <h3 className="font-bold text-slate-900 text-sm">
                Pendapatan Berkanun Sewa (Rental Income)
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Pendapatan sewa bersih selepas menolak perbelanjaan dibenarkan (cukai pintu, cukai tanah, faedah pinjaman, kos baik pulih).
          </p>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">RM</span>
            <input
              type="number"
              value={rent || ''}
              onChange={(e) => onUpdateIncome('rent', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none text-base bg-slate-50/50 focus:bg-white"
            />
          </div>
          <span className="text-[11px] text-slate-400 block">
            Jika mengalami kerugian sewa, nilai berkanun dilaporkan sebagai 0.
          </span>
        </div>

        {/* B3. Interest, Discounts, Royalties, Pensions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-800 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-900">B3</span>
              <h3 className="font-bold text-slate-900 text-sm">
                Faedah, Diskaun, Royalti, Premium, Pencen, Anuiti
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Pencen yang diterima selepas umur persaraan wajib adalah dikecualikan cukai. Masukkan royalti buku atau karya kreatif melebihi had pengecualian.
          </p>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">RM</span>
            <input
              type="number"
              value={other || ''}
              onChange={(e) => onUpdateIncome('other', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none text-base bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* B5. Approved Section 44(6) Donations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-900">B5</span>
              <h3 className="font-bold text-slate-900 text-sm">
                Derma / Hadiah / Sumbangan Diluluskan (Seksyen 44(6))
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Derma kepada institusi/tabung yang diluluskan oleh Ketua Pengarah LHDN.
            <strong> Had statutori automatik: maksimum 10% daripada Pendapatan Agregat.</strong>
          </p>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">RM</span>
            <input
              type="number"
              value={donations || ''}
              onChange={(e) => onUpdateIncome('donations', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none text-base bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div className="text-[11px] flex justify-between items-center pt-1">
            <span className="text-slate-500">
              Had Maksimum 10%: <strong className="font-mono">{formatMYR(donationCap)}</strong>
            </span>
            <span className="text-emerald-700 font-bold font-mono">
              Dibenarkan: {formatMYR(allowableDonations)}
            </span>
          </div>

          {isDonationOverCap && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Amaun derma melebihi 10% agregat, dikadkan secara automatik ke {formatMYR(donationCap)}.</span>
            </div>
          )}
        </div>

        {/* B18. Potongan Cukai Bulanan (PCB) Paid */}
        <div className="bg-white rounded-2xl border-2 border-blue-900/30 p-6 shadow-xs space-y-3 bg-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900 text-white rounded-xl">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-black text-blue-900">B18</span>
              <h3 className="font-bold text-slate-900 text-sm">
                Potongan Cukai Bulanan (PCB) Telah Dibayar
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Rujuk <strong>Bahagian D EA Form</strong> (Jumlah Potongan Cukai Berjadual Tahun Semasa). Ini potongan bulanan dari slip gaji anda.
          </p>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">RM</span>
            <input
              type="number"
              value={pcb || ''}
              onChange={(e) => onUpdateIncome('pcb', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-2.5 border-2 border-blue-800 rounded-xl font-mono font-black text-blue-950 focus:ring-2 focus:ring-blue-900 outline-none text-lg bg-white"
            />
          </div>
        </div>

        {/* Zakat & Fitrah Rebate (Section 6A(3)) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900">Rebat Cukai</span>
              <h3 className="font-bold text-slate-900 text-sm">
                Bayaran Zakat / Fitrah (Seksyen 6A(3) ITA 1967)
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Zakat pendapatan, harta, perniagaan, atau fitrah yang dibayar kepada pusat zakat negeri yang diiktiraf. Menolak cukai kasar secara terus (ringgit-to-ringgit rebate).
          </p>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">RM</span>
            <input
              type="number"
              value={zakat || ''}
              onChange={(e) => onUpdateIncome('zakat', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none text-base bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
