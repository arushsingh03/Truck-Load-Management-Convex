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
      });
    } catch (error) {
      console.log("Error setting up notification channel:", error);
    }
  }

  if (Device.isDevice) {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.log("Project ID not found");
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
        devicePushToken: {
          type: "fcm",
          data: ""
        }
      })).data;
    } catch (error) {
      console.log("Error getting push token:", error);
    }
  }

  return token;
};

export const sendPushNotifications = async (userTokens: string[], loadData: any) => {
  try {
    const messages = userTokens.map((token) => ({
      to: token,
      sound: "notification.wav",
      title: "New Load Available! 🚛",
      body: `From ${loadData.currentLocation} to ${loadData.destinationLocation}`,
      data: {
        type: "newLoad",
        weight: `${loadData.weight} ${loadData.weightUnit}`,
        truckLength: `${loadData.truckLength} ${loadData.lengthUnit}`,
        contact: loadData.contactNumber,
        currentLocation: loadData.currentLocation,
        destinationLocation: loadData.destinationLocation,
      },
    }));

    const chunks = [];
    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }

    await Promise.all(
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
  } catch (error) {
    console.error("Error sending push notifications:", error);
    throw new Error("Failed to send push notifications");
  }
};