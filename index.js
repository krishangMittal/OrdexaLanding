const SUPABASE_URL = 'https://kcdqdhuntoyknmkuarcy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZHFkaHVudG95a25ta3VhcmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDM1NDIsImV4cCI6MjA3MTQxOTU0Mn0.B6rxq59JZdhGvETj4wzUx2kydqrzlgMh5U07N92qWfc'

let supabase = null

// Initialize Supabase
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        return false
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            }
        })
        return true
    } catch (error) {
        return false
    }
}

// Form submission handler - Fixed version
async function handleFormSubmission(event) {
    // Prevent any other form processing
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    const form = event.target
    const emailInput = form.querySelector('input[type="email"]')
    const submitBtn = form.querySelector('input[type="submit"]')

    if (!emailInput || !submitBtn) {
        return false
    }

    const email = emailInput.value.trim()

    if (!email) {
        return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return false
    }

    if (!supabase) {
        return false
    }

    try {
        // Insert into Supabase - Fixed
        const { data, error } = await supabase
            .from('waitlist_emails')
            .insert([{ 
                email: email,
                source: 'landing_page',
                metadata: { 
                    timestamp: new Date().toISOString(),
                    user_agent: navigator.userAgent,
                    referrer: document.referrer,
                    page_url: window.location.href
                }
            }])
            .select()

        if (!error) {
            // Clear form on success
            emailInput.value = ''
        }

    } catch (error) {
        // Silent fail
    }

    return false
}

// Attach form handlers - Fixed version
function attachFormHandlers() {
    const formSelectors = [
        '#waitlist-form',
        '#waitlist-form-tablet', 
        'form[method="POST"]',
        'form[method="post"]',
        'form'
    ]

    let allForms = []
    formSelectors.forEach(selector => {
        const forms = document.querySelectorAll(selector)
        forms.forEach(form => {
            if (!allForms.includes(form)) {
                allForms.push(form)
            }
        })
    })

    if (allForms.length === 0) {
        // Try again after a delay
        setTimeout(attachFormHandlers, 2000)
        return
    }

    allForms.forEach((form) => {
        // Remove Formspark action if present
        if (form.action && form.action.includes('formspark')) {
            form.removeAttribute('action')
        }

        // Remove existing event listeners by cloning
        const newForm = form.cloneNode(true)
        form.parentNode.replaceChild(newForm, form)

        // Add our handler
        newForm.addEventListener('submit', handleFormSubmission, {
            capture: true,
            passive: false
        })
    })
}

// Initialize
function initializePage() {
    if (!initSupabase()) {
        return
    }

    attachFormHandlers()
}

// Start when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage)
} else {
    initializePage()
}

// Backup attempts
setTimeout(attachFormHandlers, 3000)
setTimeout(attachFormHandlers, 5000)
</script>