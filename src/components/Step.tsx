import { HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import React from 'react';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

export interface StepItem {
  id: string | number;
  label: string;
  isVisited?: boolean;
  isActive?: boolean;
}

export interface StepProps {
  steps: StepItem[];
  currentStep?: number;
  style?: any;
}

const Step: React.FC<StepProps> = ({ steps, currentStep = 0, style }) => {
  const getStepBackgroundColor = (index: number, step: StepItem) => {
    if (step.isVisited) {
      return colors.rd; // Red background for visited
    }
    if (step.isActive || index === currentStep) {
      return colors.wt; // White background for active
    }
    return colors.gr3; // Gray background for never visited
  };

  const getStepTextColor = (index: number, step: StepItem) => {
    if (step.isVisited) {
      return colors.wt; // White text for visited
    }
    if (step.isActive || index === currentStep) {
      return colors.rd; // Red text for active
    }
    return colors.wt; // White text for never visited
  };

  const getStepBorderColor = (index: number, step: StepItem) => {
    if (step.isActive || index === currentStep) {
      return colors.rd; // Red border for active
    }
    return 'transparent';
  };

  const getLabelColor = (index: number, step: StepItem) => {
    if (step.isVisited || step.isActive || index === currentStep) {
      return colors.bl; // Black text for visited/active
    }
    return colors.gr3; // Gray text for never visited
  };

  const getConnectorColor = (index: number) => {
    if (index < steps.length - 1) {
      const currentStepData = steps[index];
      const nextStepData = steps[index + 1];

      if (currentStepData.isVisited || nextStepData.isVisited) {
        return colors.rd; // Red connector if any connected step is visited
      }
      return colors.gr3; // Gray connector otherwise
    }
    return 'transparent';
  };

  return (
    <HStack
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={20}
      paddingVertical={10}
      style={style}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <VStack alignItems="center">
            <Pressable
              width={41}
              height={41}
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              backgroundColor={getStepBackgroundColor(index, step)}
              borderWidth={step.isActive || index === currentStep ? 2 : 0}
              borderColor={getStepBorderColor(index, step)}
              marginBottom={8}
            >
              <Text
                fontSize={14}
                fontWeight="bold"
                color={getStepTextColor(index, step)}
                sx={{ ...textStyle.R_16_R }}
              >
                {index + 1}
              </Text>
            </Pressable>
            <Text
              textAlign="center"
              color={getLabelColor(index, step)}
              sx={{ ...textStyle.H_W6_10 }}
            >
              {step.label}
            </Text>
          </VStack>
          {index < steps.length - 1 && (
            <HStack
              height={2}
              minWidth={60}
              marginHorizontal={5}
              marginBottom={24}
              backgroundColor={getConnectorColor(index)}
            />
          )}
        </React.Fragment>
      ))}
    </HStack>
  );
};

export default Step;
