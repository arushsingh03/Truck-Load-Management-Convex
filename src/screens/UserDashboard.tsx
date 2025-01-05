import React from "react";
import { theme } from "../theme";
import { Load } from "../types/types";
import { useQuery } from "convex/react";
import { FlashList } from "@shopify/flash-list";
import { api } from "../../convex/_generated/api";
import { LoadCard } from "../components/LoadCard";
import { View, StyleSheet, Text } from "react-native";

export const UserDashboard = () => {
  const loads = useQuery(api.loads.getTodayLoads);

  if (!loads) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading loads...</Text>
      </View>
    );
  }

  if (loads.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No loads available for today</Text>
      </View>
    );
  }

  const loadsWithId = loads.map((load) => ({
    ...load,
    id: load._id.toString(),
  }));

  return (
    <View style={styles.container}>
      <FlashList
        data={loadsWithId}
        renderItem={({ item }: { item: Load }) => <LoadCard load={item} />}
        estimatedItemSize={200}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  separator: {
    height: theme.spacing.md,
  },
  loadingText: {
    textAlign: "center",
    color: theme.colors.secondary,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.secondary,
    fontSize: 16,
  },
});
