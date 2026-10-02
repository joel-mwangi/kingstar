'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Asset,
  BotStatus,
  Order,
  Position,
  RiskEvent,
  StrategyConfig,
  SystemLog,
  TradeSide,
  TradingMode,
} from '@/types/trading';
import { initialAssets } from '@/lib/marketData';
import { derivClient } from '@/lib/derivWebSocket';
import { updateAsset } from '@/lib/signalEngine';
import { createPaperPosition, markPaperPosition } from '@/lib/paperEngine';
import { validateEntry } from '@/lib/riskEngine';
import { DEFAULT_STRATEGY, multiUserDb, PAPER_STARTING_BALANCE, UserTenantProfile } from '@/lib/multiUserDb';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { MlStrategyView } from '@/components/MlStrategyView';
import { RiskManagementView } from '@/components/RiskManagementView';
import { BacktestView } from '@/components/BacktestView';
import { DatabaseInspector } from '@/components/DatabaseInspector';
import { AiAnalystView } from '@/components/AiAnalystView';
import { EmergencyModal } from '@/components/EmergencyModal';
import { DerivBrokerWidget } from '@/components/DerivBrokerWidget';

function newId(prefix: string): string {
  return prefix + '_' + crypto.randomUUID();
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<BotStatus>('PAUSED');
  const [mode, setMode] = useState<TradingMode>('PAPER');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [realTradingArmed, setRealTradingArmed] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [realizedSessionPnl, setRealizedSessionPnl] = useState(0);

  const [currentUser, setCurrentUser] = useState<UserTenantProfile>({
    userId: '',
    loginId: 'UNAUTHENTICATED',
    fullName: 'Deriv Trader',
    email: '',
    currency: 'USD',
    balance: 0,
    equity: 0,
  });

  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>(DEFAULT_STRATEGY);
  const [accountBalance, setAccountBalance] = useState(0);
  const [brokerEquity, setBrokerEquity] = useState(0);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const openProfit = useMemo(
    () => positions.reduce((sum, position) => sum + position.profit, 0),
    [positions]
  );
  const sessionPnl = realizedSessionPnl + openProfit;
  const accountEquity = mode === 'PAPER' ? accountBalance + openProfit : brokerEquity;

  useEffect(() => {
    let active = true;

    const boot = async () => {
      try {
        const state = await multiUserDb.initialize();
        if (!active) return;

        setCurrentUser(state.profile);
        setIsAdminUser(state.isAdmin);
        setPositions(state.positions.filter((item) => item.status === 'OPEN'));
        setOrders(state.orders);
        setRiskEvents(state.riskEvents);
        setLogs(state.logs);
        setStrategyConfig(state.strategyConfig);
        setAccountBalance(state.profile.balance);
        setBrokerEquity(state.profile.equity);
      } catch (bootError) {
        if (active) {
          setError(
            bootError instanceof Error
              ? bootError.message
              : 'Secure application session failed.'
          );
        }
      } finally {
        if (active) setReady(true);
      }
    };

    void boot();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const offTick = derivClient.onTick((tick) => {
      setAssets((previous) =>
        previous.map((asset) =>
          asset.symbol === tick.symbol ? updateAsset(asset, tick.quote, tick.time) : asset
        )
      );

      setPositions((previous) =>
        previous.map((position) =>
          position.source === 'PAPER' && position.symbol === tick.symbol
            ? markPaperPosition(position, tick.quote)
            : position
        )
      );
    });

    return offTick;
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (!ready || !derivClient.isAuthorized || (mode !== 'DEMO' && mode !== 'REAL')) return;

      try {
        const [balance, contracts] = await Promise.all([
          derivClient.getBalance(),
          derivClient.getPortfolio(),
        ]);

        const livePositions: Position[] = contracts.map((contract) => {
          const buyPrice = Number(contract.buy_price ?? 0);
          const bidPrice = Number(contract.bid_price ?? buyPrice);
          const profit = Number(contract.profit ?? 0);
          const payout = Number(contract.payout ?? buyPrice);

          return {
            id: 'deriv_' + String(contract.contract_id),
            contractId: Number(contract.contract_id),
            assetId: 'deriv_' + String(contract.underlying_symbol).toLowerCase(),
            symbol: String(contract.underlying_symbol),
            contractType: contract.contract_type === 'PUT' ? 'PUT' : 'CALL',
            stake: buyPrice,
            entryPrice: buyPrice,
            currentValue: Math.max(0, bidPrice),
            payout,
            profit,
            profitPercent: buyPrice > 0 ? (profit / buyPrice) * 100 : 0,
            status: 'OPEN',
            openedAt: new Date(Number(contract.date_start ?? Date.now() / 1000) * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'DERIV',
          };
        });

        setPositions(livePositions);

        if (balance !== null) {
          setAccountBalance(balance);
          setBrokerEquity(balance + livePositions.reduce((sum, position) => sum + position.profit, 0));
        }
      } catch {
        const log: SystemLog = {
          id: newId('log'),
          timestamp: new Date().toISOString(),
          level: 'WARN',
          source: 'BROKER',
          message: 'Broker reconciliation failed temporarily; cached positions were not replaced with guessed data.',
        };
        setLogs((previous) => [log, ...previous].slice(0, 300));
        if (currentUser.userId) void multiUserDb.saveSystemLog(currentUser.userId, log);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentUser.userId, mode, ready]);

  async function addRiskEvent(event: RiskEvent) {
    setRiskEvents((previous) => [event, ...previous].slice(0, 200));
    if (currentUser.userId) await multiUserDb.saveRiskEvent(currentUser.userId, event);
  }

  async function addLog(log: SystemLog) {
    setLogs((previous) => [log, ...previous].slice(0, 300));
    if (currentUser.userId) await multiUserDb.saveSystemLog(currentUser.userId, log);
  }

  const handleAccountAuthorized = async (account: {
    loginid?: string;
    fullname?: string;
    currency?: string;
    balance?: number;
    isVirtual?: boolean;
  }) => {
    if (!currentUser.userId) return;

    const profile: UserTenantProfile = {
      ...currentUser,
      loginId: account.loginid || currentUser.loginId,
      fullName: account.fullname || currentUser.fullName,
      currency: account.currency || currentUser.currency,
      balance: Number.isFinite(account.balance) ? Number(account.balance) : currentUser.balance,
      equity: Number.isFinite(account.balance) ? Number(account.balance) : currentUser.equity,
      derivAccountId: account.loginid || currentUser.derivAccountId,
      derivAccountIsVirtual:
        typeof account.isVirtual === 'boolean'
          ? account.isVirtual
          : currentUser.derivAccountIsVirtual,
    };

    setCurrentUser(profile);
    setAccountBalance(profile.balance);
    setBrokerEquity(profile.equity);
    await multiUserDb.updateProfile(profile);
  };

  const handleExecute = async (symbol: string, side: TradeSide, stake: number) => {
    const asset = assets.find((item) => item.symbol === symbol);
    if (!asset) return;

    const decision = validateEntry(asset, side, stake, {
      status,
      mode,
      equity: accountEquity,
      dailyPnl: sessionPnl,
      strategy: strategyConfig,
      authorized: derivClient.isAuthorized,
      realTradingArmed,
      accountIsVirtual: currentUser.derivAccountIsVirtual,
    });

    const riskEvent: RiskEvent = {
      id: newId('risk'),
      timestamp: new Date().toISOString(),
      symbol,
      actionRequested: side + ' stake ' + stake.toFixed(2),
      status: decision.allowed ? 'APPROVED' : 'REJECTED',
      reason: decision.reason,
      accountEquity,
      riskLimitApplied:
        'max stake $' +
        strategyConfig.maxPositionSize.toFixed(2) +
        ' / max risk ' +
        strategyConfig.maxRiskPerTradePercent.toFixed(2) +
        '% / loss limit $' +
        strategyConfig.maxDailyLoss.toFixed(2),
    };

    await addRiskEvent(riskEvent);

    if (!decision.allowed) {
      await addLog({
        id: newId('log'),
        timestamp: new Date().toISOString(),
        level: 'RISK',
        source: 'RISK_MANAGER',
        message: decision.reason,
      });
      return;
    }

    if (mode === 'PAPER') {
      if (!asset.price) {
        await addLog({
          id: newId('log'),
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          source: 'MARKET_ENGINE',
          message: 'No live quote is available for this instrument yet.',
        });
        return;
      }

      const position = createPaperPosition({
        id: newId('pos'),
        assetId: asset.id,
        symbol: asset.symbol,
        side,
        stake,
        entryPrice: asset.price,
      });

      const order: Order = {
        id: newId('ord'),
        assetId: asset.id,
        symbol: asset.symbol,
        side,
        stake,
        orderType: 'MARKET',
        requestedPrice: asset.price,
        submittedAt: new Date().toISOString(),
        status: 'FILLED',
        filledPrice: asset.price,
        filledQuantity: 1,
      };

      setPositions((previous) => [position, ...previous]);
      setOrders((previous) => [order, ...previous]);

      await multiUserDb.savePosition(currentUser.userId, position);
      await multiUserDb.saveOrder(currentUser.userId, order);
      await addLog({
        id: newId('log'),
        timestamp: new Date().toISOString(),
        level: 'SUCCESS',
        source: 'ORDER_ENGINE',
        message:
          'Paper ' +
          side +
          ' opened on ' +
          symbol +
          ' at ' +
          asset.price +
          ' with stake $' +
          stake.toFixed(2) +
          '.',
      });
      return;
    }

    try {
      const proposal = await derivClient.getProposal({
        symbol,
        contractType: side,
        currency: currentUser.currency || 'USD',
        amount: stake,
        duration: strategyConfig.defaultDuration,
        durationUnit: strategyConfig.defaultDurationUnit,
      });

      const proposalId = proposal.id;
      const askPrice = Number(proposal.ask_price);

      if (!proposalId || !Number.isFinite(askPrice) || askPrice <= 0) {
        throw new Error('Deriv returned an incomplete contract proposal.');
      }

      const buy = await derivClient.buyProposal(proposalId, askPrice);
      const contractId = Number(buy?.contract_id);

      if (!Number.isFinite(contractId)) {
        throw new Error('Deriv did not return a contract ID.');
      }

      const order: Order = {
        id: newId('ord'),
        brokerOrderId: String(buy.transaction_id ?? contractId),
        contractId,
        assetId: asset.id,
        symbol,
        side,
        stake,
        orderType: 'MARKET',
        requestedPrice: askPrice,
        submittedAt: new Date().toISOString(),
        status: 'FILLED',
        filledPrice: askPrice,
        filledQuantity: 1,
      };

      setOrders((previous) => [order, ...previous]);
      await multiUserDb.saveOrder(currentUser.userId, order);
      await addLog({
        id: newId('log'),
        timestamp: new Date().toISOString(),
        level: 'SUCCESS',
        source: 'BROKER',
        message:
          'Deriv contract ' +
          contractId +
          ' opened: ' +
          side +
          ' ' +
          symbol +
          ', stake $' +
          stake.toFixed(2) +
          '.',
      });
    } catch (orderError) {
      const message = orderError instanceof Error ? orderError.message : 'Broker order failed.';
      const failedOrder: Order = {
        id: newId('ord'),
        assetId: asset.id,
        symbol,
        side,
        stake,
        orderType: 'MARKET',
        requestedPrice: asset.price,
        submittedAt: new Date().toISOString(),
        status: 'REJECTED',
        error: message,
      };

      setOrders((previous) => [failedOrder, ...previous]);
      await multiUserDb.saveOrder(currentUser.userId, failedOrder);
      await addLog({
        id: newId('log'),
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        source: 'BROKER',
        message,
      });
    }
  };

  const handleClose = async (position: Position) => {
    if (position.source === 'PAPER') {
      setRealizedSessionPnl((value) => value + position.profit);
      setPositions((previous) => previous.filter((item) => item.id !== position.id));
      await multiUserDb.deletePosition(currentUser.userId, position.id);
      await multiUserDb.saveOrder(currentUser.userId, {
        id: newId('ord'),
        assetId: position.assetId,
        symbol: position.symbol,
        side: 'CLOSE',
        stake: position.stake,
        orderType: 'MARKET',
        submittedAt: new Date().toISOString(),
        status: 'CLOSED',
        filledPrice: position.currentValue,
        filledQuantity: 1,
      });
      await addLog({
        id: newId('log'),
        timestamp: new Date().toISOString(),
        level: 'INFO',
        source: 'ORDER_ENGINE',
        message:
          'Paper ' +
          position.contractType +
          ' closed on ' +
          position.symbol +
          '. P/L $' +
          position.profit.toFixed(2) +
          '.',
      });
      return;
    }

    if (!position.contractId || !derivClient.isAuthorized) return;

    try {
      await derivClient.sellContract(position.contractId, 0);
      setRealizedSessionPnl((value) => value + position.profit);
      setPositions((previous) => previous.filter((item) => item.id !== position.id));
      await multiUserDb.deletePosition(currentUser.userId, position.id);
      await addLog({
        id: newId('log'),
        timestamp: new Date().toISOString(),
        level: 'INFO',
        source: 'BROKER',
        message: 'Deriv contract ' + position.contractId + ' closed at market.',
      });
    } catch (closeError) {
      await addLog({
        id: newId('log'),
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        source: 'BROKER',
        message: closeError instanceof Error ? closeError.message : 'Failed to close broker contract.',
      });
    }
  };

  const handleEmergencyFlatten = async () => {
    setStatus('EMERGENCY_STOP');
    setRealTradingArmed(false);

    const failedContractIds = new Set<number>();
    let targetContractIds: number[] = [];

    if (mode !== 'PAPER' && derivClient.isAuthorized) {
      try {
        const livePortfolio = await derivClient.getPortfolio();
        targetContractIds = livePortfolio
          .map((contract) => Number(contract.contract_id))
          .filter((value) => Number.isFinite(value));
      } catch {
        targetContractIds = positions
          .map((position) => position.contractId)
          .filter((value): value is number => Number.isFinite(value));
      }

      for (const contractId of targetContractIds) {
        try {
          await derivClient.sellContract(contractId, 0);
        } catch {
          failedContractIds.add(contractId);
        }
      }
    }

    if (mode === 'PAPER') {
      for (const position of positions) {
        await multiUserDb.deletePosition(currentUser.userId, position.id);
      }
      setPositions([]);
    } else {
      const remaining = positions.filter(
        (position) => position.contractId && failedContractIds.has(position.contractId)
      );
      for (const position of positions) {
        if (position.contractId && !failedContractIds.has(position.contractId)) {
          await multiUserDb.deletePosition(currentUser.userId, position.id);
        }
      }
      setPositions(remaining);
    }

    const failed = [...failedContractIds];

    await addRiskEvent({
      id: newId('risk'),
      timestamp: new Date().toISOString(),
      symbol: 'ALL',
      actionRequested: 'EMERGENCY_FLATTEN',
      status: failed.length ? 'REJECTED' : 'APPROVED',
      reason: failed.length
        ? 'Kill switch activated, but ' + failed.length + ' broker contract(s) could not be closed and remain visible for reconciliation.'
        : 'Kill switch activated and all targeted broker contracts were closed.',
      accountEquity,
      riskLimitApplied: 'Kill switch',
    });

    await addLog({
      id: newId('log'),
      timestamp: new Date().toISOString(),
      level: failed.length ? 'ERROR' : 'RISK',
      source: 'RISK_MANAGER',
      message: failed.length
        ? 'Kill switch activated with ' + failed.length + ' broker close failure(s).'
        : 'Kill switch activated; new entries are blocked.',
    });

    setIsEmergencyModalOpen(false);
  };

  const updateStrategy = async (value: StrategyConfig) => {
    setStrategyConfig(value);
    await multiUserDb.saveStrategyConfig(currentUser.userId, value);
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center">
        <div className="text-sm text-slate-400">Starting secure application session...</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      <Navbar
        status={status}
        mode={mode}
        onStatusChange={(next) => {
          setStatus(next);
          if (next !== 'RUNNING') setRealTradingArmed(false);
        }}
        onModeChange={(next) => {
          setMode(next);
          setRealTradingArmed(false);
          if (next === 'PAPER') {
            setAccountBalance(PAPER_STARTING_BALANCE);
            setBrokerEquity(PAPER_STARTING_BALANCE + openProfit);
          }
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accountBalance={accountBalance}
        accountEquity={accountEquity}
        dailyPnl={sessionPnl}
        realTradingArmed={realTradingArmed}
        onArmRealTrading={() => setRealTradingArmed((armed) => !armed)}
        onEmergencyStop={() => setIsEmergencyModalOpen(true)}
        isAdmin={isAdminUser}
      />

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <DerivBrokerWidget
          onDerivTick={(tick) => {
            setAssets((previous) =>
              previous.map((asset) =>
                asset.symbol === tick.symbol ? updateAsset(asset, tick.quote, tick.time) : asset
              )
            );
          }}
          onAccountAuthorized={handleAccountAuthorized}
        />
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            assets={assets}
            positions={positions}
            orders={orders}
            riskEvents={riskEvents}
            logs={logs}
            strategyConfig={strategyConfig}
            onExecuteManualOrder={handleExecute}
            onClosePosition={handleClose}
          />
        )}

        {activeTab === 'strategy' && (
          <MlStrategyView strategyConfig={strategyConfig} onUpdateStrategyConfig={updateStrategy} />
        )}

        {activeTab === 'risk' && (
          <RiskManagementView strategyConfig={strategyConfig} riskEvents={riskEvents} onUpdateRiskConfig={updateStrategy} />
        )}

        {activeTab === 'backtest' && <BacktestView />}

        {activeTab === 'analyst' && (
          <AiAnalystView
            assets={assets}
            positions={positions}
            strategyConfig={strategyConfig}
            currentUser={currentUser}
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

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmKillSwitch={() => void handleEmergencyFlatten()}
      />
    </div>
  );
}
