import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";



const firebaseConfig = {
  apiKey: "AIzaSyCE5ErkXbwcewLWuVauFIhdedi8ip05sFM",
  authDomain: "tui-coffee-shop.firebaseapp.com",
  projectId: "tui-coffee-shop",
  storageBucket: "tui-coffee-shop.firebasestorage.app",
  messagingSenderId: "504534572220",
  appId: "1:504534572220:web:6c21d2d6dab569764084b9",
  databaseURL:
  "https://tui-coffee-shop-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);