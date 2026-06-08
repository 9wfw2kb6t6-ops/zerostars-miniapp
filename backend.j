import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

// 📜 LOG SYSTEM
export async function addLog(action, data){

  await addDoc(collection(db,"logs"),{
    action,
    data,
    time:new Date().toISOString()
  });

}
