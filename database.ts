import { Sequelize } from "sequelize-typescript";
import config from "./config/config.cjs";

const sequelize = new Sequelize(config[process.env.NODE_ENV || "development"]);
sequelize.addModels([__dirname + "/models/*.ts"]);

export const configureDatabase = async (): Promise<Sequelize> => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente.");
    await sequelize.sync();
    return sequelize;
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    throw error;
  }
};

export const getDatabase = (): Sequelize => {
  return sequelize;
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log("Conexión a la base de datos cerrada correctamente.");
  } catch (error) {
    console.error("Error al cerrar la conexión con la base de datos:", error);
    throw error;
  }
};
