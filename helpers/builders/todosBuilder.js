import { faker } from "@faker-js/faker";

function escapeXml(str) {
  if (typeof str !== "string") {return "";}
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case "&":
      return "&amp;";
    case "'":
      return "&apos;";
    case "\"":
      return "&quot;";
    default:
      return c;
    }
  });
}

const todosBuilder = {
  createFilterDone: () => ({
    doneStatus: true,
  }),
  createRandomTodo: (overrides = {}) => ({
    title: faker.lorem.words(3),
    description: faker.lorem.sentences(2),
    doneStatus: faker.datatype.boolean(),
    ...overrides,
  }),
  createTodoXml: (todo) => {
    return `
      <todo>
        <title>${escapeXml(todo.title)}</title>
        <description>${escapeXml(todo.description)}</description>
        <doneStatus>${todo.doneStatus}</doneStatus>
      </todo>
    `.trim();
  },
  getTodos: (params = {}) => apiClient.get("/todos", { params }),
  getTodoById: (id) => apiClient.get(`/todos/${id}`), 
  generateRandomUuid: () => faker.string.uuid(),
  generateRandomNumberId: () => faker.number.int({ min: 1000, max: 9999 }),
  generateLongString: (min) => {
    let a = "";
    while (a.length < min) {
      a += "a";
    }
    return a.trim();
  },
  updatePartialTodo: () => ({
    title: faker.lorem.words(3)
  }),
  updateTodoWithoutTitle: () => ({
    doneStatus: faker.datatype.boolean(),
    description: faker.lorem.sentences(2)
  }),
  "defaultDoneStatus": false,
  "defaultDescription": "",
  "existentId": 2,

};

export default todosBuilder;
