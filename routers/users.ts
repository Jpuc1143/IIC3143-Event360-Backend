import Router from "@koa/router";
import User from "../models/user.js";
import Event from "../models/event.js";
import Ticket from "../models/ticket.js";
import TicketType from "../models/ticketType.js";
import { verifyLogin } from "../middlewares/verifyLogin.js";

export const router = new Router({ prefix: "/users" });

router.get("/", async (ctx, next) => {
  ctx.response.body = await User.findAll();
  await next();
});

router.get("/:id", async (ctx, next) => {
  const user = await User.findByPk(ctx.params.id);
  if (user === null) {
    ctx.throw(404, "Usuario no encontrado");
  }
  ctx.response.body = user;
  await next();
});

router.get("/:id/events", async (ctx, next) => {
  const user = await User.findByPk(ctx.params.id);
  if (user === null) {
    ctx.throw(404, "Usuario no encontrado");
  }
  const tickets = await Ticket.findAll({
    where: { userId: user.id },
    include: [
      {
        model: TicketType,
        include: [{ model: Event }],
      },
    ],
  });

  ctx.response.body = tickets;
  await next();
});

router.get("/:id/events_organized", async (ctx, next) => {
  const user = await User.findByPk(ctx.params.id);
  if (user === null) {
    ctx.throw(404, "Usuario no encontrado");
  }
  const myEvents = await Event.findAll({ where: { userId: user.id } });
  ctx.response.body = myEvents;
  await next();
});

router.patch("/:id", async (ctx, next) => {
  // TODO: implement
  ctx.body = { hello: ctx.params.id };
  await next();
});

router.patch("/:id/request_verification", verifyLogin, async (ctx, next) => {
  const user = await User.findByPk(ctx.params.id);
  if (user === null) {
    ctx.throw(404, "Usuario no encontrado");
  }
  if (user.organizer === "pending") {
    ctx.throw(400, "Ya has solicitado ser organizador");
  }
  if (user.organizer === "verified") {
    ctx.throw(400, "Ya eres estas verificado y eres organizador");
  }
  user.organizer = "pending";
  await user.save();
  ctx.response.body = user;
  await next();
});
