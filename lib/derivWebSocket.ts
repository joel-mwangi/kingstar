/**
 * Deriv WebSocket & API Client
 * Handles real-time market ticks, authorization, and trade execution.
 * Supports public market data streaming (wss://api.derivws.com/trading/v1/options/ws/public),
 * demo, and real OTP-authenticated channels.
 */

export interface DerivTick {
  symbol: string;
  quote: number;
  time: number;
}

export interface DerivAccount {
  acct: string;
  currency: string;
  is_virtual: number;
  token: string;
  balance?: number;
}

export class DerivWebSocketClient {
  private ws: WebSocket | null = null;
  private appId = '34yEbiGrjbggKPYwNs9kA';
  public isConnected = false;
  public isAuthorized = false;
  private authListeners: ((auth: any) => void)[] = [];
  private tickListeners: ((tick: DerivTick) => void)[] = [];

  public connect(onOpen?: () => void, customUrl?: string) {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }

    const wsUrl = customUrl || `wss://ws.derivws.com/websockets/v3?app_id=${this.appId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.isConnected = true;
      if (onOpen) onOpen();
      
      const token = localStorage.getItem('deriv_active_token');
      if (token && !customUrl) {
        this.authorize(token);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.msg_type === 'authorize') {
          if (data.authorize) {
            this.isAuthorized = true;
            localStorage.setItem('deriv_active_acct', data.authorize.loginid);
            this.authListeners.forEach(fn => fn(data.authorize));
          }
        }
        if (data.msg_type === 'tick' && data.tick) {
          const tick: DerivTick = {
            symbol: data.tick.symbol,
            quote: data.tick.quote,
            time: data.tick.epoch
          };
          this.tickListeners.forEach(fn => fn(tick));
        }
      } catch (e) {}
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.isAuthorized = false;
    };

    this.ws.onerror = () => {
      this.isConnected = false;
    };
  }

  public connectPublic(onOpen?: () => void) {
    this.connect(onOpen, 'wss://api.derivws.com/trading/v1/options/ws/public');
  }

  public connectWithOtpUrl(otpUrl: string, onOpen?: () => void) {
    this.connect(onOpen, otpUrl);
  }

  public authorize(token: string) {
    localStorage.setItem('deriv_active_token', token);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ authorize: token }));
    }
  }

  public subscribeTicks(symbol: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    }
  }

  public logout() {
    localStorage.removeItem('deriv_active_token');
    localStorage.removeItem('deriv_active_acct');
    this.isAuthorized = false;
    if (this.ws) {
      this.ws.send(JSON.stringify({ logout: 1 }));
    }
    window.location.reload();
  }

  public onAuth(fn: (auth: any) => void) {
    this.authListeners.push(fn);
    return () => {
      this.authListeners = this.authListeners.filter(f => f !== fn);
    };
  }

  public onTick(fn: (tick: DerivTick) => void) {
    this.tickListeners.push(fn);
    return () => {
      this.tickListeners = this.tickListeners.filter(f => f !== fn);
    };
  }
}

export const derivClient = new DerivWebSocketClient();
