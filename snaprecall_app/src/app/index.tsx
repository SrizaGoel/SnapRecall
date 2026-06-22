import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* Illustration Placeholder */}
      <View style={styles.illustration}>
        <Text style={styles.emoji}>📸</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Capture Your Learning
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Save screenshots, notes and study materials
        without worrying about losing track of them.
      </Text>

      {/* Page Indicator */}
      <Text style={styles.indicator}>
        ● ○ ○
      </Text>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Pressable onPress={() => router.push('/login' as any)}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>

        <Pressable style={styles.nextButton}
        onPress={() => router.push('/onboarding2' as any)}>
          <Text style={styles.nextText}>Next →</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  illustration: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E8DDF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },

  emoji: {
    fontSize: 80,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A4458',
    marginBottom: 15,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },

  indicator: {
    fontSize: 20,
    color: '#9D7AD6',
    marginBottom: 50,
  },

  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  skip: {
    color: '#888',
    fontSize: 16,
  },

  nextButton: {
    backgroundColor: '#B497D6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },

  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
