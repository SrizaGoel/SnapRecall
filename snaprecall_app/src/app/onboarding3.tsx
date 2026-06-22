import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Onboarding3() {
  return (
    <View style={styles.container}>

      <View style={styles.illustration}>
        <View style={styles.orb} />
      </View>

      <Text style={styles.title}>
        Never Lose Context
      </Text>

      <Text style={styles.subtitle}>
        Search, summarize and revise instantly
        with AI-powered recall built for students.
      </Text>

      <Text style={styles.indicator}>
        ○ ○ ●
      </Text>

      <Pressable
        style={styles.getStartedButton}
        onPress={() => router.push('/login' as any)}
      >
        <Text style={styles.getStartedText}>
          Get Started
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?
        </Text>

        <Pressable onPress={() => router.push('/login' as any)}>
          <Text style={styles.link}>
            {' '}Log In
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
    marginBottom: 40,
  },

  getStartedButton: {
    backgroundColor: '#B497D6',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 15,
  },

  getStartedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    marginTop: 25,
  },

  footerText: {
    color: '#666',
  },

  link: {
    color: '#9D7AD6',
    fontWeight: 'bold',
  },
});