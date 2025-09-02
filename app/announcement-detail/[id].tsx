import {
  Divider,
  HStack,
  Icon,
  SafeAreaView,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const AnnouncementDetail = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, paddingBottom: 100 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: 'システムメンテナンス終了',
            headerShown: true,
            headerTitle: 'システムメンテナンス終了',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Roboto Medium',
              fontWeight: '600',
              fontSize: 18,
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Icon as={ChevronLeft} color={colors.rd} size="lg" />
              </TouchableOpacity>
            ),
          }}
        />
        <VStack paddingHorizontal={16} paddingVertical={24}>
          <VStack>
            <HStack alignItems="center" gap={12} mb={8}>
              <Text sx={{ ...textStyle.R_16_R, color: colors.gr5 }}>
                2022.12.01
              </Text>
              <Text
                sx={{
                  ...textStyle.H_W3_13,
                  color: colors.rd,
                  borderWidth: 1,
                  borderColor: colors.rd,
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 20,
                }}
              >
                メンテナンス
              </Text>
            </HStack>
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.gr1,
                maxWidth: '94%',
              }}
            >
              2022年11月30日から12月01日：システムメンテナンスのお知らせ
            </Text>
          </VStack>
          <Divider my={24} />
          <Text
            sx={{
              ...textStyle.H_W3_15,
              color: colors.gr2,
            }}
          >
            以下のシステムメンテナンスは{'\n'}
            2022年12月01日（木）4:30頃に完了いたしました。
            ご協力いただき、ありがとうございました。{'\n'}
            {'\n'}
            なお、アプリでメンテナンス表示が消えない場合は、アプリをいったん終了し、再度起動をお願いいたします。
            下記の時間帯でシステムメンテナンスを実施するため、全機能のご利用ができなくなります。
            {'\n'} {'\n'}
            ■メンテナンス期間
            {'\n'}
            2022年12月7日（水）1:30から4:30まで
            {'\n'}
            {'\n'}
            ※メンテナンス時間は、前後する場合があります。
            ※時間は24時間表記です。
            {'\n'}
            {'\n'}
            お客様にはご不便をおかけしますが、ご理解のほどお願いいたします。
          </Text>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnnouncementDetail;
