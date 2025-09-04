import { Icon, SafeAreaView, ScrollView, VStack } from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import RouteSdkDemo from '../../src/components/RouteSdkDemo';
import { colors } from '../../src/theme/colors';

const TermsOfServices = () => {
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
          <RouteSdkDemo />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfServices;
