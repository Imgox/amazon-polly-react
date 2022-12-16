import { PollyClient } from "@aws-sdk/client-polly";

const client = new PollyClient({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.REACT_APP_AMAZON_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AMAZON_SECRET_ACCESS_KEY,
  },
});

export default client;
