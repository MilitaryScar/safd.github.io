// GitHub API Integration for SAFD Roster - Simplified Version
class GitHubAPI {
    constructor() {
        this.baseUrl = CONFIG.GITHUB.API_URL;
        this.owner = CONFIG.GITHUB.OWNER;
        this.repo = CONFIG.GITHUB.REPO;
        this.branch = CONFIG.GITHUB.BRANCH;
    }

    // Get authentication headers (public access only)
    getHeaders() {
        return {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
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

    // Save data to localStorage (simplified approach)
    async saveData(dataType, data) {
        try {
            const storageKey = dataType === 'members' ? 'safd_members' : 'safd_vehicles';
            const dataWithTimestamp = {
                ...data,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
            console.log(`💾 ${dataType} saved to localStorage`);
            return true;
        } catch (error) {
            console.error(`❌ Error saving ${dataType}:`, error);
            return false;
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

    // Load data from localStorage (simplified approach)
    async loadData(dataType) {
        try {
            const storageKey = dataType === 'members' ? 'safd_members' : 'safd_vehicles';
            const saved = localStorage.getItem(storageKey);
            
            if (saved) {
                const data = JSON.parse(saved);
                console.log(`📥 ${dataType} loaded from localStorage`);
                return data;
            } else {
                // Return default structure
                const defaultData = dataType === 'members' 
                    ? { lastUpdated: new Date().toISOString(), members: [] }
                    : { lastUpdated: new Date().toISOString(), vehicles: [] };
                console.log(`📝 Using default ${dataType} structure`);
                return defaultData;
            }
        } catch (error) {
            console.error(`❌ Error loading ${dataType}:`, error);
            // Return default structure on error
            const defaultData = dataType === 'members' 
                ? { lastUpdated: new Date().toISOString(), members: [] }
                : { lastUpdated: new Date().toISOString(), vehicles: [] };
            return defaultData;
        }
    }

}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}
