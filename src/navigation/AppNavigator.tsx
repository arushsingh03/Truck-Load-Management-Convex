import React from "react";
import { View } from "react-native";
import { Header } from "../components/Header";
import type { RootStackParamList } from "./types";
import { LoginScreen } from "../screens/LoginScreen";
import { AddLoadScreen } from "../screens/AddLoadScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { UserDashboard } from "../screens/UserDashboard";
import { RegisterScreen } from "../screens/RegisterScreen";
import { AdminDashboard } from "../screens/AdminDashboard";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { NavigationContainer } from "@react-navigation/native";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { HeaderForScreen } from "../components/HeaderForScreens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: "#FFFFFF",
              },
              headerTintColor: "#000000",
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboard}
              options={({ navigation }) => ({
                header: () => <Header navigation={navigation} isAdmin={true} />,
              })}
            />
            <Stack.Screen
              name="UserDashboard"
              component={UserDashboard}
              options={({ navigation }) => ({
                header: () => (
                  <Header navigation={navigation} isAdmin={false} />
                ),
              })}
            />
            <Stack.Screen
              name="AddLoad"
              component={AddLoadScreen}
              options={({ navigation }) => ({
                header: () => (
                  <HeaderForScreen
                    navigation={navigation}
                    title="Add New Load"
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={({ navigation }) => ({
                header: () => (
                  <HeaderForScreen navigation={navigation} title="Profile" />
                ),
              })}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={({ navigation }) => ({
                header: () => (
                  <HeaderForScreen
                    navigation={navigation}
                    title="Edit Profile"
                  />
                ),
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </ErrorBoundary>
  );
};
