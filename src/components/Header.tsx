import React from "react";
import { theme } from "../theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

type HeaderProps = {
  isAdmin: boolean;
  navigation: any;
};

export const Header = ({ isAdmin, navigation }: HeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogout = () => {
    setUser(null);
    navigation.replace("Login");
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>Om Motors</Text>
          {isAdmin && <Text style={styles.adminBadge}>Admin</Text>}
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <MaterialIcons
              name="person"
              size={24}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => alert("Chat feature coming soon!")}
          >
            <MaterialIcons
              name="chat"
              size={24}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <MaterialIcons
              name="logout"
              size={24}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    height: 60,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  adminBadge: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    fontSize: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: theme.spacing.sm,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
});
