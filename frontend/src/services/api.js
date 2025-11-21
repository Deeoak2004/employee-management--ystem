import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", 
   

});



export const getUsers = (token) =>
  API.get("/users/get-user", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getUserById = (id, token) =>
  API.get(`/users/get-user/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const createUser = (data, token) =>
  API.post("/users/create-user", data, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const updateUser = (id, data, token) =>
  API.put(`/users/update-user/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const deleteUser = (id, token) =>
  API.delete(`/users/delete-user/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });




export const getTasks = (token) =>
  API.get("/tasks/get-tasks", {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getTaskById = (id, token) =>
  API.get(`/tasks/get-task/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const createTask = (data, token) =>
  API.post("/tasks/create-task", data, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const updateTask = (id, data, token) =>
  API.put(`/tasks/update-task/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });


export const deleteTask = (id, token) =>
  API.delete(`/tasks/delete-task/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });




export const loginUser = (data) => API.post("/auth/login", data);