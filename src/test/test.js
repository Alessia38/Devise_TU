const { JSDOM } = require('jsdom');
const sinon = require('sinon');
const assert = require('assert');

describe('Tests pour la conversion de devises', function () {
    let dom;
    let document;
    let fetchStub;

    beforeEach(function () {
        // Configurer un DOM virtuel avec jsdom
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <form id="currency-form">
                        <input id="amount" type="text" />
                        <select id="from">
                            <option value="USD" selected>USD</option>
                        </select>
                        <select id="to">
                            <option value="EUR" selected>EUR</option>
                        </select>
                        <button type="submit">Convert</button>
                    </form>
                    <div id="conversion-result"></div>
                </body>
            </html>
        `);

        // Extraire le document simulé
        document = dom.window.document;

        // Stub pour fetch
        fetchStub = sinon.stub(global, 'fetch');
    });

    afterEach(function () {
        // Restaurer fetch après chaque test
        fetchStub.restore();
    });

    it('devrait gérer correctement les erreurs API', async function () {
        // Simuler une erreur réseau
        fetchStub.returns(Promise.reject(new Error('Network Error')));

        // Simuler une interaction utilisateur
        document.getElementById('amount').value = '100';
        document.getElementById('from').value = 'USD';
        document.getElementById('to').value = 'EUR';

        document.getElementById('currency-form').dispatchEvent(new dom.window.Event('submit'));

        // Attendre que l'événement soit traité
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Vérifier que fetch a été appelé
        assert(fetchStub.calledOnce, 'fetch n\'a pas été appelé');
    });

    it('devrait afficher le résultat de la conversion', async function () {
        // Simuler une réponse API réussie
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

        // Simuler une interaction utilisateur
        document.getElementById('amount').value = '100';
        document.getElementById('from').value = 'USD';
        document.getElementById('to').value = 'EUR';

        document.getElementById('currency-form').dispatchEvent(new dom.window.Event('submit'));

        // Attendre que l'événement soit traité
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Vérifier que le résultat est affiché
        const result = document.getElementById('conversion-result').textContent;
        assert.strictEqual(result, '85.00', 'Le résultat affiché est incorrect');
    });

    it('devrait appeler l\'API de conversion avec les bons paramètres', async function () {
        // Simuler une réponse API réussie
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

        // Simuler une interaction utilisateur
        document.getElementById('amount').value = '100';
        document.getElementById('from').value = 'USD';
        document.getElementById('to').value = 'EUR';

        document.getElementById('currency-form').dispatchEvent(new dom.window.Event('submit'));

        // Attendre que l'événement soit traité
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Vérifier que fetch a été appelé avec les bons paramètres
        const expectedUrl = '/convert?amount=100&from=USD&to=EUR';
        assert(fetchStub.calledWith(expectedUrl), 'fetch n\'a pas été appelé avec les bons paramètres');
    });
});
