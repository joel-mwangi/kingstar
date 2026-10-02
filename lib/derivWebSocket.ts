export interface DerivAccount {
  acct: string;
  currency: string;
  account_type: string;
  balance: number;
  is_virtual: number;
}

export interface DerivTick {
  symbol: string;
  quote: number;
  time: number;
}

export interface DerivPortfolioContract {
  contract_id: number | string;
  contract_type: string;
  underlying_symbol: string;
  buy_price?: number | string;
  bid_price?: number | string;
  payout?: number | string;
  profit?: number | string;
  date_start?: number | string;
  date_expiry?: number | string;
}

export interface DerivProposal {
  id?: string;
  ask_price?: number | string;
  payout?: number | string;
  spot?: number | string;
}

type PendingRequest = {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class DerivWebSocketClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pending = new Map<number, PendingRequest>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private publicConnection = false;
  private subscriptions = new Set<string>();

  public isConnected = false;
  public isAuthorized = false;

  private tickListeners: Array<(tick: DerivTick) => void> = [];
  private statusListeners: Array<(state: { connected: boolean; authorized: boolean }) => void> = [];

  connectPublic(): void {
    this.open('wss://api.derivws.com/trading/v1/options/ws/public', true);
  }

  connectAuthenticated(wsUrl: string): void {
    this.open(wsUrl, false);
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;

    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Deriv WebSocket disconnected.'));
    }
    this.pending.clear();

    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
    this.isAuthorized = false;
    this.notifyStatus();
  }

  private open(url: string, publicConnection: boolean): void {
    this.disconnect();
    this.publicConnection = publicConnection;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.isConnected = true;
      this.isAuthorized = !publicConnection;
      this.notifyStatus();

      for (const symbol of this.subscriptions) {
        try {
          this.send({ ticks: symbol, subscribe: 1 });
        } catch {
          // Connection will be retried if this is the public channel.
        }
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const reqId = typeof data.req_id === 'number' ? data.req_id : undefined;

        if (data.error && reqId && this.pending.has(reqId)) {
          const pending = this.pending.get(reqId)!;
          clearTimeout(pending.timer);
          this.pending.delete(reqId);
          pending.reject(new Error(data.error.message || 'Deriv API error'));
          return;
        }

        if (data.msg_type === 'tick' && data.tick) {
          const quote = Number(data.tick.quote);
          if (Number.isFinite(quote)) {
            this.tickListeners.forEach((listener) =>
              listener({
                symbol: String(data.tick.symbol),
                quote,
                time: Number(data.tick.epoch || Date.now() / 1000),
              })
            );
          }
        }

        if (reqId && this.pending.has(reqId)) {
          const pending = this.pending.get(reqId)!;
          clearTimeout(pending.timer);
          this.pending.delete(reqId);
          pending.resolve(data);
        }
      } catch {
        // Ignore malformed provider messages.
      }
    };

    ws.onclose = () => {
      this.isConnected = false;
      this.isAuthorized = false;
      this.notifyStatus();

      if (this.publicConnection && !this.reconnectTimer) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.open('wss://api.derivws.com/trading/v1/options/ws/public', true);
        }, 1500);
      }
    };

    ws.onerror = () => {
      this.isConnected = false;
      this.notifyStatus();
    };
  }

  private send(payload: Record<string, unknown>): number {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Deriv WebSocket is not connected.');
    }
    const reqId = ++this.requestId;
    this.ws.send(JSON.stringify({ ...payload, req_id: reqId }));
    return reqId;
  }

  request<T = any>(payload: Record<string, unknown>, timeoutMs = 12000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let reqId: number;
      try {
        reqId = this.send(payload);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Deriv WebSocket is not connected.'));
        return;
      }

      const timer = setTimeout(() => {
        this.pending.delete(reqId);
        reject(new Error('Deriv request timed out.'));
      }, timeoutMs);

      this.pending.set(reqId, { resolve, reject, timer });
    });
  }

  subscribeTicks(symbol: string): void {
    this.subscriptions.add(symbol);
    if (this.isConnected) {
      try {
        this.send({ ticks: symbol, subscribe: 1 });
      } catch {
        // Subscription will be restored after reconnect.
      }
    }
  }

  async getTickHistory(symbol: string, count: number, granularity = 3600): Promise<Array<{ time: number; close: number }>> {
    let remaining = Math.min(Math.max(1, count), 5000);
    let end = 'latest';
    const collected = new Map<number, number>();

    while (remaining > 0) {
      const chunk = Math.min(1000, remaining);
      const response = await this.request<any>({
        ticks_history: symbol,
        count: chunk,
        end,
        style: 'candles',
        granularity,
        subscribe: 0,
      });
      const candles = Array.isArray(response?.candles) ? response.candles : [];
      if (!candles.length) break;

      for (const candle of candles) {
        const time = Number(candle.epoch);
        const close = Number(candle.close);
        if (Number.isFinite(time) && Number.isFinite(close)) collected.set(time, close);
      }

      const oldest = candles.reduce(
        (min: number, candle: any) => Math.min(min, Number(candle.epoch)),
        Number.POSITIVE_INFINITY
      );

      if (!Number.isFinite(oldest) || candles.length < chunk) break;
      end = String(Math.max(0, oldest - 1));
      remaining -= candles.length;
    }

    return [...collected.entries()]
      .sort(([a], [b]) => a - b)
      .map(([time, close]) => ({ time, close }));
  }

  async getPortfolio(): Promise<DerivPortfolioContract[]> {
    const response = await this.request<any>({ portfolio: 1 });
    return Array.isArray(response?.portfolio?.contracts) ? response.portfolio.contracts : [];
  }

  async getBalance(): Promise<number | null> {
    const response = await this.request<any>({ balance: 1, subscribe: 0 });
    const value = Number(response?.balance?.balance);
    return Number.isFinite(value) ? value : null;
  }

  async getProposal(input: {
    symbol: string;
    contractType: 'CALL' | 'PUT';
    currency: string;
    amount: number;
    duration: number;
    durationUnit: 's' | 'm' | 'h';
  }): Promise<DerivProposal> {
    const response = await this.request<any>({
      proposal: 1,
      amount: input.amount,
      basis: 'stake',
      contract_type: input.contractType,
      currency: input.currency,
      duration: input.duration,
      duration_unit: input.durationUnit,
      underlying_symbol: input.symbol,
      subscribe: 0,
    });
    return response?.proposal || {};
  }

  async buyProposal(proposalId: string, price: number): Promise<any> {
    const response = await this.request<any>({ buy: proposalId, price });
    return response?.buy;
  }

  async sellContract(contractId: number, price = 0): Promise<any> {
    const response = await this.request<any>({ sell: contractId, price });
    return response?.sell;
  }

  onTick(listener: (tick: DerivTick) => void): () => void {
    this.tickListeners.push(listener);
    return () => {
      this.tickListeners = this.tickListeners.filter((item) => item !== listener);
    };
  }

  onStatus(listener: (state: { connected: boolean; authorized: boolean }) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((item) => item !== listener);
    };
  }

  private notifyStatus(): void {
    const state = { connected: this.isConnected, authorized: this.isAuthorized };
    this.statusListeners.forEach((listener) => listener(state));
  }
}

export const derivClient = new DerivWebSocketClient();
