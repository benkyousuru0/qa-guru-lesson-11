import { ChallengerService, TodosService, HeartbeatService } from "./index.js";

export class Api {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;

    this.challenger = new ChallengerService(request, baseURL);
    this.todos = new TodosService(request, baseURL);
    this.heartbeat = new HeartbeatService(request, baseURL);
  }

  setToken(token) {
    this.token = token;
    this.challenger.setToken(token);
    this.todos.setToken(token);
    this.heartbeat.setToken(token);
  }
}
