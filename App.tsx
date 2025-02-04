import React from "react";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "./src/store/authStore";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "./src/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => {
    try {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      };
    } catch (error) {
      console.error("Error handling notification:", error);
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
  },
});

const initializeConvexClient = () => {
  try {
    const convexUrl = Constants.expoConfig?.extra?.convex?.apiUrl;
    if (!convexUrl) {
      throw new Error(
        "Convex URL not configured. Please check your app.json configuration."
      );
    }
    return new ConvexReactClient(convexUrl);
  } catch (error) {
    console.error("Error initializing Convex client:", error);
    throw error;
  }
};

const registerForPushNotificationsAsync = async () => {
  let token;

  try {
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "notification.wav",
        });
      } catch (error) {
        console.error("Error creating notification channel:", error);
      }
    }

    if (!Constants.isDevice) {
      console.log("Push notifications require physical device");
      return undefined;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return undefined;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error("Project ID is not configured in app.json");
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
        applicationId: Constants.expoConfig?.android?.package,
      })
    ).data;

    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return undefined;
  }
};

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={{ marginTop: 10 }}>Loading...</Text>
  </View>
);

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [convexClient, setConvexClient] =
    React.useState<ConvexReactClient | null>(null);
  const [expoPushToken, setExpoPushToken] = React.useState<
    string | undefined
  >();
  const [notification, setNotification] =
    React.useState<Notifications.Notification>();
  const notificationListener = React.useRef<any>();
  const responseListener = React.useRef<any>();

  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  React.useEffect(() => {
    async function initialize() {
      try {
        const client = initializeConvexClient();
        setConvexClient(client);

        await initializeAuth();

        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);

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

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      if (convexClient) {
        convexClient.close();
      }
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
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
