import { test } from "@playwright/test";
import { parseStringPromise } from "xml2js";

export class TodosService {
  constructor(request, baseURL, token = null) {
    this.request = request;
    this.baseURL = baseURL;
    this.token = token; // токен может быть null
  }

  // Формируем заголовки с токеном
  _headers(extraHeaders = {}) {
    return {
      "Content-Type": extraHeaders["Content-Type"] || "application/json",
      ...(this.token ? { "x-challenger": this.token } : {}),
      ...extraHeaders,
    };
  }

  // Позволяет динамически устанавливать токен
  setToken(token) {
    this.token = token;
  }

  async createTodo(todoData, extraHeaders = {}) {
    const response = await this.request.post(`${this.baseURL}/todos`, {
      headers: this._headers(extraHeaders),
      data: todoData,
    });

    let body;
    const contentType = response.headers()["content-type"];
    const text = await response.text();

    if (contentType?.includes("application/json")) {
      body = text ? JSON.parse(text) : null;              
    } else if (contentType?.includes("application/xml")) {
      body = text ? await parseStringPromise(text, { explicitArray: false }) : null;
    } else {
      body = text;         
    }
    
    return {
      status: response.status(),
      data: body,
      headers: response.headers()
    };
  }

  async getTodos(options = {}) {
    return test.step("GET /todos", async () => {
      const response = await this.request.get(`${this.baseURL}/todos`, {
        headers: this._headers(options.headers),
        params: options.params,
      });

      let body;
      const contentType = response.headers()["content-type"];
      if (contentType.includes("application/json")) {
        body = await response.json();
      } else if (contentType.includes("application/xml")) {
        const text = await response.text();
        body = await parseStringPromise(text);
      } else {
        body = await response.text();
      }

      return { status: response.status(), data: body, headers: response.headers() };
    });
  }

  async getTodoById(id) {
    return test.step(`GET /todos/${id}`, async () => {
      const response = await this.request.get(`${this.baseURL}/todos/${id}`, {
        headers: this._headers(),
      });
      let body = null;
      try { body = await response.json(); } catch {}
      return { status: response.status(), data: body };
    });
  }

  async getTodoInvalidEndpoint() {
    return test.step("GET /todo/", async () => {
      const response = await this.request.get(`${this.baseURL}/todo/`, {
        headers: this._headers(),
      });
      let body = null;
      try { body = await response.json(); } catch {}
      return { status: response.status(), data: body };
    });
  }

  async deleteTodo(id) {
    return test.step(`DELETE /todos/${id}`, async () => {
      const response = await this.request.delete(`${this.baseURL}/todos/${id}`, {
        headers: this._headers(),
      });
      return { status: response.status() };
    });
  }

  async headTodos(params = {}) {
    return test.step("HEAD /todos", async () => {
      const response = await this.request.head(`${this.baseURL}/todos`, {
        headers: this._headers(),
        params,
      });
      return { status: response.status(), headers: response.headers() };
    });
  }

  async optionsTodos(data = {}) {
    return test.step("OPTIONS /todos", async () => {
      const response = await this.request.fetch(`${this.baseURL}/todos`, {
        method: "OPTIONS",
        headers: this._headers(),
        data,
      });
      return { status: response.status(), headers: response.headers() };
    });
  }

  async postUpdateTodo(id, data) {
    return test.step(`POST /todos/${id}`, async () => {
      const response = await this.request.post(`${this.baseURL}/todos/${id}`, {
        headers: this._headers(),
        data,
      });
      const body = await response.json();
      return { status: response.status(), data: body };
    });
  }

  async putTodo(id, data) {
    return test.step(`PUT /todos/${id}`, async () => {
      const response = await this.request.put(`${this.baseURL}/todos/${id}`, {
        headers: this._headers(),
        data,
      });
      const body = await response.json();
      return { status: response.status(), data: body };
    });
  }
}
