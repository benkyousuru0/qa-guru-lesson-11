import createApiClient from "../helpers/apiClient.js";

let apiClient = createApiClient(null);

const todosController = {
  setToken: (token) => {
    apiClient = createApiClient(token);
  },
  createTodo: (data, options = {}) => {
    const { params = {}, headers = {} } = options;
    return apiClient.post("/todos", data, { params, headers });},
  deleteTodo: (id) => apiClient.delete(`/todos/${id}`),
  getTodos: (options = {}) => {
    const { params = {}, headers = {} } = options;
    return apiClient.get("/todos", { params, headers });
  },
  getTodoById: (id) => apiClient.get(`/todos/${id}`),
  getTodoInvalidEndpoint: () => apiClient.get("/todo"),
  headTodos: (params = {}) => apiClient.head("/todos", { params }),
  optionsTodos: (data) => apiClient.options("/todos", data),
  postUpdateTodo: (id, data) => apiClient.post(`/todos/${id}`, data),
  putTodo: (id, data) => apiClient.put(`/todos/${id}`, data),
  putUpdateTodo: (id, data) => apiClient.put(`/todos/${id}`, data)
};

export default todosController;
