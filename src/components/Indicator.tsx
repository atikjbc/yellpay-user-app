import { HStack } from '@gluestack-ui/themed';
import { View } from 'react-native';

interface IndicatorProps {
  total: number;
  activeIndex: number;
}

const Indicator = ({ total, activeIndex }: IndicatorProps) => {
  const isActive = (index: number) => index === activeIndex;

  return (
    <HStack justifyContent="center" alignItems="center" space="md" mb="$2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={{
            bottom: 0,
            marginTop: 24,
            width: 10,
            height: 10,
            borderRadius: 50,
            backgroundColor: isActive(index) ? '#E60012' : '#C9C9C9',
          }}
        />
      ))}
    </HStack>
  );
};

export default Indicator;
