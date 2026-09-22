const mongoose = require("mongoose");

let cachedConnection = null;

async function connectDb(uri) {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!cachedConnection) {
    mongoose.set("strictQuery", true);
    cachedConnection = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
  }
  await cachedConnection;
  return mongoose.connection;
}

module.exports = { connectDb };
