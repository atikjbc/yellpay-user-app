import { HStack, Icon, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { Platform, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const RegisterDisableNotebook1 = () => {
  const router = useRouter();
  return (
    <SafeAreaProvider>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, marginBottom: 16 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: '事前確認',
            headerShown: true,
            headerTitle: '事前確認',
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
        <VStack paddingHorizontal={16}>
          <VStack marginVertical={40}>
            <HStack justifyContent="flex-start" paddingHorizontal={24}>
              <Text
                sx={{
                  ...textStyle.H_W3_15,
                  color: colors.gr1,
                  textAlign: 'left',
                }}
              >
                ①
              </Text>
              <Text
                sx={{
                  ...textStyle.H_W3_15,
                  color: colors.gr1,
                  textAlign: 'left',
                }}
              >
                申請書類確認のため、申請から登録まで{'\n'}
                3営業日ほどかかる場合があります。
              </Text>
            </HStack>
            <HStack justifyContent="flex-start" mt={18} paddingHorizontal={24}>
              <Text
                sx={{
                  ...textStyle.H_W3_15,
                  color: colors.gr1,
                  textAlign: 'left',
                }}
              >
                ②
              </Text>
              <Text
                sx={{
                  ...textStyle.H_W3_15,
                  color: colors.gr1,
                  textAlign: 'left',
                }}
              >
                顔写真がない、掲載内容が不鮮明などの{'\n'}
                障がい者手帳は、登録できません。{'\n'}
                ※自治体で再発行の手続きをした上で、{'\n'}
                申請してください。
              </Text>
            </HStack>
            <HStack
              flex={1}
              justifyContent="flex-start"
              mt={18}
              paddingHorizontal={24}
            >
              <Text
                sx={{
                  ...textStyle.H_W3_15,
                  color: colors.gr1,
                  textAlign: 'left',
                }}
              >
                ③
              </Text>
              <Text
                sx={{
                  ...textStyle.H_W3_15,
                  color: colors.gr1,
                  textAlign: 'left',
                }}
              >
                1つのアカウントにつき、{'\n'}
                1名分の障がい者手帳を登録できます 申請してください。
              </Text>
            </HStack>
          </VStack>
          <TouchableOpacity
            onPress={() => {
              router.push('/register-disable-notebook-2');
            }}
            style={{
              borderRadius: 10,
              height: 56,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
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
            }}
          >
            <LinearGradient
              colors={['#F6575D', '#D5242A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={{
                position: 'absolute',
                borderRadius: 10,
                height: 56,
                width: '100%',
              }}
            />
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.wt1,
              }}
            >
              申請へ進む
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default RegisterDisableNotebook1;
