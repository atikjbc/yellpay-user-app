import Foundation
import React

@objc(YellPay)
class YellPay: NSObject {
    
    // Circuit breaker for crash protection
    private static var crashedOperations: Set<String> = []
    private static var operationAttempts: [String: Int] = [:]
    private static let maxAttempts = 3
    
    @objc
    static func moduleName() -> String {
        return "YellPay"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // Circuit breaker implementation
    private func isOperationBlocked(_ operationName: String) -> Bool {
        return YellPay.crashedOperations.contains(operationName)
    }
    
    private func incrementAttempt(_ operationName: String) {
        YellPay.operationAttempts[operationName] = (YellPay.operationAttempts[operationName] ?? 0) + 1
    }
    
    private func blockOperation(_ operationName: String) {
        YellPay.crashedOperations.insert(operationName)
        print("💥 Operation \(operationName) blocked due to repeated failures")
    }
    
    private func shouldBlockOperation(_ operationName: String) -> Bool {
        let attempts = YellPay.operationAttempts[operationName] ?? 0
        return attempts >= YellPay.maxAttempts
    }
    
    // For new React Native architecture compatibility
    @objc
    func constantsToExport() -> [String: Any]! {
        return [
            "AUTH_DOMAIN": YellPay.AUTH_DOMAIN,
            "PAYMENT_DOMAIN": YellPay.PAYMENT_DOMAIN,
            "SERVICE_ID": YellPay.SERVICE_ID
        ]
    }
    
    // Ensure methods are properly queued on main thread
    @objc
    static func methodQueue() -> DispatchQueue {
        return DispatchQueue.main
    }
    
    // MARK: - Production Configuration Constants
    static let AUTH_DOMAIN = "auth.unid.net"
    static let PAYMENT_DOMAIN = "yellpay.unid.net"
    static let SERVICE_ID = "yellpay"
    
    // MARK: - Configuration Methods
    
    @objc
    func getProductionConfig(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let config: [String: Any] = [
            "authDomain": YellPay.AUTH_DOMAIN,
            "paymentDomain": YellPay.PAYMENT_DOMAIN,
            "serviceId": YellPay.SERVICE_ID,
            "environmentMode": "Production"
        ]
        resolve(config)
    }
    
    // MARK: - Authentication Methods
    
    @objc
    func authRegister(_ domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.authRegister START - domainName: \(domainName)")
        
        guard !domainName.isEmpty else {
            reject("AUTH_REGISTER_ERROR", "Domain name cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async {
            print("🔥 YellPay.authRegister - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.authRegister - No view controller")
                reject("AUTH_REGISTER_ERROR", "No view controller available", nil)
                return
            }
            
            print("✅ YellPay.authRegister - Got view controller, calling RouteAuth.callRegister")
            
            // Add timeout handling with proper cleanup
            let timeoutTimer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
            var isCompleted = false
            
            timeoutTimer.schedule(deadline: .now() + 60) // Increased timeout for user interaction
            timeoutTimer.setEventHandler {
                guard !isCompleted else { return }
                isCompleted = true
                timeoutTimer.cancel()
                print("⏰ YellPay.authRegister - Operation timed out")
                reject("AUTH_REGISTER_ERROR", "Authentication registration timed out. Please try again.", nil)
            }
            timeoutTimer.resume()
            
            do {
                RouteAuth.callRegister(
                    viewController,
                    domainName: domainName,
                    callSuccess: { status in
                        guard !isCompleted else { return }
                        isCompleted = true
                        timeoutTimer.cancel()
                        print("✅ YellPay.authRegister - Success: status=\(status)")
                        resolve([
                            "status": status,
                            "message": "Authentication key registered successfully. Please proceed with approval."
                        ])
                    },
                    callFailed: { status, error in
                        guard !isCompleted else { return }
                        isCompleted = true
                        timeoutTimer.cancel()
                        let errorMsg = error?.localizedDescription ?? "Unknown error"
                        print("❌ YellPay.authRegister - Failed: status=\(status), error=\(errorMsg)")
                        
                        // Provide helpful error messages
                        if errorMsg.contains("cancelled") || errorMsg.contains("canceled") {
                            reject("AUTH_REGISTER_ERROR", "Authentication registration was cancelled by user. Please try again and complete the registration process.", error)
                        } else {
                            reject("AUTH_REGISTER_ERROR", "Authentication registration failed (Status: \(status)): \(errorMsg). Please ensure you complete the entire registration process.", error)
                        }
                    }
                )
            } catch {
                guard !isCompleted else { return }
                isCompleted = true
                timeoutTimer.cancel()
                print("💥 YellPay.authRegister - Exception: \(error)")
                reject("AUTH_REGISTER_ERROR", "Failed to start authentication registration: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc
    func authApproval(_ domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.authApproval START - domainName: \(domainName)")
        
        guard !domainName.isEmpty else {
            reject("AUTH_APPROVAL_ERROR", "Domain name cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async {
            print("🔥 YellPay.authApproval - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.authApproval - No view controller")
                reject("AUTH_APPROVAL_ERROR", "No view controller available", nil)
                return
            }
            
            print("✅ YellPay.authApproval - Got view controller, calling RouteAuth.callApprovalViewController")
            
            do {
                RouteAuth.callApprovalViewController(
                    viewController,
                    domainName: domainName,
                    callSuccess: { status in
                        print("✅ YellPay.authApproval - Success: status=\(status)")
                        resolve([
                            "status": status,
                            "message": "Authentication approval completed successfully."
                        ])
                    },
                    callFailed: { status, error in
                        let errorMsg = error?.localizedDescription ?? "Unknown error"
                        print("❌ YellPay.authApproval - Failed: status=\(status), error=\(errorMsg)")
                        
                        // Check for specific error conditions
                        if errorMsg.contains("key is missing") || errorMsg.contains("register") {
                            reject("AUTH_APPROVAL_ERROR", "Authentication key not found. Please complete authentication registration first before approval. Error: \(errorMsg)", error)
                        } else if errorMsg.contains("cancelled") || errorMsg.contains("canceled") {
                            reject("AUTH_APPROVAL_ERROR", "Authentication approval was cancelled by user. Please try again.", error)
                        } else {
                            reject("AUTH_APPROVAL_ERROR", "Authentication approval failed (Status: \(status)): \(errorMsg)", error)
                        }
                    }
                )
            } catch {
                print("💥 YellPay.authApproval - Exception: \(error)")
                reject("AUTH_APPROVAL_ERROR", "Failed to start authentication approval: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc
    func authApprovalWithMode(_ domainName: String, isQrStart: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("AUTH_APPROVAL_ERROR", "No view controller available", nil)
                return
            }
            
            RouteAuth.callApprovalViewController(
                viewController,
                domainName: domainName,
                callSuccess: { status in
                    resolve(["status": status])
                },
                callFailed: { status, error in
                    reject("AUTH_APPROVAL_ERROR", "Error \(status): \(error?.localizedDescription ?? "Unknown error")", error)
                }
            )
        }
    }
    
    @objc
    func authUrlScheme(_ urlType: String, providerId: String, waitingId: String, domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("AUTH_URL_SCHEME_ERROR", "No view controller available", nil)
                return
            }
            
            RouteAuth.callUrlSchemeUrlType(
                Int(urlType) ?? 0,
                providerId: providerId,
                waitingId: waitingId,
                viewController: viewController,
                domainName: domainName,
                callSuccess: { status in
                    resolve(["status": status])
                },
                callFailed: { status, error in
                    reject("AUTH_URL_SCHEME_ERROR", "Error \(status): \(error?.localizedDescription ?? "Unknown error")", error)
                }
            )
        }
    }
    
    @objc
    func autoAuthRegister(_ serviceId: String, userInfo: String, domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        RouteAuth.callAutoAuthRegisterDomainName(
            domainName,
            serviceId: serviceId,
            userInfo: userInfo,
            callSuccess: { status in
                resolve(["status": status])
            },
            callFailed: { status, error in
                reject("AUTO_AUTH_REGISTER_ERROR", "Error \(status): \(error?.localizedDescription ?? "Unknown error")", error)
            }
        )
    }
    
    @objc
    func autoAuthApproval(_ serviceId: String, domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        RouteAuth.callAutoAuthApprovalDomainName(
            domainName,
            serviceId: serviceId,
            callSuccess: { status, userInfo in
                resolve([
                    "status": status,
                    "userInfo": userInfo
                ])
            },
            callFailed: { status, error in
                reject("AUTO_AUTH_APPROVAL_ERROR", "Error \(status): \(error?.localizedDescription ?? "Unknown error")", error)
            }
        )
    }
    
    // MARK: - Production Authentication Convenience Methods
    
    @objc
    func authRegisterProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        authRegister(YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func authApprovalProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        authApproval(YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func autoAuthRegisterProduction(_ userInfo: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        autoAuthRegister(YellPay.SERVICE_ID, userInfo: userInfo, domainName: YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func autoAuthApprovalProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        autoAuthApproval(YellPay.SERVICE_ID, domainName: YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    // MARK: - Payment Methods
    
    @objc
    func initUser(_ serviceId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.initUser START - serviceId: \(serviceId)")
        
        // Validate input
        guard !serviceId.isEmpty else {
            reject("INIT_ERROR", "ServiceId cannot be empty", nil)
            return
        }
        
        // Simplify by removing nested validation to prevent threading issues
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("INIT_ERROR", "Module deallocated", nil)
                return
            }
            
            print("🔥 YellPay.initUser - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.initUser - No view controller")
                reject("INIT_ERROR", "No view controller available", nil)
                return
            }
            
            print("✅ YellPay.initUser - Got view controller, calling RoutePay.callInitialUserIdServiceId")
            
            // Use autoreleasepool to manage memory
            autoreleasepool {
                do {
                    RoutePay.callInitialUserIdServiceId(
                        serviceId,
                        callSuccess: { [weak self] userId in
                            guard self != nil else { return }
                            print("✅ YellPay.initUser - Success: \(userId)")
                            
                            // Validate the returned userId
                            guard let userIdString = userId as? String, !userIdString.isEmpty else {
                                reject("INIT_ERROR", "Invalid userId returned from SDK", nil)
                                return
                            }
                            
                            resolve(userIdString)
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            guard self != nil else { return }
                            let errorMsg = "Init failed - Code: \(errorCode), Message: \(errorMessage)"
                            print("❌ YellPay.initUser - \(errorMsg)")
                            
                            // Provide more helpful error messages for common issues
                            if errorCode == -100 || errorCode == -101 {
                                reject("INIT_ERROR", "Authentication required. Please complete the full authentication flow first. Error: \(errorMsg)", nil)
                            } else {
                                reject("INIT_ERROR", errorMsg, nil)
                            }
                        }
                    )
                } catch {
                    print("💥 YellPay.initUser - Exception: \(error)")
                    reject("INIT_ERROR", "SDK call failed: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func initUserProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        initUser(YellPay.SERVICE_ID, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func registerCard(_ uuid: String, userNo: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.registerCard START - uuid: \(uuid), userNo: \(userNo)")
        
        // Validate inputs
        guard !uuid.isEmpty else {
            reject("REGISTER_ERROR", "UUID cannot be empty. Please initialize user first with initUser().", nil)
            return
        }
        
        DispatchQueue.main.async {
            print("🔥 YellPay.registerCard - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.registerCard - No view controller")
                reject("REGISTER_ERROR", "No view controller available", nil)
                return
            }
            
            print("✅ YellPay.registerCard - Got view controller, calling SDK")
            
            do {
                RoutePay.callCardRegisterUuid(
                    uuid,
                    userNo: userNo.intValue,
                    payUserId: "",
                    viewController: viewController,
                    callSuccess: { result, status in
                        print("✅ YellPay.registerCard - Success: result=\(String(describing: result)), status=\(status)")
                        resolve([
                            "result": result ?? "",
                            "status": status
                        ])
                    },
                    callFailed: { errorCode, errorMessage in
                        let errorMsg = "Card registration failed - Code: \(errorCode), Message: \(errorMessage)"
                        print("❌ YellPay.registerCard - \(errorMsg)")
                        
                        // Provide helpful error messages
                        if errorCode == -100 || errorCode == -101 {
                            reject("REGISTER_ERROR", "UUID mismatch - Please ensure you have completed authentication and user initialization. \(errorMsg)", nil)
                        } else {
                            reject("REGISTER_ERROR", errorMsg, nil)
                        }
                    }
                )
            } catch {
                print("💥 YellPay.registerCard - Exception: \(error)")
                reject("REGISTER_ERROR", "SDK call failed: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc
    func makePayment(_ userId: String, amount: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.makePayment START - userId: \(userId), amount: \(amount)")
        
        // Validate input parameters
        guard !userId.isEmpty else {
            reject("PAYMENT_ERROR", "Invalid userId: cannot be empty", nil)
            return
        }
        
        guard amount.intValue > 0 else {
            reject("PAYMENT_ERROR", "Invalid amount: must be greater than 0", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("PAYMENT_ERROR", "Module deallocated", nil)
                return
            }
            
            print("🔥 YellPay.makePayment - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.makePayment - No view controller")
                reject("PAYMENT_ERROR", "No view controller available", nil)
                return
            }
            
            print("✅ YellPay.makePayment - Got view controller: \(viewController)")
            
            // Simplified timeout handling
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, self != nil else { return }
                isCompleted = true
                print("⏰ YellPay.makePayment - Payment timed out")
                reject("PAYMENT_ERROR", "Payment operation timed out", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 60, execute: timeoutWorkItem)
            
            autoreleasepool {
                do {
                    print("🔥 YellPay.makePayment - Calling RoutePay.callPayment")
                    RoutePay.callPayment(
                        forQRUuid: userId,
                        userNo: amount.intValue,
                        payUserId: "",
                        viewController: viewController,
                        callSuccess: { [weak self] result, status in
                            guard !isCompleted, self != nil else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            print("✅ YellPay: Payment successful - result: \(String(describing: result)), status: \(status)")
                            resolve(result)
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            guard !isCompleted, self != nil else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            print("❌ YellPay: Payment failed - errorCode: \(errorCode), message: \(errorMessage)")
                            reject("PAYMENT_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutWorkItem.cancel()
                    print("💥 YellPay: Payment crashed - error: \(error)")
                    reject("PAYMENT_ERROR", "Payment method crashed: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func paymentForQR(_ qrCode: String, isQrStart: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("QR_PAYMENT_ERROR", "No view controller available", nil)
                return
            }
            
            RoutePay.callPayment(
                forQRUuid: qrCode,
                userNo: 0,
                payUserId: "",
                viewController: viewController,
                callSuccess: { result, status in
                    resolve(result)
                },
                callFailed: { errorCode, errorMessage in
                    reject("QR_PAYMENT_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                }
            )
        }
    }
    
    @objc
    func getHistory(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("HISTORY_ERROR", "No view controller available", nil)
                return
            }
            
            RoutePay.callHistoryUserId(
                userId,
                viewController: viewController,
                callSuccess: { history in
                    resolve(history)
                },
                callFailed: { errorCode, errorMessage in
                    reject("HISTORY_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                }
            )
        }
    }
    
    @objc
    func cardSelect(_ userNo: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("CARD_SELECT_ERROR", "No view controller available", nil)
                return
            }
            
            RoutePay.callCardSelectServiceId(
                YellPay.SERVICE_ID,
                merchantId: "",
                payUserId: String(userNo.intValue),
                viewController: viewController,
                callSuccess: { selectedCard in
                    resolve(selectedCard)
                },
                callFailed: { errorCode, errorMessage in
                    reject("CARD_SELECT_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                }
            )
        }
    }
    
    @objc
    func getMainCreditCard(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        RoutePay.callGetMainCreditCardResponseSuccess(
            { result in
                resolve(result)
            },
            callFailed: { errorCode, errorMessage in
                reject("GET_MAIN_CARD_ERROR", "Error \(errorCode): \(errorMessage)", nil)
            }
        )
    }
    
    @objc
    func getUserInfo(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        RoutePay.callGetUserInfoUserId(
            userId,
            callSuccess: { userCertificates in
                // Convert the array to a serializable format
                var certificatesArray: [[String: Any]] = []
                if let certificates = userCertificates {
                    for certificate in certificates {
                        if let certDict = certificate as? [String: Any] {
                            certificatesArray.append([
                                "certificateType": certDict["certificateType"] as? String ?? "",
                                "status": certDict["status"] as? Int ?? 0,
                                "additionalInfo": certDict["additionalInfo"] as? String ?? ""
                            ])
                        }
                    }
                }
                resolve(certificatesArray)
            },
            callFailed: { errorCode, errorMessage in
                reject("GET_USER_INFO_ERROR", "Error \(errorCode): \(errorMessage)", nil)
            }
        )
    }
    
    @objc
    func viewCertificate(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("VIEW_CERTIFICATE_ERROR", "No view controller available", nil)
                return
            }
            
            RoutePay.callViewCertificateUserId(
                userId,
                viewController: viewController,
                callSuccess: {
                    resolve(["success": true])
                },
                callFailed: { errorCode, errorMessage in
                    reject("VIEW_CERTIFICATE_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                }
            )
        }
    }
    
    @objc
    func getNotification(_ count: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        RoutePay.callGetNotificationUserId(
            "",
            lastUpdate: count.intValue,
            callSuccess: { notificationCount, notifications in
                // Convert notifications array to serializable format
                var notificationsArray: [[String: Any]] = []
                if let notificationList = notifications {
                    for notification in notificationList {
                        if let notifDict = notification as? [String: Any] {
                            notificationsArray.append([
                                "id": notifDict["notificationId"] as? String ?? "",
                                "title": notifDict["title"] as? String ?? "",
                                "message": notifDict["message"] as? String ?? "",
                                "date": notifDict["date"] as? String ?? ""
                            ])
                        }
                    }
                }
                
                resolve([
                    "count": notificationCount,
                    "notifications": notificationsArray
                ])
            },
            callFailed: { errorCode, errorMessage in
                reject("GET_NOTIFICATION_ERROR", "Error \(errorCode): \(errorMessage)", nil)
            }
        )
    }
    
    @objc
    func getInformation(_ infoType: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        RoutePay.callGetInformationUserId(
            "",
            lastUpdateNotification: infoType.intValue,
            callSuccess: { informationCount, informationMeta1, informationList, meta2, meta3 in
                // Convert information array to serializable format
                var informationArray: [[String: Any]] = []
                if let infoList = informationList {
                    for info in infoList {
                        if let infoDict = info as? [String: Any] {
                            informationArray.append([
                                "id": infoDict["informationId"] as? String ?? "",
                                "title": infoDict["title"] as? String ?? "",
                                "content": infoDict["content"] as? String ?? "",
                                "date": infoDict["date"] as? String ?? ""
                            ])
                        }
                    }
                }
                
                resolve([
                    "count": informationCount,
                    "information": informationArray
                ])
            },
            callFailed: { errorCode, errorMessage in
                reject("GET_INFORMATION_ERROR", "Error \(errorCode): \(errorMessage)", nil)
            }
        )
    }
    
    // MARK: - Helper Methods
    
    @objc
    func checkFrameworkAvailability(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Check if RouteCode framework classes are available
        guard NSClassFromString("RouteAuth") != nil else {
            reject("FRAMEWORK_ERROR", "RouteAuth class not found - RouteCode framework not properly loaded", nil)
            return
        }
        
        guard NSClassFromString("RoutePay") != nil else {
            reject("FRAMEWORK_ERROR", "RoutePay class not found - RouteCode framework not properly loaded", nil)
            return
        }
        
        resolve([
            "available": true,
            "routeAuth": "available",
            "routePay": "available"
        ])
    }
    
    @objc
    func validateAuthenticationStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationName = "validateAuthenticationStatus"
        print("🔥 YellPay.\(operationName) START")
        
        // Circuit breaker check
        if isOperationBlocked(operationName) {
            print("🚫 Operation \(operationName) blocked due to previous crashes")
            resolve([
                "authenticated": false,
                "error": "Operation blocked due to previous crashes"
            ])
            return
        }
        
        incrementAttempt(operationName)
        
        // Much shorter timeout for validation
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                resolve([
                    "authenticated": false,
                    "error": "Module deallocated"
                ])
                return
            }
            
            var isCompleted = false
            
            // Very short timeout to prevent hangs
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.\(operationName) - Validation timed out quickly")
                
                if self.shouldBlockOperation(operationName) {
                    self.blockOperation(operationName)
                }
                
                resolve([
                    "authenticated": false,
                    "error": "Validation timed out (3s)"
                ])
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 3, execute: timeoutWorkItem)
            
            // Try a very basic check first - just see if RouteAuth exists
            do {
                guard NSClassFromString("RouteAuth") != nil else {
                    timeoutWorkItem.cancel()
                    isCompleted = true
                    resolve([
                        "authenticated": false,
                        "error": "RouteAuth framework not available"
                    ])
                    return
                }
                
                // Skip the potentially problematic SDK call for now
                timeoutWorkItem.cancel()
                isCompleted = true
                print("✅ YellPay.\(operationName) - Basic framework check passed")
                resolve([
                    "authenticated": false,
                    "error": "Framework available but authentication status unknown (safe mode)"
                ])
                
            } catch {
                guard !isCompleted else { return }
                isCompleted = true
                timeoutWorkItem.cancel()
                print("💥 YellPay.\(operationName) - Exception: \(error)")
                
                if self.shouldBlockOperation(operationName) {
                    self.blockOperation(operationName)
                }
                
                resolve([
                    "authenticated": false,
                    "error": "Framework check failed: \(error.localizedDescription)"
                ])
            }
        }
    }
    
    @objc
    func resetCrashProtection(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.crashedOperations.removeAll()
        YellPay.operationAttempts.removeAll()
        print("🔄 Crash protection reset - all operations unblocked")
        resolve([
            "reset": true,
            "message": "All blocked operations have been reset"
        ])
    }
    
    @objc
    func getCrashProtectionStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve([
            "blockedOperations": Array(YellPay.crashedOperations),
            "operationAttempts": YellPay.operationAttempts
        ])
    }
    
    private func getCurrentViewController() -> UIViewController? {
        // Find active window scene first
        guard let windowScene = UIApplication.shared.connectedScenes.first(where: { 
            $0.activationState == .foregroundActive 
        }) as? UIWindowScene else {
            print("YellPay: No active window scene found")
            return nil
        }
        
        // Find key window
        guard let window = windowScene.windows.first(where: { $0.isKeyWindow }) else {
            print("YellPay: No key window found")
            return nil
        }
        
        // Get root view controller
        guard let rootViewController = window.rootViewController else {
            print("YellPay: No root view controller found")
            return nil
        }
        
        // Find topmost presented view controller
        var topController = rootViewController
        while let presentedViewController = topController.presentedViewController {
            topController = presentedViewController
        }
        
        print("YellPay: Found view controller: \(String(describing: topController))")
        return topController
    }
    
}
