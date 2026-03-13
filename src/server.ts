import express from 'express';
import bodyParser from 'body-parser';
import api from './aiService/api';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/assistant', async (req, res) => {
  const body = req.body;
  const prompt = body.prompt;
  if (!prompt) {
    return res.status(400).json({error: 'Prompt is required'});
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
  console.log(`Server running at http://localhost:${port}`);
});
