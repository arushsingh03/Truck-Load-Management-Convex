import React, { useState } from "react";
import { useAction } from "convex/react";
import { Button } from "../components/Button";
import { api } from "../../convex/_generated/api";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ImageBackground,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";

export const ResetPasswordScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const [formData, setFormData] = useState({
    phone: route.params?.phone || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetPassword = useAction(api.auth.resetPassword);

  const handleSubmit = async () => {
    try {
      setError("");

      if (
        !formData.phone.trim() ||
        !formData.newPassword.trim() ||
        !formData.confirmPassword.trim()
      ) {
        setError("All fields are required");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setIsLoading(true);

      await resetPassword({
        phone: formData.phone,
        newPassword: formData.newPassword,
      });

      Alert.alert("Success", "Password has been reset successfully", [
        {
          text: "OK",
          onPress: () => navigation.replace("Login"),
        },
      ]);
    } catch (error) {
      // @ts-ignore
      const errorMessage = error.message || "Failed to reset password";
      if (errorMessage.includes("User not found")) {
        setError("No account found with this phone number");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
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
            <Text style={styles.header}>Reset Password</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phone}
                onChangeText={(value) =>
                  setFormData({ ...formData, phone: value })
                }
                keyboardType="phone-pad"
                editable={!route.params?.phone}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={formData.newPassword}
                onChangeText={(value) =>
                  setFormData({ ...formData, newPassword: value })
                }
                secureTextEntry={!showPassword}
              />
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                style={[styles.icon, styles.eyeIcon]}
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  setFormData({ ...formData, confirmPassword: value })
                }
                secureTextEntry={!showPassword}
              />
            </View>

            <Button
              title={isLoading ? "Resetting Password..." : "Reset Password"}
              onPress={handleSubmit}
              disabled={isLoading}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  icon: {
    fontSize: 20,
    color: theme.colors.secondary,
    marginRight: theme.spacing.md,
  },
  eyeIcon: {
    marginRight: 0,
    padding: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.secondary,
    padding: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
});
