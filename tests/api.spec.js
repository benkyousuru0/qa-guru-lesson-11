import { test, expect, request as pwRequest } from "@playwright/test";
import { parseStringPromise } from "xml2js";
import config from "../playwright.config.js";

import { Api } from "../helpers/services/api.service.js";

import ERRORS from "../helpers/errorMessages.js";
import todosBuilder from "../helpers/builders/todosBuilder.js";

test.describe("Challenger API", () => { 

  let api;
  let token;

  let apiContext;

  test.beforeAll(async () => {
    apiContext = await pwRequest.newContext({ baseURL: config.use.baseURL });
    api = new Api(apiContext, config.use.baseURL);

    const createResp = await api.challenger.createChallenger();
    token = createResp.headers()["x-challenger"];

    api.setToken(token);
  });

  test("02. GET /challenges (200) @get @positive", async () => {
    const response = await api.challenger.getChallenges();
    expect(response.status).toBe(200);

    const body = response.data;
    expect(body.challenges.length).toBe(59);
  });

  test("03. GET /todos (200) @get @positive", async () => {
    const response = await api.todos.getTodos();
    expect(response.status).toBe(200);

    const body = response.data;
    expect(body).toHaveProperty("todos");
  });

  test("04. GET /todo (404) not plural @get @negative", async () => {
    const response = await api.todos.getTodoInvalidEndpoint(); 
    expect(response.status).toBe(404);
  });

  test("05. GET /todos/{id} (200) @get @positive", async () => {
    const response = await api.todos.getTodoById(todosBuilder.existentId);
    expect(response.status).toBe(200);

    const body = response.data;
    expect(body.todos[0]).toHaveProperty("id");
    expect(body.todos[0].id).toBe(2);
    expect(body.todos[0]).toHaveProperty("title");
    expect(body.todos[0]).toHaveProperty("doneStatus");
    expect(body.todos[0]).toHaveProperty("title");
    expect(body.todos[0]).toHaveProperty("description");
  });

  test("06. GET /todos/{id} (404) @get @negative", async () => {
    const randomId = todosBuilder.generateRandomNumberId();
    const response = await api.todos.getTodoById(randomId);;
    expect(response.status).toBe(404);
    expect(response.data.errorMessages).toContain(ERRORS.NOT_FOUND_INSTANCE(randomId));
  });
  
  test("07. GET /todos (200) ?filter @get @positive", async () => {
    const todoData = todosBuilder.createRandomTodo({ doneStatus: true });
    const createResp = await api.todos.createTodo(todoData);
    expect(createResp.status).toBe(201);
    expect(createResp.data.doneStatus).toBe(true);
    const taskID = createResp.data.id;

    const filterParams = todosBuilder.createFilterDone();
    const listResp = await api.todos.getTodos({ params: filterParams });
    expect(listResp.status).toBe(200);
    const todos = listResp.data.todos;
    expect(todos.length).toBeGreaterThan(0);

    let isTaskInList = false;
    for (const todo of todos) {
      expect(todo.doneStatus === true || todo.doneStatus === "true").toBe(true);
      if (todo.id === taskID) {
        isTaskInList = true;
      }
    }
    expect(isTaskInList).toBe(true);
  });

  test("08. HEAD /todos (200) @head @positive", async () => {
    const response = await api.todos.headTodos();
    expect(response.status).toBe(200);

    expect(response.data).toBeUndefined(); 
    expect(response.headers).toHaveProperty("content-type");
    expect(response.headers).toHaveProperty("x-challenger");

  });

  test("09. POST /todos (201) @post @positive", async () => {
    const todoData = todosBuilder.createRandomTodo({ doneStatus: true });
    const response = await api.todos.createTodo(todoData);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("id");
    expect(response.data.title).toBe(todoData.title);
    expect(response.data.doneStatus).toBe(todoData.doneStatus);
  });

  test("10. POST /todos (400) doneStatus @post @negative", async () => {
    const invalidTodoData = todosBuilder.createRandomTodo({ doneStatus: "invalid" });
    const response = await api.todos.createTodo(invalidTodoData);
    expect(response.status).toBe(400);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.DONE_STATUS_TYPE);
  });

  test("11. POST /todos (400) title too long @post @negative", async () => {
    const invalidTodoData = todosBuilder.createRandomTodo({ title: todosBuilder.generateLongString(55) });
    const response = await api.todos.createTodo(invalidTodoData);
    expect(response.status).toBe(400);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.TITLE_LENGTH_EXCEEDED);
  });

  test("12. POST /todos (400) description too long @post @negative", async () => {
    const invalidTodoData = todosBuilder.createRandomTodo({ description: todosBuilder.generateLongString(205) });

    const response = await api.todos.createTodo(invalidTodoData);
    expect(response.status).toBe(400);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.DESCRIPTION_LENGTH_EXCEEDED); 
  });

  test("13. POST /todos (201) max out content @post @positive", async () => {
    const todoData = todosBuilder.createRandomTodo({ 
      title: todosBuilder.generateLongString(50), 
      description: todosBuilder.generateLongString(200) 
    });
    const response = await api.todos.createTodo(todoData);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("id");
    expect(response.data.title).toBe(todoData.title);
    expect(response.data.doneStatus).toBe(todoData.doneStatus);
  });

  test("14. POST /todos (413) content too long @post @negative", async () => {
    const invalidTodoData = todosBuilder.createRandomTodo({ description: todosBuilder.generateLongString(5000) });

    const response = await api.todos.createTodo(invalidTodoData);
    expect(response.status).toBe(413);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.REQUEST_BODY_TOO_LARGE); 
  });

  test("15. POST /todos (400) extra @post @negative", async () => {
    const invalidTodoData = todosBuilder.createRandomTodo({ descriptionTest: todosBuilder.generateLongString(1) });
    const response = await api.todos.createTodo(invalidTodoData);
    expect(response.status).toBe(400);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.COULD_NOT_FIND_FIELD("descriptionTest")); 
  });

  test("16. PUT /todos/{id} (400) @put @negative", async () => {
    const response = await api.todos.putTodo(todosBuilder.generateRandomNumberId(), todosBuilder.createRandomTodo());
    expect(response.status).toBe(400);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.ERROR_CREATE_TODO_WITH_PUT);
  });
  
  test("17. POST /todos/{id} (200) @post @positive", async () => {
    const todoData = todosBuilder.createRandomTodo();
    const response = await api.todos.postUpdateTodo(todosBuilder.existentId, todoData);

    expect(response.status).toBe(200);
    const body = response.data;
    expect(body.id).toEqual(todosBuilder.existentId);
    expect(body.title).toEqual(todoData.title);
    expect(body.doneStatus).toEqual(todoData.doneStatus);
    expect(body.description).toEqual(todoData.description);
  });

  test("18. POST /todos/{id} (404) @post @negative", async () => {
    const id = todosBuilder.generateRandomNumberId();
    const response = await api.todos.postUpdateTodo(id, todosBuilder.createRandomTodo());
    expect(response.status).toBe(404);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.NO_SUCH_ENTITY(id));    
  });

  test("19. PUT /todos/{id} full (200) @put @positive", async () => {
    const todoData = todosBuilder.createRandomTodo();
    const response = await api.todos.putTodo(todosBuilder.existentId, todoData);
    expect(response.status).toBe(200);

    const body = response.data;
    expect(body.id).toEqual(todosBuilder.existentId);
    expect(body.title).toEqual(todoData.title);
    expect(body.doneStatus).toEqual(todoData.doneStatus);
    expect(body.description).toEqual(todoData.description);
  });

  test("20. PUT /todos/{id} partial (200) @put @positive", async () => {
    const todoData = todosBuilder.createRandomTodo();
    const response = await api.todos.putTodo(todosBuilder.existentId, todoData);
    expect(response.status).toBe(200);
    
    const body = response.data;
    expect(body.id).toEqual(todosBuilder.existentId);
    expect(body.title).toEqual(todoData.title);
    expect(body.doneStatus).toEqual(todoData.doneStatus);
    expect(body.description).toEqual(todoData.description);

    const todoDataUpdate = todosBuilder.updatePartialTodo();
    const responseUpdate = await api.todos.putTodo(todosBuilder.existentId, todoDataUpdate);
    expect(responseUpdate.status).toBe(200);

    const bodyUpdate = responseUpdate.data;
    expect(bodyUpdate.id).toEqual(todosBuilder.existentId);
    expect(bodyUpdate.title).toEqual(todoDataUpdate.title);
    expect(bodyUpdate.doneStatus).toEqual(todosBuilder.defaultDoneStatus);
    expect(bodyUpdate.description).toEqual(todosBuilder.defaultDescription);
  });

  test("21. PUT /todos/{id} no title (400) @put @negative", async () => {
    const todoDataUpdate = todosBuilder.updateTodoWithoutTitle();
    const response = await api.todos.putTodo(todosBuilder.existentId, todoDataUpdate);
    expect(response.status).toBe(400);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.TITLE_IS_MANDATORY); 
  });

  test("23. DELETE /todos/{id} (200) @delete @positive", async () => {
    const responseDelete = await api.todos.deleteTodo(todosBuilder.existentId);
    expect(responseDelete.status).toBe(200);

    const responseGet = await api.todos.getTodoById(todosBuilder.existentId);
    expect(responseGet.status).toBe(404);
    expect(responseGet.data.errorMessages).toContain(
      ERRORS.NOT_FOUND_INSTANCE(todosBuilder.existentId)
    );

  });

  test("24. OPTIONS /todos (200) @options @positive", async () => {
    const response = await api.todos.optionsTodos(todosBuilder.existentId);
    expect(response.status).toBe(200);

    const allow = response.headers["allow"];
    expect(allow).toBeDefined();
    expect(allow).not.toHaveLength(0);
    expect(allow).toContain("OPTIONS");
  });

  test("25. GET /todos (200) XML @get @positive", async () => {
    const response = await api.todos.getTodos({ headers: { Accept: "application/xml" } });
    expect(response.status).toBe(200);

    const allow = response.headers["content-type"];;
    expect(allow).toBeDefined();
    expect(allow).not.toHaveLength(0);
    expect(allow).toContain("application/xml");
  });

  test("26. GET /todos (200) JSON @get @positive", async () => {
    const response = await api.todos.getTodos({ headers: { Accept: "application/json" } });
    expect(response.status).toBe(200);

    const allow = response.headers["content-type"];;
    expect(allow).toBeDefined();
    expect(allow).not.toHaveLength(0);
    expect(allow).toContain("application/json");
  });

  test("27. GET /todos (200) ANY @get @positive", async () => {
    const response = await api.todos.getTodos({ headers: { Accept: "*/*" } });
    expect(response.status).toBe(200);

    const allow = response.headers["content-type"];;
    expect(allow).toBeDefined();
    expect(allow).not.toHaveLength(0);
    expect(allow).toContain("application/json");
  });

  test("28. GET /todos (200) XML pref @get @positive", async () => {
    const response = await api.todos.getTodos({ headers: { Accept: "application/xml, application/json" } });
    expect(response.status).toBe(200);

    const allow = response.headers["content-type"];;
    expect(allow).toBeDefined();
    expect(allow).not.toHaveLength(0);
    expect(allow).toContain("application/xml");
  });

  test("29. GET /todos (200) no accept @get @positive", async () => {
    const response = await api.todos.getTodos();
    expect(response.status).toBe(200);

    const allow = response.headers["content-type"];;
    expect(allow).toBeDefined();
    expect(allow).not.toHaveLength(0);
    expect(allow).toContain("application/json");
  });

  test("30. GET /todos (406) @get @negative", async () => {
    const response = await api.todos.getTodos({ headers: { Accept: "application/gzip" } });
    expect(response.status).toBe(406);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.UNRECOGNISED_ACCEPT_TYPE); 
  });

  test("31. POST /todos XML @post @positive", async () => {
    const todoData = todosBuilder.createRandomTodo();
    const xmlBody = todosBuilder.createTodoXml(todoData);
    const response = await api.todos.createTodo(xmlBody, {
      "Accept": "application/xml",
      "Content-Type": "application/xml"
    });

    expect(response.status).toBe(201);
    expect(response.headers["content-type"]).toContain("application/xml");

    expect(response.data).toHaveProperty("todo.id");
    expect(response.data.todo.title).toBe(todoData.title);
    expect(response.data.todo.doneStatus).toBe(String(todoData.doneStatus));

  });

  test("32. POST /todos JSON @post @positive", async () => {
    const todoData = todosBuilder.createRandomTodo();
    const response = await api.todos.createTodo(todoData, {
      "Accept": "application/json",
      "Content-Type": "application/json"
    });

    expect(response.status).toBe(201);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.data).toHaveProperty("id");
    expect(response.data.title).toBe(todoData.title);
    expect(response.data.doneStatus).toBe(todoData.doneStatus);
  });

  test("33. POST /todos (415) @post @negative", async () => {
    const unsupportedType = "bob";
    const todoData = todosBuilder.createRandomTodo();
    const response = await api.todos.createTodo(todoData, { "Content-Type": unsupportedType });

    expect(response).toBeDefined();
    expect(response.status).toBe(415);
    expect(Array.isArray(response.data.errorMessages)).toBe(true);
    expect(response.data.errorMessages).toContain(ERRORS.UNSUPPORTED_CONTENT_TYPE(unsupportedType));
  });

  test("39. POST /todos XML to JSON @post @positive", async () => {
    const todoData = todosBuilder.createRandomTodo();
    const xmlBody = todosBuilder.createTodoXml(todoData);
    const response = await api.todos.createTodo(xmlBody, {
      "Accept": "application/json",
      "Content-Type": "application/xml"
    });

    expect(response.status).toBe(201);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.data).toHaveProperty("id");
    expect(response.data.title).toBe(todoData.title);
    expect(response.data.doneStatus).toBe(todoData.doneStatus);
  });

  test("40. POST /todos JSON to XML @post @positive", async () => {
    const todoData = todosBuilder.createRandomTodo();
    const response = await api.todos.createTodo(todoData, {
      "Accept": "application/xml",
      "Content-Type": "application/json"
    });

    expect(response.status).toBe(201);
    expect(response.headers["content-type"]).toContain("application/xml");

    expect(response.data).toHaveProperty("todo.id");
    expect(response.data.todo.title).toBe(todoData.title);
    expect(response.data.todo.doneStatus).toBe(String(todoData.doneStatus));
  });

  test("41. DELETE /heartbeat (405) @delete @negative", async () => {
    const response = await api.heartbeat.deleteHeartbeat();
    expect(response).toBeDefined();
    expect(response.status).toBe(405);
  });

  test("42. PATCH /heartbeat (500) @patch @negative", async () => {
    const response = await api.heartbeat.patchHeartbeat();
    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });

  test("58. DELETE /todos/{id} (200) all @delete @positive", async () => {
    const response = await api.todos.getTodos();
    expect(response.status).toBe(200);
    const todos = response.data.todos;

    expect(Array.isArray(todos)).toBe(true);

    for (const todo of todos) {
      const deleteResponse = await api.todos.deleteTodo(todo.id);
      expect(deleteResponse.status).toBe(200);
    }

    const finalResponse = await api.todos.getTodos();
    expect(finalResponse.status).toBe(200);
    expect(finalResponse.data.todos).toHaveLength(0);
  });
});
