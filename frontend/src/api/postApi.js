import axios from "axios";
import { API_SERVER_HOST } from './apiClient';

const prefix = `${API_SERVER_HOST}/api/post`;

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${prefix}/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return { url: `${API_SERVER_HOST}${response.data.url}` };
};

export const savePost = async ({ title, content, attachments }) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (attachments && attachments.length > 0) {
        attachments.forEach(file => formData.append("attachments", file));
    }
    const response = await axios.post(`${prefix}/save`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return response.data;
};
