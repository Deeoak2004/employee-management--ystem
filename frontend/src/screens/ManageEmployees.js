import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  TextInput, Button,Text,Card,DataTable,Appbar,Portal,Modal,Provider,
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
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false); 

  const isFocused = useIsFocused();

  useEffect(() => {
    const init = async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        if (!t) return;
        setToken(t);

        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        let localUsers = [];
        if (saved) localUsers = JSON.parse(saved);

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
        console.error("Error initializing users:", err);
        setMessage("Failed to load users, using saved data if any");
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

    
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(form.email)) {
      setMessage("Only Gmail addresses are allowed ending with '@gmail.com'");
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
        }, 3000);
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
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage("this Gmail already exists");
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

  const handleDeleteUser = async (user) => {
    try {
      await deleteUser(user.id, token);
      const newList = users.filter((u) => u.id !== user.id);
      setUsers(newList);
      saveUsersToStorage(newList);
      setMessage("User deleted successfully ✅");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("Failed to delete user ❌");
    }
  };

  return (
    <Provider>
      <Appbar.Header>
        <Appbar.Content title="" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            setForm({ name: "", email: "", password: "", role: "Employee" });
            setEditingUser(null);
            setVisible(true);
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <Text style={styles.tableHeading}>All Employees/Admins</Text>

        <DataTable>
          <DataTable.Header>
            <DataTable.Title>ID</DataTable.Title>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Email</DataTable.Title>
            <DataTable.Title>Role</DataTable.Title>
            <DataTable.Title>Action</DataTable.Title>
          </DataTable.Header>

          {users.map((user) => (
            <DataTable.Row key={user.id}>
              <DataTable.Cell>{user.id}</DataTable.Cell>
              <DataTable.Cell>{user.name}</DataTable.Cell>
              <DataTable.Cell>{user.email}</DataTable.Cell>
              <DataTable.Cell>{user.role}</DataTable.Cell>
              <DataTable.Cell>
                <View style={{ flexDirection: "row" }}>
                  <Button
                    mode="contained"
                    onPress={() => handleEditUser(user)}
                    style={{ marginRight: 5 }}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="#e53935"
                    onPress={() => handleDeleteUser(user)}
                  >
                    Delete
                  </Button>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>

      
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modalBox}
        >
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

              <Button
                mode="contained"
                onPress={handleSaveUser}
                style={styles.button}
              >
                {editingUser ? "Update User" : "Create User"}
              </Button>
              <Button onPress={() => setVisible(false)} style={{ marginTop: 5 }}>
                Cancel
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  button: { marginTop: 10 },
  tableHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  message: { marginBottom: 10, fontSize: 16, textAlign: "center" },
  success: { color: "green" },
  error: { color: "red" },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 20,
    elevation: 5,
  },
});

export default ManageEmployees;
