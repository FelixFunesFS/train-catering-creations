

## Fix: "Reset it here" Link Not Working

### Problem
The "Reset it here" button on the Admin Auth page uses `document.querySelector('[value="reset"]')` to switch tabs, but Radix UI Tabs don't render `value` as a standard HTML attribute, so the selector returns `null` and nothing happens.

### Solution
Convert the Tabs component from uncontrolled to controlled using React state, and replace DOM manipulation with simple state updates.

### Changes (1 file)

**`src/pages/AdminAuth.tsx`**

1. Add a `useState` for the active tab: `const [activeTab, setActiveTab] = useState('signin')`
2. Make the `Tabs` component controlled: `value={activeTab} onValueChange={setActiveTab}`
3. Replace the "Reset it here" button's `onClick` from DOM query to `setActiveTab('reset')`
4. Replace the "Sign in here" button's `onClick` from DOM query to `setActiveTab('signin')`

This is a minimal, low-risk fix -- no other files are affected.

