import request from "supertest";
import { app } from "../app.js";
import { configureDatabase, closeDatabase } from "../database.js";
import { jest } from "@jest/globals";

const api = request(app.callback());
let testUser, testEvent, testTicketType;

beforeAll(async () => {
  app.context.db = await configureDatabase();
  testUser = await app.context.db.models.User.create({
    auth: "example-auth-data",
  });
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 1);
  testEvent = await app.context.db.models.Event.create({
    userId: testUser.id,
    name: "Ombligo G19",
    organization: "UC G19",
    description: "Descripción de prueba",
    eventType: "Presencial",
    location: "Belly Beach",
    image: "loremipsum.com",
    startDate: new Date(),
    endDate: endDate,
    merchantCode: "12312321sdfs",
  });
  testTicketType = await app.context.db.models.TicketType.create({
    eventId: testEvent.id,
    price: 9990,
    amount: 100,
    domainWhitelist: "uc.cl",
  });
});

afterAll(async () => {
  await app.context.db.models.TicketType.destroy({ where: {}, truncate: true });
  await closeDatabase();
});

describe("Test ticketTypes routes", () => {
  describe("Test GET routes", () => {
    test("GET /tickettypes/:id", async () => {
      const response = await api.get(`/tickettypes/${testTicketType.id}`);
      expect(response.status).toBe(200);
      delete response.body.createdAt;
      delete response.body.updatedAt;
      expect(response.body).toEqual({
        id: testTicketType.id,
        eventId: testEvent.id,
        price: 9990,
        amount: 100,
        domainWhitelist: "uc.cl",
        ticketsLeft: 100,
      });
    });
  });

  describe("Test POST routes", () => {
    test("POST /tickettypes", async () => {
      const prevCount = await app.context.db.models.TicketType.count();
      const requestBody = { eventId: testEvent.id, price: 24990, amount: 150 };
      const response = await api.post("/tickettypes").send(requestBody);
      expect(response.status).toBe(201);
      expect(await app.context.db.models.TicketType.count()).toEqual(
        prevCount + 1,
      );
    });
    describe("Catching error", () => {
      test("POST /tickettypes", async () => {
        jest
          .spyOn(app.context.db.models.TicketType, "create")
          .mockRejectedValueOnce(new Error());
        const prevCount = await app.context.db.models.TicketType.count();
        const requestBody = {
          eventId: testEvent.id,
          price: 24990,
          amount: 150,
        };
        const response = await api.post("/tickettypes").send(requestBody);
        expect(response.status).toBe(422);
        expect(response.body).toEqual({
          error: "Missing ticket types parameters",
        });
        expect(await app.context.db.models.TicketType.count()).toEqual(
          prevCount,
        );
      });
    });
  });

  describe("Test PATCH routes", () => {
    test("PATCH /tickettypes/:id", async () => {
      const requestBody = { price: 4990 };
      const response = await api
        .patch(`/tickettypes/${testTicketType.id}`)
        .send(requestBody);
      expect(response.status).toBe(200);
      expect(response.body.price).toEqual(4990);
    });
  });

  describe("Test DELETE routes", () => {
    test("DELETE /tickettypes/:id", async () => {
      const prevCount = await app.context.db.models.TicketType.count();
      const response = await api.delete(`/tickettypes/${testTicketType.id}`);
      expect(response.status).toBe(204);
      expect(await app.context.db.models.TicketType.count()).toEqual(
        prevCount - 1,
      );
    });
  });

  describe("Test without existing ticketTypes", () => {
    beforeAll(async () => {
      await app.context.db.models.TicketType.destroy({
        where: {},
        truncate: true,
      });
    });
    test("GET /tickettypes/:id", async () => {
      const response = await api.get(`/tickettypes/${testTicketType.id}`);
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
    });
    test("PATCH /tickettypes/:id", async () => {
      const requestBody = { price: 4990 };
      const response = await api
        .patch(`/tickettypes/${testTicketType.id}`)
        .send(requestBody);
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
    });
    test("DELETE /tickettypes/:id", async () => {
      const response = await api.delete(`/tickettypes/${testTicketType.id}`);
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
    });
  });
});
