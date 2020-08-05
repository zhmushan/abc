import type { HandlerFunc, MiddlewareFunc, Context } from "../mod.ts";
import type { Skipper } from "./skipper.ts";
import { DefaultSkipper } from "./skipper.ts";

export const DefaultSessionConfig: SessionConfig = {
  key: "abc.session",
  skipper: DefaultSkipper,
};

export function session(
  config: SessionConfig = DefaultSessionConfig,
): MiddlewareFunc {
  const store = new SessionMemoryStore();
  return (next: HandlerFunc): HandlerFunc => {
    const sessionKey = config.key || DefaultSessionConfig.key!;
    const skipper = config.skipper || DefaultSessionConfig.skipper!;

    return (c: Context) => {
      if (skipper(c)) {
        return next(c);
      }

      const sid = c.cookies[sessionKey];
      if (sid === undefined || !store.sessionExists(sid)) {
        c.session = new Session(store);
        c.setCookie(
          { name: sessionKey, value: c.session.sessionID, path: "/" },
        );
        c.session.init();
      } else {
        c.session = new Session(store, sid);
      }

      return next(c);
    };
  };
}

export class Session {
  private store: SessionMemoryStore;
  public sessionID: string;

  constructor(store: SessionMemoryStore, sessionID?: string) {
    this.store = store;
    this.sessionID = sessionID ? sessionID : Session.generateID();
  }

  public init() {
    if (!this.store.sessionExists(this.sessionID)) {
      this.store.createSession(this.sessionID);
    }
  }

  public get(key: string): any {
    return this.store.getValue(this.sessionID, key);
  }

  public all(): SessionData | undefined {
    return this.store.getSession(this.sessionID);
  }

  public set(key: string, value: any) {
    this.store.setValue(this.sessionID, key, value);
  }

  public destroy() {
    this.store.deleteSession(this.sessionID);
  }

  public reset() {
    this.destroy();
    this.init();
  }

  private static generateID(): string {
    const values = new Uint8Array(64 / 2);
    crypto.getRandomValues(values);
    return Array.from(
      values,
      (dec) => ("0" + dec.toString(36)).substr(-2),
    ).join("");
  }
}

export class SessionMemoryStore {
  private sessions: Sessions = {};

  public sessionExists(sessionID: string): boolean {
    return Object.keys(this.sessions).includes(sessionID);
  }

  public getSession(sessionID: string): SessionData | undefined {
    if (this.sessionExists(sessionID)) {
      return this.sessions[sessionID];
    }
    return undefined;
  }

  public createSession(sessionID: string) {
    this.sessions[sessionID] = {};
  }

  public deleteSession(sessionID: string) {
    if (this.sessionExists(sessionID)) {
      delete this.sessions[sessionID];
    }
  }

  public setValue(sessionID: string, key: string, value: any) {
    if (this.sessionExists(sessionID)) {
      this.sessions[sessionID][key] = value;
    }
  }

  public getValue(sessionID: string, key: string): any | undefined {
    if (this.sessionExists(sessionID)) {
      return this.sessions[sessionID][key];
    }
    return undefined;
  }
}

export interface SessionConfig {
  key?: string;
  skipper?: Skipper;
}

export type SessionData = Record<string, any>;
export type Sessions = Record<string, SessionData>;
