import Router from "@koa/router";
import Ticket from "../models/ticket.js";
import TicketType from "../models/ticketType.js";
import User from "../models/user.js";
import { verifyLogin } from "../middlewares/verifyLogin.js";

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
    const user = await User.findByPk(userId);
    const userEmail = user.dataValues.email;
    const domainWhitelist = ticketType.domainWhitelist;
    const emailRegex = /@(.*)$/;
    let userDomain;
    if (userEmail) {
      userDomain = userEmail.match(emailRegex)[1];
    }
    if (userEmail && !userDomain.includes(domainWhitelist)) {
      ctx.throw(400, "El dominio del correo electrónico no está permitido");
    }
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
