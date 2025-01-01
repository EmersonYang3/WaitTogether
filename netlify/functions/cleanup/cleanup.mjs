const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const runCleanup = async () => {
  try {
    await client.connect();
    const database = client.db("UserData");
    const collection = database.collection("UserStats");

    const threshold = new Date(Date.now() - 2 * 60 * 1000);
    await collection.updateOne(
      { _id: "userStats", lastHeartbeat: { $lt: threshold } },
      { $set: { LiveUsers: 0 } }
    );

    console.log("Stale users cleaned up");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
};

runCleanup();
