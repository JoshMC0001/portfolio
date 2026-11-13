const firebaseConfig = {
  apiKey: "AIzaSyDCz7E4DSG9nanQ_fmM9fF8te6TXBpXUA0",
  authDomain: "portfolio-5ed3f.firebaseapp.com",
  projectId: "portfolio-5ed3f",
  storageBucket: "portfolio-5ed3f.appspot.com",
  messagingSenderId: "127710028877",
  appId: "1:127710028877:web:bde5c98f7283ee5dbc2804",
  measurementId: "G-RBDZRPQ2H9"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Ask Cloudinary for a smaller, auto-compressed copy (WebP/AVIF where supported) at width w.
const cdn = (url, w) => /res\.cloudinary\.com\/.+\/upload\//.test(url || '') && !/\/upload\/[a-z]_/.test(url)
  ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`) : url;
