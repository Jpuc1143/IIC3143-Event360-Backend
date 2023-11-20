import { app } from "./app";
import { Sequelize } from "sequelize-typescript";
import config from "./config/config.js";

const PORT = process.env.PORT || 3000;

const sequelize = new Sequelize(config[process.env.NODE_ENV || "development"]);
sequelize.addModels([__dirname + "/models/*.ts"]);

sequelize
  .authenticate()
  .then(() => {
    app.context.db = sequelize;
    app.listen(PORT);
    return app;
  })
  .catch((err) => console.error("Unable to connect to the database:", err));

export { app };
