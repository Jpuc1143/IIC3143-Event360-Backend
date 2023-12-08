import Router from "@koa/router";
import TicketType from "../models/ticketType.js";
// import Event from "../models/event";

export const router = new Router({ prefix: "/tickettypes" });

router.get("/:id", async (ctx, next) => {
  const ticketType = await TicketType.findByPk(ctx.params.id);
  if (ticketType === null) {
    ctx.throw(404, "Tipo de ticket no encontrado");
  }
  const ticketsLeft = await ticketType.getTicketsLeft();
  ticketType.setDataValue("ticketsLeft", ticketsLeft);
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
