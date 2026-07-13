import { buildApp } from "./app.js";

const app = await buildApp();
const { PORT: port, HOST: host } = app.config;

const shutdown = async (signal: NodeJS.Signals) => {
  app.log.info({ signal }, "Shutting down server");

  try {
    await app.close();
  } catch (error) {
    app.log.error(error, "Failed to shut down server gracefully");
    process.exitCode = 1;
  }
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ port, host });
  app.log.info(`Server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
