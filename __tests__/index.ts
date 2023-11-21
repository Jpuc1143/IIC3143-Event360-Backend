import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";

const api = request(app.callback());

beforeAll(async () => {
  app.context.db = await configureDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Test the root path", () => {
  test("Hello world works", async () => {
    const response = await api.get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hello: "world!" });
  });

  test("GET /users/me", async () => {
    const response = await api.get("/users/me");
    expect(response.status).toBe(401);
    expect(response.text).toEqual("Tiene que hacer login primero");
  });
});
