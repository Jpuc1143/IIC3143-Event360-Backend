import request from "supertest";
import { app } from "../app";
import { configureDatabase, closeDatabase } from "../database";
import { accessToken } from "../fixtures/testingToken";

const api = request(app.callback());
let testUser, testUser2, testEvent, testTicketType;

async function createTestUser(admin: boolean, organizer: string) {
  const newTestUserRequest = await api
    .get("/users")
    .set("Authorization", `Bearer ${accessToken}`);
  const newTestUser = await app.context.db.models.User.findByPk(
    newTestUserRequest.body[0].id,
  );
  newTestUser.admin = admin;
  newTestUser.organizer = organizer;
  await newTestUser.save();
  return newTestUser;
}

beforeAll(async () => {
  app.context.db = await configureDatabase();
  testUser = await createTestUser(true, "verified");
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

describe("Test users routes", () => {
  describe("Test GET routes", () => {
    test("GET /users", async () => {
      const response = await api.get("/users");
      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(2);
    });

    test("GET /users/:id", async () => {
      const response = await api.get(`/users/${testUser.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toEqual(testUser.id);
    });

    test("GET /users/:id when id doesn't exist", async () => {
      const response = await api.get("/users/1");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Usuario no encontrado");
    });

    test("GET /users/:id/events", async () => {
      const response = await api.get(`/users/${testUser2.id}/events`);
      expect(response.status).toBe(200);
      expect(response.body[0].name).toEqual("Ombligo G19");
    });

    test("GET /users/:id/events when id doesn't exist", async () => {
      const response = await api.get("/users/1/events");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Usuario no encontrado");
    });

    test("GET /users/:id/events_organized", async () => {
      const response = await api.get(`/users/${testUser.id}/events_organized`);
      expect(response.status).toBe(200);
      expect(response.body[0].name).toEqual("Ombligo G19");
    });

    test("GET /users/:id/events_organized when id doesn't exist", async () => {
      const response = await api.get("/users/1/events_organized");
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Usuario no encontrado");
    });
  });

  describe("Test PATCH routes", () => {
    test("PATCH /users/:id", async () => {
      const requestBody = { hello: 1 };
      const response = await api.patch("/users/1").send(requestBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ hello: "1" });
    });

    describe("PATCH /users/:id/request_verification", () => {
      test("Request is successful", async () => {
        const response = await api
          .patch(`/users/${testUser2.id}/request_verification`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({});
        expect(response.status).toBe(200);
        expect(response.body.organizer).toEqual("pending");
      });

      test("User id doesn't exist", async () => {
        const response = await api
          .patch(`/users/1/request_verification`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({});
        expect(response.status).toBe(404);
        expect(response.text).toEqual("Usuario no encontrado");
      });

      test("User already sent verification request", async () => {
        testUser2.organizer = "pending";
        await testUser2.save();
        const response = await api
          .patch(`/users/${testUser2.id}/request_verification`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({});
        expect(response.status).toBe(400);
        expect(response.text).toEqual("Ya has solicitado ser organizador");
      });

      test("User is already verified", async () => {
        testUser2.organizer = "verified";
        await testUser2.save();
        const response = await api
          .patch(`/users/${testUser2.id}/request_verification`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({});
        expect(response.status).toBe(400);
        expect(response.text).toEqual(
          "Ya eres estas verificado y eres organizador",
        );
      });
    });
  });

  describe("Test Admin related routes", () => {
    test("Test GET /admins/petitions", async () => {
      testUser2.organizer = "pending";
      await testUser2.save();
      const response = await api
        .get("/admins/petitions")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body[0].id).toEqual(testUser2.id);
    });

    test("Test GET /admins/petitions without admin role", async () => {
      testUser.admin = false;
      await testUser.save();
      const response = await api
        .get("/admins/petitions")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(401);
      expect(response.text).toEqual(
        "No tienes el nivel de autorización para hacer esto",
      );
      testUser.admin = true;
      await testUser.save();
    });

    test("Test PATCH /admins/:id/make_admin", async () => {
      const response = await api
        .patch(`/admins/${testUser2.id}/make_admin`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});
      expect(response.status).toBe(200);
      expect(response.body.admin).toEqual(true);
    });

    test("Test PATCH /admins/:id/make_admin when id doesn't exist", async () => {
      const response = await api
        .patch("/admins/1/make_admin")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});
      expect(response.status).toBe(404);
      expect(response.text).toEqual("Usuario no encontrado");
    });

    describe("Test PATCH /admins/:id/verify", () => {
      test("User id doesn't exist", async () => {
        const response = await api
          .patch("/admins/1/verify")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({});
        expect(response.status).toBe(404);
        expect(response.text).toEqual("Usuario no encontrado");
      });

      test("Not approved", async () => {
        testUser2.organizer = "pending";
        await testUser2.save();
        const response = await api
          .patch(`/admins/${testUser2.id}/verify`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ answer: false });
        expect(response.status).toBe(200);
        expect(response.body.organizer).toEqual("unsolicited");
      });

      test("Approved", async () => {
        testUser2.organizer = "pending";
        await testUser2.save();
        const response = await api
          .patch(`/admins/${testUser2.id}/verify`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ answer: true });
        expect(response.status).toBe(200);
        expect(response.body.organizer).toEqual("verified");
      });
    });
  });
});
