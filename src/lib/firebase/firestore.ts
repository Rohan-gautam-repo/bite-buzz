import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Generic function to get a document by ID
 */
export const getDocument = async <T>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to get all documents from a collection
 */
export const getDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to add a document
 */
export const addDocument = async <T>(
  collectionName: string,
  data: Omit<T, "id">
): Promise<string> => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to set a document (create or overwrite)
 */
export const setDocument = async <T>(
  collectionName: string,
  documentId: string,
  data: Omit<T, "id">
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a document
 */
export const updateDocument = async (
  collectionName: string,
  documentId: string,
  data: Partial<any>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete a document
 */
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Query documents with filters
 */
export const queryDocuments = async <T>(
  collectionName: string,
  filters: {
    field: string;
    operator: any;
    value: any;
  }[],
  orderByField?: string,
  orderDirection: "asc" | "desc" = "asc",
  limitCount?: number
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [];

    // Add where clauses
    filters.forEach((filter) => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });

    // Add orderBy if specified
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    // Add limit if specified
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Paginated query
 */
export const getPaginatedDocuments = async <T>(
  collectionName: string,
  pageSize: number,
  lastDoc?: DocumentSnapshot,
  constraints: QueryConstraint[] = []
): Promise<{ data: T[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const collectionRef = collection(db, collectionName);
    const queryConstraints = [...constraints, limit(pageSize)];

    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { data, lastDoc: lastVisible };
  } catch (error) {
    console.error(
      `Error getting paginated documents from ${collectionName}:`,
      error
    );
    throw error;
  }
};

/**
 * Batch write operations
 */
export const batchWrite = async (
  operations: Array<{
    type: "set" | "update" | "delete";
    collection: string;
    id: string;
    data?: any;
  }>
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    operations.forEach((operation) => {
      const docRef = doc(db, operation.collection, operation.id);

      switch (operation.type) {
        case "set":
          batch.set(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp(),
          });
          break;
        case "update":
          batch.update(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp(),
          });
          break;
        case "delete":
          batch.delete(docRef);
          break;
      }
    });

    await batch.commit();
  } catch (error) {
    console.error("Error in batch write:", error);
    throw error;
  }
};

/**
 * Check if document exists
 */
export const documentExists = async (
  collectionName: string,
  documentId: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`Error checking document existence in ${collectionName}:`, error);
    return false;
  }
};

/**
 * Get document count
 */
export const getDocumentCount = async (
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<number> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error(`Error getting document count from ${collectionName}:`, error);
    throw error;
  }
};
