// ResponsiveCard.tsx
import { Image } from '@gluestack-ui/themed';
import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/colors';

interface ResponsiveCardProps {
  cardType?: string;
  isSmall?: boolean;
}

const ResponsiveCard = ({ cardType, isSmall }: ResponsiveCardProps) => {
  return (
    <View
      style={{
        position: 'relative',
        margin: isSmall ? 0 : 16,
        width: '90%', // responsive width
        aspectRatio: 16 / 9, // keeps image responsive
        borderRadius: isSmall ? 6 : 12,
        overflow: 'hidden',
        alignSelf: 'center',
      }}
    >
      <Image
        source={
          cardType
            ? require('../../assets/images/card-background.png')
            : require('../../assets/images/card-background-default.png')
        } // example image
        alt="Responsive"
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
        }}
      />
      <Image
        source={
          cardType
            ? require('../../assets/images/card-company-logo.png')
            : require('../../assets/images/card-company-logo-default.png')
        } // example image
        alt="Responsive"
        style={{
          position: 'absolute',
          width: '71.74%',
          height: '41.94%',
          resizeMode: 'cover',
          zIndex: 900,
          top: 16,
          left: 16,
        }}
      />
      <Image
        source={require('../../assets/images/cards.png')} // example image
        alt="Responsive"
        style={{
          position: 'absolute',
          width: isSmall ? 15.6666666667 : 47,
          height: isSmall ? 10 : 30,
          resizeMode: 'cover',
          zIndex: 900,
          bottom: isSmall ? 7 : cardType !== 'visa' ? 29 : 24,
          right:
            cardType === 'visa'
              ? isSmall
                ? 40
                : 120
              : cardType === 'mastercard'
                ? isSmall
                  ? 35
                  : 110
                : cardType === 'jcb'
                  ? isSmall
                    ? 37
                    : 100
                  : cardType === 'amex'
                    ? isSmall
                      ? 35
                      : 100
                    : cardType === 'diners'
                      ? isSmall
                        ? 37
                        : 100
                      : 14,
        }}
      />
      {cardType === 'visa' && (
        <Image
          source={require('../../assets/images/visa.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: isSmall ? 24 : 80,
            height: isSmall ? 7.5 : 25,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: isSmall ? 7 : 24,
            right: isSmall ? 14 : 24,
          }}
        />
      )}
      {cardType === 'mastercard' && (
        <Image
          source={require('../../assets/images/mastercard.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: isSmall ? 15 : 60,
            height: isSmall ? 10 : 40,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: isSmall ? 7 : 24,
            right: isSmall ? 14 : 24,
          }}
        />
      )}
      {cardType === 'jcb' && (
        <Image
          source={require('../../assets/images/jcb.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: isSmall ? 16.5 : 55,
            height: isSmall ? 12 : 40,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: isSmall ? 7 : 24,
            right: isSmall ? 15 : 24,
          }}
        />
      )}
      {cardType === 'amex' && (
        <Image
          source={require('../../assets/images/amex.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: isSmall ? 14 : 55,
            height: isSmall ? 14 : 55,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: isSmall ? 6 : 24,
            right: isSmall ? 15 : 24,
            backgroundColor: colors.wt,
          }}
        />
      )}
      {cardType === 'diners' && (
        <Image
          source={require('../../assets/images/diners-club.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: isSmall ? 16.5 : 55,
            height: isSmall ? 12 : 40,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: isSmall ? 6 : 24,
            right: isSmall ? 15 : 24,
          }}
        />
      )}
    </View>
  );
};

export default ResponsiveCard;
