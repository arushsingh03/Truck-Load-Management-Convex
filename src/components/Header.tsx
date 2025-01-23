import React, { useState } from "react";
import { theme } from "../theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  Pressable,
} from "react-native";

type HeaderProps = {
  isAdmin: boolean;
  navigation: any;
};

export const Header = ({ isAdmin, navigation }: HeaderProps) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Failed", "Unable to logout. Please try again.", [
        { text: "OK" },
      ]);
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

  const menuItems = [
    {
      icon: "person",
      label: "Profile",
      onPress: () => {
        navigation.navigate("Profile");
        setDropdownVisible(false);
      },
    },
    {
      icon: "chat",
      label: "Chat",
      onPress: () => {
        alert("Chat feature coming soon!");
        setDropdownVisible(false);
      },
    },
    {
      icon: "logout",
      label: "Logout",
      onPress: () => {
        handleLogout();
        setDropdownVisible(false);
      },
    },
  ];

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>Om Motors Transport</Text>
          {user?.userType && (
            <Text style={styles.roleBadge}>{getRoleBadge()}</Text>
          )}
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <MaterialIcons
              name="more-vert"
              size={24}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>

          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setDropdownVisible(false)}
            >
              <View style={styles.dropdownMenu}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <MaterialIcons
                      //@ts-ignore
                      name={item.icon}
                      size={24}
                      color={theme.colors.secondary}
                      style={styles.menuItemIcon}
                    />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>
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
    position: "relative",
  },
  menuButton: {
    padding: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownMenu: {
    position: "absolute",
    top: 60,
    right: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemIcon: {
    marginRight: theme.spacing.sm,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
});
