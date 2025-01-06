import React from "react";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { View, Text, ActivityIndicator } from "react-native";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: "center", color: "#666" }}>
            {this.state.error?.message || "Unknown error occurred"}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={{ marginTop: 10 }}>Loading...</Text>
  </View>
);

const initializeConvexClient = () => {
  const convexUrl = Constants.expoConfig?.extra?.convex?.apiUrl;

  if (!convexUrl) {
    throw new Error(
      "Convex URL not configured. Please check your app.json configuration."
    );
  }

  return new ConvexReactClient(convexUrl);
};

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [convexClient, setConvexClient] =
    React.useState<ConvexReactClient | null>(null);

  React.useEffect(() => {
    async function initialize() {
      try {
        const client = initializeConvexClient();
        setConvexClient(client);

        await SplashScreen.hideAsync();

        setIsReady(true);
      } catch (e) {
        console.error("Initialization error:", e);
        setError(
          e instanceof Error ? e : new Error("Failed to initialize app")
        );
        await SplashScreen.hideAsync();
      }
    }
    initialize();

    return () => {
      convexClient?.close();
    };
  }, []);

  if (!isReady && !error) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Failed to Start App
        </Text>
        <Text style={{ textAlign: "center", color: "#666" }}>
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {convexClient ? (
          <ConvexProvider client={convexClient}>
            <View style={{ flex: 1 }}>
              <AppNavigator />
            </View>
          </ConvexProvider>
        ) : (
          <LoadingScreen />
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
