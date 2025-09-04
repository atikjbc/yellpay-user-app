# YellPay SDK Troubleshooting Guide

## 🚨 **Module Method Not Available Errors**

If you see errors like:

- `YellPay.authRegister is not a function (it is undefined)`
- `YellPay.getProductionConfig is not a function (it is undefined)`

### **Solution: Reload Native Module**

The native module needs to be reloaded after code changes. Follow these steps:

#### **1. Stop Metro and Development Build**

```bash
# Stop Metro bundler (Ctrl+C in terminal)
# Stop any running emulator/device builds
```

#### **2. Clean and Rebuild Android**

```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

#### **3. Restart Metro with Cache Clear**

```bash
npx expo start --clear
```

#### **4. Rebuild and Install App**

- Press `a` to rebuild Android
- Wait for full rebuild and installation
- The app should now have all methods available

## 🔧 **Step-by-Step Testing Process**

The new demo follows a structured flow:

### **Step 1: Load Production Config** 📡

- Loads domains: `auth.unid.net` and `yellpay.unid.net`
- Sets service ID: `yellpay`
- **Must complete first** before other steps

### **Step 2: Device Authentication** 🔐

- Register device for authentication
- Test authentication flow
- Uses `auth.unid.net` domain

### **Step 3: Initialize Payment User** 👤

- Creates user session for payments
- Returns user ID for subsequent operations
- Uses `yellpay.unid.net` domain

### **Step 4: Card Management** 💳

- Register payment cards (test cards only)
- View main credit card info
- Uses `yellpay.unid.net` domain

### **Step 5: Process Payments** 💰

- Make test payments
- Requires user ID from Step 3
- Uses `yellpay.unid.net` domain

### **Step 6: Information & History** 📊

- View payment history
- Get user information
- Uses `yellpay.unid.net` domain

## 🐛 **Common Errors and Solutions**

### **Error: "Index 0 requested, with a size of 0"**

- **Cause**: Method returns empty array but code expects data
- **Solution**: Check if user has registered cards first
- **Code**: Add error handling for empty responses

### **Error: "Cannot convert argument of type class java.util.LinkedHashMap"**

- **Cause**: Return type mismatch between Kotlin and React Native
- **Solution**: This is handled in the updated implementation
- **Status**: ✅ Fixed in latest version

### **Error: "Method not available. Please rebuild the app."**

- **Cause**: Native module not reloaded after code changes
- **Solution**: Follow module reload steps above
- **Status**: ✅ Instructions provided

### **Error: Authentication/Payment errors**

- **Cause**: May be related to production server configuration
- **Solution**:
  - Ensure proper domains are configured
  - Check network connectivity
  - Verify service ID is correct (`yellpay`)

## 📱 **Testing Environment**

### **Current Configuration**

- **Auth Domain**: `auth.unid.net` ✅ Production
- **Payment Domain**: `yellpay.unid.net` ✅ Production
- **Service ID**: `yellpay` ✅ Production
- **Environment**: `Production` ✅ Configured

### **Payment Limitations**

- **Test Cards Only**: GMO merchant account pending
- **Real Cards**: Will be enabled after GMO setup
- **Authentication**: Fully production ready

## 🔄 **Module Reload Checklist**

When methods are undefined, follow this checklist:

- [ ] Stop Metro bundler
- [ ] Clean Android build (`./gradlew clean`)
- [ ] Rebuild Android (`./gradlew assembleDebug`)
- [ ] Clear Metro cache (`npx expo start --clear`)
- [ ] Rebuild app on device/emulator
- [ ] Check console for module availability
- [ ] Test production config load first

## 📞 **Support Steps**

1. **Check Module Status**: Look for "YellPay module loaded" in the demo
2. **Method Count**: Should show 23+ methods available
3. **Follow Step Order**: Complete steps 1-6 in sequence
4. **Log Everything**: Check console for detailed error messages
5. **Restart if Needed**: Use module reload process above

## 🎯 **Success Indicators**

- ✅ "YellPay module loaded" shows in demo
- ✅ Methods count shows 23+ methods
- ✅ Step 1 (Config) completes successfully
- ✅ Each step unlocks the next step
- ✅ No "method not available" errors

---

**📝 Note**: After following these steps, all YellPay SDK methods should be available and working correctly with the production configuration.
