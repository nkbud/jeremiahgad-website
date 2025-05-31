# Known Errors

## Content Security Policy (CSP) Error

**Error Message:**
```
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

**Description:**
This error appears in the browser console and may be related to development tooling or dependencies that use `eval()` statements, which are blocked by the site's Content Security Policy.

**Potential Causes:**
1. Development dependencies (Vite, React DevTools, etc.) using eval in development mode
2. Browser extensions injecting scripts that use eval
3. Third-party libraries or polyfills using eval statements

**Impact:**
- This error appears to be independent of the main authentication flow issues
- May not affect production builds if it's development-related
- Could potentially interfere with debugging tools or browser extensions

**Investigation Status:**
- First observed during authentication flow debugging
- Needs further investigation to determine if it's related to the infinite loading state issue
- May be benign if only affecting development environment

**Next Steps:**
1. Verify if error persists in production build
2. Check if error affects application functionality
3. Investigate specific source of eval usage
4. Consider CSP policy adjustments if necessary