import Router from "@koa/router";
import Ticket from "../models/ticket";
import TicketType from "../models/ticketType";
import { Op } from "sequelize";

export const router = new Router({ prefix: "/tickets" });

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
    const ticketsBought = await Ticket.findAndCountAll({
      where: {
        ticketTypeId,
        status: { [Op.or]: { [Op.eq]: "approved", [Op.eq]: "pending" } },
      },
    });
    if (ticketType.amount - ticketsBought.count === 0) {
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
    console.log(error);
    ctx.status = error.status || 500;
    ctx.body = error.message || { error: "Internal Server Error" };
  }
});
