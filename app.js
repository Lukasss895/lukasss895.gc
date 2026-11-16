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

// Globálny stav aplikácie
let dbData = { users: {}, inventories: {}, trades: [] };
let currentUser = null;
let viewedUser = null;
let activePage = 'profile';

// Pre Trade Offer výbery
let tradeTargetUser = null;
let selectedMyItems = [];
let selectedTheirItems = [];

// Načítanie dát z Gistu
async function loadGistData() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, { headers: { 'Authorization': `token ${GIST_CONFIG.token}`,
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
        const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, { method: 'PATCH', headers: { 'Authorization': `token ${GIST_CONFIG.token}`,
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

// Inicializácia pri načítaní stránky
document.addEventListener('DOMContentLoaded', async () => {
    dbData = await loadGistData();
    
    // Skontroluj či je už niekto prihlásený v localStorage
    const savedUser = localStorage.getItem('gocounter_current_user');
    if (savedUser && dbData.users[savedUser]) {
        currentUser = savedUser;
        viewedUser = currentUser;
        showMainApp();
    } else {
        showAuthPage();
    }
});

// Prepínanie stránok / zobrazení
window.showPage = function(pageName) {
    activePage = pageName;
    document.querySelectorAll('.navbar .nav-links a').forEach(a => a.classList.remove('active'));
    
    document.getElementById('page-profile').style.display = 'none';
    document.getElementById('page-inventory').style.display = 'none';
    document.getElementById('page-trades').style.display = 'none';
    document.getElementById('page-players').style.display = 'none';

    if (pageName === 'profile') {
        document.getElementById('page-profile').style.display = 'block';
        document.getElementById('nav-profile').classList.add('active');
        renderProfile(viewedUser || currentUser);
    } else if (pageName === 'inventory') {
        document.getElementById('page-inventory').style.display = 'block';
        document.getElementById('nav-inventory').classList.add('active');
        renderSingleInventory(viewedUser || currentUser);
    } else if (pageName === 'trades') {
        document.getElementById('page-trades').style.display = 'block';
        document.getElementById('nav-trades').classList.add('active');
        renderTradesPage();
    } else if (pageName === 'players') {
        document.getElementById('page-players').style.display = 'block';
        document.getElementById('nav-players').classList.add('active');
        renderPlayersList();
    }
}

function showAuthPage() {
    document.getElementById('page-auth').style.display = 'flex';
    document.getElementById('page-profile').style.display = 'none';
    document.getElementById('page-inventory').style.display = 'none';
    document.getElementById('page-trades').style.display = 'none';
    document.getElementById('page-players').style.display = 'none';
    document.querySelector('.navbar').style.display = 'none';
}

function showMainApp() {
    document.getElementById('page-auth').style.display = 'none';
    document.querySelector('.navbar').style.display = 'flex';
    document.getElementById('nav-user-area').style.display = 'flex';
    document.getElementById('nav-username').innerText = currentUser;
    showPage('profile');
}

// ----------------- AUTENTIFIKÁCIA -----------------
window.handleRegister = async function() {
    const user = document.getElementById('reg-user').value.trim();
    const steamid = document.getElementById('reg-steamid').value.trim();
    const pass = document.getElementById('reg-pass').value;

    if (!user || !pass || !steamid) {
        alert("Vyplň všetky políčka pre registráciu!");
        return;
    }

    dbData = await loadGistData();
    if (dbData.users[user]) {
        alert("Používateľ s týmto menom už existuje!");
        return;
    }

    dbData.users[user] = {
        name: user,
        steamid: steamid,
        password: pass,
        bio: "GO:COUNTER Community Member",
        joined: new Date().toISOString()
    };
    dbData.inventories[user] = []; // Prázdny inventár na začiatok

    const success = await saveGistData();
    if (success) {
        currentUser = user;
        viewedUser = currentUser;
        localStorage.setItem('gocounter_current_user', currentUser);
        showMainApp();
    } else {
        alert("Chyba pri ukladaní na GitHub.");
    }
}

window.handleLogin = async function() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errBox = document.getElementById('auth-error');

    dbData = await loadGistData();
    if (!dbData.users[user] || dbData.users[user].password !== pass) {
        errBox.style.display = 'block';
        errBox.innerText = 'Nesprávne meno alebo heslo!';
        return;
    }

    errBox.style.display = 'none';
    currentUser = user;
    viewedUser = currentUser;
    localStorage.setItem('gocounter_current_user', currentUser);
    showMainApp();
}

window.logout = function() {
    localStorage.removeItem('gocounter_current_user');
    currentUser = null;
    viewedUser = null;
    showAuthPage();
}

// ----------------- PROFIL HRÁČA -----------------
function renderProfile(username) {
    const user = dbData.users[username];
    if (!user) return;

    viewedUser = username;
    document.getElementById('prof-username').innerText = user.name;
    document.getElementById('prof-steamid').innerText = user.steamid || 'N/A';
    document.getElementById('prof-bio').innerText = user.bio || 'No information given.';
    
    const items = dbData.inventories[username] || [];
    document.getElementById('stat-items-count').innerText = items.length;
    document.getElementById('side-inv-count').innerText = items.length;

    // Zobrazenie sync boxu iba ak pozerám svoj vlastný profil
    const syncBox = document.getElementById('my-sync-box');
    const tradeBtnArea = document.getElementById('prof-trade-btn-area');

    if (username === currentUser) {
        syncBox.style.display = 'block';
        tradeBtnArea.innerHTML = '';
    } else {
        syncBox.style.display = 'none';
        tradeBtnArea.innerHTML = `<button onclick="startTradeWith('${username}')" class="btn-steam btn-green" style="margin-top:15px; width:100%;">Trade with ${username}</button>`;
    }
}

// ----------------- INVENTORY SYNC (inventory.txt) -----------------
window.uploadInventoryFile = async function() {
    const fileInput = document.getElementById('inv-file-input');
    if (fileInput.files.length === 0) {
        alert("Najskôr vyber súbor inventory.txt!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
        const text = e.target.result;
        const parsedItems = parseInventoryTxt(text);

        dbData = await loadGistData();
        dbData.inventories[currentUser] = parsedItems;
        const success = await saveGistData();

        if (success) {
            alert(`Úspešne nahraných ${parsedItems.length} položiek do inventáru!`);
            renderProfile(currentUser);
        } else {
            alert("Chyba pri ukladaní inventáru na GitHub.");
        }
    };
    reader.readAsText(file);
}

// Parser pre formát inventory.txt z csgo_gc
function parseInventoryTxt(content) {
    const lines = content.split('\n');
    const items = [];
    let idCounter = 1;

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('//') || line.startsWith('#')) continue;
        
        // Jednoduché parsovanie riadkov v štýle defindex / weapon / atď.
        items.push({
            id: idCounter++,
            raw: line,
            name: `Item (${line.substring(0, 30)})`
        });
    }
    return items;
}

window.downloadUpdatedInventory = function() {
    const items = dbData.inventories[currentUser] || [];
    let fileContent = `// Updated inventory for csgo_gc\n// Generated by GO:COUNTER\n\n`;
    items.forEach(item => {
        fileContent += `${item.raw}\n`;
    });

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ----------------- INVENTÁR A ZOBRAZENIE -----------------
window.openUserInventory = function(username) {
    viewedUser = username;
    showPage('inventory');
}

function renderSingleInventory(username) {
    const grid = document.getElementById('single-inv-grid');
    const title = document.getElementById('inv-title');
    const splitView = document.getElementById('trade-split-view');
    const singleView = document.getElementById('single-inv-view');
    const sendBtn = document.getElementById('send-trade-submit');

    splitView.style.display = 'none';
    singleView.style.display = 'block';
    sendBtn.style.display = 'none';

    title.innerText = `Inventory of ${username}`;
    const items = dbData.inventories[username] || [];
    
    grid.innerHTML = '';
    if (items.length === 0) {
        grid.innerHTML = '<p style="color:#8f98a0; padding:20px;">Tento hráč nemá žiadne položky v inventári.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.style.cssText = 'background:#222; border:1px solid #444; padding:10px; border-radius:4px; text-align:center;';
        card.innerHTML = `
            <div style="color:#fff; font-weight:bold; font-size:13px; margin-bottom:5px;">Skin #${item.id}</div>
            <div style="color:#d
