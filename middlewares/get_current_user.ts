import User from "../models/user";

export async function getCurrentUser(ctx, next) {
  if (ctx.state.user === undefined) {
    ctx.state.currentUser = null;
  } else {
    const user = await User.findOrCreate({
      where: { auth: ctx.state.user.sub },
    });
    ctx.state.currentUser = user;
  }

  await next();
}
