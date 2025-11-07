import { test } from "@playwright/test";

export class HeartbeatService {
  constructor(request, baseURL, getToken) {
    this.request = request;
    this.baseURL = baseURL;
    this.getToken = getToken;
  }

  _headers(extra = {}) {
    const token = typeof this.token === "function" ? this.token() : this.token;
    return {
      "Content-Type": "application/json",
      ...(token ? { "x-challenger": token } : {}),
      ...extra,
    };
  }

  setToken(token) {
    this.token = token;
  }

  async deleteHeartbeat() {
    const response = await this.request.delete(`${this.baseURL}/heartbeat`, {
      headers: this._headers()
    });
    let body;
    try { body = await response.json(); } catch { body = null; }

    return {
      status: response.status(),
      data: body,
      headers: response.headers()
    };
  }

  async patchHeartbeat() {
    const response = await this.request.patch(`${this.baseURL}/heartbeat`, {
      headers: this._headers()
    });
    let body;
    try { body = await response.json(); } catch { body = null; }

    return {
      status: response.status(),
      data: body,
      headers: response.headers()
    };
  }
}
