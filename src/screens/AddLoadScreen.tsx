import { theme } from "../theme";
import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { Button } from "../components/Button";
import { api } from "../../convex/_generated/api";
import { Picker } from "@react-native-picker/picker";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  ImageBackground,
  Platform,
} from "react-native";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permissions
async function registerForPushNotificationsAsync() {
  let token;

  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    // Fix for Constants.expoConfig possibly being null
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error("Project ID is not configured");
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })
    ).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export const AddLoadScreen = ({ navigation }: any) => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });
  }, []);

  const addLoad = useMutation(api.loads.addLoad);

  async function scheduleNotification() {
    setTimeout(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Load Added! 🚛",
          body: `Load from ${formData.currentLocation} to ${formData.destinationLocation} has been added successfully.`,
          data: {
            weight: `${formData.weight} ${formData.weightUnit}`,
            truckLength: `${formData.truckLength} ${formData.lengthUnit}`,
            contact: formData.contactNumber,
            staffContactNumber: formData.staffContactNumber,
          },
        },
        trigger: null,
      });
    }, 1000);
  }

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.currentLocation || !formData.destinationLocation) {
        setError("Location fields are required");
        return;
      }

      if (!formData.weight || !formData.truckLength) {
        setError("Weight and truck length are required");
        return;
      }

      if (!formData.contactNumber || !formData.staffContactNumber) {
        setError("Contact information is required");
        return;
      }

      await addLoad({
        ...formData,
        weight: parseFloat(formData.weight),
        truckLength: parseFloat(formData.truckLength),
        weightUnit: formData.weightUnit as "kg" | "ton",
        lengthUnit: formData.lengthUnit as "ft" | "m",
        staffContactNumber: ""
      });

      // Show notification after successful load addition
      await scheduleNotification();

      navigation.goBack();
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Rest of your component remains the same...
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

            {/* Your existing JSX remains the same... */}
            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder="Current Location"
                value={formData.currentLocation}
                onChangeText={(value) =>
                  setFormData({ ...formData, currentLocation: value })
                }
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
              />
              <Picker
                selectedValue={formData.weightUnit}
                style={styles.picker}
                onValueChange={(value) =>
                  setFormData({ ...formData, weightUnit: value })
                }
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
              />
              <Picker
                selectedValue={formData.lengthUnit}
                style={styles.picker}
                onValueChange={(value) =>
                  setFormData({ ...formData, lengthUnit: value })
                }
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
                keyboardType="number-pad"
              />
            </View>

            <Button title="Add Load" onPress={handleSubmit} />
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Your existing styles remain the same...
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
});
