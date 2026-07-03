const { spawn } = require("child_process");
const { MongoMemoryServer } = require("mongodb-memory-server");

const start = async () => {
  const mongo = await MongoMemoryServer.create();
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "5000",
      MONGO_URI: mongo.getUri(),
      JWT_SECRET: process.env.JWT_SECRET || "module-seven-live-secret",
    },
    stdio: "inherit",
  });

  const stop = async () => {
    child.kill("SIGTERM");
    await mongo.stop();
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  child.on("exit", async (code) => {
    await mongo.stop();
    process.exit(code || 0);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
