const request = require("supertest");
const app = require("../../app.js");
const Database = require("../../config/db.js");


describe("Unit tests for endpoints", () => {
  test("GET /tasks - should retrieve all tasks", async () => {
    jest.spyOn(Database.prototype, "getAllTasks").mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1, title: "Task 1", description: "Description", status: "TODO", due: new Date() }],
    });

    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Task 1");
  });

  test("GET /getTask/:taskId - should retrieve a specific task", async () => {
    jest.spyOn(Database.prototype, "getTask").mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1, title: "Task 1", description: "Description", status: "TODO", due: new Date() }],
    });

    const res = await request(app).get("/getTask/1");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Task 1");
  });

  test("POST /createTask - should create a new task", async () => {
    jest.spyOn(Database.prototype, "addTask").mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .post("/createTask")
      .send({
        title: "New Task",
        description: "Task description",
        status: "TODO",
        "due-day": "1",
        "due-month": "1",
        "due-year": "2024",
        "due-hour": "12",
        "due-minutes": "30",
      });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/tasks");
  });

  test("PUT /updateTask/:taskId - should update an existing task", async () => {
    jest.spyOn(Database.prototype, "updateTask").mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .put("/updateTask/1")
      .send({
        title: "Updated Task",
        description: "Updated description",
        status: "IN_PROGRESS",
        "due-day": 2,
        "due-month": 2,
        "due-year": 2024,
        "due-hour": 14,
        "due-minutes": 45,
      });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/tasks");
  });

  test("DELETE /deleteTask/:taskId - should delete a task", async () => {
    jest.spyOn(Database.prototype, "deleteTask").mockResolvedValue({ rowCount: 1 });

    const res = await request(app).delete("/deleteTask/1");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/tasks");
  });

  test("GET /createTaskForm - should render the create task form", async () => {
    const res = await request(app).get("/createTaskForm");

    expect(res.status).toBe(200);
    expect(res.text).toContain("What is the title of the task?");
  });

  test("GET /updateTaskForm/:taskId - should render the update task form", async () => {
    jest.spyOn(Database.prototype, "getTask").mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1, title: "Task 1", description: "Description", status: "TODO", due: new Date() }],
    });

    const res = await request(app).get("/updateTaskForm/1");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Task 1");
  });
});