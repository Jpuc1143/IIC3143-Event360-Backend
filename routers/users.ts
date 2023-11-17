import Router from "@koa/router";

export const router = new Router({ prefix: "/users" });

router.get("/:id", async (ctx, next) => {
  ctx.body = { hello: ctx.params.id };
  await next();
});

router.patch("/:id", async (ctx, next) => {
  // TODO: implement
  ctx.body = { hello: ctx.params.id };
  await next();
});
