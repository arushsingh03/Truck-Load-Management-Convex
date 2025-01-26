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
  Linking,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { FlashList } from "@shopify/flash-list";
import { LoadCard } from "../components/LoadCard";
import { uploadReceiptToCloudinary } from "../utils/cloudianry";
import { Id } from "../../convex/_generated/dataModel";

export const UserDashboard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loads = useQuery(api.loads.getTodayLoads);
  const uploadReceipt = useMutation(api.loads.uploadReceipt);
  const saveStandaloneReceipt = useMutation(api.loads.saveStandaloneReceipt);

  const handleWhatsAppSend = async () => {
    const phoneNumber = "9369692777";
    const whatsappUrl = `whatsapp://send?phone=91${phoneNumber}`;
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert("Error", "WhatsApp is not installed on your device", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open WhatsApp", [{ text: "OK" }]);
    }
  };

  const handleUploadForLoad = async (loadId: Id<"loads">) => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (!file.uri) throw new Error("No file URI available");

        const uploadResult = await uploadReceiptToCloudinary(file.uri);

        if (!uploadResult) {
          throw new Error("Failed to upload receipt to Cloudinary");
        }

        await uploadReceipt({
          loadId,
          cloudinaryUrl: uploadResult.url,
          cloudinaryPublicId: uploadResult.publicId,
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

        const uploadResult = await uploadReceiptToCloudinary(file.uri);

        if (!uploadResult) {
          throw new Error("Failed to upload receipt to Cloudinary");
        }

        await saveStandaloneReceipt({
          cloudinaryUrl: uploadResult.url,
          cloudinaryPublicId: uploadResult.publicId,
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
              <Text style={styles.uploadButtonText}>{"  "}Upload Receipts</Text>
            </>
          )}
        </TouchableOpacity>

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
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>
      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={handleWhatsAppSend}
      >
        <Text style={styles.uploadButtonText}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/220/220236.png",
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </Text>
      </TouchableOpacity>
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
    gap: theme.spacing.sm,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: 8,
  },
  whatsappButton: {
    position: "absolute",
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: "#25D366",
    padding: theme.spacing.md,
    borderRadius: 100,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 30,
    height: 30,
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
