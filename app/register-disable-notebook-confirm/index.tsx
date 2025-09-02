import { Image, Text, VStack } from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const RegisterDisableNotebookConfirm = () => {
  const router = useRouter();
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: '申請完了',
          headerShown: true,
          headerTitle: '申請完了 ',
          headerTitleAlign: 'center',

          headerTitleStyle: {
            fontFamily: 'Hiragino Sans Bold',
            fontWeight: 600,
            fontSize: 18,
          },
          headerLeft: () => <></>,
        }}
      />
      <VStack
        alignItems="center"
        justifyContent="center"
        height="100%"
        paddingHorizontal={16}
      >
        <Image
          source={require('../../assets/images/success-logo.png')}
          style={{ width: 64, height: 64 }}
          alt="success-logo"
        />
        <Text
          sx={{
            ...textStyle.H_W6_18,
            color: colors.gr1,
            mt: 32,
            mb: 40,
            textAlign: 'center',
          }}
        >
          手帳登録のお申し込みが完了しました。
        </Text>
        <Text
          sx={{
            ...textStyle.H_W3_15,
            color: colors.gr1,
            textAlign: 'center',
            mb: 16,
          }}
        >
          申請書類確認を行うため、{'\n'}
          3営業日ほどかかる場合があります。
        </Text>
        <Text
          sx={{
            ...textStyle.H_W3_15,
            color: colors.gr1,
            textAlign: 'center',
            mb: 40,
          }}
        >
          登録が完了しましたら、{'\n'}
          アプリにて通知をお送り致しますので、{'\n'}
          プッシュ通知をONにしてお待ちください。
        </Text>
        <TouchableOpacity
          onPress={() => router.dismissTo('/home')}
          style={{
            borderRadius: 10,
            height: 48,
            width: '100%',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: -1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 20,
              },
              android: {
                elevation: 3,
              },
            }),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LinearGradient
            colors={['#F6575D', '#D5242A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={{
              position: 'absolute',
              borderRadius: 10,
              height: 48,
              width: '100%',
            }}
          />
          <Text
            sx={{
              ...textStyle.H_W6_15,
              color: colors.wt1,
            }}
          >
            TOP画面へ
          </Text>
        </TouchableOpacity>
      </VStack>
    </SafeAreaProvider>
  );
};

export default RegisterDisableNotebookConfirm;
