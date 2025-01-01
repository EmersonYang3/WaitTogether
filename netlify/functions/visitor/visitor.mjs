const { MongoClient, ServerApiVersion } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await client.connect();
    const database = client.db("UserData");
    const collection = database.collection("UserStats");

    let response;

    if (event.httpMethod === "POST") {
      const userId = uuidv4();
      await collection.updateOne(
        { _id: "userStats" },
        { $inc: { LiveUsers: 1 }, $set: { [`users.${userId}`]: new Date() } },
        { upsert: true }
      );
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: "User added to waitlist", userId }),
      };
    } else if (event.httpMethod === "DELETE") {
      const { userId } = JSON.parse(event.body);
      await collection.updateOne(
        { _id: "userStats" },
        { $inc: { LiveUsers: -1 }, $unset: { [`users.${userId}`]: "" } },
        { upsert: true }
      );
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: "User removed from waitlist" }),
      };
    } else if (event.httpMethod === "GET") {
      const document = await collection.findOne({ _id: "userStats" });

      const now = new Date();
      const threshold = new Date(now - 2 * 60 * 1000);
      const users = document.users || {};
      let liveUsers = document.LiveUsers || 0;

      Object.keys(users).forEach((userId) => {
        if (new Date(users[userId]) < threshold) {
          liveUsers -= 1;
          delete users[userId];
        }
      });

      await collection.updateOne(
        { _id: "userStats" },
        { $set: { LiveUsers: liveUsers, users } }
      );

      response = {
        statusCode: 200,
        body: JSON.stringify({
          LiveUsers: liveUsers,
          TotalUsers: document.TotalUsers || 0,
        }),
      };
    } else {
      response = {
        statusCode: 405,
        body: "Method Not Allowed",
      };
    }

    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  } finally {
    await client.close();
  }
};
