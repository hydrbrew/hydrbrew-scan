(function() {
    // --- Configuration ---
    const INITIAL = new Date('2030-07-11T14:22:00.000Z').getTime();
    const SUPABASE_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
    const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

    let totalScans = 0;
    let hasScanned = false; 
    let timerInterval; // Holder for the clock interval

    // --- Core Functions ---

    window.registerScan = async function(id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_if_new`, {
            method: 'POST',
            headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_can_id: id })
        });
        if (res.ok) {
            const d = await res.json();
            if (d?.new_scan) {
                // Stop and restart clock to update immediately
                clearInterval(timerInterval); 
                await fetchTotalScans(true); // Fetch new count AND restart the clock
                
                // UI Feedback
                document.getElementById('status').innerHTML = '<b>Human optimized for 2045</b>';
                document.getElementById('shareContainer').style.display = 'block';
                const f = document.getElementById('flash');
                f.style.transform = 'translate(-50%,-50%) scale(1.5)';
                f.style.opacity = 1;
                setTimeout(() => { f.style.transform = 'translate(-50%,-50%) scale(0)'; f.style.opacity = 0; }, 1500);
            } else {
                document.getElementById('status').innerHTML = 'Scan already counted.';
            }
        } else {
            console.error("Scan registration failed with status:", res.status);
            document.getElementById('status').innerHTML = 'Error registering scan.';
        }
    }

    async function fetchTotalScans(startTimer = true) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/globals?key=eq.total_scans`, {
            headers: { 'apikey': API_KEY }
        });
        const d = await res.json();
        if (d && d.length > 0) {
            totalScans = d[0].value;
            if (startTimer) {
                update(); 
                timerInterval = setInterval(update, 50); // Use the global interval holder
            }
        } else {
            console.error("Error: 'total_scans' row not found. Clock cannot start.");
        }
    }

    // --- UI Logic ---
    function update() {
        const acceleration_delay = totalScans * 7.3 * 1000;
        const diff = INITIAL - acceleration_delay - Date.now(); 
        
        if (diff > 0) {
            const days = Math.floor(diff / 864e5);
            const timePart = new Date(diff).toISOString().substr(11, 12); 
            document.getElementById('timer').textContent = `${days}d ${timePart}`;
        } else {
            document.getElementById('timer').textContent = "AGI IS HERE";
        }
        document.getElementById('scans').textContent = `Scans: ${totalScans.toLocaleString()} / 2,000 (first pallet)`;
    }

    window.checkForCan = function() {
        const fullHash = location.hash;
        if (fullHash.startsWith('#can-')) {
            const canId = fullHash.substring(5);
            if (canId.length === 12 && !hasScanned) {
                hasScanned = true;
                document.getElementById('status').textContent = 'Optimizing human...';
                window.registerScan(canId);
                history.replaceState(null, null, ' '); 
            }
        }
    }
    
    window.shareOnX = function() {
        open(`https://x.com/intent/post?text=${encodeURIComponent('I just optimized myself for 2045 with Hydrbrew° 🧠⚡\n\n' + totalScans + '/2,000 humans ready\nhttps://hydrbrew.com')}`, '_blank');
    }

    // --- Initialization ---
    function init() {
        console.log("Initialization complete. Starting hydrbrew logic...");
        fetchTotalScans();
        window.checkForCan();
    }
    
    // Use the most stable initialization method: direct call.
    init(); 
})();

