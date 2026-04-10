import app from "./app";
import { env } from "./lib/env";
import { startReminderJob } from "./jobs/reminders";
import { connectMongo } from "./lib/mongo";

async function bootstrap() {
  await connectMongo();
  app.listen(env.PORT, () => {
    console.log(`Event Browser API listening on ${env.PORT}`);
  });
  startReminderJob();
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
