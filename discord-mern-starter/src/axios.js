import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8002' // Replace with your backend URL
});

export default instance;