import { getAuth } from 'firebase/auth';
import {  getDocs , collection , getFirestore , query , where} from 'firebase/firestore';
// import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import firebase from 'firebase/app';
import 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1XQNm1iNTKIfDNA36Bx5Ar1OAUB73dOs",
  authDomain: "voting-system-80cc2.firebaseapp.com",
  projectId: "voting-system-80cc2",
  storageBucket: "voting-system-80cc2.appspot.com",
  messagingSenderId: "402500146746",
  appId: "1:402500146746:web:f7aeb327e3c2c2a771c703",
  measurementId: "G-VEZFL81GBP"
};

export const app = initializeApp(firebaseConfig);
// Get the Auth instance
export const auth = getAuth(app);
// Get the Firestore instance
export const db = getFirestore(app);

export const fetchDocumentByFieldValue = async (collectionName, fieldName, fieldValue) => {
  const q = query(collection(db, collectionName), where(fieldName, '==', fieldValue));
  const querySnapshot = await getDocs(q);
  
  const documents = querySnapshot.docs.map((doc) => {let data = doc.data(); data.docId = doc.id; return data});
  
  return documents[0];
};
