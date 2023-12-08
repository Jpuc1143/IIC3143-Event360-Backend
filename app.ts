import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import dotenv from "dotenv";
import { getCurrentUser } from "./middlewares/get_current_user";
import jwt from "koa-jwt";
import { koaJwtSecret } from "jwks-rsa";
import cors from "@koa/cors";
import { router } from "./routers";
import { router as usersRouter } from "./routers/users";
import { router as adminsRouter } from "./routers/admins";
import { router as eventsRouter } from "./routers/events";
import { router as ticketsRouter } from "./routers/tickets";
import { router as ticketTypesRouter } from "./routers/ticketTypes";

dotenv.config();

const app = new Koa();

app.use(cors({ origin: "*" }));

app.use(bodyParser());

app.use(
  jwt({
    secret: koaJwtSecret({
      jwksUri: process.env.ISSUER_BASE_URL + ".well-known/jwks.json",
      cache: true,
      cacheMaxEntries: 5,
    }),
    audience: process.env.AUDIENCE,
    issuer: process.env.ISSUER_BASE_URL,
    algorithms: ["RS256"],
    passthrough: true,
  }),
);

// app.use(async (ctx, next) => {
//   console.log(ctx.state.jwtOriginalError);
//   await next();
// });

app.use(getCurrentUser);

app.use(router.routes());
app.use(router.allowedMethods());

app.use(usersRouter.routes());
app.use(usersRouter.allowedMethods());

app.use(adminsRouter.routes());
app.use(adminsRouter.allowedMethods());

app.use(eventsRouter.routes());
app.use(eventsRouter.allowedMethods());

app.use(ticketsRouter.routes());
app.use(ticketsRouter.allowedMethods());

app.use(ticketTypesRouter.routes());
app.use(ticketTypesRouter.allowedMethods());

export { app };
