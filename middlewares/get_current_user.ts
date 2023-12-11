import User from "../models/user.js";

export async function getCurrentUser(ctx, next) {
  if (ctx.state.user === undefined) {
    ctx.state.currentUser = null;
  } else {
    const user = (
      await User.findOrCreate({
        where: { auth: ctx.state.user.sub },
      })
    )[0];
    ctx.state.currentUser = user;
  }

  await next();
}
