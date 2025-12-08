// 1. Scan Registration
    window.registerScan = async function(id) {
        // ... (fetch request code) ...

        // 2. Handle Response and Update UI
        if (res.ok) {
            const d = await res.json();
            
            if (d?.new_scan) {
                await fetchTotalScans(false); // Fetches the new total count and updates totalScans variable

                update(); // <--- ADD THIS LINE TO REDRAW THE UI IMMEDIATELY!

                // ... (rest of the UI update code) ...
            } else {
                // ...
            }
        } else {
            // ...
        }
    }
