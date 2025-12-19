const SB_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

async function init() {
    // Load Library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);
    await new Promise(r => script.onload = r);

    const sb = window.supabase.createClient(SB_URL, SB_KEY);

    // Scan Check
    if (window.location.hash.startsWith('#can-')) {
        const id = window.location.hash.replace('#can-', '');
        await sb.rpc('increment_if_new', { p_can_id: id });
        window.location.hash = '';
        location.reload();
    }

    // Sync Count
    const { data } = await sb.from('globals').select('value').eq('key', 'total_scans').single();
    const count = data ? parseInt(data.value) : 0;
    
    // Update Display
    const el = document.getElementById('scans');
    if (el) el.innerText = `Scans: ${count} / 2,000 (first pallet)`;

    // Timer Acceleration
    const baseTarget = 1910000520000;
    setInterval(() => {
        const diff = (baseTarget - (count * 86400000)) - Date.now();
        const timer = document.getElementById('timer');
        if (timer && diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const ms = Math.floor(diff % 1000);
            timer.innerText = `${String(d).padStart(4,'0')}:${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(ms).padStart(3,'0')}`;
        }
    }, 41);
}

init();
