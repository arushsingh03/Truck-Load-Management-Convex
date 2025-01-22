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
  resultsExist?: boolean;
};

export const SearchFilters = ({
  params,
  onParamsChange,
  resultsExist = true,
}: SearchFiltersProps) => {
  const initialParams = {
    dateFrom: dayjs().format("YYYY-MM-DD"),
    dateTo: dayjs().format("YYYY-MM-DD"),
    location: "",
  };
  const [localParams, setLocalParams] = useState(initialParams);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleApplyFilters = () => {
    if (!localParams.location || localParams.dateFrom > localParams.dateTo) {
      alert("Invalid filters! Please adjust your inputs.");
    } else {
      onParamsChange(localParams);
      setIsVisible(false);
    }
  };

  const handleOpenModal = () => {
    setLocalParams(initialParams); // Reset fields to initial state
    setIsVisible(true);
  };

  return (
    <View>
      <Button
        title="Filter"
        onPress={handleOpenModal}
        variant="tertiary"
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
                  title={`From: ${localParams.dateFrom}`}
                  onPress={() => setShowFromDate(true)}
                  variant="tertiary"
                  iconName="calendar-today"
                />
                <Button
                  title={`To: ${localParams.dateTo}`}
                  onPress={() => setShowToDate(true)}
                  variant="tertiary"
                  iconName="calendar-today"
                />
              </View>

              {showFromDate && Platform.OS !== "web" && (
                <DateTimePicker
                  value={new Date(localParams.dateFrom)}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowFromDate(false);
                    if (date && event.type !== "dismissed") {
                      setLocalParams({
                        ...localParams,
                        dateFrom: dayjs(date).format("YYYY-MM-DD"),
                      });
                    }
                  }}
                />
              )}

              {showToDate && Platform.OS !== "web" && (
                <DateTimePicker
                  value={new Date(localParams.dateTo)}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowToDate(false);
                    if (date && event.type !== "dismissed") {
                      setLocalParams({
                        ...localParams,
                        dateTo: dayjs(date).format("YYYY-MM-DD"),
                      });
                    }
                  }}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Search load or location"
                value={localParams.location}
                onChangeText={(text) =>
                  setLocalParams({ ...localParams, location: text })
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

      {!resultsExist && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No results found.</Text>
        </View>
      )}
    </View>
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
  noResultsContainer: {
    padding: theme.spacing.md,
    alignItems: "center",
  },
  noResultsText: {
    color: theme.colors.text,
    fontSize: 16,
    fontStyle: "italic",
  },
});
