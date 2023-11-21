import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";

const api = request(app.callback());

beforeAll(async () => {
  app.context.db = await configureDatabase();
  await app.context.db.models.TicketType.create({
    // eventId: 1,
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
      const response = await api.get("/tickettypes/1");
      expect(response.status).toBe(200);
      delete response.body.createdAt;
      delete response.body.updatedAt;
      expect(response.body).toEqual({
        id: 1,
        // eventId: 1,
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
      const requestBody = { eventId: 1, price: 24990, amount: 150 };
      const response = await api.post("/tickettypes").send(requestBody);
      expect(response.status).toBe(201);
      expect(await app.context.db.models.TicketType.count()).toEqual(
        prevCount + 1,
      );
    });
  });

  describe("Test PATCH routes", () => {
    test("PATCH /tickettypes/:id", async () => {
      const requestBody = { price: 4990 };
      const response = await api.patch("/tickettypes/1").send(requestBody);
      expect(response.status).toBe(200);
      expect(response.body.price).toEqual(4990);
    });
  });

  describe("Test DELETE routes", () => {
    test("DELETE /tickettypes/:id", async () => {
      const response = await api.delete("/tickettypes/1");
      expect(response.status).toBe(204);
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
      const response = await api.get("/tickettypes/1");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
    });
    test("PATCH /tickettypes/:id", async () => {
      const requestBody = { price: 4990 };
      const response = await api.patch("/tickettypes/1").send(requestBody);
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
    });
    test("DELETE /tickettypes/:id", async () => {
      const response = await api.delete("/tickettypes/1");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
    });
  });
});
