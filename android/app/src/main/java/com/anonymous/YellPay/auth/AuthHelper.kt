package com.anonymous.YellPay.auth

import android.app.Activity
import com.platfield.unidsdk.routecode.RouteAuth

class AuthHelper(private val activity: Activity) {
    private val auth = RouteAuth()

    /** GUI flow: register authentication key */
    fun registerKey(
        domainName: String,
        onSuccess: (Int) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            auth.callAuthRegister(
                activity,
                domainName,
                object : RouteAuth.ResponseAuthRegisterCallback {
                    override fun success(status: Int) = onSuccess(status)
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "")
                }
            )
        }
    }

    /** GUI flow: login/authenticate */
    fun login(
        domainName: String,
        onSuccess: (Int) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            auth.callAuthApproval(
                activity,
                domainName,
                object : RouteAuth.ResponseAuthApprovalCallback {
                    override fun success(status: Int) = onSuccess(status)
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "")
                }
            )
        }
    }

    /** Automatic key registration (no GUI) — returns status only */
    fun autoRegisterKey(
        serviceId: String,
        userInfo: String,
        domainName: String,
        onSuccess: (Int) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            auth.callAutoAuthRegister(
                serviceId,
                userInfo,
                activity,
                domainName,
                object : RouteAuth.ResponseAutoAuthRegisterCallback {
                    override fun success(status: Int) = onSuccess(status)
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "")
                }
            )
        }
    }

    /** Automatic login — returns userInfo set during autoRegisterKey */
    fun autoLogin(
        serviceId: String,
        domainName: String,
        onSuccess: (Int, String) -> Unit,
        onError: (Int, String) -> Unit
    ) {
        activity.runOnUiThread {
            auth.callAutoAuthApproval(
                serviceId,
                activity,
                domainName,
                object : RouteAuth.ResponseAutoAuthApprovalCallback {
                    override fun success(status: Int, userInfo: String) = onSuccess(status, userInfo)
                    override fun failed(status: Int, message: String?) = onError(status, message ?: "")
                }
            )
        }
    }
}
