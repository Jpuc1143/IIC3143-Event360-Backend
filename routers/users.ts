import Router from "@koa/router";
import User from "../models/user.js";
import Event from "../models/event.js";
import Ticket from "../models/ticket.js";
import TicketType from "../models/ticketType.js";
import { Op } from "sequelize";
import { verifyLogin } from "../middlewares/verifyLogin.js";

export const router = new Router({ prefix: "/users" });

const nResultsLimit = 9;

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
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = nResultsLimit;
  const totalCount = await Event.count({
    where: { id: { [Op.in]: eventsIdsList } },
  });
  const totalPages = Math.ceil(totalCount / limit);
  const offset = (page - 1) * limit;
  const events = await Event.findAll({
    where: { id: { [Op.in]: eventsIdsList } },
    limit: limit,
    offset: offset,
  });
  ctx.response.body = {
    events,
    totalPages,
  };
  await next();
});

router.get("/:id/events_organized", async (ctx, next) => {
  const user = await User.findByPk(ctx.params.id);
  if (user === null) {
    ctx.throw(404, "Usuario no encontrado");
  }
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = nResultsLimit;
  const totalCount = await Event.count({ where: { userId: user.id } });
  const totalPages = Math.ceil(totalCount / limit);
  const offset = (page - 1) * limit;
  const myEvents = await Event.findAll({
    where: { userId: user.id },
    limit: limit,
    offset: offset,
  });
  ctx.response.body = {
    myEvents,
    totalPages,
  };
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
