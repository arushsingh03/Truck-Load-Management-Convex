import React, { useState } from "react";
import { useAction } from "convex/react";
import { Button } from "../components/Button";
import { api } from "../../convex/_generated/api";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { theme } from "../theme";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { UserType } from "../types/types";
import { useMutation } from "convex/react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Notifications from "expo-notifications";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { uploadToCloudinary } from "../utils/cloudianry";

interface DocumentInfo {
  uri: string;
  name: string;
  mimeType: string | null | undefined;
  size: number | null | undefined;
}

interface NavigationProps {
  navigation: any;
}

interface FormData {
  name: string;
  phone: string;
  transportName: string;
  password: string;
  address: string;
  userType: UserType | "";
  documentInfo: DocumentInfo | null;
}

export const RegisterScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    transportName: "",
    password: "",
    address: "",
    userType: "",
    documentInfo: null,
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const register = useAction(api.auth.register);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsLoading(true);

        console.log("Selected file:", {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
          size: asset.size,
        });

        const cloudinaryUrl = await uploadToCloudinary(asset.uri);

        if (cloudinaryUrl) {
          setFormData({
            ...formData,
            documentInfo: {
              uri: cloudinaryUrl,
              name: asset.name,
              mimeType: asset.mimeType,
              size: asset.size,
            },
          });
          setError("");
        } else {
          setError("Failed to upload document. Please try again.");
        }
      }
    } catch (err) {
      console.error("Document pick error:", err);
      setError("Error uploading document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentLabel = () => {
    switch (formData.userType) {
      case "driver":
        return "Upload Driving License";
      case "motorOwner":
        return "Upload Aadhaar Card";
      case "transporter":
        return "Upload GST Certificate";
      default:
        return "Upload Document";
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!formData.transportName.trim()) {
      setError("Transport name is required");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!formData.userType) {
      setError("Please select a user type");
      return false;
    }
    if (!formData.documentInfo) {
      setError("Please upload required document");
      return false;
    }
    return true;
  };

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (!Device.isDevice) {
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error("Project ID is not configured");
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  };

  const updatePushToken = useMutation(api.users.updatePushToken);

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userId = await register({
        name: formData.name,
        phone: formData.phone,
        transportName: formData.transportName,
        password: formData.password,
        address: formData.address,
        userType: formData.userType as UserType,
        documentUrl: formData.documentInfo?.uri,
      });

      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await updatePushToken({
          userId,
          pushToken,
        });
      }

      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please wait for admin approval.",
        [{ text: "OK", onPress: () => navigation.replace("Login") }]
      );
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.slogan}>
              Create Your <Text style={styles.highlightText}>Account</Text>
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.pickerContainer}>
              <MaterialIcons
                name="person-outline"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <Picker
                selectedValue={formData.userType}
                style={styles.picker}
                onValueChange={(value) => {
                  setFormData({ ...formData, userType: value as UserType });
                  setError("");
                }}
              >
                <Picker.Item label="Select User Type :" value="" />
                {/* <Picker.Item label="Admin" value="admin" /> */}
                <Picker.Item label="Driver" value="driver" />
                <Picker.Item label="Motor Owner" value="motorOwner" />
                <Picker.Item label="Transporter" value="transporter" />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome
                name="user"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={formData.name}
                onChangeText={(value) => {
                  setFormData({ ...formData, name: value });
                  setError("");
                }}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="phone"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phone}
                onChangeText={(value) => {
                  setFormData({ ...formData, phone: value });
                  setError("");
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="business"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Transport Name"
                value={formData.transportName}
                onChangeText={(value) => {
                  setFormData({ ...formData, transportName: value });
                  setError("");
                }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) => {
                  setFormData({ ...formData, password: value });
                  setError("");
                }}
                secureTextEntry={!showPassword}
              />
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.colors.muted}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={theme.colors.muted}
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Address"
                value={formData.address}
                onChangeText={(value) => {
                  setFormData({ ...formData, address: value });
                  setError("");
                }}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleDocumentPick}
            >
              <MaterialIcons
                name="upload-file"
                size={20}
                color={theme.colors.primary}
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadButtonText}>{getDocumentLabel()}</Text>
            </TouchableOpacity>

            {formData.documentInfo && (
              <Text style={styles.uploadedFile}>
                File uploaded: {formData.documentInfo.name}
              </Text>
            )}

            <Button
              title={isLoading ? "Registering..." : "Register"}
              onPress={handleRegister}
              variant="primary"
              disabled={isLoading}
            />
            <Button
              title="Go Back"
              onPress={() => navigation.navigate("Login")}
              variant="outline"
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderRadius: 16,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
    alignSelf: "center",
    marginTop: 15,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 5,
  },
  slogan: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: 10,
  },
  highlightText: {
    color: theme.colors.primary,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.shadow,
  },
  picker: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.shadow,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.primary,
    borderRadius: 8,
    marginVertical: theme.spacing.md,
  },
  uploadIcon: {
    marginRight: theme.spacing.sm,
  },
  uploadButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  uploadedFile: {
    color: theme.colors.success,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  eyeIcon: {
    padding: theme.spacing.sm,
  },
});
