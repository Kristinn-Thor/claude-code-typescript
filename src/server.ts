import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import api from './aiService/api.js';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('ping');
});

app.post('/assistant', async (req, res) => {
  const body = req.body;
  const prompt = body.prompt;
  const chat_history = body.chat_history;
  if (!prompt) {
    return res.status(400).json({error: 'Prompt is required'});
  }
  if (chat_history && !Array.isArray(chat_history)) {
    return res
      .status(400)
      .json({error: 'chat_history must be an array if provided'});
  }
  try {
    const response = await api({
      prompt,
      chat_history: body.chat_history,
    });
    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

app.listen(port, () => {
  if (!process.env.RENDER || process.env.RENDER === 'false') {
    console.log(`Server running at http://localhost:${port}`);
  } else {
    console.log(`Server running on port ${port}`);
  }
});
