// --- Core Functions ---
window.registerScan = async function (id) {
    // This function attempts to WRITE the new scan to Supabase
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_if_new`, {
        method: 'POST',
        headers: {
            'apikey': API_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`, // Authorization header is critical for RPC calls
            'Origin': window.location.origin
        },
        body: JSON.stringify({ p_can_id: id })
    });

    if (res.ok) {
        const d = await res.json();
        if (d?.new_scan) {
            // Stop and restart clock to update immediately
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
        // CRITICAL ERROR LOGGING for the failing RPC call
        console.error("Scan registration failed with status:", res.status);
        document.getElementById('status').innerHTML = 'Error registering scan.';
    }
}
// --- NEW FUNCTION: Fetch the initial scan count from Supabase ---
async function fetchInitialCount() {
    const originHeader = { 'Origin': window.location.origin };
    const authHeader = { 'Authorization': `Bearer ${API_KEY}` };

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
            } else {
                 console.error("Fetched value is not a string or number:", rawValue);
            }
        }
        
    } else {
        console.error("Failed to fetch initial scan count with status:", res.status);
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

    // This updates the website counter to the live value
    document.getElementById('scans').textContent = `Scans: ${totalScans.toLocaleString()} / 2,000 (first pallet)`;
}

// --- Fragment Check Logic ---
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

// --- Initialization: Now fetches live value and starts clock ---
async function init() {
    console.log("Initialization complete. Fetching live scan count.");
    await fetchInitialCount(); // <-- Calls the function you added earlier!
    
    update(); // Start the clock display immediately
    timerInterval = setInterval(update, 50); // Start the clock interval
    window.checkForCan();
}

// Line 1: Call the async initialization function to start the app
init();

// Line 2: Self-invoking function wrapper (for safety, if it's missing)
})();
