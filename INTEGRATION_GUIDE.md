# YellPay Integration Guide

## 🚨 **IMPORTANT: Required Flow**

The UUID mismatch errors (-100, -101) occur when the correct authentication flow is not followed. **You MUST complete all authentication steps before making payments.**

## ✅ **Correct Integration Flow**

### 1. **Framework Verification**

```javascript
// First, verify the SDK is loaded correctly
const availability = await YellPay.checkFrameworkAvailability();
console.log('Framework available:', availability);
```

### 2. **Authentication Flow (REQUIRED)**

```javascript
// Step 1: Register with authentication server
const authRegResult = await YellPay.authRegisterProduction();
console.log('Auth registered:', authRegResult);

// Step 2: Approve authentication (this may show UI)
const authApprovalResult = await YellPay.authApprovalProduction();
console.log('Auth approved:', authApprovalResult);

// Step 3: Auto register with user info
const autoRegResult =
  await YellPay.autoAuthRegisterProduction('your_user_info');
console.log('Auto registered:', autoRegResult);

// Step 4: Auto approve and get user info
const autoApprovalResult = await YellPay.autoAuthApprovalProduction();
console.log('Auto approved:', autoApprovalResult);
```

### 3. **User Initialization (REQUIRED)**

```javascript
// Step 5: Initialize payment user - THIS RETURNS THE UUID YOU NEED
const userId = await YellPay.initUserProduction();
console.log('User initialized with ID:', userId);

// IMPORTANT: Store this userId for all subsequent payment operations
```

### 4. **Payment Operations (After Authentication & Initialization)**

```javascript
// Step 6: Register payment card (optional)
const cardResult = await YellPay.registerCard(userId, 0);
console.log('Card registered:', cardResult);

// Step 7: Make payments
const paymentResult = await YellPay.makePayment(userId, 1000); // 1000 = amount
console.log('Payment completed:', paymentResult);
```

## 🔧 **Using the Workflow Component**

Use the `YellPayWorkflow` component to automatically follow the correct flow:

```javascript
import { YellPayWorkflow } from '../src/components/YellPayWorkflow';

// In your component
<YellPayWorkflow />;
```

This component will:

- ✅ Guide you through each step
- ✅ Show progress and completion status
- ✅ Handle errors with helpful messages
- ✅ Ensure proper sequencing

## ❌ **Common Mistakes That Cause UUID Errors**

### 1. **Skipping Authentication**

```javascript
// ❌ WRONG - This will fail with UUID mismatch
const userId = await YellPay.initUserProduction(); // Fails without auth
await YellPay.makePayment(userId, 1000); // Fails with -101 error
```

### 2. **Using Wrong/Empty UUID**

```javascript
// ❌ WRONG - Using hardcoded or empty UUID
await YellPay.makePayment('', 1000); // Fails
await YellPay.makePayment('test-uuid', 1000); // Fails with -100/-101
```

### 3. **Incomplete Authentication Flow**

```javascript
// ❌ WRONG - Missing steps
await YellPay.authRegisterProduction(); // Only first step
await YellPay.initUserProduction(); // Skipped approval steps - will fail
```

## 🐛 **Debugging Errors**

### Error Code -100

- **Meaning**: UUID mismatch - authentication incomplete
- **Solution**: Complete full authentication flow before calling `initUser`

### Error Code -101

- **Meaning**: UUID doesn't match or user not found
- **Solution**: Use the exact UUID returned from `initUserProduction()`

### TurboModule Error

- **Meaning**: React Native bridge configuration issue
- **Solution**: This has been fixed in the updated code

## 📱 **Platform-Specific Notes**

### iOS

- ✅ Fixed TurboModule interop layer errors
- ✅ Added better error handling and logging
- ✅ Improved view controller detection
- ✅ Added framework availability checks

### Android

- ✅ Comprehensive logging and error handling
- ✅ Proper activity management
- ✅ Input validation and helpful error messages

## 🚀 **Quick Start**

1. **Import the workflow component**:

   ```javascript
   import { YellPayWorkflow } from '../src/components/YellPayWorkflow';
   ```

2. **Add to your screen**:

   ```javascript
   export default function TestScreen() {
     return <YellPayWorkflow />;
   }
   ```

3. **Follow the step-by-step process**:
   - Start with "Framework Check"
   - Complete all authentication steps
   - Initialize user
   - Make payments

## 🔍 **Testing & Debugging**

### Enable Debug Logging

The updated modules now include comprehensive logging:

- 🔥 = Starting operation
- ✅ = Success
- ❌ = Error
- ⏰ = Timeout
- 💥 = Exception

### Use Debug Component

```javascript
import { YellPayIOSDebug } from '../src/components/YellPayIOSDebug';
```

### Check Logs

- **iOS**: Xcode Console
- **Android**: `adb logcat | grep YellPay`

## 📞 **Support**

If you continue experiencing issues:

1. **Check the logs** for specific error messages
2. **Use the workflow component** to ensure correct sequencing
3. **Verify framework integration** with `checkFrameworkAvailability()`
4. **Contact RouteCode SDK support** for SDK-specific issues

---

**Remember**: Authentication must be completed BEFORE payment operations. The workflow component automates this process correctly.
