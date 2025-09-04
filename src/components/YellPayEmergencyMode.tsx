import React, { useState } from 'react';
import {
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { YellPay } = NativeModules;

interface EmergencyState {
  isLoading: boolean;
  testResults: { [key: string]: 'pending' | 'success' | 'error' | 'timeout' };
  logs: string[];
  crashProtectionEnabled: boolean;
}

export const YellPayEmergencyMode: React.FC = () => {
  const [state, setState] = useState<EmergencyState>({
    isLoading: false,
    testResults: {},
    logs: [],
    crashProtectionEnabled: true,
  });

  const addLog = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp} - ${isError ? '💥' : '📝'} ${message}`;
    setState(prev => ({
      ...prev,
      logs: [logEntry, ...prev.logs].slice(0, 30),
    }));
  };

  const updateTestResult = (
    testName: string,
    result: 'success' | 'error' | 'timeout'
  ) => {
    setState(prev => ({
      ...prev,
      testResults: {
        ...prev.testResults,
        [testName]: result,
      },
    }));
  };

  const safeExecute = async (
    testName: string,
    operation: () => Promise<any>,
    timeoutMs = 5000
  ): Promise<any> => {
    addLog(`Testing: ${testName}`);
    updateTestResult(testName, 'pending');

    return new Promise((resolve, reject) => {
      let completed = false;
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
      };

      const handleSuccess = (result: any) => {
        if (completed) return;
        completed = true;
        cleanup();
        updateTestResult(testName, 'success');
        addLog(`✅ ${testName} completed successfully`);
        resolve(result);
      };

      const handleError = (error: any) => {
        if (completed) return;
        completed = true;
        cleanup();
        updateTestResult(testName, 'error');
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        addLog(`❌ ${testName} failed: ${errorMsg}`, true);
        reject(error);
      };

      const handleTimeout = () => {
        if (completed) return;
        completed = true;
        cleanup();
        updateTestResult(testName, 'timeout');
        addLog(`⏰ ${testName} timed out after ${timeoutMs}ms`, true);
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      };

      // Set timeout
      timeoutId = setTimeout(handleTimeout, timeoutMs);

      // Execute operation with crash protection
      try {
        operation().then(handleSuccess).catch(handleError);
      } catch (syncError) {
        handleError(syncError);
      }
    });
  };

  const emergencyTests = [
    {
      name: 'Framework Availability',
      test: () =>
        safeExecute(
          'Framework Check',
          () => YellPay.checkFrameworkAvailability(),
          3000
        ),
      description: 'Basic SDK availability check',
      safe: true,
    },
    {
      name: 'Production Config',
      test: () =>
        safeExecute('Config', () => YellPay.getProductionConfig(), 3000),
      description: 'Get configuration data',
      safe: true,
    },
    {
      name: 'Authentication Validation',
      test: () =>
        safeExecute(
          'Auth Validation',
          () => YellPay.validateAuthenticationStatus(),
          5000
        ),
      description: 'Check if authentication is ready',
      safe: false,
    },
    {
      name: 'User Initialization',
      test: () =>
        safeExecute('Init User', () => YellPay.initUserProduction(), 10000),
      description: 'Initialize user (may require auth)',
      safe: false,
    },
  ];

  const runSingleTest = async (testIndex: number) => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await emergencyTests[testIndex].test();
    } catch (error) {
      // Error already logged in safeExecute
    }

    setState(prev => ({ ...prev, isLoading: false }));
  };

  const runSafeTests = async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));
    addLog('🔬 Starting safe tests only');

    const safeTests = emergencyTests.filter(test => test.safe);

    for (const test of safeTests) {
      try {
        await test.test();
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        addLog(`Safe test failed: ${test.name}`, true);
        break;
      }
    }

    setState(prev => ({ ...prev, isLoading: false }));
    addLog('🔬 Safe tests completed');
  };

  const runAllTests = async () => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));
    addLog('🧪 Starting all tests with crash protection');

    for (const test of emergencyTests) {
      try {
        await test.test();
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        addLog(`Test failed, continuing: ${test.name}`, true);
        // Continue with next test even if this one fails
      }
    }

    setState(prev => ({ ...prev, isLoading: false }));
    addLog('🧪 All tests completed');
  };

  const clearResults = () => {
    setState(prev => ({
      ...prev,
      testResults: {},
      logs: [],
    }));
  };

  const getTestStatusIcon = (testName: string) => {
    const result = state.testResults[testName];
    switch (result) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'timeout':
        return '⏰';
      case 'pending':
        return '🔄';
      default:
        return '⭕';
    }
  };

  const getTestStatusColor = (testName: string) => {
    const result = state.testResults[testName];
    switch (result) {
      case 'success':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      case 'timeout':
        return '#FF9500';
      case 'pending':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚨 YellPay Emergency Mode</Text>
        <Text style={styles.subtitle}>
          Isolated testing with aggressive crash protection and short timeouts
        </Text>

        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>⚠️ Crash Protection Active</Text>
          <Text style={styles.warningText}>
            • Short timeouts (3-10 seconds) • Individual operation isolation •
            Safe-only mode available • Emergency fallbacks enabled
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.safeButton]}
          onPress={runSafeTests}
          disabled={state.isLoading}
        >
          <Text style={styles.buttonText}>
            {state.isLoading ? 'Testing...' : 'Run Safe Tests Only'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.allButton]}
          onPress={runAllTests}
          disabled={state.isLoading}
        >
          <Text style={styles.buttonText}>
            {state.isLoading ? 'Testing...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
          disabled={state.isLoading}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.testsContainer}>
        <Text style={styles.sectionTitle}>Individual Tests</Text>

        {emergencyTests.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.testButton,
              !test.safe && styles.testButtonUnsafe,
              { borderLeftColor: getTestStatusColor(test.name) },
            ]}
            onPress={() => runSingleTest(index)}
            disabled={state.isLoading}
          >
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              <View style={styles.testStatus}>
                {!test.safe && <Text style={styles.unsafeLabel}>⚠️</Text>}
                <Text style={styles.testStatusIcon}>
                  {getTestStatusIcon(test.name)}
                </Text>
              </View>
            </View>
            <Text style={styles.testDescription}>{test.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>
          Emergency Logs ({state.logs.length})
        </Text>

        {state.logs.length === 0 ? (
          <Text style={styles.noLogs}>No operations yet</Text>
        ) : (
          state.logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🎯 Crash Detection Strategy</Text>
        <Text style={styles.infoText}>
          • Start with "Safe Tests Only" - these should never crash
        </Text>
        <Text style={styles.infoText}>
          • If safe tests work, try individual unsafe tests
        </Text>
        <Text style={styles.infoText}>
          • Watch for specific operations that cause timeouts/crashes
        </Text>
        <Text style={styles.infoText}>
          • Use logs to identify the exact problem operation
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff5f5',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcccb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 18,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  safeButton: {
    backgroundColor: '#34C759',
  },
  allButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  testsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonUnsafe: {
    borderRightWidth: 4,
    borderRightColor: '#FF9500',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  testStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unsafeLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  testStatusIcon: {
    fontSize: 16,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  logsContainer: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  noLogs: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  logEntry: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 18,
    marginBottom: 4,
  },
});
