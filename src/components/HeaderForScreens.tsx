import React from "react";
import { theme } from "../theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

type HeaderProps = {
  navigation: any;
  title: string;
};

export const HeaderForScreen = ({ navigation, title }: HeaderProps) => {
  const setUser = useAuthStore((state) => state.setUser);

  // Get the current route from navigation
  const navigationState = navigation.getState();
  const currentRoute =
    navigationState.routes[navigationState.index]?.name || "";

  console.log("Current Route:", currentRoute); // Log the current route for debugging

  const handleLogout = () => {
    setUser(null);
    navigation.replace("Login");
  };

  const handleChat = () => {
    alert("Chat feature coming soon!");
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          {/* Conditionally render Profile icon */}
          {currentRoute !== "Profile" && (
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
          )}

          {/* Conditionally render Chat icon */}
          {currentRoute !== "Chat" && (
            <TouchableOpacity style={styles.iconButton} onPress={handleChat}>
              <MaterialIcons
                name="chat"
                size={24}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>
          )}

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
    color: theme.colors.icon,
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
