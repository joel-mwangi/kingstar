import { Position, Order, RiskEvent, SystemLog, StrategyConfig } from '@/types/trading';
import { firebaseDb } from './firebaseDb';

export interface UserTenantProfile {
  userId: string;
  loginId: string;
  fullName: string;
  email: string;
  currency: string;
  balance: number;
  equity: number;
}

export class MultiUserDatabase {
  private getCurrentUserId(loginId?: string): string {
    if (typeof window === 'undefined') return 'demo_user_CR000000';
    return loginId || localStorage.getItem('deriv_active_acct') || 'demo_user_CR000000';
  }

  public getUserProfile(loginId?: string): UserTenantProfile {
    const userId = this.getCurrentUserId(loginId);
    if (typeof window === 'undefined') {
      return {
        userId,
        loginId: userId,
        fullName: 'Deriv Trader',
        email: 'trader@deriv.com',
        currency: 'USD',
        balance: 10000.00,
        equity: 10000.00
      };
    }

    const stored = localStorage.getItem(`tenant_profile_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        firebaseDb.getUserProfile(userId).then(fbProfile => {
          if (fbProfile) localStorage.setItem(`tenant_profile_${userId}`, JSON.stringify(fbProfile));
        });
        return parsed;
      } catch (e) {}
    }

    const defaultProfile: UserTenantProfile = {
      userId,
      loginId: userId,
      fullName: loginId ? `Deriv Trader (${userId})` : 'Deriv Trader',
      email: `${userId.toLowerCase()}@deriv.com`,
      currency: 'USD',
      balance: 10000.00,
      equity: 10000.00
    };
    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }

  public saveUserProfile(profile: UserTenantProfile) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`tenant_profile_${profile.userId}`, JSON.stringify(profile));
    firebaseDb.saveUserProfile(profile);
  }

  public getStrategyConfig(userId: string): StrategyConfig {
    if (typeof window === 'undefined') {
      return {
        minProbability: 0.70,
        minExpectedReturn: 0.35,
        maxRiskPerTradePercent: 1.0,
        maxDailyLoss: 300,
        maxPositionSize: 2500,
        stopLossPercent: 1.5,
        takeProfitPercent: 3.0,
        allowShorts: true,
        activeModel: 'XGBoost_v2.4'
      };
    }

    const stored = localStorage.getItem(`tenant_strategy_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        firebaseDb.getStrategyConfig(userId).then(fbCfg => {
          if (fbCfg) localStorage.setItem(`tenant_strategy_${userId}`, JSON.stringify(fbCfg));
        });
        return parsed;
      } catch (e) {}
    }

    const defaultConfig: StrategyConfig = {
      minProbability: 0.70,
      minExpectedReturn: 0.35,
      maxRiskPerTradePercent: 1.0,
      maxDailyLoss: 300,
      maxPositionSize: 2500,
      stopLossPercent: 1.5,
      takeProfitPercent: 3.0,
      allowShorts: true,
      activeModel: 'XGBoost_v2.4'
    };
    this.saveStrategyConfig(userId, defaultConfig);
    return defaultConfig;
  }

  public saveStrategyConfig(userId: string, config: StrategyConfig) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`tenant_strategy_${userId}`, JSON.stringify(config));
    firebaseDb.saveStrategyConfig(userId, config);
  }

  public getPositions(userId: string): Position[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`tenant_positions_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        firebaseDb.getPositions(userId).then(fbPos => {
          if (fbPos) localStorage.setItem(`tenant_positions_${userId}`, JSON.stringify(fbPos));
        });
        return parsed;
      } catch (e) {}
    }
    const defaultPositions: Position[] = []; // No mock positions - clean start
    this.savePositions(userId, defaultPositions);
    return defaultPositions;
  }

  public savePositions(userId: string, positions: Position[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`tenant_positions_${userId}`, JSON.stringify(positions));
    positions.forEach(p => firebaseDb.savePosition(userId, p));
  }

  public getOrders(userId: string): Order[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`tenant_orders_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        firebaseDb.getOrders(userId).then(fbOrd => {
          if (fbOrd) localStorage.setItem(`tenant_orders_${userId}`, JSON.stringify(fbOrd));
        });
        return parsed;
      } catch (e) {}
    }
    const defaultOrders: Order[] = []; // No mock orders - clean start
    this.saveOrders(userId, defaultOrders);
    return defaultOrders;
  }

  public saveOrders(userId: string, orders: Order[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`tenant_orders_${userId}`, JSON.stringify(orders));
    orders.forEach(o => firebaseDb.saveOrder(userId, o));
  }

  public getRiskEvents(userId: string): RiskEvent[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`tenant_risk_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        firebaseDb.getRiskEvents(userId).then(fbEvt => {
          if (fbEvt) localStorage.setItem(`tenant_risk_${userId}`, JSON.stringify(fbEvt));
        });
        return parsed;
      } catch (e) {}
    }
    const defaultEvents: RiskEvent[] = [];
    this.saveRiskEvents(userId, defaultEvents);
    return defaultEvents;
  }

  public saveRiskEvents(userId: string, events: RiskEvent[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`tenant_risk_${userId}`, JSON.stringify(events));
    events.forEach(e => firebaseDb.saveRiskEvent(userId, e));
  }

  public getSystemLogs(userId: string): SystemLog[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`tenant_logs_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        firebaseDb.getSystemLogs(userId).then(fbLogs => {
          if (fbLogs) localStorage.setItem(`tenant_logs_${userId}`, JSON.stringify(fbLogs));
        });
        return parsed;
      } catch (e) {}
    }
    const defaultLogs: SystemLog[] = [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        source: 'DATABASE',
        message: 'Connected to Firebase Firestore. Multi-tenant session active.'
      }
    ];
    this.saveSystemLogs(userId, defaultLogs);
    return defaultLogs;
  }

  public saveSystemLogs(userId: string, logs: SystemLog[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`tenant_logs_${userId}`, JSON.stringify(logs));
    logs.forEach(l => firebaseDb.saveSystemLog(userId, l));
  }
}

export const multiUserDb = new MultiUserDatabase();
