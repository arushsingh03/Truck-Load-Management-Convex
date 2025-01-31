import { theme } from "../theme";
import { Button } from "../components/Button";
import { api } from "../../convex/_generated/api";
import * as Notifications from "expo-notifications";
import { useMutation, useQuery } from "convex/react";
import { Picker } from "@react-native-picker/picker";
import React, { useState, useEffect, useRef } from "react";
import {
  registerForPushNotificationsAsync,
  sendPushNotifications,
} from "../utils/notification";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";

type NotificationSubscription = {
  remove: () => void;
};

interface FormData {
  currentLocation: string;
  destinationLocation: string;
  weight: string;
  weightUnit: "kg" | "ton";
  truckLength: string;
  lengthUnit: "m" | "ft";
  contactNumber: string;
  staffContactNumber: string;
}

export const AddLoadScreen = ({ navigation }: { navigation: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [formData, setFormData] = useState<FormData>({
    currentLocation: "",
    destinationLocation: "",
    weight: "",
    weightUnit: "kg",
    truckLength: "",
    lengthUnit: "ft",
    contactNumber: "",
    staffContactNumber: "",
  });
  const [error, setError] = useState("");

  const notificationListener = useRef<NotificationSubscription | null>(null);
  const responseListener = useRef<NotificationSubscription | null>(null);

  const userTokens = useQuery(api.users.getAllPushTokens);
  const addLoad = useMutation(api.loads.addLoad);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current = {
      remove: Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      }).remove,
    };

    responseListener.current = {
      remove: Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log("Notification response:", response);
        }
      ).remove,
    };

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const validateForm = () => {
    if (!formData.currentLocation || !formData.destinationLocation) {
      setError("Location fields are required");
      return false;
    }
    if (!formData.weight || !formData.truckLength) {
      setError("Weight and truck length are required");
      return false;
    }
    if (!formData.contactNumber || !formData.staffContactNumber) {
      setError("Contact information is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      const newLoad = await addLoad({
        currentLocation: formData.currentLocation,
        destinationLocation: formData.destinationLocation,
        weight: parseFloat(formData.weight),
        truckLength: parseFloat(formData.truckLength),
        weightUnit: formData.weightUnit,
        lengthUnit: formData.lengthUnit,
        contactNumber: formData.contactNumber,
        staffContactNumber: formData.staffContactNumber,
      });

      if (userTokens && userTokens.length > 0) {
        await sendPushNotifications(userTokens, formData);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Load Added! 🚛",
          body: `Load from ${formData.currentLocation} to ${formData.destinationLocation} has been added.`,
          data: { ...formData },
        },
        trigger: null,
      });

      Alert.alert("Success", "Load has been added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error adding load:", error);
      setError("Failed to add load. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/4861242.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.header}>Add Load</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder="Current Location"
                value={formData.currentLocation}
                onChangeText={(value) =>
                  setFormData({ ...formData, currentLocation: value })
                }
                editable={!isLoading}
              />
            </View>

            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder="Destination Location"
                value={formData.destinationLocation}
                onChangeText={(value) =>
                  setFormData({ ...formData, destinationLocation: value })
                }
                editable={!isLoading}
              />
            </View>

            <View style={[styles.formGroup, styles.row]}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Weight"
                value={formData.weight}
                onChangeText={(value) =>
                  setFormData({ ...formData, weight: value })
                }
                keyboardType="numeric"
                editable={!isLoading}
              />
              <Picker
                selectedValue={formData.weightUnit}
                style={styles.picker}
                onValueChange={(value) =>
                  setFormData({ ...formData, weightUnit: value })
                }
                enabled={!isLoading}
              >
                <Picker.Item label="kg" value="kg" />
                <Picker.Item label="ton" value="ton" />
              </Picker>
            </View>

            <View style={[styles.formGroup, styles.row]}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Truck Length"
                value={formData.truckLength}
                onChangeText={(value) =>
                  setFormData({ ...formData, truckLength: value })
                }
                keyboardType="numeric"
                editable={!isLoading}
              />
              <Picker
                selectedValue={formData.lengthUnit}
                style={styles.picker}
                onValueChange={(value) =>
                  setFormData({ ...formData, lengthUnit: value })
                }
                enabled={!isLoading}
              >
                <Picker.Item label="m" value="m" />
                <Picker.Item label="ft" value="ft" />
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChangeText={(value) =>
                  setFormData({ ...formData, contactNumber: value })
                }
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder="Staff Contact Number"
                value={formData.staffContactNumber}
                onChangeText={(value) =>
                  setFormData({ ...formData, staffContactNumber: value })
                }
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <Button
              title={isLoading ? "Adding Load..." : "Add Load"}
              onPress={handleSubmit}
              disabled={isLoading}
            />

            {isLoading && (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color={theme.colors.primary}
              />
            )}
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
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  background: {
    flex: 1,
  },
  card: {
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 16,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: theme.spacing.xl,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    fontSize: 16,
    color: theme.colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  picker: {
    width: 100,
    marginLeft: theme.spacing.sm,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
    fontSize: 14,
  },
  loader: {
    marginTop: theme.spacing.md,
  },
});
