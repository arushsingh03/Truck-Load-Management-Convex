import dayjs from "dayjs";
import { theme } from "../theme";
import { Load } from "../types/types";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import { Button } from "../components/Button";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useMutation } from "convex/react";
import { FlashList } from "@shopify/flash-list";
import { LoadCard } from "../components/LoadCard";
import { api } from "../../convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchFilters } from "../components/SearchFilters";
import NotificationBell from "../components/NotificationBell";
import BadgeCounter from "../components/BadgeCounter";

export const AdminDashboard = ({ navigation }: any) => {
  const [searchParams, setSearchParams] = useState({
    dateFrom: dayjs().format("YYYY-MM-DD"),
    dateTo: dayjs().format("YYYY-MM-DD"),
    location: "",
  });
  const generateDownloadUrl = useMutation(api.loads.generateDownloadUrl);
  const pendingUsersCount = useQuery(api.users.getPendingUsersCount);

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

  const loads = useQuery(api.loads.getLoads, searchParams);

  const renderItem = ({ item }: { item: Load }) => (
    <LoadCard
      load={item}
      isAdmin={true}
      onEdit={(id: string) => navigation.navigate("EditLoad", { loadId: id })}
      onDelete={(id: string) =>
        Alert.alert("Delete", "Delete functionality not implemented yet")
      }
      renderReceiptButton={() =>
        item.receiptStorageId && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() =>
              item.receiptStorageId && handleDownload(item.receiptStorageId)
            }
          >
            <MaterialIcons name="file-download" size={24} color="#FFF" />
          </TouchableOpacity>
        )
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <Button
          title="Add Load"
          onPress={() => navigation.navigate("AddLoad")}
          iconName="truck-plus"
          style={styles.button}
        />
        <View style={{ position: "relative" }}>
          <Button
            title="Manage Users"
            onPress={() => navigation.navigate("UserManagement")}
            iconName="account"
            style={styles.button}
          />
          <BadgeCounter count={pendingUsersCount ?? 0} />
        </View>
        <NotificationBell onPress={() => navigation.navigate("Receipts")} />
      </View>

      <SearchFilters params={searchParams} onParamsChange={setSearchParams} />

      <View style={styles.listContainer}>
        <FlashList
          // @ts-ignore
          data={loads?.map((load) => ({ ...load, id: load._id }))}
          renderItem={renderItem}
          estimatedItemSize={200}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginLeft: theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    marginLeft: theme.spacing.sm,
  },
  listContainer: {
    flex: 1,
    marginTop: theme.spacing.md,
  },
  separator: {
    height: theme.spacing.md,
  },
});
