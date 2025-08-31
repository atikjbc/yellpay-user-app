import { Text } from '@gluestack-ui/themed';
import { TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

type FieldInputProps = {
  // Updated types for React Hook Form compatibility
  onChangeText: (text: string) => void;
  onBlur: () => void;
  value: string;
  placeholder: string;
  name: string;
  error?: string;
  errorMessage?: string;
};

const FieldInput = ({
  onChangeText,
  onBlur,
  value,
  placeholder,
  name,
  error,
  errorMessage,
}: FieldInputProps) => {
  const hasError = Boolean(error);
  const message = error ?? errorMessage;

  return (
    <>
      <TextInput
        onChangeText={onChangeText}
        onBlur={onBlur}
        value={value}
        placeholder={placeholder}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          paddingTop: 4,
          marginBottom: hasError ? 6 : 16,
          marginTop: 4,
          height: 48,
          borderColor: hasError ? colors.rd : colors.line,
        }}
      />
      {hasError ? (
        <Text sx={{ color: colors.rd, mb: '$4', ...textStyle.H_W3_13 }}>
          {String(message)}
        </Text>
      ) : null}
    </>
  );
};

export default FieldInput;
