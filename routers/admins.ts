import Router from "@koa/router";
import User from "../models/user.js";
import { verifyLogin } from "../middlewares/verifyLogin.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

export const router = new Router({ prefix: "/admins" });

router.get("/petitions", verifyLogin, verifyAdmin, async (ctx, next) => {
  const users = await User.findAll({ where: { organizer: "pending" } });
  ctx.response.body = users;
  await next();
});

router.patch("/:id/make_admin", verifyLogin, async (ctx, next) => {
  const user = await User.findByPk(ctx.params.id);
  if (user === null) {
    ctx.throw(404, "Usuario no encontrado");
  }
  user.admin = true;
  await user.save();
  ctx.response.body = user;
  await next();
});

router.patch("/:id/verify", verifyLogin, verifyAdmin, async (ctx, next) => {
  const user = await User.findByPk(ctx.params.id);
  if (user === null) {
    ctx.throw(404, "Usuario no encontrado");
  }
  const verdict = ctx.request.body;
  user.organizer = verdict.answer ? "verified" : "unsolicited";
  await user.save();
  ctx.response.body = user;
  await next();
});
