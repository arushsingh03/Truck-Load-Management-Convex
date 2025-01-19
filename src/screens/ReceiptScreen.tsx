import React, { useState, useEffect } from "react";
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
import { useQuery, useMutation } from "convex/react";

type Receipt = {
  storageId: string;
  createdAt: string;
};

export const ReceiptsScreen = () => {
  const queryReceipts = useQuery(api.loads.getReceiptStorageIds);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const generateDownloadUrl = useMutation(api.loads.generateDownloadUrl);
  const deleteStandaloneReceipt = useMutation(
    api.loads.deleteStandaloneReceipt
  );

  useEffect(() => {
    if (queryReceipts) {
      setReceipts(queryReceipts);
    }
  }, [queryReceipts]);

  const handleDownload = async (storageId: string) => {
    try {
      const downloadUrl = await generateDownloadUrl({ storageId });
      if (downloadUrl) {
        Linking.openURL(downloadUrl);
      } else {
        throw new Error("Download URL is null");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download receipt");
    }
  };

  const handleDelete = async (storageId: string) => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setReceipts((prevReceipts) =>
                prevReceipts.filter(
                  (receipt) => receipt.storageId !== storageId
                )
              );

              await deleteStandaloneReceipt({ storageId });
              Alert.alert("Success", "Receipt deleted successfully");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Success", "Receipt is delete Successfully.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Receipt }) => (
    <View style={styles.receiptItem}>
      <View style={styles.receiptInfo}>
        <Text style={styles.receiptDate}>
          Upload Date: {dayjs(item.createdAt).format("MMMM D, YYYY")}
        </Text>
        <Text style={styles.receiptId}>
          ID: {item.storageId.slice(0, 8)}...
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, styles.downloadButton]}
          onPress={() => handleDownload(item.storageId)}
        >
          <MaterialIcons name="file-download" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => handleDelete(item.storageId)}
        >
          <MaterialIcons name="delete" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Uploaded Receipts</Text>
      {receipts && receipts.length > 0 ? (
        <FlatList
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: theme.spacing.lg,
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
  receiptId: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
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
  deleteButton: {
    backgroundColor: theme.colors.error,
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
