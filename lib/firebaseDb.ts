import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, Position, RiskEvent, StrategyConfig, SystemLog } from '@/types/trading';

export class FirebaseDatabaseService {
  async getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
  }

  async saveUserProfile(userId: string, profile: Record<string, unknown>): Promise<void> {
    await setDoc(doc(db, 'users', userId), profile, { merge: true });
  }

  async getStrategyConfig(userId: string): Promise<StrategyConfig | null> {
    const snap = await getDoc(doc(db, 'strategies', userId));
    return snap.exists() ? (snap.data() as StrategyConfig) : null;
  }

  async saveStrategyConfig(userId: string, config: StrategyConfig): Promise<void> {
    await setDoc(doc(db, 'strategies', userId), config, { merge: true });
  }

  private async getCollection<T>(userId: string, collectionName: string): Promise<T[]> {
    const snap = await getDocs(collection(db, 'users', userId, collectionName));
    return snap.docs.map((item) => item.data() as T);
  }

  async getPositions(userId: string): Promise<Position[]> {
    return this.getCollection<Position>(userId, 'positions');
  }

  async getOrders(userId: string): Promise<Order[]> {
    return this.getCollection<Order>(userId, 'orders');
  }

  async getRiskEvents(userId: string): Promise<RiskEvent[]> {
    return this.getCollection<RiskEvent>(userId, 'risk_events');
  }

  async getSystemLogs(userId: string): Promise<SystemLog[]> {
    return this.getCollection<SystemLog>(userId, 'system_logs');
  }

  async savePosition(userId: string, position: Position): Promise<void> {
    await setDoc(doc(db, 'users', userId, 'positions', position.id), position, { merge: true });
  }

  async deletePosition(userId: string, positionId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId, 'positions', positionId));
  }

  async saveOrder(userId: string, order: Order): Promise<void> {
    await setDoc(doc(db, 'users', userId, 'orders', order.id), order, { merge: true });
  }

  async saveRiskEvent(userId: string, event: RiskEvent): Promise<void> {
    await setDoc(doc(db, 'users', userId, 'risk_events', event.id), event, { merge: true });
  }

  async saveSystemLog(userId: string, log: SystemLog): Promise<void> {
    await setDoc(doc(db, 'users', userId, 'system_logs', log.id), log, { merge: true });
  }
}

export const firebaseDb = new FirebaseDatabaseService();
