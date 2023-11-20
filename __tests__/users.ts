import request from "supertest";
import { app } from "../server";

const api = request(app.callback());

describe("Test users routes", () => {
  test("GET /users", async () => {
    const response = await api.get("/users");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("GET /users/me", async () => {
    const response = await api.get("/users/me");
    expect(response.status).toBe(401);
    expect(response.text).toEqual("Tiene que hacer login primero");
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
