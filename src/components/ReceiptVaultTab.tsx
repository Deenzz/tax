import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Eye,
  FileSpreadsheet,
  Copy,
  Check,
  Calendar,
  Building2,
  Tag,
} from 'lucide-react';
import { AssessmentYear, StoredReceipt, YearTaxData } from '../types/tax';
import { formatMYR, RELIEFS_CATALOG } from '../utils/taxEngine';

interface ReceiptVaultTabProps {
  year: AssessmentYear;
  yearData: YearTaxData;
  onAddReceipt: (receipt: Omit<StoredReceipt, 'id' | 'createdAt'>) => void;
  onDeleteReceipt: (receiptId: string) => void;
  onOpenOCRModal: () => void;
  selectedCategoryFilter?: string;
}

export const ReceiptVaultTab: React.FC<ReceiptVaultTabProps> = ({
  year,
  yearData,
  onAddReceipt,
  onDeleteReceipt,
  onOpenOCRModal,
  selectedCategoryFilter,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [copiedStructure, setCopiedStructure] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<StoredReceipt | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(selectedCategoryFilter || 'rel_lifestyle');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState(selectedCategoryFilter || 'all');

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!merchant || isNaN(numAmount) || numAmount <= 0) {
      alert('Sila masukkan nama peniaga dan jumlah perbelanjaan yang sah.');
      return;
    }

    onAddReceipt({
      date,
      category,
      merchant,
      description,
      amount: numAmount,
      driveLink: driveLink.trim() || undefined,
      imageUrl: receiptImage || undefined,
      verifiedAudit: Boolean(driveLink.trim() || receiptImage),
    });

    // Reset Form
    setMerchant('');
    setDescription('');
    setAmount('');
    setDriveLink('');
    setReceiptImage(null);
    setShowAddForm(false);
  };

  const filteredReceipts = yearData.receipts.filter((r) => {
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesSearch =
      r.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalVaultAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);

  // Export receipts to CSV
  const exportToCSV = () => {
    const headers = ['Tarikh', 'Kategori LHDN', 'Peniaga', 'Keterangan', 'Jumlah (RM)', 'Pautan Google Drive'];
    const rows = yearData.receipts.map((r) => {
      const config = RELIEFS_CATALOG.find((c) => c.id === r.category);
      const catName = config ? `${config.code} - ${config.title}` : r.category;
      return [
        `"${r.date}"`,
        `"${catName}"`,
        `"${r.merchant.replace(/"/g, '""')}"`,
        `"${r.description.replace(/"/g, '""')}"`,
        r.amount.toFixed(2),
        `"${r.driveLink || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MyTax_Vault_Receipts_YA${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const driveFolderStructure = `📁 MyTax_Vault_Audit_YA${year}/
  ├── 📁 01_Gaya_Hidup_F8/ (Resit Komputer, Telefon, Buku, Internet)
  ├── 📁 02_Sukan_F8b/ (Peralatan Sukan, Gim, Yuran Pertandingan)
  ├── 📁 03_Perubatan_F6/ (Resit Hospital, Klinik, Pemeriksaan Penuh)
  ├── 📁 04_Ibu_Bapa_F2/ (Perubatan & Penjagaan Ibu Bapa)
  ├── 📁 05_Pendidikan_F5/ (Resit Yuran Universiti & Kursus)
  ├── 📁 06_Anak_TASKA_F10/ (Yuran Tadika & Pusat Asuhan)
  ├── 📁 07_SSPN_F11/ (Penyata Deposit Bersih SSPN)
  ├── 📁 08_Insurans_F15_F17/ (Penyata Premium Tahunan Insurans)
  └── 📁 09_Derma_B5/ (Resit Rasmi Derma Diluluskan Seksyen 44(6))`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              Peti Resit &amp; Jejak Audit (Audit Trail)
            </span>
            <span className="text-xs text-slate-400 font-semibold">Tahun Taksiran YA {year}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Peti Simpanan Resit &amp; Pautan Google Drive
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simpan bukti bayaran selamat secara setempat atau hubungkan pautan Google Drive bagi persediaan audit 7 tahun LHDN.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowDriveGuide(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-300 transition cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-blue-700" />
            <span>Panduan Folder Google Drive</span>
          </button>

          <button
            onClick={onOpenOCRModal}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Imbas dengan Kamera / OCR</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Resit Manual</span>
          </button>
        </div>
      </div>

      {/* Manual Add Receipt Form Modal / Inline Box */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-blue-900/20 p-6 shadow-md space-y-4 animate-in slide-in-from-top-4 duration-150"
        >
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-900" />
              Daftar Resit Baru &amp; Auto-Kemas Kini Pelepasan Cukai
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Tarikh Resit</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-900 outline-none font-medium bg-white"
              />
            </div>

            <div>
              <label className="block mb-1">Sasaran Pelepasan Cukai LHDN</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-900 outline-none font-medium bg-white"
              >
                {RELIEFS_CATALOG.filter((r) => !r.locked && (r.maxLimits[year] || 0) > 0).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code}. {r.title.split('(')[0]} (Had: {formatMYR(r.maxLimits[year])})
                  </option>
                ))}
                <option value="donation">B5. Derma / Hadiah Diluluskan Seksyen 44(6)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Jumlah Perbelanjaan (RM)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block mb-1">Nama Peniaga / Merchant</label>
              <input
                type="text"
                required
                placeholder="e.g. Harvey Norman, Decathlon, Klinik Pakar"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-900 outline-none font-medium bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1">Keterangan Item / Perkhidmatan</label>
              <input
                type="text"
                placeholder="e.g. Laptop MacBook Air untuk kegunaan pengajian & kerja"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-900 outline-none font-medium bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1">Pautan Fail Google Drive (Bukti Audit)</label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-900 outline-none font-medium bg-white"
              />
            </div>

            <div>
              <label className="block mb-1">Muat Naik Gambar Resit (Simpan Setempat)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              Simpan Resit &amp; Tambah Nilai ke Pelepasan
            </button>
          </div>
        </form>
      )}

      {/* Receipts Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari peniaga atau item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-none font-medium"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium outline-none text-slate-700"
            >
              <option value="all">Semua Kategori</option>
              {RELIEFS_CATALOG.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} {r.title.split('(')[0]}
                </option>
              ))}
              <option value="donation">B5 Derma Diluluskan</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-semibold">
              Jumlah ({filteredReceipts.length} resit):{' '}
              <strong className="text-slate-900 font-mono text-sm">{formatMYR(totalVaultAmount)}</strong>
            </span>
            {yearData.receipts.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold bg-white border border-slate-200 px-3 py-1 rounded-lg"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Eksport CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="px-5 py-3.5">Tarikh</th>
                <th className="px-5 py-3.5">Kategori Pelepasan</th>
                <th className="px-5 py-3.5">Peniaga &amp; Item</th>
                <th className="px-5 py-3.5 text-right">Jumlah (RM)</th>
                <th className="px-5 py-3.5 text-center">Bukti Audit &amp; Fail</th>
                <th className="px-5 py-3.5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map((rec) => {
                const config = RELIEFS_CATALOG.find((c) => c.id === rec.category);
                const categoryLabel = config
                  ? `${config.code} ${config.title.split('(')[0]}`
                  : rec.category === 'donation'
                  ? 'B5 Derma Seksyen 44(6)'
                  : rec.category;

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {rec.date}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="bg-blue-50 text-blue-900 border border-blue-200/70 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {categoryLabel}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{rec.merchant}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{rec.description}</div>
                      {rec.items && rec.items.length > 0 && (
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          Item: {rec.items.join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                      {formatMYR(rec.amount)}
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {rec.driveLink ? (
                          <a
                            href={rec.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded-md border border-blue-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Google Drive
                          </a>
                        ) : rec.imageUrl ? (
                          <button
                            onClick={() => setPreviewReceipt(rec)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            Lihat Gambar
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Tiada fail</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Padam rekod resit "${rec.merchant}"?`)) {
                            onDeleteReceipt(rec.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                        title="Padam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredReceipts.length === 0 && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Tiada rekod resit bagi tahun taksiran {year}.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                + Tambah resit pertama anda sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Drive Folder Guide Modal */}
      {showDriveGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Cadangan Struktur Folder Google Drive (Audit LHDN)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ikuti format ini di Google Drive anda untuk memudahkan semakan audit 7 tahun Seksyen 82A ITA 1967.
                </p>
              </div>
              <button
                onClick={() => setShowDriveGuide(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Tutup
              </button>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              <pre>{driveFolderStructure}</pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(driveFolderStructure);
                  setCopiedStructure(true);
                  setTimeout(() => setCopiedStructure(false), 2000);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                {copiedStructure ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedStructure ? 'Disalin!' : 'Salin Struktur Folder'}</span>
              </button>

              <button
                onClick={() => setShowDriveGuide(false)}
                className="bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Faham &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{previewReceipt.merchant}</h4>
                <p className="text-xs text-slate-500">
                  {previewReceipt.date} • {formatMYR(previewReceipt.amount)}
                </p>
              </div>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Tutup
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 p-2">
              {previewReceipt.imageUrl && (
                <img
                  src={previewReceipt.imageUrl}
                  alt={previewReceipt.merchant}
                  className="max-h-full object-contain rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Tutup Paparan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
