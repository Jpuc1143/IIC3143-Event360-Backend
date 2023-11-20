import request from "supertest";
import { app } from "../server";

const api = request(app.callback());

describe("Test the root path", () => {
  test("Hello world works", async () => {
    const response = await api.get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hello: "world!" });
  });
});
