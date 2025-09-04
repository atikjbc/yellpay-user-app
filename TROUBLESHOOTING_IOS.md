# YellPay SDK iOS Troubleshooting Guide

## 🚨 **iOS Module Method Not Available Errors**

If you see errors like:

- `YellPay.authRegister is not a function (it is undefined)`
- `YellPay.getProductionConfig is not a function (it is undefined)`

### **Solution: Rebuild iOS Project**

The iOS native module needs to be rebuilt after code changes. Follow these steps:

#### **1. Clean iOS Build**

```bash
cd ios
rm -rf build/
xcodebuild clean -workspace YellPay.xcworkspace -scheme YellPay
cd ..
```

#### **2. Clean Pods and Reinstall**

```bash
cd ios
rm -rf Pods/
rm Podfile.lock
pod install
cd ..
```

#### **3. Clear Metro Cache and Restart**

```bash
npx expo start --clear
```

#### **4. Rebuild iOS App**

- Press `i` to rebuild iOS
- Wait for full rebuild and installation
- The app should now have all 23 methods available

## 📱 **iOS-Specific Configuration**

### **Framework Setup**

- ✅ `YellPay.xcframework` added to project
- ✅ `RouteCode` framework imported via bridging header
- ✅ All 23 methods implemented and exposed

### **Method Parity with Android**

The iOS implementation now includes **all the same methods** as Android:

#### **Configuration (1 method)**

- `getProductionConfig()`

#### **Authentication (6 methods)**

- `authRegister(domainName)`
- `authApproval(domainName)`
- `authApprovalWithMode(domainName, isQrStart)`
- `authUrlScheme(urlType, providerId, waitingId, domainName)`
- `autoAuthRegister(serviceId, userInfo, domainName)`
- `autoAuthApproval(serviceId, domainName)`

#### **Production Auth Convenience (4 methods)**

- `authRegisterProduction()`
- `authApprovalProduction()`
- `autoAuthRegisterProduction(userInfo)`
- `autoAuthApprovalProduction()`

#### **Payment & Card Management (12 methods)**

- `initUser(serviceId)`
- `initUserProduction()`
- `registerCard(uuid, userNo)`
- `makePayment(userId, amount)`
- `paymentForQR(qrCode, isQrStart)`
- `getHistory(userId)`
- `cardSelect(userNo)`
- `getMainCreditCard()`
- `getUserInfo(userId)`
- `viewCertificate(userId)`
- `getNotification(count)`
- `getInformation(infoType)`

## 🔧 **iOS Build Requirements**

### **Xcode Configuration**

1. **Deployment Target**: iOS 13.0+
2. **Swift Version**: 5.0+
3. **Framework Search Paths**: Include YellPay.xcframework
4. **Enable Modules**: Yes
5. **Bridging Header**: YellPay-Bridging-Header.h configured

### **Required Permissions (Info.plist)**

```xml
<key>NSCameraUsageDescription</key>
<string>Required for QR code scanning and card registration</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Required for payment location services</string>
```

### **URL Schemes (if using auth URL schemes)**

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>yellpay-auth</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>yellpay</string>
        </array>
    </dict>
</array>
```

## 🐛 **Common iOS Errors and Solutions**

### **Error: "Module 'RouteCode' not found"**

- **Cause**: Framework not properly linked
- **Solution**:
  1. Check YellPay.xcframework is in project
  2. Verify framework is in "Frameworks, Libraries, and Embedded Content"
  3. Ensure bridging header imports RouteCode

### **Error: "Use of undeclared type 'RoutePay' or 'RouteAuth'"**

- **Cause**: Bridging header not configured
- **Solution**:
  1. Verify `#import <RouteCode/RouteCode.h>` in bridging header
  2. Clean and rebuild project

### **Error: "No view controller available"**

- **Cause**: UI methods called when no view controller present
- **Solution**:
  1. Ensure app is in foreground
  2. Methods requiring UI automatically handle view controller access

### **Error: iOS Simulator vs Device Issues**

- **Cause**: Framework may not support simulator
- **Solution**:
  1. Test on physical device
  2. Check if framework includes simulator slice

## 📋 **iOS Testing Checklist**

### **Pre-Testing Setup**

- [ ] Clean iOS build (`xcodebuild clean`)
- [ ] Clean pods (`rm -rf Pods/ && pod install`)
- [ ] Clear Metro cache (`npx expo start --clear`)
- [ ] Rebuild iOS app from scratch

### **Module Verification**

- [ ] Check "YellPay module loaded" in demo
- [ ] Verify method count shows 23+ methods
- [ ] Test production config load (Step 1)
- [ ] Confirm no "method not available" errors

### **Platform Consistency**

- [ ] iOS has same 23 methods as Android
- [ ] Production configuration works on both
- [ ] Step-by-step demo functions identically
- [ ] Domain separation works (`auth.unid.net` vs `yellpay.unid.net`)

## 🎯 **iOS-Specific Notes**

### **Main Queue Operations**

- All UI-related methods automatically dispatch to main queue
- No additional threading considerations needed

### **View Controller Management**

- Automatic view controller detection implemented
- Works with navigation controllers, tab controllers, etc.

### **Memory Management**

- Proper ARC compliance maintained
- No manual memory management required

### **Error Handling**

- All methods use React Native promise-based error handling
- Consistent error format across iOS and Android

## 🔄 **iOS Rebuild Process**

When iOS methods are undefined, follow this complete rebuild:

```bash
# 1. Stop Metro
# Ctrl+C in terminal

# 2. Clean everything
cd ios
rm -rf build/
rm -rf Pods/
rm Podfile.lock
xcodebuild clean -workspace YellPay.xcworkspace -scheme YellPay
cd ..

# 3. Reinstall dependencies
cd ios
pod install
cd ..

# 4. Clear Metro and restart
npx expo start --clear

# 5. Rebuild iOS
# Press 'i' for iOS rebuild
```

## ✅ **Success Indicators for iOS**

- ✅ "YellPay module loaded" appears in demo
- ✅ Method count shows exactly 23 methods
- ✅ Step 1 (Production Config) loads successfully
- ✅ No "method not available" errors
- ✅ All 6 demo steps can be completed
- ✅ Domain separation works correctly

---

**📝 Note**: iOS implementation is now **100% feature-complete** and matches Android functionality exactly. All 23 methods are available with the same signatures and behavior across both platforms.
