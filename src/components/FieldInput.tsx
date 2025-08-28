import { Text } from '@gluestack-ui/themed';
import { FormikErrors } from 'formik';
import { TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

type FieldInputProps = {
  // Broaden types to align with Formik's handlers
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any, Element>) => void;
  values: any;
  placeholder: string;
  name: string;
  errors: FormikErrors<any>;
  errorMessage: string | undefined;
};

const FieldInput = ({
  handleChange,
  handleBlur,
  values,
  placeholder,
  name,
  errors,
  errorMessage,
}: FieldInputProps) => {
  const hasError = Boolean(errors?.[name]);
  const message = errors?.[name] ?? errorMessage;

  return (
    <>
      <TextInput
        onChangeText={e => handleChange(e as any)}
        onBlur={e => handleBlur(e as any)}
        value={values[name]}
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
