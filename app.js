// =========================================================
// NASTAVENIA GITHUB GIST (BEZ BLOKOVANIA TOKENU)
// =========================================================
const GIST_CONFIG = {
    token: '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', // Tvoj Personal Access Token (classic s právom 'gist')
    gistId: 'gist:1a959530626a18f06da3c489e38f9862'        // Dlhý reťazec z URL adresy tvojho Gistu
};

let currentUser = localStorage.getItem('gc_user') || null;
let viewedUser = currentUser;
let selectedMyItems = new Set();
let selectedTheirItems = new Set();

// Base64 kódovanie s podporou UTF-8
function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
function base64ToUtf8(str) {
    return decodeURIComponent(escape(atob(str)));
}

// =========================================================
// GITHUB GIST API KOMUNIKÁCIA
// =========================================================
async function loadGistData() {
    const url = `https://api.github.com/gists/${GIST_CONFIG.gistId}?t=${Date.now()}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GIST_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (res.status === 200) {
        const data = await res.json();
        const file = data.files['gocounter_db.json'];
        if (file && file.content) {
            try {
                return JSON.parse(file.content);
            } catch (e) {
                return { users: {}, inventories: {}, trades: [] };
            }
        }
    }
    return { users: {}, inventories: {}, trades: [] };
}

async function saveGistData(dbData) {
    const url = `https://api.github.com/gists/${GIST_CONFIG.gistId}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${GIST_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            files: {
                'gocounter_db.json': {
                    content: JSON.stringify(dbData, null, 2)
                }
            }
        })
    });
    return res.ok;
}

// =========================================================
// PARSOVANIE A GENEROVANIE CSGO_GC inventory.txt
// =========================================================
function parseInventoryTxt(rawText) {
    const items = {};
    const regex = /"(\d+)"\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gs;
    let match;
    while ((match = regex.exec(rawText)) !== null) {
        const uid = match[1];
        if (uid === 'items') continue;
        const body = match[2];

        const defMatch = body.match(/"defindex"\s*"(\d+)"/i);
        const paintMatch = body.match(/"paintindex"\s*"(\d+)"/i);
        const rarMatch = body.match(/"rarity"\s*"(\d+)"/i);
        const nameMatch = body.match(/"custom_name"\s*"([^"]*)"/i);

        const defindex = defMatch ? parseInt(defMatch[1]) : 0;
        if (defindex > 0) {
            items[uid] = {
                uid: uid,
                defindex: defindex,
                paintindex: paintMatch ? parseInt(paintMatch[1]) : 0,
                rarity: rarMatch ? parseInt(rarMatch[1]) : 3,
                custom_name: nameMatch ? nameMatch[1] : '',
                raw_block: match[0].trim()
            };
        }
    }
    return items;
}

function buildInventoryTxt(itemsObj) {
    let out = `"items"\n{\n`;
    for (const uid in itemsObj) {
        out += `\t${itemsObj[uid].raw_block}\n`;
    }
    out += `}\n`;
    return out;
}

// =========================================================
// REGISTRÁCIA A PRIHLÁSENIE
// =========================================================
async function handleRegister() {
    const username = document.getElementById('reg-user').value.trim();
    const steamid = document.getElementById('reg-steamid').value.trim() || '76561198000000000';
    const password = document.getElementById('reg-pass').value;
    const errEl = document.getElementById('auth-error');

    if (username.length < 3 || password.length < 3) {
        errEl.innerText = 'Meno aj heslo musia mať aspoň 3 znaky.';
        errEl.style.display = 'block';
        return;
    }

    const key = username.toLowerCase();
    const db = await loadGistData();
    if (!db.users) db.users = {};
    if (!db.inventories) db.inventories = {};
    if (!db.trades) db.trades = [];

    if (db.users[key]) {
        errEl.innerText = 'Tento používateľ už existuje!';
        errEl.style.display = 'block';
        return;
    }

    db.users[key] = {
        username: username,
        password: btoa(password),
        steamid64: steamid,
        bio: 'No information given.'
    };

    const ok = await saveGistData(db);
    if (ok) {
        currentUser = key;
        viewedUser = key;
        localStorage.setItem('gc_user', key);
        initApp();
    } else {
        errEl.innerText = 'Chyba spojenia s Gistom! Skontroluj token.';
        errEl.style.display = 'block';
    }
}

async function handleLogin() {
    const username = document.getElementById('login-user').value.trim().toLowerCase();
    const password = document.getElementById('login-pass').value;
    const errEl = document.getElementById('auth-error');

    const db = await loadGistData();
    if (db.users && db.users[username] && db.users[username].password === btoa(password)) {
        currentUser = username;
        viewedUser = username;
        localStorage.setItem('gc_user', username);
        initApp();
    } else {
        errEl.innerText = 'Nesprávne meno alebo heslo.';
        errEl.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('gc_user');
    currentUser = null;
    initApp();
}

// =========================================================
// NAVIGÁCIA
// =========================================================
function showPage(pageName) {
    ['auth', 'profile', 'inventory', 'trades', 'players'].forEach(p => {
        document.getElementById(`page-${p}`).style.display = 'none';
        const nav = document.getElementById(`nav-${p}`);
        if (nav) nav.classList.remove('active');
    });

    if (!currentUser) {
        document.getElementById('page-auth').style.display = 'flex';
        document.getElementById('nav-user-area').style.display = 'none';
        return;
    }

    document.getElementById('nav-user-area').style.display = 'flex';
    document.getElementById(`page-${pageName}`).style.display = 'block';
    const activeNav = document.getElementById(`nav-${pageName}`);
    if (activeNav) activeNav.classList.add('active');

    if (pageName === 'profile') loadProfile(viewedUser || currentUser);
    if (pageName === 'inventory') {
        viewedUser = currentUser;
        renderInventoryPage();
    }
    if (pageName === 'trades') loadTrades();
    if (pageName === 'players') loadPlayers();
}

async function initApp() {
    if (currentUser) {
        document.getElementById('nav-username').innerText = currentUser;
        viewedUser = currentUser;
        showPage('profile');
        updateTradeBadge();
    } else {
        showPage('auth');
    }
}

// =========================================================
// PROFIL & INVENTÁR SYNC
// =========================================================
async function loadProfile(userKey) {
    viewedUser = userKey;
    const db = await loadGistData();
    const users = db.users || {};
    const prof = users[userKey] || { username: userKey, steamid64: 'Unknown', bio: '' };

    document.getElementById('prof-username').innerText = prof.username;
    document.getElementById('prof-steamid').innerText = prof.steamid64;
    document.getElementById('prof-bio').innerText = prof.bio;

    const isMe = (userKey === currentUser);
    document.getElementById('my-sync-box').style.display = isMe ? 'block' : 'none';
    document.getElementById('prof-trade-btn-area').innerHTML = isMe ? '' :
        `<button onclick="startTradeWith('${userKey}')" class="btn-steam btn-green" style="width:100%;">Send Trade Offer</button>`;

    const inventories = db.inventories || {};
    const rawInv = inventories[userKey] || '';
    const items = parseInventoryTxt(rawInv);
    const count = Object.keys(items).length;

    document.getElementById('side-inv-count').innerText = count;
    document.getElementById('stat-items-count').innerText = count;
}

async function uploadInventoryFile() {
    const input = document.getElementById('inv-file-input');
    if (!input.files.length) return alert('Najprv vyber súbor inventory.txt!');

    const reader = new FileReader();
    reader.onload = async function(e) {
        const rawText = e.target.result;
        const parsed = parseInventoryTxt(rawText);
        const count = Object.keys(parsed).length;
        if (count === 0) return alert('Súbor neobsahuje žiadne platné položky z csgo_gc.');

        const cleanTxt = buildInventoryTxt(parsed);
        const db = await loadGistData();
        if (!db.inventories) db.inventories = {};
        db.inventories[currentUser] = cleanTxt;

        const ok = await saveGistData(db);
        if (ok) {
            const banner = document.getElementById('status-banner');
            banner.innerText = `Hotovo! Do Gistu sa uložilo ${count} predmetov.`;
            banner.style.display = 'block';
            loadProfile(currentUser);
        }
    };
    reader.readAsText(input.files[0]);
}

async function downloadUpdatedInventory() {
    const db = await loadGistData();
    const content = (db.inventories && db.inventories[currentUser]) ? db.inventories[currentUser] : `"items"\n{\n}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventory.txt';
    a.click();
}

// =========================================================
// TRADES & INVENTORY
// =========================================================
function openUserInventory(userKey) {
    viewedUser = userKey;
    showPage('inventory');
    renderInventoryPage();
}

function startTradeWith(userKey) {
    viewedUser = userKey;
    selectedMyItems.clear();
    selectedTheirItems.clear();
    showPage('inventory');
    renderInventoryPage(true);
}

async function renderInventoryPage(isTradeMode = false) {
    const search = document.getElementById('inv-search').value.toLowerCase();
    const db = await loadGistData();
    const inventories = db.inventories || {};
    
    const myRaw = inventories[currentUser] || '';
    const myItems = parseInventoryTxt(myRaw);

    if (!isTradeMode && viewedUser === currentUser) {
        document.getElementById('inv-title').innerText = `Tvoj inventár (${Object.keys(myItems).length} predmetov)`;
        document.getElementById('single-inv-view').style.display = 'block';
        document.getElementById('trade-split-view').style.display = 'none';
        document.getElementById('send-trade-submit').style.display = 'none';
        renderGrid('single-inv-grid', myItems, search, null);
    } else {
        const theirRaw = inventories[viewedUser] || '';
        const theirItems = parseInventoryTxt(theirRaw);

        document.getElementById('inv-title').innerText = `Trade Offer s hráčom: ${viewedUser}`;
        document.getElementById('single-inv-view').style.display = 'none';
        document.getElementById('trade-split-view').style.display = 'block';
        document.getElementById('send-trade-submit').style.display = 'inline-block';

        renderGrid('my-trade-grid', myItems, search, selectedMyItems);
        renderGrid('their-trade-grid', theirItems, search, selectedTheirItems);
    }
}

function renderGrid(elementId, itemsObj, search, selectionSet) {
    const grid = document.getElementById(elementId);
    grid.innerHTML = '';

    for (const uid in itemsObj) {
        const it = itemsObj[uid];
        const title = it.custom_name || `Item #${it.defindex}`;
        if (search && !title.toLowerCase().includes(search) && !String(it.defindex).includes(search)) continue;

        const card = document.createElement('div');
        card.className = `item-card rarity-${it.rarity}` + (selectionSet && selectionSet.has(uid) ? ' selected' : '');
        card.innerHTML = `
            <div class="item-img">Defindex: ${it.defindex}<br>Paint: ${it.paintindex}</div>
            <div class="item-footer">
                <div class="item-weapon">${title}</div>
                <div class="item-skin">UID: ${uid}</div>
            </div>
        `;
        if (selectionSet) {
            card.onclick = () => {
                if (selectionSet.has(uid)) selectionSet.delete(uid);
                else selectionSet.add(uid);
                card.classList.toggle('selected');
            };
        }
        grid.appendChild(card);
    }
}

async function submitTradeOffer() {
    if (selectedMyItems.size === 0 && selectedTheirItems.size === 0) {
        return alert('Vyber aspoň jednu položku na výmenu!');
    }
    const db = await loadGistData();
    if (!db.trades) db.trades = [];

    db.trades.push({
        id: 'tr_' + Date.now(),
        from: currentUser,
        to: viewedUser,
        from_items: Array.from(selectedMyItems),
        to_items: Array.from(selectedTheirItems),
        status: 'pending'
    });

    const ok = await saveGistData(db);
    if (ok) {
        alert('Trade ponuka bola odoslaná do Gistu!');
        showPage('trades');
    }
}

async function loadTrades() {
    const db = await loadGistData();
    const trades = db.trades || [];
    const list = document.getElementById('trades-list');
    list.innerHTML = '';

    trades.slice().reverse().forEach(tr => {
        if (tr.from !== currentUser && tr.to !== currentUser) return;
        const box = document.createElement('div');
        box.className = 'showcase-box';
        box.style.cssText = 'padding:15px; display:flex; justify-content:space-between; align-items:center;';

        let actionHtml = `<span style="color:#8f98a0;">[${tr.status.toUpperCase()}]</span>`;
        if (tr.to === currentUser && tr.status === 'pending') {
            actionHtml = `
                <div>
                    <button onclick="acceptTrade('${tr.id}')" class="btn-steam btn-green">Accept Trade</button>
                    <button onclick="declineTrade('${tr.id}')" class="btn-steam">Decline</button>
                </div>
            `;
        }

        box.innerHTML = `
            <div>
                <b style="color:#fff;">${tr.from}</b> ponúka <b>${tr.from_items.length}</b> vecí za <b>${tr.to_items.length}</b> vecí hráča <b style="color:#fff;">${tr.to}</b>
            </div>
            ${actionHtml}
        `;
        list.appendChild(box);
    });
}

async function acceptTrade(tradeId) {
    const db = await loadGistData();
    const trades = db.trades || [];
    const tr = trades.find(t => t.id === tradeId && t.to === currentUser && t.status === 'pending');
    if (!tr) return;

    if (!db.inventories) db.inventories = {};
    const invSenderRaw = db.inventories[tr.from] || '';
    const invReceiverRaw = db.inventories[tr.to] || '';

    const invSender = parseInventoryTxt(invSenderRaw);
    const invReceiver = parseInventoryTxt(invReceiverRaw);

    // Presun položiek a odpísanie z pôvodného inventory.txt
    tr.from_items.forEach(uid => {
        if (invSender[uid]) {
            invReceiver[uid] = invSender[uid];
            delete invSender[uid];
        }
    });

    tr.to_items.forEach(uid => {
        if (invReceiver[uid]) {
            invSender[uid] = invReceiver[uid];
            delete invReceiver[uid];
        }
    });

    db.inventories[tr.from] = buildInventoryTxt(invSender);
    db.inventories[tr.to] = buildInventoryTxt(invReceiver);
    tr.status = 'accepted';

    const ok = await saveGistData(db);
    if (ok) {
        alert('Trade prijatý! Predmety boli úspešne presunuté a odpísané.');
        loadTrades();
        updateTradeBadge();
    }
}

async function declineTrade(tradeId) {
    const db = await loadGistData();
    const trades = db.trades || [];
    const tr = trades.find(t => t.id === tradeId);
    if (tr) {
        tr.status = 'declined';
        await saveGistData(db);
        loadTrades();
        updateTradeBadge();
    }
}

async function updateTradeBadge() {
    const db = await loadGistData();
    const trades = db.trades || [];
    const pending = trades.filter(t => t.to === currentUser && t.status === 'pending').length;
    const badge = document.getElementById('trade-badge');
    badge.innerText = pending;
    badge.style.display = pending > 0 ? 'inline-block' : 'none';
}

async function loadPlayers() {
    const db = await loadGistData();
    const users = db.users || {};
    const grid = document.getElementById('players-list');
    grid.innerHTML = '';

    for (const key in users) {
        const u = users[key];
        const card = document.createElement('div');
        card.className = 'showcase-box';
        card.style.padding = '15px';
        card.innerHTML = `
            <div style="color:#fff; font-size:16px; margin-bottom:5px;">${u.username}</div>
            <div style="color:#8f98a0; font-size:11px; margin-bottom:12px;">${u.steamid64}</div>
            <button onclick="viewedUser='${key}'; showPage('profile');" class="btn-steam">View Profile</button>
        `;
        grid.appendChild(card);
    }
}

window.onload = initApp;
