import React from "react";
import dayjs from "dayjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const NotificationBell = ({ onPress }: { onPress: () => void }) => {
  const lastCheckedAt = dayjs()
    .subtract(24, "hours")
    .format("YYYY-MM-DD HH:mm:ss");
  const newReceipts = useQuery(api.loads.getNewReceipts, { lastCheckedAt });
  const count = newReceipts?.length || 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <MaterialIcons name="notifications" size={24} color="#333" />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default NotificationBell;
