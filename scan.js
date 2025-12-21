(function() {
    "use strict";
    
    // ========================================
    // CONFIGURATION
    // ========================================
    const SB_URL = "https://pqcouyhedjiatfrjjbli.supabase.co";
    const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM";
    
    const MAX_RETRIES = 20;
    const RETRY_INTERVAL = 100; // ms
    
    // ========================================
    // UTILITY: WAIT FOR SUPABASE TO LOAD
    // ========================================
    function waitForSupabase(retries = 0) {
        return new Promise((resolve, reject) => {
            if (typeof window.supabase !== "undefined" && typeof window.supabase.createClient === "function") {
                console.log("✅ Supabase library loaded successfully");
                resolve();
            } else if (retries < MAX_RETRIES) {
                console.log(`⏳ Waiting for Supabase... (${retries + 1}/${MAX_RETRIES})`);
                setTimeout(() => {
                    waitForSupabase(retries + 1).then(resolve).catch(reject);
                }, RETRY_INTERVAL);
            } else {
                const error = "❌ Supabase library failed to load after " + MAX_RETRIES + " attempts";
                console.error(error);
                console.error("Make sure the Supabase CDN script is loaded BEFORE this script");
                reject(new Error(error));
            }
        });
    }
    
    // ========================================
    // MAIN INITIALIZATION
    // ========================================
    async function init() {
        try {
            console.log("🚀 Initializing HydrBrew scan tracking...");
            
            // Wait for Supabase to be ready
            await waitForSupabase();
            
            // Initialize Supabase client
            const sb = window.supabase.createClient(SB_URL, SB_KEY);
            console.log("✅ Supabase client initialized");
            
            // ========================================
            // 1. PROCESS SCAN IF URL HAS #can-
            // ========================================
            if (window.location.hash.startsWith("#can-")) {
                const id = window.location.hash.split("#can-")[1];
                
                if (id && id.trim().length > 0) {
                    console.log("🔍 Can ID detected:", id);
                    console.log("📝 Recording scan...");
                    
                    try {
                        const { data, error } = await sb.rpc("increment_if_new", { 
                            p_can_id: String(id) 
                        });
                        
                        if (error) {
                            console.error("❌ Error recording scan:", error);
                            throw error;
                        }
                        
                        console.log("✅ Scan recorded successfully:", data);
                        
                        // Clear the hash WITHOUT reloading the page
                        history.replaceState(null, null, " ");
                        
                        // Refresh the count display
                        await loadScanCount(sb);
                        
                    } catch (scanError) {
                        console.error("❌ Failed to record scan:", scanError);
                        alert("Failed to record scan. Please try again.");
                    }
                } else {
                    console.log("⚠️ Empty can ID in hash");
                }
            } else {
                console.log("ℹ️ No can ID in URL hash");
            }
            
            // ========================================
            // 2. LOAD THE SCAN COUNT
            // ========================================
            await loadScanCount(sb);
            
            // ========================================
            // 3. START ACCELERATION TIMER
            // ========================================
            startAccelerationTimer();
            
            console.log("✅ Initialization complete");
            
        } catch (error) {
            console.error("❌ Initialization failed:", error);
            console.error("Error details:", {
                message: error.message,
                stack: error.stack
            });
        }
    }
    
    // ========================================
    // LOAD SCAN COUNT FROM DATABASE
    // ========================================
    async function loadScanCount(sb) {
        try {
            console.log("📊 Loading scan count...");
            
            const { data, error } = await sb
                .from("globals")
                .select("value")
                .eq("key", "total_scans")
                .single();
            
            if (error) {
                console.error("❌ Error loading scan count:", error);
                throw error;
            }
            
            const count = data ? parseInt(data.value) : 0;
            console.log("📊 Current scan count:", count);
            
            const el = document.getElementById("scans");
            if (el) {
                el.innerText = `Scans: ${count} / 2,000 (first pallet)`;
                console.log("✅ Scan count display updated");
            } else {
                console.warn("⚠️ Element #scans not found in DOM");
            }
            
            // Store count globally for timer calculation
            window.hydrbrewScanCount = count;
            
        } catch (error) {
            console.error("❌ Failed to load scan count:", error);
        }
    }
    
    // ========================================
    // START ACCELERATION TIMER
    // ========================================
    function startAccelerationTimer() {
        console.log("⏱️ Starting acceleration timer...");
        
        setInterval(() => {
            const count = window.hydrbrewScanCount || 0;
            const diff = (1910000520000 - (count * 86400000)) - Date.now();
            const timer = document.getElementById("timer");
            
            if (timer && diff > 0) {
                const d = Math.floor(diff / 86400000);
                const h = Math.floor((diff % 86400000) / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                const ms = Math.floor(diff % 1000);
                
                timer.innerText = 
                    String(d).padStart(4, "0") + ":" +
                    String(h).padStart(2, "0") + ":" +
                    String(m).padStart(2, "0") + ":" +
                    String(s).padStart(2, "0") + ":" +
                    String(ms).padStart(3, "0");
            }
        }, 41);
    }
    
    // ========================================
    // START THE SCRIPT
    // ========================================
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
    
})();
