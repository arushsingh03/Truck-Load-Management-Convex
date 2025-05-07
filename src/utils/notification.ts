import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'notification.wav',
      });
    } catch (error) {
      console.error("Error setting up notification channel:", error);
    }
  }

  if (!Device.isDevice) {
    console.log("Push notifications require physical device");
    return undefined;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log("Failed to get push token for push notification!");
      return undefined;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error("Project ID not found in app configuration");
      return undefined;
    }

    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
      devicePushToken: {
        type: Platform.OS === 'android' ? 'fcm' : 'apns',
        data: ''
      }
    });

    token = expoPushToken.data;
    console.log("Successfully registered for push notifications with token:", token);
    return token;

  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return undefined;
  }
};

export const sendPushNotifications = async (userTokens: string[], loadData: any) => {
  try {
    const messages = userTokens.map((token) => ({
      to: token,
      sound: "notification.wav",
      title: "New Load Available! 🚛",
      body: `From ${loadData.currentLocations.join(" → ")} to ${loadData.destinationLocations.join(" → ")}`,
      data: {
        type: "newLoad",
        weight: `${loadData.weight} ${loadData.weightUnit}`,
        truckLength: `${loadData.truckLength} ${loadData.lengthUnit}`,
        contact: loadData.contactNumber,
        currentLocations: loadData.currentLocations,
        destinationLocations: loadData.destinationLocations,
        bodyType: loadData.bodyType,
        products: loadData.products,
      },
    }));

    const chunks = [];
    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }

    const results = await Promise.allSettled(
      chunks.map((chunk) =>
        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        })
      )
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send notifications chunk ${index}:`, result.reason);
      }
    });

  } catch (error) {
    console.error("Error sending push notifications:", error);
    throw new Error("Failed to send push notifications");
  }
};