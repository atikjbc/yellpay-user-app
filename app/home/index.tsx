import { ScrollView, VStack } from '@gluestack-ui/themed';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Card from '../../src/components/Card';
import { colors } from '../../src/theme/colors';

const Home = () => {
  return (
    <ScrollView style={{ backgroundColor: colors.wt, flex: 1 }}>
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
        }}
      />
      <VStack backgroundColor={colors.gr4}>
        <Card cardType="visa" />
        <Card cardType="mastercard" />
        <Card cardType="jcb" />
        <Card cardType="amex" />
        <Card cardType="diners" />
        <Card />
      </VStack>
    </ScrollView>
  );
};

export default Home;
