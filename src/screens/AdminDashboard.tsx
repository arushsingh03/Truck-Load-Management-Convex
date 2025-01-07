import dayjs from "dayjs";
import { theme } from "../theme";
import { Load } from "../types/types";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import { Button } from "../components/Button";
import { View, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LoadCard } from "../components/LoadCard";
import { api } from "../../convex/_generated/api";
import { SearchFilters } from "../components/SearchFilters";

export const AdminDashboard = ({ navigation }: any) => {
  const [searchParams, setSearchParams] = useState({
    dateFrom: dayjs().format("YYYY-MM-DD"),
    dateTo: dayjs().format("YYYY-MM-DD"),
    location: "",
  });

  const loads = useQuery(api.loads.getLoads, searchParams);

  const renderItem = ({ item }: { item: Load }) => (
    <LoadCard
      load={item}
      isAdmin={true}
      onEdit={function (id: string): void {
        throw new Error("Function not implemented.");
      }}
      onDelete={function (id: string): void {
        throw new Error("Function not implemented.");
      }}
    />
  );

  return (
    <View style={styles.container}>
      <SearchFilters params={searchParams} onParamsChange={setSearchParams} />
      <Button
        title="Add Load"
        onPress={() => navigation.navigate("AddLoad")}
        iconName="truck-plus"
      />
      <View style={styles.listContainer}>
        <FlashList
          data={loads?.map((load) => ({ ...load, id: load._id }))}
          renderItem={renderItem}
          estimatedItemSize={200}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  listContainer: {
    flex: 1,
    marginTop: theme.spacing.md,
  },
  separator: {
    height: theme.spacing.md,
  },
});
