import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";
import { accessToken } from "../fixtures/testingToken";

const api = request(app.callback());
let testUser, testUser2, testEvent, testTicketType;

beforeAll(async () => {
  app.context.db = await configureDatabase();
  testUser = await app.context.db.models.User.create({
    auth: "example-auth-data",
  });
  testUser2 = await app.context.db.models.User.create({
    auth: "example-auth-data2",
  });
  testEvent = await app.context.db.models.Event.create({
    userId: testUser.id,
    name: "Ombligo G19",
    organization: "UC G19",
    description: "Descripción de prueba",
    eventType: "Presencial",
    location: "Belly Beach",
    image: "loremipsum.com",
    startDate: new Date(),
    endDate: new Date().getDate() + 3,
    merchantCode: "12312321sdfs",
  });
  testTicketType = await app.context.db.models.TicketType.create({
    eventId: testEvent.id,
    price: 9990,
    amount: 100,
    domainWhitelist: "uc.cl",
  });
  await app.context.db.models.Ticket.create({
    userId: testUser2.id,
    ticketTypeId: testTicketType.id,
    status: "approved",
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

    describe("Test GET /events/:id/eventtickets", () => {
      test("GET /events/:id/eventtickets successfully", async () => {
        const response = await api.get(`/events/${testEvent.id}/eventtickets`);
        expect(response.status).toBe(200);
        expect(response.body[0].eventId).toEqual(testEvent.id);
        expect(response.body[0].price).toEqual(testTicketType.price);
        expect(response.body[0].amount).toEqual(testTicketType.amount);
        expect(response.body[0].domainWhitelist).toEqual(
          testTicketType.domainWhitelist,
        );
      });

      test("GET /events/:id/eventtickets when id doesn't exist", async () => {
        const response = await api.get(`/events/1/eventtickets`);
        expect(response.status).toBe(404);
        expect(response.text).toEqual("Evento no encontrado");
      });
    });

    describe("Test GET /events/:id/attendees", () => {
      test("GET /events/:id/attendees successfully", async () => {
        const response = await api.get(`/events/${testEvent.id}/attendees`);
        expect(response.status).toBe(200);
        expect(response.body[0].id).toEqual(testUser2.id);
      });

      test("GET /events/:id/attendees when id doesn't exist", async () => {
        const response = await api.get(`/events/1/attendees`);
        expect(response.status).toBe(404);
        expect(response.text).toEqual("Evento no encontrado");
      });
    });

    describe("Test GET events/:id/... with no ticket types", () => {
      beforeAll(async () => {
        await app.context.db.models.Ticket.destroy({
          where: {},
          truncate: true,
        });
        await app.context.db.models.TicketType.destroy({
          where: {},
          truncate: true,
        });
      });
      test("GET /events/:id/eventtickets", async () => {
        const response = await api.get(`/events/${testEvent.id}/eventtickets`);
        expect(response.status).toBe(404);
        expect(response.text).toEqual(
          "Tipos de ticket para este evento no encontrados",
        );
      });
    });
  });

  describe("Test POST route", () => {
    test("POST /events", async () => {
      const requestBody = {
        name: "Ombligo G18",
        organization: "UC G18",
        description: "Descripción de prueba2",
        eventType: "Presencial",
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
        eventType: "Presencial",
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

  describe("Test GET all events with no events", () => {
    beforeAll(async () => {
      await app.context.db.models.Event.destroy({
        where: {},
        truncate: true,
      });
    });
    test("GET /events", async () => {
      const response = await api.get("/events");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Eventos no encontrados");
    });
  });
});
