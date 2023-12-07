import Router from "@koa/router";
import Ticket from "../models/ticket";
import TicketType from "../models/ticketType";
import { verifyLogin } from "../middlewares/verifyLogin";

export const router = new Router({ prefix: "/tickets" });

router.use(verifyLogin);

router.get("/:id", async (ctx, next) => {
  const ticket = await Ticket.findByPk(ctx.params.id);
  if (ticket === null) {
    ctx.throw(404, "Ticket no encontrado");
  }
  ctx.response.body = ticket;
  await next();
});

router.post("/", async (ctx, next) => {
  try {
    const { ticketTypeId } = ctx.request.body;
    const ticketType = await TicketType.findByPk(ticketTypeId);
    if (ticketType === null) {
      ctx.throw(404, "Tipo de ticket no encontrado");
    }
    if ((await ticketType.getTicketsLeft()) === 0) {
      ctx.throw(400, "No quedan tickets disponibles");
    }
    const userId = ctx.state.currentUser.id;
    const newTicket = await Ticket.create({
      userId,
      ticketTypeId,
      status: "pending",
    });
    ctx.status = 201;
    ctx.body = newTicket;
    await next();
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.body = error.message || { error: "Internal Server Error" };
  }
});
