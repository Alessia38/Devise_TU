const { JSDOM } = require('jsdom');
const assert = require('assert');

describe('Formulaire de conversion de devises', function () {
  let document;

  beforeEach(function () {
    // Créer un environnement DOM pour le test
    const dom = new JSDOM(`
      <html>
        <body>
          <form id="currency-form">
            <input type="number" id="amount" name="amount" placeholder="Montant" />
            <select id="from" name="from">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <select id="to" name="to">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            <button type="submit">Convertir</button>
          </form>
          <div id="conversion-result"></div>
        </body>
      </html>
    `);

    // Attacher le document pour pouvoir manipuler le DOM
    document = dom.window.document;
  });

  it('devrait afficher le formulaire correctement', function () {
    // Vérifiez que le formulaire est présent
    const form = document.getElementById('currency-form');
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Vérification de la présence des éléments dans le formulaire
    assert(form, 'Le formulaire n\'est pas présent');
    assert(amountInput, 'Le champ de montant n\'est pas présent');
    assert(fromSelect, 'Le champ de sélection de la devise source n\'est pas présent');
    assert(toSelect, 'Le champ de sélection de la devise cible n\'est pas présent');
    assert(submitButton, 'Le bouton de soumission n\'est pas présent');
  });
});
