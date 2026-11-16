// Konfigurácia Gistu (token sa načíta bezpečne z lokálnej pamäte prehliadača)
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

// Funkcia na načítanie dát z Gistu
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
                localStorage.removeItem('gocounter_token'); // Vymaže neplatný token a opýta sa znova
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

// Funkcia na uloženie dát do Gistu
async function saveGistData(dbData) {
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

        if (!response.ok) {
            throw new Error(`Chyba pri ukladaní: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error("Chyba pri zápise do Gistu:", error);
        return false;
    }
}

// Inicializácia aplikácie po načítaní stránky
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Načítavam platformu...");
    const db = await loadGistData();
    // Tu pokračuje tvoja pôvodná logika pre vykreslenie používateľov, inventárov a obchodov
});
