import Router from "@koa/router";
import User from "../models/user.js";
import Event from "../models/event.js";
import Ticket from "../models/ticket.js";
import TicketType from "../models/ticketType.js";
import { verifyLogin } from "../middlewares/verifyLogin.js";
import { verifyOrganizer } from "../middlewares/verifyOrganizer.js";

export const router = new Router({ prefix: "/events" });

router.get("/", async (ctx, next) => {
  const events = await Event.findAll();
  ctx.response.body = events;
  await next();
});

router.get("/:id", async (ctx, next) => {
  const event = await Event.findByPk(ctx.params.id);
  if (event === null) {
    ctx.throw(404, "Evento no encontrado");
  }
  ctx.response.body = event;
  await next();
});

router.get("/:id/eventtickets", async (ctx, next) => {
  const event = await Event.findByPk(ctx.params.id);
  if (event === null) {
    ctx.throw(404, "Evento no encontrado");
  }
  const ticketTypesInfo = await TicketType.findAll({
    where: { eventId: ctx.params.id },
  });

  const ticketTypes = await Promise.all(
    ticketTypesInfo.map(async (ticketType) => {
      const ticketsLeft = await ticketType.getTicketsLeft();
      ticketType.setDataValue("ticketsLeft", ticketsLeft);
      return ticketType;
    }),
  );
  console.log(ticketTypes);
  if (ticketTypes.length === 0) {
    ctx.throw(404, "Tipos de ticket para este evento no encontrados");
  }
  ctx.response.body = ticketTypes;
  await next();
});

router.get("/:id/attendees", async (ctx, next) => {
  const event = await Event.findByPk(ctx.params.id, {
    include: [
      {
        model: TicketType,
        include: [
          {
            model: Ticket,
            include: [User],
          },
        ],
      },
    ],
  });
  if (event === null) {
    ctx.throw(404, "Evento no encontrado");
  }
  const attendees = event.ticketTypes.reduce((users, ticketType) => {
    const usersForTicketType = ticketType.tickets.map((ticket) => ticket.user);
    return [...users, ...usersForTicketType];
  }, []);
  ctx.response.body = attendees;
  await next();
});

router.post("/", verifyLogin, verifyOrganizer, async (ctx, next) => {
  try {
    const {
      name,
      organization,
      description,
      eventType,
      startDate,
      endDate,
      location,
      image,
      merchantCode,
    } = ctx.request.body;
    const userId = ctx.state.currentUser.id;
    const newEvent = await Event.create({
      name,
      organization,
      description,
      eventType,
      startDate,
      endDate,
      location,
      image,
      merchantCode,
      userId,
    });
    ctx.status = 201;
    ctx.body = {
      name: newEvent.name,
      organization: newEvent.organization,
      description: newEvent.description,
      eventType: newEvent.eventType,
      location: newEvent.location,
      image: newEvent.image,
      merchantCode: newEvent.merchantCode,
    };
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.patch("/:id", verifyLogin, async (ctx, next) => {
  const eventId = ctx.params.id;
  const eventDataToUpdate = ctx.request.body;

  const event = await Event.findByPk(eventId);

  if (event === null) {
    ctx.throw(404, "Evento no encontrado");
  }
  await event.update(eventDataToUpdate);
  ctx.body = event;
  await next();
});

router.delete("/:id", verifyLogin, async (ctx, next) => {
  const eventId = ctx.params.id;
  const event = await Event.findByPk(eventId);

  if (event === null) {
    ctx.throw(404, "Evento no encontrado");
  }
  const deletedEvent = await event.destroy();
  ctx.body = deletedEvent;
  ctx.status = 204;
  await next();
});

router.post("/:id/verify", verifyLogin, async (ctx, next) => {
  const event = await Event.findByPk(ctx.params.id);
  if (ctx.state.currentUser.id !== event.userId) {
    ctx.throw(403, "Must be the event's organizer");
  }

  const { secret } = ctx.request.body;
  const ticket = await Ticket.findOne({ where: { secret }, include: User });
  if (ticket === null) {
    ctx.throw(404, "Ticket secret is not valid");
  }
  ctx.body = ticket;
  await next();
});

router.post("/:id/notify", verifyLogin, async (ctx, next) => {
  const event = await Event.findByPk(ctx.params.id);
  if (ctx.state.currentUser.id !== event.userId) {
    ctx.throw(403, "Usuario no es organizador");
  }
  await event.notify(ctx.request.body.msg);

  ctx.status = 201;
  await next();
});
