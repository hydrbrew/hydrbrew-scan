(function() {
    let hasScanned = false;
    
    const SUPABASE_URL = 'https://pqcouyhedjiatfrjjbli.supabase.co';
    const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM';

    // --- SUPABASE SCAN REGISTRATION ---
    window.registerScan = async function(id) {
        console.log("Attempting to send scan for ID:", id);
        
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_if_new`, {
            method:'POST',
            headers:{'apikey': API_KEY, 'Content-Type':'application/json'},
            body: JSON.stringify({p_can_id:id})
        });
        
        if (res.ok) {
            console.log("Fetch successful. Status 200."); 
        } else {
            console.error("Fetch failed with status:", res.status); 
        }
    }

    // --- FRAGMENT-BASED SCAN CHECK ---
    window.checkForCan = function() {
        const fullHash = location.hash; 
        if (fullHash.startsWith('#can-')) {
            const canId = fullHash.substring(5); 
            if (canId.length === 12 && !hasScanned) {
                hasScanned = true;
                console.log('Valid can ID found, registering scan...');
                window.registerScan(canId); 
                history.replaceState(null, null, ' ');
            }
        }
    }

    // --- Run Check on Load ---
    console.log("External script loaded.");
    window.checkForCan();
})();
