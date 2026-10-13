const mongoose = require("mongoose");
const dns = require("node:dns");

function configureDns() {
  const configuredServers = process.env.MONGODB_DNS_SERVERS
    ?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (configuredServers?.length) {
    dns.setServers(configuredServers);
  } else if (dns.getServers().every((server) => ["127.0.0.1", "::1"].includes(server))) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  try {
    configureDns();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

module.exports = connectDB;
