import React from "react";
import { theme } from "../theme";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { View, StyleSheet, Text } from "react-native";

export const ProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{user.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{user.address}</Text>
        </View>
      </View>
      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate("EditProfile")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  label: {
    width: 80,
    fontWeight: "bold",
    color: theme.colors.secondary,
  },
  value: {
    flex: 1,
    color: theme.colors.secondary,
  },
});
