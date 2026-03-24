const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE;
const LINE_TOKEN = process.env.LINE_TOKEN;

app.post('/webhook', async (req, res) => {
  res.status(200).json({ status: 'ok' }); // ตอบ LINE ทันที

  const events = req.body.events;
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId;
      const message = event.message.text;
      const replyToken = event.replyToken;

      await saveToAirtable(userId, message);
      await replyToLine(replyToken, 'รับออเดอร์แล้วค่ะ ขอบคุณ! 🙏');
    }
  }
});

async function saveToAirtable(userId, message) {
  await axios.post(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`,
    { fields: { 'User ID': userId, 'Message': message, 'Timestamp': new Date().toISOString() }},
    { headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }}
  );
}

async function replyToLine(replyToken, text) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    { replyToken, messages: [{ type: 'text', text }] },
    { headers: { 'Authorization': `Bearer ${LINE_TOKEN}` }}
  );
}

app.listen(3000, () => console.log('Bot running!'));
