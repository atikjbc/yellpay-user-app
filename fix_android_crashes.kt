// This is a template for the fixed Android native module
// Key improvements:
// 1. Proper null checks for currentActivity
// 2. Using WritableNativeMap/Array instead of mapOf()
// 3. Comprehensive error handling in callbacks
// 4. Safe exception handling with proper error messages

// Pattern for activity-dependent methods:
/*
@ReactMethod
fun methodName(param: String, promise: Promise) {
    try {
        val activity = getSafeCurrentActivity()
        if (activity == null) {
            rejectWithActivityError(promise, "operation name")
            return
        }

        // SDK call with activity
        sdk.callMethod(
            activity,
            param,
            object : SdkCallback {
                override fun success(result: Type) {
                    try {
                        val response = WritableNativeMap()
                        response.putType("key", result)
                        promise.resolve(response)
                    } catch (e: Exception) {
                        promise.reject("CALLBACK_ERROR", "Error processing success: ${e.message}", e)
                    }
                }
                override fun failed(errorCode: Int, errorMessage: String) {
                    promise.reject("METHOD_ERROR", "Error $errorCode: $errorMessage")
                }
            }
        )
    } catch (e: Exception) {
        promise.reject("METHOD_ERROR", e.message ?: "Unknown error in method", e)
    }
}
*/

// Pattern for array results:
/*
val arrayResult = WritableNativeArray()
items.forEach { item ->
    val itemMap = WritableNativeMap()
    itemMap.putString("field", item.field)
    arrayResult.pushMap(itemMap)
}
*/
