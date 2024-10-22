const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

// Clé API ExchangeRate-API
const apiKey = '91706be54d34dae617b7baff';

// Middleware pour servir les fichiers statiques (HTML, CSS, JS) depuis le dossier public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/convert', async (req, res) => {
    const { amount, from, to } = req.query;

    try {
        // Appel à l'API ExchangeRate-API pour obtenir les taux de change
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`);
        const rate = response.data.conversion_rates[to];
        const result = amount * rate;

        // Renvoie les informations nécessaires au front-end
        res.json({
            result: result.toFixed(2),
            from,
            to,
            amount,
            rate,
            date: response.data.time_last_update_utc
        });
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error fetching exchange rates' });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
