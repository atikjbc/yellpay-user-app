import { NativeModules } from 'react-native';
const { RouteSdk } = NativeModules;

const debugCall = (name: string, args: any[]) => {
  console.log(`[RouteSdk.ts] ${name} called`, ...args);
  if (!RouteSdk) {
    console.log(
      '[RouteSdk.ts] NativeModules keys:',
      Object.keys(NativeModules || {})
    );
    throw new Error('RouteSdk native module is not available');
  }
};

type Env = 'staging' | 'prod';

export default {
  // --- Auth
  registerKey: (domain: string) => RouteSdk.registerKey(domain),
  login: (domain: string) => RouteSdk.login(domain),

  autoRegisterKey: (serviceId: string, userInfo: string, domain: string) =>
    RouteSdk.autoRegisterKey(serviceId, userInfo, domain),

  autoLogin: (serviceId: string, domain: string) =>
    RouteSdk.autoLogin(serviceId, domain),

  // --- Pay / User
  initialUserId: (serviceId: string, env: Env = 'staging') =>
    RouteSdk.initialUserId(serviceId, env),

  getUserInfo: (userId: string, env: Env = 'staging') =>
    RouteSdk.getUserInfo(userId, env),

  cardRegister: (userId: string, env: Env = 'staging') =>
    RouteSdk.cardRegister(userId, env),

  cardSelect: (userId: string, env: Env = 'staging') =>
    RouteSdk.cardSelect(userId, env),

  getMainCard: (userId: string, env: Env = 'staging') =>
    RouteSdk.getMainCard(userId, env),

  payment: (userId: string, env: Env = 'staging') => {
    debugCall('payment', [userId, env]);
    return RouteSdk.payment(userId, env);
  },

  paymentForQR: (userId: string, env: Env = 'staging') => {
    debugCall('paymentForQR', [userId, env]);
    return RouteSdk.paymentForQR(userId, env);
  },

  payHistory: (userId: string, env: Env = 'staging') => {
    debugCall('payHistory', [userId, env]);
    return RouteSdk.payHistory(userId, env);
  },

  getConfirmLimitAmount: (userId: string, env: Env = 'staging') =>
    RouteSdk.getConfirmLimitAmount(userId, env),

  getNotification: (userId: string, lastUpdate: number, env: Env = 'staging') =>
    RouteSdk.getNotification(userId, lastUpdate, env),
};
