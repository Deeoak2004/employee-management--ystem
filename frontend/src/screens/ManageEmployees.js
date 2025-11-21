import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  DataTable,
  Appbar,
  Portal,
  Modal,
  Provider,
  Snackbar,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { getUsers, createUser, updateUser, deleteUser } from "../services/api";

const STORAGE_KEY = "USERS";

const ManageEmployees = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [token, setToken] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState(""); 
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  const isFocused = useIsFocused();

  useEffect(() => {
    const init = async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        const email = await AsyncStorage.getItem("email");
        if (!t || !email) return;
        setToken(t);
        setCurrentUserEmail(email);

        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        let localUsers = saved ? JSON.parse(saved) : [];

        const res = await getUsers(t);
        const apiUsers = Array.isArray(res.data) ? res.data : [];

        const mergedUsers = [...localUsers];
        apiUsers.forEach((apiUser) => {
          if (!mergedUsers.find((u) => u.id === apiUser.id))
            mergedUsers.push(apiUser);
        });

        setUsers(mergedUsers);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedUsers));
      } catch (err) {
        console.error("Error initializing:", err);
        setMessage("Failed to load users.");
      }
    };

    if (isFocused) init();
  }, [isFocused]);

  const saveUsersToStorage = async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Error saving users:", e);
    }
  };

  const handleSaveUser = async () => {
    setMessage("");

    if (!form.name || !form.email || (!editingUser && !form.password)) {
      setMessage("Please fill all required fields");
      return;
    }

    // ⭐ Minimum 5 letters validation
    if (form.name.trim().length < 5) {
      setMessage("Name must contain at least 5 letters");
      return;
    }

    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(form.email)) {
      setMessage("Only Gmail addresses ending with @gmail.com allowed");
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, form, token);
        const newList = users.map((u) =>
          u.id === editingUser.id ? { ...u, ...form } : u
        );
        setUsers(newList);
        saveUsersToStorage(newList);
        setMessage("User updated successfully ✅");

        setTimeout(() => {
          setVisible(false);
          setEditingUser(null);
          setForm({ name: "", email: "", password: "", role: "Employee" });
          setMessage("");
        }, 1500);
      } else {
        const res = await createUser(form, token);
        const newList = [...users, res.data];
        setUsers(newList);
        saveUsersToStorage(newList);
        setMessage("User created successfully ✅");

        setTimeout(() => {
          setVisible(false);
          setForm({ name: "", email: "", password: "", role: "Employee" });
          setMessage("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage("This Gmail already exists");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setVisible(true);
    setMessage("");
  };

  const openDeleteConfirm = (user) => {
    setSelectedUser(user);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedUser.id, token);
      const newList = users.filter((u) => u.id !== selectedUser.id);
      setUsers(newList);
      saveUsersToStorage(newList);

      setSnackMessage("User deleted successfully!");
      setSnackVisible(true);
    } catch (err) {
      console.error("Delete error:", err);
      setSnackMessage("Failed to delete user!");
      setSnackVisible(true);
    }

    setConfirmVisible(false);
  };

  return (
    <Provider>
      <Appbar.Header style={{ backgroundColor: "#f6f6f6" }}>
        <Appbar.Content title="" />
        <Button
          mode="contained"
          onPress={() => {
            setForm({ name: "", email: "", password: "", role: "Employee" });
            setEditingUser(null);
            setVisible(true);
            setMessage("");
          }}
          style={styles.addButton}
        >
          Add Employee
        </Button>
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <Text style={styles.tableHeading}>All Employees/Admins</Text>

        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Sr. No.</DataTable.Title>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Email</DataTable.Title>
            <DataTable.Title>Role</DataTable.Title>
            <DataTable.Title>Action</DataTable.Title>
          </DataTable.Header>

          {users.map((user, index) => (
            <DataTable.Row key={user.id}>
              <DataTable.Cell>{index + 1}</DataTable.Cell>
              <DataTable.Cell>{user.name}</DataTable.Cell>
              <DataTable.Cell>{user.email}</DataTable.Cell>
              <DataTable.Cell>{user.role}</DataTable.Cell>

              <DataTable.Cell>
                <View style={{ flexDirection: "row" }}>
                  <Button
                    mode="contained"
                    onPress={() => handleEditUser(user)}
                    style={styles.actionButton}
                  >
                    Edit
                  </Button>

                  <Button
                    mode="contained"
                    buttonColor="#e53935"
                    onPress={() => openDeleteConfirm(user)}
                    disabled={user.email === currentUserEmail}
                    style={styles.actionButton}
                  >
                    Delete
                  </Button>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>

      {/* CREATE / EDIT MODAL */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalBox}>
          <Card>
            <Card.Content>
              <Text style={styles.heading}>
                {editingUser ? "Edit User" : "Create Employee/Admin"}
              </Text>

              {message ? (
                <Text
                  style={[
                    styles.message,
                    message.includes("successfully") ? styles.success : styles.error,
                  ]}
                >
                  {message}
                </Text>
              ) : null}

              <TextInput 
                label="Name" 
                value={form.name} 
                onChangeText={(text) => setForm({ ...form, name: text })} 
                style={styles.input} 
              />

              <TextInput 
                label="Email" 
                value={form.email} 
                onChangeText={(text) => setForm({ ...form, email: text })} 
                style={styles.input} 
              />

              <TextInput 
                label="Password" 
                value={form.password} 
                onChangeText={(text) => setForm({ ...form, password: text })} 
                secureTextEntry 
                style={styles.input} 
              />

              <TextInput 
                label="Role (Admin/Employee)" 
                value={form.role} 
                onChangeText={(text) => setForm({ ...form, role: text })} 
                style={styles.input} 
              />

              <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleSaveUser} style={styles.primaryButton}>
                  {editingUser ? "Update User" : "Create User"}
                </Button>

                <Button mode="outlined" onPress={() => setVisible(false)} style={styles.secondaryButton}>
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* DELETE CONFIRM MODAL */}
      <Portal>
        <Modal visible={confirmVisible} onDismiss={() => setConfirmVisible(false)} contentContainerStyle={styles.confirmModal}>
          <Card>
            <Card.Content>
              <Text style={styles.confirmText}>Are you sure you want to delete this user?</Text>

              <View style={styles.confirmRow}>
                <Button mode="contained" buttonColor="#e53935" onPress={confirmDelete} style={styles.confirmButton}>
                  YES
                </Button>

                <Button mode="outlined" onPress={() => setConfirmVisible(false)} style={styles.confirmButton}>
                  NO
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* SNACKBAR */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2000}
      >
        {snackMessage}
      </Snackbar>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  addButton: { marginRight: 10, alignSelf: "center" },
  tableHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  primaryButton: { flex: 1, marginRight: 8, marginTop: 8 },
  secondaryButton: { flex: 1, marginLeft: 8, marginTop: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  actionButton: { marginHorizontal: 6, borderRadius: 6, paddingHorizontal: 10 },
  message: { marginBottom: 10, fontSize: 15, textAlign: "center" },
  success: { color: "green" },
  error: { color: "red" },
  modalBox: { backgroundColor: "white", padding: 18, marginHorizontal: 30, borderRadius: 12, elevation: 5, width: "45%", alignSelf: "center" },
  confirmModal: { backgroundColor: "white", padding: 18, marginHorizontal: 40, borderRadius: 12, elevation: 5, width: "25%", alignSelf: "center" },
  confirmText: { fontSize: 16, marginBottom: 12, textAlign: "center" },
  confirmRow: { flexDirection: "row", justifyContent: "space-between" },
  confirmButton: { marginHorizontal: 6, minWidth: 90 },
});

export default ManageEmployees;
