import { configDotenv } from "dotenv";
configDotenv();

export default {
  development: {
    storage: "./db.sqlite",
    dialect: "sqlite",
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
  production: {
    url: process.env.DB_URI,
    dialect: process.env.DB_DIALECT,
  },
};
