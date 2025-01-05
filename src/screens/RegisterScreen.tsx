import { theme } from "../theme";
import React, { useState } from "react";
import { Button } from "../components/Button";
import { View, StyleSheet, TextInput, ScrollView, Text } from "react-native";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

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
    <ScrollView style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={(value) => setFormData({ ...formData, name: value })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phone}
        onChangeText={(value) => setFormData({ ...formData, phone: value })}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => setFormData({ ...formData, email: value })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => setFormData({ ...formData, password: value })}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(value) =>
          setFormData({ ...formData, confirmPassword: value })
        }
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(value) => setFormData({ ...formData, address: value })}
        multiline
        numberOfLines={3}
      />
      <Button title="Register" onPress={handleRegister} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
});
