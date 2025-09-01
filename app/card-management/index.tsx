import {
  Icon,
  Image,
  ScrollView,
  Text,
  View,
  VStack,
} from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CardListItem } from '../../src/components';
import CustomModal from '../../src/components/CustomModal';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

interface CardInterface {
  cardType: string;
  cardName: string;
  cardNumber: string;
  expiryDate: string;
}

const CardManagement = () => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const defaultModal = () => {
    return (
      <VStack
        alignItems="center"
        justifyContent="center"
        paddingVertical={40}
        paddingHorizontal={24}
      >
        <Image
          source={require('../../assets/images/success-logo.png')}
          style={{ width: 64, height: 64 }}
          alt="success-logo"
        />
        <Text
          sx={{
            ...textStyle.H_W6_15,
            color: colors.gr1,
            mt: 32,
            mb: 40,
            textAlign: 'center',
          }}
        >
          メインカードの変更が完了しました
        </Text>
        <TouchableOpacity
          onPress={() => {
            setModalTitle('');
            setModalContent(null);
            setIsModalVisible(false);
          }}
          style={{
            borderRadius: 10,
            height: 48,
            width: '100%',
            elevation: 3,
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
            閉じる
          </Text>
        </TouchableOpacity>
      </VStack>
    );
  };
  const deleteModal = () => {
    return (
      <VStack
        alignItems="center"
        justifyContent="center"
        paddingVertical={40}
        paddingHorizontal={24}
      >
        <Image
          source={require('../../assets/images/success-logo.png')}
          style={{ width: 64, height: 64 }}
          alt="success-logo"
        />
        <Text
          sx={{
            ...textStyle.H_W6_15,
            color: colors.gr1,
            mt: 32,
            mb: 40,
            textAlign: 'center',
          }}
        >
          カード情報が削除されました。
        </Text>
        <TouchableOpacity
          onPress={() => {
            setModalTitle('');
            setModalContent(null);
            setIsModalVisible(false);
          }}
          style={{
            borderRadius: 10,
            height: 48,
            width: '100%',
            elevation: 3,
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
            閉じる
          </Text>
        </TouchableOpacity>
      </VStack>
    );
  };
  const cardDetailModal = (card: CardInterface) => {
    return (
      <View paddingVertical={40}>
        <CardListItem
          cardType={card?.cardType}
          cardName={card?.cardName}
          cardNumber={card?.cardNumber}
          expiryDate={card?.expiryDate}
          isModal
        />
        <VStack mt={36} gap={16}>
          <TouchableOpacity
            onPress={() => {
              setModalTitle('メインカードに設定');
              setIsModalVisible(true);
              setModalContent(defaultModal());
            }}
            style={{
              borderRadius: 10,
              height: 48,
              width: '100%',
              elevation: 3,
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
              メインカードに設定
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalTitle('カードを削除');
              setIsModalVisible(true);
              setModalContent(deleteModal());
            }}
            style={{
              borderRadius: 10,
              height: 48,
              width: '100%',
              elevation: 3,
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
              カードを削除
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsModalVisible(false)}
            style={{
              borderRadius: 10,
              height: 48,
              width: '100%',
              borderWidth: 1,
              borderColor: colors.rd,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.rd,
              }}
            >
              キャンセル
            </Text>
          </TouchableOpacity>
        </VStack>
      </View>
    );
  };
  return (
    <SafeAreaProvider>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, marginBottom: 24 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: 'カード管理',
            headerShown: true,
            headerTitle: 'カード管理',
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
        <CustomModal
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
          title={modalTitle}
        >
          {modalContent}
        </CustomModal>
        <View px={16} py={24}>
          <CardListItem
            cardType="visa"
            cardName="Visa Platinum Card"
            cardNumber="****2362"
            expiryDate="00/00"
            isDefault
            onPress={() => {
              setIsModalVisible(true);
              setModalTitle('メインカードに設定');
              setModalContent(
                cardDetailModal({
                  cardType: 'visa',
                  cardName: 'Visa Platinum Card',
                  cardNumber: '****2362',
                  expiryDate: '00/00',
                })
              );
            }}
          />
          <CardListItem
            cardType="mastercard"
            cardName="Mastercard Platinum Card"
            cardNumber="****2362"
            expiryDate="00/00"
            onPress={() => {
              setIsModalVisible(true);
              setModalTitle('メインカードに設定');
              setModalContent(
                cardDetailModal({
                  cardType: 'mastercard',
                  cardName: 'Mastercard Platinum Card',
                  cardNumber: '****2362',
                  expiryDate: '00/00',
                })
              );
            }}
          />
          <CardListItem
            cardType="jcb"
            cardName="JCB Platinum Card"
            cardNumber="****2362"
            expiryDate="00/00"
            onPress={() => {
              setIsModalVisible(true);
              setModalTitle('カードを削除');
              setModalContent(
                cardDetailModal({
                  cardType: 'jcb',
                  cardName: 'JCB Platinum Card',
                  cardNumber: '****2362',
                  expiryDate: '00/00',
                })
              );
            }}
          />
          <TouchableOpacity
            onPress={() => {
              router.push('/card-registration');
            }}
            style={{
              marginHorizontal: 16,
              marginVertical: 16,
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderRadius: 10,
              height: 56,
              borderWidth: 2,
              borderColor: colors.rd,
              alignItems: 'center',
              justifyContent: 'flex-start',
              flexDirection: 'row',
              gap: 6,
            }}
          >
            <Icon
              as={Plus}
              size="lg"
              fontWeight={600}
              color={colors.rd}
              mt={2}
            />
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.rd,
              }}
            >
              新しいクレジットカードを追加
            </Text>
          </TouchableOpacity>
          {/* <CardListItem
            cardType="amex"
            cardName="American Express Platinum Card"
            cardNumber="****2362"
            expiryDate="00/00"
          />
          <CardListItem
            cardType="diners"
            cardName="Diners Club Platinum Card"
            cardNumber="****2362"
            expiryDate="00/00"
          />
          <CardListItem
            cardName="Visa Card"
            cardNumber="****2362"
            expiryDate="00/00"
          /> */}
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default CardManagement;
