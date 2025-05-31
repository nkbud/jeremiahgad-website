# Session Management and Supabase Pro Plan Requirement

## Issue Description

Supabase hosted user sessions require the Pro Plan. On the free tier, attempting to use persistent sessions can cause:

- Infinite loading states during session restoration
- Blank pages for returning users
- Authentication flow hanging on `supabase.auth.getSession()` calls

## Root Cause

Supabase's free tier has limitations on session management features. The error message "Configuring user sessions requires the Pro Plan" indicates that persistent session storage and automatic session restoration are premium features.

## Solution

Implemented a configurable session management system with environment variable control:

### Environment Variable: `VITE_ENABLE_SESSIONS`

- **Default**: `false` (sessions disabled)
- **Free tier compatible**: When `false`, no session persistence, users sign in each session
- **Pro plan users**: Set to `true` to enable full session management

### Implementation Changes

**1. Supabase Client Configuration** (`src/lib/supabaseClient.js`):
```javascript
const enableSessions = import.meta.env.VITE_ENABLE_SESSIONS === 'true';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: enableSessions,
    persistSession: enableSessions,
    detectSessionInUrl: enableSessions
  }
});
```

**2. Auth Context Updates** (`src/contexts/AuthContext.jsx`):
- Skip session restoration when sessions are disabled
- Ignore `INITIAL_SESSION` events when sessions are disabled
- Graceful handling of both session modes

**3. Environment Configuration** (`.env.example`):
```bash
# Session Management - set to "true" to enable persistent sessions (requires Supabase Pro Plan)
# Sessions are disabled by default to work with free tier
VITE_ENABLE_SESSIONS=false
```

## User Experience Impact

### Sessions Disabled (Free Tier)
- Users need to sign in again on page refresh
- No persistent authentication across browser sessions
- Immediate page load without hanging on session restoration
- Clear, fast authentication flow

### Sessions Enabled (Pro Plan)
- Users stay signed in across sessions
- Automatic session restoration on page refresh
- Seamless experience for returning users
- Full Supabase session management features

## Testing

To test the configuration:

1. **Free tier mode**: Ensure `VITE_ENABLE_SESSIONS=false` or undefined
2. **Pro plan mode**: Set `VITE_ENABLE_SESSIONS=true`
3. Use debug mode (`VITE_DEBUG_MODE=true`) to monitor session behavior

## Recommendations

- Use sessions disabled mode for development and free tier deployments
- Only enable sessions if you have a Supabase Pro Plan subscription
- Monitor debug logs to ensure proper session handling
- Consider user experience trade-offs between convenience and cost