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
