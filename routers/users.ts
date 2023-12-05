import Router from "@koa/router";
import User from "../models/user";
import Event from "../models/event";
import Ticket from "../models/ticket";
import { Op } from "sequelize";

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
  // TODO: implement
  const myTickets = await Ticket.findAll({ where: { userId: ctx.params.id } });
  const temp = myTickets.map((ticket) => ticket.ticketTypeId);
  const events = await Event.findAll({ where: { id: { [Op.in]: temp } } });
  ctx.response.body = events;
  await next();
});

router.get("/:id/events_organized", async (ctx, next) => {
  const myEvents = await Event.findAll({ where: { userId: ctx.params.id } });
  ctx.response.body = myEvents;
  await next();
});

router.patch("/:id", async (ctx, next) => {
  // TODO: implement
  ctx.body = { hello: ctx.params.id };
  await next();
});
