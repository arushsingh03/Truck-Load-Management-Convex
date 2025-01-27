import React, { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { api } from "../../convex/_generated/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { theme } from "../theme";

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // @ts-ignore
  const login = useAction(api.auth.login);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("@user_data");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        navigateToApp(userData.isAdmin);
      }
    } catch (error) {
      console.error("Error checking stored user:", error);
    } finally {
      setIsInitializing(false);
    }
  };

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

  const navigateToApp = (isAdmin: boolean) => {
    navigation.replace(isAdmin ? "AdminDashboard" : "UserDashboard");
  };

  const handleLogin = async () => {
    try {
      setError("");
      if (!validateInputs()) return;

      setIsLoading(true);
      const userData = await login({ phone, password });

      await AsyncStorage.setItem("@user_data", JSON.stringify(userData));

      const user = { ...userData, id: userData._id };
      setUser(user);

      navigateToApp(user.isAdmin);
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

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
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
                  setPhone(text.replace(/[^0-9]/g, ""));
                  setError("");
                }}
                keyboardType="phone-pad"
                maxLength={15}
                editable={!isLoading}
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
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
              disabled={isLoading}
            >
              {/* <Text style={styles.forgotPasswordText}>Forgot Password?</Text> */}
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
        </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
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
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 15,
  },
  sloganline1: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
  },
  slogan: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  highlightText: {
    color: theme.colors.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
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
  buttonContainer: {
    gap: theme.spacing.sm,
  },
});
