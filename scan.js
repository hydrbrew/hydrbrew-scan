(function () {
    // --- Configuration (Verify URL/KEY are Correct) ---
    const INITIAL = new Date('2030-07-11T14:22:00.000Z').getTime();
    const SUPABASE_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
    // This key has RLS and permissions verified.
    const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

    // --- Global Variable Initialization (Restored for Clock) ---
    let totalScans = 0; // Starts at 0, updated immediately by fetchInitialCount
    let hasScanned = false;
    let timerInterval; 

    // --- Core Functions: WRITE Operation (Scan Registration) ---
    window.registerScan = async function (id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_if_new`, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`, 
                'Origin': window.location.origin
            },
            body: JSON.stringify({ p_can_id: id })
        });

        if (res.ok) {
            const d = await res.json();
            if (d?.new_scan) {
                totalScans += 1;
                clearInterval(timerInterval);
                update();
                timerInterval = setInterval(update, 50);

                // UI Feedback
                document.getElementById('status').innerHTML = '<b>Human optimized for 2045</b>';
                document.getElementById('shareContainer').style.display = 'block';

                const f = document.getElementById('flash');
                f.style.transform = 'translate(-50%,-50%) scale(1.5)';
                f.style.opacity = 1;
                setTimeout(() => {
                    f.style.transform = 'translate(-50%,-50%) scale(0)';
                    f.style.opacity = 0;
                }, 1500);
            } else {
                document.getElementById('status').innerHTML = 'Scan already counted.';
            }
        } else {
            console.error("Scan registration failed with status:", res.status);
            document.getElementById('status').innerHTML = 'Error registering scan.';
        }
    }

    // --- Core Functions: READ Operation (Initial Count Fetch) ---
    async function fetchInitialCount() {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_total_scans`, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`, 
                'Origin': window.location.origin
            }
        });

        if (res.ok) {
            const d = await res.json();
            
            // CRITICAL FIX: Robustly read the array response from PostgreSQL
            if (d && d.length > 0) {
                const rawValue = d[0].get_total_scans; 
                if (typeof rawValue === 'string') {
                    totalScans = parseInt(rawValue, 10);
                } else if (typeof rawValue === 'number') {
                    totalScans = rawValue;
                }
            }
            
        } else {
            console.error("Failed to fetch initial scan count with status:", res.status);
        }
    }


    // --- UI and Helper Logic (Restored) ---
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

        // This updates the website counter to the live value
        document.getElementById('scans').textContent = `Scans: ${totalScans.toLocaleString()} / 2,000 (first pallet)`;
    }

    window.checkForCan = function () {
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

    window.shareOnX = function () {
        open(`https://x.com/intent/post?text=${encodeURIComponent('I just optimized myself for 2045 with Hydrbrew° 🧠⚡ \n\n ' + totalScans + '/2,000 humans ready \n https://hydrbrew.com')}`, '_blank');
    }

    // --- Initialization (Restored) ---
    async function init() {
        console.log("Initialization complete. Fetching live scan count.");
        await fetchInitialCount(); // <-- Call the fetch function
        
        update(); // Start the clock display immediately
        timerInterval = setInterval(update, 50); // Start the clock interval
        window.checkForCan();
    }

    // --- Final Call to Start the Application ---
    init();

})();
