import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { useGoogleSignIn } from "./GoogleSignIn";

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const { request, promptAsync } = useGoogleSignIn(navigation);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/snaprecall-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Create your SnapRecall profile and start learning smarter.
        </Text>

        <TextInput
          placeholder="Choose a username"
          placeholderTextColor="#7FA8C7"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => promptAsync()}
          disabled={!request}
          activeOpacity={0.85}
        >
          <Text style={styles.googleText}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.link}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.replace("Home")}
        activeOpacity={0.7}
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
    width: 135,
    height: 135,
    marginBottom: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#EAF6FF",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 35,
    color: "#9FC8E8",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#132638",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2F4C63",
    paddingHorizontal: 18,
    color: "#EAF6FF",
    fontSize: 16,
    marginBottom: 18,
  },

  googleButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#3B6F91",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4F88AF",
  },

  googleText: {
    color: "#F5FAFF",
    fontSize: 17,
    fontWeight: "600",
  },

  loginText: {
    marginTop: 28,
    color: "#7FA8C7",
    fontSize: 15,
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