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
        sinon.restore();
    });

    it('devrait intercepter l\'événement de soumission du formulaire', function() {
        // Créer un formulaire factice
        const form = document.getElementById('currency-form');
        
        // Espionner la méthode addEventListener
        const spy = sinon.spy(form, 'addEventListener');
    
        // Charger à nouveau le script principal pour attacher les événements
        require('../index'); // Assurez-vous que l'événement est lié ici
    
        // Vérifier que addEventListener a bien été appelé pour "submit"
        assert.strictEqual(spy.calledWith('submit'), true, 'L\'événement submit n\'a pas été lié correctement');
    
        spy.restore();
    });

    it('devrait récupérer les valeurs du formulaire correctement', function() {
        const amount = document.getElementById('amount').value;
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;

        assert.strictEqual(amount, '100', 'Le montant récupéré est incorrect');
        assert.strictEqual(from, 'USD', 'La devise source récupérée est incorrecte');
        assert.strictEqual(to, 'EUR', 'La devise cible récupérée est incorrecte');
    });

    it('devrait appeler l\'API de conversion avec les bons paramètres', function(done) {
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
            assert(fetchStub.calledOnce, 'fetch n\'a pas été appelé');
            assert(fetchStub.calledWithMatch('/convert?amount=100&from=USD&to=EUR'), 'Les paramètres fetch sont incorrects');
            done();
        }, 100);
    });

    it('devrait gérer correctement les erreurs API', function(done) {
        // Stub fetch pour simuler une erreur
        fetchStub.rejects(new Error('Network Error'));

        // Simuler l'envoi du formulaire
        const form = document.getElementById('currency-form');
        form.dispatchEvent(new Event('submit'));

        setTimeout(() => {
            assert(fetchStub.calledOnce, 'fetch n\'a pas été appelé');
            done();
        }, 100);
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
});
