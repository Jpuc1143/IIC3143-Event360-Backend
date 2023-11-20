import request from "supertest";
import { app, server } from "../app";

const api = request(app.callback());

afterAll(() => {
  server.close();
});

describe("Test the root path", () => {
  test("Hello world works", async () => {
    const response = await api.get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hello: "world!" });
  });
});
