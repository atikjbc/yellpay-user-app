import { HStack, Icon, Text, View, VStack } from '@gluestack-ui/themed';
import { Ellipsis } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';
import Card from './Card';

interface CardListItemProps {
  cardType?: string;
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  isDefault?: boolean;
  onPress?: () => void;
  isModal?: boolean;
}

const CardListItem = ({
  cardType,
  cardName,
  cardNumber,
  expiryDate,
  isDefault,
  onPress,
  isModal,
}: CardListItemProps) => {
  return (
    <VStack gap={16} position="relative">
      {!isModal && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.wt,
            position: 'absolute',
            right: 24,
            top: 28,
            zIndex: 999,
            padding: 2,
            borderRadius: 20,
          }}
          onPress={onPress}
        >
          <Icon as={Ellipsis} size="lg" fontWeight={600} color={colors.rd} />
        </TouchableOpacity>
      )}
      <HStack
        backgroundColor={isModal ? colors.wt : colors.gr}
        pb={isModal ? 0 : 24}
        mt={isModal ? 0 : 24}
        mx={isModal ? 0 : 16}
        alignItems="flex-start"
        paddingHorizontal={isModal ? 0 : 16}
        paddingVertical={isModal ? 0 : 24}
        borderRadius={10}
        gap={16}
      >
        <View width={122} height={66}>
          <Card cardType={cardType} isSmall />
        </View>
        <VStack flex={1} gap={8}>
          {isDefault && (
            <View
              sx={{
                backgroundColor: colors.wt,
                borderWidth: 2,
                borderColor: colors.rd,
                width: 106,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text
                sx={{
                  ...textStyle.H_W3_13,
                  color: colors.rd,
                }}
              >
                メインカード
              </Text>
            </View>
          )}
          <Text
            sx={{
              ...textStyle.H_W6_13,
              color: colors.gr1,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{
              flexWrap: 'wrap',
              flexShrink: 1,
            }}
          >
            {cardName}
          </Text>
          <HStack gap={14} flexWrap="wrap">
            <Text
              sx={{ ...textStyle.R_16_M, color: colors.gr1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {cardNumber}
            </Text>
            <Text
              sx={{ ...textStyle.R_16_M, color: colors.gr1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {expiryDate}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default CardListItem;
