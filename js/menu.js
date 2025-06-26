let menuData = null;
let ristorante = null;
let numeroTavolo = 1;
let nomeCliente = "Cliente";

// Sistema di notifiche personalizzate
function mostraNotifica(messaggio, tipo = 'info', durata = 4000) {
    // Rimuovi notifiche esistenti dello stesso tipo
    const notificheEsistenti = document.querySelectorAll(`.notifica-${tipo}`);
    notificheEsistenti.forEach(n => n.remove());

    const notifica = document.createElement('div');
    notifica.className = `notifica notifica-${tipo}`;

    // Icone per ogni tipo
    const icone = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    // Colori per ogni tipo
    const colori = {
        success: { bg: '#4caf50', border: '#388e3c' },
        error: { bg: '#f44336', border: '#d32f2f' },
        warning: { bg: '#ff9800', border: '#f57c00' },
        info: { bg: '#2196f3', border: '#1976d2' }
    };

    const colore = colori[tipo] || colori.info;

    notifica.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colore.bg};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        border-left: 4px solid ${colore.border};
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: inherit;
        font-size: 14px;
        min-width: 280px;
        max-width: 400px;
        transform: translateX(420px);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    notifica.innerHTML = `
        <span style="font-size: 18px;">${icone[tipo]}</span>
        <span style="flex: 1;">${messaggio}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
            opacity: 0.7;
            transition: opacity 0.2s;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">&times;</button>
    `;

    document.body.appendChild(notifica);

    // Animazione di ingresso
    setTimeout(() => {
        notifica.style.transform = 'translateX(0)';
    }, 10);

    // Auto-rimozione
    setTimeout(() => {
        notifica.style.transform = 'translateX(420px)';
        notifica.style.opacity = '0';
        setTimeout(() => {
            if (notifica.parentElement) {
                notifica.remove();
            }
        }, 300);
    }, durata);

    return notifica;
}

// Modal di conferma personalizzato
function mostraConferma(messaggio, onConferma, onAnnulla = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(3px);
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        min-width: 320px;
        max-width: 90vw;
        text-align: center;
        animation: modalSlideIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 48px;">❓</div>
        <h3 style="margin: 0 0 16px 0; color: #333;">Conferma</h3>
        <p style="margin: 0 0 24px 0; color: #666; line-height: 1.5;">${messaggio}</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="btnConfermaModal" style="
                background: #4caf50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s;
            " onmouseover="this.style.background='#388e3c'" onmouseout="this.style.background='#4caf50'">
                ✓ Conferma
            </button>
            <button id="btnAnnullaModal" style="
                background: #9e9e9e;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s;
            " onmouseover="this.style.background='#757575'" onmouseout="this.style.background='#9e9e9e'">
                ✕ Annulla
            </button>
        </div>
    `;

    // Aggiungi animazione CSS
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes modalSlideIn {
                from { transform: scale(0.7); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function chiudiModal() {
        document.body.style.overflow = '';
        overlay.remove();
    }

    document.getElementById('btnConfermaModal').onclick = () => {
        chiudiModal();
        if (onConferma) onConferma();
    };

    document.getElementById('btnAnnullaModal').onclick = () => {
        chiudiModal();
        if (onAnnulla) onAnnulla();
    };

    // Chiudi con ESC
    function handleEsc(e) {
        if (e.key === 'Escape') {
            chiudiModal();
            if (onAnnulla) onAnnulla();
            document.removeEventListener('keydown', handleEsc);
        }
    }
    document.addEventListener('keydown', handleEsc);

    return overlay;
}

// Carica i dati del menu
function caricaMenu() {
    fetch('data/menu_data.json')
        .then(response => response.json())
        .then(data => {
            menuData = data;
            ristorante = data.ristorante;
            generaMenu();
            mostraNotifica('Menu caricato con successo!', 'success', 2000);
        })
        .catch(error => {
            console.error('Errore nel caricamento del menu:', error);
            mostraNotifica('Errore nel caricamento del menu. Verifica che il file data/menu_data.json sia presente.', 'error', 6000);
        });
}

// Mostra il modal per inserire i dati del cliente
function mostraModalCliente() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: #fff;
        padding: 32px 24px;
        border-radius: 10px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.2);
        min-width: 320px;
        max-width: 90vw;
    `;
    modal.innerHTML = `
        <h3 class="w3-text-teal">Informazioni Ordine</h3>
        <label>Numero Tavolo:</label>
        <input type="number" id="inputTavolo" value="${numeroTavolo}" class="w3-input w3-border w3-round w3-margin-bottom" min="1" autofocus>
        <label>Nome Cliente (opzionale):</label>
        <input type="text" id="inputCliente" value="${nomeCliente}" class="w3-input w3-border w3-round w3-margin-bottom">
        <div class="w3-margin-top">
            <button class="w3-button btn-salva w3-round" id="btnConfermaCliente">Conferma</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Funzione interna per confermare
    function confermaCliente() {
        numeroTavolo = document.getElementById('inputTavolo').value;
        nomeCliente = document.getElementById('inputCliente').value || "Cliente";
        if (numeroTavolo < 1) {
            mostraNotifica('Numero tavolo non valido. Deve essere maggiore di 0.', 'error', 5000);
            return;
        }
        document.body.style.overflow = '';
        overlay.remove();
        aggiornaTavoloDisplay();
    }

    // Event listeners
    document.getElementById('btnConfermaCliente').onclick = confermaCliente;
    modal.querySelector('#inputCliente').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confermaCliente();
    });
    modal.querySelector('#inputTavolo').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confermaCliente();
    });
}

function aggiornaTavoloDisplay() {
    // Aggiungi info tavolo sopra al menu se non esiste
    let tavoloInfo = document.getElementById('tavolo-info');
    if (!tavoloInfo) {
        const menuContainer = document.querySelector('.w3-white');
        tavoloInfo = document.createElement('div');
        tavoloInfo.id = 'tavolo-info';
        tavoloInfo.className = 'w3-panel w3-blue w3-round w3-margin-bottom';
        tavoloInfo.style.textAlign = 'center';
        menuContainer.insertBefore(tavoloInfo, menuContainer.firstChild);
    }
    tavoloInfo.innerHTML = `<strong>Tavolo: ${numeroTavolo} - ${nomeCliente}</strong>`;
}

function generaMenu() {
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = '';

    menuData.categorie.forEach(categoria => {
        // Crea categoria
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'categoria';
        categoriaDiv.textContent = categoria.nome;
        menuContainer.appendChild(categoriaDiv);

        // Crea container per sottocategorie
        const rowDiv = document.createElement('div');
        rowDiv.className = 'w3-row-padding';
        rowDiv.style.marginLeft = '10px';
        menuContainer.appendChild(rowDiv);

        categoria.sottocategorie.forEach(sottocategoria => {
            const subcatDiv = document.createElement('div');
            subcatDiv.className = 'w3-padding w3-margin-bottom';

            let html = '';
            if (sottocategoria.nome) {
                html += `<div class="w3-text-grey" style="font-size:1em;">${sottocategoria.nome}</div>`;
            }

            sottocategoria.items.forEach(item => {
                let allergeniHtml = '';
                if (item.allergeni && item.allergeni.length > 0) {
                    allergeniHtml = '<div class="allergeni">';
                    item.allergeni.forEach(allergene => {
                        const classeAllergene = ['glutine', 'latte', 'uova', 'pesce', 'crostacei', 'molluschi', 'frutta a guscio', 'arachidi', 'soia', 'sesamo'].includes(allergene.toLowerCase()) ? 'allergene importante' : 'allergene';
                        allergeniHtml += `<span class="${classeAllergene}">${allergene}</span>`;
                    });
                    allergeniHtml += '</div>';
                }

                html += `
                    <div class="menu-item">
                        <div class="menu-item-content">
                            <div class="menu-item-nome">${item.nome}</div>
                            ${item.descrizione ? `<div class="descrizione">${item.descrizione}</div>` : ''}
                            ${allergeniHtml}
                        </div>
                        <div class="menu-item-controls">
                            <input type="number" min="0" value="0" data-prezzo="${item.prezzo}" data-tipo="${item.tipo}"
                                class="quantita-input w3-input w3-border w3-round">
                            <div class="prezzo">€${item.prezzo.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            });

            subcatDiv.innerHTML = html;
            rowDiv.appendChild(subcatDiv);
        });
    });

    // Aggiungi event listeners agli input
    document.querySelectorAll('.quantita-input').forEach(input => {
        input.addEventListener('input', aggiornaTotale);
    });

    aggiornaTotale();
    aggiungiRicerca();
}

function aggiungiRicerca() {
    const menuContainer = document.getElementById('menu');
    const searchHtml = `
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Cerca piatti..." class="search-input w3-input w3-border">
            <div class="filter-buttons">
                <button class="w3-button filter-btn active" onclick="filtraPerTipo('tutti')">Tutti</button>
                <button class="w3-button filter-btn" onclick="filtraPerTipo('cucina')">Cucina</button>
                <button class="w3-button filter-btn" onclick="filtraPerTipo('bar')">Bar</button>
                <button class="w3-button filter-btn" onclick="filtraPerAllergeni()">Senza Allergeni</button>
            </div>
        </div>
    `;
    menuContainer.insertAdjacentHTML('beforebegin', searchHtml);

    document.getElementById('searchInput').addEventListener('input', cercaPiatti);
}

function cercaPiatti() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const nome = item.querySelector('.menu-item-nome').textContent.toLowerCase();
        const descrizione = item.querySelector('.descrizione')?.textContent.toLowerCase() || '';

        if (nome.includes(searchTerm) || descrizione.includes(searchTerm)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function filtraPerTipo(tipo) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const input = item.querySelector('.quantita-input');
        const tipoItem = input.dataset.tipo;

        if (tipo === 'tutti' || tipoItem === tipo) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function filtraPerAllergeni() {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const allergeni = item.querySelector('.allergeni');
        if (!allergeni || allergeni.children.length === 0) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function aggiornaTotale() {
    let totale = 0;
    const inputs = document.querySelectorAll('.quantita-input');
    inputs.forEach(input => {
        const quantita = parseInt(input.value, 10) || 0;
        const prezzo = parseFloat(input.dataset.prezzo) || 0;
        totale += quantita * prezzo;
    });

    const totaleEl = document.getElementById("totale");
    totaleEl.innerText = "Totale: €" + totale.toFixed(2);

}

function salvaOrdineCorrente() {
    const ordine = {
        id: Date.now(),
        tavolo: numeroTavolo,
        cliente: nomeCliente,
        data: new Date().toISOString(),
        items: [],
        totale: 0
    };

    document.querySelectorAll('.quantita-input').forEach(input => {
        const quantita = parseInt(input.value) || 0;
        if (quantita > 0) {
            const menuItem = input.closest('.menu-item');
            const nome = menuItem.querySelector('.menu-item-nome').textContent;
            const prezzo = parseFloat(input.dataset.prezzo);

            ordine.items.push({
                nome,
                quantita,
                prezzo,
                tipo: input.dataset.tipo
            });
            ordine.totale += quantita * prezzo;
        }
    });

    // Salva in localStorage
    const ordini = JSON.parse(localStorage.getItem('ordini') || '[]');
    ordini.push(ordine);
    localStorage.setItem('ordini', JSON.stringify(ordini));

    return ordine;
}

function stampaFattura() {
    const checkboxes = document.querySelectorAll('.quantita-input');
    const selezionati = Array.from(checkboxes).filter(cb => parseInt(cb.value, 10) > 0);
    if (selezionati.length === 0) {
        mostraNotifica('Nessun elemento selezionato per la stampa', 'warning');
        return;
    }

    // Mostra il riepilogo prima di stampare
    mostraRiepilogoOrdine(selezionati);
}

function mostraRiepilogoOrdine(selezionati) {
    // Separa per tipo
    const selezionatiBar = selezionati.filter(cb => cb.dataset.tipo === "bar");
    const selezionatiCucina = selezionati.filter(cb => cb.dataset.tipo === "cucina");

    // Calcola totali
    let totaleBar = selezionatiBar.reduce((acc, cb) => acc + (parseFloat(cb.dataset.prezzo) * (parseInt(cb.value, 10) || 0)), 0);
    let totaleCucina = selezionatiCucina.reduce((acc, cb) => acc + (parseFloat(cb.dataset.prezzo) * (parseInt(cb.value, 10) || 0)), 0);
    let totaleGenerale = totaleBar + totaleCucina;

    // Crea l'overlay per il modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        padding: 20px;
    `;

    // Crea il contenuto del modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: #fff;
        padding: 24px;
        border-radius: 10px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.2);
        min-width: 400px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
    `;

    // Genera HTML del riepilogo
    let riepilogoHTML = `
        <div class="modal-content">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <h3 class="w3-text-teal" style="margin: 0;">Riepilogo Ordine</h3>
                <button class="w3-button w3-red w3-round" style="font-size: 1.2em; padding: 8px 12px;" onclick="chiudiRiepilogo()">&times;</button>
            </div>

            <div class="w3-panel w3-blue w3-round" style="text-align: center; margin-bottom: 20px;">
                <strong>Tavolo: ${numeroTavolo} - ${nomeCliente}</strong>
            </div>
    `;

    // Sezione Bar
    if (selezionatiBar.length > 0) {
        riepilogoHTML += `
            <div class="w3-card w3-margin-bottom w3-padding">
                <h4 class="w3-text-blue">🍹 Ordine Bar</h4>
                <table class="w3-table w3-striped">
                    <thead>
                        <tr class="w3-light-grey">
                            <th>Prodotto</th>
                            <th style="text-align:center;">Quantità</th>
                            <th style="text-align:right;">Prezzo Unit.</th>
                            <th style="text-align:right;">Totale</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        selezionatiBar.forEach(cb => {
            const menuItem = cb.closest('.menu-item');
            const nome = menuItem.querySelector('.menu-item-nome').textContent.trim();
            const quantita = parseInt(cb.value, 10);
            const prezzo = parseFloat(cb.dataset.prezzo);
            const totaleRiga = quantita * prezzo;

            riepilogoHTML += `
                <tr>
                    <td>${nome}</td>
                    <td style="text-align:center;">${quantita}</td>
                    <td style="text-align:right;">€${prezzo.toFixed(2)}</td>
                    <td style="text-align:right;">€${totaleRiga.toFixed(2)}</td>
                </tr>
            `;
        });

        riepilogoHTML += `
                    </tbody>
                </table>
                <div style="text-align:right; font-weight:bold; margin-top:10px;">
                    Subtotale Bar: €${totaleBar.toFixed(2)}
                </div>
            </div>
        `;
    }

    // Sezione Cucina
    if (selezionatiCucina.length > 0) {
        riepilogoHTML += `
            <div class="w3-card w3-margin-bottom w3-padding">
                <h4 class="w3-text-teal">🍽️ Ordine Cucina</h4>
                <table class="w3-table w3-striped">
                    <thead>
                        <tr class="w3-light-grey">
                            <th>Prodotto</th>
                            <th style="text-align:center;">Quantità</th>
                            <th style="text-align:right;">Prezzo Unit.</th>
                            <th style="text-align:right;">Totale</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        selezionatiCucina.forEach(cb => {
            const menuItem = cb.closest('.menu-item');
            const nome = menuItem.querySelector('.menu-item-nome').textContent.trim();
            const quantita = parseInt(cb.value, 10);
            const prezzo = parseFloat(cb.dataset.prezzo);
            const totaleRiga = quantita * prezzo;

            riepilogoHTML += `
                <tr>
                    <td>${nome}</td>
                    <td style="text-align:center;">${quantita}</td>
                    <td style="text-align:right;">€${prezzo.toFixed(2)}</td>
                    <td style="text-align:right;">€${totaleRiga.toFixed(2)}</td>
                </tr>
            `;
        });

        riepilogoHTML += `
                    </tbody>
                </table>
                <div style="text-align:right; font-weight:bold; margin-top:10px;">
                    Subtotale Cucina: €${totaleCucina.toFixed(2)}
                </div>
            </div>
        `;
    }

    // Totale generale e pulsanti
    riepilogoHTML += `
            <div class="w3-panel w3-green w3-round" style="text-align:center;">
                <h4 style="margin:0;">Totale Generale: €${totaleGenerale.toFixed(2)}</h4>
            </div>

            <div style="text-align:center; margin-top:20px;">
                <button class="w3-button w3-teal w3-round w3-margin" onclick="confermaStampa()" style="padding:12px 24px; font-size:1.1em;">
                    🖨️ Conferma e Stampa
                </button>
                <button class="w3-button w3-grey w3-round w3-margin" onclick="chiudiRiepilogo()" style="padding:12px 24px; font-size:1.1em;">
                    ✏️ Modifica Ordine
                </button>
            </div>

            <div style="margin-top:15px; text-align:center;">
                <small class="w3-text-grey">
                    Data: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}
                </small>
            </div>
        </div>
    `;

    modal.innerHTML = riepilogoHTML;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Salva i dati per la stampa - salviamo una copia dei dati, non i riferimenti agli elementi DOM
    window.ordineCorrente = selezionati.map(cb => {
        const menuItem = cb.closest('.menu-item');
        const nome = menuItem.querySelector('.menu-item-nome').textContent.trim();
        return {
            nome: nome,
            quantita: parseInt(cb.value, 10),
            prezzo: parseFloat(cb.dataset.prezzo),
            tipo: cb.dataset.tipo
        };
    });
}

function chiudiRiepilogo() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
    }
    // NON azzerare window.ordineCorrente qui - lo faremo dopo la stampa
}

function confermaStampa() {
    if (!window.ordineCorrente || !Array.isArray(window.ordineCorrente) || window.ordineCorrente.length === 0) {
        mostraNotifica('Errore: nessun ordine da stampare', 'error');
        return;
    }

    // Crea una copia locale dei dati prima di chiudere il riepilogo
    const datiOrdineCopia = [...window.ordineCorrente];

    // Salva l'ordine
    salvaOrdineCorrente();

    // Mostra notifica di successo
    mostraNotifica('Ordine salvato con successo!', 'success', 2000);

    // Chiudi il riepilogo
    chiudiRiepilogo();

    // Procedi con la stampa usando la copia dei dati
    procedereConStampa(datiOrdineCopia);
}

function procedereConStampa(datiOrdine) {
    // Verifica che datiOrdine sia un array valido
    if (!datiOrdine || !Array.isArray(datiOrdine) || datiOrdine.length === 0) {
        console.error('Errore: datiOrdine non è un array valido', datiOrdine);
        mostraNotifica('Errore: dati ordine non validi', 'error');
        return;
    }

    // Separa per tipo usando i dati salvati
    const ordiniBar = datiOrdine.filter(item => item.tipo === "bar");
    const ordiniCucina = datiOrdine.filter(item => item.tipo === "cucina");

    function getRicevutaHTML(tipo, lista, isLast) {
        if (!lista || lista.length === 0) return "";

        let totale = 0;
        try {
            totale = lista.reduce((acc, item) => {
                return acc + (item.prezzo * item.quantita);
            }, 0);
        } catch (error) {
            console.error('Errore nel calcolo totale:', error);
            return "";
        }

        let html = `
            <div class="ricevuta"${isLast ? '' : ' style="page-break-after: always;"'}>
                <h2 align="center">Riepilogo Ordine - ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h2>
                <div style="display:flex; justify-content:space-between;">
                    <div>
                        <p>
                            <b>${ristorante ? ristorante.nome : 'Ristorante'}</b><br>
                            <i>${ristorante ? ristorante.indirizzo.replace(/\n/g, '<br>') : 'Indirizzo non disponibile'}</i>
                        </p>
                    </div>
                    <div>
                        <p>
                            <b>Nome Cliente:</b> ${nomeCliente}<br>
                            <b>Tavolo:</b> ${numeroTavolo}<br>
                            Data: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} <br>
                            <span style="text-align:center; font-style:italic;">Grazie per aver scelto il nostro ristorante!</span>
                        </p>
                    </div>
                </div><br>
                <h3 style="text-align:center;">Dettagli Ordine</h3>
                <div style="text-align:left; font-style:italic; font-size:0.8em;">
                    Elementi ordinati: ${lista.reduce((acc, item) => acc + item.quantita, 0)}
                </div>
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <th style="text-align:left; border-bottom:1px solid #ccc;">Prodotto</th>
                        <th style="text-align:center; border-bottom:1px solid #ccc;">Quantità</th>
                        <th style="text-align:right; border-bottom:1px solid #ccc;">Prezzo</th>
                    </tr>
        `;

        lista.forEach(item => {
            try {
                const totaleRiga = (item.quantita * item.prezzo).toFixed(2);

                html += `
                    <tr>
                        <td>${item.nome}</td>
                        <td style="text-align:center;">${item.quantita}</td>
                        <td style="text-align:right;">€${totaleRiga}</td>
                    </tr>
                `;
            } catch (error) {
                console.error('Errore nel processare item:', error, item);
            }
        });

        html += `
                </table>
                <h4 style="margin-top:20px; font-weight:bold; text-align:right;">Totale ordine: €${totale.toFixed(2)}</h4>
            </div>
        `;
        return html;
    }

    try {
        // Crea contenitore per la stampa
        let printContainer = document.getElementById("print-container");
        if (!printContainer) {
            printContainer = document.createElement("div");
            printContainer.id = "print-container";
            printContainer.style.display = "none";
            document.body.appendChild(printContainer);
        }
        printContainer.innerHTML = "";

        // Genera le ricevute
        const ricevute = [];
        if (ordiniBar.length > 0) {
            const ricevutaBar = getRicevutaHTML("bar", ordiniBar, ordiniCucina.length === 0);
            if (ricevutaBar) ricevute.push(ricevutaBar);
        }
        if (ordiniCucina.length > 0) {
            const ricevutaCucina = getRicevutaHTML("cucina", ordiniCucina, true);
            if (ricevutaCucina) ricevute.push(ricevutaCucina);
        }

        if (ricevute.length === 0) {
            mostraNotifica('Errore: nessuna ricevuta da stampare', 'error');
            return;
        }

        printContainer.innerHTML = ricevute.join("");

        // Stili per la stampa
        let style = document.getElementById("print-style");
        if (!style) {
            style = document.createElement("style");
            style.id = "print-style";
            style.innerHTML = `
                @media print {
                    body > *:not(#print-container) { display: none !important; }
                    #print-container { display: block !important; }
                    .ricevuta { page-break-after: always; }
                    .ricevuta:last-child { page-break-after: auto !important; }
                }
            `;
            document.head.appendChild(style);
        }

        // Mostra notifica di preparazione stampa
        mostraNotifica('Preparazione stampa in corso...', 'info', 2000);
        
        // Ritardo per permettere al DOM di aggiornarsi
        setTimeout(() => {
            try {
                // Controlla se la funzione print è disponibile
                if (typeof window.print === 'function') {
                    window.print();
                    
                    // Dopo la stampa, chiedi se fare un nuovo ordine
                    setTimeout(() => {
                        mostraModalNuovoOrdine();
                    }, 1000);
                } else {
                    throw new Error('Funzione di stampa non disponibile');
                }
            } catch (printError) {
                console.error('Errore durante la stampa:', printError);
                mostraNotifica('Errore durante la stampa. Prova a usare Ctrl+P manualmente.', 'error', 5000);
                
                // Fallback: mostra il contenuto in una nuova finestra
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Stampa Ordine</title>
                            <style>
                                body { font-family: Arial, sans-serif; }
                                .ricevuta { page-break-after: always; }
                                .ricevuta:last-child { page-break-after: auto; }
                                table { width: 100%; border-collapse: collapse; }
                                th, td { border-bottom: 1px solid #ddd; padding: 8px; }
                                th { background-color: #f5f5f5; }
                            </style>
                        </head>
                        <body>
                            ${printContainer.innerHTML}
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                    newWindow.focus();
                    setTimeout(() => {
                        newWindow.print();
                        // Anche con fallback, chiedi nuovo ordine
                        setTimeout(() => {
                            mostraModalNuovoOrdine();
                        }, 1000);
                    }, 500);
                } else {
                    mostraNotifica('Impossibile aprire la finestra di stampa. Controlla le impostazioni del browser.', 'error', 6000);
                    // Anche in caso di errore, chiedi nuovo ordine
                    setTimeout(() => {
                        mostraModalNuovoOrdine();
                    }, 2000);
                }
            }
        }, 100);

    } catch (error) {
        console.error('Errore generale nella stampa:', error);
        mostraNotifica('Errore nella preparazione della stampa: ' + error.message, 'error', 5000);
        // Anche in caso di errore generale, chiedi nuovo ordine
        setTimeout(() => {
            mostraModalNuovoOrdine();
        }, 2000);
    }
}

function mostraModalNuovoOrdine() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(3px);
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        min-width: 400px;
        max-width: 90vw;
        text-align: center;
        animation: modalSlideIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 48px;">✅</div>
        <h3 style="margin: 0 0 16px 0; color: #4caf50;">Ordine Completato!</h3>
        <p style="margin: 0 0 24px 0; color: #666; line-height: 1.5;">
            L'ordine per il Tavolo ${numeroTavolo} è stato stampato con successo.<br>
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button onclick="nuovoOrdineNuovoTavolo()" style="
                background: #4caf50;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s;
                margin: 4px;
            " onmouseover="this.style.background='#388e3c'" onmouseout="this.style.background='#4caf50'">
                🍽️ Nuovo Ordine
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

function nuovoOrdineStessoTavolo() {
    // Rimuovi il modal
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
    
    // Azzera le quantità
    document.querySelectorAll('.quantita-input').forEach(input => {
        input.value = 0;
    });
    
    // Aggiorna il totale
    aggiornaTotale();
    
    // Mostra notifica
    mostraNotifica(`Nuovo ordine iniziato per Tavolo ${numeroTavolo} - ${nomeCliente}`, 'success', 3000);
    
    // Azzera i dati dell'ordine precedente
    window.ordineCorrente = null;
}

function nuovoOrdineNuovoTavolo() {
    // Rimuovi il modal
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
    
    // Azzera le quantità
    document.querySelectorAll('.quantita-input').forEach(input => {
        input.value = 0;
    });
    
    // Aggiorna il totale
    aggiornaTotale();
    
    // Azzera i dati dell'ordine precedente
    window.ordineCorrente = null;
    numeroTavolo = 1; // Reset numero tavolo
    nomeCliente = "Cliente"; // Reset nome cliente
    
    // Mostra di nuovo il modal per inserire nuovo tavolo
    setTimeout(() => {
        mostraModalCliente();
    }, 500);
}

function vaiAllaCassa() {
    // Vai alla pagina cassa
    window.location.href = 'cassa.html';
}

// Carica il menu all'avvio della pagina
window.onload = function () {
    caricaMenu();
    mostraModalCliente();
}