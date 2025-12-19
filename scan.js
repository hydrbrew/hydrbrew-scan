const SB_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

async function initExperiment() {
    // 1. Load Supabase Library
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    const sb = window.supabase.createClient(SB_URL, SB_KEY);
    const baseTarget = 1910000520000; 
    let liveScans = 0; // Force start at 0 to match your DB

    // 2. High-Precision Ticker
    function updateTicker() {
        const acceleration = liveScans * 86400000;
        const diff = (baseTarget - acceleration) - Date.now();
        const el = document.getElementById('timer');
        
        if (el && diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const ms = Math.floor(diff % 1000);
            el.innerHTML = `${String(d).padStart(4,'0')}:${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(ms).padStart(3,'0')}`;
        }
    }
    setInterval(updateTicker, 41);

    // 3. Force Sync with Supabase
    async function syncData() {
        const { data, error } = await sb.from('globals').select('value').eq('key', 'total_scans').single();
        if (data && !error) {
            liveScans = parseInt(data.value);
            const scanEl = document.getElementById('scan-count');
            if (scanEl) scanEl.innerText = liveScans;
        }
    }
    
    await syncData();
    setInterval(syncData, 5000); // Re-sync every 5 seconds
}

initExperiment();
