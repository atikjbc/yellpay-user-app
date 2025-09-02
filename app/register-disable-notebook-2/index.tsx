import {
  HStack,
  Icon,
  Image,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import {
  GradientButton,
  GuidelineList,
  RequiredFieldsInfo,
  SelectionButton,
  Step,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

// Document types for better type safety
type DocumentType =
  | 'selfie'
  | 'disabilityHandbook'
  | 'idCardFront'
  | 'idCardBack';

const DisabilityHandbookRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setSelectedDisabilityType] = useState<string>('');
  const [showDocumentGuidelines, setShowDocumentGuidelines] =
    useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const scrollViewRef = useRef<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const [isCameraModalVisible, setIsCameraModalVisible] =
    useState<boolean>(false);
  const [activeDocumentType, setActiveDocumentType] =
    useState<DocumentType | null>(null);

  // Document capture states with proper names
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [capturedDisabilityHandbook, setCapturedDisabilityHandbook] = useState<
    string | null
  >(null);
  const [capturedIdCardFront, setCapturedIdCardFront] = useState<string | null>(
    null
  );
  const [capturedIdCardBack, setCapturedIdCardBack] = useState<string | null>(
    null
  );
  // if (!permission) {
  //   // Camera permissions are still loading.
  //   return <View />;
  // }

  // Helper function to get the captured image for a specific document type
  const getCapturedImage = (documentType: DocumentType): string | null => {
    switch (documentType) {
      case 'selfie':
        return capturedSelfie;
      case 'disabilityHandbook':
        return capturedDisabilityHandbook;
      case 'idCardFront':
        return capturedIdCardFront;
      case 'idCardBack':
        return capturedIdCardBack;
      default:
        return null;
    }
  };

  // Helper function to set the captured image for a specific document type
  const setCapturedImage = (documentType: DocumentType, imageUri: string) => {
    switch (documentType) {
      case 'selfie':
        setCapturedSelfie(imageUri);
        break;
      case 'disabilityHandbook':
        setCapturedDisabilityHandbook(imageUri);
        break;
      case 'idCardFront':
        setCapturedIdCardFront(imageUri);
        break;
      case 'idCardBack':
        setCapturedIdCardBack(imageUri);
        break;
    }
  };

  // Open camera for specific document type
  const openCameraForDocument = (documentType: DocumentType) => {
    setActiveDocumentType(documentType);
    setIsCameraModalVisible(true);
  };

  // Handle photo capture
  const handlePhotoCapture = async () => {
    if (cameraRef.current && activeDocumentType) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo && photo.uri) {
          setCapturedImage(activeDocumentType, photo.uri);
          setIsCameraModalVisible(false);
          setActiveDocumentType(null);
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
      }
    }
  };

  const permissionDemand = () => {
    if (permission && !permission.granted) {
      // Camera permissions are not granted yet.
      return (
        <VStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          height={screenHeight - 80}
          backgroundColor={colors.gr3}
          sx={{
            paddingHorizontal: 16,
          }}
        >
          <VStack
            backgroundColor={colors.wt}
            padding={24}
            borderRadius={16}
            width="100%"
            sx={{
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: -1,
                  },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}
          >
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.gr1,
                textAlign: 'center',
                paddingBottom: 10,
              }}
            >
              「YellPay」がカメラへのアクセスを要求しています
            </Text>
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.gr1,
                textAlign: 'center',
                paddingBottom: 10,
              }}
            >
              写真を撮影し、顔を認識するためです
            </Text>
            <GradientButton
              title="権限を許可"
              onPress={() => {
                requestPermission();
              }}
            />
          </VStack>
        </VStack>
      );
    }
  };

  // function toggleCameraFacing() {
  //   setCameraFacing(current => (current === 'front' ? 'back' : 'front'));
  // }

  // Reusable component for document capture input
  const DocumentCaptureInput = ({
    title,
    documentType,
  }: {
    title: string;
    documentType: DocumentType;
  }) => {
    const capturedImage = getCapturedImage(documentType);

    if (capturedImage) {
      return (
        <VStack>
          <Text
            sx={{
              ...textStyle.H_W6_18,
              color: colors.gr7,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <TouchableOpacity onPress={() => openCameraForDocument(documentType)}>
            <VStack
              sx={{
                marginTop: 16,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: capturedImage }}
                alt={title}
                style={{
                  width: '100%',
                  height: undefined,
                  aspectRatio: 342 / 183,
                }}
                resizeMode="cover"
              />
            </VStack>
          </TouchableOpacity>
        </VStack>
      );
    }

    return (
      <VStack>
        <Text
          sx={{
            ...textStyle.H_W6_18,
            color: colors.gr7,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={() => openCameraForDocument(documentType)}>
          <HStack
            gap={12}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.gr,
              borderRadius: 8,
              paddingVertical: 22,
              marginTop: 16,
              position: 'relative',
            }}
          >
            <Svg
              height="180%"
              width="102%"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <Rect
                x="1"
                y="1"
                width="98%"
                height="98%"
                stroke={colors.gr1}
                rx={8}
                ry={8}
                strokeWidth="1"
                strokeDasharray="8, 8"
                fill="none"
              />
            </Svg>
            <Image
              source={require('../../assets/images/camera-icon.png')}
              alt="camera-icon"
              style={{
                width: 56,
                height: undefined,
                aspectRatio: 56 / 56,
              }}
              resizeMode="contain"
            />
            <Text
              sx={{
                ...textStyle.H_W3_13,
                color: colors.gr1,
              }}
              textAlign="center"
            >
              写真を撮る
            </Text>
          </HStack>
        </TouchableOpacity>
      </VStack>
    );
  };

  const steps = [
    {
      id: 1,
      label: '手帳の選択',
      isActive: currentStep === 0,
      isVisited: currentStep > 0,
    },
    {
      id: 2,
      label: '撮影',
      isActive: currentStep === 1,
      isVisited: currentStep > 1,
    },
    {
      id: 3,
      label: '最終確認',
      isActive: currentStep === 2,
      isVisited: false,
    },
  ];

  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Stack.Screen
              options={{
                title: '障がい者手帳の選択',
                headerShown: !isCameraModalVisible,
                headerTitle: '障がい者手帳の選択 ',
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
            {isCameraModalVisible ? (
              <VStack
                flex={1}
                backgroundColor={colors.bl}
                style={{ height: screenHeight }}
              >
                <VStack position="absolute" top={50} left={16} zIndex={10000}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsCameraModalVisible(false);
                      setActiveDocumentType(null);
                    }}
                  >
                    <Icon as={X} size="xl" color={colors.wt} fontWeight={600} />
                  </TouchableOpacity>
                </VStack>
                <VStack
                  sx={{
                    position: 'absolute',
                  }}
                ></VStack>
                <CameraView
                  ref={cameraRef}
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                  }}
                  facing={activeDocumentType === 'selfie' ? 'front' : 'back'}
                />
                {/* Camera Overlay with transparent card area */}
                <VStack
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  justifyContent="center"
                  alignItems="center"
                  pointerEvents="none"
                  zIndex={1000}
                >
                  {(activeDocumentType === 'disabilityHandbook' ||
                    activeDocumentType === 'idCardFront' ||
                    activeDocumentType === 'idCardBack') && (
                    <>
                      {/* SVG overlay with transparent window */}
                      <Svg
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute' }}
                      >
                        <Defs>
                          <Mask id="cardMask">
                            {/* White fills the mask - visible area */}
                            <Rect width="100%" height="100%" fill="white" />
                            {/* Black creates the cutout - transparent area */}
                            <Rect
                              x={(screenWidth - 340) / 2}
                              y={(screenHeight - 490) / 2}
                              width="340"
                              height="210"
                              rx="12"
                              fill="black"
                            />
                          </Mask>
                        </Defs>
                        {/* Dark background with cutout */}
                        <Rect
                          width="100%"
                          height="100%"
                          fill="rgba(0,0,0,0.6)"
                          mask="url(#cardMask)"
                        />
                      </Svg>

                      {/* Card border and corner indicators */}
                      <VStack
                        style={{
                          position: 'absolute',
                          top: 170,
                          width: 340,
                          height: 210,
                          borderRadius: 12,
                          backgroundColor: 'transparent',
                        }}
                      >
                        {/* Corner indicators */}
                        <VStack position="absolute" top={-1} left={-1}>
                          <VStack
                            style={{
                              width: 20,
                              height: 20,
                              borderTopWidth: 4,
                              borderLeftWidth: 4,
                              borderColor: colors.wt,
                              borderRadius: 5,
                            }}
                          />
                        </VStack>
                        <VStack position="absolute" top={-1} right={-1}>
                          <VStack
                            style={{
                              width: 20,
                              height: 20,
                              borderTopWidth: 4,
                              borderRightWidth: 4,
                              borderColor: colors.wt,
                              borderRadius: 5,
                            }}
                          />
                        </VStack>
                        <VStack position="absolute" bottom={-1} left={-1}>
                          <VStack
                            style={{
                              width: 20,
                              height: 25,
                              borderBottomWidth: 5,
                              borderLeftWidth: 5,
                              borderColor: colors.wt,
                              borderRadius: 5,
                            }}
                          />
                        </VStack>
                        <VStack position="absolute" bottom={-1} right={-1}>
                          <VStack
                            style={{
                              width: 20,
                              height: 25,
                              borderBottomWidth: 5,
                              borderRightWidth: 5,
                              borderColor: colors.wt,
                              borderRadius: 5,
                            }}
                          />
                        </VStack>
                      </VStack>
                    </>
                  )}
                </VStack>
                <VStack
                  position="absolute"
                  bottom={Platform.OS === 'ios' ? 50 : 30}
                  width="100%"
                  paddingHorizontal={16}
                  zIndex={1000}
                >
                  <HStack justifyContent="center" alignItems="center">
                    <TouchableOpacity
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 4,
                        borderColor: colors.wt,
                      }}
                      onPress={handlePhotoCapture}
                    >
                      <VStack
                        style={{
                          width: 56,
                          height: 56,
                          right: 0.1,
                          borderRadius: 50,
                          backgroundColor: colors.wt,
                        }}
                      />
                    </TouchableOpacity>
                    {/* <VStack flex={1} alignItems="flex-end">
                      <TouchableOpacity
                        onPress={toggleCameraFacing}
                        style={{
                          padding: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 25,
                        }}
                      >
                        <Text
                          sx={{
                            ...textStyle.H_W6_13,
                            color: colors.wt,
                          }}
                        >
                          切替
                        </Text>
                      </TouchableOpacity>
                    </VStack> */}
                  </HStack>
                </VStack>
              </VStack>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                style={{
                  backgroundColor: colors.wt,
                  flex: 1,
                  marginBottom: 24,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {permission && permission.granted ? (
                  <VStack width="100%">
                    <Step
                      steps={steps}
                      currentStep={currentStep}
                      //   onStepPress={stepIndex => setCurrentStep(stepIndex)}
                      style={{ marginHorizontal: 16, marginTop: 16 }}
                      documentUploadHelper={showDocumentGuidelines}
                    />
                    {currentStep === 0 && !showDocumentGuidelines && (
                      <VStack
                        paddingHorizontal={16}
                        paddingTop={32}
                        paddingBottom={40}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text
                          sx={{
                            ...textStyle.H_W6_15,
                            color: colors.gr1,
                            textAlign: 'center',
                            paddingBottom: 40,
                          }}
                        >
                          登録する障がい者手帳の種類を{'\n'}お選びください。
                        </Text>
                        <SelectionButton
                          title="身体"
                          onPress={() => {
                            setSelectedDisabilityType('身体');
                            setShowDocumentGuidelines(true);
                          }}
                        />
                        <SelectionButton
                          title="精神"
                          onPress={() => {
                            setSelectedDisabilityType('精神');
                            setShowDocumentGuidelines(true);
                          }}
                        />
                        <SelectionButton
                          title="療育"
                          onPress={() => {
                            setSelectedDisabilityType('療育');
                            setShowDocumentGuidelines(true);
                          }}
                        />
                      </VStack>
                    )}
                    {currentStep === 0 && showDocumentGuidelines && (
                      <VStack
                        paddingHorizontal={16}
                        paddingTop={32}
                        paddingBottom={40}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text
                          sx={{
                            ...textStyle.H_W6_15,
                            color: colors.gr2,
                            textAlign: 'center',
                            paddingBottom: 16,
                          }}
                        >
                          下記の内容をご確認ください。
                        </Text>
                        <RequiredFieldsInfo
                          leftItems={[
                            { text: '手帳種別' },
                            { text: '交付日または更新日' },
                            { text: '生年月日' },
                            { text: '等級' },
                            { text: '発行元自治体' },
                          ]}
                          rightItems={[
                            { text: '手帳番号' },
                            { text: '名前' },
                            { text: '顔写真' },
                            { text: '旅客運賃減額' },
                            { text: '発行元自治体の印影' },
                          ]}
                        />
                        <Text
                          sx={{
                            ...textStyle.H_W6_13,
                            color: colors.gr2,
                            paddingTop: 8,
                          }}
                        >
                          ※必須項目が撮影されていない場合、申請は却下となります。
                        </Text>
                        <GuidelineList
                          title="登録できる障がい者手帳"
                          subtitle="顔写真があり、記載内容が鮮明なものに限ります。"
                          images={[
                            {
                              source: require('../../assets/images/disable-notebook-guide-1.png'),
                              aspectRatio: 342 / 184,
                            },
                            {
                              source: require('../../assets/images/disable-notebook-guide-2.png'),
                              aspectRatio: 342 / 184,
                            },
                          ]}
                          note="※お住まいの地域によって、手帳の形式や記載簡所は異なります。"
                        />
                        <VStack paddingVertical={0} gap={16}>
                          <Image
                            source={require('../../assets/images/disable-notebook-guide-3.png')}
                            alt="user-guide-payment"
                            style={{
                              width: '100%',
                              height: undefined,
                              aspectRatio: 342 / 184,
                            }}
                            resizeMode="contain"
                          />
                        </VStack>
                        <GradientButton
                          title="撮影へ進む"
                          onPress={() => {
                            setCurrentStep(1);
                          }}
                        />
                      </VStack>
                    )}
                    {currentStep === 1 && (
                      <VStack
                        marginVertical={32}
                        paddingHorizontal={16}
                        gap={24}
                        width="100%"
                      >
                        <DocumentCaptureInput
                          title="顔写真"
                          documentType="selfie"
                        />
                        <DocumentCaptureInput
                          title="障がい者手帳"
                          documentType="disabilityHandbook"
                        />
                        <DocumentCaptureInput
                          title="免許書・証明証（表）"
                          documentType="idCardFront"
                        />
                        <DocumentCaptureInput
                          title="免許書・証明証（裏）"
                          documentType="idCardBack"
                        />
                        <VStack paddingTop={16}>
                          {capturedSelfie &&
                          capturedDisabilityHandbook &&
                          capturedIdCardFront &&
                          capturedIdCardBack ? (
                            <GradientButton
                              title="最終確認へ"
                              onPress={() => {
                                setCurrentStep(2);
                              }}
                            />
                          ) : (
                            <TouchableOpacity
                              style={{
                                marginTop: 24,
                                borderRadius: 10,
                                height: 56,
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: colors.line,
                              }}
                              disabled={true}
                            >
                              <Text
                                sx={{
                                  ...textStyle.H_W6_15,
                                  color: colors.wt1,
                                }}
                              >
                                最終確認へ
                              </Text>
                            </TouchableOpacity>
                          )}
                        </VStack>
                      </VStack>
                    )}
                    {currentStep === 2 && (
                      <VStack
                        marginVertical={32}
                        paddingHorizontal={16}
                        gap={24}
                        width="100%"
                      >
                        <Text
                          sx={{
                            ...textStyle.H_W6_18,
                            color: colors.gr1,
                            textAlign: 'center',
                            paddingBottom: 16,
                          }}
                        >
                          撮影した写真に不備がないことを{'\n'}
                          確認してください。
                        </Text>
                        {capturedSelfie && (
                          <VStack>
                            <Text
                              sx={{
                                ...textStyle.H_W6_18,
                                color: colors.gr7,
                                textAlign: 'center',
                                paddingBottom: 8,
                              }}
                            >
                              顔写真
                            </Text>
                            <Image
                              source={{ uri: capturedSelfie }}
                              alt="顔写真"
                              style={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: 342 / 183,
                                borderRadius: 8,
                              }}
                              resizeMode="cover"
                            />
                          </VStack>
                        )}
                        {capturedDisabilityHandbook && (
                          <VStack>
                            <Text
                              sx={{
                                ...textStyle.H_W6_18,
                                color: colors.gr7,
                                textAlign: 'center',
                                paddingBottom: 8,
                              }}
                            >
                              障がい者手帳
                            </Text>
                            <Image
                              source={{ uri: capturedDisabilityHandbook }}
                              alt="障がい者手帳"
                              style={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: 342 / 183,
                                borderRadius: 8,
                              }}
                              resizeMode="cover"
                            />
                          </VStack>
                        )}
                        {capturedIdCardFront && (
                          <VStack>
                            <Text
                              sx={{
                                ...textStyle.H_W6_15,
                                color: colors.gr7,
                                textAlign: 'center',
                                paddingBottom: 8,
                              }}
                            >
                              免許書・証明証（表）
                            </Text>
                            <Image
                              source={{ uri: capturedIdCardFront }}
                              alt="免許書・証明証（表）"
                              style={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: 342 / 183,
                                borderRadius: 8,
                              }}
                              resizeMode="cover"
                            />
                          </VStack>
                        )}
                        {capturedIdCardBack && (
                          <VStack>
                            <Text
                              sx={{
                                ...textStyle.H_W6_18,
                                color: colors.gr7,
                                textAlign: 'center',
                                paddingBottom: 8,
                              }}
                            >
                              免許書・証明証（裏）
                            </Text>
                            <Image
                              source={{ uri: capturedIdCardBack }}
                              alt="免許書・証明証（裏）"
                              style={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: 342 / 183,
                                borderRadius: 8,
                              }}
                              resizeMode="cover"
                            />
                          </VStack>
                        )}
                        <VStack
                          backgroundColor={colors.lrd}
                          padding={16}
                          borderRadius={8}
                        >
                          <Text
                            sx={{
                              ...textStyle.H_W6_18,
                              color: colors.gr1,
                              textAlign: 'center',
                              paddingBottom: 16,
                            }}
                          >
                            確認事項
                          </Text>
                          <Text
                            sx={{
                              ...textStyle.H_W6_14,
                              color: colors.rd,
                              paddingLeft: 4,
                            }}
                          >
                            撮影方法について
                          </Text>
                          <Text
                            sx={{
                              ...textStyle.H_W6_14,
                              color: colors.gr1,
                              paddingBottom: 2,
                              paddingTop: 8,
                            }}
                          >
                            <Text sx={{ color: colors.rd }}>・</Text>
                            記載内容がはっきりと写っている
                          </Text>
                          <Text
                            sx={{
                              ...textStyle.H_W6_14,
                              color: colors.gr1,
                              paddingBottom: 2,
                            }}
                          >
                            <Text sx={{ color: colors.rd }}>・</Text>
                            カバーがついていない
                          </Text>
                          <Text
                            sx={{
                              ...textStyle.H_W6_14,
                              color: colors.gr1,
                              paddingBottom: 16,
                            }}
                          >
                            <Text sx={{ color: colors.rd }}>・</Text>
                            折り目ごとに写っている
                          </Text>
                          <Text
                            sx={{
                              ...textStyle.H_W6_14,
                              color: colors.rd,
                              paddingLeft: 4,
                            }}
                          >
                            撮影方法について
                          </Text>
                          <Text
                            sx={{
                              ...textStyle.H_W6_14,
                              color: colors.gr1,
                              paddingBottom: 2,
                              paddingTop: 8,
                            }}
                          >
                            <Text sx={{ color: colors.rd }}>・</Text>
                            手帳種別
                          </Text>
                          <Text
                            sx={{
                              ...textStyle.H_W6_14,
                              color: colors.gr1,
                              paddingBottom: 2,
                            }}
                          >
                            <Text sx={{ color: colors.rd }}>・</Text>
                            手帳番号
                          </Text>
                        </VStack>
                        <VStack gap={12}>
                          <GradientButton
                            title="申請する"
                            onPress={() => {
                              // Handle submission
                              router.push('/register-disable-notebook-confirm');
                            }}
                          />
                        </VStack>
                      </VStack>
                    )}
                  </VStack>
                ) : !permission ? (
                  <Spinner
                    size="large"
                    color={colors.rd}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  />
                ) : (
                  <VStack height="100%">{permissionDemand()}</VStack>
                )}
              </ScrollView>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default DisabilityHandbookRegistration;
