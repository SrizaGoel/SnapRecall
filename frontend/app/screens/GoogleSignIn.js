import React, { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import { createClient } from "@supabase/supabase-js";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api"
WebBrowser.maybeCompleteAuthSession();

// Initialize Supabase Client
const SUPABASE_URL = "https://vjaxpowrwqzmeduqvkex.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXhwb3dyd3F6bWVkdXF2a2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjI1MDgsImV4cCI6MjA5ODYzODUwOH0.xzv7S57iOZsAshVrvIltz1pL_Akp8Ki4sjacwKpwwnw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// const BACKEND_URL = "http://10.0.2.2:8000"; 

// Helper function to parse URL query/hash parameters
function parseQueryParams(url) {
  const params = {};
  const anchorIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const startIndex = anchorIndex !== -1 ? anchorIndex + 1 : (queryIndex !== -1 ? queryIndex + 1 : -1);

  if (startIndex !== -1) {
    const queryString = url.substring(startIndex);
    const pairs = queryString.split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
  }
  return params;
}

export function useGoogleSignIn(navigation) {
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  // Handle deep link events (Android callback)
  const handleDeepLink = async (url) => {
    if (!url) return;
    console.log("Deep link received URL:", url);
    const params = parseQueryParams(url);
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    if (accessToken) {
      try {
        setIsSigningIn(true);
        console.log("Exchanging session tokens...");
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        const supabaseUser = sessionData.user;
        if (!supabaseUser) throw new Error("No user in session");

        console.log("Registering/Logging in on FastAPI backend...");
        // Call FastAPI backend
        const res = await api.post(`/auth/google`, {
          email: supabaseUser.email,
          username: supabaseUser.user_metadata?.full_name || supabaseUser.email.split("@")[0],
          firebase_uid: supabaseUser.id, // Supabase UUID
        });

        const { user_id, username, status } = res.data;

        await AsyncStorage.setItem("userData", JSON.stringify({ user_id, username, email: supabaseUser.email }));
        await AsyncStorage.setItem("userToken", accessToken);

        if (status === "new") {
          Alert.alert("Welcome! 🎉", `Account created for ${username}`);
        } else {
          Alert.alert("Welcome back!", `Logged in as ${username}`);
        }

        navigation.replace("Home", { user_id, username });
      } catch (err) {
        console.error("Deep Link Auth Error:", err);
        Alert.alert("Sign-In Failed", err.message || "Failed to process login redirect.");
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  // Listen to deep links on component mount
  useEffect(() => {
    // Check if app was opened from a deep link initially
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen to incoming deep links while app is open
    const subscription = Linking.addEventListener("url", (event) => {
      if (event.url) handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const promptAsync = async () => {
    try {
      setIsSigningIn(true);
      // const redirectUrl = AuthSession.makeRedirectUri({
      //   path: "oauth-callback",
      // });
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "snaprecall",
        path: "oauth-callback",
      });

      console.log("Redirect URL:", redirectUrl);
      console.log("----------------- DEBUG AUTH -----------------");
      console.log("Generated Redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No URL returned from Supabase OAuth");

      console.log("Supabase Auth URL:", data.url);

      // Open the browser session
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      console.log("WebBrowser Result:", result);

      if (result.type === "success") {
        // Fallback for iOS where openAuthSessionAsync resolves successfully with the redirect URL
        await handleDeepLink(result.url);
      }
    } catch (err) {
      console.error("OAuth Launch Error:", err);
      Alert.alert("Sign-In Failed", err.message || "Could not launch Google Sign-In.");
      setIsSigningIn(false);
    } finally {
      console.log("----------------------------------------------");
    }
  };

  return { request: true, promptAsync, isSigningIn };
}
