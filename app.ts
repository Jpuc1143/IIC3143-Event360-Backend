import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import { router } from "./routers";
import { router as usersRouter } from "./routers/users";
import { Sequelize } from "sequelize";
import { config } from "./config/config";
import dotenv from "dotenv";

dotenv.config();

const app = new Koa();
app.listen(3000);

console.log(config[process.env.NODE_ENV]);
console.log(process.env.NODE_ENV);
const sequelize = new Sequelize(config[process.env.NODE_ENV]);

sequelize
  .authenticate()
  .then(() => {
    app.use(bodyParser());

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.use(usersRouter.routes());
    app.use(usersRouter.allowedMethods());
  })
  .catch((error) =>
    console.error("No se pudo conectar a la base de datos:", error),
  );
