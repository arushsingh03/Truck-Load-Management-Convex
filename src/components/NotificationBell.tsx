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

  const newLoadReceipts = useQuery(api.loads.getNewReceipts, { lastCheckedAt });
  const allStorageIds = useQuery(api.loads.getReceiptStorageIds);

  const standaloneReceipts =
    allStorageIds?.filter((receipt) => {
      const receiptDate = dayjs(receipt.createdAt);
      const lastCheck = dayjs(lastCheckedAt);
      return receiptDate.isAfter(lastCheck);
    }) ?? [];

  const loadReceiptsCount = newLoadReceipts?.length || 0;
  const standaloneReceiptsCount = standaloneReceipts.length;
  const totalCount = loadReceiptsCount + standaloneReceiptsCount;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      accessibilityLabel={`Notifications: ${totalCount} new receipts`}
      accessibilityRole="button"
    >
      <MaterialIcons name="attach-file" size={24} color="#000" />
      {totalCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalCount}</Text>
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
    padding: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NotificationBell;
