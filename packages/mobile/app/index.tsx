import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Organização Mobile</Text>
      <Text style={styles.subtitle}>
        Aplicação React Native com Expo e TypeScript em um monorepo.
      </Text>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Expo</Text>
          <Text style={styles.featureText}>Framework React Native moderno</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>TypeScript</Text>
          <Text style={styles.featureText}>Type safety em todo o código</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Monorepo</Text>
          <Text style={styles.featureText}>Yarn Workspaces para gerenciamento</Text>
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    gap: 15,
  },
  feature: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0070f3',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
});
