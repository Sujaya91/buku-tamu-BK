
import React, { useState } from 'react';
import { ViewMode } from './types';
import GuestForm from './components/GuestForm';
import RecapView from './components/RecapView';
import { ClipboardList, History } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewMode>(ViewMode.FORM);

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      {/* Header with Gradient */}
      <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-1.5 bg-white rounded-full shadow-2xl ring-4 ring-white/10 transition-transform hover:scale-105 duration-300">
              <img 
                src="https://iili.io/fWZfbyX.png" 
                alt="Logo SMPN 6 Nusa Penida" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=SMPN6';
                }}
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 uppercase drop-shadow-md">
            Buku Tamu Digital
          </h1>
          <div className="h-1 w-24 bg-blue-400 mx-auto mb-4 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-semibold text-blue-100 mb-1">
            Bimbingan dan Konseling
          </h2>
          <p className="text-sm md:text-lg text-blue-200 opacity-90 font-medium">
            SMP Negeri 6 Nusa Penida
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto -mt-8 px-4 relative z-20">
        <div className="flex p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
          <button
            onClick={() => setActiveTab(ViewMode.FORM)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === ViewMode.FORM
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[1.02]'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            Isi Buku Tamu
          </button>
          <button
            onClick={() => setActiveTab(ViewMode.RECAP)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === ViewMode.RECAP
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[1.02]'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <History className="w-5 h-5" />
            Lihat Rekapan
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 mt-12">
        {activeTab === ViewMode.FORM ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <GuestForm onSuccess={() => setActiveTab(ViewMode.RECAP)} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col items-center md:items-start">
              <h3 className="text-2xl font-extrabold text-gray-800">Rekapitulasi Kunjungan</h3>
              <div className="h-1 w-16 bg-blue-500 mt-1 rounded-full mb-2"></div>
              <p className="text-gray-500">Data kunjungan yang tersimpan secara otomatis di sistem ini.</p>
            </div>
            <RecapView />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        <p className="font-medium text-gray-500 mb-1">SMP Negeri 6 Nusa Penida</p>
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
