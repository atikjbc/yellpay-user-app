# YellPay SDK Integration Guide

## Overview

This project demonstrates the complete integration of the RouteCode YellPay SDK with React Native (Expo). The SDK provides comprehensive authentication and payment functionality including:

### 🔐 Authentication Features

- **Authentication Key Registration** - Register device for unID authentication
- **Login Authentication** - Perform secure authentication using sPIN
- **Automatic Authentication** - Background authentication without UI
- **URL Scheme Launch** - Deep link authentication flows
- **Device Registration** - Secure device pairing

### 💳 Payment Features

- **Card Registration** - Register credit/debit cards
- **Payment Processing** - Secure payment transactions
- **QR Code Payments** - Scan-to-pay functionality
- **Card Selection** - Multi-card management
- **Payment History** - Transaction records and receipts

### 📊 Information Features

- **User Information** - Profile and certificate data
- **Notifications** - System notifications and alerts
- **Transaction History** - Detailed payment records

## Files Structure

```
android/app/src/main/java/com/anonymous/YellPay/
├── YellPayModule.kt          # Main native module implementation
├── YellPayPackage.kt         # React Native package registration
└── MainApplication.kt        # Updated to include YellPayPackage

src/
├── types/YellPay.d.ts        # TypeScript definitions
└── components/YellPayDemo.tsx # Complete demo component

app/shop-search/index.tsx     # Demo screen implementation
```

## Setup Instructions

### 1. Android Configuration

The following dependencies are already configured in `android/app/build.gradle`:

```gradle
dependencies {
    // RouteCode SDK
    implementation fileTree(dir: 'libs', include: ['*.jar','*.aar'])

    // Required ML Kit and Camera dependencies
    implementation 'com.google.mlkit:barcode-scanning:17.3.0'
    implementation 'androidx.camera:camera-camera2:1.4.1'
    implementation 'androidx.camera:camera-lifecycle:1.4.1'
    implementation 'androidx.camera:camera-view:1.4.1'

    // CustomTab and Biometric
    implementation 'androidx.browser:browser:1.8.0'
    implementation "androidx.biometric:biometric:1.1.0"
}
```

### 2. SDK Configuration

**SDK Versions** (in `android/build.gradle`):

```gradle
ext {
  buildToolsVersion = "35.0.0"
  minSdkVersion = 31
  compileSdkVersion = 35
  targetSdkVersion = 34
  ndkVersion = "26.1.10909125"
}
```

**Manifest Merger** (in `android/app/src/debug/AndroidManifest.xml`):

```xml
<meta-data
    android:name="com.google.mlkit.vision.DEPENDENCIES"
    android:value="ocr,barcode_ui"
    tools:replace="android:value" />
```

## API Reference

### Authentication Methods

#### `authRegister(domainName: string)`

Register authentication key for device pairing.

```typescript
const result = await YellPay.authRegister('auth.unid.net');
// Returns: { status: number }
```

#### `authApproval(domainName: string)`

Perform user authentication with GUI.

```typescript
const result = await YellPay.authApproval('auth.unid.net');
// Returns: { status: number }
```

#### `autoAuthRegister(serviceId: string, userInfo: string, domainName: string)`

Automatic key registration without GUI.

```typescript
const result = await YellPay.autoAuthRegister(
  'SERVICE_ID',
  'user_123',
  'auth.unid.net'
);
// Returns: { status: number }
```

#### `autoAuthApproval(serviceId: string, domainName: string)`

Automatic authentication - returns userInfo on success.

```typescript
const result = await YellPay.autoAuthApproval('SERVICE_ID', 'auth.unid.net');
// Returns: { status: number, userInfo?: string }
```

### Payment Methods

#### `initUser(serviceId: string)`

Initialize user session for payment operations.

```typescript
const userId = await YellPay.initUser('YOUR_SERVICE_ID');
// Returns: string (userId)
```

#### `registerCard(uuid: string, userNo: number)`

Register a payment card to user account.

```typescript
const result = await YellPay.registerCard(userId, 0);
// Returns: { result: string, status: number }
```

#### `makePayment(userId: string, amount: number)`

Process a payment transaction.

```typescript
const result = await YellPay.makePayment(userId, 1000);
// Returns: { result: string, status: number }
```

#### `paymentForQR(userId: string, amount: number, qrCode: string)`

Process payment using QR code.

```typescript
const result = await YellPay.paymentForQR(userId, 1000, 'QR_CODE_DATA');
// Returns: { result: string, status: number }
```

#### `cardSelect(userId: string)`

Show card selection interface.

```typescript
const result = await YellPay.cardSelect(userId);
// Returns: { status: number }
```

#### `getMainCreditCard()`

Get primary credit card information.

```typescript
const cardInfo = await YellPay.getMainCreditCard();
// Returns: { cardNo: string, status: number, holderName: string, expiry: string }
```

### Information Methods

#### `getHistory(userId: string)`

Get payment transaction history.

```typescript
const history = await YellPay.getHistory(userId);
// Returns: string (transaction history)
```

#### `getUserInfo(userId: string)`

Get user certificate information.

```typescript
const userInfo = await YellPay.getUserInfo(userId);
// Returns: Array<{info: string}>
```

#### `viewCertificate(userId: string)`

Display certificate information UI.

```typescript
const result = await YellPay.viewCertificate(userId);
// Returns: { status: string }
```

#### `getNotification(userId: string, count: number)`

Get user notifications.

```typescript
const notifications = await YellPay.getNotification(userId, 10);
// Returns: { totalCount: number, notifications: Array<{notification: string}> }
```

#### `getInformation(userId: string, infoType: number)`

Get detailed information by type.

```typescript
const info = await YellPay.getInformation(userId, 1);
// Returns: { totalCount: number, notifications: Array, jsonData: string }
```

## Usage Example

### Basic Authentication & Payment Flow

```typescript
import { NativeModules } from 'react-native';
import type { YellPayModule } from '../types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

// 1. Register authentication key
await YellPay.authRegister('auth.unid.net');

// 2. Perform authentication
await YellPay.authApproval('auth.unid.net');

// 3. Initialize payment user
const userId = await YellPay.initUser('YOUR_SERVICE_ID');

// 4. Register a card
await YellPay.registerCard(userId, 0);

// 5. Make a payment
const paymentResult = await YellPay.makePayment(userId, 1000);

// 6. Get transaction history
const history = await YellPay.getHistory(userId);
```

### Demo Component

The complete demo component (`src/components/YellPayDemo.tsx`) provides:

- **Configuration inputs** for service ID, domain name, user info
- **Authentication section** with all auth methods
- **Payment section** with card registration and payments
- **Information section** with history and notifications
- **Comprehensive error handling** and result display
- **TypeScript integration** with full type safety

## Testing

1. **Access the demo**: Navigate to the shop-search screen in your app
2. **Configure settings**: Enter your service ID and domain name
3. **Test authentication**: Start with authentication key registration
4. **Test payments**: Initialize user, register card, make payments
5. **View information**: Check history, notifications, and user data

## Error Handling

All methods include comprehensive error handling:

```typescript
try {
  const result = await YellPay.someMethod();
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  // Handle specific error codes and messages
}
```

Common error patterns:

- **Authentication errors**: Invalid domain, network issues
- **Payment errors**: Insufficient funds, invalid card
- **User errors**: User not initialized, invalid parameters

## Important Notes

### Security Considerations

- Store service IDs and sensitive data securely
- Use proper user authentication before payments
- Validate all payment amounts and user inputs
- Handle biometric authentication failures gracefully

### SDK Dependencies

- Requires minimum Android SDK 31
- Uses ML Kit for QR code scanning
- Requires camera permissions for certain features
- Biometric authentication requires device support

### Production Deployment

- Replace demo service IDs with production values
- Implement proper error logging and monitoring
- Test thoroughly on various Android devices
- Ensure compliance with payment regulations

## Support

This integration provides a complete foundation for using the RouteCode YellPay SDK in React Native applications. All features from the official documentation have been implemented with proper TypeScript support and comprehensive error handling.

For additional support, refer to the official RouteCode SDK documentation or contact the SDK provider for specific implementation questions.
