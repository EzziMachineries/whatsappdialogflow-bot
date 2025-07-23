const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "your_verify_token"; // Set this to match your webhook verify token
const DIALOGFLOW_WEBHOOK = "https://dialogflow.cloud.google.com/v1/integrations/messenger/webhook/your-dialogflow-endpoint"; // Replace with your Dialogflow webhook

// Webhook verification (GET)
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook message handler (POST)
app.post("/", async (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;

    if (messages && messages.length > 0) {
      const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = messages[0].from;
      const msg_body = messages[0].text?.body;

      console.log(Message from ${from}: ${msg_body});

      // Forward message to Dialogflow
      try {
        await axios.post(DIALOGFLOW_WEBHOOK, {
          queryInput: {
            text: {
              text: msg_body,
              languageCode: "en",
            },
          },
          originalDetectIntentRequest: {
            payload: {
              data: body,
            },
          },
          session: projects/your-dialogflow-project-id/agent/sessions/${from},
        });
      } catch (err) {
        console.error("Error forwarding to Dialogflow:", err.response?.data || err.message);
      }
    }
 res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});
