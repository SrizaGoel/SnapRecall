import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomeScreen({ navigation }) {
    useEffect(() => {
        const checkLogin = async () => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const token = await AsyncStorage.getItem("userToken");
            if (token) {
                navigation.replace("Home");
            } else {
                navigation.replace("Login");
            }
        };
        checkLogin();
    }, []);
return (
    <View style={styles.container}>
      <Image
        source={require("../assets/snaprecall-logo.png")} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>SnapRecall</Text>

      <Text style={styles.subtitle}>
        Learn smarter. Remember longer.
      </Text>

      <ActivityIndicator
        size="large"
        color="#6EC1FF"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08131F",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  logo: {
    width: 180,
    height: 180,
    marginBottom: 25,
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#EAF6FF",
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#9FC8E8",
    textAlign: "center",
  },

  loader: {
    marginTop: 45,
  },
});