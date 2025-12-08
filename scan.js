// 1. Timer Update Loop (CORRECTED LOGIC)
    function update() {
        const acceleration_delay = totalScans * 7.3 * 1000; // 7.3 seconds acceleration per scan

        // Subtract the acceleration_delay from the INITIAL timestamp
        const diff = INITIAL - acceleration_delay - Date.now(); 
        
        if (diff > 0) {
            const days = Math.floor(diff / 864e5);
            // Format time difference to H:M:S:ms
            const timePart = new Date(diff).toISOString().substr(11, 12); 
            document.getElementById('timer').textContent = `${days}d ${timePart}`;
        } else {
            document.getElementById('timer').textContent = "AGI IS HERE";
        }
        document.getElementById('scans').textContent = `Scans: ${totalScans.toLocaleString()} / 2,000 (first pallet)`;
        
        requestAnimationFrame(update);
    }
