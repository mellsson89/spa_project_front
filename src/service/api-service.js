import axios from "axios";

axios.defaults.baseURL='https://spa-backend.pp.ua'

export const getAllComments = async (page=1, limit=25, key = 'createdAt', sort='DESC') => {
    try {
        const data = await axios.get(`/api/v1/comments?page=${page}&limit=${limit}&key=${key}&sort=${sort}`);
        return data;
    }
    catch (e) {
        console.log(e);
    }
}

export const addComment = async (credential) => {
    try {
        const data = await axios.post('/api/v1/comments', credential);
        return data;
    }
    catch (e) {
        console.log(e);
    }
}

export const uploadImg = async (credential) => {
    try {
        const data = await axios.post('/api/v1/comments/uploadImg',credential);
        return data;
    }
    catch (e) {
        console.log(e);
    }
}

export const uploadFile = async (credential) => {
    try {
        const data = await axios.post('/api/v1/comments/uploadFile',credential);
        return data;
    }
    catch (e) {
        console.log(e);
    }
}