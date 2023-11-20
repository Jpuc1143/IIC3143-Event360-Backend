import Router from "@koa/router";
import User from "../models/user";

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

router.get("/:id", async (ctx, next) => {
  const user = ctx.state.currentUser;
  if (user === null) {
    ctx.throw(401, "Tiene que hacer login primero");
  }
  ctx.response.body = user;
  await next();
});

router.patch("/:id", async (ctx, next) => {
  // TODO: implement
  ctx.body = { hello: ctx.params.id };
  await next();
});
