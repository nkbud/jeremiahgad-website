# Infinite Loading State During Session Restoration

## Problem Description
When users with existing sessions refresh the page or revisit the site, they encounter an infinite loading state. The application gets stuck at "Loading..." and never proceeds to render the main content.

## Debug Logs Analysis
```
[AUTH DEBUG] AuthProvider initialized, initial loading state: true
[AUTH DEBUG] AuthProvider useEffect starting - initializing session
[AUTH DEBUG] getSessionAndProfile called
[AUTH DEBUG] Calling supabase.auth.getSession()
[AUTH DEBUG] AuthProvider useEffect cleanup - unsubscribing auth listener
[AUTH DEBUG] AuthProvider useEffect starting - initializing session
[AUTH DEBUG] getSessionAndProfile called
[AUTH DEBUG] Calling supabase.auth.getSession()
```

## Root Cause Analysis
The `supabase.auth.getSession()` call appears to hang indefinitely when there's an existing session. The logs show:

1. ✅ AuthProvider initializes correctly
2. ✅ useEffect runs and calls getSessionAndProfile
3. ❌ `supabase.auth.getSession()` is called but never resolves
4. ❌ Component cleanup/remount cycle occurs, suggesting timeout or error

## Symptoms
- **Incognito mode works**: Users without existing sessions can access the site normally
- **Refresh fails**: Users with active sessions see infinite loading on page refresh
- **No console errors**: The session call doesn't throw errors, it just hangs
- **Component remounting**: The useEffect cleanup suggests React is remounting the component

## Potential Causes
1. **Supabase session corruption**: The stored session might be in an invalid state
2. **Network timeout**: The session restoration call might be timing out
3. **Supabase configuration**: Auth configuration might have issues with session persistence
4. **Browser storage issues**: LocalStorage/SessionStorage might be corrupted
5. **Race conditions**: Multiple session restoration attempts might be interfering

## Investigation Status
- 🔍 **Current Focus**: Session restoration hanging indefinitely
- ⚠️ **Blocking Issue**: Prevents existing users from accessing the site
- 🔧 **Next Steps**: Add timeout mechanism and better error handling

## Proposed Solutions
1. **Add timeout mechanism**: Implement timeout for session restoration
2. **Fallback strategy**: Clear session and redirect to auth if restoration fails
3. **Better error handling**: Catch and log specific session restoration errors
4. **Session validation**: Verify session integrity before attempting restoration
5. **Alternative initialization**: Try different approaches to session initialization

## Environment Details
- **Development Server**: localhost:5173
- **Supabase Client**: Standard configuration with autoRefreshToken and persistSession
- **React Version**: Using React strict mode (double renders in development)