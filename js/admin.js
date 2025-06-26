let menuData = {
    ristorante: { nome: "", indirizzo: "" },
    categorie: []
};

let currentItem = null;

function caricaMenu() {
    fetch('data/menu_data.json')
        .then(response => response.json())
        .then(data => {
            menuData = data;
            aggiornaInterfaccia();
        })
        .catch(error => {
            console.error('Errore nel caricamento:', error);
            alert('Errore nel caricamento del menu. Assicurati che il file data/menu_data.json sia presente.');
        });
}

function aggiornaInterfaccia() {
    document.getElementById('nomeRistorante').value = menuData.ristorante.nome;
    document.getElementById('indirizzoRistorante').value = menuData.ristorante.indirizzo;
    
    const container = document.getElementById('categorieContainer');
    container.innerHTML = '';
    
    // ...existing code per generare l'interfaccia...
    menuData.categorie.forEach((categoria, catIndex) => {
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'w3-card w3-margin-bottom w3-padding';
        categoriaDiv.innerHTML = `
            <div class="w3-row">
                <div class="w3-col s8">
                    <input type="text" value="${categoria.nome}" onchange="aggiornaCategoria(${catIndex}, this.value)" class="w3-input w3-border">
                </div>
                <div class="w3-col s4 w3-right-align">
                    <button class="w3-button btn-rimuovi btn-small" onclick="rimuoviCategoria(${catIndex})">🗑️ Rimuovi</button>
                </div>
            </div>
            <div id="sottocategorie-${catIndex}"></div>
            <button class="w3-button btn-aggiungi btn-small w3-margin-top" onclick="aggiungiSottocategoria(${catIndex})">+ Sottocategoria</button>
        `;
        container.appendChild(categoriaDiv);
        
        const sottocatContainer = document.getElementById(`sottocategorie-${catIndex}`);
        categoria.sottocategorie.forEach((sottocategoria, subIndex) => {
            const sottocatDiv = document.createElement('div');
            sottocatDiv.className = 'w3-margin-top w3-border-left w3-padding-left';
            sottocatDiv.innerHTML = `
                <div class="w3-row w3-margin-bottom">
                    <div class="w3-col s6">
                        <input type="text" placeholder="Nome sottocategoria" value="${sottocategoria.nome}" onchange="aggiornaSottocategoria(${catIndex}, ${subIndex}, this.value)" class="w3-input w3-border">
                    </div>
                    <div class="w3-col s6 w3-right-align">
                        <button class="w3-button btn-rimuovi btn-small" onclick="rimuoviSottocategoria(${catIndex}, ${subIndex})">🗑️ Rimuovi</button>
                    </div>
                </div>
                <div id="items-${catIndex}-${subIndex}"></div>
                <button class="w3-button btn-azzurro btn-small" onclick="aggiungiItem(${catIndex}, ${subIndex})">+ Aggiungi Piatto</button>
            `;
            sottocatContainer.appendChild(sottocatDiv);
            
            const itemsContainer = document.getElementById(`items-${catIndex}-${subIndex}`);
            sottocategoria.items.forEach((item, itemIndex) => {
                const allergeniTags = (item.allergeni || []).map(allergene => 
                    `<span class="allergene-tag">${allergene}</span>`
                ).join('');
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-card';
                itemDiv.innerHTML = `
                    <div class="item-info">
                        <div class="item-nome">${item.nome}</div>
                        ${item.descrizione ? `<div class="item-descrizione">${item.descrizione}</div>` : ''}
                        ${allergeniTags ? `<div class="item-allergeni">${allergeniTags}</div>` : ''}
                        <div style="margin-top: 5px;">
                            <span class="w3-tag w3-${item.tipo === 'cucina' ? 'teal' : 'blue'}">${item.tipo}</span>
                        </div>
                    </div>
                    <div class="item-prezzo">€${item.prezzo.toFixed(2)}</div>
                    <div>
                        <button class="w3-button btn-modifica btn-small" onclick="modificaProdotto(${catIndex}, ${subIndex}, ${itemIndex})">✏️ Modifica</button>
                        <button class="w3-button btn-rimuovi btn-small" onclick="rimuoviItem(${catIndex}, ${subIndex}, ${itemIndex})">🗑️ Rimuovi</button>
                    </div>
                `;
                itemsContainer.appendChild(itemDiv);
            });
        });
    });
}

function aggiornaCategoria(index, nome) {
    menuData.categorie[index].nome = nome;
}

function aggiornaSottocategoria(catIndex, subIndex, nome) {
    menuData.categorie[catIndex].sottocategorie[subIndex].nome = nome;
}

function aggiornaItem(catIndex, subIndex, itemIndex, campo, valore) {
    menuData.categorie[catIndex].sottocategorie[subIndex].items[itemIndex][campo] = valore;
}

function aggiungiCategoria() {
    menuData.categorie.push({
        nome: "Nuova Categoria",
        sottocategorie: [{
            nome: "",
            items: []
        }]
    });
    aggiornaInterfaccia();
}

function rimuoviCategoria(index) {
    if (confirm('Sei sicuro di voler rimuovere questa categoria?')) {
        menuData.categorie.splice(index, 1);
        aggiornaInterfaccia();
    }
}

function aggiungiSottocategoria(catIndex) {
    menuData.categorie[catIndex].sottocategorie.push({
        nome: "",
        items: []
    });
    aggiornaInterfaccia();
}

function rimuoviSottocategoria(catIndex, subIndex) {
    if (confirm('Sei sicuro di voler rimuovere questa sottocategoria?')) {
        menuData.categorie[catIndex].sottocategorie.splice(subIndex, 1);
        aggiornaInterfaccia();
    }
}

function modificaProdotto(catIndex, subIndex, itemIndex) {
    const item = menuData.categorie[catIndex].sottocategorie[subIndex].items[itemIndex];
    currentItem = { catIndex, subIndex, itemIndex };
    
    // Popola il modal con i dati dell'item
    document.getElementById('modalTitolo').textContent = `Modifica: ${item.nome}`;
    document.getElementById('modalNome').value = item.nome;
    document.getElementById('modalDescrizione').value = item.descrizione || '';
    document.getElementById('modalPrezzo').value = item.prezzo;
    document.getElementById('modalTipo').value = item.tipo;
    
    // Reset allergeni checkboxes
    document.querySelectorAll('#allergeniContainer input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Seleziona gli allergeni dell'item
    if (item.allergeni) {
        item.allergeni.forEach(allergene => {
            const checkbox = document.querySelector(`#allergeniContainer input[value="${allergene}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Mostra il modal
    document.getElementById('prodottoModal').style.display = 'block';
}

function salvaProdotto() {
    if (!currentItem) return;
    
    const { catIndex, subIndex, itemIndex } = currentItem;
    const item = menuData.categorie[catIndex].sottocategorie[subIndex].items[itemIndex];
    
    // Aggiorna i dati dell'item
    item.nome = document.getElementById('modalNome').value;
    item.descrizione = document.getElementById('modalDescrizione').value;
    item.prezzo = parseFloat(document.getElementById('modalPrezzo').value);
    item.tipo = document.getElementById('modalTipo').value;
    
    // Aggiorna allergeni
    const allergeniSelezionati = [];
    document.querySelectorAll('#allergeniContainer input[type="checkbox"]:checked').forEach(cb => {
        allergeniSelezionati.push(cb.value);
    });
    item.allergeni = allergeniSelezionati;
    
    // Chiudi modal e aggiorna interfaccia
    chiudiModal();
    aggiornaInterfaccia();
}

function chiudiModal() {
    document.getElementById('prodottoModal').style.display = 'none';
    currentItem = null;
}

function aggiungiItem(catIndex, subIndex) {
    const nuovoItem = {
        nome: "Nuovo Piatto",
        descrizione: "",
        prezzo: 0.00,
        tipo: "cucina",
        allergeni: []
    };
    
    menuData.categorie[catIndex].sottocategorie[subIndex].items.push(nuovoItem);
    
    // Apri subito il modal per modificare il nuovo item
    const itemIndex = menuData.categorie[catIndex].sottocategorie[subIndex].items.length - 1;
    setTimeout(() => modificaProdotto(catIndex, subIndex, itemIndex), 100);
    
    aggiornaInterfaccia();
}

function rimuoviItem(catIndex, subIndex, itemIndex) {
    if (confirm('Sei sicuro di voler rimuovere questo piatto?')) {
        menuData.categorie[catIndex].sottocategorie[subIndex].items.splice(itemIndex, 1);
        aggiornaInterfaccia();
    }
}

function salvaMenu() {
    menuData.ristorante.nome = document.getElementById('nomeRistorante').value;
    menuData.ristorante.indirizzo = document.getElementById('indirizzoRistorante').value;
    
    const dataStr = JSON.stringify(menuData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu_data.json';
    link.click();

    alert('Menu salvato! Sostituisci il file data/menu_data.json esistente con quello scaricato.');
}

// Carica il menu all'avvio
window.onload = caricaMenu;

// Chiudi modal quando si clicca fuori
window.onclick = function(event) {
    const modal = document.getElementById('prodottoModal');
    if (event.target === modal) {
        chiudiModal();
    }
}
