import React, { useState } from "react";
import { useAction } from "convex/react";
import { Button } from "../components/Button";
import { api } from "../../convex/_generated/api";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "../theme";

export const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  {/* @ts-ignore */}
  const register = useAction(api.auth.register);

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register({
        ...registrationData,
        isAdmin: false,
      });
      navigation.replace("Login");
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
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.slogan}>
              Create Your <Text style={styles.highlightText}>Account</Text>
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <FontAwesome
                name="user"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={formData.name}
                onChangeText={(value) =>
                  setFormData({ ...formData, name: value })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="phone"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phone}
                onChangeText={(value) =>
                  setFormData({ ...formData, phone: value })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) =>
                  setFormData({ ...formData, email: value })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) =>
                  setFormData({ ...formData, password: value })
                }
                secureTextEntry={!showPassword}
              />
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.muted}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  setFormData({ ...formData, confirmPassword: value })
                }
                secureTextEntry={!showConfirmPassword}
              />
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.muted}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Address"
                value={formData.address}
                onChangeText={(value) =>
                  setFormData({ ...formData, address: value })
                }
                multiline
                numberOfLines={3}
              />
            </View>

            <Button
              title="Register"
              onPress={handleRegister}
              variant="primary"
            />
            <Button
              title="Go Back"
              onPress={() => navigation.navigate("Login")}
              variant="outline"
            ></Button>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
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
  slogan: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  highlightText: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.shadow,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  textArea: {
    height: 40,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: theme.spacing.md,
  },
});
