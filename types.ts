
export interface GuestEntry {
  id: string;
  tanggal: string;
  nama: string;
  instansi: string; // Instansi/Orang Tua/Wali Siswa Dari
  alamat: string;
  kepentingan: string;
  tandaTangan: string; // Base64 string of the signature
  createdAt: number;
}

export enum ViewMode {
  FORM = 'FORM',
  RECAP = 'RECAP'
}
