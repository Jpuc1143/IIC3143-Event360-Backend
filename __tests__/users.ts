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

describe("Test users routes", () => {
  describe("Test GET routes", () => {
    describe("Without existing user", () => {
      test("GET /users", async () => {
        const response = await api.get("/users");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });

      test("GET /users/:id", async () => {
        const response = await api.get("/users/1");
        expect(response.status).toBe(404);
        expect(response.text).toEqual("Usuario no encontrado");
      });

      test("GET /users/:id/events", async () => {
        const response = await api.get("/users/1/events");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });

      test("GET /users/:id/events_organized", async () => {
        const response = await api.get("/users/1/events_organized");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });
  });

  describe("Test PATCH routes", () => {
    test("PATCH /users/:id", async () => {
      const requestBody = { hello: 1 };
      const response = await api.patch("/users/1").send(requestBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ hello: "1" });
    });
  });
});
