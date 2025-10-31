import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../services/api";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email.trim() && !password.trim()) {
      setEmailError("Email is required");
      setPasswordError("Password is required");
      return;
    }
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }
       
  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailPattern.test(email)) {
    setEmailError("plase enter the correct email");
    return;
  }




    try {
      setLoading(true);
      const res = await loginUser({ email, password });

      if (res.data?.access_token) {
        await AsyncStorage.setItem("token", res.data.access_token);
        await AsyncStorage.setItem("role", res.data.role || "Employee");
        await AsyncStorage.setItem("email", email);

        if (res.data.role === "Admin") {
          navigation.replace("AdminDashboard");
        } else {
          navigation.replace("EmployeeDashboard");
        }
      }
    } catch (err) {
      const message = err.response?.data?.detail || "Server error";

      if (message.toLowerCase().includes("email")) {
        setEmailError(message);
      } else if (message.toLowerCase().includes("password")) {
        setPasswordError(message);
      } else {
        setEmailError(message);
        setPasswordError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.heading}>Login</Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
          />
          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          >
            Login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f4f6f9" },
  card: { padding: 20, borderRadius: 20, width: "100%", maxWidth: 400, alignSelf: "center", elevation: 5, backgroundColor: "#fff" },
  heading: { fontSize: 22, textAlign: "center", fontWeight: "600", marginBottom: 20 },
  input: { marginBottom: 5, backgroundColor: "#fff" },
  loginButton: { marginTop: 20, width: 200, height: 45, alignSelf: "center", borderRadius: 10, backgroundColor: "blue" },
  error: { color: "red", marginBottom: 5, marginLeft: 5, fontSize: 13 },
});





export default LoginScreen;
