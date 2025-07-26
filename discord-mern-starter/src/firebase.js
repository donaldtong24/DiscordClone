import firebase from 'firebase'

const firebaseConfig = {
    // your firebase config
    apiKey: "AIzaSyAPr3XhpEeT9ZKuK3vYwEWYIp-Vm7L6Uls",
    authDomain: "discord-clone-live-42cfb.firebaseapp.com",
    projectId: "discord-clone-live-42cfb",
    storageBucket: "discord-clone-live-42cfb.firebasestorage.app",
    messagingSenderId: "764165069544",
    appId: "1:764165069544:web:f7d4f3924c13216bd4075d",
    measurementId: "G-QNJDGD3YW0"
};

const firebaseApp = firebase.initializeApp(firebaseConfig)

const db = firebaseApp.firestore()
const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()

export { auth, provider }
export default db