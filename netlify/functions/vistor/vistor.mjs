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
  try {
    await client.connect();
    const database = client.db("UserData");
    const collection = database.collection("UserStats");

    let response;

    if (event.httpMethod === "POST") {
      await collection.updateMany(
        {},
        { $inc: { LiveUsers: 1, TotalUsers: 1 } }
      );
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: "User added to waitlist" }),
      };
    } else if (event.httpMethod === "DELETE") {
      await collection.updateMany({}, { $inc: { LiveUsers: -1 } });
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: "User removed from waitlist" }),
      };
    } else if (event.httpMethod === "GET") {
      const document = await collection.findOne({});
      response = {
        statusCode: 200,
        body: JSON.stringify({
          LiveUsers: document.LiveUsers,
          TotalUsers: document.TotalUsers,
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
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  } finally {
    await client.close();
  }
};
