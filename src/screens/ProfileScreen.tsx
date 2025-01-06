import React from "react";
import { theme } from "../theme";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  ImageBackground,
} from "react-native";

export const ProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/whitebg.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.header}>Your Profile</Text>
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
  row: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  label: {
    flex: 0.4,
    fontWeight: "bold",
    color: theme.colors.secondary,
    fontSize: 16,
  },
  value: {
    flex: 0.6,
    color: theme.colors.secondary,
    fontSize: 16,
  },
  background: {
    flex: 1,
  },
});
