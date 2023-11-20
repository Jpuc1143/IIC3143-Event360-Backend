import Router from "@koa/router";

export const router = new Router();

router.get("/", async (ctx, next) => {
  ctx.body = { hello: "world!" };
  await next();
});
