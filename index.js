const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// ✅ GET route to verify webhook with Meta (very important!)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'ezzibot123'; // Must match Meta's verify token

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed');
      res.sendStatus(403);
  }
  } else {
    res.sendStatus(400);
  }
});

// ✅ POST route to handle incoming WhatsApp messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message) {
      const phone_number_id = change.value.metadata.phone_number_id;
      const from = message.from;
      const msg_body = message.text.body;

      console.log(📩 New message from ${from}: ${msg_body});

      // Add your Dialogflow or reply logic here

  }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(✅ Server running on port ${PORT});
});

