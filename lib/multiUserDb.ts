import { ensureFirebaseUser } from './firebase';
import { firebaseDb } from './firebaseDb';
import { Order, Position, RiskEvent, StrategyConfig, SystemLog } from '@/types/trading';

export interface UserTenantProfile {
  userId: string;
  loginId: string;
  fullName: string;
  email: string;
  currency: string;
  balance: number;
  equity: number;
  derivAccountId?: string;
  derivAccountIsVirtual?: boolean;
}

export const PAPER_STARTING_BALANCE = 10000;

export const DEFAULT_STRATEGY: StrategyConfig = {
  minProbability: 0.65,
  minExpectedReturn: 0.10,
  maxRiskPerTradePercent: 1.0,
  maxDailyLoss: 300,
  maxPositionSize: 50,
  defaultDuration: 60,
  defaultDurationUnit: 's',
  activeModel: 'Heuristic Momentum',
};

function defaultProfile(userId: string): UserTenantProfile {
  return {
    userId,
    loginId: 'UNAUTHENTICATED',
    fullName: 'Deriv Trader',
    email: '',
    currency: 'USD',
    balance: PAPER_STARTING_BALANCE,
    equity: PAPER_STARTING_BALANCE,
  };
}

export class MultiUserDatabase {
  async initialize(): Promise<{
    profile: UserTenantProfile;
    positions: Position[];
    orders: Order[];
    riskEvents: RiskEvent[];
    logs: SystemLog[];
    strategyConfig: StrategyConfig;
  }> {
    const firebaseUser = await ensureFirebaseUser();
    const userId = firebaseUser.uid;
    const storedProfile = await firebaseDb.getUserProfile(userId);
    const baseProfile = defaultProfile(userId);

    const profile: UserTenantProfile = {
      ...baseProfile,
      fullName:
        typeof storedProfile?.fullName === 'string'
          ? storedProfile.fullName.slice(0, 256)
          : baseProfile.fullName,
      email:
        typeof storedProfile?.email === 'string'
          ? storedProfile.email.slice(0, 256)
          : baseProfile.email,
    };

    if (!storedProfile) {
      await firebaseDb.saveUserProfile(userId, profile as unknown as Record<string, unknown>);
    }

    const [positions, orders, riskEvents, logs, storedStrategy] = await Promise.all([
      firebaseDb.getPositions(userId),
      firebaseDb.getOrders(userId),
      firebaseDb.getRiskEvents(userId),
      firebaseDb.getSystemLogs(userId),
      firebaseDb.getStrategyConfig(userId),
    ]);

    const strategyConfig = storedStrategy
      ? { ...DEFAULT_STRATEGY, ...storedStrategy }
      : DEFAULT_STRATEGY;

    if (!storedStrategy) {
      await firebaseDb.saveStrategyConfig(userId, strategyConfig);
    }

    return { profile, positions, orders, riskEvents, logs, strategyConfig };
  }

  updateProfile(profile: UserTenantProfile): Promise<void> {
    return firebaseDb.saveUserProfile(profile.userId, {
      fullName: profile.fullName,
      email: profile.email,
    });
  }

  saveStrategyConfig(userId: string, config: StrategyConfig): Promise<void> {
    return firebaseDb.saveStrategyConfig(userId, config);
  }

  savePosition(userId: string, position: Position): Promise<void> {
    return firebaseDb.savePosition(userId, position);
  }

  deletePosition(userId: string, positionId: string): Promise<void> {
    return firebaseDb.deletePosition(userId, positionId);
  }

  saveOrder(userId: string, order: Order): Promise<void> {
    return firebaseDb.saveOrder(userId, order);
  }

  saveRiskEvent(userId: string, event: RiskEvent): Promise<void> {
    return firebaseDb.saveRiskEvent(userId, event);
  }

  saveSystemLog(userId: string, log: SystemLog): Promise<void> {
    return firebaseDb.saveSystemLog(userId, log);
  }
}

export const multiUserDb = new MultiUserDatabase();
