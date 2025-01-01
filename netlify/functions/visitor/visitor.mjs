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

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connected to MongoDB successfully!" }),
    };
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
    console.time("MongoDB Disconnection");
    await client.close();
    console.timeEnd("MongoDB Disconnection");
  }
};
