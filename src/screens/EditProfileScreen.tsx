import { theme } from "../theme";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { api } from "../../convex/_generated/api";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const EditProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
  });
  const [error, setError] = useState("");

  const updateProfile = useMutation(api.users.updateProfile);

  const handleSubmit = async () => {
    try {
      if (user?.id) {
        const updatedUser = await updateProfile({ ...formData, id: user.id });
        setUser(updatedUser);
        navigation.goBack();
      } else {
        setError("User ID is missing");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/4861242.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.header}>Edit Profile</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" style={styles.icon} />
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
              <Ionicons name="call-outline" style={styles.icon} />
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
              <Ionicons name="mail-outline" style={styles.icon} />
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
              <Ionicons name="location-outline" style={styles.icon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Address"
                value={formData.address}
                onChangeText={(value) =>
                  setFormData({ ...formData, address: value })
                }
                multiline
              />
            </View>
          </View>

          <Button title="Save Changes" onPress={handleSubmit} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 16,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: theme.spacing.xl,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.secondary,
  },
  textArea: {
    textAlignVertical: "top",
  },
  error: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  background: {
    flex: 1,
  },
});
