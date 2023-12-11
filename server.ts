import { app } from "./app.js";
import { configureDatabase, closeDatabase } from "./database.js";

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    const db = await configureDatabase(false);

    app.context.db = db;

    const server = app.listen(PORT, () => {
      console.log(`Servidor Koa iniciado en http://localhost:${PORT}`);
    });

    // Maneja el cierre adecuado del servidor y la base de datos
    process.on("SIGINT", async () => {
      await closeDatabase();
      server.close(() => {
        console.log("Servidor cerrado.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
};

startServer();
