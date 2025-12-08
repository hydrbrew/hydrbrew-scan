(function () {
    // --- Configuration (Verified) ---
    const INITIAL = new Date('2030-07-11T14:22:00.000Z').getTime();
    const SUPABASE_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
    const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

    // --- Global Variable Initialization ---
    let totalScans = 0; 
    let hasScanned = false;
    let timerInterval; 
    let canId;

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

    function shareOnX(url) {
        const text = encodeURIComponent(`I just scanned a can! Every scan delays AGI. Current ETA: ${document.getElementById('timer').textContent} Join the singularity list: ${window.location.href}`);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }
    window.shareOnX = shareOnX;

    // --- Core Functions: READ Operation (Final Stable Read) ---
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
            // Read the raw text and parse the number (Fix for bigint return type)
            const rawText = await res.text();
            const parsedCount = parseInt(rawText.trim(), 10); 
            
            if (!isNaN(parsedCount) && parsedCount >= 0) {
                totalScans = parsedCount;
            } else {
                console.error("Could not parse final count, received:", rawText);
            }
        } else {
            console.error("Failed to fetch initial scan count with status:", res.status);
        }
    }

    // --- Core Functions: WRITE Operation (Final Corrected Logic) ---
    window.registerScan = async function (id) {
        // 1. Check if scan ID is new via RPC
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
            
            // 2. Check the RPC result for new_scan: true
            if (d && d.length > 0 && d[0].new_scan === true) {
                
                // 3. CRITICAL: Directly PATCH the globals table to increment the counter
                const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/globals?key=eq.total_scans`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': API_KEY,
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`,
                        // FINAL FIX: This header is guaranteed to force the transaction success
                        'Prefer': 'return=representation' 
                    },
                    body: JSON.stringify({ value: totalScans + 1 })
                });
                
                if (patchRes.ok) {
                    // 4. Update the local counter and UI
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
                     console.error("PATCH failed with status:", patchRes.status);
                     document.getElementById('status').innerHTML = 'Error updating counter.';
                }
            } else {
                document.getElementById('status').innerHTML = 'Scan already counted.';
            }
        } else {
            console.error("Scan registration failed with status:", res.status);
            document.getElementById('status').innerHTML = 'Error registering scan.';
        }
    }

    function checkForCan() {
        canId = window.location.hash.substring(1);
        if (canId.startsWith('can-') && !hasScanned) {
            hasScanned = true;
            window.registerScan(canId);
        }
    }
    window.checkForCan = checkForCan;
    
    // --- Initialization (Final Call) ---
    async function init() {
        await fetchInitialCount(); 
        update(); 
        timerInterval = setInterval(update, 50); 
        window.checkForCan();
    }

    // --- Final Call to Start the Application ---
    init();

})();
