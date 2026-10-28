import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  ArrowRight,
} from 'lucide-react';
import { AssessmentYear, YearTaxData } from '../types/tax';
import { formatMYR, RELIEFS_CATALOG } from '../utils/taxEngine';

interface PDFImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeYear: AssessmentYear;
  onApplyImportedData: (
    targetYear: AssessmentYear,
    data: {
      income: Partial<YearTaxData['income']>;
      reliefs: Record<string, number>;
      taxpayerName?: string;
      taxFileNo?: string;
    }
  ) => void;
}

export const PDFImporterModal: React.FC<PDFImporterModalProps> = ({
  isOpen,
  onClose,
  activeYear,
  onApplyImportedData,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [targetYear, setTargetYear] = useState<AssessmentYear>(activeYear);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    setParsedResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const res = await fetch('/api/parse-tax-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentBase64: base64,
            mimeType: file.type || 'application/pdf',
            fileName: file.name,
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setParsedResult(json.data);
          if (json.data.assessmentYear) {
            setTargetYear(json.data.assessmentYear as AssessmentYear);
          }
        } else {
          alert('Gagal mengekstrak dokumen cukai. Sila pastikan dokumen adalah Borang BE atau Penyata EA.');
        }
      } catch (err) {
        console.error('Error importing tax document:', err);
        alert('Ralat semasa memproses fail dokumen.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmApply = () => {
    if (!parsedResult) return;

    onApplyImportedData(targetYear, {
      income: {
        emp: parsedResult.statutoryIncome?.emp || 0,
        rent: parsedResult.statutoryIncome?.rent || 0,
        other: parsedResult.statutoryIncome?.other || 0,
        donations: parsedResult.statutoryIncome?.donations || 0,
        pcb: parsedResult.statutoryIncome?.pcb || 0,
        zakat: parsedResult.statutoryIncome?.zakat || 0,
      },
      reliefs: parsedResult.reliefs || {},
      taxpayerName: parsedResult.taxpayerName,
      taxFileNo: parsedResult.taxFileNo,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-900 rounded-2xl">
              <FileSpreadsheet className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Import Borang BE / Penyata EA (PDF)
              </h3>
              <p className="text-xs text-slate-500">
                AI akan membaca fail PDF atau imej Borang BE / EA anda dan menukarnya terus ke dalam vault.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Box */}
        {!parsedResult && !isProcessing && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50 hover:bg-slate-100/80 transition relative cursor-pointer">
            <Upload className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Pilih atau seret fail PDF Borang BE / Borang EA ke sini
              </span>
              <span className="text-[11px] text-slate-400">
                Format PDF, scan JPG, atau PNG sehingga 20MB
              </span>
            </div>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="p-10 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-blue-900 animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Membaca &amp; Mengekstrak Penyata Cukai...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Fail: <span className="font-semibold text-slate-700">{fileName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Parsed Result Preview */}
        {parsedResult && !isProcessing && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Dokumen Dikenal Pasti: {parsedResult.documentType || 'Borang Cukai'}
              </span>
              <span className="font-mono font-bold text-slate-700">
                YA: {parsedResult.assessmentYear || activeYear}
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Nama Pembayar Cukai:</span>
                <span className="font-bold text-slate-900">
                  {parsedResult.taxpayerName || 'Tidak dinyatakan'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>B1. Pendapatan Penggajian:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatMYR(parsedResult.statutoryIncome?.emp || 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>B18. PCB Dibayar:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatMYR(parsedResult.statutoryIncome?.pcb || 0)}
                </span>
              </div>
              {parsedResult.summaryNotes && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Nota AI: {parsedResult.summaryNotes}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun Taksiran Sasaran (Target YA):
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value as AssessmentYear)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-900 bg-white outline-none"
              >
                {['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'].map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun Taksiran YA {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Muat Naik Fail Lain
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                Sahkan &amp; Masukkan ke YA {targetYear}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
