
import React, { useState } from 'react';
import { GuestEntry } from '../types';
import { saveGuest } from '../services/storage';
import SignaturePad from './SignaturePad';
import VoiceAssistant from './VoiceAssistant';
import { CheckCircle, Sparkles } from 'lucide-react';

interface GuestFormProps {
  onSuccess: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    alamat: '',
    kepentingan: '',
    tanggal: new Date().toISOString().split('T')[0]
  });
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVoiceUpdate = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      alert("Silakan bubuhkan tanda tangan terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    
    const newEntry: GuestEntry = {
      id: crypto.randomUUID(),
      ...formData,
      tandaTangan: signature,
      createdAt: Date.now()
    };

    setTimeout(() => {
      saveGuest(newEntry);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
      }, 2000);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 p-6 rounded-full mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-800">Berhasil Disimpan!</h2>
        <p className="text-gray-500 mt-2 text-lg">Terima kasih telah mengisi buku tamu.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Voice Bar with Gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-5 rounded-2xl shadow-xl text-white border border-white/10">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Asisten Suara</h4>
            <p className="text-xs text-blue-100 font-medium">Isi otomatis formulir dengan berbicara</p>
          </div>
        </div>
        <VoiceAssistant onUpdateFields={handleVoiceUpdate} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              required
              value={formData.tanggal}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              required
              placeholder="Masukkan nama Anda"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Instansi / Orang Tua / Wali Dari</label>
          <input
            type="text"
            name="instansi"
            required
            placeholder="Contoh: Orang tua dari Made"
            value={formData.instansi}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Alamat</label>
          <textarea
            name="alamat"
            required
            rows={2}
            placeholder="Alamat lengkap"
            value={formData.alamat}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Kepentingan</label>
          <textarea
            name="kepentingan"
            required
            rows={3}
            placeholder="Maksud dan tujuan kunjungan"
            value={formData.kepentingan}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tanda Tangan</label>
          <SignaturePad 
            onSave={(data) => setSignature(data)}
            onClear={() => setSignature('')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg py-4 px-6 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Sedang Menyimpan...' : 'SIMPAN KUNJUNGAN'}
        </button>
      </form>
    </div>
  );
};

export default GuestForm;
