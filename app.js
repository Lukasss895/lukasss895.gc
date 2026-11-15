// =========================================================
// NASTAVENIA GITHUB REPOZITÁRA (DOPLŇ SVOJE ÚDAJE)
// =========================================================
const GH_CONFIG = {
    owner: 'lukasss895',                // Tvoje GitHub meno
    repo: 'gocounter-inventories',      // Názov repozitára (môže byť aj ten istý ako web)
    branch: 'main',                     // Vetva (main)
    token: 'ghp_SEM_VLOZ_SVOJ_TOKEN'    // Tvoj GitHub Personal Access Token (s právom repo)
};

let currentUser = localStorage.getItem('gc_user') || null;
let viewedUser = currentUser;
let selectedMyItems = new Set();
let selectedTheirItems = new Set();

// Base64 kódovanie s podporou UTF-8 (diakritika, špeciálne znaky)
function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
function base64ToUtf8(str) {
    return decodeURIComponent(escape(atob(str)));
}

// =========================================================
// GITHUB REST API KOMUNIKÁCIA (ČÍTANIE A ZÁPIS SÚBOROV)
// =========================================================
async function ghGetFile(path) {
    const url = `https://api.github.com/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}?ref=${GH_CONFIG.branch}&t=${Date.now()}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GH_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (res.status === 200) {
        const data = await res.json();
        return { exists: true, content: base64ToUtf8(data.content), sha: data.sha };
    }
    return { exists: false, content: null, sha: null };
}

async function ghSaveFile(path, content, commitMessage, sha = null) {
    if (!sha) {
        const existing = await ghGetFile(path);
        if (existing.exists) sha = existing.sha;
    }
    const url = `https://api.github.com/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${path}`;
    const body = {
        message: commitMessage,
        content: utf8ToBase64(content),
        branch: GH_CONFIG.branch
    };
    if (sha) body.sha = sha;

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${GH_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    return res.ok;
}

// =========================================================
// PARSOVANIE A GENEROVANIE CSGO_GC inventory.txt
// =========================================================
function parseInventoryTxt(rawText) {
    const items = {};
    // Nájde každý blok položky "UID" { ... }
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
// REGISTRÁCIA A PRIHLÁSENIE (ULOŽENÉ V data/users.json)
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
    const file = await ghGetFile('data/users.json');
    const users = file.exists ? JSON.parse(file.content) : {};

    if (users[key]) {
        errEl.innerText = 'Tento používateľ už existuje!';
        errEl.style.display = 'block';
        return;
    }

    users[key] = {
        username: username,
        password: btoa(password),
        steamid64: steamid,
        bio: 'No information given.'
    };

    const ok = await ghSaveFile('data/users.json', JSON.stringify(users, null, 2), `Register user: ${username}`, file.sha);
    if (ok) {
        currentUser = key;
        viewedUser = key;
        localStorage.setItem('gc_user', key);
        initApp();
    } else {
        errEl.innerText = 'Chyba spojenia s GitHubom! Skontroluj Token v app.js.';
        errEl.style.display = 'block';
    }
}

async function handleLogin() {
    const username = document.getElementById('login-user').value.trim().toLowerCase();
    const password = document.getElementById('login-pass').value;
    const errEl = document.getElementById('auth-error');

    const file = await ghGetFile('data/users.json');
    const users = file.exists ? JSON.parse(file.content) : {};

    if (users[username] && users[username].password === btoa(password)) {
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
// NAVIGÁCIA A ZOBRAZENIE STRÁNOK
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
// PROFIL, NAHRATIE A STIAHNUTIE inventory.txt
// =========================================================
async function loadProfile(userKey) {
    viewedUser = userKey;
    const usersFile = await ghGetFile('data/users.json');
    const users = usersFile.exists ? JSON.parse(usersFile.content) : {};
    const prof = users[userKey] || { username: userKey, steamid64: 'Unknown', bio: '' };

    document.getElementById('prof-username').innerText = prof.username;
    document.getElementById('prof-steamid').innerText = prof.steamid64;
    document.getElementById('prof-bio').innerText = prof.bio;

    const isMe = (userKey === currentUser);
    document.getElementById('my-sync-box').style.display = isMe ? 'block' : 'none';
    document.getElementById('prof-trade-btn-area').innerHTML = isMe ? '' :
        `<button onclick="startTradeWith('${userKey}')" class="btn-steam btn-green" style="width:100%;">Send Trade Offer</button>`;

    const invFile = await ghGetFile(`inventories/${userKey}.txt`);
    const items = invFile.exists ? parseInventoryTxt(invFile.content) : {};
    const count = Object.keys(items).length;

    document.getElementById('side-inv-count').innerText = count;
    document.getElementById('stat-items-count').innerText = count;
}

async function uploadInventoryFile() {
    const input = document.getElementById('inv-file-input');
    if (!input.files.length) return alert('Najprv vyber súbor inventory.txt!');

    const reader = new FileReader();
    reader.onload = async function(e) {
        const parsed = parseInventoryTxt(e.target.result);
        const count = Object.keys(parsed).length;
        if (count === 0) return alert('Súbor neobsahuje žiadne platné položky z csgo_gc.');

        const cleanTxt = buildInventoryTxt(parsed);
        const ok = await ghSaveFile(`inventories/${currentUser}.txt`, cleanTxt, `Upload inventory: ${currentUser}`);
        if (ok) {
            const banner = document.getElementById('status-banner');
            banner.innerText = `Hotovo! Na GitHub sa uložilo ${count} predmetov.`;
            banner.style.display = 'block';
            loadProfile(currentUser);
        }
    };
    reader.readAsText(input.files[0]);
}

async function downloadUpdatedInventory() {
    const invFile = await ghGetFile(`inventories/${currentUser}.txt`);
    const content = invFile.exists ? invFile.content : `"items"\n{\n}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventory.txt';
    a.click();
}

// =========================================================
// INVENTÁR A VYTVORENIE TRADE PONUKY
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
    const myFile = await ghGetFile(`inventories/${currentUser}.txt`);
    const myItems = myFile.exists ? parseInventoryTxt(myFile.content) : {};

    if (!isTradeMode && viewedUser === currentUser) {
        document.getElementById('inv-title').innerText = `Tvoj inventár (${Object.keys(myItems).length} predmetov)`;
        document.getElementById('single-inv-view').style.display = 'block';
        document.getElementById('trade-split-view').style.display = 'none';
        document.getElementById('send-trade-submit').style.display = 'none';
        renderGrid('single-inv-grid', myItems, search, null);
    } else {
        const theirFile = await ghGetFile(`inventories/${viewedUser}.txt`);
        const theirItems = theirFile.exists ? parseInventoryTxt(theirFile.content) : {};

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
    const tradesFile = await ghGetFile('data/trades.json');
    const trades = tradesFile.exists ? JSON.parse(tradesFile.content) : [];

    trades.push({
        id: 'tr_' + Date.now(),
        from: currentUser,
        to: viewedUser,
        from_items: Array.from(selectedMyItems),
        to_items: Array.from(selectedTheirItems),
        status: 'pending'
    });

    const ok = await ghSaveFile('data/trades.json', JSON.stringify(trades, null, 2), `New trade: ${currentUser} -> ${viewedUser}`, tradesFile.sha);
    if (ok) {
        alert('Trade ponuka bola odoslaná a uložená na GitHub!');
        showPage('trades');
    }
}

// =========================================================
// PRIJATIE OBCHODU (ODPÍSANIE Z inventory.txt)
// =========================================================
async function loadTrades() {
    const tradesFile = await ghGetFile('data/trades.json');
    const trades = tradesFile.exists ? JSON.parse(tradesFile.content) : [];
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
    const tradesFile = await ghGetFile('data/trades.json');
    const trades = JSON.parse(tradesFile.content);
    const tr = trades.find(t => t.id === tradeId && t.to === currentUser && t.status === 'pending');
    if (!tr) return;

    const fSender = await ghGetFile(`inventories/${tr.from}.txt`);
    const fReceiver = await ghGetFile(`inventories/${tr.to}.txt`);

    const invSender = fSender.exists ? parseInventoryTxt(fSender.content) : {};
    const invReceiver = fReceiver.exists ? parseInventoryTxt(fReceiver.content) : {};

    // Presun z odosielateľa k príjemcovi (odpísanie z inventory.txt odosielateľa)
    tr.from_items.forEach(uid => {
        if (invSender[uid]) {
            invReceiver[uid] = invSender[uid];
            delete invSender[uid];
        }
    });

    // Presun z príjemcu k odosielateľovi (odpísanie z inventory.txt príjemcu)
    tr.to_items.forEach(uid => {
        if (invReceiver[uid]) {
            invSender[uid] = invReceiver[uid];
            delete invReceiver[uid];
        }
    });

    // Zápis aktualizovaných inventory.txt súborov späť na GitHub
    await ghSaveFile(`inventories/${tr.from}.txt`, buildInventoryTxt(invSender), `Trade sync: ${tr.from}`, fSender.sha);
    await ghSaveFile(`inventories/${tr.to}.txt`, buildInventoryTxt(invReceiver), `Trade sync: ${tr.to}`, fReceiver.sha);

    tr.status = 'accepted';
    await ghSaveFile('data/trades.json', JSON.stringify(trades, null, 2), `Trade accepted: ${tradeId}`, tradesFile.sha);

    alert('Trade prijatý! Položky boli odpísané z pôvodného inventory.txt a pripísané druhému hráčovi.');
    loadTrades();
    updateTradeBadge();
}

async function declineTrade(tradeId) {
    const tradesFile = await ghGetFile('data/trades.json');
    const trades = JSON.parse(tradesFile.content);
    const tr = trades.find(t => t.id === tradeId);
    if (tr) {
        tr.status = 'declined';
        await ghSaveFile('data/trades.json', JSON.stringify(trades, null, 2), `Trade declined: ${tradeId}`, tradesFile.sha);
        loadTrades();
        updateTradeBadge();
    }
}

async function updateTradeBadge() {
    const tradesFile = await ghGetFile('data/trades.json');
    if (!tradesFile.exists) return;
    const trades = JSON.parse(tradesFile.content);
    const pending = trades.filter(t => t.to === currentUser && t.status === 'pending').length;
    const badge = document.getElementById('trade-badge');
    badge.innerText = pending;
    badge.style.display = pending > 0 ? 'inline-block' : 'none';
}

async function loadPlayers() {
    const file = await ghGetFile('data/users.json');
    const users = file.exists ? JSON.parse(file.content) : {};
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
