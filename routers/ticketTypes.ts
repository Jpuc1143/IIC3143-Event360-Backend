import Router from "@koa/router";
import TicketType from "../models/ticketType";
// import Event from "../models/event";
import Ticket from "../models/ticket";
import { Op } from "sequelize";

export const router = new Router({ prefix: "/tickettypes" });

// router.get("/event/:eventId", async (ctx, next) => {
//   const event = await Event.findByPk(ctx.params.eventId);
//   if (event === null) {
//     ctx.throw(404, "Evento no encontrado");
//   }
//   const ticketTypes = await event.getTicketTypes();
//   if (ticketTypes === null) {
//     ctx.throw(404, "Tipos de ticket para este evento no encontrados");
//   }
//   ctx.response.body = event;
//   await next();
// });

router.get("/:id", async (ctx, next) => {
  const ticketType = await TicketType.findByPk(ctx.params.id);
  if (ticketType === null) {
    ctx.throw(404, "Tipo de ticket no encontrado");
  }
  const ticketsBought = await Ticket.findAndCountAll({
    where: {
      ticketTypeId: ctx.params.id,
      status: { [Op.or]: { [Op.eq]: "approved", [Op.eq]: "pending" } },
    },
  });
  ticketType.setDataValue(
    "ticketsLeft",
    ticketType.amount - ticketsBought.count,
  );
  ctx.response.body = ticketType;
  await next();
});

router.post("/", async (ctx, next) => {
  try {
    const { eventId, price, amount, domainWhitelist } = ctx.request.body;
    const newTicketType = await TicketType.create({
      eventId,
      price,
      amount,
      domainWhitelist,
    });
    ctx.status = 201;
    ctx.body = newTicketType;
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});

router.patch("/:id", async (ctx, next) => {
  const ticketTypeId = ctx.params.id;
  const ticketTypeDataToUpdate = ctx.request.body;

  const ticketType = await TicketType.findByPk(ticketTypeId);

  if (ticketType === null) {
    ctx.throw(404, "Tipo de ticket no encontrado");
  }
  await ticketType.update(ticketTypeDataToUpdate);
  ctx.body = ticketType;
  await next();
});

router.delete("/:id", async (ctx, next) => {
  const ticketTypeId = ctx.params.id;
  const ticketType = await TicketType.findByPk(ticketTypeId);

  if (ticketType === null) {
    ctx.throw(404, "Tipo de ticket no encontrado");
  }
  await ticketType.destroy();
  ctx.status = 204;
  await next();
});