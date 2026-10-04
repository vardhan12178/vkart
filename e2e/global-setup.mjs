import { execSync } from "node:child_process";
import path from "node:path";

// Fresh, known data for every run: re-seed the API database and drop Redis
// caches (product lists/details are cached for minutes).
export default async function globalSetup() {
  const backendDir = process.env.E2E_BACKEND_DIR || path.resolve(process.cwd(), "../backend");
  const env = {
    ...process.env,
    MONGO_URI: process.env.E2E_MONGO_URI || "mongodb://localhost:27017/vkart_e2e?replicaSet=rs0&directConnection=true",
  };
  execSync("node scripts/seed-dev.js", { cwd: backendDir, env, stdio: "inherit" });

  const redisUrl = process.env.E2E_REDIS_URL || "redis://localhost:6379";
  execSync(
    `node --input-type=module -e "import Redis from 'ioredis'; const r = new Redis(process.argv[1]); await r.flushall(); r.disconnect();" "${redisUrl}"`,
    { cwd: backendDir, stdio: "inherit" }
  );
}
