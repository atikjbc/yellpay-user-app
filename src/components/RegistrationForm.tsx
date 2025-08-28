import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Button,
  ChevronDownIcon,
  Divider,
  HStack,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Formik } from 'formik';
import React, { useRef } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Yup from 'yup';
import { FormData } from '../../app/onboarding';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';
import { fetchJapaneseAddress } from '../utils/fetchJapaneseAddress';
import { toConvertKatakana } from '../utils/katakanaConverter';
import Indicator from './Indicator';
import LabelWithRequired from './LabelWIthRequired';

const ValidationSchema = Yup.object({
  name: Yup.string().required('お名前を入力してください'),
  furigana: Yup.string()
    .test('is-katakana', 'ふりがなで入力してください', value => {
      if (!value) return true; // optional field
      return /^[ァ-ヾ゛゜\s]*$/.test(value);
    })
    .required('ふりがなで入力してください'),
  phoneNumber: Yup.string()
    .matches(/^\d{10,11}$/, 'ハイフンなしで電話番号を入力してください')
    .required('電話番号を入力してください'),
  email: Yup.string()
    .email('メールアドレスフォーマットで入力してください')
    .required('メールアドレスフォーマットで入力してください'),
  postalCodePart1: Yup.string()
    .matches(/^\d{3}$/, '郵便番号を3桁で入力してください')
    .required('郵便番号を入力してください'),
  postalCodePart2: Yup.string()
    .matches(/^\d{4}$/, '郵便番号を4桁で入力してください')
    .required('郵便番号を入力してください'),
  prefecture: Yup.string().required('都道府県を選択してください'),
  city: Yup.string().required('番地を入力してください'),
  streetAddress: Yup.string().required('番地を入力してください'),
  building: Yup.string().optional(),
  work: Yup.string().required('職業を選択してください'),
  employmentSupportClassification:
    Yup.string().required('就労支援分類を選択してください'),
});

const initialValues = {
  name: '',
  furigana: '',
  phoneNumber: '',
  email: '',
  postalCodePart1: '',
  postalCodePart2: '',
  prefecture: '',
  city: '',
  streetAddress: '',
  building: '',
  work: '',
  employmentSupportClassification: '',
};

const RegistrationForm = ({
  totalSteps,
  activeIndex,
  setFormData,
  handleNext,
}: {
  totalSteps: number;
  activeIndex: number;
  setFormData: React.Dispatch<React.SetStateAction<FormData | null>>;
  handleNext: () => void;
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const postalCode1Ref = useRef<TextInput>(null);
  const postalCode2Ref = useRef<TextInput>(null);

  const scrollToInput = (yOffset: number = 0) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            paddingBottom: 100,
            flexGrow: 1,
            zIndex: 1000,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto-scroll when content changes
            if (Platform.OS === 'android') {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          <VStack flex={1} px={8}>
            <Text
              sx={{
                ...textStyle.H_W6_20,
                textAlign: 'center',
                py: 48,
                color: colors.rd,
              }}
            >
              会員情報登録
            </Text>
            <Formik
              initialValues={initialValues}
              validationSchema={ValidationSchema}
              validateOnChange={false}
              onSubmit={values => {
                Keyboard.dismiss();
                setFormData(values);
                handleNext();
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                submitCount,
                setFieldTouched,
              }) => (
                <VStack>
                  <LabelWithRequired label="お名前" required />
                  <TextInput
                    onChangeText={async text => {
                      handleChange('name')(text);
                      const convertedText = await toConvertKatakana(text);
                      handleChange('furigana')(convertedText);
                    }}
                    onBlur={handleBlur('name')}
                    onFocus={() => scrollToInput(100)}
                    value={values.name}
                    placeholder="山田　花子"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom:
                        errors.name && (touched.name || submitCount > 0)
                          ? 6
                          : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor:
                        errors.name && (touched.name || submitCount > 0)
                          ? colors.rd
                          : colors.line,
                    }}
                  />
                  {errors.name && (touched.name || submitCount > 0) && (
                    <Text
                      sx={{
                        color: colors.wt,
                        ...textStyle.H_W3_13,
                        mb: 16,
                        px: 4,
                        py: 2,
                        borderRadius: 4,
                        backgroundColor: colors.rd,
                      }}
                    >
                      {errors.name}
                    </Text>
                  )}

                  <LabelWithRequired label="ふりがな" required />
                  <TextInput
                    onChangeText={handleChange('furigana')}
                    onBlur={handleBlur('furigana')}
                    onFocus={() => scrollToInput(150)}
                    value={values.furigana}
                    placeholder="やまだ　はなこ"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom:
                        errors.furigana && (touched.furigana || submitCount > 0)
                          ? 6
                          : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor:
                        errors.furigana && (touched.furigana || submitCount > 0)
                          ? colors.rd
                          : colors.line,
                    }}
                  />
                  {errors.furigana && (touched.furigana || submitCount > 0) && (
                    <Text
                      sx={{
                        color: colors.wt,
                        ...textStyle.H_W3_13,
                        mb: 16,
                        px: 4,
                        py: 2,
                        borderRadius: 4,
                        backgroundColor: colors.rd,
                      }}
                    >
                      {errors.furigana}
                    </Text>
                  )}

                  <LabelWithRequired label="電話番号" required />
                  <TextInput
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={handleBlur('phoneNumber')}
                    onFocus={() => scrollToInput(200)}
                    maxLength={11}
                    value={values.phoneNumber}
                    placeholder="1234567989"
                    keyboardType="numeric"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 5,
                      marginBottom:
                        errors.phoneNumber &&
                        (touched.phoneNumber || submitCount > 0)
                          ? 6
                          : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor:
                        errors.phoneNumber &&
                        (touched.phoneNumber || submitCount > 0)
                          ? colors.rd
                          : colors.line,
                    }}
                  />
                  {errors.phoneNumber &&
                    (touched.phoneNumber || submitCount > 0) && (
                      <Text
                        sx={{
                          color: colors.wt,
                          ...textStyle.H_W3_13,
                          mb: 16,
                          px: 4,
                          py: 2,
                          borderRadius: 4,
                          backgroundColor: colors.rd,
                        }}
                      >
                        {errors.phoneNumber}
                      </Text>
                    )}

                  <LabelWithRequired label="メールアドレス" required />
                  <TextInput
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    onFocus={() => scrollToInput(250)}
                    value={values.email}
                    placeholder="yellpay@email.com"
                    keyboardType="email-address"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom:
                        errors.email && (touched.email || submitCount > 0)
                          ? 6
                          : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor:
                        errors.email && (touched.email || submitCount > 0)
                          ? colors.rd
                          : colors.line,
                    }}
                  />
                  {errors.email && (touched.email || submitCount > 0) && (
                    <Text
                      sx={{
                        color: colors.wt,
                        ...textStyle.H_W3_13,
                        mb: 16,
                        px: 4,
                        py: 2,
                        borderRadius: 4,
                        backgroundColor: colors.rd,
                      }}
                    >
                      {errors.email}
                    </Text>
                  )}

                  <LabelWithRequired label="郵便番号" required />
                  <HStack alignItems="center" justifyContent="space-between">
                    <HStack alignItems="center">
                      <TextInput
                        ref={postalCode1Ref}
                        onChangeText={text => {
                          handleChange('postalCodePart1')(text);
                          // Auto-focus to second field when 3 digits are entered
                          if (text.length === 3) {
                            postalCode2Ref.current?.focus();
                          }
                        }}
                        onBlur={handleBlur('postalCodePart1')}
                        onFocus={() => scrollToInput(300)}
                        maxLength={3}
                        value={values.postalCodePart1}
                        placeholder="120"
                        keyboardType="numeric"
                        placeholderTextColor={colors.line}
                        style={{
                          borderWidth: 1,
                          padding: 10,
                          borderRadius: 5,
                          paddingTop: 8,
                          marginBottom:
                            errors.postalCodePart1 &&
                            (touched.postalCodePart1 || submitCount > 0)
                              ? 6
                              : 16,
                          marginTop: 4,
                          height: 48,
                          width: 75,
                          borderColor:
                            errors.postalCodePart1 &&
                            (touched.postalCodePart1 || submitCount > 0)
                              ? colors.rd
                              : colors.line,
                        }}
                      />
                      <Divider
                        sx={{
                          height: 1,
                          mt:
                            (errors.postalCodePart1 ||
                              errors.postalCodePart2) &&
                            (touched.postalCodePart1 ||
                              touched.postalCodePart2 ||
                              submitCount > 0)
                              ? 0
                              : -8,
                          width: 11,
                          mx: 6,
                          backgroundColor: '#333333',
                        }}
                      />
                      <TextInput
                        ref={postalCode2Ref}
                        onChangeText={text => {
                          handleChange('postalCodePart2')(text);
                          // Auto-focus back to first field when all digits are removed
                          if (text.length === 0) {
                            postalCode1Ref.current?.focus();
                          }
                        }}
                        onBlur={handleBlur('postalCodePart2')}
                        onFocus={() => scrollToInput(300)}
                        maxLength={4}
                        value={values.postalCodePart2}
                        placeholder="4567"
                        keyboardType="numeric"
                        placeholderTextColor={colors.line}
                        style={{
                          borderWidth: 1,
                          padding: 10,
                          borderRadius: 5,
                          paddingTop: 8,
                          marginBottom:
                            (errors.postalCodePart2 ||
                              errors.postalCodePart1) &&
                            (touched.postalCodePart2 ||
                              touched.postalCodePart1 ||
                              submitCount > 0)
                              ? 6
                              : 16,
                          marginTop: 4,
                          height: 48,
                          width: 96,
                          borderColor:
                            (errors.postalCodePart2 ||
                              errors.postalCodePart1) &&
                            (touched.postalCodePart2 ||
                              touched.postalCodePart1 ||
                              submitCount > 0)
                              ? colors.rd
                              : colors.line,
                        }}
                      />
                    </HStack>
                    <Button
                      variant="outline"
                      borderColor={colors.rd}
                      sx={{
                        height: 48,
                        marginBottom:
                          (errors.postalCodePart1 || errors.postalCodePart2) &&
                          (touched.postalCodePart1 ||
                            touched.postalCodePart2 ||
                            submitCount > 0)
                            ? 4
                            : 16,
                      }}
                      onPress={async () => {
                        const address = await fetchJapaneseAddress(
                          values.postalCodePart1 + values.postalCodePart2
                        );
                        handleChange('prefecture')(address?.address1 || '');
                        handleChange('city')(
                          (address?.address2 || '') + (address?.address3 || '')
                        );
                        setFieldTouched('prefecture');
                        setFieldTouched('city');
                        setFieldTouched('postalCodePart1');
                        setFieldTouched('postalCodePart2');
                      }}
                    >
                      <Text sx={{ color: colors.rd, ...textStyle.H_W6_14 }}>
                        住所検索
                      </Text>
                    </Button>
                  </HStack>
                  {(errors.postalCodePart1 || errors.postalCodePart2) &&
                    (touched.postalCodePart1 ||
                      touched.postalCodePart2 ||
                      submitCount > 0) && (
                      <Text
                        sx={{
                          color: colors.wt,
                          ...textStyle.H_W3_13,
                          mb: 16,
                          px: 4,
                          py: 2,
                          borderRadius: 4,
                          backgroundColor: colors.rd,
                        }}
                      >
                        {errors.postalCodePart1 || errors.postalCodePart2}
                      </Text>
                    )}

                  <LabelWithRequired label="都道府県" required />
                  <HStack position="relative" width={216}>
                    <TextInput
                      onChangeText={handleChange('prefecture')}
                      onBlur={handleBlur('prefecture')}
                      onFocus={() => scrollToInput(350)}
                      value={values.prefecture}
                      placeholder="東京都"
                      keyboardType="default"
                      placeholderTextColor={colors.line}
                      editable={false}
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        borderRadius: 5,
                        paddingTop: 8,
                        marginBottom:
                          errors.prefecture &&
                          (touched.prefecture || submitCount > 0)
                            ? 6
                            : 16,
                        marginTop: 4,
                        width: 216,
                        height: 48,
                        borderColor:
                          errors.prefecture &&
                          (touched.prefecture || submitCount > 0)
                            ? colors.rd
                            : colors.line,
                      }}
                    />
                    <Ionicons
                      name="chevron-down"
                      size={24}
                      color={colors.line}
                      position="absolute"
                      right={10}
                      top={17}
                    />
                  </HStack>
                  {errors.prefecture &&
                    (touched.prefecture || submitCount > 0) && (
                      <Text
                        sx={{
                          color: colors.wt,
                          ...textStyle.H_W3_13,
                          mb: 16,
                          px: 4,
                          py: 2,
                          borderRadius: 4,
                          backgroundColor: colors.rd,
                        }}
                      >
                        {errors.prefecture}
                      </Text>
                    )}

                  <LabelWithRequired label="市区町村" required />
                  <TextInput
                    onChangeText={handleChange('city')}
                    onBlur={handleBlur('city')}
                    onFocus={() => scrollToInput(250)}
                    value={values.city}
                    placeholder="○○区"
                    editable={false}
                    keyboardType="default"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom:
                        errors.city && (touched.city || submitCount > 0)
                          ? 6
                          : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor:
                        errors.city && (touched.city || submitCount > 0)
                          ? colors.rd
                          : colors.line,
                    }}
                  />
                  {errors.city && (touched.city || submitCount > 0) && (
                    <Text
                      sx={{
                        color: colors.wt,
                        ...textStyle.H_W3_13,
                        mb: 16,
                        px: 4,
                        py: 2,
                        borderRadius: 4,
                        backgroundColor: colors.rd,
                      }}
                    >
                      {errors.city}
                    </Text>
                  )}

                  <LabelWithRequired label="番地" required />
                  <TextInput
                    onChangeText={handleChange('streetAddress')}
                    onBlur={handleBlur('streetAddress')}
                    onFocus={() => scrollToInput(300)}
                    value={values.streetAddress}
                    placeholder="１−１−１"
                    keyboardType="default"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom:
                        errors.streetAddress &&
                        (touched.streetAddress || submitCount > 0)
                          ? 6
                          : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor:
                        errors.streetAddress &&
                        (touched.streetAddress || submitCount > 0)
                          ? colors.rd
                          : colors.line,
                    }}
                  />
                  {errors.streetAddress &&
                    (touched.streetAddress || submitCount > 0) && (
                      <Text
                        sx={{
                          color: colors.wt,
                          ...textStyle.H_W3_13,
                          mb: 16,
                          px: 4,
                          py: 2,
                          borderRadius: 4,
                          backgroundColor: colors.rd,
                        }}
                      >
                        {errors.streetAddress}
                      </Text>
                    )}
                  <LabelWithRequired label="建物名" required={false} />
                  <TextInput
                    onChangeText={handleChange('building')}
                    onBlur={handleBlur('building')}
                    onFocus={() => scrollToInput(300)}
                    value={values.building}
                    keyboardType="default"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom:
                        errors.building && (touched.building || submitCount > 0)
                          ? 6
                          : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor:
                        errors.building && (touched.building || submitCount > 0)
                          ? colors.rd
                          : colors.line,
                    }}
                  />
                  <LabelWithRequired label="職業" required />
                  <Select
                    onValueChange={handleChange('work')}
                    selectedValue={values.work}
                  >
                    <SelectTrigger
                      variant="outline"
                      size="md"
                      sx={{
                        height: 48,
                        borderWidth: 1,
                        borderRadius: 5,
                        padding: 5,
                        paddingTop: 8,
                        marginBottom:
                          errors.work && (touched.work || submitCount > 0)
                            ? 6
                            : 16,
                        marginTop: 4,
                        borderColor:
                          errors.work && (touched.work || submitCount > 0)
                            ? colors.rd
                            : colors.line,
                      }}
                    >
                      <SelectInput placeholder="職業を選択してください" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="UX Research" value="ux" />
                        <SelectItem label="Web Development" value="web" />
                        <SelectItem label="CPDP" value="cdp" />
                        <SelectItem
                          label="UI Designing"
                          value="ui"
                          isDisabled={true}
                        />
                        <SelectItem
                          label="Backend Development"
                          value="backend"
                        />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  {errors.work && (touched.work || submitCount > 0) && (
                    <Text
                      sx={{
                        color: colors.wt,
                        ...textStyle.H_W3_13,
                        mb: 16,
                        px: 4,
                        py: 2,
                        borderRadius: 4,
                        backgroundColor: colors.rd,
                      }}
                    >
                      {errors.work}
                    </Text>
                  )}

                  <LabelWithRequired label="就労支援分類" required />
                  <Select
                    onValueChange={handleChange(
                      'employmentSupportClassification'
                    )}
                    selectedValue={values.employmentSupportClassification}
                  >
                    <SelectTrigger
                      variant="outline"
                      size="md"
                      sx={{
                        height: 48,
                        borderWidth: 1,
                        borderRadius: 5,
                        padding: 5,
                        paddingTop: 8,
                        marginBottom:
                          errors.employmentSupportClassification &&
                          (touched.employmentSupportClassification ||
                            submitCount > 0)
                            ? 6
                            : 16,
                        marginTop: 4,
                        borderColor:
                          errors.employmentSupportClassification &&
                          (touched.employmentSupportClassification ||
                            submitCount > 0)
                            ? colors.rd
                            : colors.line,
                      }}
                    >
                      <SelectInput placeholder="就労支援分類を選択してください" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="UX Research" value="ux" />
                        <SelectItem label="Web Development" value="web" />
                        <SelectItem label="CPDP" value="cdp" />
                        <SelectItem
                          label="UI Designing"
                          value="ui"
                          isDisabled={true}
                        />
                        <SelectItem
                          label="Backend Development"
                          value="backend"
                        />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  {errors.employmentSupportClassification &&
                    (touched.employmentSupportClassification ||
                      submitCount > 0) && (
                      <Text
                        sx={{
                          color: colors.wt,
                          ...textStyle.H_W3_13,
                          mb: 16,
                          px: 4,
                          py: 2,
                          borderRadius: 4,
                          backgroundColor: colors.rd,
                        }}
                      >
                        {errors.employmentSupportClassification}
                      </Text>
                    )}
                  <Button
                    mt={30}
                    variant="solid"
                    sx={{
                      borderColor: colors.rd,
                      backgroundColor: colors.rd,
                      borderRadius: 10,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      width: '100%',
                      height: 52,
                      boxShadow: '0px 0px 10px 0px #D5242A4F',
                    }}
                    onPress={() => {
                      Keyboard.dismiss();
                      handleSubmit();
                    }}
                  >
                    <Text
                      sx={{
                        ...textStyle.H_W6_15,
                        color: colors.wt,
                      }}
                    >
                      入力情報を確認
                    </Text>
                  </Button>
                </VStack>
              )}
            </Formik>
          </VStack>
          <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <Indicator total={totalSteps} activeIndex={activeIndex} />
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RegistrationForm;
