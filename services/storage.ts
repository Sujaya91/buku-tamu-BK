
import { GuestEntry } from '../types';

const STORAGE_KEY = 'smpn6_guestbook_data';

export const getGuests = (): GuestEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Error parsing guest data", e);
    return [];
  }
};

export const saveGuest = (entry: GuestEntry): void => {
  const current = getGuests();
  const updated = [entry, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteGuest = (id: string): void => {
  const current = getGuests();
  const updated = current.filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
