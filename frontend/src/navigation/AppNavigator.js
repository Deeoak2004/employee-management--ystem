import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../src/screens/LoginScreen";
import AdminDashboard from "../src/screens/AdminDashboard";
import EmployeeDashboard from "../src/screens/EmployeeDashboard";
import { AuthContext } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === "Admin" ? (
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      ) : (
        <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
      )}
    </Stack.Navigator>
  );
}