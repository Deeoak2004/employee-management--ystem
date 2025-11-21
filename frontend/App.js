import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/context/AuthContext";
import { Provider as PaperProvider } from "react-native-paper"; // <-- Add this

import LoginScreen from "./src/screens/LoginScreen";
import AdminDashboard from "./src/screens/AdminDashboard";
import ManageEmployees from "./src/screens/ManageEmployees";
import ManageTasks from "./src/screens/ManageTasks";
import EmployeeDashboard from "./src/screens/EmployeeDashboard";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider> {/* <-- Wrap everything in PaperProvider */}
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="ManageEmployees" component={ManageEmployees} />
            <Stack.Screen name="ManageTasks" component={ManageTasks} />
            <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
