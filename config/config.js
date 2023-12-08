require("dotenv").config();
module.exports = {
  development: {
    url: process.env.DB_URI || "sqlite:///db.sqlite",
    dialect: process.env.DB_DIALECT || "sqlite",
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
