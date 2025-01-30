import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  StatusBar,
  RefreshControl,
} from "react-native";
import dayjs from "dayjs";
import { theme } from "../theme";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Receipt = {
  storageId: string;
  createdAt: string;
  url: string;
  type: "standalone" | "load";
};

export const ReceiptsScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const allReceipts = useQuery(api.loads.getReceiptStorageIds);

  const lastCheckedAt = dayjs()
    .subtract(24, "hours")
    .format("YYYY-MM-DD HH:mm:ss");

  const standaloneReceipts =
    allReceipts?.filter((receipt) => receipt.type === "standalone") || [];

  const newReceipts = standaloneReceipts.filter((receipt) =>
    dayjs(receipt.createdAt).isAfter(dayjs(lastCheckedAt))
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDownload = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to open receipt");
    }
  };

  const renderItem = ({ item }: { item: Receipt }) => {
    const isNew = dayjs(item.createdAt).isAfter(dayjs(lastCheckedAt));

    return (
      <TouchableOpacity
        style={[styles.receiptItem, isNew && styles.newReceiptItem]}
        onPress={() => handleDownload(item.url)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="receipt"
            size={32}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.receiptInfo}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptDate}>
              {dayjs(item.createdAt).format("MMM D, YYYY")}
            </Text>
            {isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            )}
          </View>
          <Text style={styles.receiptId}>ID: {item.storageId.slice(0, 8)}</Text>
        </View>
        <View style={styles.downloadIconContainer}>
          <MaterialIcons
            name="file-download"
            size={24}
            color={theme.colors.primary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Standalone Receipts</Text>
      <Text style={styles.headerSubtitle}>
        {newReceipts.length > 0 && (
          <Text style={styles.highlightText}>{newReceipts.length} new </Text>
        )}
        {standaloneReceipts.length}{" "}
        {standaloneReceipts.length === 1 ? "receipt" : "receipts"} available
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      {standaloneReceipts.length > 0 ? (
        <FlatList
          //@ts-ignore
          data={standaloneReceipts}
          renderItem={renderItem}
          keyExtractor={(item) => item.storageId}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyState />
      )}
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <MaterialIcons name="receipt-long" size={64} color={theme.colors.muted} />
    <Text style={styles.emptyStateTitle}>No Receipts Yet</Text>
    <Text style={styles.emptyStateSubtitle}>
      Standalone receipts will appear here when uploaded
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerContainer: {
    padding: theme.spacing.md,
    backgroundColor: "#F5F7FA",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1D1E",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#71767A",
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  receiptItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1D1E",
    marginBottom: 4,
  },
  receiptId: {
    fontSize: 14,
    color: "#71767A",
  },
  downloadIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: theme.spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1D1E",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#71767A",
    textAlign: "center",
    lineHeight: 22,
  },
  newReceiptItem: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  highlightText: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});
