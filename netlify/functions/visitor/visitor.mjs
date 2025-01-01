require("dotenv").config();

const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: { uri } }),
  };
};
