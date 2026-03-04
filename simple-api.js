// Simple API Integration for SAFD Roster
class SimpleAPI {
    constructor() {
        // Using JSONBin.io for free JSON storage
        this.baseUrl = 'https://api.jsonbin.io/v3';
        this.binId = null; // Will be set after first save
        this.accessKey = '$2a$10$vA2zUIB9qTb4.lINMyF76.XVsD/aTnFiDBmNntapBkOHD2fnVT97q'; // Your JSONBin.io API key
        
        // Fallback to localStorage if API fails
        this.useLocalStorage = false;
    }
    
    // Get headers for API requests
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Master-Key': this.accessKey
        };
    }
    
    // Load data from API or localStorage
    async loadData(dataType) {
        // Try API first for real-time sync
        const localKey = `safd_${dataType}`;
        
        // Always try API first if we have a bin ID
        if (this.binId && !this.useLocalStorage) {
            try {
                const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
                    headers: this.getHeaders()
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const data = result.record;
                    
                    // Save to localStorage for caching
                    localStorage.setItem(localKey, JSON.stringify(data[dataType]));
                    
                    console.log(`📥 ${dataType} loaded from API (real-time)`);
                    return data[dataType] || this.getDefaultData(dataType);
                }
            } catch (error) {
                console.log('⚠️ API failed, trying localStorage');
                this.useLocalStorage = true;
            }
        }
        
        // Fallback to localStorage
        const localData = localStorage.getItem(localKey);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                console.log(`📥 ${dataType} loaded from localStorage (cached)`);
                return parsed;
            } catch (e) {
                console.log('⚠️ LocalStorage corrupted, using default');
            }
        }
        
        // Return default data
        return this.getDefaultData(dataType);
    }
    
    // Save data to API and localStorage
    async saveData(dataType, data) {
        const timestamp = new Date().toISOString();
        
        // Always save to localStorage first (instant)
        const localKey = `safd_${dataType}`;
        localStorage.setItem(localKey, JSON.stringify(data));
        
        // Try to save to API if available
        if (!this.useLocalStorage) {
            try {
                let url, method, body;
                
                if (this.binId) {
                    // Update existing bin
                    url = `${this.baseUrl}/b/${this.binId}`;
                    method = 'PUT';
                    body = {
                        [dataType]: data,
                        lastUpdated: timestamp
                    };
                } else {
                    // Create new bin
                    url = `${this.baseUrl}/b`;
                    method = 'POST';
                    body = {
                        [dataType]: data,
                        lastUpdated: timestamp
                    };
                }
                
                const response = await fetch(url, {
                    method: method,
                    headers: this.getHeaders(),
                    body: JSON.stringify(body)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    
                    if (!this.binId) {
                        this.binId = result.metadata.id;
                        console.log(`🆔 New bin created: ${this.binId}`);
                        // Save bin ID for future use
                        localStorage.setItem('safd_bin_id', this.binId);
                    }
                    
                    console.log(`💾 ${dataType} saved to API`);
                    return true;
                } else {
                    throw new Error('API save failed');
                }
            } catch (error) {
                console.log('⚠️ API save failed, using localStorage only');
                this.useLocalStorage = true;
                return true; // Still successful, just using localStorage
            }
        }
        
        console.log(`💾 ${dataType} saved to localStorage`);
        return true;
    }
    
    // Get default data structure
    getDefaultData(dataType) {
        if (dataType === 'members') {
            return {
                lastUpdated: new Date().toISOString(),
                members: []
            };
        } else if (dataType === 'vehicles') {
            return {
                lastUpdated: new Date().toISOString(),
                vehicles: []
            };
        }
        return {};
    }
    
    // Initialize with saved bin ID
    init() {
        const savedBinId = localStorage.getItem('safd_bin_id');
        if (savedBinId) {
            this.binId = savedBinId;
            console.log(`🔄 Using existing bin: ${this.binId}`);
        }
    }
    
    // Load all data at once
    async loadAllData() {
        const [membersData, vehiclesData] = await Promise.all([
            this.loadData('members'),
            this.loadData('vehicles')
        ]);
        
        return {
            members: membersData.members || [],
            vehicles: vehiclesData.vehicles || []
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleAPI;
}
