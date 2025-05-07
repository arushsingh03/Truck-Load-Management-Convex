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
import { uploadReceiptToCloudinary } from "../utils/cloudianry";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedLoad, setEditedLoad] = useState(load);
  const [isEditing, setIsEditing] = useState(false);

  const uploadReceipt = useMutation(api.loads.uploadReceipt);
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
      editedLoad.currentLocations.every((loc: string) => loc.trim() !== "") &&
      editedLoad.destinationLocations.every(
        (loc: string) => loc.trim() !== ""
      ) &&
      isValidWeight &&
      isValidLength &&
      isValidContactNumber &&
      isValidStaffContactNumber &&
      editedLoad.bodyType.trim() !== "" &&
      editedLoad.products.trim() !== ""
    );
  }, [editedLoad]);

  const handleDownloadReceipt = async () => {
    try {
      if (!load.receiptUrl) {
        Alert.alert("Error", "No receipt available for download");
        return;
      }

      await Linking.openURL(load.receiptUrl);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? `Download failed: ${error.message}`
          : "Failed to download receipt"
      );
    }
  };

  const handleUploadReceipt = async () => {
    try {
      setIsUploading(true);
      console.log("[LoadCard] Starting document picker");

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      console.log("[LoadCard] Document picker result:", result);

      if (!result.assets || result.assets.length === 0) {
        throw new Error("No file selected");
      }

      const file = result.assets[0];
      if (!file.uri) {
        throw new Error("No file URI available");
      }

      console.log("[LoadCard] Selected file:", {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
        size: file.size,
      });

      const uploadResult = await uploadReceiptToCloudinary(file.uri);

      if (!uploadResult) {
        throw new Error("Upload failed - no result returned");
      }

      console.log("[LoadCard] Upload successful, saving to database");

      await uploadReceipt({
        loadId: load._id,
        cloudinaryUrl: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
      });

      Alert.alert("Success", "Receipt uploaded successfully");
    } catch (error) {
      console.error("[LoadCard] Upload error:", error);
      let errorMessage = "Failed to upload receipt. Please try again.";

      if (error instanceof Error) {
        errorMessage = `Upload failed: ${error.message}`;
        console.error("[LoadCard] Error stack:", error.stack);
      }

      Alert.alert("Upload Failed", errorMessage);
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
        currentLocations: editedLoad.currentLocations,
        destinationLocations: editedLoad.destinationLocations,
        weight: editedLoad.weight,
        weightUnit: editedLoad.weightUnit,
        truckLength: editedLoad.truckLength,
        lengthUnit: editedLoad.lengthUnit,
        contactNumber: editedLoad.contactNumber,
        staffContactNumber: editedLoad.staffContactNumber,
        bodyType: editedLoad.bodyType,
        products: editedLoad.products,
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
          <Text style={styles.dateTimeText}>
            {dayjs(load.createdAt).format("MM/DD/YY")}
          </Text>
          {(isAdmin || load.isOwner) && (
            <Text style={styles.dateTimeText}>
              {/* @ts-ignore */}
              {dayjs(load._creationTime).format("h:mm A")}
            </Text>
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

      <View style={styles.locationsGrid}>
        <View style={styles.locationsColumn}>
          <Text style={styles.columnTitle}>From</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {load.currentLocations.join(" → ")}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <MaterialIcons
            name={
              load.currentLocations.length > 1 ||
              load.destinationLocations.length > 1
                ? "swap-horiz"
                : "arrow-forward"
            }
            size={20}
            color={theme.colors.icon}
            style={styles.arrowIcon}
          />
        </View>

        <View style={styles.locationsColumn}>
          <Text style={styles.columnTitle}>To</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {load.destinationLocations.join(" → ")}
          </Text>
        </View>
      </View>

      <View style={styles.quickInfo}>
        <View style={styles.infoItem}>
          <MaterialIcons
            name="local-shipping"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            {load.weight} {load.weightUnit}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons
            name="straighten"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            {load.truckLength} {load.lengthUnit}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons
            name="local-offer"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>{load.bodyType}</Text>
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

            {editedLoad.currentLocations.map((location, index) => (
              <View key={index} style={styles.actionsContainer}>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={`Current Location ${index + 1}`}
                    value={location}
                    onChangeText={(value) =>
                      setEditedLoad((prevLoad) => ({
                        ...prevLoad,
                        currentLocations: prevLoad.currentLocations.map(
                          (loc, i) => (i === index ? value : loc)
                        ),
                      }))
                    }
                  />
                  {editedLoad.currentLocations.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setEditedLoad((prevLoad) => ({
                          ...prevLoad,
                          currentLocations: prevLoad.currentLocations.filter(
                            (_, i) => i !== index
                          ),
                        }))
                      }
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  currentLocations: [...prevLoad.currentLocations, ""],
                }))
              }
            >
              <Text style={styles.addButtonText}>
                + Add Another Current Location
              </Text>
            </TouchableOpacity>

            {editedLoad.destinationLocations.map((location, index) => (
              <View key={index} style={styles.actionsContainer}>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={`Destination Location ${index + 1}`}
                    value={location}
                    onChangeText={(value) =>
                      setEditedLoad((prevLoad) => ({
                        ...prevLoad,
                        destinationLocations: prevLoad.destinationLocations.map(
                          (loc, i) => (i === index ? value : loc)
                        ),
                      }))
                    }
                  />
                  {editedLoad.destinationLocations.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setEditedLoad((prevLoad) => ({
                          ...prevLoad,
                          destinationLocations:
                            prevLoad.destinationLocations.filter(
                              (_, i) => i !== index
                            ),
                        }))
                      }
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  destinationLocations: [...prevLoad.destinationLocations, ""],
                }))
              }
            >
              <Text style={styles.addButtonText}>
                + Add Another Destination Location
              </Text>
            </TouchableOpacity>

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

            <Text style={styles.inputLabel}>Body Type</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.bodyType}
              onChangeText={(text) =>
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  bodyType: text,
                }))
              }
              placeholder="Enter body type"
            />

            <Text style={styles.inputLabel}>Products</Text>
            <TextInput
              style={styles.input}
              value={editedLoad.products}
              onChangeText={(text) =>
                setEditedLoad((prevLoad) => ({
                  ...prevLoad,
                  products: text,
                }))
              }
              placeholder="Enter products"
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
              <View style={styles.detailItem}>
                <MaterialIcons
                  name="local-offer"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.labelText}>Body Type</Text>
                <Text style={styles.valueText}>{load.bodyType}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons
                  name="shopping-cart"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.labelText}>Products</Text>
                <Text style={styles.valueText}>{load.products}</Text>
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
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardCollapsed: {
    paddingBottom: theme.spacing.xs,
  },
  previewContent: {
    marginBottom: theme.spacing.xs,
  },
  expandedContent: {
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  dateTimeText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary + "20",
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  noReceiptBadge: {
    backgroundColor: theme.colors.error + "20",
  },
  statusText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  noReceiptText: {
    color: theme.colors.error,
  },
  locationsGrid: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
  },
  locationsColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "500",
  },
  arrowContainer: {
    paddingHorizontal: theme.spacing.xs,
  },
  arrowIcon: {
    alignSelf: "center",
  },
  quickInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  expandIcon: {
    alignSelf: "center",
    marginTop: theme.spacing.xs,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  detailItem: {
    width: "48%",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  valueText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  contactContainer: {
    marginBottom: theme.spacing.sm,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "center",
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  contactText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: 12,
  },
  actionsContainer: {
    gap: theme.spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 12,
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
  labelText: {
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
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.error,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  addButton: {
    padding: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
