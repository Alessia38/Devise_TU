document.getElementById('currency-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    // Récupère les valeurs du formulaire
    const amount = document.getElementById('amount').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;

    console.log(`Converting ${amount} from ${from} to ${to}`); // Pour le débogage

    // Effectuer une requête à votre serveur Node.js (backend) pour récupérer le taux de change
    fetch(`/convert?amount=${amount}&from=${from}&to=${to}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Conversion data:', data); // Pour le débogage

            const { result, from, to, rate, date } = data;

            // Affiche le montant converti et des informations supplémentaires
            document.getElementById('result').innerHTML = `
                <p>${amount} ${from} = <strong>${result} ${to}</strong></p>
                <p>Taux de conversion : 1 ${from} = ${rate} ${to}</p>
                <p>Date du taux de change : ${new Date(date).toLocaleString()}</p>
            `;
        })
        .catch(err => console.error('Error fetching exchange rates:', err));
});
