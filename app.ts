import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import { router } from "./routers";
import { router as usersRouter } from "./routers/users";
import { router as eventsRouter } from "./routers/events";
import dotenv from "dotenv";
import { getCurrentUser } from "./middlewares/get_current_user";
import jwt from "koa-jwt";
import { koaJwtSecret } from "jwks-rsa";
import cors from "@koa/cors";

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

app.use(eventsRouter.routes());
app.use(eventsRouter.allowedMethods());

export { app };
