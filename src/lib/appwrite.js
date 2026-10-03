/**
 * Appwrite Adapter - Seamlessly maps Appwrite SDK calls to FARMLIVE REST Framework API
 */
import { api, uploadFileHelper } from './api';

export const ID = {
  unique: () => `id-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
};

export const Query = {
  equal: (attr, value) => ({ type: 'equal', attr, value }),
  orderDesc: (attr) => ({ type: 'orderDesc', attr }),
  orderAsc: (attr) => ({ type: 'orderAsc', attr }),
  limit: (limit) => ({ type: 'limit', limit }),
  select: (fields) => ({ type: 'select', fields })
};

export const storage = {
  createFile: async (bucketId, fileId, file) => {
    const dataUrl = await uploadFileHelper(file);
    return { $id: dataUrl || fileId };
  },
  deleteFile: async (bucketId, fileId) => {
    return { success: true };
  },
  getFileView: (bucketId, fileId) => {
    if (!fileId || fileId === 'placeholder') {
      return '/products/Green Valley Farm.png';
    }
    if (typeof fileId === 'string' && (fileId.startsWith('http') || fileId.startsWith('data:'))) {
      return fileId;
    }
    return fileId;
  }
};

export const databases = {
  listDocuments: async (databaseId, collectionId, queries = []) => {
    let endpoint = `/${collectionId}`;
    const params = {};

    queries.forEach((q) => {
      if (q && q.type === 'equal') {
        if (q.attr === 'farms') params.farmId = q.value;
        else if (q.attr === 'userId') params.userId = q.value;
        else if (q.attr === '$id' || q.attr === 'id') params.id = q.value;
      }
    });

    const response = await api.get(endpoint, params);
    const documents = Array.isArray(response) ? response : (response.data || [response]);
    return {
      total: documents.length,
      documents
    };
  },

  getDocument: async (databaseId, collectionId, documentId) => {
    return await api.get(`/${collectionId}/${documentId}`);
  },

  createDocument: async (databaseId, collectionId, documentId, data) => {
    return await api.post(`/${collectionId}`, { ...data, id: documentId });
  },

  updateDocument: async (databaseId, collectionId, documentId, data) => {
    return await api.put(`/${collectionId}/${documentId}`, data);
  },

  deleteDocument: async (databaseId, collectionId, documentId) => {
    return await api.delete(`/${collectionId}/${documentId}`);
  }
};

export const account = {
  get: async () => {
    const saved = localStorage.getItem('farmlive_user');
    if (saved) {
      const user = JSON.parse(saved);
      return user;
    }
    return await api.get('/auth/me');
  },

  create: async (userId, email, password, name) => {
    const res = await api.post('/auth/register', { id: userId, email, password, name });
    if (res.user) {
      localStorage.setItem('farmlive_user', JSON.stringify(res.user));
    }
    return res.user || res;
  },

  createEmailPasswordSession: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.user) {
      localStorage.setItem('farmlive_user', JSON.stringify(res.user));
    }
    return res.user || res;
  },

  deleteSession: async (sessionId) => {
    localStorage.removeItem('farmlive_user');
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored
    }
    return { success: true };
  },

  updateName: async (name) => {
    const saved = localStorage.getItem('farmlive_user');
    if (saved) {
      const user = JSON.parse(saved);
      user.name = name;
      localStorage.setItem('farmlive_user', JSON.stringify(user));
      return user;
    }
    return { name };
  },

  createVerification: async (url) => {
    return await api.post('/auth/resend-verification', { url });
  },

  updateVerification: async (userId, secret) => {
    return await api.post('/auth/verify', { userId, secret });
  },

  createOAuth2Session: async (provider, successUrl, failureUrl) => {
    // Provide a demo OAuth simulated login
    const demoUser = {
      id: `user-google-${Date.now().toString(36)}`,
      $id: `user-google-${Date.now().toString(36)}`,
      name: 'Google FarmLive Member',
      email: 'member@gmail.com',
      emailVerification: true,
      role: 'customer'
    };
    localStorage.setItem('farmlive_user', JSON.stringify(demoUser));
    window.location.href = successUrl || '/';
  }
};

export const client = {
  setEndpoint: () => client,
  setProject: () => client
};
