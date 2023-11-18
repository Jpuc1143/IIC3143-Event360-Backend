import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import { router } from "./routers";
import { router as usersRouter } from "./routers/users";
import { Sequelize } from "sequelize-typescript";
import config from "./config/config.js";
import dotenv from "dotenv";
//import { getCurrentUser } from "./middlewares/get_current_user";
import jwt from "koa-jwt";
import { koaJwtSecret } from "jwks-rsa";

dotenv.config();

const app = new Koa();
app.listen(3000);

const sequelize = new Sequelize(config[process.env.NODE_ENV || "development"]);
sequelize.addModels([__dirname + "/models/*.ts"]);

sequelize
  .authenticate()
  .then(() => {
    app.context.db = sequelize;
    app.use(
      jwt({
        secret: koaJwtSecret({
          jwksUri: process.env.ISSUER_BASE_URL + ".well-known/jwks.json",
          cache: true,
          cacheMaxEntries: 5,
        }),
        //audience: process.env.AUDIENCE,
        issuer: process.env.ISSUER_BASE_URL,
        algorithms: ["RS256"],
        passthrough: true,
      }),
    );
    app.use(bodyParser());

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.use(usersRouter.routes());
    app.use(usersRouter.allowedMethods());
  })
  .catch((error) =>
    console.error("No se pudo conectar a la base de datos:", error),
  );
