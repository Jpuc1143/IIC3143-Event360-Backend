import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";
// import { getCurrentUser } from "../middlewares/get_current_user";

const api = request(app.callback());
let testUser, testTicketType;

beforeAll(async () => {
  app.context.db = await configureDatabase();
  testUser = await app.context.db.models.User.create({
    auth: "example-auth-data",
  });
  // app.context.state.user = testUser;
  testTicketType = await app.context.db.models.TicketType.create({
    // eventId: 1,
    price: 9990,
    amount: 100,
    domainWhitelist: "uc.cl",
  });
  await app.context.db.models.Ticket.create({
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
      const response = await api.get("/tickets/1");
      expect(response.status).toBe(200);
      delete response.body.createdAt;
      delete response.body.updatedAt;
      expect(response.body).toEqual({
        id: 1,
        userId: testUser.id,
        ticketTypeId: testTicketType.id,
        status: "approved",
      });
    });
  });

  describe("Test POST routes", () => {
    describe("Not logged in", () => {
      test("POST /tickets", async () => {
        const requestBody = { ticketTypeId: 1 };
        const response = await api.post("/tickets").send(requestBody);
        expect(response.status).toBe(500);
        expect(response.text).toEqual(
          "Cannot read properties of null (reading 'id')",
        );
      });
    });
  });

  describe("Without existing tickets", () => {
    beforeAll(async () => {
      await app.context.db.models.Ticket.destroy({ where: {}, truncate: true });
    });
    test("GET /tickets/:id", async () => {
      const response = await api.get("/tickets/1");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Ticket no encontrado");
    });
  });
});
