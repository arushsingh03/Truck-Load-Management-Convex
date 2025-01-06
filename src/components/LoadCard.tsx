import React, { useState } from "react";
import dayjs from "dayjs";
import { theme } from "../theme";
import { Load } from "../types/types";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

type LoadCardProps = {
  load: Load;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export const LoadCard = ({
  load,
  isAdmin,
  onEdit,
  onDelete,
}: LoadCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  //@ts-ignore
  const generateUploadUrl = useMutation(api.loads.generateUploadUrl);
  //@ts-ignore
  const uploadReceipt = useMutation(api.loads.uploadReceipt);
  //@ts-ignore
  const generateDownloadUrl = useMutation(api.loads.generateDownloadUrl);

  const handleCall = () => {
    Linking.openURL(`tel:${load.contactNumber}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${load.email}`);
  };

  const handleUploadReceipt = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const uploadUrl = await generateUploadUrl({ loadId: load.id });

        const formData = new FormData();
        const blob = await fetch(file.uri).then((r) => r.blob());
        formData.append("file", blob, file.name);

        await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        await uploadReceipt({
          loadId: load.id,
          storageId: uploadUrl.storageId,
        });

        Alert.alert("Success", "Receipt uploaded successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload receipt");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);
      if (!load.receiptStorageId) {
        Alert.alert("Error", "No receipt available for download");
        return;
      }

      const downloadUrl = await generateDownloadUrl({
        storageId: load.receiptStorageId,
      });

      if (Platform.OS === "web") {
        window.open(downloadUrl, "_blank");
      } else {
        await Linking.openURL(downloadUrl);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download receipt");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this load?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => onDelete(load.id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <MaterialIcons
              name="event"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dateTimeText}>{load.createdAt}</Text>
          </View>

          {isAdmin && (
            <View style={styles.timeItem}>
              <MaterialIcons
                name="access-time"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.dateTimeText}>
                {/* @ts-ignore */}
                {dayjs(load._creationTime).format("hh:mm A")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {load.receiptStorageId ? "Receipt Available" : "No Receipt"}
          </Text>
        </View>
      </View>

      {/* Location Section */}
      <View style={styles.locationContainer}>
        <View style={styles.locationItem}>
          <MaterialIcons
            name="location-on"
            size={24}
            color={theme.colors.primary}
          />
          <View style={styles.locationTextContainer}>
            <Text style={styles.labelText}>From</Text>
            <Text style={styles.locationText}>{load.currentLocation}</Text>
          </View>
        </View>

        <MaterialIcons
          name="arrow-forward"
          size={24}
          color={theme.colors.secondary}
          style={styles.arrowIcon}
        />

        <View style={styles.locationItem}>
          <MaterialIcons
            name="location-on"
            size={24}
            color={theme.colors.primary}
          />
          <View style={styles.locationTextContainer}>
            <Text style={styles.labelText}>To</Text>
            <Text style={styles.locationText}>{load.destinationLocation}</Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialIcons
            name="local-shipping"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.labelText}>Weight</Text>
          <Text style={styles.valueText}>
            {load.weight} {load.weightUnit}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons
            name="straighten"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.labelText}>Truck Length</Text>
          <Text style={styles.valueText}>
            {load.truckLength} {load.lengthUnit}
          </Text>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactContainer}>
        <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
          <MaterialIcons
            name="phone"
            size={20}
            color={theme.colors.secondary}
          />
          <Text style={styles.contactText}>{load.contactNumber}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
          <MaterialIcons
            name="email"
            size={20}
            color={theme.colors.secondary}
          />
          <Text style={styles.contactText}>{load.email}</Text>
        </TouchableOpacity>
      </View>

      {/* Actions Section */}
      {!isAdmin && (
        <View style={styles.actionsContainer}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(load.id)}
            >
              <MaterialIcons name="edit" size={20} color="#FFF" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={20} color="#FFF" />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.uploadButton]}
              onPress={handleUploadReceipt}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="upload-file" size={20} color="#FFF" />
                  <Text style={styles.actionText}>Upload Receipt</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.downloadButton,
                !load.receiptStorageId && styles.disabledButton,
              ]}
              onPress={handleDownloadReceipt}
              disabled={isDownloading || !load.receiptStorageId}
            >
              {isDownloading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="download" size={20} color="#FFF" />
                  <Text style={styles.actionText}>Download</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: theme.colors.primary + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  locationItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: theme.spacing.xs,
  },
  arrowIcon: {
    marginHorizontal: theme.spacing.md,
  },
  labelText: {
    fontSize: 12,
    color: theme.colors.icon,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "600",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: theme.spacing.md,
  },
  detailItem: {
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "600",
    marginTop: 4,
  },
  contactContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: 5,
  },
  contactText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: 14,
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 2,
  },
  actionText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  uploadButton: {
    backgroundColor: theme.colors.success,
  },
  downloadButton: {
    backgroundColor: theme.colors.info,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
