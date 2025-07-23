const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object) {
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.messages[0].from;
            const msg_body = body.entry[0].changes[0].value.messages[0].text.body;

            const dialogflowResponse = await axios.post(`https://dialogflow.googleapis.com/v2/projects/${process.env.DF_PROJECT_ID}/agent/sessions/${from}:detectIntent`, {
                queryInput: {
                    text: {
                        text: msg_body,
                        languageCode: 'en',
                    },
                },
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.DF_BEARER_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            const replyText = dialogflowResponse.data.queryResult.fulfillmentText;

            await axios.post(`https://graph.facebook.com/v18.0/${phone_number_id}/messages`, {
                messaging_product: 'whatsapp',
                to: from,
                text: { body: replyText },
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Dialogflow Bot is live');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));