import {
  Box,
  CloseIcon,
  HStack,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { ChevronsUpDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

interface MonthYearPickerProps {
  onDateChange: (month: number, year: number) => void;
  minYear?: number;
  maxYear?: number;
  selectedMonth: number | null;
  selectedYear: number | null;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  onDateChange,
  minYear = 2020,
  maxYear = 2040,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
}) => {
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  const months = [
    { value: 1, label: '01' },
    { value: 2, label: '02' },
    { value: 3, label: '03' },
    { value: 4, label: '04' },
    { value: 5, label: '05' },
    { value: 6, label: '06' },
    { value: 7, label: '07' },
    { value: 8, label: '08' },
    { value: 9, label: '09' },
    { value: 10, label: '10' },
    { value: 11, label: '11' },
    { value: 12, label: '12' },
  ];

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    value: minYear + i,
    label: (minYear + i).toString(),
  }));

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setIsMonthModalOpen(false);
    if (selectedYear) {
      onDateChange(month, selectedYear);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setIsYearModalOpen(false);
    if (selectedMonth) {
      onDateChange(selectedMonth, year);
    }
  };

  return (
    <HStack flex={1} gap={16}>
      {/* Month Picker */}
      <HStack flex={1} alignItems="center" gap={16}>
        <Pressable
          onPress={() => setIsMonthModalOpen(true)}
          style={{
            borderWidth: 1,
            borderColor: selectedMonth ? colors.line : colors.line,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 18,
            backgroundColor: colors.wt,
            height: 48,
            width: 120,
            justifyContent: 'center',
          }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Text
              sx={{
                ...textStyle.R_16_M,
                color: selectedMonth ? colors.bl : colors.gr3,
              }}
            >
              {selectedMonth
                ? months.find(m => m.value === selectedMonth)?.label
                : new Date().getMonth() + 1}
            </Text>
            <Icon
              as={ChevronsUpDown}
              color={colors.rd}
              mt={2}
              height={12}
              width={12}
            />
          </HStack>
        </Pressable>
        <Text sx={{ ...textStyle.H_W6_15, color: colors.gr2 }}>年</Text>
      </HStack>

      {/* Year Picker */}
      <HStack flex={1} alignItems="center" gap={16}>
        <Pressable
          onPress={() => setIsYearModalOpen(true)}
          style={{
            borderWidth: 1,
            borderColor: selectedMonth ? colors.line : colors.line,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 18,
            backgroundColor: colors.wt,
            height: 48,
            width: 120,
            justifyContent: 'center',
          }}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Text
              sx={{
                ...textStyle.R_16_M,
                color: selectedYear ? colors.bl : colors.gr3,
              }}
            >
              {selectedYear || new Date().getFullYear()}
            </Text>
            <Icon
              as={ChevronsUpDown}
              color={colors.rd}
              mt={2}
              height={12}
              width={12}
            />
          </HStack>
        </Pressable>
        <Text sx={{ ...textStyle.H_W6_15, color: colors.gr2 }}>月</Text>
      </HStack>

      {/* Month Modal */}
      <Modal
        isOpen={isMonthModalOpen}
        onClose={() => setIsMonthModalOpen(false)}
        size="full"
      >
        <ModalBackdrop />
        <ModalContent
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            margin: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            maxHeight: '50%',
          }}
        >
          <ModalHeader
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.gr6,
              paddingVertical: 16,
            }}
          >
            <HStack justifyContent="space-between" alignItems="center" flex={1}>
              <Box flex={1} />
              <Text sx={{ ...textStyle.H_W6_18, color: colors.bl }}>
                月を選択
              </Text>
              <HStack flex={1} justifyContent="flex-end">
                <ModalCloseButton>
                  <CloseIcon size="lg" color={colors.gr2} />
                </ModalCloseButton>
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody style={{ padding: 0 }}>
            <ScrollView>
              <VStack space="sm" padding={16}>
                {months.map(month => (
                  <Pressable
                    key={month.value}
                    onPress={() => handleMonthSelect(month.value)}
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor:
                        selectedMonth === month.value ? colors.lrd : colors.wt,
                      borderWidth: selectedMonth === month.value ? 1 : 0,
                      borderColor: colors.rd,
                    }}
                  >
                    <Text
                      sx={{
                        ...textStyle.H_W6_15,
                        color:
                          selectedMonth === month.value ? colors.rd : colors.bl,
                        textAlign: 'center',
                      }}
                    >
                      {month.label}月
                    </Text>
                  </Pressable>
                ))}
              </VStack>
            </ScrollView>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Year Modal */}
      <Modal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        size="full"
      >
        <ModalBackdrop />
        <ModalContent
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            margin: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            maxHeight: '50%',
          }}
        >
          <ModalHeader
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.gr6,
              paddingVertical: 16,
            }}
          >
            <HStack justifyContent="space-between" alignItems="center" flex={1}>
              <Box flex={1} />
              <Text sx={{ ...textStyle.H_W6_18, color: colors.bl }}>
                年を選択
              </Text>
              <HStack flex={1} justifyContent="flex-end">
                <ModalCloseButton>
                  <CloseIcon size="lg" color={colors.gr2} />
                </ModalCloseButton>
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody style={{ padding: 0 }}>
            <ScrollView>
              <VStack space="sm" padding={16}>
                {years.map(year => (
                  <Pressable
                    key={year.value}
                    onPress={() => handleYearSelect(year.value)}
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor:
                        selectedYear === year.value ? colors.lrd : colors.wt,
                      borderWidth: selectedYear === year.value ? 1 : 0,
                      borderColor: colors.rd,
                    }}
                  >
                    <Text
                      sx={{
                        ...textStyle.H_W6_15,
                        color:
                          selectedYear === year.value ? colors.rd : colors.bl,
                        textAlign: 'center',
                      }}
                    >
                      {year.label}年
                    </Text>
                  </Pressable>
                ))}
              </VStack>
            </ScrollView>
          </ModalBody>
        </ModalContent>
      </Modal>
    </HStack>
  );
};

export default MonthYearPicker;
