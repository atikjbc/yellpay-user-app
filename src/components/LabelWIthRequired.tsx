import { HStack, Text } from '@gluestack-ui/themed';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

type LabelWithRequiredProps = {
  label: string;
  required: boolean;
};

const LabelWithRequired = ({ label, required }: LabelWithRequiredProps) => {
  return (
    <HStack alignItems="center" gap={8}>
      <Text sx={{ ...textStyle.H_W6_14, color: colors.bl }}>{label}</Text>
      {required && (
        <Text
          sx={{
            ...textStyle.H_W6_10,
            color: colors.wt,
            backgroundColor: colors.yr,
            borderRadius: 3,
            paddingHorizontal: 7,
            height: 14.5,
          }}
        >
          必須
        </Text>
      )}
    </HStack>
  );
};

export default LabelWithRequired;
