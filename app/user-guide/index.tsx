import {
  HStack,
  Icon,
  Image,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const UserGuide = () => {
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
        <TouchableOpacity onPress={() => router.push('/user-guide-payment')}>
          <VStack paddingHorizontal={16} paddingVertical={40}>
            <VStack
              backgroundColor={colors.gr}
              paddingHorizontal={16}
              paddingVertical={24}
              borderRadius={10}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                mr={16}
              >
                <VStack>
                  <HStack gap={11} alignItems="center">
                    <Image
                      source={require('../../assets/images/user-guide-card.png')}
                      alt="user-guide-1"
                      width={23}
                      height={23}
                    />
                    <Text sx={{ ...textStyle.H_W6_18, color: colors.gr1 }}>
                      決済機能
                    </Text>
                  </HStack>

                  <Text
                    sx={{ ...textStyle.H_W6_14, color: colors.gr1, mt: 16 }}
                  >
                    クレジットカードを登録すると、スマホで安心・簡単決済。障がい者手帳も合わせて登録し、支払い時に割引も自動的に割引も適用されます。
                  </Text>
                </VStack>
                <Icon as={ChevronRight} color={colors.rd} />
              </HStack>
            </VStack>
          </VStack>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/user-guide-login')}>
          <VStack paddingHorizontal={16}>
            <VStack
              backgroundColor={colors.gr}
              paddingHorizontal={16}
              paddingVertical={24}
              borderRadius={10}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                mr={16}
              >
                <VStack>
                  <HStack gap={11} alignItems="center">
                    <Image
                      source={require('../../assets/images/easy-login-selected.png')}
                      alt="user-guide-1"
                      width={23}
                      height={23}
                    />
                    <Text sx={{ ...textStyle.H_W6_18, color: colors.gr1 }}>
                      認証ログイン機能
                    </Text>
                  </HStack>

                  <Text
                    sx={{ ...textStyle.H_W6_14, color: colors.gr1, mt: 16 }}
                  >
                    「認証キー」という鍵を作成し、対応するサービスにおいてID/Password不要の安心手軽なログイン・認証を実現します。
                  </Text>
                </VStack>
                <Icon as={ChevronRight} color={colors.rd} />
              </HStack>
            </VStack>
          </VStack>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default UserGuide;
