import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { Position, Order, RiskEvent, SystemLog, StrategyConfig } from '@/types/trading';
import { UserTenantProfile } from './multiUserDb';

export class FirebaseDatabaseService {
  public async saveUserProfile(profile: UserTenantProfile): Promise<void> {
    try {
      const ref = doc(db, 'users', profile.userId);
      await setDoc(ref, profile, { merge: true });
    } catch (err) {
      console.error('Firebase saveUserProfile error:', err);
    }
  }

  public async getUserProfile(userId: string): Promise<UserTenantProfile | null> {
    try {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserTenantProfile;
      }
    } catch (err) {
      console.error('Firebase getUserProfile error:', err);
    }
    return null;
  }

  public async saveStrategyConfig(userId: string, config: StrategyConfig): Promise<void> {
    try {
      const ref = doc(db, 'strategies', userId);
      await setDoc(ref, config, { merge: true });
    } catch (err) {
      console.error('Firebase saveStrategyConfig error:', err);
    }
  }

  public async getStrategyConfig(userId: string): Promise<StrategyConfig | null> {
    try {
      const ref = doc(db, 'strategies', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as StrategyConfig;
      }
    } catch (err) {
      console.error('Firebase getStrategyConfig error:', err);
    }
    return null;
  }

  public async savePosition(userId: string, position: Position): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'positions', position.id);
      await setDoc(ref, position, { merge: true });
    } catch (err) {
      console.error('Firebase savePosition error:', err);
    }
  }

  public async getPositions(userId: string): Promise<Position[]> {
    try {
      const colRef = collection(db, 'users', userId, 'positions');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as Position);
    } catch (err) {
      console.error('Firebase getPositions error:', err);
      return [];
    }
  }

  public async saveOrder(userId: string, order: Order): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'orders', order.id);
      await setDoc(ref, order, { merge: true });
    } catch (err) {
      console.error('Firebase saveOrder error:', err);
    }
  }

  public async getOrders(userId: string): Promise<Order[]> {
    try {
      const colRef = collection(db, 'users', userId, 'orders');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as Order);
    } catch (err) {
      console.error('Firebase getOrders error:', err);
      return [];
    }
  }

  public async saveRiskEvent(userId: string, event: RiskEvent): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'risk_events', event.id);
      await setDoc(ref, event, { merge: true });
    } catch (err) {
      console.error('Firebase saveRiskEvent error:', err);
    }
  }

  public async getRiskEvents(userId: string): Promise<RiskEvent[]> {
    try {
      const colRef = collection(db, 'users', userId, 'risk_events');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as RiskEvent);
    } catch (err) {
      console.error('Firebase getRiskEvents error:', err);
      return [];
    }
  }

  public async saveSystemLog(userId: string, log: SystemLog): Promise<void> {
    try {
      const ref = doc(db, 'users', userId, 'system_logs', log.id);
      await setDoc(ref, log, { merge: true });
    } catch (err) {
      console.error('Firebase saveSystemLog error:', err);
    }
  }

  public async getSystemLogs(userId: string): Promise<SystemLog[]> {
    try {
      const colRef = collection(db, 'users', userId, 'system_logs');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as SystemLog);
    } catch (err) {
      console.error('Firebase getSystemLogs error:', err);
      return [];
    }
  }
}

export const firebaseDb = new FirebaseDatabaseService();
