import React, { useState } from 'react';
import {
  Alert,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { YellPay } = NativeModules;

interface SafeWorkflowState {
  currentStep: number;
  completedSteps: boolean[];
  isLoading: boolean;
  userId: string | null;
  logs: string[];
}

export const YellPaySafeWorkflow: React.FC = () => {
  const [state, setState] = useState<SafeWorkflowState>({
    currentStep: 0,
    completedSteps: new Array(8).fill(false),
    isLoading: false,
    userId: null,
    logs: [],
  });

  const addLog = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp} - ${isError ? '❌' : '✅'} ${message}`;
    setState(prev => ({
      ...prev,
      logs: [logEntry, ...prev.logs].slice(0, 20), // Keep last 20 logs
    }));
  };

  const updateStep = (
    stepIndex: number,
    completed: boolean,
    userId?: string
  ) => {
    setState(prev => {
      const newCompleted = [...prev.completedSteps];
      newCompleted[stepIndex] = completed;
      return {
        ...prev,
        completedSteps: newCompleted,
        currentStep: completed ? stepIndex + 1 : stepIndex,
        userId: userId || prev.userId,
        isLoading: false,
      };
    });
  };

  const executeStep = async (
    stepIndex: number,
    stepName: string,
    stepFunction: () => Promise<any>
  ) => {
    if (state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));
    addLog(`Starting: ${stepName}`);

    try {
      const result = await Promise.race([
        stepFunction(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Operation timed out')), 30000)
        ),
      ]);

      addLog(`Completed: ${stepName}`);

      // Extract userId if returned
      let userId = state.userId;
      if (typeof result === 'string' && result.length > 0) {
        userId = result;
      }

      updateStep(stepIndex, true, userId);
      return result;
    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      addLog(`Failed: ${stepName} - ${errorMsg}`, true);
      setState(prev => ({ ...prev, isLoading: false }));

      Alert.alert(`${stepName} Failed`, errorMsg, [
        { text: 'OK', style: 'default' },
        {
          text: 'Retry',
          onPress: () => executeStep(stepIndex, stepName, stepFunction),
        },
      ]);
      throw error;
    }
  };

  const steps = [
    {
      name: 'Framework Check',
      description: 'Verify YellPay SDK is loaded',
      function: () => YellPay.checkFrameworkAvailability(),
    },
    {
      name: 'Get Configuration',
      description: 'Load production settings',
      function: () => YellPay.getProductionConfig(),
    },
    {
      name: 'Auth Register',
      description: 'Register authentication key (UI will appear)',
      function: () => YellPay.authRegisterProduction(),
    },
    {
      name: 'Auth Approval',
      description: 'Approve authentication (UI will appear)',
      function: () => YellPay.authApprovalProduction(),
    },
    {
      name: 'Auto Auth Register',
      description: 'Auto register with user info',
      function: () => YellPay.autoAuthRegisterProduction('safe_user_123'),
    },
    {
      name: 'Auto Auth Approval',
      description: 'Auto approve authentication',
      function: () => YellPay.autoAuthApprovalProduction(),
    },
    {
      name: 'Initialize User',
      description: 'Initialize payment user',
      function: () => YellPay.initUserProduction(),
    },
    {
      name: 'Register Card',
      description: 'Register payment card',
      function: () =>
        state.userId
          ? YellPay.registerCard(state.userId, 0, state.userId)
          : Promise.reject(new Error('No user ID available')),
    },
  ];

  const runSingleStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    executeStep(stepIndex, step.name, step.function);
  };

  const runAllSteps = async () => {
    for (let i = 0; i < steps.length; i++) {
      if (state.completedSteps[i]) continue; // Skip completed steps

      try {
        await executeStep(i, steps[i].name, steps[i].function);
        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        addLog(`Stopped at step ${i + 1}: ${steps[i].name}`, true);
        break;
      }
    }
  };

  const resetWorkflow = () => {
    setState({
      currentStep: 0,
      completedSteps: new Array(8).fill(false),
      isLoading: false,
      userId: null,
      logs: [],
    });
  };

  const clearLogs = () => {
    setState(prev => ({ ...prev, logs: [] }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>YellPay Safe Workflow</Text>
        <Text style={styles.subtitle}>
          Simplified workflow with crash protection and better error handling
        </Text>

        {state.userId && (
          <View style={styles.userIdContainer}>
            <Text style={styles.userIdLabel}>User ID:</Text>
            <Text style={styles.userIdValue}>{state.userId}</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.runAllButton]}
          onPress={runAllSteps}
          disabled={state.isLoading}
        >
          <Text style={styles.buttonText}>
            {state.isLoading ? 'Running...' : 'Run All Steps'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetWorkflow}
          disabled={state.isLoading}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>Workflow Steps</Text>

        {steps.map((step, index) => {
          const isCompleted = state.completedSteps[index];
          const isCurrent = state.currentStep === index;
          const isDisabled = index > 0 && !state.completedSteps[index - 1];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepButton,
                isCompleted && styles.stepCompleted,
                isCurrent && styles.stepCurrent,
                isDisabled && styles.stepDisabled,
              ]}
              onPress={() => runSingleStep(index)}
              disabled={state.isLoading || isDisabled}
            >
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepName}>{step.name}</Text>
                <Text style={styles.stepStatus}>
                  {isCompleted ? '✅' : isCurrent ? '🔄' : '⭕'}
                </Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>Logs ({state.logs.length})</Text>
          <TouchableOpacity style={styles.clearLogsButton} onPress={clearLogs}>
            <Text style={styles.clearLogsText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {state.logs.length === 0 ? (
          <Text style={styles.noLogs}>No logs yet</Text>
        ) : (
          state.logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
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
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  userIdLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  userIdValue: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  runAllButton: {
    backgroundColor: '#007AFF',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stepsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  stepButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCompleted: {
    borderLeftColor: '#34C759',
  },
  stepCurrent: {
    borderLeftColor: '#007AFF',
  },
  stepDisabled: {
    opacity: 0.5,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
    minWidth: 20,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  stepStatus: {
    fontSize: 16,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 32,
  },
  logsContainer: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearLogsButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearLogsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
});
