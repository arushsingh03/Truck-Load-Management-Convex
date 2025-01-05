import { theme } from "../theme";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "../components/Button";
import { api } from "../../convex/_generated/api";
import { Picker } from "@react-native-picker/picker";
import { View, StyleSheet, TextInput, ScrollView, Text } from "react-native";

export const AddLoadScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    currentLocation: "",
    destinationLocation: "",
    weight: "",
    weightUnit: "kg",
    truckLength: "",
    lengthUnit: "m",
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
        lengthUnit: formData.lengthUnit as "m" | "ft",
      });
      navigation.goBack();
    } catch (error: any) {
      setError(error.message);
    }
  };
  return (
    <ScrollView style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Current Location"
        value={formData.currentLocation}
        onChangeText={(value) =>
          setFormData({ ...formData, currentLocation: value })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Destination Location"
        value={formData.destinationLocation}
        onChangeText={(value) =>
          setFormData({ ...formData, destinationLocation: value })
        }
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Weight"
          value={formData.weight}
          onChangeText={(value) => setFormData({ ...formData, weight: value })}
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
      <View style={styles.row}>
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
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={formData.contactNumber}
        onChangeText={(value) =>
          setFormData({ ...formData, contactNumber: value })
        }
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => setFormData({ ...formData, email: value })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Add Load" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.sm,
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
  },
});
