import { Icon, Image, ScrollView, VStack } from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';

const UserGuidePayment = () => {
  const router = useRouter();
  return (
    <SafeAreaProvider>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, marginBottom: 24 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: 'はじめてガイド',
            headerShown: true,
            headerTitle: 'はじめてガイド',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Hiragino Sans Bold',
              fontWeight: 600,
              fontSize: 18,
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Icon
                  as={ChevronLeft}
                  size="lg"
                  fontWeight={600}
                  color={colors.rd}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <VStack
          paddingHorizontal={16}
          justifyContent="center"
          alignItems="center"
        >
          <Image
            source={require('../../assets/images/user-guide-payment-1.png')}
            alt="user-guide-payment"
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 343 / 750,
            }}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/user-guide-payment-2.png')}
            alt="user-guide-payment"
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 343 / 980,
            }}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/user-guide-payment-3.png')}
            alt="user-guide-payment"
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 343 / 1270,
            }}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/user-guide-payment-4.png')}
            alt="user-guide-payment"
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 343 / 1280,
            }}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/user-guide-payment-footer.png')}
            alt="user-guide-payment"
            width={149}
            height={98}
            resizeMode="contain"
          />
        </VStack>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default UserGuidePayment;
