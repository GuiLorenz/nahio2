// App.js
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/styles/colors";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
