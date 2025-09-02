import { Image, Text, VStack } from '@gluestack-ui/themed';
import { ImageSourcePropType } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

interface GuidelineItem {
  source: ImageSourcePropType;
  aspectRatio?: number;
}

interface GuidelineListProps {
  title: string;
  subtitle: string;
  images: GuidelineItem[];
  note?: string;
}

export const GuidelineList = ({
  title,
  subtitle,
  images,
  note,
}: GuidelineListProps) => {
  return (
    <>
      <Text
        sx={{
          paddingTop: 40,
          ...textStyle.H_W6_18,
          color: colors.rd,
        }}
      >
        {title}
      </Text>
      <Text
        sx={{
          ...textStyle.H_W3_15,
          color: colors.gr2,
          paddingTop: 8,
        }}
      >
        {subtitle}
      </Text>
      <VStack paddingVertical={16} gap={16}>
        {images.map((image, index) => (
          <Image
            key={index}
            source={image.source}
            alt={`guideline-image-${index}`}
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: image.aspectRatio || 342 / 184,
            }}
            resizeMode="contain"
          />
        ))}
        {note && (
          <Text
            sx={{
              ...textStyle.H_W6_13,
              color: colors.gr2,
              paddingTop: 6,
              paddingBottom: 8,
            }}
          >
            {note}
          </Text>
        )}
      </VStack>
    </>
  );
};
