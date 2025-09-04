package com.anonymous.YellPay.bridge

import com.facebook.react.bridge.*
import com.anonymous.YellPay.auth.AuthHelper
import com.anonymous.YellPay.pay.PaymentHelper
import android.util.Log

class RouteSdkModule(private val reactCtx: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactCtx) {

    override fun getName() = "RouteSdk"

    private fun requireActivity(): android.app.Activity {
        return currentActivity ?: throw IllegalStateException("No current Activity")
    }

    // -------- Authentication --------

    @ReactMethod
    fun registerKey(domain: String, promise: Promise) {
        val helper = AuthHelper(requireActivity())
        helper.registerKey(
            domain,
            onSuccess = { status -> promise.resolve(status) },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun login(domain: String, promise: Promise) {
        val helper = AuthHelper(requireActivity())
        helper.login(
            domain,
            onSuccess = { status -> promise.resolve(status) },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun autoRegisterKey(serviceId: String, userInfo: String, domain: String, promise: Promise) {
        val helper = AuthHelper(requireActivity())
        helper.autoRegisterKey(
            serviceId, userInfo, domain,
            onSuccess = { status -> promise.resolve(status) },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun autoLogin(serviceId: String, domain: String, promise: Promise) {
        val helper = AuthHelper(requireActivity())
        helper.autoLogin(
            serviceId, domain,
            onSuccess = { status, userInfo ->
                val map = Arguments.createMap()
                map.putInt("status", status)
                map.putString("userInfo", userInfo)
                promise.resolve(map)
            },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    // -------- Payments / Cards / User / Notifications --------

    @ReactMethod
    fun initialUserId(serviceId: String, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.initialUserId(
            serviceId, envMode,
            onSuccess = { status, dic ->
                val map = Arguments.createMap()
                map.putInt("status", status)
                map.putMap("data", Arguments.makeNativeMap(dic))
                promise.resolve(map)
            },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun getUserInfo(userId: String, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.getUserInfo(
            userId, envMode,
            onSuccess = { json -> promise.resolve(json.toString()) },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun cardRegister(userId: String, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.cardRegister(
            userId, envMode,
            onSuccess = { status, dic ->
                val map = Arguments.createMap()
                map.putInt("status", status)
                map.putMap("data", Arguments.makeNativeMap(dic))
                promise.resolve(map)
            },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun cardSelect(userId: String, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.cardSelect(
            userId, envMode,
            onSuccess = { status, dic ->
                val map = Arguments.createMap()
                map.putInt("status", status)
                map.putMap("data", Arguments.makeNativeMap(dic))
                promise.resolve(map)
            },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun getMainCard(userId: String, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.getMainCard(
            userId, envMode,
            onSuccess = { json -> promise.resolve(json.toString()) },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun payment(userId: String, envMode: String?, promise: Promise) {
        Log.d("RouteSdkModule", "payment() called userId=" + userId + ", env=" + envMode)
        val helper = PaymentHelper(requireActivity())
        helper.payment(
            userId, envMode,
            onSuccess = { status, dic ->
                Log.d("RouteSdkModule", "payment() success status=" + status)
                val map = Arguments.createMap()
                map.putInt("status", status)
                map.putMap("data", Arguments.makeNativeMap(dic))
                promise.resolve(map)
            },
            onError = { code, msg ->
                Log.e("RouteSdkModule", "payment() failed code=" + code + ", msg=" + msg)
                promise.reject(code.toString(), msg)
            }
        )
    }

    @ReactMethod
    fun paymentForQR(userId: String, envMode: String?, promise: Promise) {
        Log.d("RouteSdkModule", "paymentForQR() called userId=" + userId + ", env=" + envMode)
        val helper = PaymentHelper(requireActivity())
        helper.paymentForQR(
            userId, envMode,
            onSuccess = { status, dic ->
                Log.d("RouteSdkModule", "paymentForQR() success status=" + status)
                val map = Arguments.createMap()
                map.putInt("status", status)
                map.putMap("data", Arguments.makeNativeMap(dic))
                promise.resolve(map)
            },
            onError = { code, msg ->
                Log.e("RouteSdkModule", "paymentForQR() failed code=" + code + ", msg=" + msg)
                promise.reject(code.toString(), msg)
            }
        )
    }

    @ReactMethod
    fun userDetailPay(userId: String, envMode: String?, promise: Promise) {
        Log.d("RouteSdkModule", "userDetailPay() called userId=" + userId + ", env=" + envMode)
        val helper = PaymentHelper(requireActivity())
        helper.userDetailPay(
            userId, envMode,
            onSuccess = { status, dic ->
                val map = Arguments.createMap()
                map.putInt("status", status)
                map.putMap("data", Arguments.makeNativeMap(dic))
                promise.resolve(map)
            },
            onError = { code, msg ->
                Log.e("RouteSdkModule", "userDetailPay() failed code=" + code + ", msg=" + msg)
                promise.reject(code.toString(), msg)
            }
        )
    }

    @ReactMethod
    fun payHistory(userId: String, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.payHistory(
            userId, envMode,
            onSuccess = { json -> promise.resolve(json.toString()) },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun getConfirmLimitAmount(userId: String, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.getConfirmLimitAmount(
            userId, envMode,
            onSuccess = { json -> promise.resolve(json.toString()) },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }

    @ReactMethod
    fun getNotification(userId: String, lastUpdate: Int, envMode: String?, promise: Promise) {
        val helper = PaymentHelper(requireActivity())
        helper.getNotification(
            userId, lastUpdate, envMode,
            onSuccess = { last, list ->
                val arr = Arguments.createArray()
                list.forEach { n ->
                    val m = Arguments.createMap()
                    m.putInt("id", n.id)
                    m.putInt("notificationDate", n.notificationDate)
                    m.putString("category", n.category)
                    m.putString("title", n.title)
                    m.putString("detail", n.detail)
                    m.putInt("modified", n.modified)
                    m.putInt("created", n.created)
                    arr.pushMap(m)
                }
                val out = Arguments.createMap()
                out.putInt("lastUpdate", last)
                out.putArray("notifications", arr)
                promise.resolve(out)
            },
            onError = { code, msg -> promise.reject(code.toString(), msg) }
        )
    }
}
