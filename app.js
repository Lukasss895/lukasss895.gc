// Konfigurácia Gistu
const GIST_CONFIG = {
    get token() {
        let t = localStorage.getItem('gocounter_token');
        if (!t) {
            t = prompt("Zadaj svoj GitHub Personal Access Token (classic s právom 'gist'):");
            if (t) {
                localStorage.setItem('gocounter_token', t.trim());
            }
        }
        return t ? t.trim() : '';
    },
    gistId: '1a959530626a18f06da3c489e38f9862'
};

// Globálna databáza
let dbData = { users: {}, inventories: {}, trades: [] };
let currentUser = null;

// Načítanie dát z Gistu
async function loadGistData() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, {
            headers: {
                'Authorization': `token ${GIST_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('gocounter_token');
                alert("Neplatný token! Zadaj ho prosím znova.");
            }
            throw new Error(`Chyba spojenia: ${response.status}`);
        }

        const data = await response.json();
        const file = data.files['gocounter_db.json'];
        
        if (file && file.content) {
            return JSON.parse(file.content);
        }
        return { users: {}, inventories: {}, trades: [] };
    } catch (error) {
        console.error("Chyba pri načítaní Gistu:", error);
        return { users: {}, inventories: {}, trades: [] };
    }
}

// Uloženie dát do Gistu
async function saveGistData() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GIST_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files: {
                    'gocounter_db.json': {
                        content: JSON.stringify(dbData, null, 2)
                    }
                }
            })
        });

        return response.ok;
    } catch (error) {
        console.error("Chyba pri zápise do Gistu:", error);
        return false;
    }
}

// Inicializácia a automatická registrácia/prihlásenie hráča
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Načítavam platformu...");
    dbData = await loadGistData();

    // Simulácia/získanie aktuálneho používateľa (môžeš prepojiť so Steam loginom alebo inputom)
    currentUser = localStorage.getItem('gocounter_current_user') || prompt("Zadaj svoje hráčske meno (Nickname):");
    if (currentUser) {
        currentUser = currentUser.trim();
        localStorage.setItem('gocounter_current_user', currentUser);

        // Ak hráč ešte neexistuje v databáze, automaticky ho pridáme!
        if (!dbData.users[currentUser]) {
            dbData.users[currentUser] = {
                name: currentUser,
                joined: new Date().toISOString(),
                rank: "Silver I"
            };
            dbData.inventories[currentUser] = [
                { id: 1, name: "AK-47 | Redline", wear: "Field-Tested" },
                { id: 2, name: "AWP | Asiimov", wear: "Well-Worn" }
            ]; // Štartovacie skiny pre nováčika
            await saveGistData();
            console.log(`Nový hráč ${currentUser} bol automaticky zaregistrovaný do databázy.`);
        }
    }

    initUI();
});

// Základné prepojenie UI (Home, Search, Trade)
function initUI() {
    // Tu môžeš vykresliť Home stránku
    renderHome();

    // Nastavenie vyhľadávača inventárov
    const searchInput = document.getElementById('search-player');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchInventories(e.target.value);
        });
    }

    // Naplnenie selectu pre Trade offers
    populateTradeSelects();
}

// Home stránka - prehľad
function renderHome() {
    const homeDiv = document.getElementById('home-container');
    if (homeDiv) {
        const totalUsers = Object.keys(dbData.users).length;
        homeDiv.innerHTML = `
            <h2>Vitaj späť, ${currentUser}!</h2>
            <p>Sme pripravení na obchody. Na platforme je zaregistrovaných <b>${totalUsers}</b> hráčov.</p>
            <div class="stats-box">
                <p>Tvoj inventár obsahuje: ${dbData.inventories[currentUser] ? dbData.inventories[currentUser].length : 0} skinov.</p>
            </div>
        `;
    }
}

// Vyhľadávanie hráčov a ich inventárov
function searchInventories(query) {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '';
    const lowerQuery = query.toLowerCase();

    for (let username in dbData.users) {
        if (username.toLowerCase().includes(lowerQuery)) {
            const userBox = document.createElement('div');
            userBox.className = 'player-card';
            userBox.innerHTML = `
                <h3>${username}</h3>
                <button onclick="viewInventory('${username}')">Zobraziť inventár</button>
            `;
            resultsDiv.appendChild(userBox);
        }
    }
}

// Zobrazenie inventáru konkrétneho hráča
window.viewInventory = function(username) {
    const invDiv = document.getElementById('target-inventory');
    if (!invDiv) return;

    const items = dbData.inventories[username] || [];
    let html = `<h3>Inventár hráča: ${username}</h3><ul>`;
    items.forEach((item, index) => {
        html += `<li>${item.name} (${item.wear}) <button onclick="sendTradeOffer('${username}', ${index})">Poslať ponuku</button></li>`;
    });
    html += `</ul>`;
    invDiv.innerHTML = html;
};

// Naplnenie výberu pre Trade
function populateTradeSelects() {
    const select = document.getElementById('trade-target-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Vyber hráča na trade --</option>';
    for (let username in dbData.users) {
        if (username !== currentUser) {
            select.innerHTML += `<option value="${username}">${username}</option>`;
        }
    }
}

// Odoslanie Trade Offer
window.sendTradeOffer = async function(targetUser, itemIndex) {
    const skin = dbData.inventories[currentUser][itemIndex];
    
    dbData.trades.push({
        from: currentUser,
        to: targetUser,
        item: skin,
        status: "pending",
        date: new Date().toISOString()
    });

    const success = await saveGistData();
    if (success) {
        alert(`Trade offer úspešne odoslaný hráčovi ${targetUser}!`);
    } else {
        alert("Chyba pri odosielaní trade offeru.");
    }
};
