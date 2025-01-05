import { theme } from "../theme";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { api } from "../../convex/_generated/api";
import Entypo from "@expo/vector-icons/Entypo";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ImageBackground,
  Image,
} from "react-native";

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
          </Text>{" "}
          <Text style={styles.slogan}>
            At Your{" "}
            <Text style={styles.highlightText}>
              Fingertips <Entypo name="quote" size={24} color="black" />{" "}
            </Text>
          </Text>
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
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    marginLeft: 22,
  },
  sloganline1: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
    marginLeft: 7,
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
