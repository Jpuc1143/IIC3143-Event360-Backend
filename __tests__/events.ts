import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";
import { accessToken } from "../fixtures/testingToken";

const api = request(app.callback());
let testUser, testEvent;

beforeAll(async () => {
  app.context.db = await configureDatabase();
  testUser = await app.context.db.models.User.create({
    auth: "example-auth-data",
  });
  testEvent = await app.context.db.models.Event.create({
    userId: testUser.id,
    name: "Ombligo G19",
    organization: "UC G19",
    description: "Descripción de prueba",
    location: "Belly Beach",
    image: "loremipsum.com",
    startDate: new Date(),
    endDate: new Date().getDate() + 3,
    merchantCode: "12312321sdfs",
  });
});

afterAll(async () => {
  await closeDatabase();
});

describe("Test events routes", () => {
  describe("Test GET events routes", () => {
    test("GET /events", async () => {
      const response = await api.get("/events");
      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(1);
    });

    test("GET /events/:id", async () => {
      const response = await api.get(`/events/${testEvent.id}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toEqual("Ombligo G19");
    });

    test("GET /events/:id when id doesn't exist", async () => {
      const response = await api.get("/events/1");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Evento no encontrado");
    });
  });
  describe("Test POST route", () => {
    test("POST /events", async () => {
      const requestBody = {
        name: "Ombligo G18",
        organization: "UC G18",
        description: "Descripción de prueba2",
        location: "Belly Beach",
        image: "loremipsum.com",
        startDate: new Date(),
        endDate: new Date().getDate() + 3,
        merchantCode: "12312321sdfs",
        userId: testUser.id,
      };
      const response = await api
        .post("/events")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestBody);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        name: "Ombligo G18",
        organization: "UC G18",
        description: "Descripción de prueba2",
        location: "Belly Beach",
        image: "loremipsum.com",
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
      const response = await api
        .post("/events")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestBody);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  describe("Test PATCH routes", () => {
    test("PATCH /events/:id", async () => {
      const requestBody = {
        description: "updated description",
      };
      const response = await api
        .patch(`/events/${testEvent.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
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
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestBody);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
    });
  });

  describe("Test DELETE route", () => {
    test("DELETE /events/id", async () => {
      const response = await api
        .delete(`/events/${testEvent.id}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
    test("DELETE /events/id when id doesn't exist", async () => {
      const idEvent = 1;
      const response = await api
        .delete(`/events/${idEvent}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
    });
  });
});
