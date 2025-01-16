import React from "react";
import { theme } from "../theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";

type HeaderProps = {
  isAdmin: boolean;
  navigation: any;
};

export const Header = ({ isAdmin, navigation }: HeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert(
        'Logout Failed',
        'Unable to logout. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getRoleBadge = () => {
    switch (user?.userType) {
      case "admin":
        return "Admin";
      case "driver":
        return "Driver";
      case "motorOwner":
        return "Motor Owner";
      case "transporter":
        return "Transporter";
      default:
        return null;
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>Om Motors</Text>
          {user?.userType && <Text style={styles.roleBadge}>{getRoleBadge()}</Text>}
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <MaterialIcons name="person" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => alert("Chat feature coming soon!")}
          >
            <MaterialIcons name="chat" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={theme.colors.secondary} />
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
  roleBadge: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    fontSize: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: theme.spacing.sm,
    textTransform: "capitalize",
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
