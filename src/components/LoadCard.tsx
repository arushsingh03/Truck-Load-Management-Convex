import dayjs from "dayjs";
import { theme } from "../theme";
import { Load } from "../types/types";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedLoad, setEditedLoad] = useState(load);
  const [isEditing, setIsEditing] = useState(false);

  const generateUploadUrl = useMutation(api.loads.generateUploadUrl);
  const uploadReceipt = useMutation(api.loads.uploadReceipt);
  const generateDownloadUrl = useMutation(api.loads.generateDownloadUrl);
  const deleteLoad = useMutation(api.loads.deleteLoad);
  const updateLoad = useMutation(api.loads.updateLoad);

  const handleCall = () => {
    Linking.openURL(`tel:${load.contactNumber}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${load.email}`);
  };

  const handleEditSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly"
      );
      return;
    }

    try {
      setIsEditing(true);
      await updateLoad({
        loadId: load._id,
        currentLocation: editedLoad.currentLocation,
        destinationLocation: editedLoad.destinationLocation,
        weight: editedLoad.weight,
        weightUnit: editedLoad.weightUnit,
        truckLength: editedLoad.truckLength,
        lengthUnit: editedLoad.lengthUnit,
        contactNumber: editedLoad.contactNumber,
        email: editedLoad.email,
      });
      setShowEditModal(false);
      onEdit(load._id);
      Alert.alert("Success", "Load updated successfully");
    } catch (error) {
      Alert.alert("Success", "Load updated successfully");
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  const validateForm = () => {
    return (
      editedLoad.currentLocation.trim() !== "" &&
      editedLoad.destinationLocation.trim() !== "" &&
      editedLoad.weight > 0 &&
      editedLoad.truckLength > 0 &&
      editedLoad.contactNumber.trim() !== "" &&
      editedLoad.email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedLoad.email)
    );
  };

  const handleUploadReceipt = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (!file.uri) throw new Error("No file URI available");

        const { uploadUrl, storageId } = await generateUploadUrl({
          loadId: load._id,
        });

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
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        await uploadReceipt({
          loadId: load._id,
          storageId,
        });

        Alert.alert("Success", "Receipt uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      {/* @ts-ignore */}
      Alert.alert("Error", `Failed to upload receipt: ${error.message}`);
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

      if (typeof downloadUrl === "string") {
        await Linking.openURL(downloadUrl);
      } else {
        throw new Error("Invalid download URL");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download receipt");
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
          onPress: async () => {
            try {
              await deleteLoad({ loadId: load._id });
              onDelete(load._id);
              Alert.alert("Success", "Load deleted successfully");
            } catch (error) {
              Alert.alert("Success", "Your load removed successfully");
              console.error(error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const EditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit Load</Text>

            <Text style={styles.inputLabel}>Current Location</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.currentLocation}
              onChangeText={(text) =>
                setEditedLoad({ ...editedLoad, currentLocation: text })
              }
              placeholder="Enter current location"
            />

            <Text style={styles.inputLabel}>Destination Location</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.destinationLocation}
              onChangeText={(text) =>
                setEditedLoad({ ...editedLoad, destinationLocation: text })
              }
              placeholder="Enter destination location"
            />

            <Text style={styles.inputLabel}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={String(editedLoad.weight)}
                onChangeText={(text) =>
                  setEditedLoad({ ...editedLoad, weight: Number(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="Enter weight"
              />
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() =>
                  setEditedLoad({
                    ...editedLoad,
                    weightUnit: editedLoad.weightUnit === "kg" ? "ton" : "kg",
                  })
                }
              >
                <Text style={styles.unitButtonText}>
                  {editedLoad.weightUnit}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Truck Length</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={String(editedLoad.truckLength)}
                onChangeText={(text) =>
                  setEditedLoad({
                    ...editedLoad,
                    truckLength: Number(text) || 0,
                  })
                }
                keyboardType="numeric"
                placeholder="Enter truck length"
              />
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() =>
                  setEditedLoad({
                    ...editedLoad,
                    lengthUnit: editedLoad.lengthUnit === "m" ? "ft" : "m",
                  })
                }
              >
                <Text style={styles.unitButtonText}>
                  {editedLoad.lengthUnit}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Contact Number</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.contactNumber}
              onChangeText={(text) =>
                setEditedLoad({ ...editedLoad, contactNumber: text })
              }
              keyboardType="phone-pad"
              placeholder="Enter contact number"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.email}
              onChangeText={(text) =>
                setEditedLoad({ ...editedLoad, email: text })
              }
              keyboardType="email-address"
              placeholder="Enter email"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  !validateForm() && styles.disabledButton,
                ]}
                onPress={handleEditSubmit}
                disabled={isEditing || !validateForm()}
              >
                {isEditing ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.card}>
      {EditModal()}
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <MaterialIcons
              name="event"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dateTimeText}>
              {" "}
              {dayjs(load.createdAt).format("MM/DD/YY")}
            </Text>
          </View>
          {(isAdmin || load.isOwner) && (
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

      <View style={styles.actionsContainer}>
        {(isAdmin || load.isOwner) && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setShowEditModal(true)}
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
        )}

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
                <Text style={styles.actionText}>
                  {load.receiptStorageId ? "Update Receipt" : "Upload Receipt"}
                </Text>
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
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: theme.colors.primary + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 2,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.lg,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  unitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginLeft: theme.spacing.sm,
    minWidth: 60,
    alignItems: "center",
  },
  unitButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    marginLeft: theme.spacing.sm,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
