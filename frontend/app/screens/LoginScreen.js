import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useGoogleSignIn } from "./GoogleSignIn";

export default function LoginScreen({ navigation }) {
  const { request, promptAsync } = useGoogleSignIn(navigation);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/snaprecall-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>SnapRecall</Text>

        <Text style={styles.subtitle}>
          Continue your learning journey.
        </Text>
        <View style={styles.placeholder} />

        <TouchableOpacity
          style={styles.googleButton}
          activeOpacity={0.85}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>
            New to SnapRecall?{" "}
            <Text style={styles.link}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.skipButton}
        activeOpacity={0.7}
        onPress={() => navigation.replace("Home")}
      >
        <Text style={styles.skipText}>Skip for now →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08131F",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 35,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 120,
  },

  logo: {
    width: 145,
    height: 145,
    marginBottom: 18,
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#EAF6FF",
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 16,
    color: "#9FC8E8",
    textAlign: "center",
    lineHeight: 24,
  },
  placeholder: {
    width: "100%",
    height: 56,
    marginBottom: 18,
  },

  googleButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#355F7E",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4B7A9D",
  },

  googleText: {
    color: "#F5FAFF",
    fontSize: 17,
    fontWeight: "600",
  },

  signupText: {
    marginTop: 28,
    fontSize: 15,
    color: "#7FA8C7",
  },

  link: {
    color: "#9FC8E8",
    fontWeight: "700",
  },

  skipButton: {
    alignItems: "center",
    paddingBottom: 10,
  },

  skipText: {
    color: "#9FC8E8",
    fontSize: 16,
    fontWeight: "600",
  },
});