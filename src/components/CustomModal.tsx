import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Platform } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

const CustomModal = ({
  visible,
  onRequestClose,
  title,
  children,
}: {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Modal isOpen={visible} size="lg">
      <ModalBackdrop onPress={onRequestClose} />
      <ModalContent backgroundColor={colors.wt}>
        <ModalHeader
          backgroundColor={colors.wt}
          {...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 20,
            },
            android: {
              elevation: 5,
            },
          })}
        >
          <VStack width="100%" justifyContent="center" alignItems="center">
            <Text
              sx={{
                ...textStyle.H_W6_18,
                color: colors.gr1,
              }}
            >
              {title}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
