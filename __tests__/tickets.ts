import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";

const api = request(app.callback());
let testUser, testEvent, testTicketType, testTicket;
const accessToken = process.env.TESTING_TOKEN;

beforeAll(async () => {
  app.context.db = await configureDatabase();
  testUser = await app.context.db.models.User.create({
    auth: "example-auth-data",
  });
  testEvent = await app.context.db.models.Event.create({
    userId: testUser.id,
    name: "Ombligo G19",
    description: "Descripción de prueba",
    startDate: new Date(),
    merchantCode: "12312321sdfs",
  });
  testTicketType = await app.context.db.models.TicketType.create({
    eventId: testEvent.id,
    price: 9990,
    amount: 2,
    domainWhitelist: "uc.cl",
  });
  testTicket = await app.context.db.models.Ticket.create({
    userId: testUser.id,
    ticketTypeId: testTicketType.id,
    status: "approved",
  });
});

afterAll(async () => {
  await closeDatabase();
});

describe("Test tickets routes", () => {
  describe("Test GET routes", () => {
    test("GET /tickets/:id", async () => {
      const response = await api
        .get(`/tickets/${testTicket.id}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toEqual(testTicket.id);
      expect(response.body.userId).toEqual(testUser.id);
      expect(response.body.ticketTypeId).toEqual(testTicketType.id);
      expect(response.body.status).toEqual("approved");
    });
  });

  describe("Test POST routes", () => {
    test("POST /tickets", async () => {
      const requestBody = { ticketTypeId: testTicketType.id };
      const response = await api
        .post("/tickets")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestBody);
      expect(response.status).toBe(201);
      expect(response.body.ticketTypeId).toEqual(testTicketType.id);
      expect(response.body.status).toEqual("pending");
    });
    describe("Not logged in", () => {
      test("POST /tickets", async () => {
        const requestBody = { ticketTypeId: testTicketType.id };
        const response = await api.post("/tickets").send(requestBody);
        expect(response.status).toBe(401);
        expect(response.text).toEqual("No autorizado");
      });
    });
    describe("Not enough tickets", () => {
      // Como se creó un ticket al principio y uno en el test anterior
      // no quedan tickets disponibles
      test("POST /tickets", async () => {
        const requestBody = { ticketTypeId: testTicketType.id };
        const response = await api
          .post("/tickets")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(requestBody);
        expect(response.status).toBe(400);
        expect(response.text).toEqual("No quedan tickets disponibles");
      });
    });
  });

  describe("Without existing tickets", () => {
    beforeAll(async () => {
      await app.context.db.models.Ticket.destroy({ where: {}, truncate: true });
    });
    test("GET /tickets/:id", async () => {
      const response = await api
        .get(`/tickets/${testTicket.id}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Ticket no encontrado");
    });
  });

  describe("Without existing ticketTypes", () => {
    beforeAll(async () => {
      await app.context.db.models.TicketType.destroy({
        where: {},
        truncate: true,
      });
    });
    test("POST /tickets", async () => {
      const requestBody = { ticketTypeId: testTicketType.id };
      const response = await api
        .post("/tickets")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestBody);
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
    });
  });
});
