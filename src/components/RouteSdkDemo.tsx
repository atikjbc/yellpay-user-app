import React, { useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import RouteSdk from '../services/RouteSdk';

const DOMAIN = 'auth.unid.net'; // from docs examples
const SERVICE_ID = 'yellpay';
const USER_ID = 'user_id'; // usually from initialUserId response
const ENV: 'staging' | 'prod' = 'staging';

export default function RouteSdkDemo() {
  const [log, setLog] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState(0);
  const push = (m: string) => setLog(l => [m, ...l]);

  const doInitialUserId = async () => {
    try {
      const res = await RouteSdk.initialUserId(SERVICE_ID, ENV);
      push('initialUserId: ' + JSON.stringify(res));
    } catch (e: any) {
      push('initialUserId error: ' + e?.message);
    }
  };

  const doAutoRegisterKey = async () => {
    try {
      const status = await RouteSdk.autoRegisterKey(
        SERVICE_ID,
        USER_ID,
        DOMAIN
      );
      push('autoRegisterKey status=' + status);
    } catch (e: any) {
      push('autoRegisterKey error: ' + e?.message);
    }
  };

  const doAutoLogin = async () => {
    try {
      const res = await RouteSdk.autoLogin(SERVICE_ID, DOMAIN);
      push('autoLogin: ' + JSON.stringify(res)); // contains userInfo on success
    } catch (e: any) {
      push('autoLogin error: ' + e?.message);
    }
  };

  const doRegisterKeyGUI = async () => {
    try {
      const status = await RouteSdk.registerKey(DOMAIN);
      push('registerKey GUI status=' + status);
    } catch (e: any) {
      push('registerKey GUI error: ' + e?.message);
    }
  };

  const doLoginGUI = async () => {
    try {
      const status = await RouteSdk.login(DOMAIN);
      push('login GUI status=' + status);
    } catch (e: any) {
      push('login GUI error: ' + e?.message);
    }
  };

  const doGetUserInfo = async () => {
    try {
      const json = await RouteSdk.getUserInfo(USER_ID, ENV);
      push('getUserInfo: ' + json);
    } catch (e: any) {
      push('getUserInfo error: ' + e?.message);
    }
  };

  const doAddCard = async () => {
    try {
      const res = await RouteSdk.cardRegister(USER_ID, ENV);
      push('cardRegister: ' + JSON.stringify(res));
    } catch (e: any) {
      push('cardRegister error: ' + e?.message);
    }
  };

  const doSelectCard = async () => {
    try {
      const res = await RouteSdk.cardSelect(USER_ID, ENV);
      push('cardSelect: ' + JSON.stringify(res));
    } catch (e: any) {
      push('cardSelect error: ' + e?.message);
    }
  };

  const doGetMainCard = async () => {
    try {
      const json = await RouteSdk.getMainCard(USER_ID, ENV);
      push('getMainCard: ' + json);
    } catch (e: any) {
      push('getMainCard error: ' + e?.message);
    }
  };

  const doPayment = async () => {
    try {
      const res = await RouteSdk.payment(USER_ID, ENV);
      push('payment: ' + JSON.stringify(res));
    } catch (e: any) {
      push('payment error: ' + e?.message);
    }
  };

  const doPaymentQR = async () => {
    try {
      const res = await RouteSdk.paymentForQR(USER_ID, ENV);
      push('paymentForQR: ' + JSON.stringify(res));
    } catch (e: any) {
      push('paymentForQR error: ' + e?.message);
    }
  };

  const doPayHistory = async () => {
    try {
      const json = await RouteSdk.payHistory(USER_ID, ENV);
      push('payHistory: ' + json);
    } catch (e: any) {
      push('payHistory error: ' + e?.message);
    }
  };

  const doUsageLimit = async () => {
    try {
      const json = await RouteSdk.getConfirmLimitAmount(USER_ID, ENV);
      push('getConfirmLimitAmount: ' + json);
    } catch (e: any) {
      push('getConfirmLimitAmount error: ' + e?.message);
    }
  };

  const doNotifications = async () => {
    try {
      const res = await RouteSdk.getNotification(USER_ID, lastUpdate, ENV);
      setLastUpdate(res?.lastUpdate ?? 0);
      push('getNotification: ' + JSON.stringify(res));
    } catch (e: any) {
      push('getNotification error: ' + e?.message);
    }
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
        RouteCode / RCPay — All-in-one Test
      </Text>
      <Text>
        Domain: {DOMAIN} | Env: {ENV}
      </Text>
      <Button title="1) initialUserId" onPress={doInitialUserId} />
      <Button title="2) Auto Register Key" onPress={doAutoRegisterKey} />
      <Button title="3) Auto Login" onPress={doAutoLogin} />
      <Button title="4) Register Key (GUI)" onPress={doRegisterKeyGUI} />
      <Button title="5) Login (GUI)" onPress={doLoginGUI} />

      <View style={{ height: 8 }} />
      <Button title="User Info" onPress={doGetUserInfo} />

      <View style={{ height: 8 }} />
      <Button title="Add Card" onPress={doAddCard} />
      <Button title="Select Card" onPress={doSelectCard} />
      <Button title="Get Main Card" onPress={doGetMainCard} />

      <View style={{ height: 8 }} />
      <Button title="Make Payment" onPress={doPayment} />
      <Button title="Make Payment (QR)" onPress={doPaymentQR} />
      <Button title="Payment History" onPress={doPayHistory} />

      <View style={{ height: 8 }} />
      <Button title="Usage / Limit" onPress={doUsageLimit} />
      <Button title="Notifications" onPress={doNotifications} />

      <View style={{ height: 16 }} />
      <Text style={{ fontWeight: 'bold' }}>Log</Text>
      {log.map((l, i) => (
        <Text key={i} style={{ fontFamily: 'monospace' }}>
          {l}
        </Text>
      ))}
    </ScrollView>
  );
}
