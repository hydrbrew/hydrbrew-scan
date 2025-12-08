// 1. Timer Update Loop (CORRECTED LOGIC)
    function update() {
        const acceleration_delay = totalScans * 7.3 * 1000; // 7.3 seconds acceleration per scan
        const diff = INITIAL - acceleration_delay - Date.now(); 
        
        if (diff > 0) {
            const days = Math.floor(diff / 864e5);
            const timePart = new Date(diff).toISOString().substr(11, 12); 
            document.getElementById('timer').textContent = `${days}d ${timePart}`;
        } else {
            document.getElementById('timer').textContent = "AGI IS HERE";
        }
        document.getElementById('scans').textContent = `Scans: ${totalScans.toLocaleString()} / 2,000 (first pallet)`;
        
        // --- NEW LINE ADDED ---
        window.checkForCan(); // Check for scan fragment every animation frame
        
        requestAnimationFrame(update);
    }
