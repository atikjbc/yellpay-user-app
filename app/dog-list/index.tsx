// src/screens/DogListScreen.tsx
import { Box, Heading, Text, VStack } from '@gluestack-ui/themed';
import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import { useGetBreedsQuery } from '../../src/services/dogApi';

const DogListScreen: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetBreedsQuery();

  const breeds = useMemo(() => {
    if (!data?.message) return [] as string[];
    return Object.keys(data.message).sort();
  }, [data]);

  if (isLoading) return <Text p="$4">Loading…</Text>;
  if (isError) return <Text p="$4">Failed to load. Pull to retry.</Text>;

  return (
    <VStack flex={1} p="$6" space="md">
      <Heading size="xl">Dog Breeds</Heading>
      <FlatList
        data={breeds}
        keyExtractor={item => item}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <Box borderBottomWidth={1} borderColor="$borderLight300" py="$3">
            <Text size="lg">{item}</Text>
          </Box>
        )}
      />
    </VStack>
  );
};

export default DogListScreen;
