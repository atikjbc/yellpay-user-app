import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

export const Safe: React.FC<React.PropsWithChildren> = ({ children }) => (
  <SafeAreaView style={styles.safe}>
    <View style={styles.container}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, gap: 12 },
});
