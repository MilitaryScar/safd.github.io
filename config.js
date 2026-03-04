// GitHub Configuration
const CONFIG = {
    // Update these with your actual GitHub repository details
    GITHUB: {
        OWNER: 'MilitaryScar',     // Your GitHub username
        REPO: 'safd.github.io',   // Your repository name
        BRANCH: 'main',           // or 'main' depending on your default branch
        API_URL: 'https://api.github.com'
    },
    
    // Data file paths in repository
    DATA_FILES: {
        MEMBERS: 'data/members.json',
        VEHICLES: 'data/vehicles.json'
    },
    
    // Authentication (for admin users)
    AUTH: {
        ADMIN_PASSWORD: 'SAFD2024!' // Change this to your desired admin password
    },
    
    // Cache settings
    CACHE: {
        DURATION: 5 * 60 * 1000, // 5 minutes
        KEY_PREFIX: 'safd_cache_'
    }
};

// Helper function to get GitHub API URLs
function getGitHubUrl(path) {
    return `${CONFIG.GITHUB.API_URL}/repos/${CONFIG.GITHUB.OWNER}/${CONFIG.GITHUB.REPO}/${path}`;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
