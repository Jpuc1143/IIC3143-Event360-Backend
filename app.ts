import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import { router } from "./routers";

const app = new Koa()
app.listen(3000)

app.use(bodyParser())

app.use(router.routes())
app.use(router.allowedMethods());
