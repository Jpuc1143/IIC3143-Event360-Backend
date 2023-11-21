import Router from "@koa/router";

export const router = new Router();

router.get("/", async (ctx, next) => {
  ctx.body = { hello: "world!" };
  await next();
});

router.all(/^\/users\/me(\/.*)?$/, async (ctx) => {
  if (ctx.state.currentUser === null) {
    ctx.throw(401, "Tiene que hacer login primero");
  }
  const url = Router.url("/users/:id" + ctx.params[0], {
    id: ctx.state.currentUser.id,
  });
  ctx.redirect(url);
});
