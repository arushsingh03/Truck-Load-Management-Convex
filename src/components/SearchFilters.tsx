import dayjs from "dayjs";
import { theme } from "../theme";
import { Button } from "./Button";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";

type SearchFiltersProps = {
  params: {
    dateFrom: string;
    dateTo: string;
    location: string;
  };
  onParamsChange: (params: any) => void;
};

export const SearchFilters = ({
  params,
  onParamsChange,
}: SearchFiltersProps) => {
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleApplyFilters = () => {
    setIsVisible(false);
  };

  return (
    <View>
      <Button
        title="Filters"
        onPress={() => setIsVisible(true)}
        variant="secondary"
        iconName="filter-alt"
      />

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Filters</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
              <View style={styles.dateContainer}>
                <Button
                  title={`From: ${params.dateFrom}`}
                  onPress={() => setShowFromDate(true)}
                  variant="tertiary"
                  iconName="calendar-today"
                />
                <Button
                  title={`To: ${params.dateTo}`}
                  onPress={() => setShowToDate(true)}
                  variant="tertiary"
                  iconName="calendar-today"
                />
              </View>

              {showFromDate && Platform.OS !== "web" && (
                <DateTimePicker
                  value={new Date(params.dateFrom)}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowFromDate(false);
                    if (date && event.type !== "dismissed") {
                      onParamsChange({
                        ...params,
                        dateFrom: dayjs(date).format("YYYY-MM-DD"),
                      });
                    }
                  }}
                />
              )}

              {showToDate && Platform.OS !== "web" && (
                <DateTimePicker
                  value={new Date(params.dateTo)}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowToDate(false);
                    if (date && event.type !== "dismissed") {
                      onParamsChange({
                        ...params,
                        dateTo: dayjs(date).format("YYYY-MM-DD"),
                      });
                    }
                  }}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Search by location"
                value={params.location}
                onChangeText={(text) =>
                  onParamsChange({ ...params, location: text })
                }
              />

              <Button
                title="Apply Filters"
                onPress={handleApplyFilters}
                iconName="check"
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const AddLoadButton = () => {
  return (
    <Button
      title="Add Load"
      onPress={() => console.log("Add Load pressed")}
      variant="primary"
      iconName="add-circle"
    />
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  filterContainer: {
    backgroundColor: theme.colors.background,
  },
  dateContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  applyButton: {
    marginTop: theme.spacing.md,
  },
});
