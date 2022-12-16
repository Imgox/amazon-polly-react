import { PollyClient } from "@aws-sdk/client-polly";

const client = new PollyClient({
  region: "eu-west-3",
  credentials: {
    accessKeyId: "AKIAWFEAMNQCKPI7HAPV",
    secretAccessKey: "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",
  },
});

export default client;
