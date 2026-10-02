import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AdminSystemSettings {
  tradingEnabled: boolean;
  maintenanceMode: boolean;
  allowRealTrading: boolean;
  notice: string;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSystemSettings = {
  tradingEnabled: true,
  maintenanceMode: false,
  allowRealTrading: false,
  notice: '',
};

export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const snap = await getDoc(doc(db, 'admins', userId));
  return snap.exists();
}

export async function getAdminSystemSettings(): Promise<AdminSystemSettings> {
  const snap = await getDoc(doc(db, 'admin_settings', 'system'));
  if (!snap.exists()) return DEFAULT_ADMIN_SETTINGS;
  return { ...DEFAULT_ADMIN_SETTINGS, ...(snap.data() as Partial<AdminSystemSettings>) };
}

export async function saveAdminSystemSettings(settings: AdminSystemSettings): Promise<void> {
  await setDoc(doc(db, 'admin_settings', 'system'), {
    ...DEFAULT_ADMIN_SETTINGS,
    ...settings,
    notice: settings.notice.slice(0, 500),
  }, { merge: true });
}

export interface AdminUserSummary {
  userId: string;
  fullName: string;
  email: string;
}

export async function listUserProfiles(): Promise<AdminUserSummary[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((item) => {
    const data = item.data() as Record<string, unknown>;
    return {
      userId: item.id,
      fullName: typeof data.fullName === 'string' ? data.fullName : 'Unnamed user',
      email: typeof data.email === 'string' ? data.email : '',
    };
  });
}
