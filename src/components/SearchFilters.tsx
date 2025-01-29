import dayjs from "dayjs";
import { theme } from "../theme";
import { Button } from "./Button";
import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  Modal,
  TouchableOpacity,
  Text,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type SearchFiltersProps = {
  params: {
    dateFrom: string;
    dateTo: string;
    location: string;
  };
  onParamsChange: (params: any) => void;
  resultsExist: boolean;
};

export const SearchFilters = ({
  params,
  onParamsChange,
  resultsExist,
}: SearchFiltersProps) => {
  const initialParams = {
    dateFrom: dayjs().format("YYYY-MM-DD"),
    dateTo: dayjs().format("YYYY-MM-DD"),
    location: "",
  };

  const [localParams, setLocalParams] = useState(params || initialParams);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  useEffect(() => {
    if (!resultsExist) {
      setShowWarning(true);
      if (localParams.location) {
        setWarningMessage(
          `No loads found for location "${localParams.location}"`
        );
      } else if (
        localParams.dateFrom !== initialParams.dateFrom ||
        localParams.dateTo !== initialParams.dateTo
      ) {
        setWarningMessage(
          `No loads found between ${dayjs(localParams.dateFrom).format("MMM D, YYYY")} and ${dayjs(localParams.dateTo).format("MMM D, YYYY")}`
        );
      }
    } else {
      setShowWarning(false);
      setWarningMessage("");
    }
  }, [resultsExist, localParams, initialParams]);

  const handleReset = () => {
    const resetParams = {
      ...initialParams,
      dateFrom: dayjs().format("YYYY-MM-DD"),
      dateTo: dayjs().format("YYYY-MM-DD"),
    };
    setLocalParams(resetParams);
    onParamsChange(resetParams);
    setShowWarning(false);
    setWarningMessage("");
  };

  const handleDateChange = (
    field: "dateFrom" | "dateTo",
    date: Date | undefined
  ) => {
    if (date) {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const newParams = {
        ...localParams,
        [field]: formattedDate,
      };

      if (
        field === "dateTo" &&
        dayjs(newParams.dateFrom).isAfter(formattedDate)
      ) {
        alert(
          "Invalid date range! 'From' date must be before or equal to 'To' date."
        );
        return;
      }

      setLocalParams(newParams);
      onParamsChange(newParams);
    }
  };

  const handleLocationChange = (text: string) => {
    const newParams = {
      ...localParams,
      location: text,
    };
    setLocalParams(newParams);
    onParamsChange(newParams);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterButtonContainer}>
        <Button
          title="Filter"
          onPress={() => setIsVisible(true)}
          variant="tertiary"
          iconName="filter-alt"
        />
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetIcon}>
            <MaterialIcons name="refresh" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {showWarning && warningMessage && (
          <Animated.View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>
              <MaterialIcons name="warning-amber" size={54} color="red" />
            </Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>{warningMessage}</Text>
            </View>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={handleReset}
            >
              <Text style={styles.clearFilterText}>Clear Filters</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

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
                      handleDateChange("dateFrom", date);
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
                      handleDateChange("dateTo", date);
                    }
                  }}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Search load or location"
                value={localParams.location}
                onChangeText={handleLocationChange}
              />

              <Button
                title="Close"
                onPress={() => setIsVisible(false)}
                iconName="close"
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  filterButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  resetButton: {
    marginRight: 22,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetIcon: {
    fontSize: 30,
    color: theme.colors.text,
  },
  warningContainer: {
    backgroundColor: theme.colors.warning,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: "85%",
    alignSelf: "center",
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: 10,
  },
  warningText: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  clearFilterButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.sm,
    alignItems: "center",
    backgroundColor: theme.colors.background,
    marginVertical: 10,
    marginHorizontal: 40,
    borderRadius: 10,
  },
  clearFilterText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
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
});
