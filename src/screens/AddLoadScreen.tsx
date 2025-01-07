import { theme } from "../theme";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "../components/Button";
import { api } from "../../convex/_generated/api";
import { Picker } from "@react-native-picker/picker";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  ImageBackground,
} from "react-native";

export const AddLoadScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    currentLocation: "",
    destinationLocation: "",
    weight: "",
    weightUnit: "kg",
    truckLength: "",
    lengthUnit: "ft",
    contactNumber: "",
    email: "",
  });
  const [error, setError] = useState("");

  const addLoad = useMutation(api.loads.addLoad);

  const handleSubmit = async () => {
    try {
      await addLoad({
        ...formData,
        weight: parseFloat(formData.weight),
        truckLength: parseFloat(formData.truckLength),
        weightUnit: formData.weightUnit as "kg" | "ton",
        lengthUnit: formData.lengthUnit as "ft" | "m",
      });
      navigation.goBack();
    } catch (error: any) {
      setError(error.message);
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
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) =>
                  setFormData({ ...formData, email: value })
                }
                keyboardType="email-address"
                autoCapitalize="none"
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
