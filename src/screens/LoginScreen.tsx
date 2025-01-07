import React, { useState } from "react";
import { useAction } from "convex/react";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { api } from "../../convex/_generated/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ImageBackground,
  Image,
  SafeAreaView,
} from "react-native";

import { theme } from "../theme";

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // @ts-ignore
  const login = useAction(api.auth.login);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    try {
      const userData = await login({ phone, password });
      const user = { ...userData, id: userData._id };
      setUser(user);
      if (user.isAdmin) {
        navigation.replace("AdminDashboard");
      } else {
        navigation.replace("UserDashboard");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.sloganline1}>
              Effortless <Text style={styles.highlightText}>Transport</Text>
            </Text>
            <Text style={styles.slogan}>
              At Your <Text style={styles.highlightText}>Fingertips</Text>
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="phone"
                size={24}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Login" onPress={handleLogin} variant="primary" />
              <Button
                title="Register"
                onPress={() => navigation.navigate("Register")}
                variant="outline"
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 15,
  },
  slogan: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  sloganline1: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
  },
  highlightText: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderRadius: 16,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 5,
    marginVertical: theme.spacing.sm,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: theme.spacing.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
});
