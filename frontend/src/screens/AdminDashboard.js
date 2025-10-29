import React, { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Title, Card, Portal, Dialog, Paragraph } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [visible, setVisible] = useState(false); // Dialog visibility

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const confirmLogout = () => {
    hideDialog();
    logout();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Admin Dashboard</Title>

          <Button
            mode="contained"
            onPress={() => navigation.navigate("ManageEmployees")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Manage Employees
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate("ManageTasks")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Manage Tasks
          </Button>

          <Button
            mode="contained"
            onPress={showDialog}
            style={[styles.button, styles.logoutButton]}
            contentStyle={styles.buttonContent}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* logout ke liye Dialogbox add kiya hai

*/}


<Portal>
  <Dialog
    visible={visible}
    onDismiss={hideDialog}
    style={{
      width: "35%",         
      alignSelf: "center",  
      borderRadius: 15,     
      elevation: 5          
    }}
  >
    <Dialog.Title style={{ fontSize: 20, textAlign: "center" }}>Logout</Dialog.Title>
    <Dialog.Content>
      <Paragraph style={{ fontSize: 16, textAlign: "center" }}>
        Are you sure you want to logout?
      </Paragraph>
    </Dialog.Content>
    <Dialog.Actions style={{ justifyContent: "space-around" }}>
      <Button onPress={hideDialog}>Cancel</Button>
      <Button onPress={confirmLogout}>OK</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
</View>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1976d2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonContent: {
    height: 50,
    justifyContent: "center",
  },
  logoutButton: {
    backgroundColor: "#e53935",
  },
});

export default AdminDashboard;
