
import React, { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Title,
  Card,
  Portal,
  Dialog,
  Paragraph,
  Text,
} from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const AdminDashboard = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);

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
          labelStyle={{ fontSize: 16 }}
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
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Logout confirmation</Dialog.Title>

          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              Are you sure you want to logout?
            </Paragraph>
          </Dialog.Content>

          <Dialog.Actions style={{ justifyContent: "space-around" }}>
            <Button onPress={hideDialog}><button style={styles.censel}>Censel</button></Button>
            <Button onPress={confirmLogout}><button style={styles.logout}>Yes,Log out !</button ></Button>
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
    backgroundColor: "#e8edf3",
    borderRadius: 12,
    elevation: 4,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
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
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
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
    width: "30%",
    alignSelf: "center",
    borderRadius: 15,
    elevation: 5,
  },
  logout:{
    //backgroundColor:"#fc0d0dff",
    //margin:340,
    borderColor: "#e91224ff",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor :"#bb0817ff",
    paddingHorizontal: 10,
    width: "100%",
    //color: "#0a07beff",
    fontSize: 13,
    //fontWeight: "600",
    flexDirection: "row",
    justifyContent: "space-between",
   // marginTop: 20,
    paddingVertical:10,
    paddingHorizontal:80,
    padding: 15 ,
    color:"rgba(243, 243, 232, 0.97)"
    
  },
  censel:
  {  padding: 15 ,
    borderColor: "rgba(20, 19, 19, 1)",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: "100%",
    fontSize: 13,
    backgroundColor :"#87b6b0ff",

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
});

export default AdminDashboard;