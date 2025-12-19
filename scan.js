const SB_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

async function initExperiment() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);

    script.onload = async () => {
        const sb = window.supabase.createClient(SB_URL, SB_KEY);
        const baseTarget = 1910000520000; 
        let currentScans = 0; // Start at zero to match your DB

        // 1. Immediate DB Fetch (Force Sync)
        const fetchRealCount = async () => {
            const { data, error } = await sb.from('globals').select('value').eq('key', 'total_scans').single();
            if (data && !error) {
                currentScans = parseInt(data.value);
                const scanEl = document.getElementById('scan-count');
                if (scanEl) scanEl.innerText = `${currentScans} / 2,000`;
            }
        };
        await fetchRealCount();

        // 2. High-Precision Ticker
        setInterval(() => {
            const acceleration = currentScans * 86400000;
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
        }, 41);

        // 3. Handle New Scans
        if (window.location.hash.includes('#can-')) {
            const id = window.location.hash.split('#can-')[1];
            await sb.rpc('increment_if_new', { p_can_id: id });
            window.location.hash = '';
            setTimeout(() => location.reload(), 1000);
        }
    };
}
initExperiment();
