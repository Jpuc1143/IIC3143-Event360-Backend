export async function verifyLogin(ctx, next) {
  if (ctx.state.currentUser === null) {
    ctx.throw(401, "No autorizado");
  }
  await next();
}
