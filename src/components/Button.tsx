import React from "react";
import { theme } from "../theme";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "outline";
  iconName?:
    | keyof typeof MaterialIcons.glyphMap
    | keyof typeof MaterialCommunityIcons.glyphMap;
};

export const Button = ({
  title,
  onPress,
  variant = "primary",
  iconName,
}: ButtonProps) => {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isTertiary = variant === "tertiary";
  const isDanger = variant === "danger";
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary && styles.primaryButton,
        isSecondary && styles.secondaryButton,
        isTertiary && styles.tertiaryButton,
        isDanger && styles.dangerButton,
        isOutline && styles.outlineButton,
      ]}
      onPress={onPress}
    >
      <View style={styles.contentContainer}>
        {iconName &&
          (iconName in MaterialIcons.glyphMap ? (
            <MaterialIcons
              name={iconName as keyof typeof MaterialIcons.glyphMap}
              size={20}
              color={
                isPrimary || isDanger
                  ? theme.colors.background
                  : theme.colors.primary
              }
              style={styles.icon}
            />
          ) : (
            <MaterialCommunityIcons
              name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
              size={20}
              color={
                isPrimary || isDanger
                  ? theme.colors.background
                  : theme.colors.primary
              }
              style={styles.icon}
            />
          ))}
        <Text
          style={[
            styles.buttonText,
            isSecondary && styles.secondaryButtonText,
            isTertiary && styles.tertiaryButtonText,
            isOutline && styles.outlineButtonText,
            isDanger && styles.dangerButtonText,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  tertiaryButton: {
    backgroundColor: theme.colors.tertiary || "transparent",
  },
  dangerButton: {
    backgroundColor: theme.colors.danger || "red",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderColor: theme.colors.primary,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  tertiaryButtonText: {
    color: theme.colors.text,
  },
  dangerButtonText: {
    color: theme.colors.background,
  },
  outlineButtonText: {
    color: theme.colors.primary,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
});
