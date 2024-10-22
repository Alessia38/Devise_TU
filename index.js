const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/convert', async (req, res) => {
    const { amount, from, to } = req.query;

    try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const rate = response.data.rates[to];
        const result = amount * rate;
        res.json({ result: result.toFixed(2) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exchange rates' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
