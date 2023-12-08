export async function verifyAdmin(ctx, next) {
  if (!ctx.state.currentUser.admin) {
    ctx.throw(401, "No tienes el nivel de autorización para hacer esto");
  }
  await next();
}
