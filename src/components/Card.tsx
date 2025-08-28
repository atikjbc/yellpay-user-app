// ResponsiveCard.tsx
import { Image } from '@gluestack-ui/themed';
import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/colors';

interface ResponsiveCardProps {
  cardType?: string;
}

const ResponsiveCard = ({ cardType }: ResponsiveCardProps) => {
  return (
    <View
      style={{
        position: 'relative',
        margin: 16,
        width: '90%', // responsive width
        aspectRatio: 16 / 9, // keeps image responsive
        borderRadius: 12,
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
          width: 47,
          height: 30,
          resizeMode: 'cover',
          zIndex: 900,
          bottom: cardType !== 'visa' ? 29 : 24,
          right:
            cardType === 'visa'
              ? 120
              : cardType === 'mastercard'
                ? 110
                : cardType === 'jcb'
                  ? 100
                  : cardType === 'amex'
                    ? 100
                    : cardType === 'diners'
                      ? 100
                      : 24,
        }}
      />
      {cardType === 'visa' && (
        <Image
          source={require('../../assets/images/visa.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: 80,
            height: 25,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: 24,
            right: 24,
          }}
        />
      )}
      {cardType === 'mastercard' && (
        <Image
          source={require('../../assets/images/mastercard.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: 60,
            height: 40,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: 24,
            right: 24,
          }}
        />
      )}
      {cardType === 'jcb' && (
        <Image
          source={require('../../assets/images/jcb.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: 55,
            height: 40,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: 24,
            right: 24,
          }}
        />
      )}
      {cardType === 'amex' && (
        <Image
          source={require('../../assets/images/amex.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: 55,
            height: 55,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: 24,
            backgroundColor: colors.wt,
            right: 24,
          }}
        />
      )}
      {cardType === 'diners' && (
        <Image
          source={require('../../assets/images/diners-club.png')} // example image
          alt="Responsive"
          style={{
            position: 'absolute',
            width: 55,
            height: 40,
            resizeMode: 'cover',
            zIndex: 900,
            bottom: 24,
            right: 24,
          }}
        />
      )}
    </View>
  );
};

export default ResponsiveCard;
