// Supabase Client Initialization for Admin Panel
(function() {
    'use strict';
    
    const SUPABASE_URL = 'https://blsgyybaevuytmgpljyk.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc2d5eWJhZXZ1eXRtZ3BsanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjcyMjYsImV4cCI6MjA4NzM0MzIyNn0.G4gvoW-_7DxQ1y28oZEHS7OIVpsyHTlZewV02Th_meU';
    
    console.log('🔧 Supabase init script starting...');
    
    // Load Supabase from CDN
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.log('📦 Loading Supabase library from CDN...');
        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = function() {
            console.log('✅ Supabase library loaded from CDN');
            initializeSupabase();
        };
        script.onerror = function() {
            console.error('❌ Failed to load Supabase library from CDN');
        };
        document.head.appendChild(script);
    } else {
        console.log('✅ Supabase library already loaded');
        initializeSupabase();
    }
    
    function initializeSupabase() {
        try {
            console.log('🔧 Initializing Supabase client...');
            console.log('   URL:', SUPABASE_URL);
            console.log('   Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
            
            // Initialize Supabase client
            if (window.supabase && window.supabase.createClient) {
                window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Supabase client initialized successfully');
                console.log('   Client object:', window.supabase);
                
                // Dispatch event to notify other scripts
                const event = new Event('supabaseReady');
                window.dispatchEvent(event);
                console.log('✅ supabaseReady event dispatched');
            } else {
                console.error('❌ window.supabase.createClient not available');
            }
        } catch (error) {
            console.error('❌ Error initializing Supabase:', error);
        }
    }
})();
