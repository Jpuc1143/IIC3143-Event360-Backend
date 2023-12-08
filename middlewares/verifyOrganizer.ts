export async function verifyOrganizer(ctx, next) {
  if (ctx.state.currentUser.organizer !== "verified") {
    ctx.throw(403, "No estas verificado como organizador de eventos");
  }
  await next();
}
