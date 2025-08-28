import { Button, Center, Heading, Image, Text } from '@gluestack-ui/themed';
import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

export type OnboardingSlideProps = {
  topImage: { source: ImageSourcePropType; width: number; height: number };
  logoImage?: { source: ImageSourcePropType; width: number; height: number };
  titlePrimary: { text: string; color?: string };
  titleSecondary?: { text: string; color?: string };
  description: React.ReactNode;
  button: {
    text: string;
    variant?: 'outline' | 'solid';
    onPress: () => void;
    bg?: string;
    color?: string;
  };
};

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  topImage,
  logoImage,
  titlePrimary,
  titleSecondary,
  description,
  button,
}) => {
  return (
    <Center height="100%" width="100%">
      <Image
        source={topImage.source}
        width={topImage.width}
        height={topImage.height}
        alt="Onboarding"
      />

      {logoImage ? (
        <Image
          mt="$3"
          source={logoImage.source}
          width={logoImage.width}
          height={logoImage.height}
          alt="Logo"
        />
      ) : null}

      <Heading
        sx={{
          mt: '$5',
          ...textStyle.H_W6_20,
          color: titlePrimary.color ?? colors.rd,
          textAlign: 'center',
        }}
      >
        {titlePrimary.text}
      </Heading>

      {titleSecondary ? (
        <Heading
          sx={{
            ...textStyle.H_W6_20,
            color: titleSecondary.color ?? colors.rd,
            textAlign: 'center',
          }}
        >
          {titleSecondary.text}
        </Heading>
      ) : null}

      <Text
        sx={{
          mt: '$6',
          px: '$4',
          ...textStyle.H_W3_15,
          textAlign: 'center',
        }}
      >
        {description}
      </Text>

      <Button
        mt="$24"
        variant={button.variant ?? 'outline'}
        sx={{
          borderColor: colors.rd,
          backgroundColor:
            button.variant === 'solid'
              ? (button.bg ?? colors.rd)
              : 'transparent',
          borderRadius: 10,
          paddingHorizontal: 24,
          paddingVertical: 12,
          width: '100%',
          height: 52,
          boxShadow: '0px 0px 10px 0px #D5242A4F',
        }}
        onPress={button.onPress}
      >
        <Text
          sx={{
            ...textStyle.H_W6_15,
            color:
              button.color ??
              (button.variant === 'solid' ? colors.wt : colors.rd),
          }}
        >
          {button.text}
        </Text>
      </Button>
    </Center>
  );
};

export default OnboardingSlide;
