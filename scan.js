const SB_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

async function initExperiment() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);

    script.onload = async () => {
        const sb = window.supabase.createClient(SB_URL, SB_KEY);
        const target = 1910000520000; 

        const hash = window.location.hash;
        if (hash.includes('#can-')) {
            const canId = hash.split('#can-')[1];
            
            // Trigger the updated SQL function
            const { data, error } = await sb.rpc('increment_if_new', { p_can_id: canId });

            // If it's a new scan, show the success message
            if (data && data.length > 0) {
                document.getElementById('protocol-msg').innerHTML = "<span style='color:#fff; font-weight:bold;'>+1 OPTIMIZED HUMAN REGISTERED</span>";
                setTimeout(() => location.reload(), 1500);
            }
            window.location.hash = '';
        }

        setInterval(async () => {
            const { data } = await sb.from('globals').select('value').eq('key', 'total_scans').single();
            const count = data ? data.value : 0;
            
            const scanEl = document.getElementById('scan-count');
            if (scanEl) scanEl.innerText = count;

            const diff = (target - (count * 86400000)) - Date.now();
            if (diff > 0) {
                const d = Math.floor(diff / 86400000);
                const h = Math.floor((diff % 86400000) / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                const ms = Math.floor(diff % 1000);
                
                const timerEl = document.getElementById('timer');
                if (timerEl) {
                    timerEl.innerHTML = `${String(d).padStart(4,'0')}:${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(ms).padStart(3,'0')}`;
                }
            }
        }, 41);
    };
}
initExperiment();

})();
