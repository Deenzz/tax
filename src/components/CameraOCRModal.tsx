import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  DollarSign,
  Calendar,
  Building,
  Tag,
  X,
} from 'lucide-react';
import { AssessmentYear, StoredReceipt } from '../types/tax';
import { formatMYR, RELIEFS_CATALOG } from '../utils/taxEngine';

interface CameraOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: AssessmentYear;
  onReceiptExtracted: (receipt: Omit<StoredReceipt, 'id' | 'createdAt'>) => void;
}

export const CameraOCRModal: React.FC<CameraOCRModalProps> = ({
  isOpen,
  onClose,
  year,
  onReceiptExtracted,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Extracted OCR fields
  const [extractedData, setExtractedData] = useState<{
    merchant: string;
    date: string;
    amount: number;
    category: string;
    description: string;
    items: string[];
    confidence: number;
    reasoning: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Kamera tidak dapat diakses atau tiada kebenaran. Sila gunakan fungsi muat naik fail gambar.');
      setMode('upload');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      processReceiptWithGemini(dataUrl, 'image/jpeg');
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setCapturedImage(base64);
      processReceiptWithGemini(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const processReceiptWithGemini = async (base64String: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setExtractedData({
          merchant: d.merchant || 'Peniaga Tidak Diketahui',
          date: d.date || new Date().toISOString().slice(0, 10),
          amount: parseFloat(d.totalAmount) || 0,
          category: d.taxReliefCategory || 'rel_lifestyle',
          description: d.description || 'Perbelanjaan resit bercukai',
          items: Array.isArray(d.items) ? d.items : [],
          confidence: d.confidenceScore || 90,
          reasoning: d.reasoning || 'Dipadankan dengan kriteria pelepasan cukai LHDN.',
        });
      } else {
        // Fallback for manual review
        setExtractedData({
          merchant: 'Imbasan Selesai (Sila sahkan)',
          date: new Date().toISOString().slice(0, 10),
          amount: 0,
          category: 'rel_lifestyle',
          description: 'Resit dimuat naik',
          items: [],
          confidence: 70,
          reasoning: 'Sila masukkan butiran secara manual jika maklumat kabur.',
        });
      }
    } catch (err) {
      console.error('OCR Error:', err);
      // Fallback
      setExtractedData({
        merchant: 'Resit Luar Talian (Offline)',
        date: new Date().toISOString().slice(0, 10),
        amount: 0,
        category: 'rel_lifestyle',
        description: 'Disimpan secara setempat',
        items: [],
        confidence: 60,
        reasoning: 'Pelayan AI tidak dapat dicapai. Anda boleh melengkapkan nilai secara setempat.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!extractedData) return;
    onReceiptExtracted({
      date: extractedData.date,
      category: extractedData.category,
      merchant: extractedData.merchant,
      description: extractedData.description,
      amount: extractedData.amount,
      imageUrl: capturedImage || undefined,
      verifiedAudit: true,
      ocrConfidence: extractedData.confidence,
      items: extractedData.items,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setIsProcessing(false);
    if (mode === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Pengecaman Resit Pintar (AI OCR Scanner)
              </h3>
              <p className="text-xs text-slate-500">
                Imbas dengan kamera telefon/laptop atau muat naik fail resit/invois.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        {!capturedImage && (
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setMode('camera')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                mode === 'camera' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Gunakan Kamera Langsung</span>
            </button>
            <button
              onClick={() => {
                stopCamera();
                setMode('upload');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                mode === 'upload' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Muat Naik Fail Imej</span>
            </button>
          </div>
        )}

        {/* Viewport: Camera / Upload / Processing */}
        {!capturedImage ? (
          <div>
            {mode === 'camera' ? (
              <div className="space-y-3">
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Scanner overlay guide */}
                  <div className="absolute inset-8 border-2 border-dashed border-amber-400/70 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-amber-300 font-bold bg-slate-950/70 px-3 py-1 rounded-full">
                      Selaraskan resit di dalam bingkai
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={captureSnapshot}
                    disabled={!cameraActive}
                    className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-md transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span>Tangkap Gambar &amp; Analisis</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer relative">
                <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    Pilih atau heret fail resit / invois ke sini
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Menyokong JPG, PNG, WEBP sehingga 10MB
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        ) : isProcessing ? (
          <div className="p-12 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-blue-900 animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                AI Sedang Menganalisis Resit...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Mengekstrak nama peniaga, tarikh, jumlah dalam MYR, dan memadankan ke pelepasan LHDN ITA 1967.
              </p>
            </div>
          </div>
        ) : extractedData ? (
          /* Extracted Data Review & Confirmation */
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Maklumat Berjaya Diekstrak (Keyakinan: {extractedData.confidence}%)</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Imbas Semula
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Peniaga (Merchant)</label>
                <input
                  type="text"
                  value={extractedData.merchant}
                  onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tarikh Resit</label>
                <input
                  type="date"
                  value={extractedData.date}
                  onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 font-mono font-medium text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Jumlah Perbelanjaan (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={extractedData.amount || ''}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full border rounded-xl px-3 py-2 font-mono font-black text-blue-900 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kategori Pelepasan LHDN</label>
                <select
                  value={extractedData.category}
                  onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 font-semibold text-slate-900 bg-white"
                >
                  {RELIEFS_CATALOG.filter((r) => !r.locked && (r.maxLimits[year] || 0) > 0).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code}. {r.title.split('(')[0]}
                    </option>
                  ))}
                  <option value="donation">B5. Derma Diluluskan Seksyen 44(6)</option>
                  <option value="other">Lain-lain / Perbelanjaan Am</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-600 mb-1">Keterangan Item</label>
                <input
                  type="text"
                  value={extractedData.description}
                  onChange={(e) => setExtractedData({ ...extractedData, description: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 font-medium text-slate-900 bg-white"
                />
              </div>

              {extractedData.reasoning && (
                <div className="sm:col-span-2 bg-blue-50/70 border border-blue-200/80 p-3 rounded-xl text-[11px] text-blue-950">
                  <span className="font-bold block mb-0.5">Penjelasan Kelayakan LHDN:</span>
                  {extractedData.reasoning}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
              >
                Sahkan &amp; Simpan ke Peti Resit (YA {year})
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
