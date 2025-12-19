const SB_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

async function init() {
    if (!window.supabase) return;
    const sb = window.supabase.createClient(SB_URL, SB_KEY);

    // FIX FOR 400 ERROR: Only fire if ID exists and is a string
    if (window.location.hash.includes('#can-')) {
        const idParts = window.location.hash.split('#can-');
        if (idParts.length > 1 && idParts[1].length > 0) {
            const cleanId = String(idParts[1]);
            // Sending the parameter as 'p_can_id' to match your SQL function
            await sb.rpc('increment_if_new', { p_can_id: cleanId });
            window.location.hash = '';
            location.reload();
        }
    }

    const { data } = await sb.from('globals').select('value').eq('key', 'total_scans').single();
    const count = data ? parseInt(data.value) : 0;
    
    const el = document.getElementById('scans');
    if (el) el.innerText = `Scans: ${count} / 2,000 (first pallet)`;

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
