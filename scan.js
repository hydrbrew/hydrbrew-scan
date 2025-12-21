(function() {
  "use strict";

  const SUPABASE_URL = "https://pqcouyhedjiatfrjjbli.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY291eWhlZGppYXRmcmpqYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTUwNDgsImV4cCI6MjA4MDI3MTA0OH0.AjIcx088jU932heptPbi-HDSTvhAcIui5rUfaBbc8KM";

  async function callAdvanceViaRest(days = 1) {
    const url = `${SUPABASE_URL}/rest/v1/rpc/advance_agi_clock`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ days }),
        mode: "cors"
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
      }
      return res.json().catch(() => null);
    } catch (err) {
      console.warn("REST advance_agi_clock failed", err);
      throw err;
    }
  }

  async function tryAdvance(days = 1) {
    // Prefer Supabase client RPC if available
    if (typeof window.supabase !== "undefined" && typeof window.supabase.createClient === "function") {
      try {
        const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data, error } = await sb.rpc("advance_agi_clock", { days });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("supabase.rpc failed, falling back to REST:", err);
      }
    }
    // Fallback to direct REST call
    return callAdvanceViaRest(days);
  }

  // Expose a function for redirect.html to call
  async function advanceAndRedirect() {
    try {
      await tryAdvance(1);
    } catch (err) {
      // swallow errors so redirect still happens
      console.warn("advanceAndRedirect error (continuing):", err);
    }
  }

  window.advanceAndRedirect = advanceAndRedirect;

})();
