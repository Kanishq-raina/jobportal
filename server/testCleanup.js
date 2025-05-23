// testCleanup.js
import { runCleanup } from "./cronJob.js";

(async () => {
  console.log("🧪 Manually testing cleanup of old auth requests...");
  await runCleanup();
  console.log("✅ Manual cleanup complete.");
})();
