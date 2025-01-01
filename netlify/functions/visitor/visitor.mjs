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

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    console.time("MongoDB Connection");
    await client.connect();
    console.timeEnd("MongoDB Connection");
    const database = client.db("UserData");
    const collection = database.collection("UserStats");

    let response;

    if (event.httpMethod === "POST") {
      console.time("POST Request");
      await collection.updateMany(
        {},
        { $inc: { LiveUsers: 1, TotalUsers: 1 } }
      );
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: "User added to waitlist" }),
      };
      console.timeEnd("POST Request");
    } else if (event.httpMethod === "DELETE") {
      console.time("DELETE Request");
      await collection.updateMany({}, { $inc: { LiveUsers: -1 } });
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: "User removed from waitlist" }),
      };
      console.timeEnd("DELETE Request");
    } else if (event.httpMethod === "GET") {
      console.time("GET Request");
      const document = await collection.findOne({});
      response = {
        statusCode: 200,
        body: JSON.stringify({
          LiveUsers: document.LiveUsers,
          TotalUsers: document.TotalUsers,
        }),
      };
      console.timeEnd("GET Request");
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
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  } finally {
    console.time("MongoDB Disconnection");
    await client.close();
    console.timeEnd("MongoDB Disconnection");
  }
};
