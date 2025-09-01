import { Icon, Image, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const UserGuideLogin = () => {
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
          <VStack justifyContent="center" alignItems="center">
            <Image
              source={require('../../assets/images/login-guide-logo.png')}
              alt="user-guide-login"
              height={48}
              width={48}
              resizeMode="contain"
              style={{
                marginVertical: 24,
              }}
            />
            <Text sx={{ ...textStyle.H_W6_18, color: colors.rd, mb: 16 }}>
              認証ログインの使い方
            </Text>
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr1,
                textAlign: 'center',
                mb: 16,
              }}
            >
              Yell Payではアプリ内に「認証キー」{'\n'}
              という鍵を作成し、対応するサービスにおいて{'\n'}
              ID/Password不要の安心手軽な{'\n'}
              ログイン・認証を実現します。
            </Text>
            <Text
              sx={{
                ...textStyle.H_W3_13,
                color: colors.gr1,
                textAlign: 'center',
                mb: 32,
              }}
            >
              ※Yell PayはunID認証サービスの{'\n'}
              「認証ユニバーサルキー機能」対応アプリの一つです。
            </Text>
          </VStack>
          <Image
            source={require('../../assets/images/user-guide-login-1.png')}
            alt="user-guide-payment"
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 343 / 1200,
            }}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/user-guide-login-2.png')}
            alt="user-guide-payment"
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 343 / 1100,
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

export default UserGuideLogin;
