import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

interface BannerSliderProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const BannerSlider: React.FC<BannerSliderProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 10000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, autoPlay, autoPlayInterval, images.length]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (screenWidth - 32));
    setActiveIndex(index);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * (screenWidth - 32),
      animated: true,
    });
  };

  return (
    <View style={{ width: '100%', paddingHorizontal: 16 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ width: screenWidth - 32, height: 90, borderRadius: 3 }}
      >
        <TouchableOpacity onPress={() => router.push('/user-guide')}>
          <Image
            source={require('../../assets/images/banner-1.png')}
            alt="Banner 1"
            style={{
              width: screenWidth - 32,
              height: 90,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../assets/images/banner-2.png')}
            alt="Banner 2"
            style={{
              width: screenWidth - 32,
              height: 90,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Round Indicators */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 16,
          gap: 8,
        }}
      >
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={{
              width: 6,
              height: 6,
              borderRadius: 6,
              backgroundColor: index === activeIndex ? colors.rd : colors.gr6,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerSlider;
