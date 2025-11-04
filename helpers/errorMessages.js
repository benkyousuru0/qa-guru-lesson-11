const ERRORS = {
  DESCRIPTION_LENGTH_EXCEEDED: "Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200",
  DONE_STATUS_TYPE: "Failed Validation: doneStatus should be BOOLEAN but was STRING",
  ERROR_CREATE_TODO_WITH_PUT: "Cannot create todo with PUT due to Auto fields id",
  REQUEST_BODY_TOO_LARGE: "Error: Request body too large, max allowed is 5000 bytes",
  REQUEST_SHOULD_FAIL: "Expected request to fail with status 4xx, but it succeeded",
  TITLE_IS_MANDATORY: "title : field is mandatory",
  TITLE_LENGTH_EXCEEDED: "Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50",
  UNRECOGNISED_ACCEPT_TYPE: "Unrecognised Accept Type",
  COULD_NOT_FIND_FIELD: (field) => `Could not find field: ${field}`,
  NOT_FOUND_INSTANCE: (id) => `Could not find an instance with todos/${id}`,
  NO_SUCH_ENTITY: (id) => `No such todo entity instance with id == ${id} found`,
  UNSUPPORTED_CONTENT_TYPE: (name) => `Unsupported Content Type - ${name}`
};

export default ERRORS;
