import React, { useEffect, useState } from 'react';
import {
  Alert,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { YellPayModule } from '../types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

interface DemoState {
  serviceId: string;
  authDomain: string;
  paymentDomain: string;
  userInfo: string;
  userId: string;
  amount: string;
  currentStep: number;
  completedSteps: Set<number>;
}

const STEPS = [
  {
    id: 1,
    title: '🔐 Authentication Setup',
    description: 'Register device and authenticate',
  },
  {
    id: 2,
    title: '👤 User Initialization',
    description: 'Initialize user for payments',
  },
  {
    id: 3,
    title: '💳 Card Management',
    description: 'Register and manage payment cards',
  },
  {
    id: 4,
    title: '💰 Make Payments',
    description: 'Process payments and transactions',
  },
  {
    id: 5,
    title: '📊 Information & History',
    description: 'View history and user info',
  },
];

const YellPayStepByStepDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    serviceId: 'yellpay',
    authDomain: 'auth.unid.net',
    paymentDomain: 'yellpay.unid.net',
    userInfo: 'test_user_123',
    userId: '',
    amount: '1000',
    currentStep: 1,
    completedSteps: new Set(),
  });

  useEffect(() => {
    // Check if module is available
    console.log('YellPay module available:', !!YellPay);
    if (YellPay) {
      console.log('YellPay methods:', Object.getOwnPropertyNames(YellPay));
    }
  }, []);

  const updateState = (
    key: keyof DemoState,
    value: string | number | Set<number>
  ) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const markStepCompleted = (stepId: number) => {
    const newCompleted = new Set(state.completedSteps);
    newCompleted.add(stepId);
    updateState('completedSteps', newCompleted);
    if (stepId === state.currentStep && stepId < STEPS.length) {
      updateState('currentStep', stepId + 1);
    }
  };

  const showResult = (title: string, result: any) => {
    console.log(`✅ ${title}:`, result);
    Alert.alert(`✅ ${title}`, JSON.stringify(result, null, 2));
  };

  const showError = (title: string, error: any) => {
    console.error(`❌ ${title}:`, error);
    Alert.alert(`❌ ${title}`, error.message || error.toString());
  };

  // ===== STEP 1: AUTHENTICATION =====
  const testAuthRegisterProduction = async () => {
    try {
      if (!YellPay?.authRegisterProduction) {
        throw new Error(
          'authRegisterProduction method not available. Please rebuild the app.'
        );
      }

      const result = await YellPay.authRegisterProduction();
      showResult('Authentication Registration', result);
      markStepCompleted(1);
    } catch (error) {
      showError('Auth Register', error);
    }
  };

  const testAuthApprovalProduction = async () => {
    try {
      if (!YellPay?.authApprovalProduction) {
        throw new Error(
          'authApprovalProduction method not available. Please rebuild the app.'
        );
      }

      const result = await YellPay.authApprovalProduction();
      showResult('Authentication Approval', result);
    } catch (error) {
      showError('Auth Approval', error);
    }
  };

  // ===== STEP 2: USER INITIALIZATION =====
  const testInitUserProduction = async () => {
    try {
      if (!YellPay?.initUserProduction) {
        throw new Error(
          'initUserProduction method not available. Please rebuild the app.'
        );
      }

      const userId = await YellPay.initUserProduction();
      showResult('User Initialized', { userId });
      updateState('userId', userId);
      markStepCompleted(2);
    } catch (error) {
      showError('User Initialization', error);
    }
  };

  // ===== STEP 3: CARD MANAGEMENT =====
  const testRegisterCard = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first (Step 2)');
      return;
    }

    try {
      if (!YellPay?.registerCard) {
        throw new Error(
          'registerCard method not available. Please rebuild the app.'
        );
      }

      const result = await YellPay.registerCard(state.userId, 0, state.userId);
      showResult('Card Registered', result);
      markStepCompleted(3);
    } catch (error) {
      showError('Card Registration', error);
    }
  };

  const testGetMainCreditCard = async () => {
    try {
      if (!YellPay?.getMainCreditCard) {
        throw new Error(
          'getMainCreditCard method not available. Please rebuild the app.'
        );
      }

      const result = await YellPay.getMainCreditCard();
      showResult('Main Credit Card', result);
    } catch (error) {
      showError('Get Main Credit Card', error);
    }
  };

  // ===== STEP 4: PAYMENTS =====
  const testMakePayment = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first (Step 2)');
      return;
    }

    try {
      if (!YellPay?.makePayment) {
        throw new Error(
          'makePayment method not available. Please rebuild the app.'
        );
      }

      const result = await YellPay.makePayment(state.userId, 0, state.userId);
      showResult('Payment Processed', result);
      markStepCompleted(4);
    } catch (error) {
      showError('Payment Processing', error);
    }
  };

  // ===== STEP 5: INFORMATION =====
  const testGetHistory = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first (Step 2)');
      return;
    }

    try {
      if (!YellPay?.getHistory) {
        throw new Error(
          'getHistory method not available. Please rebuild the app.'
        );
      }

      const result = await YellPay.getHistory(state.userId);
      showResult('Payment History', result);
      markStepCompleted(5);
    } catch (error) {
      showError('Get History', error);
    }
  };

  const testGetUserInfo = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first (Step 2)');
      return;
    }

    try {
      if (!YellPay?.getUserInfo) {
        throw new Error(
          'getUserInfo method not available. Please rebuild the app.'
        );
      }

      const result = await YellPay.getUserInfo(state.userId);
      showResult('User Information', result);
    } catch (error) {
      showError('Get User Info', error);
    }
  };

  const renderStepStatus = (stepId: number) => {
    if (state.completedSteps.has(stepId)) {
      return '✅';
    } else if (stepId === state.currentStep) {
      return '🔄';
    } else if (stepId < state.currentStep) {
      return '⏭️';
    } else {
      return '⏸️';
    }
  };

  const isStepActive = (stepId: number) => {
    return stepId <= state.currentStep;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>YellPay SDK - Step by Step Guide</Text>

      {/* Module Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Module Status</Text>
        <Text style={styles.statusText}>
          {YellPay
            ? '✅ YellPay module loaded'
            : '❌ YellPay module not available'}
        </Text>
        <Text style={styles.statusText}>
          Methods: {YellPay ? Object.getOwnPropertyNames(YellPay).length : 0}
        </Text>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Progress Overview</Text>
        {STEPS.map(step => (
          <View key={step.id} style={styles.progressItem}>
            <Text style={styles.progressStatus}>
              {renderStepStatus(step.id)}
            </Text>
            <Text style={styles.progressText}>{step.title}</Text>
          </View>
        ))}
      </View>

      {/* Configuration */}
      <View style={styles.configContainer}>
        <Text style={styles.configTitle}>Current Configuration</Text>
        <Text style={styles.configText}>Service ID: {state.serviceId}</Text>
        <Text style={styles.configText}>Auth Domain: {state.authDomain}</Text>
        <Text style={styles.configText}>
          Payment Domain: {state.paymentDomain}
        </Text>
        <Text style={styles.configText}>
          User ID: {state.userId || 'Not set'}
        </Text>
      </View>

      {/* Step 1: Authentication */}
      <View style={[styles.stepContainer, styles.stepActive]}>
        <Text style={styles.stepTitle}>
          {renderStepStatus(1)} Step 1: Device Authentication
        </Text>
        <Text style={styles.stepDescription}>
          Register your device for authentication and test the auth flow
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.authButton]}
          onPress={testAuthRegisterProduction}
        >
          <Text style={styles.buttonText}>🔐 Register Device</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.authButton]}
          onPress={testAuthApprovalProduction}
        >
          <Text style={styles.buttonText}>✅ Test Authentication</Text>
        </TouchableOpacity>
      </View>

      {/* Step 2: User Initialization */}
      <View style={[styles.stepContainer, styles.stepActive]}>
        <Text style={styles.stepTitle}>
          {renderStepStatus(2)} Step 2: Initialize Payment User
        </Text>
        <Text style={styles.stepDescription}>
          Create a user session for payment operations
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.userButton]}
          onPress={testInitUserProduction}
        >
          <Text style={styles.buttonText}>👤 Initialize User</Text>
        </TouchableOpacity>
      </View>

      {/* Step 3: Card Management */}
      <View style={[styles.stepContainer, styles.stepActive]}>
        <Text style={styles.stepTitle}>
          {renderStepStatus(3)} Step 3: Card Management
        </Text>
        <Text style={styles.stepDescription}>
          Register payment cards and manage card information
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.cardButton]}
          onPress={testRegisterCard}
        >
          <Text style={styles.buttonText}>💳 Register Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cardButton]}
          onPress={testGetMainCreditCard}
        >
          <Text style={styles.buttonText}>🏦 Get Main Card</Text>
        </TouchableOpacity>
      </View>

      {/* Step 4: Payments */}
      <View style={[styles.stepContainer, styles.stepActive]}>
        <Text style={styles.stepTitle}>
          {renderStepStatus(4)} Step 4: Process Payments
        </Text>
        <Text style={styles.stepDescription}>
          Make payments and process transactions
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Payment Amount (¥):</Text>
          <TextInput
            style={styles.input}
            value={state.amount}
            onChangeText={text => updateState('amount', text)}
            placeholder="1000"
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, styles.paymentButton]}
          onPress={testMakePayment}
        >
          <Text style={styles.buttonText}>💰 Make Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Step 5: Information */}
      <View style={[styles.stepContainer, styles.stepActive]}>
        <Text style={styles.stepTitle}>
          {renderStepStatus(5)} Step 5: View Information & History
        </Text>
        <Text style={styles.stepDescription}>
          Access payment history and user information
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={testGetHistory}
        >
          <Text style={styles.buttonText}>📊 Payment History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={testGetUserInfo}
        >
          <Text style={styles.buttonText}>👤 User Information</Text>
        </TouchableOpacity>
      </View>

      {/* Restart Option */}
      <View style={styles.restartContainer}>
        <TouchableOpacity
          style={[styles.button, styles.restartButton]}
          onPress={() => {
            setState(prev => ({
              ...prev,
              currentStep: 1,
              completedSteps: new Set(),
              userId: '',
            }));
          }}
        >
          <Text style={styles.buttonText}>🔄 Restart Demo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  statusContainer: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 2,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressStatus: {
    fontSize: 16,
    marginRight: 10,
    width: 25,
  },
  progressText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  progressTextDisabled: {
    color: '#bdc3c7',
  },
  configContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  configText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  stepContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    opacity: 0.6,
  },
  stepActive: {
    opacity: 1,
    borderLeftWidth: 5,
    borderLeftColor: '#27ae60',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
  },
  authButton: {
    backgroundColor: '#3498db',
  },
  userButton: {
    backgroundColor: '#9b59b6',
  },
  cardButton: {
    backgroundColor: '#f39c12',
  },
  paymentButton: {
    backgroundColor: '#27ae60',
  },
  infoButton: {
    backgroundColor: '#34495e',
  },
  restartButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  restartContainer: {
    marginTop: 30,
    marginBottom: 50,
  },
});

export default YellPayStepByStepDemo;
