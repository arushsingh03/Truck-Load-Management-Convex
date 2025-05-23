import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendNotification = action({
  args: {
    pushTokens: v.array(v.string()),
    loadData: v.any(),
  },
  handler: async (_, { pushTokens, loadData }) => {
    const expoPushEndpoint = "https://exp.host/--/api/v2/push/send";
    const chunkSize = 100;
    const messages = [];

    for (const token of pushTokens) {
      messages.push({
        to: token,
        sound: "notification.wav",
        title: "New Load Available! 🚛",
        body: `From ${loadData.currentLocations.join(" → ")} to ${loadData.destinationLocations.join(" → ")}`,
        data: {
          type: "newLoad",
          loadId: loadData.id,
          weight: loadData.weight,
          truckLength: loadData.truckLength,
          contact: loadData.contact,
          // Add other relevant data from loadData as needed
        },
      });
    }

    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      try {
        const response = await fetch(expoPushEndpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        });

        if (response.ok) {
          console.log(`Successfully sent chunk ${i / chunkSize + 1}`);
          // Consider more detailed logging of response if needed, e.g., response.json()
        } else {
          const errorData = await response.json();
          console.error(
            `Failed to send chunk ${i / chunkSize + 1}: ${response.status} ${response.statusText}`,
            errorData
          );
        }
      } catch (error) {
        console.error(
          `Error sending chunk ${i / chunkSize + 1}:`,
          error
        );
      }
    }
  },
});
