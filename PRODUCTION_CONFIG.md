# YellPay Production Configuration Guide

## 🚀 Production Environment Setup

Your YellPay SDK is now configured for the **production environment** with the following specifications:

### 📡 **Production Domains**

- **Authentication Server**: `auth.unid.net` (for all auth operations)
- **Payment Server**: `yellpay.unid.net` (for all payment operations)
- **Service ID**: `yellpay`
- **Environment Mode**: `EnvironmentMode.Production` (Android)

### 🔄 **Domain Usage**

- **🔐 Authentication Operations** → `auth.unid.net`
  - `authRegister`, `authApproval`, `autoAuthRegister`, `autoAuthApproval`
- **💳 Payment Operations** → `yellpay.unid.net`
  - `initUser`, `registerCard`, `makePayment`, `getHistory`, `getUserInfo`, `viewCertificate`

### 🔧 **Configuration Details**

#### **Environment Mode Configuration**

```kotlin
// Android Production Configuration
EnvironmentMode.Production  // Used in payment methods like paymentForQR
```

#### **Domain Configuration**

```kotlin
companion object {
    const val AUTH_DOMAIN = "auth.unid.net"
    const val PAYMENT_DOMAIN = "yellpay.unid.net"
    const val SERVICE_ID = "yellpay"
}
```

## 🎯 **Production Convenience Methods**

### **Authentication Methods**

```typescript
// Production authentication with pre-configured domains
await YellPay.authRegisterProduction();
await YellPay.authApprovalProduction();
await YellPay.autoAuthRegisterProduction('user_identifier');
await YellPay.autoAuthApprovalProduction();
```

### **Payment Methods**

```typescript
// Production user initialization with pre-configured service ID
const userId = await YellPay.initUserProduction();
```

### **Configuration Method**

```typescript
// Get production configuration dynamically
const config = await YellPay.getProductionConfig();
// Returns: { authDomain, paymentDomain, serviceId, environmentMode }
```

## 🖥️ **Demo Interface Updates**

### **New Features Added:**

1. **📡 Load Production Config** - Button to load and apply production settings
2. **🚀 Production Quick Methods** - Green buttons for one-click production operations
3. **⚙️ Configuration Toggle** - Switch between custom and production defaults
4. **🎯 Pre-configured Values** - Default values set to production specifications

### **Visual Indicators:**

- **🔴 Red buttons** - Custom configuration methods
- **🟢 Green buttons** - Production convenience methods
- **📡 Config button** - Loads production settings automatically

## 🔗 **Sample Sites & Testing**

### **Disability Certificate Screening**

- **URL**: https://yellpay.unid.net/certificate_screening/login
- **ID**: `payroutemanager`
- **Password**: `payroutemanager`

### **Authentication Sample**

- **URL**: https://yellpay-sample.unid.net/unid_auth_sample/
- **ID**: `tgltgl`
- **Password**: `tgltgl`

### **Payment Sample**

- **URL**: https://yellpay-sandbox.unid.net/
- **Note**: ID/Password autofill available

## 💳 **Payment Environment**

### **Current Status**

- **Environment**: Production domains configured
- **GMO Merchant**: Test environment (GMO merchant account pending)
- **Card Registration**: Only test cards currently accepted
- **Future**: Will switch to full production once GMO merchant registration is completed

### **Test Card Information**

Since GMO merchant account is not yet issued, only test cards can be registered:

- Use test card numbers provided by your payment processor
- Real transactions will be available after GMO merchant setup

## 🛠️ **How to Use Production Configuration**

### **Quick Start (Recommended)**

1. **Load Production Config**: Tap "📡 Load Production Config" in the demo
2. **Use Production Methods**: Use green buttons for production operations
3. **Authentication Flow**:

   ```typescript
   // 1. Register device for authentication
   await YellPay.authRegisterProduction();

   // 2. Perform authentication
   await YellPay.authApprovalProduction();

   // 3. Initialize user for payments
   const userId = await YellPay.initUserProduction();

   // 4. Continue with payment operations
   ```

### **Custom Configuration**

If you need to use different settings temporarily:

1. Toggle "Use Production Defaults" to OFF
2. Modify Service ID and Domain Name fields
3. Use the blue custom buttons

## 🔒 **Security Considerations**

### **Production Environment**

- All communications use production SSL certificates
- Authentication tokens are issued by production auth server
- Payment processing uses production-grade security

### **Test vs Production**

- **Test cards only** until GMO merchant account is active
- **Production authentication** server is live
- **Production domains** are configured and active

## 📱 **Testing the Production Setup**

### **Authentication Testing**

1. Use "🔑 Auth Register (Production)" to register your device
2. Use "✅ Auth Approval (Production)" to test authentication
3. Use "🤖 Auto Auth Register (Production)" for automatic registration
4. Use "🎯 Auto Auth Approval (Production)" for automatic authentication

### **Payment Testing**

1. Use "🚀 Initialize User (Production)" to create a payment session
2. Register test cards using the card registration flow
3. Test payments with test card numbers
4. Check payment history and transaction records

## 🔄 **Migration Path**

### **Current Setup** ✅

- Production domains configured
- EnvironmentMode.Production enabled
- Service ID "yellpay" configured
- Production convenience methods available

### **When GMO Merchant Account Is Ready** 🔄

- No code changes required
- Real card registration will be enabled automatically
- Full production payment processing will be active
- Test card restrictions will be lifted

## 📞 **Support Information**

### **Domain Configuration**

- **Auth Domain**: `auth.unid.net` ✅ Configured
- **Payment Domain**: `yellpay.unid.net` ✅ Configured
- **Service ID**: `yellpay` ✅ Configured
- **Environment**: `Production` ✅ Configured

### **Ready for Production**

Your YellPay SDK integration is fully configured for production use. The only limitation is the GMO merchant account for real card processing, but all authentication and infrastructure components are production-ready.

---

**🎉 Your YellPay SDK is production-ready!** Use the green production buttons in the demo for the fastest testing experience with pre-configured production settings.
