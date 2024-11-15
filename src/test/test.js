const { JSDOM } = require('jsdom');
const sinon = require('sinon');
const assert = require('assert');

// Configuration d'un DOM simulé
const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <form id="currency-form">
          <input id="amount" value="100" />
          <input id="from" value="USD" />
          <input id="to" value="EUR" />
          <button type="submit">Convert</button>
        </form>
        <div id="result"></div>
      </body>
    </html>
`);

global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;

// Importer le fichier index.js
require('../index'); // Charge le script principal pour lier les événements

describe('Tests pour la conversion de devises', function() {
    let fetchStub;

    beforeEach(function() {
        // Stub pour simuler fetch avant chaque test
        fetchStub = sinon.stub(global, 'fetch');
    });

    afterEach(function() {
        // Restaurer fetch après chaque test
        fetchStub.restore();
    });

    it('devrait intercepter l\'événement de soumission du formulaire', function() {
        // Récupération du formulaire
        const form = document.getElementById('currency-form');
    
        // Espionner l'ajout d'événements sur le formulaire
        const spy = sinon.spy(form, 'addEventListener');
    
        // Charger le fichier `index.js` pour lier les événements
        delete require.cache[require.resolve('../index')]; // Efface le cache pour recharger correctement
        require('../index');
    
        // Vérifier si addEventListener a été appelé avec "submit"
        assert(spy.calledOnceWithExactly('submit', sinon.match.func), 
               'L\'événement submit n\'a pas été lié correctement');
    
        spy.restore(); // Restaurer l'état d'origine
    });
    
    

    it('devrait récupérer les valeurs du formulaire correctement', function() {
        const amount = document.getElementById('amount').value;
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;

        assert.strictEqual(amount, '100', 'Le montant récupéré est incorrect');
        assert.strictEqual(from, 'USD', 'La devise source récupérée est incorrecte');
        assert.strictEqual(to, 'EUR', 'La devise cible récupérée est incorrecte');
    });

    it('devrait appeler l\'API de conversion avec les bons paramètres', async function() {
        // Stub pour simuler une réponse réussie
        const mockResponse = Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                result: '85.00',
                from: 'USD',
                to: 'EUR',
                rate: '0.85',
                date: '2024-11-15',
            }),
        });
        fetchStub.returns(mockResponse);

        // Simuler la soumission du formulaire
        document.getElementById('amount').value = '100';
        document.getElementById('from').value = 'USD';
        document.getElementById('to').value = 'EUR';

        document.getElementById('currency-form').dispatchEvent(new Event('submit'));

        // Attendre que l'opération asynchrone soit exécutée
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Vérifier que `fetch` a été appelé une fois
        assert(fetchStub.calledOnce, 'fetch n\'a pas été appelé');

        // Vérifier que `fetch` a été appelé avec l'URL correcte
        const expectedUrl = '/convert?amount=100&from=USD&to=EUR';
        assert(fetchStub.calledWith(expectedUrl), 'fetch n\'a pas été appelé avec l\'URL attendue');
    });
});
    it('devrait gérer correctement les erreurs API', async function() {
        // Stub pour simuler une erreur réseau
        fetchStub.returns(Promise.reject(new Error('Network Error')));

        // Simuler la soumission du formulaire
        document.getElementById('amount').value = '100';
        document.getElementById('from').value = 'USD';
        document.getElementById('to').value = 'EUR';

        document.getElementById('currency-form').dispatchEvent(new Event('submit'));

        // Attendre que l'opération asynchrone soit exécutée
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Vérifier que `fetch` a été appelé malgré l'erreur
        assert(fetchStub.calledOnce, 'fetch n\'a pas été appelé');
    });

    it('devrait afficher le résultat de la conversion', function(done) {
        // Stub fetch pour simuler une réponse correcte
        fetchStub.resolves({
            ok: true,
            json: async () => ({
                result: '85.00',
                from: 'USD',
                to: 'EUR',
                rate: '0.85',
                date: '2024-11-15'
            })
        });

        // Simuler l'envoi du formulaire
        const form = document.getElementById('currency-form');
        form.dispatchEvent(new Event('submit'));

        setTimeout(() => {
            const resultHTML = document.getElementById('result').innerHTML;
            assert(resultHTML.includes('100 USD = <strong>85.00 EUR</strong>'), 'Le résultat affiché est incorrect');
            done();
        }, 100);
    });
