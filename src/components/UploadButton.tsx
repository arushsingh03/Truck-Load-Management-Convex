import React from "react";
import { theme } from "../theme";
import { Load } from "../types/types";
import { useQuery } from "convex/react";
import { FlashList } from "@shopify/flash-list";
import { api } from "../../convex/_generated/api";
import { LoadCard } from "../components/LoadCard";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

export const UserDashboard = () => {
  const loads = useQuery(api.loads.getTodayLoads);

  const renderContent = () => {
    if (!loads) {
      return <Text style={styles.loadingText}>Loading loads...</Text>;
    }

    if (loads.length === 0) {
      return <Text style={styles.emptyText}>No loads available for today</Text>;
    }

    const loadsWithId = loads.map((load) => ({
      ...load,
      id: load._id.toString(),
    }));

    return (
      <FlashList
        //   @ts-ignore
        data={loadsWithId}
        renderItem={({ item }: { item: Load }) => (
          <LoadCard
            load={item}
            isAdmin={false}
            onEdit={function (id: string): void {
              throw new Error("Function not implemented.");
            }}
            onDelete={function (id: string): void {
              throw new Error("Function not implemented.");
            }}
          />
        )}
        estimatedItemSize={200}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Upload Section - Always visible */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => {
            // Implementation of upload functionality
            Alert.alert(
              "Upload Receipt",
              "Please select a load first to upload its receipt",
              [{ text: "OK" }]
            );
          }}
        >
          <MaterialIcons name="upload-file" size={24} color="#FFF" />
          <Text style={styles.uploadButtonText}>Upload Receipt</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  uploadSection: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  separator: {
    height: theme.spacing.md,
  },
  loadingText: {
    textAlign: "center",
    color: theme.colors.secondary,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.secondary,
    fontSize: 16,
  },
});
