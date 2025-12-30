
import React, { useState, useEffect } from 'react';
import { GuestEntry } from '../types';
import { getGuests, deleteGuest } from '../services/storage';
import { Search, Trash2, FileDown, Calendar, User, Building, MapPin } from 'lucide-react';

const RecapView: React.FC = () => {
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setGuests(getGuests());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteGuest(id);
      setGuests(getGuests());
    }
  };

  const filteredGuests = guests.filter(g => 
    g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.instansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.kepentingan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.tanggal.includes(searchTerm)
  );

  const exportCSV = () => {
    const headers = ['Tanggal', 'Nama', 'Instansi/Wali', 'Alamat', 'Kepentingan'];
    const rows = guests.map(g => [
      g.tanggal,
      g.nama,
      g.instansi,
      g.alamat,
      g.kepentingan
    ]);

    const content = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Buku_Tamu_BK_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama, instansi, atau tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
          />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama & Instansi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Alamat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kepentingan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanda Tangan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGuests.length > 0 ? filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{guest.tanggal}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-800">{guest.nama}</div>
                    <div className="text-xs text-gray-500">{guest.instansi}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{guest.alamat}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs italic">"{guest.kepentingan}"</td>
                  <td className="px-6 py-4">
                    <div className="bg-gray-100 p-1 rounded border border-gray-200 w-24 h-12 flex items-center justify-center overflow-hidden">
                      <img src={guest.tandaTangan} alt="signature" className="max-h-full max-w-full" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                    Belum ada data rekapan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {filteredGuests.length > 0 ? filteredGuests.map((guest) => (
            <div key={guest.id} className="p-4 space-y-3 bg-white hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                  <Calendar className="w-3 h-3" />
                  {guest.tanggal}
                </div>
                <button
                  onClick={() => handleDelete(guest.id)}
                  className="p-1 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-gray-800">{guest.nama}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                       <Building className="w-3 h-3" /> {guest.instansi}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                   <MapPin className="w-3 h-3 text-gray-400" />
                   {guest.alamat}
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-sm italic text-gray-700">
                  "{guest.kepentingan}"
                </div>
                <div className="flex justify-center mt-2 pt-2 border-t border-gray-100">
                   <img src={guest.tandaTangan} alt="signature" className="h-12 bg-white rounded p-1 border border-gray-100" />
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-400 italic">
              Belum ada data rekapan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecapView;
