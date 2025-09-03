import {
  HStack,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  VStack,
} from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { BannerSlider, BottomNavigation, Card } from '../../src/components';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const Home = () => {
  const router = useRouter();

  const handleCardManagement = () => {
    router.push('/card-management');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, paddingBottom: 100 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: 'Home',
            headerShown: true,
            headerTitle: 'Home',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Roboto Medium',
              fontWeight: '600',
              fontSize: 18,
            },
            headerLeft: () => <></>,
          }}
        />
        <VStack backgroundColor={colors.gr4}>
          <Card cardType="visa" />
          {/* <Card cardType="mastercard" />
          <Card cardType="jcb" />
          <Card cardType="amex" />
          <Card cardType="diners" /> */}
          {/* <Card /> */}
        </VStack>
        <VStack p={16} gap={16}>
          <HStack>
            <TouchableOpacity
              onPress={handleCardManagement}
              activeOpacity={0.8}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                width: '48%',
                backgroundColor: colors.gr4,
                borderRadius: 10,
                marginRight: 11,
              }}
            >
              <Image
                alt="card-management"
                source={require('../../assets/images/card-management.png')}
                style={{ width: 48, height: 52 }}
              />
              <Text
                sx={{
                  ...textStyle.H_W6_13,
                  color: colors.gr1,
                  marginTop: 11,
                  textAlign: 'center',
                }}
              >
                カード管理
              </Text>
            </TouchableOpacity>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                width: '48%',
                backgroundColor: colors.gr4,
                borderRadius: 10,
              }}
            >
              <Image
                alt="transaction-history"
                source={require('../../assets/images/transaction-history.png')}
                style={{ width: 40, height: 40 }}
              />
              <Text
                sx={{
                  ...textStyle.H_W6_13,
                  color: colors.gr1,
                  paddingTop: 18,
                  textAlign: 'center',
                }}
              >
                取引履歴
              </Text>
            </View>
          </HStack>
          <TouchableOpacity
            onPress={() => router.push('/shop-search')}
            activeOpacity={0.8}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              backgroundColor: colors.gr4,
              borderRadius: 10,
            }}
          >
            <Image
              alt="find-store"
              source={require('../../assets/images/find-store.png')}
              style={{ width: 50, height: 35 }}
            />
            <Text
              sx={{
                ...textStyle.H_W6_13,
                color: colors.gr1,
                paddingTop: 18,
                textAlign: 'center',
              }}
            >
              近くの店舗を探す
            </Text>
          </TouchableOpacity>
        </VStack>
        <BannerSlider
          images={[
            '../../assets/images/banner-1.png',
            '../../assets/images/banner-2.png',
          ]}
        />
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default Home;
