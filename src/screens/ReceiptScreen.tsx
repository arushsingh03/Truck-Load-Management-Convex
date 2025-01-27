import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
} from "react-native";
import dayjs from "dayjs";
import { theme } from "../theme";
import { api } from "../../convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";

type Receipt = {
  storageId: string;
  createdAt: string;
  url: string;
  uploadedBy: string;
  type: string;
};

export const ReceiptsScreen = () => {
  const receipts = useQuery(api.loads.getReceiptStorageIds);

  const handleDownload = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to open receipt");
    }
  };

  const renderItem = ({ item }: { item: Receipt }) => (
    <View style={styles.receiptItem}>
      <View style={styles.receiptInfo}>
        <Text style={styles.receiptDate}>
          Upload Date: {dayjs(item.createdAt).format("MMMM D, YYYY")}
        </Text>
        <Text style={styles.receiptType}>Type: {item.type}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, styles.downloadButton]}
          onPress={() => handleDownload(item.url)}
        >
          <MaterialIcons name="file-download" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {receipts && receipts.length > 0 ? (
        <FlatList
          //@ts-ignore
          data={receipts}
          renderItem={renderItem}
          keyExtractor={(item) => item.storageId}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <Text style={styles.emptyText}>No receipts found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  receiptItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptDate: {
    fontSize: 16,
    color: "#333",
  },
  uploadedBy: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  receiptType: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginLeft: theme.spacing.sm,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
  },
  separator: {
    height: theme.spacing.md,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: theme.spacing.xl,
  },
});
