import React, { useState } from 'react';
import { User, ShieldCheck, Lock, X, Check, Save } from 'lucide-react';
import { TaxpayerProfile } from '../types/tax';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TaxpayerProfile;
  onSaveProfile: (profile: TaxpayerProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<TaxpayerProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-900 rounded-2xl">
              <User className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Profil Pembayar Cukai</h3>
              <p className="text-xs text-slate-500">
                Maklumat ini dipaparkan pada laporan rasmi Borang BE PDF.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Penuh (Seperti MyKad)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Rujukan Cukai (SG/OG)</label>
              <input
                type="text"
                placeholder="SG 28941029010"
                value={formData.taxFileNo}
                onChange={(e) => setFormData({ ...formData, taxFileNo: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Kad Pengenalan / Pasport</label>
              <input
                type="text"
                placeholder="901024-03-5123"
                value={formData.icNumber}
                onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taraf Mastautin</label>
              <select
                value={formData.residentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    residentStatus: e.target.value as any,
                  })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="RESIDENT">Pemastautin (Resident)</option>
                <option value="NON_RESIDENT">Bukan Pemastautin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taraf Perkahwinan</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maritalStatus: e.target.value as any,
                  })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="SINGLE">Bujang (Single)</option>
                <option value="MARRIED_SEPARATE">Berkahwin (Taksiran Berasingan)</option>
                <option value="MARRIED_COMBINED">Berkahwin (Taksiran Bersama)</option>
                <option value="DIVORCED">Bercerai / Balu</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bilangan Anak Tanggungan</label>
            <input
              type="number"
              min="0"
              max="20"
              value={formData.numberOfChildren}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfChildren: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="pt-2 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Simpan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
