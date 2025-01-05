import { theme } from "../theme";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { api } from "../../convex/_generated/api";
import { View, StyleSheet, TextInput, ScrollView, Text } from "react-native";

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
      const updatedUser = await updateProfile({ ...formData, id: user?.id });
      setUser(updatedUser);
      navigation.goBack();
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
        placeholder="Address"
        value={formData.address}
        onChangeText={(value) => setFormData({ ...formData, address: value })}
        multiline
        numberOfLines={3}
      />
      <Button title="Save Changes" onPress={handleSubmit} />
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
