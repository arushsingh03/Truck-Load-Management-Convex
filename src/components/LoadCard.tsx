import React from "react";
import { theme } from "../theme";
import { Load } from "../types/types";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";

type LoadCardProps = {
  load: Load;
};

export const LoadCard = ({ load }: LoadCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeItem}>
          <MaterialIcons name="event" size={20} color={theme.colors.primary} />
          <Text style={styles.dateTimeText}>{load.createdAt}</Text>
        </View>
        <View style={styles.TimeItem}>
          <MaterialIcons
            name="access-time"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.dateTimeText}>
            {/* @ts-ignore */}
            {dayjs(load._creationTime).format("hh:mm A")}
          </Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationItem}>
          <MaterialIcons
            name="location-on"
            size={24}
            color={theme.colors.primary}
          />
          <View>
            <Text style={styles.labelText}>From</Text>
            <Text style={styles.locationText}>{load.currentLocation}</Text>
          </View>
        </View>

        <MaterialIcons
          name="arrow-forward"
          size={24}
          color={theme.colors.secondary}
          style={styles.arrowIcon}
        />

        <View style={styles.tolocationItem}>
          <MaterialIcons
            name="location-on"
            size={24}
            color={theme.colors.primary}
          />
          <View>
            <Text style={styles.labelText}>To</Text>
            <Text style={styles.locationText}>{load.destinationLocation}</Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.labelText}>Weight</Text>
          <Text style={styles.valueText}>
            {load.weight} {load.weightUnit}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.labelText}>Truck Length</Text>
          <Text style={styles.valueText}>
            {load.truckLength} {load.lengthUnit}
          </Text>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactContainer}>
        <View style={styles.contactItem}>
          <MaterialIcons
            name="phone"
            size={20}
            color={theme.colors.secondary}
          />
          <Text style={styles.contactText}>{load.contactNumber}</Text>
        </View>
        <View style={styles.contactItem}>
          <MaterialIcons
            name="email"
            size={20}
            color={theme.colors.secondary}
          />
          <Text style={styles.contactText}>{load.email}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  TimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 120,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.xl,
  },
  dateTimeText: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 80,
  },
  tolocationItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 80,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  detailItem: {
    alignItems: "center",
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: theme.colors.secondary,
    fontWeight: "500",
  },
  valueText: {
    fontSize: 16,
    color: theme.colors.secondary,
    fontWeight: "500",
  },
  contactText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.secondary,
  },
});
