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

// Inicializácia pri načítaní stránky
document.addEventListener('DOMContentLoaded', async () => {
    dbData = await loadGistData();
    
    const savedUser = localStorage.getItem('gocounter_current_user');
    if (savedUser && dbData.users[savedUser]) {
        currentUser = savedUser;
        viewedUser = currentUser;
        showMainApp();
    } else {
        showAuthPage();
    }
});

// Prepínanie záložiek v menu
window.showPage = function(pageName) {
    activePage = pageName;
    document.querySelectorAll('.navbar .nav-links a').forEach(a => a.classList.remove('active'));
    
    document.getElementById('page-auth').style.display = 'none';
    document.getElementById('page-profile').style.display = 'none';
    document.getElementById('page-inventory').style.display = 'none';
    document.getElementById('page-trades').style.display = 'none';
    document.getElementById('page-players').style.display = 'none';

    if (pageName === 'auth') {
        document.getElementById('page-auth').style.display = 'flex';
    } else if (pageName === 'profile') {
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
    document.getElementById('main-navbar').style.display = 'none';
    document.getElementById('page-profile').style.display = 'none';
    document.getElementById('page-inventory').style.display = 'none';
    document.getElementById('page-trades').style.display = 'none';
    document.getElementById('page-players').style.display = 'none';
}

function showMainApp() {
    document.getElementById('page-auth').style.display = 'none';
    document.getElementById('main-navbar').style.display = 'flex';
    document.getElementById('nav-user-area').style.display = 'flex';
    document.getElementById('nav-username').innerText = currentUser;
    showPage('profile');
}

// ----------------- REGISTRÁCIA S HLÁŠKOU -----------------
window.handleRegister = async function() {
    const user = document.getElementById('reg-user').value.trim();
    const steamid = document.getElementById('reg-steamid').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const errBox = document.getElementById('auth-error');

    if (!user || !pass || !steamid) {
        errBox.style.display = 'block';
        errBox.style.color = '#eb4b4b';
        errBox.innerText = "Vyplň všetky políčka pre registráciu!";
        return;
    }

    dbData = await loadGistData();
    if (dbData.users[user]) {
        errBox.style.display = 'block';
        errBox.style.color = '#eb4b4b';
        errBox.innerText = "Používateľ s týmto menom už existuje!";
        return;
    }

    dbData.users[user] = {
        name: user,
        steamid: steamid,
        password: pass,
        bio: "GO:COUNTER Community Member",
        joined: new Date().toISOString()
    };
    dbData.inventories[user] = [];

    const success = await saveGistData();
    if (success) {
        errBox.style.display = 'block';
        errBox.style.color = '#a4d007'; // Zelená úspešná hláška
        errBox.innerText = `Registrácia úspešná! Vitaj, ${user}. Prihlasujem...`;
        
        setTimeout(() => {
            currentUser = user;
            viewedUser = currentUser;
            localStorage.setItem('gocounter_current_user', currentUser);
            errBox.style.display = 'none';
            showMainApp();
        }, 1200);
    } else {
        errBox.style.display = 'block';
        errBox.style.color = '#eb4b4b';
        errBox.innerText = "Chyba pri ukladaní na GitHub.";
    }
}

// ----------------- PRIHLÁSENIE -----------------
window.handleLogin = async function() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errBox = document.getElementById('auth-error');

    dbData = await loadGistData();
    if (!dbData.users[user] || dbData.users[user].password !== pass) {
        errBox.style.display = 'block';
        errBox.style.color = '#eb4b4b';
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

// ----------------- INVENTORY SYNC -----------------
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

function parseInventoryTxt(content) {
    const lines = content.split('\n');
    const items = [];
    let idCounter = 1;

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('//') || line.startsWith('#')) continue;
        
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
            <div style="color:#d1a840; font-size:12px; word-break:break-all;">${item.raw}</div>
        `;
        grid.appendChild(card);
    });
}

window.renderInventoryPage = function() {
    const query = document.getElementById('inv-search').value.toLowerCase();
    const grid = document.getElementById('single-inv-grid');
    const items = dbData.inventories[viewedUser] || [];
    
    grid.innerHTML = '';
    const filtered = items.filter(item => item.raw.toLowerCase().includes(query) || item.id.toString().includes(query));

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="color:#8f98a0; padding:20px;">Žiadne položky nevyhovujú hľadaniu.</p>';
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.style.cssText = 'background:#222; border:1px solid #444; padding:10px; border-radius:4px; text-align:center;';
        card.innerHTML = `
            <div style="color:#fff; font-weight:bold; font-size:13px; margin-bottom:5px;">Skin #${item.id}</div>
            <div style="color:#d1a840; font-size:12px; word-break:break-all;">${item.raw}</div>
        `;
        grid.appendChild(card);
    });
};

// ----------------- TRADE OFFERS -----------------
window.startTradeWith = function(targetUsername) {
    if (targetUsername === currentUser) {
        alert("Nemôžeš obchodovať sám so sebou!");
        return;
    }

    tradeTargetUser = targetUsername;
    selectedMyItems = [];
    selectedTheirItems = [];

    showPage('inventory');
    setupTradeInterface();
}

function setupTradeInterface() {
    const splitView = document.getElementById('trade-split-view');
    const singleView = document.getElementById('single-inv-view');
    const sendBtn = document.getElementById('send-trade-submit');
    const title = document.getElementById('inv-title');

    splitView.style.display = 'block';
    singleView.style.display = 'none';
    sendBtn.style.display = 'block';
    title.innerText = `Trade Offer: You vs ${tradeTargetUser}`;

    const myGrid = document.getElementById('my-trade-grid');
    myGrid.innerHTML = '';
    const myItems = dbData.inventories[currentUser] || [];
    myItems.forEach(item => {
        const el = createTradeItemElement(item, true);
        myGrid.appendChild(el);
    });

    const theirGrid = document.getElementById('their-trade-grid');
    theirGrid.innerHTML = '';
    const theirItems = dbData.inventories[tradeTargetUser] || [];
    theirItems.forEach(item => {
        const el = createTradeItemElement(item, false);
        theirGrid.appendChild(el);
    });
}

function createTradeItemElement(item, isMine) {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.style.cssText = 'background:#222; border:1px solid #444; padding:10px; border-radius:4px; cursor:pointer; text-align:center; transition:0.2s;';
    div.innerHTML = `
        <div style="color:#fff; font-size:12px; font-weight:bold;">Item #${item.id}</div>
        <div style="color:#8f98a0; font-size:11px; word-break:break-all;">${item.raw}</div>
    `;

    div.onclick = function() {
        if (isMine) {
            if (selectedMyItems.includes(item)) {
                selectedMyItems = selectedMyItems.filter(i => i !== item);
                div.style.borderColor = '#444';
                div.style.background = '#222';
            } else {
                selectedMyItems.push(item);
                div.style.borderColor = '#66c0f4';
                div.style.background = '#1b2838';
            }
        } else {
            if (selectedTheirItems.includes(item)) {
                selectedTheirItems = selectedTheirItems.filter(i => i !== item);
                div.style.borderColor = '#444';
                div.style.background = '#222';
            } else {
                selectedTheirItems.push(item);
                div.style.borderColor = '#d1a840';
                div.style.background = '#382e1b';
            }
        }
    };
    return div;
}

window.submitTradeOffer = async function() {
    if (selectedMyItems.length === 0 && selectedTheirItems.length === 0) {
        alert("Musíš vybrať aspoň jednu položku na výmenu!");
        return;
    }

    dbData = await loadGistData();

    const newTrade = {
        id: 'trade_' + Date.now(),
        sender: currentUser,
        recipient: tradeTargetUser,
        senderItems: selectedMyItems,
        recipientItems: selectedTheirItems,
        status: 'pending',
        date: new Date().toISOString()
    };

    if (!dbData.trades) dbData.trades = [];
    dbData.trades.push(newTrade);

    const success = await saveGistData();
    if (success) {
        alert("Trade offer bol úspešne odoslaný!");
        showPage('trades');
    } else {
        alert("Chyba pri odosielaní ponuky.");
    }
}

function renderTradesPage() {
    const listDiv = document.getElementById('trades-list');
    listDiv.innerHTML = '';

    const trades = dbData.trades || [];
    const myTrades = trades.filter(t => t.sender === currentUser || t.recipient === currentUser);

    if (myTrades.length === 0) {
        listDiv.innerHTML = '<p style="color:#8f98a0;">Žiadne aktívne trade ponuky.</p>';
        return;
    }

    myTrades.reverse().forEach(trade => {
        const isIncoming = trade.recipient === currentUser;
        const box = document.createElement('div');
        box.className = 'showcase-box';
        box.style.cssText = 'margin-bottom:15px; padding:15px; border-left: 4px solid ' + (trade.status === 'accepted' ? '#a4d007' : trade.status === 'declined' ? '#eb4b4b' : '#66c0f4');
        
        let statusText = `<span style="color:#66c0f4;">Pending</span>`;
        if (trade.status === 'accepted') statusText = `<span style="color:#a4d007;">Accepted</span>`;
        if (trade.status === 'declined') statusText = `<span style="color:#eb4b4b;">Declined</span>`;

        box.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <div style="color:#fff; font-weight:bold;">Trade between ${trade.sender} and ${trade.recipient}</div>
                <div>Status: ${statusText}</div>
            </div>
            <div style="display:flex; gap:20px; font-size:13px; color:#8f98a0; margin-bottom:12px;">
                <div><b>${trade.sender} dáva:</b> ${trade.senderItems.map(i => i.raw).join(', ') || 'Nic'}</div>
                <div><b>${trade.recipient} dáva:</b> ${trade.recipientItems.map(i => i.raw).join(', ') || 'Nic'}</div>
            </div>
        `;

        if (isIncoming && trade.status === 'pending') {
            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex; gap:10px;';
            btnRow.innerHTML = `
                <button onclick="respondTrade('${trade.id}', true)" class="btn-steam btn-green" style="padding:5px 15px;">Accept Trade</button>
                <button onclick="respondTrade('${trade.id}', false)" class="btn-steam" style="padding:5px 15px; background:#eb4b4b;">Decline</button>
            `;
            box.appendChild(btnRow);
        }

        listDiv.appendChild(box);
    });
}

window.respondTrade = async function(tradeId, accept) {
    dbData = await loadGistData();
    const trade = dbData.trades.find(t => t.id === tradeId);
    if (!trade || trade.status !== 'pending') return;

    if (accept) {
        const senderInv = dbData.inventories[trade.sender] || [];
        const recipientInv = dbData.inventories[trade.recipient] || [];

        for (let item of trade.senderItems) {
            const idx = senderInv.findIndex(i => i.id === item.id);
            if (idx !== -1) {
                senderInv.splice(idx, 1);
                recipientInv.push(item);
            }
        }

        for (let item of trade.recipientItems) {
            const idx = recipientInv.findIndex(i => i.id === item.id);
            if (idx !== -1) {
                recipientInv.splice(idx, 1);
                senderInv.push(item);
            }
        }

        trade.status = 'accepted';
    } else {
        trade.status = 'declined';
    }

    const success = await saveGistData();
    if (success) {
        alert(accept ? "Trade bol úspešne prijatý a predmety vymenené!" : "Trade bol zamietnutý.");
        renderTradesPage();
    } else {
        alert("Chyba pri aktualizácii databázy.");
    }
}

// ----------------- ZOZNAM HRÁČOV -----------------
function renderPlayersList() {
    const listDiv = document.getElementById('players-list');
    listDiv.innerHTML = '';

    for (let username in dbData.users) {
        const card = document.createElement('div');
        card.className = 'showcase-box';
        card.style.cssText = 'padding:15px; text-align:center;';
        card.innerHTML = `
            <div style="font-weight:bold; color:#fff; font-size:15px; margin-bottom:5px;">${username}</div>
            <div style="color:#8f98a0; font-size:12px; margin-bottom:12px;">Items: ${dbData.inventories[username] ? dbData.inventories[username].length : 0}</div>
            <button onclick="viewPlayerProfile('${username}')" class="btn-steam" style="width:100%; font-size:12px;">View Profile</button>
        `;
        listDiv.appendChild(card);
    }
}

window.viewPlayerProfile = function(username) {
    viewedUser = username;
    showPage('profile');
}
