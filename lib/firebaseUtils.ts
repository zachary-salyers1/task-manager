import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { Client, Project, Task } from '../types';

// Client functions
export const addClient = async (client: Omit<Client, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'clients'), client);
    return docRef.id;
  } catch (error) {
    console.error("Error adding client: ", error);
    throw error;
  }
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'clients', id), client);
  } catch (error) {
    console.error("Error updating client: ", error);
    throw error;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'clients', id));
  } catch (error) {
    console.error("Error deleting client: ", error);
    throw error;
  }
};

export const getClients = async (): Promise<Client[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  } catch (error) {
    console.error("Error getting clients: ", error);
    throw error;
  }
};

// Project functions
export const addProject = async (project: Omit<Project, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'projects'), project);
    return docRef.id;
  } catch (error) {
    console.error("Error adding project: ", error);
    throw error;
  }
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'projects', id), project);
  } catch (error) {
    console.error("Error updating project: ", error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    console.error("Error deleting project: ", error);
    throw error;
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error("Error getting projects: ", error);
    throw error;
  }
};

// Task functions
export const addTask = async (task: Omit<Task, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), { ...task, completionDate: task.completionDate.toISOString() });
    return docRef.id;
  } catch (error) {
    console.error("Error adding task: ", error);
    throw error;
  }
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<void> => {
  try {
    const updateData = { ...task };
    if (task.completionDate) {
      updateData.completionDate = task.completionDate.toISOString();
    }
    await updateDoc(doc(db, 'tasks', id), updateData);
  } catch (error) {
    console.error("Error updating task: ", error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (error) {
    console.error("Error deleting task: ", error);
    throw error;
  }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data, 
        completionDate: new Date(data.completionDate) 
      } as Task;
    });
  } catch (error) {
    console.error("Error getting tasks: ", error);
    throw error;
  }
};