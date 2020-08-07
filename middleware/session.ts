import type { HandlerFunc, MiddlewareFunc, Context } from "../mod.ts";
import type { Skipper } from "./skipper.ts";
import { DefaultSkipper } from "./skipper.ts";
import type { SameSite } from "../vendor/https/deno.land/std/http/cookie.ts";

export const DefaultSessionConfig: SessionConfig = {
  key: "abc.session",
  skipper: DefaultSkipper,
  cookieOptions: {},
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
        // TODO: Check `path option` with path sessions
        c.setCookie(
          { name: sessionKey, value: c.session.sessionID, path: "/", ...config.cookieOptions },
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
  #store: SessionMemoryStore;
  sessionID: string;

  constructor(store: SessionMemoryStore, sessionID?: string) {
    this.#store = store;
    this.sessionID = sessionID ? sessionID : Session.generateID();
  }

  init() {
    if (!this.#store.sessionExists(this.sessionID)) {
      this.#store.createSession(this.sessionID);
    }
  }

  get(key: string): any {
    return this.#store.getValue(this.sessionID, key);
  }

  all(): SessionData | undefined {
    return this.#store.getSession(this.sessionID);
  }

  set(key: string, value: any) {
    this.#store.setValue(this.sessionID, key, value);
  }

  destroy() {
    this.#store.deleteSession(this.sessionID);
  }

  reset() {
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
  #sessions: Sessions = {};

  sessionExists(sessionID: string): boolean {
    return Object.keys(this.#sessions).includes(sessionID);
  }

  getSession(sessionID: string): SessionData | undefined {
    if (this.sessionExists(sessionID)) {
      return this.#sessions[sessionID];
    }
    return undefined;
  }

  createSession(sessionID: string) {
    this.#sessions[sessionID] = {};
  }

  deleteSession(sessionID: string) {
    if (this.sessionExists(sessionID)) {
      delete this.#sessions[sessionID];
    }
  }

  setValue(sessionID: string, key: string, value: any) {
    if (this.sessionExists(sessionID)) {
      this.#sessions[sessionID][key] = value;
    }
  }

  getValue(sessionID: string, key: string): any | undefined {
    if (this.sessionExists(sessionID)) {
      return this.#sessions[sessionID][key];
    }
    return undefined;
  }
}

export interface SessionConfig {
  key?: string;
  skipper?: Skipper;
  cookieOptions: CookieOptions;
}

export type SessionData = Record<string, any>;
export type Sessions = Record<string, SessionData>;
export type CookieOptions = {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: SameSite;
  unparsed?: string[];
}