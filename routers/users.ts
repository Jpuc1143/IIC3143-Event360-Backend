import Router from "@koa/router";
import User from "../models/user";
import Event from "../models/event";
import Ticket from "../models/ticket";
import TicketType from "../models/ticketType";
import { Op } from "sequelize";
import { verifyLogin } from "../middlewares/verifyLogin";

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
  const tickets = await Ticket.findAll({ where: { userId: user.id } });
  const ticketsTypesIdsList = tickets.map((ticket) => ticket.ticketTypeId);
  const ticketTypes = await TicketType.findAll({
    where: { id: { [Op.in]: ticketsTypesIdsList } },
  });
  const eventsIdsList = ticketTypes.map((ticketType) => ticketType.eventId);
  const events = await Event.findAll({
    where: { id: { [Op.in]: eventsIdsList } },
  });
  ctx.response.body = events;
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
