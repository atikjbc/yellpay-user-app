import {
  Divider,
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

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, paddingBottom: 100 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: 'プライバシーポリシー',
            headerShown: true,
            headerTitle: 'プライバシーポリシー',
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
          <Text
            sx={{
              ...textStyle.H_W6_18,
              color: colors.gr2,
            }}
          >
            設定
          </Text>
          <Divider my={24} />
          <Text
            sx={{
              ...textStyle.H_W3_15,
              color: colors.gr2,
            }}
          >
            Mauris quis orci faucibus, egestas nibh sed vestibulum elit. Nam est
            dui, accumsan a lorem tincidunt, pellentesque pulvinar lorem.Mauris
            quis orci faucibus, egestas nibh sed{'\n'}
            vestibulum elit. Nam est dui, accumsan a lorem tincidunt,
            pellentesque pulvinar lorem.Mauris quis orci faucibus, egestas nibh
            sed vestibulum elit. Nam est dui, accumsan a lorem tincidunt,
            pellentesque pulvinar lorem.{'\n'}
            Mauris quis orci faucibus, egestas nibh sed vestibulum elit. Nam est
            dui, accumsan a lorem tincidunt, pellentesque pulvinar lorem.Mauris
            quis orci faucibus, egestas nibh sed vestibulum elit. Nam est dui,
            accumsan a lorem tincidunt, pellentesque pulvinar lorem.{'\n'}
            Mauris quis orci faucibus, egestas nibh sed vestibulum elit. Nam est
            dui, accumsan a lorem
          </Text>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
