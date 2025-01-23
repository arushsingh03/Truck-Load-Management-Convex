import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { theme } from "../theme";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";

interface DocumentViewerProps {
  storageId?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ storageId }) => {
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const documentUrl = useQuery(api.users.getDocumentUrl, {
    storageId,
  });

  useEffect(() => {
    if (documentUrl) {
      if (documentUrl.toLowerCase().endsWith(".pdf")) {
        setFileType("pdf");
      } else if (
        /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl.toLowerCase())
      ) {
        setFileType("image");
      }
    }
  }, [documentUrl]);

  if (!storageId) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons
          name="error-outline"
          size={24}
          color={theme.colors.error}
        />
        <Text style={styles.errorText}>No document uploaded</Text>
      </View>
    );
  }

  if (!documentUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading document...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fileType === "image" ? (
        <Image
          source={{ uri: documentUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : fileType === "pdf" ? (
        <View style={styles.pdfContainer}>
          <MaterialIcons
            name="picture-as-pdf"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.pdfText}>PDF Document</Text>
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => Linking.openURL(documentUrl)}
          >
            <MaterialIcons
              name="open-in-new"
              size={20}
              color={theme.colors.light}
            />
            <Text style={styles.openButtonText}>Open PDF</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <MaterialIcons
            name="error-outline"
            size={24}
            color={theme.colors.error}
          />
          <Text style={styles.errorText}>Unsupported file type</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 200,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: theme.colors.shadow,
  },
  pdfContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
    minHeight: 200,
  },
  pdfText: {
    fontSize: 16,
    color: theme.colors.text,
    marginVertical: theme.spacing.md,
  },
  openButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
  },
  openButtonText: {
    color: theme.colors.light,
    marginLeft: theme.spacing.sm,
    fontWeight: "500",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    marginTop: theme.spacing.sm,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
    marginTop: theme.spacing.sm,    
  },
});

export default DocumentViewer;
