import { Worker } from "bullmq";
import { env } from "./env.js";

// Email distribution worker — stub for Story 4-2
const distributionWorker = new Worker(
  "email-distribution",
  async (job) => {
    console.log(`[Worker] Distribution job received: ${job.id}`, job.data);
    // TODO: implement email sending in Story 4-2
  },
  { connection: { url: env.REDIS_URL } }
);

distributionWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

export { distributionWorker };
