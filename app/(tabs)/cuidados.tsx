import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CuidadosScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tela de Cuidados</ThemedText>
      <ThemedText>Aqui você encontrará informações sobre cuidados.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});