package com.anonymous.YellPay.pay

import android.app.Activity
import com.platfield.unidsdk.routecode.RoutePay
import com.platfield.unidsdk.routecode.EnvironmentMode
import com.platfield.unidsdk.routecode.model.UserNotification
import com.platfield.unidsdk.routecode.model.UserCertificateInfo
import org.json.JSONArray
import org.json.JSONObject
import android.util.Log
import android.os.Handler
import android.os.Looper

class PaymentHelper(private val activity: Activity) {
    private val pay = RoutePay()

    private fun env(mode: String?): EnvironmentMode =
        if (mode?.lowercase() == "prod" || mode?.lowercase() == "production")
            EnvironmentMode.Production
        else
            EnvironmentMode.Staging

    /** Create/get initial user id (with environment) */
    fun initialUserId(
        serviceId: String,
        envMode: String?,
        onSuccess: (Int, Map<String, Any?>) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callInitialUserId(
                serviceId,
                activity,
                env(envMode),
                object : RoutePay.ResponseInitialUserIdCallback {
                    override fun success(userId: String) {
                        onSuccess(0, mapOf("userId" to userId))
                    }
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "Unknown error")
                }
            )
        }
    }

    /** Fetch user info (with environment) */
    fun getUserInfo(
        userId: String,
        envMode: String?,
        onSuccess: (JSONObject) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callGetUserInfo(
                userId,
                activity,
                env(envMode),
                object : RoutePay.ResponseGetUserInfoCallback {
                    override fun success(infos: Array<UserCertificateInfo>) {
                        val arr = JSONArray()
                        infos.forEach { info ->
                            val o = JSONObject()
                            o.put("kind", info.getKind()?.name)
                            o.put("examination", info.getExamination()?.name)
                            o.put("rejectionReasons", info.getRejectionReasons())
                            arr.put(o)
                        }
                        val obj = JSONObject()
                        obj.put("certificates", arr)
                        onSuccess(obj)
                    }
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "Unknown error")
                }
            )
        }
    }

    /** Add/register a credit card (with environment) */
    fun cardRegister(
        userId: String,
        envMode: String?,
        onSuccess: (Int, Map<String, Any?>) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callCardRegister(
                userId,
                0,
                activity,
                env(envMode),
                object : RoutePay.ResponseCardRegistCallback {
                    override fun success(message: String, status: Int) {
                        onSuccess(status, mapOf("message" to message))
                    }
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "Unknown error")
                }
            )
        }
    }

    /** Select card (with environment) */
    fun cardSelect(
        userId: String,
        envMode: String?,
        onSuccess: (Int, Map<String, Any?>) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callCardSelect(
                userId,
                activity,
                env(envMode),
                object : RoutePay.ResponseCardSelectCallback {
                    override fun success(status: Int) {
                        onSuccess(status, emptyMap())
                    }
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "Unknown error")
                }
            )
        }
    }

    /** Get main credit card (returns uuid, userNo, creditCardNo, creditCardExp) */
    fun getMainCard(
        userId: String,
        envMode: String?,
        onSuccess: (JSONObject) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callGetMainCreditCard(
                activity,
                object : RoutePay.ResponseGetMainCreditCardCallback {
                    override fun success(uuid: String, userNo: Int, creditCardNo: String, creditCardExp: String) {
                        val obj = JSONObject()
                        obj.put("uuid", uuid)
                        obj.put("userNo", userNo)
                        obj.put("creditCardNo", creditCardNo)
                        obj.put("creditCardExp", creditCardExp)
                        onSuccess(obj)
                    }
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "")
                }
            )
        }
    }

    /** Make a payment (userId-based) */
    fun payment(
        userId: String,
        envMode: String?,
        onSuccess: (Int, Map<String, Any?>) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        Log.d("PaymentHelper", "payment() start userId=$userId env=$envMode")
        activity.runOnUiThread {
            val timeoutHandler = Handler(Looper.getMainLooper())
            val timeout = Runnable {
                Log.e("PaymentHelper", "payment() no callback after 10s for userId=$userId")
            }
            timeoutHandler.postDelayed(timeout, 10_000)
            // First fetch main card to obtain uuid and userNo, then call payment
            pay.callGetMainCreditCard(
                activity,
                object : RoutePay.ResponseGetMainCreditCardCallback {
                    override fun success(uuid: String, userNo: Int, creditCardNo: String, creditCardExp: String) {
                        Log.d("PaymentHelper", "payment() got main card uuid=$uuid userNo=$userNo")
                        pay.callPayment(
                            uuid,
                            userNo,
                            activity,
                            env(envMode),
                            object : RoutePay.ResponsePaymentCallback {
                                override fun success(message: String, status: Int) {
                                    Log.d("PaymentHelper", "payment() success status=$status message=$message")
                                    timeoutHandler.removeCallbacks(timeout)
                                    onSuccess(status, mapOf("message" to message))
                                }
                                override fun failed(status: Int, message: String?) {
                                    Log.e("PaymentHelper", "payment() failed status=$status msg=${message}")
                                    timeoutHandler.removeCallbacks(timeout)
                                    onError(status, message ?: "Unknown error")
                                }
                            }
                        )
                    }
                    override fun failed(status: Int, message: String) {
                        Log.e("PaymentHelper", "payment() getMainCreditCard failed status=$status msg=${message}")
                        timeoutHandler.removeCallbacks(timeout)
                        onError(status, message)
                    }
                }
            )
        }
    }

    /** Payment via QR (userId-based) */
    fun paymentForQR(
        userId: String,
        envMode: String?,
        onSuccess: (Int, Map<String, Any?>) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        Log.d("PaymentHelper", "paymentForQR() start userId=$userId env=$envMode")
        activity.runOnUiThread {
            val timeoutHandler = Handler(Looper.getMainLooper())
            val timeout = Runnable {
                Log.e("PaymentHelper", "paymentForQR() no callback after 10s for userId=$userId")
            }
            timeoutHandler.postDelayed(timeout, 10_000)
            // Using main card details to derive uuid/userNo then call QR payment (payUserId not required per SDK docs)
            pay.callGetMainCreditCard(
                activity,
                object : RoutePay.ResponseGetMainCreditCardCallback {
                    override fun success(uuid: String, userNo: Int, creditCardNo: String, creditCardExp: String) {
                        Log.d("PaymentHelper", "paymentForQR() got main card uuid=$uuid userNo=$userNo")
                        pay.callPaymentForQR(
                            uuid,
                            userNo,
                            userId,
                            activity,
                            env(envMode),
                            object : RoutePay.ResponsePaymentCallback {
                                override fun success(message: String, status: Int) {
                                    Log.d("PaymentHelper", "paymentForQR() success status=$status message=$message")
                                    timeoutHandler.removeCallbacks(timeout)
                                    onSuccess(status, mapOf("message" to message))
                                }
                                override fun failed(status: Int, message: String?) {
                                    Log.e("PaymentHelper", "paymentForQR() failed status=$status msg=${message}")
                                    timeoutHandler.removeCallbacks(timeout)
                                    onError(status, message ?: "Unknown error")
                                }
                            }
                        )
                    }
                    override fun failed(status: Int, message: String) {
                        Log.e("PaymentHelper", "paymentForQR() getMainCreditCard failed status=$status msg=${message}")
                        timeoutHandler.removeCallbacks(timeout)
                        onError(status, message)
                    }
                }
            )
        }
    }

    /** Payment history */
    fun payHistory(
        userId: String,
        envMode: String?,
        onSuccess: (JSONObject) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callPayHistory(
                userId,
                activity,
                env(envMode),
                object : RoutePay.ResponseCallPayHistoryCallback {
                    override fun success(response: String) {
                        onSuccess(JSONObject(response))
                    }
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "Unknown error")
                }
            )
        }
    }

    /** Usage/limit amounts */
    fun getConfirmLimitAmount(
        userId: String,
        envMode: String?,
        onSuccess: (JSONObject) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callGetConfirmLimitAmount(
                userId,
                activity,
                env(envMode),
                object : RoutePay.ResponseGetConfirmLimitAmountCallback {
                    override fun success(response: JSONObject) = onSuccess(response)
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "Unknown error")
                }
            )
        }
    }

    /** Notifications (with environment) */
    fun getNotification(
        userId: String,
        lastUpdate: Int,
        envMode: String?,
        onSuccess: (Int, Array<UserNotification>) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            pay.callGetNotification(
                userId,
                lastUpdate,
                activity,
                env(envMode),
                object : RoutePay.ResponseGetNotificationCallback {
                    override fun success(lastUpdate: Int, notification: Array<UserNotification>) =
                        onSuccess(lastUpdate, notification)
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "")
                }
            )
        }
    }

    /** Diagnostic: open user detail pay flow to confirm SDK UI/callbacks */
    fun userDetailPay(
        userId: String,
        envMode: String?,
        onSuccess: (Int, Map<String, Any?>) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        Log.d("PaymentHelper", "userDetailPay() start userId=$userId env=$envMode")
        activity.runOnUiThread {
            pay.callUserDetailPay(
                userId,
                activity,
                env(envMode),
                object : RoutePay.ResponseUserDetailPayCallback {
                    override fun success(status: Int, dic: HashMap<*, *>) {
                        @Suppress("UNCHECKED_CAST")
                        onSuccess(status, dic as HashMap<String, Any?>)
                    }
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "Unknown error")
                }
            )
        }
    }
}
