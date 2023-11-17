import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import { router } from "./routers";
import { router as usersRouter } from "./routers/users";

const app = new Koa();
app.listen(3000);

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(usersRouter.routes());
app.use(usersRouter.allowedMethods());
