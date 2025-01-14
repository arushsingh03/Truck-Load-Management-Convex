import React, { useState } from "react";
import { theme } from "../theme";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { FlashList } from "@shopify/flash-list";
import { LoadCard } from "../components/LoadCard";
import { Id } from "../../convex/_generated/dataModel";

export const UserDashboard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loads = useQuery(api.loads.getTodayLoads);
  const uploadReceipt = useMutation(api.loads.uploadReceipt);
  const generateStandaloneUploadUrl = useMutation(
    api.loads.generateStandaloneUploadUrl
  );
  const saveStandaloneReceipt = useMutation(api.loads.saveStandaloneReceipt);

  const handleUploadForLoad = async (loadId: Id<"loads">) => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (!file.uri) throw new Error("No file URI available");

        const uploadResult = await generateStandaloneUploadUrl();
        const { uploadUrl, storageId } = uploadResult;

        if (!uploadUrl) {
          throw new Error("Upload URL not provided");
        }

        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
        } as any);

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        await uploadReceipt({
          loadId,
          storageId,
        });

        Alert.alert("Success", "Receipt uploaded successfully!", [
          { text: "OK" },
        ]);

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        "Failed to upload receipt: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsUploading(false);
    }
  };
  const handleStandaloneUpload = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (!file.uri) throw new Error("No file URI available");

        const uploadResult = await generateStandaloneUploadUrl();
        const { uploadUrl, storageId } = uploadResult;

        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
        } as any);

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        await saveStandaloneReceipt({
          storageId,
        });

        Alert.alert("Success", "Standalone receipt uploaded successfully!", [
          { text: "OK" },
        ]);

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        "Failed to upload receipt: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const renderContent = () => {
    if (!loads) {
      return <Text style={styles.loadingText}>Loading loads...</Text>;
    }

    if (loads.length === 0) {
      return <Text style={styles.emptyText}>No loads available for today</Text>;
    }

    return (
      <FlashList
        data={loads.map((load) => ({ ...load, id: load._id }))}
        renderItem={({ item }) => (
          <LoadCard
            //@ts-ignore
            load={item}
            onUploadReceipt={() => handleUploadForLoad(item.id)}
          />
        )}
        estimatedItemSize={200}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Standalone Upload Section */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            isUploading && styles.uploadButtonDisabled,
          ]}
          onPress={handleStandaloneUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <MaterialIcons name="upload-file" size={24} color="#FFF" />
              <Text style={styles.uploadButtonText}>Upload Receipts</Text>
            </>
          )}
          {uploadSuccess && (
            <View style={styles.successIndicator}>
              <MaterialIcons
                name="check-circle"
                size={24}
                color={theme.colors.success}
              />
              <Text style={styles.successText}>
                Receipt uploaded successfully!
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Loads List */}
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
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  successIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  successText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.success,
    fontSize: 16,
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
