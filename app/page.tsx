'use client';

import React, { useState, useEffect } from 'react';
import { 
  BotStatus, 
  TradingMode, 
  Asset, 
  Position, 
  Order, 
  RiskEvent, 
  SystemLog, 
  StrategyConfig 
} from '@/types/trading';
import { initialAssets } from '@/lib/mockTradingData';
import { multiUserDb, UserTenantProfile } from '@/lib/multiUserDb';
import { derivClient } from '@/lib/derivWebSocket';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { MlStrategyView } from '@/components/MlStrategyView';
import { RiskManagementView } from '@/components/RiskManagementView';
import { BacktestView } from '@/components/BacktestView';
import { DatabaseInspector } from '@/components/DatabaseInspector';
import { AiAnalystView } from '@/components/AiAnalystView';
import { EmergencyModal } from '@/components/EmergencyModal';
import { DerivBrokerWidget } from '@/components/DerivBrokerWidget';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<BotStatus>('RUNNING');
  const [mode, setMode] = useState<TradingMode>('PAPER');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [currentUser, setCurrentUser] = useState<UserTenantProfile>({
    userId: 'demo_user_CR000000',
    loginId: 'demo_user_CR000000',
    fullName: 'Deriv Trader',
    email: 'trader@deriv.com',
    currency: 'USD',
    balance: 10000.00,
    equity: 10000.00
  });

  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>({
    minProbability: 0.70,
    minExpectedReturn: 0.35,
    maxRiskPerTradePercent: 1.0,
    maxDailyLoss: 300,
    maxPositionSize: 2500,
    stopLossPercent: 1.5,
    takeProfitPercent: 3.0,
    allowShorts: true,
    activeModel: 'XGBoost_v2.4'
  });

  const [accountBalance, setAccountBalance] = useState<number>(10000.00);
  const [accountEquity, setAccountEquity] = useState<number>(10000.00);
  const [dailyPnl, setDailyPnl] = useState<number>(0.00);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const profile = multiUserDb.getUserProfile();
    setCurrentUser(profile);
    setPositions(multiUserDb.getPositions(profile.userId));
    setOrders(multiUserDb.getOrders(profile.userId));
    setRiskEvents(multiUserDb.getRiskEvents(profile.userId));
    setLogs(multiUserDb.getSystemLogs(profile.userId));
    setStrategyConfig(multiUserDb.getStrategyConfig(profile.userId));
    setAccountBalance(profile.balance);
    setAccountEquity(profile.equity);
  }, []);

  // Listen to Deriv Auth changes to isolate user tenant
  useEffect(() => {
    if (!mounted) return;
    const unsubAuth = derivClient.onAuth((auth) => {
      if (auth && auth.loginid) {
        const tenantProfile: UserTenantProfile = {
          userId: auth.loginid,
          loginId: auth.loginid,
          fullName: auth.fullname || `Deriv Trader (${auth.loginid})`,
          email: auth.email || `${auth.loginid.toLowerCase()}@deriv.com`,
          currency: auth.currency || 'USD',
          balance: auth.balance || 10000.00,
          equity: auth.balance ? auth.balance + 0.00 : 10000.00
        };
        multiUserDb.saveUserProfile(tenantProfile);
        setCurrentUser(tenantProfile);

        // Load isolated user data
        setPositions(multiUserDb.getPositions(tenantProfile.userId));
        setOrders(multiUserDb.getOrders(tenantProfile.userId));
        setRiskEvents(multiUserDb.getRiskEvents(tenantProfile.userId));
        setLogs(multiUserDb.getSystemLogs(tenantProfile.userId));
        setStrategyConfig(multiUserDb.getStrategyConfig(tenantProfile.userId));
        setAccountBalance(tenantProfile.balance);
        setAccountEquity(tenantProfile.equity);
      }
    });

    return () => {
      unsubAuth();
    };
  }, [mounted]);

  // Save changes to multi-user database store
  useEffect(() => {
    if (!mounted) return;
    multiUserDb.savePositions(currentUser.userId, positions);
  }, [positions, currentUser.userId, mounted]);

  useEffect(() => {
    if (!mounted) return;
    multiUserDb.saveOrders(currentUser.userId, orders);
  }, [orders, currentUser.userId, mounted]);

  useEffect(() => {
    if (!mounted) return;
    multiUserDb.saveRiskEvents(currentUser.userId, riskEvents);
  }, [riskEvents, currentUser.userId, mounted]);

  useEffect(() => {
    if (!mounted) return;
    multiUserDb.saveSystemLogs(currentUser.userId, logs);
  }, [logs, currentUser.userId, mounted]);

  useEffect(() => {
    if (!mounted) return;
    multiUserDb.saveStrategyConfig(currentUser.userId, strategyConfig);
  }, [strategyConfig, currentUser.userId, mounted]);

  // Live price tick simulation when RUNNING
  useEffect(() => {
    if (!mounted || status !== 'RUNNING') return;

    const interval = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const changePercent = (Math.random() - 0.48) * 0.004;
          const newPrice = +(asset.price * (1 + changePercent)).toFixed(2);
          const newBid = +(newPrice - 0.02).toFixed(2);
          const newAsk = +(newPrice + 0.02).toFixed(2);

          return {
            ...asset,
            price: newPrice,
            bid: newBid,
            ask: newAsk,
            change24h: +(asset.change24h + changePercent * 10).toFixed(2)
          };
        })
      );

      setPositions((prevPositions) =>
        prevPositions.map((pos) => {
          const matchingAsset = assets.find((a) => a.symbol === pos.symbol);
          const currentPrice = matchingAsset ? matchingAsset.price : pos.currentPrice;
          const priceDiff = currentPrice - pos.entryPrice;
          const unrealizedPnl = +(priceDiff * pos.quantity).toFixed(2);
          const unrealizedPnlPercent = +((priceDiff / pos.entryPrice) * 100).toFixed(2);

          return {
            ...pos,
            currentPrice,
            unrealizedPnl,
            unrealizedPnlPercent
          };
        })
      );

      const unrealizedSum = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
      setAccountEquity(+(accountBalance + unrealizedSum).toFixed(2));
      setDailyPnl(+unrealizedSum.toFixed(2));
    }, 3500);

    return () => clearInterval(interval);
  }, [status, assets, positions, accountBalance, mounted]);

  // Handle Manual Order Execution / Simulation
  const handleExecuteManualOrder = (symbol: string, side: 'BUY' | 'SELL', qty: number) => {
    const targetAsset = assets.find((a) => a.symbol === symbol);
    if (!targetAsset) return;

    const notionalValue = targetAsset.price * qty;

    if (notionalValue > strategyConfig.maxPositionSize) {
      const newRiskEvent: RiskEvent = {
        id: `risk_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        symbol,
        actionRequested: `${side} ${qty} shares ($${notionalValue.toFixed(2)})`,
        status: 'REJECTED',
        reason: `Risk Manager vetoed for [${currentUser.userId}]: Notional value exceeds max position limit ($${strategyConfig.maxPositionSize}).`,
        accountEquity,
        riskLimitApplied: 'Max Position Size Limit'
      };
      setRiskEvents([newRiskEvent, ...riskEvents]);
      const newLog: SystemLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'RISK',
        source: 'RISK_MANAGER',
        message: `Vetoed order for ${symbol}: Exceeds max position size.`
      };
      setLogs([newLog, ...logs]);
      return;
    }

    // Execute order
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      brokerOrderId: `DRV-${Math.floor(100000 + Math.random() * 900000)}`,
      assetId: targetAsset.id,
      symbol: targetAsset.symbol,
      side,
      quantity: qty,
      orderType: 'MARKET',
      requestedPrice: targetAsset.price,
      submittedAt: new Date().toLocaleTimeString(),
      status: 'FILLED',
      filledPrice: targetAsset.price,
      filledQuantity: qty
    };

    const newPosition: Position = {
      id: `pos_${Date.now()}`,
      assetId: targetAsset.id,
      symbol: targetAsset.symbol,
      quantity: qty,
      entryPrice: targetAsset.price,
      currentPrice: targetAsset.price,
      stopLoss: +(targetAsset.price * (1 - (strategyConfig.stopLossPercent / 100))).toFixed(2),
      takeProfit: +(targetAsset.price * (1 + (strategyConfig.takeProfitPercent / 100))).toFixed(2),
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      status: 'OPEN',
      openedAt: new Date().toLocaleTimeString()
    };

    const cost = notionalValue * 0.1; // Margin
    setAccountBalance(prev => +(prev - (side === 'BUY' ? cost : 0)).toFixed(2));
    setOrders([newOrder, ...orders]);
    setPositions([newPosition, ...positions]);

    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'SUCCESS',
      source: 'ORDER_ENGINE',
      message: `Successfully executed ${side} ${qty} ${targetAsset.symbol} @ $${targetAsset.price}`
    };
    setLogs([newLog, ...logs]);
  };

  const handleClosePosition = (positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;

    const realizedPnl = pos.unrealizedPnl;
    setAccountBalance(prev => +(prev + realizedPnl + (pos.quantity * pos.entryPrice * 0.1)).toFixed(2));
    setPositions(positions.filter(p => p.id !== positionId));

    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      source: 'ORDER_ENGINE',
      message: `Closed position ${pos.symbol}. Realized P&L: $${realizedPnl.toFixed(2)}`
    };
    setLogs([newLog, ...logs]);
  };

  const handleEmergencyFlatten = () => {
    setPositions([]);
    setAccountBalance(accountEquity);
    setIsEmergencyModalOpen(false);
    const newRiskEvent: RiskEvent = {
      id: `risk_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      symbol: 'ALL',
      actionRequested: 'EMERGENCY_FLATTEN_ALL',
      status: 'APPROVED',
      reason: 'Manual emergency kill switch activated by user.',
      accountEquity,
      riskLimitApplied: 'Kill Switch'
    };
    setRiskEvents([newRiskEvent, ...riskEvents]);
    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'RISK',
      source: 'RISK_MANAGER',
      message: 'Emergency flatten executed. All positions closed.'
    };
    setLogs([newLog, ...logs]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-orange-500 animate-bounce"></div>
          <span className="font-mono text-sm">Loading Algorun AI Terminal & Deriv Broker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar 
        status={status}
        mode={mode}
        onStatusChange={setStatus}
        onModeChange={setMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accountBalance={accountBalance}
        accountEquity={accountEquity}
        dailyPnl={dailyPnl}
        onEmergencyStop={() => setIsEmergencyModalOpen(true)}
      />

      {/* Deriv Broker & OAuth Connection Banner */}
      <div className="max-w-7xl w-full mx-auto px-4 pt-4">
        <DerivBrokerWidget />
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <DashboardView 
            assets={assets}
            positions={positions}
            orders={orders}
            riskEvents={riskEvents}
            logs={logs}
            strategyConfig={strategyConfig}
            onExecuteManualOrder={handleExecuteManualOrder}
            onClosePosition={handleClosePosition}
          />
        )}
        {activeTab === 'strategy' && (
          <MlStrategyView 
            strategyConfig={strategyConfig}
            onUpdateStrategyConfig={setStrategyConfig}
          />
        )}
        {activeTab === 'risk' && (
          <RiskManagementView 
            riskEvents={riskEvents}
            strategyConfig={strategyConfig}
            onUpdateRiskConfig={setStrategyConfig}
          />
        )}
        {activeTab === 'backtest' && (
          <BacktestView />
        )}
        {activeTab === 'analyst' && (
          <AiAnalystView 
            assets={assets}
            strategyConfig={strategyConfig}
          />
        )}
        {activeTab === 'db' && (
          <DatabaseInspector 
            assets={assets}
            positions={positions}
            orders={orders}
            riskEvents={riskEvents}
            logs={logs}
          />
        )}
      </main>

      {/* Emergency Modal */}
      <EmergencyModal 
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmKillSwitch={handleEmergencyFlatten}
      />

    </div>
  );
}
