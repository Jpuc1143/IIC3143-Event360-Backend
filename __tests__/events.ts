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

describe("Test events routes", () => {
  describe("Test POST route", () => {
    test("POST /events", async () => {
      const now = new Date();
      const requestBody = {
        name: "Hi",
        description: "Descripción de prueba",
        startDate: now,
        merchantCode: "12312321sdfs",
      };
      const response = await api.post("/events").send(requestBody);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        name: "Hi",
        description: "Descripción de prueba",
        merchantCode: "12312321sdfs",
      });
    });
  });

  describe("Test events POST when missing argument", () => {
    test("POST /events", async () => {
      const now = new Date();
      const requestBody = {
        name: "Hi",
        startDate: now,
        merchantCode: "12312321sdfs",
      };
      const response = await api.post("/events").send(requestBody);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  describe("Test GET events routes", () => {
    // test("GET /events", async () => {
    //   const response = await api.get("/events");
    //   expect(response.status).toBe(200);
    //   expect(response.body).toEqual([]);
    // });

    test("GET /events/:id", async () => {
      const allEvents = await api.get("/events");
      const idEvent = allEvents.body[0].id;
      const response = await api.get(`/events/${idEvent}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toEqual("Hi");
    });

    test("GET /events/:id when id doesn't exist", async () => {
      const response = await api.get("/events/1");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
    });

    describe("Test PATCH routes", () => {
      test("PATCH /events/:id", async () => {
        const allEvents = await api.get("/events");
        const idEvent = allEvents.body[0].id;
        const requestBody = {
          description: "updated description",
        };
        const response = await api
          .patch(`/events/${idEvent}`)
          .send(requestBody);
        expect(response.status).toBe(200);
        expect(response.body.description).toEqual("updated description");
      });

      test("PATCH /events/:id when nonexistant id", async () => {
        const requestBody = {
          description: "updated description 2.0",
        };
        const idEvent = 1;
        const response = await api
          .patch(`/events/${idEvent}`)
          .send(requestBody);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({});
      });
    });
  });

  describe("Test DELETE route", () => {
    test("DELETE /events/id", async () => {
      const allEvents = await api.get("/events");
      const idEvent = allEvents.body[0].id;
      const response = await api.delete(`/events/${idEvent}`);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
    test("DELETE /events/id when id doesn't exist", async () => {
      const idEvent = 1;
      const response = await api.delete(`/events/${idEvent}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
    });
  });
});
