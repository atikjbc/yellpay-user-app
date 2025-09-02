import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

interface RequiredFieldItem {
  text: string;
}

interface RequiredFieldsInfoProps {
  leftItems: RequiredFieldItem[];
  rightItems: RequiredFieldItem[];
}

const RequiredFieldItem = ({ text }: RequiredFieldItem) => (
  <Text
    sx={{
      ...textStyle.H_W6_14,
      color: colors.gr1,
      paddingBottom: 5,
    }}
  >
    <Text sx={{ color: colors.rd }}>・</Text>
    {text}
  </Text>
);

export const RequiredFieldsInfo = ({
  leftItems,
  rightItems,
}: RequiredFieldsInfoProps) => {
  return (
    <VStack
      width="100%"
      sx={{
        borderRadius: 4,
        backgroundColor: colors.lrd,
        padding: 16,
        marginBottom: 8,
      }}
    >
      <Text
        sx={{
          ...textStyle.H_W6_18,
          color: colors.gr1,
          textAlign: 'center',
        }}
      >
        登録に必要な項目
      </Text>
      <Text
        sx={{
          ...textStyle.H_W6_14,
          color: colors.rd,
          paddingTop: 5,
          paddingBottom: 8,
          paddingLeft: 4,
        }}
      >
        必須
      </Text>
      <HStack justifyContent="space-between">
        <VStack>
          {leftItems.map((item, index) => (
            <RequiredFieldItem key={index} text={item.text} />
          ))}
        </VStack>
        <VStack>
          {rightItems.map((item, index) => (
            <RequiredFieldItem key={index} text={item.text} />
          ))}
        </VStack>
      </HStack>
    </VStack>
  );
};
