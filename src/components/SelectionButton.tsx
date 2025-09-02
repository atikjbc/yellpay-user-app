import { Text } from '@gluestack-ui/themed';
import { TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

interface SelectionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const SelectionButton = ({
  title,
  onPress,
  variant = 'primary',
}: SelectionButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: 10,
        height: 56,
        width: '100%',
        borderWidth: 1,
        marginBottom: 16,
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
        {title}
      </Text>
    </TouchableOpacity>
  );
};
