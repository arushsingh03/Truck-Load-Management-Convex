import { theme } from "../theme";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { api } from "../../convex/_generated/api";
import { View, StyleSheet, TextInput, Text } from "react-native";

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <View style={styles.container}>
      <Text style={styles.title}>Om Motors</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Register"
        onPress={() => navigation.navigate("Register")}
        variant="secondary"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
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
