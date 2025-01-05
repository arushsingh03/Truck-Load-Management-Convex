import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AppNavigator } from "./src/navigation/AppNavigator";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <AppNavigator />
    </ConvexProvider>
  );
}
