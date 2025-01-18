import dayjs from "dayjs";
import { theme } from "../theme";
import { Load } from "../types/types";
import React, { useState, useCallback } from "react";
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
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface LoadCardProps {
  load: Load;
  isAdmin: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  renderReceiptButton: () => React.ReactNode;
  receiptStorageId?: string;
}

export const LoadCard: React.FC<LoadCardProps> = ({
  load,
  isAdmin,
  onEdit,
  onDelete,
  renderReceiptButton,
}) => {
  {
    renderReceiptButton && renderReceiptButton();
  }
  const [isExpanded, setIsExpanded] = useState(false);
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

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleCall = useCallback(() => {
    Linking.openURL(`tel:${load.contactNumber}`);
  }, [load.contactNumber]);

  const handleStaffCall = useCallback(() => {
    Linking.openURL(`tel:${load.staffContactNumber}`);
  }, [load.staffContactNumber]);

  const validateForm = useCallback(() => {
    const isValidContactNumber = editedLoad.contactNumber.trim() !== "";
    const isValidStaffContactNumber =
      editedLoad.staffContactNumber.trim() !== "";
    const isValidWeight = !isNaN(editedLoad.weight) && editedLoad.weight > 0;
    const isValidLength =
      !isNaN(editedLoad.truckLength) && editedLoad.truckLength > 0;

    return (
      editedLoad.currentLocation.trim() !== "" &&
      editedLoad.destinationLocation.trim() !== "" &&
      isValidWeight &&
      isValidLength &&
      isValidContactNumber &&
      isValidStaffContactNumber
    );
  }, [editedLoad]);

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);
  
      if (!load.receiptStorageId) {
        Alert.alert("Error", "No receipt available for download");
        return;
      }
  
      let storageId = load.receiptStorageId;
  
      if (storageId.startsWith('kg')) {
        storageId = storageId;
      } else {
        if (storageId.includes('?')) {
          storageId = storageId.split('?')[0];
        }
        
        if (storageId.includes("token=")) {
          storageId = storageId.split("token=")[1].split("&")[0];
        }
        
        storageId = storageId.split("/").pop() || storageId;
      }
  
      if (!storageId) {
        throw new Error("Invalid storage ID format");
      }
  
      const downloadUrl = await generateDownloadUrl({
        storageId: storageId,
      });
  
      if (typeof downloadUrl === "string" && downloadUrl) {
        await Linking.openURL(downloadUrl);
      } else {
        throw new Error(`Invalid download URL format: ${typeof downloadUrl}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      
      Alert.alert(
        "Error",
        error instanceof Error
          ? `Download failed: ${error.message}`
          : "Failed to download receipt"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadReceipt = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (!file.uri) {
          throw new Error("No file URI available");
        }

        const uploadResult = await generateUploadUrl();
        if (!uploadResult?.uploadUrl || !uploadResult?.storageId) {
          throw new Error("Failed to get valid upload URL");
        }

        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          type: file.mimeType || "application/octet-stream",
          name: file.name,
        } as any);

        const uploadResponse = await fetch(uploadResult.uploadUrl, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const cleanStorageId =
          uploadResult.storageId.split("/").pop()?.split("?")[0] ||
          uploadResult.storageId;

        await uploadReceipt({
          loadId: load._id,
          storageId: cleanStorageId,
        });

        Alert.alert("Success", "Receipt uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error instanceof Error
          ? error.message
          : "Failed to upload receipt. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };
  const handleDelete = useCallback(() => {
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
              console.error(error);
              Alert.alert("Error", "Failed to delete load");
            }
          },
          style: "destructive",
        },
      ]
    );
  }, [load._id, deleteLoad, onDelete]);

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
        staffContactNumber: editedLoad.staffContactNumber,
      });
      setShowEditModal(false);
      onEdit(load._id);
      Alert.alert("Success", "Load updated successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update load");
    } finally {
      setIsEditing(false);
    }
  };

  const PreviewContent = () => (
    <View style={styles.previewContent}>
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <MaterialIcons
              name="event"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dateTimeText}>
              {dayjs(load.createdAt).format("MM/DD/YY")}
            </Text>
          </View>
          {(isAdmin || load.isOwner) && (
            <View style={styles.dateTimeItem}>
              <MaterialIcons
                name="timer"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.dateTimeText}>
                {/* @ts-ignore */}
                {dayjs(load._creationTime).format("h:mm A")}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.statusBadge,
            !load.receiptStorageId && styles.noReceiptBadge,
          ]}
          onPress={load.receiptStorageId ? handleDownloadReceipt : undefined}
        >
          <MaterialIcons
            name={load.receiptStorageId ? "download" : "receipt-long"}
            size={16}
            color={
              load.receiptStorageId ? theme.colors.primary : theme.colors.error
            }
          />
          <Text
            style={[
              styles.statusText,
              !load.receiptStorageId && styles.noReceiptText,
            ]}
          >
            {load.receiptStorageId ? "Download" : "No Receipt"}
          </Text>
        </TouchableOpacity>
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
          color={theme.colors.icon}
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
    </View>
  );

  const EditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalContainer}
        onPress={() => setShowEditModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Edit Load</Text>

            <Text style={styles.inputLabel}>Current Location</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.currentLocation}
              onChangeText={(text) =>
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  currentLocation: text,
                }))
              }
              placeholder="Enter current location"
            />

            <Text style={styles.inputLabel}>Destination Location</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.destinationLocation}
              onChangeText={(text) =>
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  destinationLocation: text,
                }))
              }
              placeholder="Enter destination location"
            />

            <Text style={styles.inputLabel}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                value={String(editedLoad.weight)}
                onChangeText={(text) => {
                  const numValue = parseFloat(text);
                  setEditedLoad((prevLoad) => ({
                    ...prevLoad,
                    weight: isNaN(numValue) ? 0 : numValue,
                  }));
                }}
                keyboardType="numeric"
                placeholder="Enter weight"
              />
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() =>
                  setEditedLoad((prevLoad) => ({
                    ...prevLoad,
                    weightUnit: prevLoad.weightUnit === "kg" ? "ton" : "kg",
                  }))
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
                onChangeText={(text) => {
                  const numValue = parseFloat(text);
                  setEditedLoad((prevLoad) => ({
                    ...prevLoad,
                    truckLength: isNaN(numValue) ? 0 : numValue,
                  }));
                }}
                keyboardType="numeric"
                placeholder="Enter truck length"
              />
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() =>
                  setEditedLoad((prevLoad) => ({
                    ...prevLoad,
                    lengthUnit: prevLoad.lengthUnit === "m" ? "ft" : "m",
                  }))
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
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  contactNumber: text,
                }))
              }
              keyboardType="phone-pad"
              placeholder="Enter contact number"
            />

            <Text style={styles.inputLabel}>Staff Contact Number</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.staffContactNumber}
              onChangeText={(text) =>
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  staffContactNumber: text,
                }))
              }
              keyboardType="phone-pad"
              placeholder="Enter staff contact number"
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.card, !isExpanded && styles.cardCollapsed]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <PreviewContent />
        {isExpanded && (
          <View style={styles.expandedContent}>
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
              <TouchableOpacity
                style={styles.contactItem}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCall();
                }}
              >
                <MaterialIcons
                  name="phone"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text style={styles.contactText}>
                  Phone: {load.contactNumber}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={(e) => {
                  e.stopPropagation();
                  handleStaffCall();
                }}
              >
                <MaterialIcons
                  name="phone"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text style={styles.contactText}>
                  Staff: {load.staffContactNumber}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsContainer}>
              {(isAdmin || load.isOwner) && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowEditModal(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={20} color="#FFF" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                  >
                    <MaterialIcons name="delete" size={20} color="#FFF" />
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!(isAdmin || load.isOwner) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.uploadButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUploadReceipt();
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="upload-file"
                        size={20}
                        color="#FFF"
                      />
                      <Text style={styles.actionText}>
                        {load.receiptStorageId
                          ? "Update Receipt"
                          : "Upload Receipt"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <MaterialIcons
          name={isExpanded ? "expand-less" : "expand-more"}
          size={24}
          color={theme.colors.primary}
          style={styles.expandIcon}
        />
      </TouchableOpacity>

      {showEditModal && <EditModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCollapsed: {
    paddingBottom: theme.spacing.sm,
  },
  previewContent: {
    marginBottom: theme.spacing.xs,
  },
  expandedContent: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
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
  dateTimeText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noReceiptBadge: {
    backgroundColor: theme.colors.error + "20",
  },
  statusText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  noReceiptText: {
    color: theme.colors.error,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: theme.spacing.xs,
  },
  locationItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  arrowIcon: {
    marginHorizontal: theme.spacing.sm,
  },
  expandIcon: {
    alignSelf: "center",
    marginTop: theme.spacing.xs,
  },
  labelText: {
    fontSize: 12,
    color: theme.colors.icon,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.md,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "center",
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    width: "100%",
  },
  contactText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: 14,
  },
  actionsContainer: {
    gap: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
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
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  unitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: 8,
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
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
