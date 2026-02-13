import React, { useContext, useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import {
  Button,
  Card,
  Portal,
  Dialog,
  Paragraph,
  Text,
} from "react-native-paper";

import { AuthContext } from "../context/AuthContext";

const AdminDashboard = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const confirmLogout = () => {
    hideDialog();
    logout();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerText}></Text>

        <Button
          mode="text"
          onPress={showDialog}
          textColor="#d32f2f"
          icon="logout"
        >
          Logout
        </Button>
      </View>

      {/* Main Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            icon="account-group"
            onPress={() => navigation.navigate("ManageEmployees")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Manage Employees
          </Button>

          <Button
            mode="contained"
            icon="clipboard-check"
            onPress={() => navigation.navigate("ManageTasks")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Manage Tasks
          </Button>
        </Card.Content>
      </Card>

      {/* Logout Dialog */}
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={hideDialog}
          style={[
            styles.dialog,
            { width: isWeb ? "35%" : "85%" },
          ]}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Logout Confirmation
          </Dialog.Title>

          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              Are you sure you want to logout?
            </Paragraph>
          </Dialog.Content>

          <Dialog.Actions style={styles.actions}>
            <Button
              mode="outlined"
              onPress={hideDialog}
              style={styles.cancelBtn}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={confirmLogout}
              style={styles.logoutBtn}
              textColor="#fff"
            >
              Yes, Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8edf3",
    padding: 20,
  },

  topBar: {
    height: 60,
    borderRadius: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e3d59",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    backgroundColor: "#ffffff",
    alignSelf: "center",
    marginTop: "15%",
  },

  button: {
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1976d2",
  },

  buttonContent: {
    height: 52,
  },

  dialog: {
    alignSelf: "center",
    borderRadius: 15,
  },

  dialogTitle: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "700",
  },

  dialogText: {
    fontSize: 16,
    textAlign: "center",
  },

  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  cancelBtn: {
    borderRadius: 6,
  },

  logoutBtn: {
    backgroundColor: "#d32f2f",
    borderRadius: 6,
  },
});

export default AdminDashboard;
