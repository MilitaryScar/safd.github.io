// GitHub API Integration for SAFD Roster
class GitHubAPI {
    constructor() {
        this.baseUrl = CONFIG.GITHUB.API_URL;
        this.owner = CONFIG.GITHUB.OWNER;
        this.repo = CONFIG.GITHUB.REPO;
        this.branch = CONFIG.GITHUB.BRANCH;
        this.token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, token);
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        
        return headers;
    }

    // Fetch file content from repository
    async getFile(filePath) {
        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${this.branch}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // File doesn't exist, return default structure
                    return this.getDefaultData(filePath);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.content) {
                const content = atob(data.content);
                return JSON.parse(content);
            }
            
            return this.getDefaultData(filePath);
        } catch (error) {
            console.error(`Error fetching file ${filePath}:`, error);
            return this.getDefaultData(filePath);
        }
    }

    // Update file content in repository
    async updateFile(filePath, data, message) {
        if (!this.token) {
            throw new Error('Authentication required. Please set GitHub token.');
        }

        try {
            // Get current file info
            const currentData = await this.getFileRaw(filePath);
            
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}`;
            const content = btoa(JSON.stringify(data, null, 2));
            
            const body = {
                message: message || `Update ${filePath}`,
                content: content,
                branch: this.branch
            };

            // If file exists, include SHA
            if (currentData && currentData.sha) {
                body.sha = currentData.sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating file ${filePath}:`, error);
            throw error;
        }
    }

    // Get raw file data (with SHA)
    async getFileRaw(filePath) {
        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${this.branch}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching raw file ${filePath}:`, error);
            return null;
        }
    }

    // Get default data structure
    getDefaultData(filePath) {
        if (filePath.includes('members')) {
            return {
                lastUpdated: new Date().toISOString(),
                members: []
            };
        } else if (filePath.includes('vehicles')) {
            return {
                lastUpdated: new Date().toISOString(),
                vehicles: []
            };
        }
        return {};
    }

    // Test authentication
    async testAuth() {
        if (!this.token) {
            return false;
        }

        try {
            const url = `${this.baseUrl}/user`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            return response.ok;
        } catch (error) {
            console.error('Authentication test failed:', error);
            return false;
        }
    }

    // Get repository info
    async getRepoInfo() {
        try {
            const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching repository info:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}
