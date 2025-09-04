package com.anonymous.YellPay

import android.app.Activity
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.platfield.unidsdk.routecode.RouteAuth
import com.platfield.unidsdk.routecode.RoutePay
import com.platfield.unidsdk.routecode.EnvironmentMode
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicBoolean

class YellPayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val AUTH_DOMAIN = "auth.unid.net"
        const val PAYMENT_DOMAIN = "dev-pay.unid.net"
        const val SERVICE_ID = "yellpay"
    }

    override fun getName() = "YellPay"

    // ===== END TEST METHODS (removed) =====

    private val routeAuth = RouteAuth()
    private val routePay = RoutePay()
    private val mainHandler = Handler(Looper.getMainLooper())

    // ===== INTERNAL HELPERS FOR NON-INTERRUPTIVE ERROR HANDLING =====

    private fun resolvePromiseSafe(promise: Promise, value: Any?) {
        try {
            promise.resolve(value)
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "resolvePromiseSafe() - resolve failed: ${e.message}")
        }
    }

    private fun resolveError(promise: Promise, code: String, message: String) {
        val map = WritableNativeMap()
        map.putBoolean("error", true)
        map.putString("code", code)
        map.putString("message", message)
        resolvePromiseSafe(promise, map)
    }

    private fun resolveEmptyArray(promise: Promise) {
        resolvePromiseSafe(promise, WritableNativeArray())
    }

    @ReactMethod
    fun addCard(uuid: String, userNo: Int, payUserId: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                resolveError(promise, "ACTIVITY_ERROR", "No current activity available for add card")
                return
            }
            if (uuid.isBlank()) {
                resolveError(promise, "INVALID_UUID", "UUID cannot be empty")
                return
            }
            runOnMainThread {
                try {
                    routePay.callCardRegister(
                        uuid,
                        userNo,
                        payUserId,
                        activity,
                        EnvironmentMode.Production,
                        object : RoutePay.ResponseCardRegistCallback {
                            override fun success(uuid: String, userNo: Int) {
                                val response = WritableNativeMap()
                                response.putString("uuid", uuid)
                                response.putInt("userNo", userNo)
                                resolvePromiseSafe(promise, response)
                            }
                            override fun failed(errorCode: Int, errorMessage: String) {
                                android.util.Log.e("YellPay", "addCard() - failed: $errorCode $errorMessage")
                                resolveError(promise, "CARD_REGISTER_ERROR", "Card registration failed ($errorCode): $errorMessage")
                            }
                        }
                    )
                } catch (e: Exception) {
                    android.util.Log.e("YellPay", "addCard() - exception: ${e.message}", e)
                    resolveError(promise, "CARD_REGISTER_SDK_ERROR", e.message ?: "SDK call failed")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "addCard() outer exception: ${e.message}", e)
            resolveError(promise, "CARD_REGISTER_ERROR", e.message ?: "Unknown error")
        }
    }

    private fun runOnMainThread(action: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            action()
        } else {
            mainHandler.post(action)
        }
    }

    // ===== CONFIGURATION METHODS =====

    @ReactMethod
    fun getProductionConfig(promise: Promise) {
        try {
            val config = WritableNativeMap()
            config.putString("authDomain", AUTH_DOMAIN)
            config.putString("paymentDomain", PAYMENT_DOMAIN)
            config.putString("serviceId", SERVICE_ID)
            config.putString("environmentMode", "Production")
            promise.resolve(config)
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", e.message ?: "Unknown error in getProductionConfig", e)
        }
    }

    // ===== AUTHENTICATION METHODS =====

    @ReactMethod
    fun authRegister(domainName: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "authentication registration")
                return
            }

            // Ensure SDK call runs on main thread to avoid IllegalStateException
            runOnMainThread {
                routeAuth.callAuthRegister(
                    activity,
                    domainName,
                    object : RouteAuth.ResponseAuthRegisterCallback {
                    override fun success(status: Int) {
                        try {
                            val result = WritableNativeMap()
                            result.putInt("status", status)
                            promise.resolve(result)
                        } catch (e: Exception) {
                            promise.reject("AUTH_CALLBACK_ERROR", "Error processing auth registration: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("AUTH_REGISTER_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
            }
        } catch (e: Exception) {
            promise.reject("AUTH_REGISTER_ERROR", e.message ?: "Unknown error in authRegister", e)
        }
    }

    @ReactMethod
    fun authApproval(domainName: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "authentication approval")
                return
            }

            routeAuth.callAuthApproval(
                activity,
                domainName,
                object : RouteAuth.ResponseAuthApprovalCallback {
                    override fun success(status: Int) {
                        try {
                            val result = WritableNativeMap()
                            result.putInt("status", status)
                            promise.resolve(result)
                        } catch (e: Exception) {
                            promise.reject("AUTH_CALLBACK_ERROR", "Error processing auth approval: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("AUTH_APPROVAL_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            promise.reject("AUTH_APPROVAL_ERROR", e.message ?: "Unknown error in authApproval", e)
        }
    }

    @ReactMethod
    fun authApprovalWithMode(domainName: String, isQrStart: Boolean, promise: Promise) {
        // This method doesn't exist in the SDK, fallback to regular authApproval
        authApproval(domainName, promise)
    }

    @ReactMethod
    fun authUrlScheme(urlType: String, providerId: String, waitingId: String, domainName: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "URL scheme authentication")
                return
            }

            // Convert urlType string to int if needed
            val urlTypeInt = try {
                urlType.toInt()
            } catch (e: NumberFormatException) {
                android.util.Log.e("YellPay", "Invalid urlType: '$urlType', using default value 1")
                1
            }

            routeAuth.callAuthUrlScheme(
                urlTypeInt.toString(),
                providerId,
                waitingId,
                activity,
                domainName,
                object : RouteAuth.ResponseAuthUrlSchemeCallback {
                    override fun success(status: Int) {
                        try {
                            val result = WritableNativeMap()
                            result.putInt("status", status)
                            promise.resolve(result)
                        } catch (e: Exception) {
                            promise.reject("AUTH_CALLBACK_ERROR", "Error processing URL scheme auth: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("AUTH_URL_SCHEME_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            promise.reject("AUTH_URL_SCHEME_ERROR", e.message ?: "Unknown error in authUrlScheme", e)
        }
    }

    @ReactMethod
    fun autoAuthRegister(serviceId: String, userInfo: String, domainName: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "auto auth register")
                return
            }

            // Validate inputs
            if (serviceId.isBlank()) {
                promise.reject("INVALID_SERVICE_ID", "ServiceId cannot be empty.")
                return
            }
            
            if (domainName.isBlank()) {
                promise.reject("INVALID_DOMAIN", "Domain name cannot be empty.")
                return
            }

            android.util.Log.d("YellPay", "Starting auto auth register - ServiceId: $serviceId, UserInfo: $userInfo, Domain: $domainName")

            // Using the correct signature: callAutoAuthRegister(String serviceId, String userInfo, Activity activity, String domainName, ResponseAutoAuthRegisterCallback callback)
            routeAuth.callAutoAuthRegister(
                serviceId,
                userInfo,
                activity,
                domainName,
                object : RouteAuth.ResponseAutoAuthRegisterCallback {
                    override fun success(status: Int) {
                        try {
                            android.util.Log.d("YellPay", "Auto auth register success - Status: $status")
                            val result = WritableNativeMap()
                            result.putInt("status", status)
                            result.putString("message", "Auto authentication registration completed successfully")
                            promise.resolve(result)
                        } catch (e: Exception) {
                            promise.reject("AUTH_CALLBACK_ERROR", "Error processing auto auth register: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        android.util.Log.e("YellPay", "Auto auth register failed - Code: $errorCode, Message: $errorMessage")
                        promise.reject("AUTO_AUTH_REGISTER_ERROR", "Auto auth register failed (Code: $errorCode): $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "Auto auth register exception: ${e.message}", e)
            promise.reject("AUTO_AUTH_REGISTER_ERROR", e.message ?: "Unknown error in autoAuthRegister", e)
        }
    }

    @ReactMethod
    fun autoAuthApproval(serviceId: String, domainName: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "auto auth approval")
                return
            }

            // Validate inputs
            if (serviceId.isBlank()) {
                promise.reject("INVALID_SERVICE_ID", "ServiceId cannot be empty.")
                return
            }
            
            if (domainName.isBlank()) {
                promise.reject("INVALID_DOMAIN", "Domain name cannot be empty.")
                return
            }

            android.util.Log.d("YellPay", "Starting auto auth approval - ServiceId: $serviceId, Domain: $domainName")

            // Ensure SDK call runs on main thread to avoid IllegalStateException
            runOnMainThread {
                // Using the correct signature: callAutoAuthApproval(String serviceId, Activity activity, String domainName, ResponseAutoAuthApprovalCallback callback)
                routeAuth.callAutoAuthApproval(
                    serviceId,
                    activity,
                    domainName,
                    object : RouteAuth.ResponseAutoAuthApprovalCallback {
                        override fun success(status: Int, userInfo: String?) {
                            try {
                                android.util.Log.d("YellPay", "Auto auth approval success - Status: $status, UserInfo: $userInfo")
                                val result = WritableNativeMap()
                                result.putInt("status", status)
                                if (userInfo != null) {
                                    result.putString("userInfo", userInfo)
                                }
                                result.putString("message", "Auto authentication approval completed successfully")
                                promise.resolve(result)
                            } catch (e: Exception) {
                                promise.reject("AUTH_CALLBACK_ERROR", "Error processing auto auth approval: ${e.message}", e)
                            }
                        }

                        override fun failed(errorCode: Int, errorMessage: String) {
                            android.util.Log.e("YellPay", "Auto auth approval failed - Code: $errorCode, Message: $errorMessage")
                            promise.reject("AUTO_AUTH_APPROVAL_ERROR", "Auto auth approval failed (Code: $errorCode): $errorMessage")
                        }
                    }
                )
            }
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "Auto auth approval exception: ${e.message}", e)
            promise.reject("AUTO_AUTH_APPROVAL_ERROR", e.message ?: "Unknown error in autoAuthApproval", e)
        }
    }

    // ===== PRODUCTION CONVENIENCE METHODS =====

    @ReactMethod
    fun authRegisterProduction(promise: Promise) {
        authRegister(AUTH_DOMAIN, promise)
    }

    @ReactMethod
    fun authApprovalProduction(promise: Promise) {
        authApproval(AUTH_DOMAIN, promise)
    }

    @ReactMethod
    fun autoAuthRegisterProduction(userInfo: String, promise: Promise) {
        autoAuthRegister(SERVICE_ID, userInfo, AUTH_DOMAIN, promise)
    }

    @ReactMethod
    fun autoAuthApprovalProduction(promise: Promise) {
        autoAuthApproval(SERVICE_ID, AUTH_DOMAIN, promise)
    }

    @ReactMethod
    fun initUserProduction(promise: Promise) {
        initUser(SERVICE_ID, promise)
    }

    // ===== PAYMENT METHODS =====

    @ReactMethod
    fun initUser(serviceId: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "initialize user")
                return
            }

            routePay.callInitialUserId(
                serviceId, 
                activity, 
                EnvironmentMode.Production,
                object : RoutePay.ResponseInitialUserIdCallback {
                    override fun success(userId: String) {
                        try {
                            promise.resolve(userId ?: "")
                        } catch (e: Exception) {
                            promise.reject("INIT_CALLBACK_ERROR", "Error processing user ID: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("INIT_USER_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            promise.reject("INIT_USER_ERROR", e.message ?: "Unknown error in initUser", e)
        }
    }

    @ReactMethod
    fun registerCard(uuid: String, userNo: Int, payUserId: String, promise: Promise) {
        android.util.Log.d("YellPay", "=== REGISTER CARD METHOD CALLED ===")
        android.util.Log.d("YellPay", "registerCard() - Input UUID: '$uuid', UserNo: $userNo, PayUserId: '$payUserId'")
        
        try {
            android.util.Log.d("YellPay", "registerCard() - Step 1: Checking RouteCode SDK instance...")
            android.util.Log.d("YellPay", "registerCard() - RouteCode SDK version: ${try { routePay.javaClass.name } catch (e: Exception) { "Unknown" }}")
            android.util.Log.d("YellPay", "registerCard() - RouteCode SDK instance: ${routePay}")
            
            android.util.Log.d("YellPay", "registerCard() - Step 2: Getting current activity...")
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                android.util.Log.e("YellPay", "registerCard() - FAILED: No current activity available")
                rejectWithActivityError(promise, "register card")
                return
            }
            android.util.Log.d("YellPay", "registerCard() - Activity found: ${activity.javaClass.simpleName}")

            android.util.Log.d("YellPay", "registerCard() - Step 3: Validating inputs...")
            // Validate inputs
            if (uuid.isBlank()) {
                android.util.Log.e("YellPay", "registerCard() - FAILED: UUID is empty")
                promise.reject("INVALID_UUID", "UUID cannot be empty. Please initialize user first.")
                return
            }
            android.util.Log.d("YellPay", "registerCard() - Input validation passed")

            android.util.Log.d("YellPay", "registerCard() - Step 4: About to call RouteCode SDK...")
            android.util.Log.d("YellPay", "registerCard() - SDK Parameters: UUID='$uuid', UserNo=$userNo, PayUserId='$payUserId', Activity=${activity.javaClass.simpleName}, Mode=Production")

            android.util.Log.d("YellPay", "registerCard() - Step 5: Checking if we're on main thread...")
            val isMainThread = Looper.myLooper() == Looper.getMainLooper()
            android.util.Log.d("YellPay", "registerCard() - Is main thread: $isMainThread")

            // Ensure SDK call runs on main thread
            runOnMainThread {
                android.util.Log.d("YellPay", "registerCard() - Step 6: Now running on main thread")
                
                try {
                    android.util.Log.d("YellPay", "registerCard() - Step 7: Calling routePay.callCardRegister()...")
                    android.util.Log.d("YellPay", "registerCard() - Attempting SDK call with parameters:")
                    android.util.Log.d("YellPay", "registerCard() -   uuid: '$uuid'")
                    android.util.Log.d("YellPay", "registerCard() -   userNo: $userNo")
                    android.util.Log.d("YellPay", "registerCard() -   payUserId: '$payUserId'")
                    android.util.Log.d("YellPay", "registerCard() -   activity: ${activity.javaClass.simpleName}")
                    android.util.Log.d("YellPay", "registerCard() -   environmentMode: Production")
                    
                    android.util.Log.d("YellPay", "registerCard() - Step 8: About to call SDK method...")
                    
                    try {
                        // Timeout protection in case SDK never calls back
                        val completed = AtomicBoolean(false)
                        val timeoutRunnable = Runnable {
                            if (completed.compareAndSet(false, true)) {
                                android.util.Log.e("YellPay", "registerCard() - TIMEOUT waiting for SDK callback")
                                promise.reject("CARD_REGISTER_TIMEOUT", "Card registration timed out after 20 seconds")
                            }
                        }
                        mainHandler.postDelayed(timeoutRunnable, 20_000)
                        android.util.Log.d("YellPay", "registerCard() - Step 9: Calling routePay.callCardRegister() NOW...")

                        // Align to working example: treat payUserId (or uuid) as userId for SDK
                        val userIdForSdk = if (payUserId.isNotBlank()) payUserId else uuid
                        routePay.callCardRegister(
                            userIdForSdk,
                            0,
                            activity,
                            EnvironmentMode.Production,
                            object : RoutePay.ResponseCardRegistCallback {
                                override fun success(message: String, status: Int) {
                                    try {
                                        if (!completed.compareAndSet(false, true)) return
                                        mainHandler.removeCallbacks(timeoutRunnable)
                                        android.util.Log.d("YellPay", "registerCard() - SDK SUCCESS CALLBACK - status: $status, message: $message")
                                        val response = WritableNativeMap()
                                        response.putInt("status", status)
                                        response.putString("message", message)
                                        promise.resolve(response)
                                    } catch (e: Exception) {
                                        android.util.Log.e("YellPay", "registerCard() - Exception in success callback: ${e.message}", e)
                                        promise.reject("CARD_CALLBACK_ERROR", "Error processing card registration: ${e.message}", e)
                                    }
                                }

                                override fun failed(errorCode: Int, errorMessage: String) {
                                    if (!completed.compareAndSet(false, true)) return
                                    mainHandler.removeCallbacks(timeoutRunnable)
                                    android.util.Log.e("YellPay", "registerCard() - SDK FAILED CALLBACK - Code: $errorCode, Message: $errorMessage")
                                    promise.reject("CARD_REGISTER_ERROR", "Card registration failed (Code: $errorCode): $errorMessage")
                                }
                            }
                        )
                        android.util.Log.d("YellPay", "registerCard() - Step 10: SDK method call completed, waiting for callback...")
                    } catch (e: Exception) {
                        android.util.Log.e("YellPay", "registerCard() - Exception during SDK call: ${e.message}", e)
                        android.util.Log.e("YellPay", "registerCard() - Exception stack trace:", e)
                        promise.reject("CARD_REGISTER_SDK_ERROR", "SDK call failed: ${e.message}", e)
                    }
                    
                } catch (e: Exception) {
                    android.util.Log.e("YellPay", "registerCard() - Exception during SDK call: ${e.message}", e)
                    android.util.Log.e("YellPay", "registerCard() - Exception stack trace:", e)
                    promise.reject("CARD_REGISTER_ERROR", "Exception during SDK call: ${e.message}", e)
                }
            }
            
            android.util.Log.d("YellPay", "registerCard() - Step 11: runOnMainThread called, waiting for execution...")
            
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "Card registration exception: ${e.message}", e)
            android.util.Log.e("YellPay", "Card registration exception stack trace:", e)
            promise.reject("CARD_REGISTER_ERROR", e.message ?: "Unknown error in registerCard", e)
        }
    }

    @ReactMethod
    fun makePayment(uuid: String, userNo: Int, payUserId: String, promise: Promise) {
        android.util.Log.d("YellPay", "=== MAKE PAYMENT METHOD CALLED ===")
        android.util.Log.d("YellPay", "makePayment() - Input UUID: '$uuid', UserNo: $userNo, PayUserId: '$payUserId'")
        
        try {
            android.util.Log.d("YellPay", "makePayment() - Getting current activity...")
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                android.util.Log.e("YellPay", "makePayment() - FAILED: No current activity available")
                resolveError(promise, "ACTIVITY_ERROR", "No current activity available for make payment")
                return
            }
            android.util.Log.d("YellPay", "makePayment() - Activity found: ${activity.javaClass.simpleName}")

            // Validate inputs
            if (uuid.isBlank()) {
                android.util.Log.e("YellPay", "makePayment() - FAILED: UUID is empty")
                resolveError(promise, "INVALID_UUID", "UUID cannot be empty")
                return
            }
            
            if (payUserId.isBlank()) {
                android.util.Log.e("YellPay", "makePayment() - FAILED: PayUserId is empty")
                resolveError(promise, "INVALID_PAY_USER_ID", "PayUserId cannot be empty")
                return
            }
            android.util.Log.d("YellPay", "makePayment() - Input validation passed")

            android.util.Log.d("YellPay", "makePayment() - About to call RouteCode SDK...")
            android.util.Log.d("YellPay", "makePayment() - SDK Parameters: UUID='$uuid', UserNo=$userNo, PayUserId='$payUserId', Activity=${activity.javaClass.simpleName}, Mode=Production")

            // Ensure SDK call runs on main thread
            runOnMainThread {
                android.util.Log.d("YellPay", "makePayment() - Now running on main thread")
                
                try {
                    android.util.Log.d("YellPay", "makePayment() - Calling routePay.callPayment()...")
                    // Timeout protection in case SDK never calls back
                    val completed = AtomicBoolean(false)
                    val timeoutRunnable = Runnable {
                        if (completed.compareAndSet(false, true)) {
                            android.util.Log.e("YellPay", "makePayment() - TIMEOUT waiting for SDK callback")
                            resolveError(promise, "PAYMENT_TIMEOUT", "Payment timed out")
                        }
                    }
                    mainHandler.postDelayed(timeoutRunnable, 20_000)

                    // Align with working example: first get main card to obtain uuid/userNo, then call payment
                    routePay.callGetMainCreditCard(
                        activity,
                        object : RoutePay.ResponseGetMainCreditCardCallback {
                            override fun success(cardUuid: String, cardUserNo: Int, creditCardNo: String, creditCardExp: String) {
                                android.util.Log.d("YellPay", "makePayment() - Got main card uuid=$cardUuid userNo=$cardUserNo")
                                routePay.callPayment(
                                    cardUuid,
                                    cardUserNo,
                                    payUserId,
                                    activity,
                                    EnvironmentMode.Production,
                                    object : RoutePay.ResponsePaymentCallback {
                                        override fun success(message: String, status: Int) {
                                            try {
                                                if (!completed.compareAndSet(false, true)) return
                                                mainHandler.removeCallbacks(timeoutRunnable)
                                                android.util.Log.d("YellPay", "makePayment() - SDK SUCCESS CALLBACK - status: $status, message: $message")
                                                val response = WritableNativeMap()
                                                response.putInt("status", status)
                                                response.putString("message", message)
                                                resolvePromiseSafe(promise, response)
                                            } catch (e: Exception) {
                                                android.util.Log.e("YellPay", "makePayment() - Exception in success callback: ${e.message}", e)
                                                resolveError(promise, "PAYMENT_CALLBACK_ERROR", e.message ?: "Callback error")
                                            }
                                        }

                                        override fun failed(errorCode: Int, errorMessage: String?) {
                                            if (!completed.compareAndSet(false, true)) return
                                            mainHandler.removeCallbacks(timeoutRunnable)
                                            android.util.Log.e("YellPay", "makePayment() - SDK FAILED CALLBACK - Code: $errorCode, Message: $errorMessage")
                                            resolveError(promise, "PAYMENT_ERROR", "Payment failed ($errorCode): ${errorMessage ?: ""}")
                                        }
                                    }
                                )
                            }

                            override fun failed(errorCode: Int, errorMessage: String) {
                                if (!completed.compareAndSet(false, true)) return
                                mainHandler.removeCallbacks(timeoutRunnable)
                                android.util.Log.e("YellPay", "makePayment() - getMainCreditCard FAILED - Code: $errorCode, Message: $errorMessage")
                                resolveError(promise, "MAIN_CARD_ERROR", "Get main card failed ($errorCode): $errorMessage")
                            }
                        }
                    )
                    android.util.Log.d("YellPay", "makePayment() - SDK method call completed, waiting for callback...")

                } catch (e: Exception) {
                    android.util.Log.e("YellPay", "makePayment() - Exception during SDK call: ${e.message}", e)
                    resolveError(promise, "PAYMENT_ERROR", e.message ?: "Exception during SDK call")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "Payment exception: ${e.message}", e)
            resolveError(promise, "PAYMENT_ERROR", e.message ?: "Unknown error in makePayment")
        }
    }

    @ReactMethod
    fun getHistory(userId: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                resolveError(promise, "ACTIVITY_ERROR", "No current activity available for get history")
                return
            }

            // Validate inputs
            if (userId.isBlank()) {
                resolveError(promise, "INVALID_USER_ID", "UserId cannot be empty")
                return
            }

            android.util.Log.d("YellPay", "Getting payment history - UserId: $userId")

            // Using RouteCode SDK signature: callPayHistory(String payUserId, Activity activity, EnvironmentMode environmentMode, ResponseCallPayHistoryCallback callback)
            // The RouteCode SDK will show a full payment history UI screen
            routePay.callPayHistory(
                userId,                   // payUserId
                activity,
                EnvironmentMode.Production,
                object : RoutePay.ResponseCallPayHistoryCallback {
                    override fun success(payUserId: String) {
                        val response = WritableNativeMap()
                        response.putString("payUserId", payUserId)
                        response.putBoolean("screenDisplayed", true)
                        resolvePromiseSafe(promise, response)
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        android.util.Log.e("YellPay", "Payment history failed - Code: $errorCode, Message: $errorMessage")
                        resolveError(promise, "HISTORY_ERROR", "Payment history failed ($errorCode): $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "Payment history exception: ${e.message}", e)
            resolveError(promise, "HISTORY_ERROR", e.message ?: "Unknown error in getHistory")
        }
    }

    @ReactMethod
    fun paymentForQR(uuid: String, userNo: Int, payUserId: String, promise: Promise) {
        android.util.Log.d("YellPay", "=== QR PAYMENT METHOD CALLED ===")
        android.util.Log.d("YellPay", "paymentForQR() - Input UUID: '$uuid', UserNo: $userNo, PayUserId: '$payUserId'")
        
        try {
            android.util.Log.d("YellPay", "paymentForQR() - Getting current activity...")
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                android.util.Log.e("YellPay", "paymentForQR() - FAILED: No current activity available")
                resolveError(promise, "ACTIVITY_ERROR", "No current activity available for QR payment")
                return
            }
            android.util.Log.d("YellPay", "paymentForQR() - Activity found: ${activity.javaClass.simpleName}")

            // Validate inputs
            if (uuid.isBlank()) {
                android.util.Log.e("YellPay", "paymentForQR() - FAILED: UUID is empty")
                resolveError(promise, "INVALID_UUID", "UUID cannot be empty")
                return
            }
            
            if (payUserId.isBlank()) {
                android.util.Log.e("YellPay", "paymentForQR() - FAILED: PayUserId is empty")
                resolveError(promise, "INVALID_PAY_USER_ID", "PayUserId cannot be empty")
                return
            }
            android.util.Log.d("YellPay", "paymentForQR() - Input validation passed")

            android.util.Log.d("YellPay", "paymentForQR() - About to call RouteCode SDK...")
            android.util.Log.d("YellPay", "paymentForQR() - SDK Parameters: UUID='$uuid', UserNo=$userNo, PayUserId='$payUserId', Activity=${activity.javaClass.simpleName}, Mode=Production")

            // Ensure SDK call runs on main thread
            runOnMainThread {
                android.util.Log.d("YellPay", "paymentForQR() - Now running on main thread")
                
                try {
                    android.util.Log.d("YellPay", "paymentForQR() - Calling routePay.callPaymentForQR()...")
                    // Timeout protection in case SDK never calls back
                    val completed = AtomicBoolean(false)
                    val timeoutRunnable = Runnable {
                        if (completed.compareAndSet(false, true)) {
                            android.util.Log.e("YellPay", "paymentForQR() - TIMEOUT waiting for SDK callback")
                            resolveError(promise, "QR_PAYMENT_TIMEOUT", "QR payment timed out")
                        }
                    }
                    mainHandler.postDelayed(timeoutRunnable, 20_000)

                    // Align to working example: fetch main card (uuid,userNo), then call QR with userId
                    val userIdForSdk = if (payUserId.isNotBlank()) payUserId else uuid
                    routePay.callGetMainCreditCard(
                        activity,
                        object : RoutePay.ResponseGetMainCreditCardCallback {
                            override fun success(cardUuid: String, cardUserNo: Int, creditCardNo: String, creditCardExp: String) {
                                android.util.Log.d("YellPay", "paymentForQR() - Got main card uuid=$cardUuid userNo=$cardUserNo")
                                routePay.callPaymentForQR(
                                    cardUuid,
                                    cardUserNo,
                                    userIdForSdk,
                                    activity,
                                    EnvironmentMode.Production,
                                    object : RoutePay.ResponsePaymentCallback {
                                        override fun success(message: String, status: Int) {
                                            try {
                                                if (!completed.compareAndSet(false, true)) return
                                                mainHandler.removeCallbacks(timeoutRunnable)
                                                android.util.Log.d("YellPay", "paymentForQR() - SDK SUCCESS CALLBACK - status: $status, message: $message")
                                                val response = WritableNativeMap()
                                                response.putInt("status", status)
                                                response.putString("message", message)
                                                resolvePromiseSafe(promise, response)
                                            } catch (e: Exception) {
                                                android.util.Log.e("YellPay", "paymentForQR() - Exception in success callback: ${e.message}", e)
                                                resolveError(promise, "QR_PAYMENT_CALLBACK_ERROR", e.message ?: "Callback error")
                                            }
                                        }

                                        override fun failed(errorCode: Int, errorMessage: String?) {
                                            if (!completed.compareAndSet(false, true)) return
                                            mainHandler.removeCallbacks(timeoutRunnable)
                                            android.util.Log.e("YellPay", "paymentForQR() - SDK FAILED CALLBACK - Code: $errorCode, Message: $errorMessage")
                                            resolveError(promise, "QR_PAYMENT_ERROR", "QR payment failed ($errorCode): ${errorMessage ?: ""}")
                                        }
                                    }
                                )
                            }

                            override fun failed(errorCode: Int, errorMessage: String) {
                                if (!completed.compareAndSet(false, true)) return
                                mainHandler.removeCallbacks(timeoutRunnable)
                                android.util.Log.e("YellPay", "paymentForQR() - getMainCreditCard FAILED - Code: $errorCode, Message: $errorMessage")
                                resolveError(promise, "MAIN_CARD_ERROR", "Get main card failed ($errorCode): $errorMessage")
                            }
                        }
                    )
                    android.util.Log.d("YellPay", "paymentForQR() - SDK method call completed, waiting for callback...")

                } catch (e: Exception) {
                    android.util.Log.e("YellPay", "paymentForQR() - Exception during SDK call: ${e.message}", e)
                    resolveError(promise, "QR_PAYMENT_ERROR", e.message ?: "Exception during SDK call")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "QR payment exception: ${e.message}", e)
            resolveError(promise, "QR_PAYMENT_ERROR", e.message ?: "Unknown error in paymentForQR")
        }
    }

    @ReactMethod
    fun cardSelect(userId: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "card selection")
                return
            }

            // Validate inputs
            if (userId.isBlank()) {
                promise.reject("INVALID_USER_ID", "UserId cannot be empty. Please initialize user first.")
                return
            }

            android.util.Log.d("YellPay", "Starting card selection - UserId: $userId")

            // Using RouteCode SDK signature: callCardSelect(String payUserId, Activity activity, EnvironmentMode environmentMode, ResponseCardSelectCallback callback)
            // The RouteCode SDK will show a card selection UI screen
            routePay.callCardSelect(
                userId,                   // payUserId
                activity,
                EnvironmentMode.Production,
                object : RoutePay.ResponseCardSelectCallback {
                    override fun success(status: Int) {
                        try {
                            android.util.Log.d("YellPay", "Card selection success - Status: $status")
                            val response = WritableNativeMap()
                            response.putInt("status", status)
                            response.putString("message", "Card selection completed successfully")
                            promise.resolve(response)
                        } catch (e: Exception) {
                            promise.reject("CARD_SELECT_CALLBACK_ERROR", "Error processing card selection: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        android.util.Log.e("YellPay", "Card selection failed - Code: $errorCode, Message: $errorMessage")
                        promise.reject("CARD_SELECT_ERROR", "Card selection failed (Code: $errorCode): $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "Card selection exception: ${e.message}", e)
            promise.reject("CARD_SELECT_ERROR", e.message ?: "Unknown error in cardSelect", e)
        }
    }

    @ReactMethod
    fun getMainCreditCard(promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "get main credit card")
                return
            }

            // Using the correct signature: callGetMainCreditCard(Activity activity, ResponseGetMainCreditCardCallback callback)
            // Callback signature: success(String, int, String, String)
            routePay.callGetMainCreditCard(
                activity,
                object : RoutePay.ResponseGetMainCreditCardCallback {
                    override fun success(param1: String, param2: Int, param3: String, param4: String) {
                        try {
                            val response = WritableNativeMap()
                            response.putString("param1", param1 ?: "")
                            response.putInt("param2", param2)
                            response.putString("param3", param3 ?: "")
                            response.putString("param4", param4 ?: "")
                            promise.resolve(response)
                        } catch (e: Exception) {
                            promise.reject("MAIN_CARD_CALLBACK_ERROR", "Error processing main credit card: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("MAIN_CARD_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            promise.reject("MAIN_CARD_ERROR", e.message ?: "Unknown error in getMainCreditCard", e)
        }
    }

    @ReactMethod
    fun getUserInfo(userId: String, promise: Promise) {
        android.util.Log.d("YellPay", "=== GET USER INFO METHOD CALLED ===")
        android.util.Log.d("YellPay", "getUserInfo() - Input UserId: '$userId'")
        
        try {
            android.util.Log.d("YellPay", "getUserInfo() - Getting current activity...")
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                android.util.Log.e("YellPay", "getUserInfo() - FAILED: No current activity available")
                rejectWithActivityError(promise, "get user info")
                return
            }
            android.util.Log.d("YellPay", "getUserInfo() - Activity found: ${activity.javaClass.simpleName}")

            // Validate inputs
            if (userId.isBlank()) {
                android.util.Log.e("YellPay", "getUserInfo() - FAILED: UserId is empty")
                promise.reject("INVALID_USER_ID", "UserId cannot be empty. Please initialize user first.")
                return
            }
            android.util.Log.d("YellPay", "getUserInfo() - Input validation passed")

            android.util.Log.d("YellPay", "getUserInfo() - About to call RouteCode SDK...")
            android.util.Log.d("YellPay", "getUserInfo() - SDK Parameters: UserId='$userId', Activity=${activity.javaClass.simpleName}, Mode=Production")

            // Ensure SDK call runs on main thread to prevent crashes
            runOnMainThread {
                android.util.Log.d("YellPay", "getUserInfo() - Now running on main thread")
                
                try {
                    android.util.Log.d("YellPay", "getUserInfo() - Calling routePay.callGetUserInfo()...")
                    
                    // Using the correct signature: callGetUserInfo(String userId, Activity activity, EnvironmentMode mode, ResponseGetUserInfoCallback callback)
                    // Callback signature: success(UserCertificateInfo[])
                    routePay.callGetUserInfo(
                        userId,
                        activity,
                        EnvironmentMode.Production,
                        object : RoutePay.ResponseGetUserInfoCallback {
                            override fun success(userCertificates: Array<com.platfield.unidsdk.routecode.model.UserCertificateInfo>) {
                                try {
                                    android.util.Log.d("YellPay", "getUserInfo() - SDK SUCCESS CALLBACK - Found ${userCertificates.size} certificates")
                                    val resultArray = WritableNativeArray()
                                    userCertificates.forEach { cert ->
                                        val certMap = WritableNativeMap()
                                        // Add certificate info here based on the UserCertificateInfo class structure
                                        certMap.putString("certificateInfo", cert.toString())
                                        resultArray.pushMap(certMap)
                                    }
                                    android.util.Log.d("YellPay", "getUserInfo() - Resolving promise with success")
                                    promise.resolve(resultArray)
                                } catch (e: Exception) {
                                    android.util.Log.e("YellPay", "getUserInfo() - Exception in success callback: ${e.message}", e)
                                    promise.reject("USER_INFO_CALLBACK_ERROR", "Error processing user info: ${e.message}", e)
                                }
                            }

                            override fun failed(errorCode: Int, errorMessage: String) {
                                android.util.Log.e("YellPay", "getUserInfo() - SDK FAILED CALLBACK - Code: $errorCode, Message: $errorMessage")
                                android.util.Log.e("YellPay", "getUserInfo() - Authentication may have failed or user not properly initialized")
                                
                                // Gracefully handle the failure without crashing
                                try {
                                    promise.reject("USER_INFO_ERROR", "Get user info failed (Code: $errorCode): $errorMessage")
                                } catch (e: Exception) {
                                    android.util.Log.e("YellPay", "getUserInfo() - Exception while rejecting promise: ${e.message}", e)
                                }
                            }
                        }
                    )
                    android.util.Log.d("YellPay", "getUserInfo() - SDK method call completed, waiting for callback...")
                    
                } catch (e: Exception) {
                    android.util.Log.e("YellPay", "getUserInfo() - Exception during SDK call: ${e.message}", e)
                    try {
                        promise.reject("USER_INFO_ERROR", "Exception during SDK call: ${e.message}", e)
                    } catch (rejectException: Exception) {
                        android.util.Log.e("YellPay", "getUserInfo() - Exception while rejecting promise: ${rejectException.message}", rejectException)
                    }
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "getUserInfo() - Top-level exception: ${e.message}", e)
            try {
                promise.reject("USER_INFO_ERROR", e.message ?: "Unknown error in getUserInfo", e)
            } catch (rejectException: Exception) {
                android.util.Log.e("YellPay", "getUserInfo() - Exception while rejecting promise in top-level catch: ${rejectException.message}", rejectException)
            }
        }
    }

    @ReactMethod
    fun viewCertificate(userId: String, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "view certificate")
                return
            }

            // Using the correct signature: callViewCertificate(String userId, Activity activity, EnvironmentMode mode, ResponseViewCertificateCallback callback)
            // Callback signature: success() - no parameters
            routePay.callViewCertificate(
                userId,
                activity,
                EnvironmentMode.Production,
                object : RoutePay.ResponseViewCertificateCallback {
                    override fun success() {
                        try {
                            promise.resolve("Certificate view completed successfully")
                        } catch (e: Exception) {
                            promise.reject("CERTIFICATE_CALLBACK_ERROR", "Error processing certificate: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("CERTIFICATE_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            promise.reject("CERTIFICATE_ERROR", e.message ?: "Unknown error in viewCertificate", e)
        }
    }

    @ReactMethod
    fun getNotification(payUserId: String, lastUpdate: Int, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "get notification")
                return
            }

            // Using the correct signature: callGetNotification(String payUserId, int lastUpdate, Activity activity, EnvironmentMode mode, ResponseGetNotificationCallback callback)
            // Callback signature: success(int, UserNotification[])
            routePay.callGetNotification(
                payUserId,
                lastUpdate,
                activity,
                EnvironmentMode.Production,
                object : RoutePay.ResponseGetNotificationCallback {
                    override fun success(totalCount: Int, notifications: Array<com.platfield.unidsdk.routecode.model.UserNotification>) {
                        try {
                            val response = WritableNativeMap()
                            response.putInt("totalCount", totalCount)
                            
                            val notificationsArray = WritableNativeArray()
                            notifications.forEach { notification ->
                                val notificationMap = WritableNativeMap()
                                notificationMap.putString("notification", notification.toString())
                                notificationsArray.pushMap(notificationMap)
                            }
                            response.putArray("notifications", notificationsArray)
                            promise.resolve(response)
                        } catch (e: Exception) {
                            promise.reject("NOTIFICATION_CALLBACK_ERROR", "Error processing notification: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("NOTIFICATION_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", e.message ?: "Unknown error in getNotification", e)
        }
    }

    @ReactMethod
    fun getInformation(userId: String, infoType: Int, promise: Promise) {
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                rejectWithActivityError(promise, "get information")
                return
            }

            // Using the correct signature: callGetInformation(String userId, int infoType, Activity activity, EnvironmentMode mode, ResponseGetInformationCallback callback)
            // Callback signature: success(int, UserNotification[], JSONObject)
            routePay.callGetInformation(
                userId,
                infoType,
                activity,
                EnvironmentMode.Production,
                object : RoutePay.ResponseGetInformationCallback {
                    override fun success(totalCount: Int, notifications: Array<com.platfield.unidsdk.routecode.model.UserNotification>, jsonObject: JSONObject) {
                        try {
                            val response = WritableNativeMap()
                            response.putInt("totalCount", totalCount)
                            
                            val notificationsArray = WritableNativeArray()
                            notifications.forEach { notification ->
                                val notificationMap = WritableNativeMap()
                                notificationMap.putString("notification", notification.toString())
                                notificationsArray.pushMap(notificationMap)
                            }
                            response.putArray("notifications", notificationsArray)
                            response.putString("jsonData", jsonObject?.toString() ?: "{}")
                            
                            promise.resolve(response)
                        } catch (e: Exception) {
                            promise.reject("INFORMATION_CALLBACK_ERROR", "Error processing information: ${e.message}", e)
                        }
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        promise.reject("INFORMATION_ERROR", "Error $errorCode: $errorMessage")
                    }
                }
            )
        } catch (e: Exception) {
            promise.reject("INFORMATION_ERROR", e.message ?: "Unknown error in getInformation", e)
        }
    }

    // ===== HELPER METHODS =====

    private fun getSafeCurrentActivity(): Activity? {
        return reactApplicationContext.currentActivity
    }

    private fun rejectWithActivityError(promise: Promise, operation: String) {
        promise.reject(
            "ACTIVITY_ERROR",
            "No current activity available for $operation. Please ensure the app is in the foreground."
        )
    }

    // ===== DEBUG/VALIDATION METHODS =====

    @ReactMethod
    fun testCardRegistrationPrerequisites(uuid: String, promise: Promise) {
        android.util.Log.d("YellPay", "=== TESTING CARD REGISTRATION PREREQUISITES ===")
        
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                promise.reject("TEST_ERROR", "No activity available for testing")
                return
            }

            val result = WritableNativeMap()
            result.putString("uuid", uuid)
            result.putBoolean("hasActivity", true)
            result.putString("activityClass", activity.javaClass.simpleName)

            // Test 1: Check if we can get user info (indicates authentication status)
            android.util.Log.d("YellPay", "testCardRegPrereq() - Testing getUserInfo to check auth status...")
            
            if (uuid.isBlank()) {
                result.putBoolean("hasValidUuid", false)
                result.putString("message", "UUID is empty - need to call initUser first")
                promise.resolve(result)
                return
            }

            result.putBoolean("hasValidUuid", true)

            // Test getUserInfo to see if authentication is working
            routePay.callGetUserInfo(
                uuid,
                activity,
                EnvironmentMode.Production,
                object : RoutePay.ResponseGetUserInfoCallback {
                    override fun success(userCertificates: Array<com.platfield.unidsdk.routecode.model.UserCertificateInfo>) {
                        android.util.Log.d("YellPay", "testCardRegPrereq() - getUserInfo SUCCESS - Found ${userCertificates.size} certificates")
                        result.putBoolean("authenticationWorking", true)
                        result.putInt("certificateCount", userCertificates.size)
                        result.putString("message", "Authentication appears to be working. Ready for card registration.")
                        promise.resolve(result)
                    }

                    override fun failed(errorCode: Int, errorMessage: String) {
                        android.util.Log.e("YellPay", "testCardRegPrereq() - getUserInfo FAILED - Code: $errorCode, Message: $errorMessage")
                        result.putBoolean("authenticationWorking", false)
                        result.putInt("errorCode", errorCode)
                        result.putString("errorMessage", errorMessage)
                        result.putString("message", "Authentication may be required before card operations. Try Auth Register + Approval first.")
                        promise.resolve(result)
                    }
                }
            )

        } catch (e: Exception) {
            android.util.Log.e("YellPay", "testCardRegPrereq() - Exception: ${e.message}", e)
            promise.reject("TEST_ERROR", "Card registration prerequisites test failed: ${e.message}", e)
        }
    }

    @ReactMethod
    fun testRouteCodeSDKClasses(promise: Promise) {
        android.util.Log.d("YellPay", "=== TESTING ROUTECODE SDK CLASSES ===")
        
        try {
            val result = WritableNativeMap()
            
            // Test 1: Check if RoutePay class exists and can be instantiated
            try {
                val routePayClass = Class.forName("com.platfield.unidsdk.routecode.RoutePay")
                android.util.Log.d("YellPay", "testRouteCodeSDKClasses() - RoutePay class found: ${routePayClass.name}")
                result.putString("routePayClass", routePayClass.name)
                result.putBoolean("routePayClassExists", true)
                
                // Try to get methods
                val methods = routePayClass.declaredMethods
                val methodNames = methods.map { it.name }.toTypedArray()
                android.util.Log.d("YellPay", "testRouteCodeSDKClasses() - RoutePay methods: ${methodNames.joinToString(", ")}")
                
                val methodsArray = WritableNativeArray()
                methodNames.forEach { methodsArray.pushString(it) }
                result.putArray("routePayMethods", methodsArray)
                
            } catch (e: Exception) {
                android.util.Log.e("YellPay", "testRouteCodeSDKClasses() - RoutePay class not found: ${e.message}", e)
                result.putBoolean("routePayClassExists", false)
                result.putString("routePayError", e.message ?: "Unknown error")
            }
            
            // Test 2: Check if RouteAuth class exists
            try {
                val routeAuthClass = Class.forName("com.platfield.unidsdk.routecode.RouteAuth")
                android.util.Log.d("YellPay", "testRouteCodeSDKClasses() - RouteAuth class found: ${routeAuthClass.name}")
                result.putString("routeAuthClass", routeAuthClass.name)
                result.putBoolean("routeAuthClassExists", true)
            } catch (e: Exception) {
                android.util.Log.e("YellPay", "testRouteCodeSDKClasses() - RouteAuth class not found: ${e.message}", e)
                result.putBoolean("routeAuthClassExists", false)
                result.putString("routeAuthError", e.message ?: "Unknown error")
            }
            
            // Test 3: Check if EnvironmentMode enum exists
            try {
                val environmentModeClass = Class.forName("com.platfield.unidsdk.routecode.EnvironmentMode")
                android.util.Log.d("YellPay", "testRouteCodeSDKClasses() - EnvironmentMode class found: ${environmentModeClass.name}")
                result.putString("environmentModeClass", environmentModeClass.name)
                result.putBoolean("environmentModeClassExists", true)
            } catch (e: Exception) {
                android.util.Log.e("YellPay", "testRouteCodeSDKClasses() - EnvironmentMode class not found: ${e.message}", e)
                result.putBoolean("environmentModeClassExists", false)
                result.putString("environmentModeError", e.message ?: "Unknown error")
            }
            
            result.putString("message", "RouteCode SDK classes test completed")
            promise.resolve(result)
            
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "testRouteCodeSDKClasses() - Exception: ${e.message}", e)
            promise.reject("SDK_CLASSES_ERROR", "RouteCode SDK classes test failed: ${e.message}", e)
        }
    }

    @ReactMethod
    fun testSDKMethodAccess(promise: Promise) {
        android.util.Log.d("YellPay", "=== TESTING SDK METHOD ACCESS ===")
        
        try {
            val result = WritableNativeMap()
            
            // Test 1: Check if RoutePay class has the expected methods
            val routePayClass = routePay.javaClass
            val methods = routePayClass.declaredMethods
            val methodNames = methods.map { it.name }.toTypedArray()
            
            android.util.Log.d("YellPay", "testSDKMethodAccess() - RoutePay methods: ${methodNames.joinToString(", ")}")
            
            result.putString("routePayClass", routePayClass.name)
            val methodsArray = WritableNativeArray()
            methodNames.forEach { methodsArray.pushString(it) }
            result.putArray("availableMethods", methodsArray)
            
            // Test 2: Check if callCardRegister method exists
            val hasCardRegister = methodNames.contains("callCardRegister")
            val hasPayment = methodNames.contains("callPayment")
            val hasPaymentForQR = methodNames.contains("callPaymentForQR")
            
            result.putBoolean("hasCardRegister", hasCardRegister)
            result.putBoolean("hasPayment", hasPayment)
            result.putBoolean("hasPaymentForQR", hasPaymentForQR)
            
            // Test 3: Check EnvironmentMode
            val environmentModeClass = EnvironmentMode::class.java
            val environmentValues = environmentModeClass.enumConstants?.map { it.name } ?: emptyList()
            
            result.putString("environmentModeClass", environmentModeClass.name)
            val environmentArray = WritableNativeArray()
            environmentValues.forEach { environmentArray.pushString(it) }
            result.putArray("environmentValues", environmentArray)
            
            result.putString("message", "SDK method access test completed")
            promise.resolve(result)
            
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "testSDKMethodAccess() - Exception: ${e.message}", e)
            promise.reject("SDK_ACCESS_ERROR", "SDK method access test failed: ${e.message}", e)
        }
    }

    @ReactMethod
    fun testBasicSDKCall(promise: Promise) {
        android.util.Log.d("YellPay", "=== TESTING BASIC SDK FUNCTIONALITY ===")
        
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                promise.reject("TEST_ERROR", "No activity available for testing")
                return
            }

            android.util.Log.d("YellPay", "testBasicSDKCall() - Activity: ${activity.javaClass.simpleName}")
            android.util.Log.d("YellPay", "testBasicSDKCall() - RoutePay class: ${routePay.javaClass.name}")
            android.util.Log.d("YellPay", "testBasicSDKCall() - RouteAuth class: ${routeAuth.javaClass.name}")

            // Test basic initUser call first
            android.util.Log.d("YellPay", "testBasicSDKCall() - Testing initUser...")
            routePay.callInitialUserId(
                SERVICE_ID,
                activity,
                EnvironmentMode.Production,
                object : RoutePay.ResponseInitialUserIdCallback {
                    override fun success(userId: String) {
                        android.util.Log.d("YellPay", "testBasicSDKCall() - initUser SUCCESS: $userId")
                        val result = WritableNativeMap()
                        result.putString("testResult", "SUCCESS")
                        result.putString("userId", userId)
                        result.putString("message", "Basic SDK test passed")
                        promise.resolve(result)
                    }

                    override fun failed(status: Int, message: String) {
                        android.util.Log.e("YellPay", "testBasicSDKCall() - initUser FAILED: $status - $message")
                        promise.reject("TEST_INIT_ERROR", "Basic initUser test failed: $message (Status: $status)")
                    }
                }
            )

        } catch (e: Exception) {
            android.util.Log.e("YellPay", "testBasicSDKCall() - Exception: ${e.message}", e)
            promise.reject("TEST_ERROR", "Basic SDK test failed: ${e.message}", e)
        }
    }

    @ReactMethod
    fun checkFrameworkAvailability(promise: Promise) {
        android.util.Log.d("YellPay", "=== CHECK FRAMEWORK AVAILABILITY ===")
        
        try {
            android.util.Log.d("YellPay", "checkFrameworkAvailability() - Testing RouteCode framework availability")
            
            val result = WritableNativeMap()
            
            // Test RouteAuth availability
            var routeAuthStatus = "Available"
            try {
                // Test if we can create RouteAuth instance
                val testAuth = RouteAuth()
                android.util.Log.d("YellPay", "checkFrameworkAvailability() - RouteAuth instance created successfully")
            } catch (e: Exception) {
                routeAuthStatus = "Error: ${e.message}"
                android.util.Log.e("YellPay", "checkFrameworkAvailability() - RouteAuth error: ${e.message}", e)
            }
            
            // Test RoutePay availability
            var routePayStatus = "Available"
            try {
                // Test if we can create RoutePay instance
                val testPay = RoutePay()
                android.util.Log.d("YellPay", "checkFrameworkAvailability() - RoutePay instance created successfully")
            } catch (e: Exception) {
                routePayStatus = "Error: ${e.message}"
                android.util.Log.e("YellPay", "checkFrameworkAvailability() - RoutePay error: ${e.message}", e)
            }
            
            // Check if both are available
            val isAvailable = routeAuthStatus == "Available" && routePayStatus == "Available"
            
            result.putBoolean("available", isAvailable)
            result.putString("routeAuth", routeAuthStatus)
            result.putString("routePay", routePayStatus)
            
            android.util.Log.d("YellPay", "checkFrameworkAvailability() - Framework availability: $isAvailable")
            android.util.Log.d("YellPay", "checkFrameworkAvailability() - RouteAuth: $routeAuthStatus")
            android.util.Log.d("YellPay", "checkFrameworkAvailability() - RoutePay: $routePayStatus")
            
            promise.resolve(result)
            
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "checkFrameworkAvailability() - Exception: ${e.message}", e)
            val result = WritableNativeMap()
            result.putBoolean("available", false)
            result.putString("routeAuth", "Exception: ${e.message}")
            result.putString("routePay", "Exception: ${e.message}")
            promise.resolve(result)
        }
    }

    @ReactMethod
    fun validateAuthenticationStatus(promise: Promise) {
        android.util.Log.d("YellPay", "=== VALIDATE AUTHENTICATION STATUS ===")
        
        try {
            val activity = getSafeCurrentActivity()
            if (activity == null) {
                android.util.Log.e("YellPay", "validateAuthenticationStatus() - No activity available")
                val result = WritableNativeMap()
                result.putBoolean("authenticated", false)
                result.putString("error", "No activity available")
                promise.resolve(result)
                return
            }

            // Test authentication by attempting auto approval without UI
            runOnMainThread {
                try {
                    android.util.Log.d("YellPay", "validateAuthenticationStatus() - Testing auth with autoAuthApproval")
                    
                    routeAuth.callAutoAuthApproval(
                        SERVICE_ID,
                        activity,
                        AUTH_DOMAIN,
                        object : RouteAuth.ResponseAutoAuthApprovalCallback {
                            override fun success(status: Int, userInfo: String?) {
                                android.util.Log.d("YellPay", "validateAuthenticationStatus() - Auth is valid: status=$status, userInfo=$userInfo")
                                val result = WritableNativeMap()
                                result.putBoolean("authenticated", true)
                                result.putInt("status", status)
                                result.putString("userInfo", userInfo ?: "")
                                promise.resolve(result)
                            }

                            override fun failed(errorCode: Int, errorMessage: String) {
                                android.util.Log.d("YellPay", "validateAuthenticationStatus() - Auth not ready: code=$errorCode, message=$errorMessage")
                                val result = WritableNativeMap()
                                result.putBoolean("authenticated", false)
                                result.putInt("status", errorCode)
                                result.putString("error", "Authentication not ready: $errorMessage")
                                promise.resolve(result)
                            }
                        }
                    )
                } catch (e: Exception) {
                    android.util.Log.e("YellPay", "validateAuthenticationStatus() - Exception: ${e.message}", e)
                    val result = WritableNativeMap()
                    result.putBoolean("authenticated", false)
                    result.putString("error", "Exception during validation: ${e.message}")
                    promise.resolve(result)
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("YellPay", "validateAuthenticationStatus() - Outer exception: ${e.message}", e)
            val result = WritableNativeMap()
            result.putBoolean("authenticated", false)
            result.putString("error", "Validation failed: ${e.message}")
            promise.resolve(result)
        }
    }

    override fun getConstants(): MutableMap<String, Any> {
        return hashMapOf(
            "AUTH_DOMAIN" to AUTH_DOMAIN,
            "PAYMENT_DOMAIN" to PAYMENT_DOMAIN,
            "SERVICE_ID" to SERVICE_ID
        )
    }
}