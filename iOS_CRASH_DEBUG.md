# iOS Crash Debugging Guide

## Current Issue: `__pthread_kill` Crash

The `__pthread_kill` crash typically indicates a serious runtime error. Here's a systematic approach to debug and fix it:

### 1. **Immediate Steps to Gather More Information**

#### Enable Better Crash Reporting

Add to your `AppDelegate.swift`:

```swift
override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Add crash reporting
    NSSetUncaughtExceptionHandler { exception in
        print("💥 Uncaught exception: \(exception)")
        print("💥 Call stack: \(exception.callStackSymbols)")
    }

    // Your existing code...
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
}
```

#### Run with Debugging Enabled

1. Open Xcode
2. Product → Scheme → Edit Scheme
3. Run → Diagnostics
4. Enable: "Address Sanitizer", "Thread Sanitizer"
5. This will help catch memory/threading issues

### 2. **Common Causes & Solutions**

#### A. Framework Integration Issues

**Problem**: RouteCode framework not properly linked or incompatible
**Solutions**:

```bash
# 1. Clean and rebuild
cd ios
rm -rf build/
rm -rf ~/Library/Developer/Xcode/DerivedData/YellPay-*
xcodebuild clean
```

#### B. Threading Violations

**Problem**: UI updates from background threads
**Check**: Your YellPayModule.swift has several `DispatchQueue.main.async` calls - good!
**Fix**: Ensure all RouteCode SDK calls are on main thread

#### C. Memory Management Issues

**Problem**: Accessing deallocated objects
**Fix**: Add stronger references and nil checks

### 3. **Specific Fixes for YellPayModule**

#### Fix 1: Add Stronger Error Handling

```swift
private func getCurrentViewController() -> UIViewController? {
    guard let windowScene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene,
          let window = windowScene.windows.first(where: { $0.isKeyWindow }) else {
        print("YellPay: No active window scene found")
        return nil
    }

    guard let rootViewController = window.rootViewController else {
        print("YellPay: No root view controller found")
        return nil
    }

    var topController = rootViewController
    while let presentedViewController = topController.presentedViewController {
        topController = presentedViewController
    }

    print("YellPay: Found view controller: \(String(describing: topController))")
    return topController
}
```

#### Fix 2: Add Null Safety to Timer Operations

```swift
// In makePayment method, replace timer logic:
private var activeTimers: [DispatchSourceTimer] = []

// In methods with timers:
let timeoutTimer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
activeTimers.append(timeoutTimer)

timeoutTimer.setEventHandler { [weak self] in
    self?.activeTimers.removeAll { $0 === timeoutTimer }
    timeoutTimer.cancel()
    reject("PAYMENT_ERROR", "Payment operation timed out", nil)
}
```

#### Fix 3: Add Framework Availability Check

```swift
@objc
func checkFrameworkAvailability(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Check if RouteCode framework is properly loaded
    if NSClassFromString("RouteAuth") == nil || NSClassFromString("RoutePay") == nil {
        reject("FRAMEWORK_ERROR", "RouteCode framework not properly loaded", nil)
        return
    }
    resolve(["available": true])
}
```

### 4. **Framework-Specific Debugging**

#### Check Framework Architecture

```bash
cd ios/Frameworks
file */RouteCode.framework/RouteCode
lipo -info */RouteCode.framework/RouteCode
```

#### Verify Framework Headers

Ensure `RouteCode.h` exports match your usage:

```objective-c
// Check if these classes exist in RouteCode.h:
@class RouteAuth;
@class RoutePay;
```

### 5. **Testing Strategy**

#### Start with Minimal Testing

1. **Test Framework Loading**: Call `checkFrameworkAvailability` first
2. **Test Simple Methods**: Try `getProductionConfig`
3. **Test UI Methods**: Try `getCurrentViewController`
4. **Gradually Test SDK**: Start with `initUser` before payment methods

#### Add Logging

```swift
// Add comprehensive logging to all methods
@objc
func makePayment(_ userId: String, amount: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    print("🔥 YellPay.makePayment START - userId: \(userId), amount: \(amount)")

    DispatchQueue.main.async {
        print("🔥 YellPay.makePayment - On main thread")

        guard let viewController = self.getCurrentViewController() else {
            print("❌ YellPay.makePayment - No view controller")
            reject("PAYMENT_ERROR", "No view controller available", nil)
            return
        }

        print("✅ YellPay.makePayment - Got view controller: \(viewController)")

        // Continue with SDK call...
    }
}
```

### 6. **Alternative Approaches**

#### If Framework Issues Persist:

1. **Update Framework**: Check if newer RouteCode SDK version available
2. **Contact SDK Vendor**: Report iOS compatibility issues
3. **Implement Fallback**: Add web-based payment flow as backup

#### If Memory Issues Persist:

1. **Profile Memory**: Use Xcode Instruments
2. **Reduce Complexity**: Break down large methods
3. **Add Memory Warnings**: Handle `didReceiveMemoryWarning`

### 7. **Emergency Workaround**

If crashes persist, add crash protection:

```swift
@objc
func safeMethodCall<T>(_ methodName: String, operation: () throws -> T, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
        let result = try operation()
        resolve(result)
    } catch {
        print("💥 YellPay method \(methodName) crashed: \(error)")
        reject("\(methodName.uppercased())_ERROR", "Method crashed: \(error.localizedDescription)", error)
    }
}
```

## Next Steps

1. **Run with sanitizers enabled** to get specific error location
2. **Add comprehensive logging** to track where crash occurs
3. **Test methods individually** starting with simple ones
4. **Check framework compatibility** with current iOS version
5. **Contact RouteCode support** if framework-specific issues found
