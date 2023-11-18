import User from "../models/user";

export async function getCurrentUser(ctx, next) {
  const user = User.findOne({ where: { auth: "a" } });
  if (user === null) {
    ctx.state.currentUser = user;
  } else {
    ctx.state.currentUser = null;
  }

  await next();
}
