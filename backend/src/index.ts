import app from "./app";
import { env } from "./lib/env";
import { startReminderJob } from "./jobs/reminders";

app.listen(env.PORT, () => {
  console.log(`Event Browser API listening on ${env.PORT}`);
});

startReminderJob();
