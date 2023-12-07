import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";
import { accessToken } from "../fixtures/testingToken";

const api = request(app.callback());
let testUser, testEvent, testTicketType, testTicket;

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
    describe("Catching error", () => {
      test("POST /tickets", async () => {
        jest
          .spyOn(app.context.db.models.Ticket, "create")
          .mockRejectedValueOnce(new Error());
        const prevCount = await app.context.db.models.Ticket.count();
        const requestBody = { ticketTypeId: testTicketType.id };
        const response = await api
          .post("/tickets")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(requestBody);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal Server Error" });
        expect(await app.context.db.models.Ticket.count()).toEqual(prevCount);
      });
    });
    test("POST /tickets", async () => {
      const prevCount = await app.context.db.models.Ticket.count();
      const requestBody = { ticketTypeId: testTicketType.id };
      const response = await api
        .post("/tickets")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestBody);
      expect(response.status).toBe(201);
      expect(response.body.ticketTypeId).toEqual(testTicketType.id);
      expect(response.body.status).toEqual("pending");
      expect(await app.context.db.models.Ticket.count()).toEqual(prevCount + 1);
    });
    describe("Not logged in", () => {
      test("POST /tickets", async () => {
        const prevCount = await app.context.db.models.Ticket.count();
        const requestBody = { ticketTypeId: testTicketType.id };
        const response = await api.post("/tickets").send(requestBody);
        expect(response.status).toBe(401);
        expect(response.text).toEqual("No autorizado");
        expect(await app.context.db.models.Ticket.count()).toEqual(prevCount);
      });
    });
    describe("Not enough tickets", () => {
      // Como se creó un ticket al principio y uno en el test anterior
      // no quedan tickets disponibles
      test("POST /tickets", async () => {
        const prevCount = await app.context.db.models.Ticket.count();
        const requestBody = { ticketTypeId: testTicketType.id };
        const response = await api
          .post("/tickets")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(requestBody);
        expect(response.status).toBe(400);
        expect(response.text).toEqual("No quedan tickets disponibles");
        expect(await app.context.db.models.Ticket.count()).toEqual(prevCount);
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
      const prevCount = await app.context.db.models.Ticket.count();
      const requestBody = { ticketTypeId: testTicketType.id };
      const response = await api
        .post("/tickets")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestBody);
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Tipo de ticket no encontrado");
      expect(await app.context.db.models.Ticket.count()).toEqual(prevCount);
    });
  });
});
