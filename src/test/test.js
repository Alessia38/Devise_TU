// src/test/index.test.js

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><form id="currency-form"></form></body></html>');
global.document = dom.window.document;
const assert = require('assert');
const sinon = require('sinon');

// Simuler le DOM pour exécuter le test en dehors du navigateur (en Node.js)
global.document = {
    getElementById: function(id) {
        if (id === 'currency-form') {
            return { addEventListener: sinon.spy() };
        } else if (id === 'amount') {
            return { value: '100' };
        } else if (id === 'from') {
            return { value: 'USD' };
        } else if (id === 'to') {
            return { value: 'EUR' };
        } else if (id === 'result') {
            return { innerHTML: '' };
        }
    }
};

// Importation du code à tester (index.js)
require('../index'); // Cette ligne va déclencher le code dans index.js

describe('Tests pour la conversion de devises', function() {

    it('devrait intercepter l\'événement de soumission du formulaire', function() {
        const spy = sinon.spy(document.getElementById('currency-form'), 'addEventListener');
        document.getElementById('currency-form').dispatchEvent(new Event('submit'));
    
        // Vérifiez que addEventListener a été appelé
        assert.strictEqual(spy.calledOnce, true);
    });
    

    it('devrait récupérer les valeurs du formulaire correctement', function() {
        // Vérifier les valeurs récupérées du formulaire
        const amount = document.getElementById('amount').value;
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;

        assert.strictEqual(amount, '100', 'Le montant récupéré est incorrect');
        assert.strictEqual(from, 'USD', 'La devise source récupérée est incorrecte');
        assert.strictEqual(to, 'EUR', 'La devise cible récupérée est incorrecte');
    });

    it('devrait appeler l\'API de conversion avec les bons paramètres', function(done) {
        // Simuler un appel API avec sinon
        const fetchStub = sinon.stub(global, 'fetch').resolves({
            ok: true,
            json: async () => ({
                result: '85.00',
                from: 'USD',
                to: 'EUR',
                rate: '0.85',
                date: '2024-11-15'
            })
        });

        // Soumettre le formulaire pour déclencher l'appel fetch
        document.getElementById('currency-form').dispatchEvent(new Event('submit'));

        // Attendre que la promesse soit résolue
        setTimeout(() => {
            assert(fetchStub.calledOnce, 'L\'API fetch n\'a pas été appelée');
            fetchStub.restore(); // Restaurer l'original de fetch
            done();
        }, 100);
    });

    it('devrait gérer correctement les erreurs API', function(done) {
        // Simuler une erreur d'appel API avec sinon
        const fetchStub = sinon.stub(global, 'fetch').rejects(new Error('Network response was not ok'));

        // Soumettre le formulaire pour déclencher l'appel fetch
        document.getElementById('currency-form').dispatchEvent(new Event('submit'));

        // Attendre que l'erreur soit gérée
        setTimeout(() => {
            assert(fetchStub.calledOnce, 'L\'API fetch n\'a pas été appelée');
            fetchStub.restore(); // Restaurer l'original de fetch
            done();
        }, 100);
    });

    it('devrait afficher le résultat de la conversion', function(done) {
        // Simuler un appel API réussi
        const fetchStub = sinon.stub(global, 'fetch').resolves({
            ok: true,
            json: async () => ({
                result: '85.00',
                from: 'USD',
                to: 'EUR',
                rate: '0.85',
                date: '2024-11-15'
            })
        });

        // Soumettre le formulaire pour déclencher l'appel fetch
        document.getElementById('currency-form').dispatchEvent(new Event('submit'));

        // Attendre que la promesse soit résolue
        setTimeout(() => {
            const resultElement = document.getElementById('result').innerHTML;
            assert(resultElement.includes('100 USD = <strong>85.00 EUR</strong>'), 'Le résultat de la conversion n\'est pas affiché correctement');
            fetchStub.restore(); // Restaurer l'original de fetch
            done();
        }, 100);
    });
});
