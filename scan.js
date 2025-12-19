(async function() {
    const SB_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

    // 1. Load Supabase Library
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
    }

    const sb = window.supabase.createClient(SB_URL, SB_KEY);
    const baseTarget = 1910000520000; 
    let liveScans = 0;

    // 2. Scan Logic
    const handleScan = async () => {
        if (window.location.hash.includes('#can-')) {
            const id = window.location.hash.split('#can-')[1];
            try {
                await sb.rpc('increment_if_new', { p_can_id: id });
                window.location.hash = '';
                setTimeout(() => location.reload(), 500);
            } catch (err) {
                console.error("Scan Error:", err);
            }
        }
    };

    // 3. Display Logic
    const sync = async () => {
        const { data } = await sb.from('globals').select('value').eq('key', 'total_scans').single();
        if (data) {
            liveScans = parseInt(data.value);
            const el = document.getElementById('scans') || document.getElementById('scan-count');
            if (el) el.innerText = `Scans: ${liveScans} / 2,000 (first pallet)`;
        }
    };

    // 4. Timer Logic
    setInterval(() => {
        const acceleration = liveScans * 86400000;
        const diff = (baseTarget - acceleration) - Date.now();
        const timerEl = document.getElementById('timer');
        if (timerEl && diff > 0) {
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const ms = Math.floor(diff % 1000);
            timerEl.innerHTML = `${String(d).padStart(4,'0')}:${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(ms).padStart(3,'0')}`;
        }
    }, 41);

    await handleScan();
    await sync();
    setInterval(sync, 5000);
})();
