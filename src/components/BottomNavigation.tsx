import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

interface BottomNavigationProps {
  onPress?: () => void;
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  height?: number;
  borderRadius?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onPress,
  disabled = false,
  backgroundColor = colors.wt,
  textColor = colors.gr5,
  height = 70,
  borderRadius = 20,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
      style={{
        backgroundColor: colors.whtShadow,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <View
        style={{
          backgroundColor,
          height,
          justifyContent: 'center',
          paddingHorizontal: 22,
          elevation: 5,
          borderRadius: borderRadius,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <HStack justifyContent="space-between">
          <HStack justifyContent="space-between" space="md">
            <TouchableOpacity
              onPress={() => setActiveIndex(0)}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 0
                      ? require('../../assets/images/home-selected.png')
                      : require('../../assets/images/home.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 0 ? colors.rd : textColor,
                  }}
                >
                  HOME
                </Text>
              </VStack>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveIndex(1)}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 1
                      ? require('../../assets/images/easy-login-selected.png')
                      : require('../../assets/images/easy-login.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 1 ? colors.rd : textColor,
                  }}
                >
                  簡単ログイン
                </Text>
              </VStack>
            </TouchableOpacity>
          </HStack>
          <View>
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: '50%',
                transform: [{ translateX: '-50%' }],
                top: -40,
                borderRadius: 50,
                height: 58,
                width: 58,
                elevation: 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LinearGradient
                colors={['#D5242A', '#F7575D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={{
                  position: 'absolute',
                  borderRadius: 100,
                  height: 58,
                  width: 58,
                }}
              />
              {/* Additional gradient layer for more radial effect */}
              <LinearGradient
                colors={['#D5242A', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={{
                  position: 'absolute',
                  borderRadius: 100,
                  height: 58,
                  width: 58,
                  top: 0,
                }}
              />
              <Image
                source={require('../../assets/images/card-payment.png')}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
            <Text
              sx={{
                ...textStyle.H_W6_12,
                color: textColor,
                textAlign: 'center',
                marginTop: 21,
                zIndex: 100,
              }}
            >
              支払う
            </Text>
          </View>
          <HStack justifyContent="space-between" width="33.3333333333%">
            <TouchableOpacity
              onPress={() => setActiveIndex(2)}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 2
                      ? require('../../assets/images/notification-selected.png')
                      : require('../../assets/images/notification.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 2 ? colors.rd : textColor,
                  }}
                >
                  お知らせ
                </Text>
              </VStack>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveIndex(3)}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 3
                      ? require('../../assets/images/settings-selected.png')
                      : require('../../assets/images/settings.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 3 ? colors.rd : textColor,
                  }}
                >
                  設定
                </Text>
              </VStack>
            </TouchableOpacity>
          </HStack>
        </HStack>
      </View>
    </TouchableOpacity>
  );
};
