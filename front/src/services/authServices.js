const API_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'api_user_token';

export const authService = {
    // 1. Register request
    register: async (name, email, password) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },

    // 2. Login request
    login: async (name, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        if (data.success && data.token) {
            localStorage.setItem(TOKEN_KEY, data.token); // save the JWT
        }

        return data
    },

    // 3. Posting an article
    posting: async (title, content, category, published) => {
        const response = await fetch(`${API_URL}/blog`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                        ...authService.getAuthHeader()
            },
            body: JSON.stringify({ title, content, category, published }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Posting failed');
        return data;
    },

    // 4. Helper to Publish or Unpublish Posts
    updatePostStatus: async (postId, published) => {
        const response = await fetch(`${API_URL}/blog/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json',
                        ...authService.getAuthHeader()
            },
            body: JSON.stringify({ published }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unpublishing failed');
        return data;
    },

    //. 5. Helper to edit article
    editArticle: async (postId, title, content, category, published) => {
        const response = await fetch(`${API_URL}/blog/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json',
                        ...authService.getAuthHeader()
            },
            body: JSON.stringify({ title, content, category, published }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Editing failed');
        return data;
    },

    // 5. Delete Post
    deleteArticle: async (postId) => {
        const response = await fetch(`${API_URL}/blog/${postId}`, {
            method: 'DELETE',
            headers: { 
                ...authService.getAuthHeader()
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Deletion failed');
        return data;
    },

    // 6. Posting Comments
    postingComments: async (name, comment, postId) => {
        const response = await fetch(`${API_URL}/blog/${postId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                        ...authService.getAuthHeader()
            },
            body: JSON.stringify({ name, comment, postId }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Posting comment failed');
        return data;
    },

    deleteComments: async (postId, commentId) => {
        const response = await fetch(`${API_URL}/blog/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                ...authService.getAuthHeader()
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Deletion failed');
        return data;
    },

    // 4. Helper method to simplify sending authenticated requests
    getAuthHeader: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        return token ? { 'Authorization': token} : {};
    },

    // 5. Log out
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    // 6. Authenticating an user
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    // 7. Decode token to get Uer metadata
    getCurrentUser: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;

        try {
            // JWT tokens are separated by dots: header.payload.signature
            // Split them and decode the middle part (payload) from Base64
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
            // This will return an object like: { id: "123", name: "YourName", exp: 171829... } 
        } catch (error) {
            console.error('Failed to parse auth token', error);
            return null;
        }
    }
};