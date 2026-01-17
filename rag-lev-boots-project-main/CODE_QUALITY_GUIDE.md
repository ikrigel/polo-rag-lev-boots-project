# Code Quality Guide - Finding and Fixing Errors

A comprehensive guide on how to find errors, unused imports, and other code quality issues in the RAG system.

---

## Methods to Find Errors

### Method 1: TypeScript Compiler (tsc)

**Find type errors and compilation issues:**

```bash
# Check for errors without generating output
cd server
npx tsc --noEmit

# Or with more verbose output
npx tsc --noEmit --pretty

# For frontend
cd ../public
npx tsc --noEmit
```

**What it catches:**
- Type mismatches
- Missing exports/imports
- Incorrect function signatures
- Missing required properties

---

### Method 2: ESLint for Code Quality

**Find unused imports, variables, and style issues:**

```bash
# Install ESLint if not already
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev

# Create ESLint config
npx eslint --init

# Run ESLint on TypeScript files
npx eslint "src/**/*.{ts,tsx}" --fix

# Check for unused variables and imports
npx eslint "src/**/*.{ts,tsx}" --plugin @typescript-eslint
```

**Popular ESLint rules for finding issues:**

```json
{
  "rules": {
    "no-unused-vars": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-undef": "error",
    "no-unreachable": "error",
    "no-duplicate-imports": "error"
  }
}
```

---

### Method 3: IDE Diagnostics

**Using VS Code:**

1. **Open Command Palette**: Ctrl+Shift+P
2. **Type**: "TypeScript: Restart TS Server"
3. **Look for red squiggly underlines** in editor
4. **Hover over underline** to see error message
5. **Click lightbulb icon** for quick fixes

**Files with diagnostics:**
```
Problems Panel → Alt+Cmd+M (Mac) or Ctrl+Shift+M (Windows)
```

---

### Method 4: Manual Code Review

**Systematic approach:**

1. **Check imports**
   ```bash
   # View first 50 lines
   head -50 file.ts

   # Search for unused imports
   grep -n "^import\|^from" file.ts
   ```

2. **Search for usage**
   ```bash
   # Count occurrences of variable/component
   grep -c "ComponentName" *.tsx

   # Show lines with usage
   grep -n "ComponentName" *.tsx | grep -v "^import"
   ```

---

## Errors Found and Fixed

### Error 1: Missing getLogger Export

**Problem:**
```typescript
// logger.ts
export const logger = { ... };
export default logger;

// Usage in other files
import { getLogger } from '../utils/logger';
const logger = getLogger(); // ❌ getLogger not exported!
```

**Solution:**
```typescript
// logger.ts
export const logger = { ... };
export const getLogger = () => logger; // ✅ Added

export default logger;
```

**Files affected:**
- server/BusinessLogic/ConversationalRAG.ts
- server/BusinessLogic/RagAs.ts
- server/BusinessLogic/Settings.ts
- server/controllers/conversationalController.ts
- server/controllers/ragasController.ts
- server/controllers/settingsController.ts

---

### Error 2: Unused Imports in ConversationalRAG.tsx

**Problem:**
```typescript
import {
  Container,
  // ... other imports
  CopyButton,    // ❌ Imported but never used
  // ...
} from '@mantine/core';

import {
  // ...
  IconUpload,    // ❌ Imported but never used
  IconCopy,      // ❌ Imported but never used
  IconCheck,     // ❌ Imported but never used
} from '@tabler/icons-react';
```

**Solution - Remove unused imports:**
```typescript
import {
  Container,
  // ... other imports
  // CopyButton removed
  Divider,
} from '@mantine/core';

import {
  IconSend,
  IconTrash,
  IconDownload,
  // IconUpload, IconCopy, IconCheck removed
} from '@tabler/icons-react';
```

**Why remove?**
- Cleaner imports
- Smaller bundle size
- Easier to understand dependencies
- Prevents confusion for future developers

---

### Error 3: Unused Imports in RagAs.tsx

**Problem:**
```typescript
import {
  IconPlus,
  IconTrash,
  IconPlay,
  IconCheck,     // ❌ Unused
  IconX,         // ❌ Unused
  IconDownload,
  IconRefresh,   // ❌ Unused
} from '@tabler/icons-react';
```

**Solution:**
```typescript
import {
  IconPlus,
  IconTrash,
  IconPlay,
  IconDownload,
} from '@tabler/icons-react';
```

---

### Error 4: Unused Import in Settings.tsx

**Problem:**
```typescript
import {
  Container,
  // ...
  CopyButton,    // ❌ Imported but never used
  Code,
  SimpleGrid,
} from '@mantine/core';
```

**Solution:**
```typescript
import {
  Container,
  // ...
  Code,
  SimpleGrid,
} from '@mantine/core';
```

---

## How to Avoid These Errors

### 1. **Use ESLint**

Create `.eslintrc.json`:
```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "no-undef": "error"
  }
}
```

Run before committing:
```bash
npm run lint -- --fix
```

### 2. **Enable TypeScript Strict Mode**

In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### 3. **Pre-commit Hooks**

Install husky:
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

### 4. **IDE Configuration**

VS Code `settings.json`:
```json
{
  "[typescript]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  },
  "typescript.reportUnusedLocals": true,
  "typescript.reportUnusedParameters": true
}
```

---

## Common Code Quality Issues

### ❌ Unused Variables

```typescript
// Bad
const result = expensiveOperation();
return 42;

// Good
const result = expensiveOperation(); // Remove if unused
return result;
```

### ❌ Unused Imports

```typescript
// Bad
import { Component1, Component2, Component3 } from './components';
// Only using Component1

// Good
import { Component1 } from './components';
```

### ❌ Type Any

```typescript
// Bad
const data: any = fetchData();

// Good
interface Data {
  id: string;
  name: string;
}
const data: Data = fetchData();
```

### ❌ Missing Error Handling

```typescript
// Bad
const response = fetch(url);

// Good
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
} catch (error) {
  logger.error('Fetch failed', error);
  throw error;
}
```

### ❌ Inconsistent Naming

```typescript
// Bad
const usr = getUser();        // Abbreviated
const userData = getRawData(); // Ambiguous

// Good
const user = getUser();
const userdata = getUserData();
```

---

## Tools for Code Quality

### 1. **Prettier** - Code Formatting

```bash
npm install prettier --save-dev

# Format files
npx prettier --write "src/**/*.{ts,tsx}"

# Check formatting
npx prettier --check "src/**/*.{ts,tsx}"
```

### 2. **SonarQube** - Code Analysis

```bash
npm install sonarqube-scanner --save-dev
```

### 3. **TypeScript** - Type Checking

```bash
# Run type check
tsc --noEmit

# Generate type declaration files
tsc --declaration
```

### 4. **Dependency Check** - Unused Dependencies

```bash
npm install depcheck --save-dev
npx depcheck

# Shows:
# - Unused dependencies
# - Missing dependencies
# - Unused packages
```

---

## Checking Your Code

### Step-by-Step Process

**1. Run TypeScript compiler:**
```bash
npm run type-check
# or
tsc --noEmit
```

**2. Run ESLint:**
```bash
npm run lint
# or
npx eslint "**/*.{ts,tsx}"
```

**3. Check for unused dependencies:**
```bash
npx depcheck
```

**4. Format code:**
```bash
npm run format
# or
npx prettier --write "src/**/*.{ts,tsx}"
```

**5. Run tests:**
```bash
npm test
```

---

## Quick Fixes in VS Code

When you see errors:

1. **Hover over error** - Get error message
2. **Click lightbulb icon** - See quick fixes
3. **Select fix** - Auto-fixes common issues

**Common quick fixes:**
- Add missing import
- Remove unused variable
- Convert to const
- Fix spelling

---

## Commit Checklist

Before committing code:

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes (no warnings)
- [ ] `npm run format` applied
- [ ] Tests pass: `npm test`
- [ ] No console errors in browser
- [ ] No unused imports
- [ ] Code follows style guide

---

## Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "Running type check..."
npm run type-check || exit 1

echo "Running linter..."
npm run lint || exit 1

echo "Running formatter..."
npm run format

git add -A
echo "✅ Pre-commit checks passed!"
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Summary

**To find errors:**
1. Run TypeScript: `tsc --noEmit`
2. Run ESLint: `npx eslint "**/*.{ts,tsx}"`
3. Check IDE diagnostics (red squiggles)
4. Use grep for manual search
5. Read compiler/linter output carefully

**To prevent errors:**
1. Enable strict TypeScript mode
2. Configure ESLint with rules
3. Use pre-commit hooks
4. Set up IDE warnings
5. Code review before merging

**All issues have been fixed in commit `849be78`:**
- ✅ getLogger export added to logger.ts
- ✅ Unused imports removed from all 3 components
- ✅ Code is now clean and minimal

---

## Resources

- TypeScript Compiler: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
- ESLint: https://eslint.org/docs/latest/rules/
- Prettier: https://prettier.io/docs/en/options.html
- VS Code IntelliSense: https://code.visualstudio.com/docs/editor/intellisense

---

*Last Updated: January 14, 2024*
*All code quality checks passing ✅*