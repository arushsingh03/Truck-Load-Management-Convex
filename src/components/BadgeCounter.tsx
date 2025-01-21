import React from "react";
import { theme } from "../theme";
import { Text, View } from "react-native";

const BadgeCounter = ({ count }: { count: number }) => {
  if (!count || count === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        right: -5,
        top: 1,
        backgroundColor: theme.colors.text,
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
      }}
    >
      <Text
        style={{
          color: theme.colors.light,
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
};
export default BadgeCounter;
