import Router from "@koa/router";
import Event from "../models/event";
import { verifyLogin } from "../middlewares/verifyLogin";

export const router = new Router({ prefix: "/events" });

router.get("/", async (ctx, next) => {
  const events = await Event.findAll();
  if (events.length === 0) {
    ctx.throw(404, "Eventos no encontrados");
  }
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

router.post("/", verifyLogin, async (ctx, next) => {
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
    ctx.body = { error: "Internal Server Error" };
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
