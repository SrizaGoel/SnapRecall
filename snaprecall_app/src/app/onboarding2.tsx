import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Onboarding2() {
  return (
    <View style={styles.container}>

      <View style={styles.illustration}>
        <View style={styles.orb} />
      </View>

      <Text style={styles.title}>
        Talk To Your Knowledge
      </Text>

      <Text style={styles.subtitle}>
        Ask questions in natural language and get
        answers from everything you{"'"}ve learned.
      </Text>

      <Text style={styles.indicator}>
        ○ ● ○
      </Text>

      <View style={styles.buttonRow}>
        <Pressable onPress={() => router.push('/' as any)}>
          <Text style={styles.skip}>Back</Text>
        </Pressable>

        <Pressable
          style={styles.nextButton}
          onPress={() => router.push('/onboarding3' as any)}
        >
          <Text style={styles.nextText}>
            Next →
          </Text>
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

  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#B497D6',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A4458',
    textAlign: 'center',
    marginBottom: 15,
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
  },

  skip: {
    fontSize: 16,
    color: '#777',
  },

  nextButton: {
    backgroundColor: '#B497D6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },

  nextText: {
    color: 'white',
    fontWeight: '600',
  },
});