import { initializeApp } from "firebase/app";
import { Timestamp, collection, doc, getCountFromServer, getDocs, getFirestore, limit, onSnapshot, orderBy, query, startAfter, updateDoc } from "firebase/firestore";
import { firebaseConfig } from "../utils/firebase-config";
import { Lobby } from "../types";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let lastVisible: any = null;
export const getLobbies = (callback: any) => {
  const q = query(collection(db, 'lobbies'), orderBy('createdAt', 'desc'), limit(20));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const results: Lobby[] = [];

    snapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    lastVisible = snapshot.docs[snapshot.docs.length - 1];
    callback(results);
  });

  return unsubscribe;
};

export const getMoreLobbies = async () => {
  const next = query(collection(db, 'lobbies'),
    orderBy('createdAt', 'desc'),
    startAfter(lastVisible),
    limit(20));

  const snapshot = await getDocs(next);
  const results: Lobby[] = [];

  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return results;
};

export const getLobbyCount = async () => {
  try {
    const lobbyRef = collection(db, 'lobbies');
    const snapshot = await getCountFromServer(lobbyRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting document count:', error);
    return 0;
  }
};

export const updateFirebaseWinner = async (winner: string, lobbyId: string) => {
  const lobbyRef = doc(db, 'lobbies', lobbyId);
  return await updateDoc(lobbyRef, {
    winner: winner,
    completedDate: Timestamp.now()
  });
}