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

interface WorkflowState {
  step: number;
  userId: string | null;
  isLoading: boolean;
  completedSteps: Set<number>;
  errors: { [key: number]: string };
}

interface StepResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const YellPayWorkflow: React.FC = () => {
  const [state, setState] = useState<WorkflowState>({
    step: 0,
    userId: null,
    isLoading: false,
    completedSteps: new Set(),
    errors: {},
  });

  console.log('state', state);

  const updateState = (updates: Partial<WorkflowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const markStepCompleted = (stepNum: number, result?: any) => {
    const newCompleted = new Set(state.completedSteps);
    newCompleted.add(stepNum);
    const newErrors = { ...state.errors };
    delete newErrors[stepNum];

    updateState({
      completedSteps: newCompleted,
      errors: newErrors,
      isLoading: false,
    });

    if (result?.userId) {
      updateState({ userId: result.userId });
    }
  };

  const markStepFailed = (stepNum: number, error: string) => {
    const newErrors = { ...state.errors };
    newErrors[stepNum] = error;

    updateState({
      errors: newErrors,
      isLoading: false,
    });
  };

  const executeStep = async (
    stepNum: number,
    stepFn: () => Promise<any>
  ): Promise<StepResult> => {
    updateState({ isLoading: true, step: stepNum });

    try {
      console.log(`🔄 Executing step ${stepNum}`);
      const result = await stepFn();
      console.log(`✅ Step ${stepNum} completed:`, result);

      markStepCompleted(stepNum, result);
      return { success: true, data: result };
    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      console.error(`❌ Step ${stepNum} failed:`, errorMsg);

      markStepFailed(stepNum, errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const steps = [
    {
      id: 0,
      title: '🔍 Framework Check',
      description: 'Verify RouteCode SDK is loaded',
      action: () => executeStep(0, () => YellPay.checkFrameworkAvailability()),
      enabled: true,
    },
    {
      id: 1,
      title: '⚙️ Get Configuration',
      description: 'Load production settings',
      action: () => executeStep(1, () => YellPay.getProductionConfig()),
      enabled: state.completedSteps.has(0),
    },
    {
      id: 2,
      title: '📝 Register Authentication',
      description: 'Register authentication key (requires user interaction)',
      action: () =>
        executeStep(2, async () => {
          try {
            const result = await YellPay.authRegisterProduction();
            return result;
          } catch (error: any) {
            if (
              error.message.includes('cancelled') ||
              error.message.includes('canceled')
            ) {
              throw new Error(
                'Authentication registration was cancelled. Please complete the registration process in the UI that appears.'
              );
            }
            throw error;
          }
        }),
      enabled: state.completedSteps.has(1),
    },
    {
      id: 3,
      title: '✅ Approve Authentication',
      description:
        'Complete authentication approval (requires user interaction)',
      action: () =>
        executeStep(3, async () => {
          try {
            const result = await YellPay.authApprovalProduction();
            return result;
          } catch (error: any) {
            if (
              error.message.includes('key not found') ||
              error.message.includes('key is missing')
            ) {
              throw new Error(
                'Authentication key missing. Please go back and complete step 2 (Register Authentication) properly.'
              );
            }
            if (
              error.message.includes('cancelled') ||
              error.message.includes('canceled')
            ) {
              throw new Error(
                'Authentication approval was cancelled. Please complete the approval process in the UI that appears.'
              );
            }
            throw error;
          }
        }),
      enabled: state.completedSteps.has(2),
    },
    {
      id: 4,
      title: '🔑 Auto Register',
      description: 'Auto register with user info',
      action: () =>
        executeStep(4, () =>
          YellPay.autoAuthRegisterProduction('test_user_123')
        ),
      enabled: state.completedSteps.has(3),
    },
    {
      id: 5,
      title: '🔓 Auto Approve',
      description: 'Auto approve and get user info',
      action: () => executeStep(5, () => YellPay.autoAuthApprovalProduction()),
      enabled: state.completedSteps.has(4),
    },
    {
      id: 6,
      title: '✅ Validate Authentication',
      description: 'Verify authentication is complete',
      action: () =>
        executeStep(6, () => YellPay.validateAuthenticationStatus()),
      enabled: state.completedSteps.has(5),
    },
    {
      id: 7,
      title: '👤 Initialize User',
      description: 'Initialize payment user',
      action: () =>
        executeStep(7, async () => {
          const result = await YellPay.initUserProduction();
          setState({ ...state, userId: result });
          return result;
        }),
      enabled: state.completedSteps.has(6),
    },
    {
      id: 8,
      title: '💳 Register Card',
      description: 'Register payment card',
      action: () =>
        executeStep(8, () =>
          state.userId
            ? YellPay.registerCard(state.userId, 0, state.userId)
            : Promise.reject(new Error('No userId available'))
        ),
      enabled: state.completedSteps.has(7) && !!state.userId,
    },
    {
      id: 9,
      title: '💰 Test Payment',
      description: 'Make a test payment',
      action: () =>
        executeStep(9, () =>
          state.userId
            ? YellPay.makePayment(state.userId, 0, state.userId)
            : Promise.reject(new Error('No userId available'))
        ),
      enabled: state.completedSteps.has(8) && !!state.userId,
    },
  ];

  const getStepStatus = (stepId: number) => {
    if (state.completedSteps.has(stepId)) return 'completed';
    if (state.errors[stepId]) return 'error';
    if (state.step === stepId && state.isLoading) return 'loading';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      case 'loading':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const runAllSteps = async () => {
    for (const step of steps) {
      if (!step.enabled) continue;

      const result = await step.action();
      if (!result.success) {
        Alert.alert(
          'Workflow Stopped',
          `Step "${step.title}" failed: ${result.error}\n\nPlease fix this step before continuing.`
        );
        break;
      }

      // Small delay between steps for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const resetWorkflow = () => {
    setState({
      step: 0,
      userId: null,
      isLoading: false,
      completedSteps: new Set(),
      errors: {},
    });
  };

  const resetFromAuthentication = () => {
    // Reset from authentication step while keeping framework/config steps
    const keepSteps = new Set([0, 1]); // Keep framework check and config
    const newCompleted = new Set<number>();
    keepSteps.forEach(step => {
      if (state.completedSteps.has(step)) {
        newCompleted.add(step);
      }
    });

    setState({
      step: 2,
      userId: null,
      isLoading: false,
      completedSteps: newCompleted,
      errors: {},
    });
  };

  const retryStep = async (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    // Clear error for this step
    const newErrors = { ...state.errors };
    delete newErrors[stepId];
    updateState({ errors: newErrors });

    // Execute the step
    await step.action();
  };

  const getOverallProgress = () => {
    return Math.round((state.completedSteps.size / steps.length) * 100);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>YellPay Integration Workflow</Text>
        <Text style={styles.subtitle}>
          Follow this step-by-step process to properly integrate YellPay
        </Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {state.completedSteps.size}/{steps.length} (
            {getOverallProgress()}%)
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getOverallProgress()}%` },
              ]}
            />
          </View>
        </View>

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
          <Text style={styles.buttonText}>Reset All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetAuthButton]}
          onPress={resetFromAuthentication}
          disabled={state.isLoading || state.completedSteps.size < 2}
        >
          <Text style={styles.buttonText}>Reset Auth</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map(step => {
          const status = getStepStatus(step.id);
          const color = getStepColor(status);

          return (
            <View key={step.id} style={styles.stepContainer}>
              <TouchableOpacity
                style={[
                  styles.stepButton,
                  !step.enabled && styles.stepButtonDisabled,
                  { borderLeftColor: color },
                ]}
                onPress={step.action}
                disabled={!step.enabled || state.isLoading}
              >
                <View style={styles.stepHeader}>
                  <Text style={[styles.stepTitle, { color }]}>
                    {step.title}
                  </Text>
                  <View
                    style={[styles.statusIndicator, { backgroundColor: color }]}
                  >
                    <Text style={styles.statusText}>
                      {status === 'completed'
                        ? '✓'
                        : status === 'error'
                          ? '✗'
                          : status === 'loading'
                            ? '⟳'
                            : '○'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.stepDescription}>{step.description}</Text>

                {state.errors[step.id] && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      Error: {state.errors[step.id]}
                    </Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => retryStep(step.id)}
                      disabled={state.isLoading}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
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
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
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
  resetAuthButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stepsContainer: {
    padding: 16,
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepButtonDisabled: {
    opacity: 0.5,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorContainer: {
    marginTop: 8,
    backgroundColor: '#fff5f5',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
