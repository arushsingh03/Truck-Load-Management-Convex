import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { View } from "react-native";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <ConvexProvider client={convex}>
        <AppNavigator />
      </ConvexProvider>
    </View>
  );
}
