// src/app/Providers.tsx
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import React from 'react';

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <GluestackUIProvider config={config}>{children}</GluestackUIProvider>;
};

export default Providers;
