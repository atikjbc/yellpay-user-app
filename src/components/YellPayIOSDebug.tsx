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

interface DebugLog {
  timestamp: string;
  level: 'info' | 'success' | 'error';
  method: string;
  message: string;
}

export const YellPayIOSDebug: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (
    level: DebugLog['level'],
    method: string,
    message: string
  ) => {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      method,
      message,
    };
    setLogs(prev => [log, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    if (isRunning) return;

    setIsRunning(true);
    addLog('info', testName, 'Starting test...');

    try {
      const result = await testFn();
      addLog('success', testName, `✅ Success: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addLog(
        'error',
        testName,
        `❌ Error: ${error.message || error.toString()}`
      );
      console.error(`${testName} failed:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const tests = [
    {
      name: 'Framework Check',
      description: 'Check if RouteCode framework is available',
      test: () => YellPay.checkFrameworkAvailability(),
    },
    {
      name: 'Production Config',
      description: 'Get production configuration',
      test: () => YellPay.getProductionConfig(),
    },
    {
      name: 'Init User',
      description: 'Initialize user (safe method)',
      test: () => YellPay.initUserProduction(),
    },
    {
      name: 'Auth Register',
      description: 'Test authentication registration',
      test: () => YellPay.authRegisterProduction(),
    },
    {
      name: 'Make Payment',
      description: 'Test payment with dummy data (CAUTION)',
      test: () => YellPay.makePayment('test-user-123', 100),
    },
  ];

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogStyle = (level: DebugLog['level']) => {
    switch (level) {
      case 'success':
        return styles.logSuccess;
      case 'error':
        return styles.logError;
      default:
        return styles.logInfo;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>YellPay iOS Debug Console</Text>
      <Text style={styles.subtitle}>
        Run these tests to isolate the crash issue. Start with "Framework
        Check".
      </Text>

      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Debug Tests</Text>

        {tests.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testButton, isRunning && styles.testButtonDisabled]}
            onPress={() => runTest(test.name, test.test)}
            disabled={isRunning}
          >
            <Text style={styles.testButtonText}>{test.name}</Text>
            <Text style={styles.testDescription}>{test.description}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.clearButtonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logSection}>
        <Text style={styles.sectionTitle}>Debug Logs ({logs.length})</Text>

        {logs.length === 0 ? (
          <Text style={styles.noLogs}>
            No logs yet. Run a test to see results.
          </Text>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={[styles.logEntry, getLogStyle(log.level)]}>
              <Text style={styles.logTimestamp}>{log.timestamp}</Text>
              <Text style={styles.logMethod}>[{log.method}]</Text>
              <Text style={styles.logMessage}>{log.message}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  testSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  testDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logSection: {
    flex: 1,
  },
  noLogs: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  logEntry: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  logInfo: {
    backgroundColor: '#f0f8ff',
    borderLeftColor: '#007AFF',
  },
  logSuccess: {
    backgroundColor: '#f0fff0',
    borderLeftColor: '#34C759',
  },
  logError: {
    backgroundColor: '#fff0f0',
    borderLeftColor: '#FF3B30',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  logMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
});
