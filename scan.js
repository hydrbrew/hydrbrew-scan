(function () {
    // --- Configuration (Verified) ---
    const INITIAL = new Date('2030-07-11T14:22:00.000Z').getTime();
    const SUPABASE_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
    const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

    // --- Global Variable Initialization ---
    let totalScans = 0; 
    let hasScanned = false;
    let timerInterval; 

    // --- UI and Helper Logic (Defined First) ---
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
    // ... (checkForCan and shareOnX functions omitted for brevity but should be included)

   // --- Core Functions: READ Operation (Final Fix) ---
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
        // Final Fix: Read the raw text and parse the number, using .text() is the only way
        const rawText = await res.text();
        
        const parsedCount = parseInt(rawText.trim(), 10);
        
        if (!isNaN(parsedCount) && parsedCount >= 0) { // Check for >= 0 just in case
            totalScans = parsedCount;
        } else {
            console.error("Could not parse final count, received:", rawText);
        }
    } else {
        console.error("Failed to fetch initial scan count with status:", res.status);
    }
}
    
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
        
        // The RPC returns [{ "new_scan": true/false }]
        if (d && d.length > 0 && d[0].new_scan === true) {
            
            // CRITICAL FIX: Directly PATCH the globals table to increment the counter,
            // bypassing the complex PL/pgSQL transaction failure.
            await fetch(`${SUPABASE_URL}/rest/v1/globals?key=eq.total_scans`, {
                method: 'PATCH',
               headers: {
 headers: {
    'apikey': API_KEY,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Prefer': 'return=minimal' // This is the old header
},
            
            // Update the local counter and UI
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

    // --- Initialization (Final Call) ---
    async function init() {
        console.log("Initialization complete. Fetching live scan count.");
        await fetchInitialCount(); 
        
        update(); 
        timerInterval = setInterval(update, 50); 
        window.checkForCan();
    }

    // --- Final Call to Start the Application ---
    init();

})();
