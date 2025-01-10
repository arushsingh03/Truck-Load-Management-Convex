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
  TouchableOpacity,
  Alert,
} from "react-native";

import { theme } from "../theme";

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // @ts-ignore
  const login = useAction(api.auth.login);
  // @ts-ignore
  const requestPasswordReset = useAction(api.auth.requestPasswordReset);
  const setUser = useAuthStore((state) => state.setUser);

  const validateInputs = () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      setError("");
      if (!validateInputs()) return;

      setIsLoading(true);
      const userData = await login({ phone, password });
      const user = { ...userData, id: userData._id };
      setUser(user);

      if (user.isAdmin) {
        navigation.replace("AdminDashboard");
      } else {
        navigation.replace("UserDashboard");
      }
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred";
      if (errorMessage.includes("credentials")) {
        setError("Invalid phone number or password");
      } else if (errorMessage.includes("approved")) {
        setError("Your account is pending approval");
      } else {
        setError("Unable to login. Please try again later");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!phone.trim()) {
      Alert.alert(
        "Phone Number Required",
        "Please enter your phone number to reset password"
      );
      return;
    }

    navigation.navigate("ResetPassword", { phone });
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

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error"
                  size={20}
                  color={theme.colors.error}
                />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

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
                onChangeText={(text) => {
                  setPhone(text);
                  setError("");
                }}
                keyboardType="phone-pad"
                maxLength={15}
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
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <Button
                title={isLoading ? "Logging in..." : "Login"}
                onPress={handleLogin}
                variant="primary"
                disabled={isLoading}
              />
              <Button
                title="Register"
                onPress={() => navigation.navigate("Register")}
                variant="outline"
                disabled={isLoading}
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
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.error}20`,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
});
