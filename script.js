// San Andreas Fire Department Roster System
class SAFDRoster {
    constructor() {
        this.members = [];
        this.vehicles = [];
        this.isAuthenticated = false;
        this.adminPassword = 'SAFD2024!';
        this.currentEditId = null;
        this.currentVehicleEditId = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🚀 Initializing SAFD Roster...');
        
        // Setup data
        this.setupData();
        
        // Load members
        this.loadMembers();
        
        // Bind events
        this.bindEvents();
        
        // Initial render
        this.render();
        
        // Hide loading
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 1000);
        
        console.log('✅ SAFD Roster initialized');
    }

    setupData() {
        // Ranks with categories
        this.ranks = [
            { id: 'fire_chief', name: 'Fire Chief', level: 1, icon: '👨‍🚒', category: 'command' },
            { id: 'deputy_chief', name: 'Deputy Chief', level: 2, icon: '👨‍✈️', category: 'command' },
            { id: 'assistant_chief', name: 'Assistant Chief', level: 3, icon: '⭐', category: 'command' },
            { id: 'battalion_chief', name: 'Battalion Chief', level: 4, icon: '🔥', category: 'command' },
            { id: 'captain', name: 'Captain', level: 5, icon: '⭐', category: 'leadership' },
            { id: 'lieutenant', name: 'Lieutenant', level: 6, icon: '🎖️', category: 'leadership' },
            { id: 'firefighter_paramedic', name: 'Firefighter/Paramedic', level: 7, icon: '🚑', category: 'operations' },
            { id: 'firefighter_engineer', name: 'Firefighter/Engineer', level: 7, icon: '🔧', category: 'operations' },
            { id: 'firefighter', name: 'Firefighter', level: 8, icon: '👨‍🚒', category: 'operations' },
            { id: 'reserve_firefighter', name: 'Reserve Firefighter', level: 9, icon: '🤝', category: 'operations' },
            { id: 'volunteer_firefighter', name: 'Volunteer Firefighter', level: 10, icon: '🙏', category: 'support' },
            { id: 'probationary_firefighter', name: 'Probationary Firefighter', level: 11, icon: '🆕', category: 'support' },
            { id: 'cadet', name: 'Cadet', level: 12, icon: '🎓', category: 'support' }
        ];

        // Vehicle types
        this.vehicleTypes = {
            engine: { name: 'Engine', icon: '🚒', description: 'Fire suppression apparatus' },
            truck: { name: 'Truck', icon: '🚛', description: 'Aerial and rescue apparatus' },
            medic: { name: 'Medic Unit', icon: '🚑', description: 'Emergency medical services' },
            command: { name: 'Command Vehicle', icon: '🚙', description: 'Incident command and supervision' },
            support: { name: 'Support Vehicle', icon: '🚐', description: 'Special operations and logistics' }
        };

        // Rank categories
        this.rankCategories = {
            command: {
                name: 'Command Staff',
                description: 'Department Leadership',
                icon: '🏛️',
                color: '#ffd700',
                order: 1
            },
            leadership: {
                name: 'Leadership',
                description: 'Station and Company Officers',
                icon: '👑',
                color: '#ff9800',
                order: 2
            },
            operations: {
                name: 'Operations',
                description: 'Active Firefighting Personnel',
                icon: '🚒',
                color: '#4caf50',
                order: 3
            },
            support: {
                name: 'Support & Development',
                description: 'Reserve, Volunteer, and Training Personnel',
                icon: '🤝',
                color: '#2196f3',
                order: 4
            }
        };

        // Stations
        this.stations = [
            { id: 'redwood_station', name: 'Redwood Fire Station', location: 'Redwood, San Andreas' }
        ];

        // Populate dropdowns
        this.populateDropdowns();
        this.populateVehicleDropdowns();
    }

    populateDropdowns() {
        // Rank dropdowns
        const rankSelect = document.getElementById('rank');
        const rankFilter = document.getElementById('rank-filter');
        
        if (rankSelect) {
            rankSelect.innerHTML = '<option value="">Select Rank</option>' +
                this.ranks.map(rank => `<option value="${rank.id}">${rank.icon} ${rank.name}</option>`).join('');
        }
        
        if (rankFilter) {
            rankFilter.innerHTML = '<option value="">All Ranks</option>' +
                this.ranks.map(rank => `<option value="${rank.id}">${rank.name}</option>`).join('');
        }

        // Station dropdown
        const stationSelect = document.getElementById('station');
        if (stationSelect) {
            stationSelect.innerHTML = '<option value="">Select Station</option>' +
                this.stations.map(station => `<option value="${station.id}">${station.name}</option>`).join('');
        }
    }

    populateVehicleDropdowns() {
        // Vehicle type dropdown
        const vehicleTypeSelect = document.getElementById('vehicle-type');
        if (vehicleTypeSelect) {
            vehicleTypeSelect.innerHTML = '<option value="">Select Type</option>' +
                Object.entries(this.vehicleTypes).map(([id, type]) => 
                    `<option value="${id}">${type.icon} ${type.name}</option>`
                ).join('');
        }

        // Populate rank checkboxes for vehicle permissions
        this.populateRankCheckboxes();
    }

    populateRankCheckboxes() {
        const container = document.getElementById('vehicle-ranks-container');
        if (!container) return;

        container.innerHTML = this.ranks.map(rank => `
            <div class="rank-checkbox">
                <input type="checkbox" id="rank-${rank.id}" value="${rank.id}">
                <label for="rank-${rank.id}">
                    ${rank.icon} ${rank.name}
                </label>
            </div>
        `).join('');
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Search and filters
        document.getElementById('search')?.addEventListener('input', () => this.render());
        document.getElementById('rank-filter')?.addEventListener('change', () => this.render());
        document.getElementById('status-filter')?.addEventListener('change', () => this.render());

        // Vehicle search
        document.getElementById('vehicle-search')?.addEventListener('input', () => this.renderVehicles());

        // Actions
        document.getElementById('add-member')?.addEventListener('click', () => {
            this.requireAuth(() => this.openModal());
        });

        document.getElementById('export')?.addEventListener('click', () => this.exportData());

        // Vehicle actions
        document.getElementById('add-vehicle')?.addEventListener('click', () => {
            this.requireAuth(() => this.openVehicleModal());
        });

        document.getElementById('export-vehicles')?.addEventListener('click', () => this.exportVehicles());

        // Modal events
        document.getElementById('close-modal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancel')?.addEventListener('click', () => this.closeModal());
        document.getElementById('member-form')?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Vehicle modal events
        document.getElementById('close-vehicle-modal')?.addEventListener('click', () => this.closeVehicleModal());
        document.getElementById('vehicle-cancel')?.addEventListener('click', () => this.closeVehicleModal());
        document.getElementById('vehicle-form')?.addEventListener('submit', (e) => this.handleVehicleSubmit(e));

        // Auth events
        document.getElementById('auth-btn')?.addEventListener('click', () => this.toggleAuth());
        document.getElementById('close-auth')?.addEventListener('click', () => this.closeAuthModal());
        document.getElementById('auth-cancel')?.addEventListener('click', () => this.closeAuthModal());
        document.getElementById('auth-submit')?.addEventListener('click', () => this.authenticate());

        // Close modals on outside click
        document.getElementById('member-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'member-modal') this.closeModal();
        });

        document.getElementById('vehicle-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'vehicle-modal') this.closeVehicleModal();
        });
        
        document.getElementById('auth-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') this.closeAuthModal();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });

        // Load content if needed
        if (tabName === 'sop') {
            this.loadSOP();
        } else if (tabName === 'vehicles') {
            this.renderVehicles();
        }
    }

    render() {
        const rosterGrid = document.getElementById('roster-grid');
        if (!rosterGrid) return;

        const filteredMembers = this.getFilteredMembers();
        
        // Update stats
        this.updateStats();

        if (filteredMembers.length === 0) {
            rosterGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-fire-extinguisher"></i>
                    <h3>No Members Found</h3>
                    <p>No members match your current filters.</p>
                    <button class="btn primary" onclick="roster.requireAuth(() => roster.openModal())">
                        <i class="fas fa-plus"></i> Add First Member
                    </button>
                </div>
            `;
            return;
        }

        // Group members by category
        const groupedMembers = this.groupMembersByCategory(filteredMembers);
        
        // Render categories
        rosterGrid.innerHTML = this.renderCategories(groupedMembers);
    }

    groupMembersByCategory(members) {
        const grouped = {};
        
        // Initialize categories
        Object.keys(this.rankCategories).forEach(category => {
            grouped[category] = [];
        });
        
        // Sort members by rank level, then by name
        const sortedMembers = members.sort((a, b) => {
            const rankA = this.ranks.find(r => r.id === a.rank);
            const rankB = this.ranks.find(r => r.id === b.rank);
            
            if (!rankA || !rankB) return a.name?.localeCompare(b.name || '');
            
            if (rankA.level !== rankB.level) {
                return rankA.level - rankB.level;
            }
            
            return a.name?.localeCompare(b.name || '');
        });
        
        // Group into categories
        sortedMembers.forEach(member => {
            const rank = this.ranks.find(r => r.id === member.rank);
            if (rank && grouped[rank.category]) {
                grouped[rank.category].push(member);
            }
        });
        
        return grouped;
    }

    renderCategories(groupedMembers) {
        let html = '';
        
        // Sort categories by order
        const sortedCategories = Object.keys(this.rankCategories)
            .sort((a, b) => this.rankCategories[a].order - this.rankCategories[b].order);
        
        sortedCategories.forEach(category => {
            const members = groupedMembers[category];
            const categoryInfo = this.rankCategories[category];
            
            if (members && members.length > 0) {
                html += this.createCategorySection(categoryInfo, members);
            }
        });
        
        return html;
    }

    createCategorySection(categoryInfo, members) {
        const isReadOnly = !this.isAuthenticated;
        
        const membersHtml = members.map(member => this.createMemberCard(member)).join('');
        
        return `
            <div class="category-section">
                <div class="category-header" style="border-color: ${categoryInfo.color};">
                    <div class="category-info">
                        <div class="category-icon" style="color: ${categoryInfo.color};">
                            ${categoryInfo.icon}
                        </div>
                        <div class="category-details">
                            <h2 style="color: ${categoryInfo.color};">${categoryInfo.name}</h2>
                            <p>${categoryInfo.description}</p>
                            <span class="category-count">${members.length} member${members.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div class="category-divider" style="background: linear-gradient(90deg, ${categoryInfo.color} 0%, transparent 100%);"></div>
                </div>
                <div class="category-members">
                    ${membersHtml}
                </div>
            </div>
        `;
    }

    createMemberCard(member) {
        const rank = this.ranks.find(r => r.id === member.rank);
        const station = this.stations.find(s => s.id === member.station);
        const isReadOnly = !this.isAuthenticated;

        return `
            <div class="member-card ${isReadOnly ? 'read-only' : ''}">
                <div class="member-header">
                    <h3>${this.escapeHtml(member.name)}</h3>
                    <div class="member-info">
                        <span class="badge badge-number">${this.escapeHtml(member.badge)}</span>
                        <span class="badge badge-rank">${rank ? `${rank.icon} ${rank.name}` : 'Unknown'}</span>
                        <span class="badge badge-status">${member.status}</span>
                    </div>
                </div>
                <div class="member-details">
                    <div class="detail-item">
                        <i class="fas fa-home"></i>
                        <span>${station ? station.name : 'Unknown Station'}</span>
                    </div>
                    ${member.phone ? `
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${this.escapeHtml(member.phone)}</span>
                    </div>
                    ` : ''}
                    ${member.email ? `
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${this.escapeHtml(member.email)}</span>
                    </div>
                    ` : ''}
                    ${member.joinDate ? `
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Joined: ${new Date(member.joinDate).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                    ${member.specializations ? `
                    <div class="detail-item">
                        <i class="fas fa-star"></i>
                        <span>${this.escapeHtml(member.specializations)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="member-actions">
                    <button onclick="roster.requireAuth(() => roster.openModal('${member.id}'))" ${isReadOnly ? 'disabled' : ''}>
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="roster.requireAuth(() => roster.deleteMember('${member.id}'))" ${isReadOnly ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    getFilteredMembers() {
        const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
        const rankFilter = document.getElementById('rank-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';

        return this.members.filter(member => {
            const matchesSearch = !searchTerm || 
                member.name?.toLowerCase().includes(searchTerm) ||
                member.badge?.toLowerCase().includes(searchTerm) ||
                member.specializations?.toLowerCase().includes(searchTerm);

            const matchesRank = !rankFilter || member.rank === rankFilter;
            const matchesStatus = !statusFilter || member.status === statusFilter;

            return matchesSearch && matchesRank && matchesStatus;
        });
    }

    updateStats() {
        const totalElement = document.getElementById('total-members');
        const activeElement = document.getElementById('active-members');

        if (totalElement) {
            totalElement.textContent = this.members.length;
        }

        if (activeElement) {
            const activeCount = this.members.filter(m => m.status === 'active').length;
            activeElement.textContent = activeCount;
        }
    }

    openModal(memberId = null) {
        const modal = document.getElementById('member-modal');
        const form = document.getElementById('member-form');
        const title = document.getElementById('modal-title');

        this.currentEditId = memberId;

        if (memberId) {
            const member = this.members.find(m => m.id === memberId);
            if (member) {
                title.textContent = 'Edit Member';
                this.populateForm(member);
            }
        } else {
            title.textContent = 'Add Member';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('member-modal');
        modal.classList.remove('active');
        this.currentEditId = null;
    }

    populateForm(member) {
        const form = document.getElementById('member-form');
        Object.keys(member).forEach(key => {
            const input = form.querySelector(`#${key}`);
            if (input) {
                input.value = member[key] || '';
            }
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            badge: document.getElementById('badge').value,
            rank: document.getElementById('rank').value,
            station: document.getElementById('station').value,
            status: document.getElementById('status').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            specializations: document.getElementById('specializations').value,
            joinDate: document.getElementById('join-date').value
        };

        // Validate
        if (!formData.name || !formData.badge || !formData.rank || !formData.station || !formData.status) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (this.currentEditId) {
            this.updateMember(this.currentEditId, formData);
        } else {
            this.addMember(formData);
        }

        this.closeModal();
    }

    addMember(data) {
        // Check for duplicate badge
        if (this.members.some(m => m.badge === data.badge)) {
            this.showToast('A member with this badge number already exists', 'error');
            return;
        }

        const member = {
            ...data,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };

        this.members.push(member);
        this.saveMembers();
        this.render();
        this.showToast('Member added successfully', 'success');
    }

    updateMember(memberId, data) {
        const index = this.members.findIndex(m => m.id === memberId);
        if (index === -1) return;

        this.members[index] = {
            ...this.members[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        this.saveMembers();
        this.render();
        this.showToast('Member updated successfully', 'success');
    }

    deleteMember(memberId) {
        if (!confirm('Are you sure you want to delete this member?')) return;

        this.members = this.members.filter(m => m.id !== memberId);
        this.saveMembers();
        this.render();
        this.showToast('Member deleted successfully', 'success');
    }

    exportData() {
        try {
            const dataStr = JSON.stringify(this.members, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `safd_roster_${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);
            this.showToast('Roster exported successfully', 'success');
        } catch (error) {
            this.showToast('Error exporting roster', 'error');
        }
    }

    loadSOP() {
        const sopContent = document.getElementById('sop-content');
        if (!sopContent) return;

        // Simulate loading
        sopContent.innerHTML = `
            <div class="sop-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading SOP document...</p>
            </div>
        `;

        setTimeout(() => {
            sopContent.innerHTML = `
                <div class="sop-document">
                    <div class="sop-header">
                        <h1><i class="fas fa-shield-alt"></i> San Andreas Fire Department</h1>
                        <h2>Standard Operating Procedures</h2>
                        <p class="sop-version">Version 1.0 | Effective March 2026</p>
                    </div>

                    <div class="sop-toc">
                        <h3><i class="fas fa-list"></i> Table of Contents</h3>
                        <ul>
                            <li><a href="#chapter1">Chapter 1: General Policies</a></li>
                            <li><a href="#chapter2">Chapter 2: Personnel Management</a></li>
                            <li><a href="#chapter3">Chapter 3: Operations</a></li>
                            <li><a href="#chapter4">Chapter 4: Emergency Medical Services</a></li>
                            <li><a href="#chapter5">Chapter 5: Safety & Training</a></li>
                            <li><a href="#chapter6">Chapter 6: Communications</a></li>
                            <li><a href="#chapter7">Chapter 7: Vehicle Operations</a></li>
                            <li><a href="#appendix">Appendix: Forms & Procedures</a></li>
                        </ul>
                    </div>

                    <div class="sop-section" id="chapter1">
                        <h3><i class="fas fa-flag"></i> Chapter 1: General Policies</h3>
                        
                        <div class="sop-subsection">
                            <h4>1.1 Department Mission & Vision</h4>
                            <p>The San Andreas Fire Department is dedicated to preserving life, property, and the environment through professional fire protection, emergency medical services, and disaster response. We serve the community with courage, honor, and service.</p>
                            
                            <h4>1.2 Core Values</h4>
                            <div class="values-grid">
                                <div class="value-item">
                                    <i class="fas fa-fire"></i>
                                    <strong>Courage</strong>
                                    <p>Face danger with bravery and determination</p>
                                </div>
                                <div class="value-item">
                                    <i class="fas fa-shield-alt"></i>
                                    <strong>Honor</strong>
                                    <p>Maintain integrity and ethical conduct</p>
                                </div>
                                <div class="value-item">
                                    <i class="fas fa-hands-helping"></i>
                                    <strong>Service</strong>
                                    <p>Commit to excellence in community service</p>
                                </div>
                                <div class="value-item">
                                    <i class="fas fa-graduation-cap"></i>
                                    <strong>Professionalism</strong>
                                    <p>Uphold the highest standards</p>
                                </div>
                            </div>
                        </div>

                        <div class="sop-subsection">
                            <h4>1.3 Chain of Command</h4>
                            <p>All personnel shall follow the established chain of command for communications and operations:</p>
                            <ol>
                                <li><strong>Fire Chief</strong> - Ultimate authority and department leadership</li>
                                <li><strong>Deputy Chiefs</strong> - Division command and specialized operations</li>
                                <li><strong>Battalion Chiefs</strong> - Battalion-level operations and supervision</li>
                                <li><strong>Captains</strong> - Company command and station management</li>
                                <li><strong>Lieutenants</strong> - Company operations and crew leadership</li>
                            </ol>
                        </div>

                        <div class="sop-subsection">
                            <h4>1.4 Code of Conduct</h4>
                            <ul>
                                <li>Maintain professional appearance and demeanor at all times</li>
                                <li>Treat all citizens with respect and dignity</li>
                                <li>Uphold department values and reputation</li>
                                <li>Report any violations or misconduct immediately</li>
                                <li>Adhere to all local, state, and federal laws</li>
                            </ul>
                        </div>
                    </div>

                    <div class="sop-section" id="chapter2">
                        <h3><i class="fas fa-users"></i> Chapter 2: Personnel Management</h3>
                        
                        <div class="sop-subsection">
                            <h4>2.1 Rank Structure & Responsibilities</h4>
                            <div class="rank-structure">
                                <div class="rank-category">
                                    <h5>Command Staff</h5>
                                    <ul>
                                        <li><strong>Fire Chief:</strong> Department administration, budget, policy</li>
                                        <li><strong>Deputy Chief:</strong> Operations, training, special teams</li>
                                        <li><strong>Battalion Chief:</strong> Battalion oversight, incident command</li>
                                    </ul>
                                </div>
                                <div class="rank-category">
                                    <h5>Company Officers</h5>
                                    <ul>
                                        <li><strong>Captain:</strong> Station management, company command</li>
                                        <li><strong>Lieutenant:</strong> Crew leadership, tactical operations</li>
                                    </ul>
                                </div>
                                <div class="rank-category">
                                    <h5>Operations Personnel</h5>
                                    <ul>
                                        <li><strong>Firefighter/Paramedic:</strong> Fire suppression, medical care</li>
                                        <li><strong>Firefighter/Engineer:</strong> Apparatus operation, maintenance</li>
                                        <li><strong>Firefighter:</strong> Fire suppression, rescue operations</li>
                                        <li><strong>Reserve Firefighter:</strong> Support, backup operations</li>
                                    </ul>
                                </div>
                                <div class="rank-category">
                                    <h5>Support Personnel</h5>
                                    <ul>
                                        <li><strong>Volunteer Firefighter:</strong> Community support, assistance</li>
                                        <li><strong>Probationary Firefighter:</strong> Training, evaluation</li>
                                        <li><strong>Cadet:</strong> Youth program, training development</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="sop-subsection">
                            <h4>2.2 Training Requirements</h4>
                            <div class="training-grid">
                                <div class="training-item">
                                    <i class="fas fa-graduation-cap"></i>
                                    <strong>Initial Training</strong>
                                    <ul>
                                        <li>Firefighter I & II certification</li>
                                        <li>Hazardous Materials Operations</li>
                                        <li>Emergency Medical Technician</li>
                                        <li>Driver/Operator certification</li>
                                    </ul>
                                </div>
                                <div class="training-item">
                                    <i class="fas fa-sync-alt"></i>
                                    <strong>Ongoing Training</strong>
                                    <ul>
                                        <li>Monthly department drills</li>
                                        <li>Quarterly live fire exercises</li>
                                        <li>Annual physical fitness test</li>
                                        <li>Bi-annual weapons qualification</li>
                                    </ul>
                                </div>
                                <div class="training-item">
                                    <i class="fas fa-book"></i>
                                    <strong>Specialized Training</strong>
                                    <ul>
                                        <li>Technical Rescue certification</li>
                                        <li>Wildland firefighting</li>
                                        <li>Water rescue operations</li>
                                        <li>Incident Command System</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="sop-subsection">
                            <h4>2.3 Duty Assignments</h4>
                            <p>Redwood Fire Station maintains 24/7 coverage with the following assignments:</p>
                            <ul>
                                <li><strong>Engine Company:</strong> Fire suppression, water supply</li>
                                <li><strong>Truck Company:</strong> Rescue, ventilation, forcible entry</li>
                                <li><strong>Medic Unit:</strong> Emergency medical services, transport</li>
                                <li><strong>Battalion Chief:</strong> Incident command, oversight</li>
                            </ul>
                        </div>
                    </div>

                    <div class="sop-section" id="chapter3">
                        <h3><i class="fas fa-truck"></i> Chapter 3: Operations</h3>
                        
                        <div class="sop-subsection">
                            <h4>3.1 Emergency Response Protocol</h4>
                            <div class="response-flow">
                                <div class="flow-step">
                                    <span class="step-number">1</span>
                                    <strong>Dispatch Notification</strong>
                                    <p>Receive call, verify location, determine response level</p>
                                </div>
                                <div class="flow-step">
                                    <span class="step-number">2</span>
                                    <strong>Unit Response</strong>
                                    <p>Apparatus response, en route procedures, scene size-up</p>
                                </div>
                                <div class="flow-step">
                                    <span class="step-number">3</span>
                                    <strong>Scene Assessment</strong>
                                    <p>360° size-up, hazard identification, resource needs</p>
                                </div>
                                <div class="flow-step">
                                    <span class="step-number">4</span>
                                    <strong>Incident Command</strong>
                                    <p>Establish command, implement ICS, assign sectors</p>
                                </div>
                                <div class="flow-step">
                                    <span class="step-number">5</span>
                                    <strong>Tactical Operations</strong>
                                    <p>Execute strategy, maintain accountability, ensure safety</p>
                                </div>
                                <div class="flow-step">
                                    <span class="step-number">6</span>
                                    <strong>Scene Termination</strong>
                                    <p>Overhaul, investigation, report completion, return to service</p>
                                </div>
                            </div>
                        </div>

                        <div class="sop-subsection">
                            <h4>3.2 Fire Suppression Operations</h4>
                            <ul>
                                <li><strong>Initial Attack:</strong> Rapid deployment, aggressive interior attack when safe</li>
                                <li><strong>Water Supply:</strong> Establish reliable water source, maintain pressure</li>
                                <li><strong>Ventilation:</strong> Coordinate vertical/horizontal ventilation with fire attack</li>
                                <li><strong>Search & Rescue:</strong> Primary search before fire attack, secondary after</li>
                                <li><strong>Overhaul:</strong> Complete extinguishment, check for hot spots</li>
                            </ul>
                        </div>

                        <div class="sop-subsection">
                            <h4>3.3 Station Operations</h4>
                            <p>Daily station operations include:</p>
                            <ul>
                                <li><strong>Duty Crew:</strong> 24-hour shifts, 08:00-08:00</li>
                                <li><strong>Apparatus Checks:</strong> Daily equipment inspection and maintenance</li>
                                <li><strong>Station Duties:</strong> Facility maintenance, training, public education</li>
                                <li><strong>Response Readiness:</strong> Maintain 90-second turnout time</li>
                            </ul>
                        </div>
                    </div>

                    <div class="sop-section" id="chapter4">
                        <h3><i class="fas fa-ambulance"></i> Chapter 4: Emergency Medical Services</h3>
                        
                        <div class="sop-subsection">
                            <h4>4.1 EMS Response Levels</h4>
                            <div class="ems-levels">
                                <div class="ems-level">
                                    <strong>Alpha Response</strong>
                                    <p>Basic life support, non-emergency transport</p>
                                </div>
                                <div class="ems-level">
                                    <strong>Bravo Response</strong>
                                    <p>Advanced life support, emergency medical condition</p>
                                </div>
                                <div class="ems-level">
                                    <strong>Charlie Response</strong>
                                    <p>Life-threatening emergency, lights and siren</p>
                                </div>
                                <div class="ems-level">
                                    <strong>Delta Response</strong>
                                    <p>Mass casualty incident, multiple resources</p>
                                </div>
                            </div>
                        </div>

                        <div class="sop-subsection">
                            <h4>4.2 Medical Protocols</h4>
                            <ul>
                                <li>Follow San Andreas County EMS protocols</li>
                                <li>Maintain EMT certification and continuing education</li>
                                <li>Complete patient care reports for all calls</li>
                                <li>Coordinate with receiving hospitals for patient handoff</li>
                            </ul>
                        </div>
                    </div>

                    <div class="sop-section" id="chapter5">
                        <h3><i class="fas fa-hard-hat"></i> Chapter 5: Safety & Training</h3>
                        
                        <div class="sop-subsection">
                            <h4>5.1 Safety Officer Responsibilities</h4>
                            <ul>
                                <li>Monitor all operations for safety hazards</li>
                                <li>Authority to stop unsafe operations</li>
                                <li>Maintain scene safety documentation</li>
                                <li>Conduct post-incident safety reviews</li>
                            </ul>
                        </div>

                        <div class="sop-subsection">
                            <h4>5.2 Personal Protective Equipment</h4>
                            <ul>
                                <li><strong>Structural Firefighting:</strong> Full turnout gear, SCBA</li>
                                <li><strong>Wildland Fire:</strong> Flame-resistant clothing, helmet</li>
                                <li><strong>Medical Calls:</strong> Gloves, eye protection, mask</li>
                                <li><strong>Vehicle Extrication:</strong> Protective gloves, eye protection</li>
                            </ul>
                        </div>
                    </div>

                    <div class="sop-section" id="chapter6">
                        <h3><i class="fas fa-radio"></i> Chapter 6: Communications</h3>
                        
                        <div class="sop-subsection">
                            <h4>6.1 Radio Procedures</h4>
                            <ul>
                                <li>Use clear text, plain language communications</li>
                                <li>Maintain radio discipline during incidents</li>
                                <li>Use tactical channels for fireground operations</li>
                                <li>Follow proper radio etiquette and procedures</li>
                            </ul>
                        </div>

                        <div class="sop-subsection">
                            <h4>6.2 Incident Reporting</h4>
                            <ul>
                                <li>Complete incident reports within 24 hours</li>
                                <li>Document all significant events and actions</li>
                                <li>Include patient care reports for medical calls</li>
                                <li>Submit injury reports for all accidents</li>
                            </ul>
                        </div>
                    </div>

                    <div class="sop-section" id="chapter7">
                        <h3><i class="fas fa-tools"></i> Chapter 7: Vehicle Operations</h3>
                        
                        <div class="sop-subsection">
                            <h4>7.1 Apparatus Operation</h4>
                            <ul>
                                <li>Only certified personnel may operate apparatus</li>
                                <li>Complete daily apparatus checks and documentation</li>
                                <li>Follow all traffic laws during emergency response</li>
                                <li>Maintain due regard for public safety</li>
                            </ul>
                        </div>

                        <div class="sop-subsection">
                            <h4>7.2 Vehicle Maintenance</h4>
                            <ul>
                                <li>Scheduled maintenance per manufacturer guidelines</li>
                                <li>Immediate repair of safety-related issues</li>
                                <li>Maintain maintenance records and documentation</li>
                                <li>Reserve apparatus for major repairs</li>
                            </ul>
                        </div>
                    </div>

                    <div class="sop-section" id="appendix">
                        <h3><i class="fas fa-file-alt"></i> Appendix: Forms & Procedures</h3>
                        
                        <div class="sop-subsection">
                            <h4>A.1 Required Forms</h4>
                            <ul>
                                <li><strong>Incident Report:</strong> NFIRS 1.0 reporting format</li>
                                <li><strong>Patient Care Report:</strong> State EMS PCR format</li>
                                <li><strong>Vehicle Accident Report:</strong> Department accident form</li>
                                <li><strong>Training Record:</strong> Individual training log</li>
                                <li><strong>Equipment Check:</strong> Daily apparatus checklist</li>
                            </ul>
                        </div>

                        <div class="sop-subsection">
                            <h4>A.2 Contact Information</h4>
                            <div class="contact-grid">
                                <div class="contact-item">
                                    <strong>Emergency Dispatch</strong>
                                    <p>911 | Non-emergency: (555) 123-4567</p>
                                </div>
                                <div class="contact-item">
                                    <strong>Fire Chief Office</strong>
                                    <p>(555) 234-5678</p>
                                </div>
                                <div class="contact-item">
                                    <strong>Redwood Station</strong>
                                    <p>(555) 345-6789</p>
                                </div>
                                <div class="contact-item">
                                    <strong>Training Division</strong>
                                    <p>(555) 456-7890</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="sop-footer">
                        <div class="footer-content">
                            <p><strong>Document Information:</strong></p>
                            <ul>
                                <li>Version: SAFD-SOP-v1.0</li>
                                <li>Effective Date: March 2, 2026</li>
                                <li>Next Review: May 1, 2026</li>
                                <li>Approved by: Fire Chief Sam Harlow</li>
                            </ul>
                            <p class="classification"><strong>Classification:</strong> Internal Use Only - Confidential</p>
                            <p class="disclaimer">This document contains confidential operational information. Distribution is limited to SAFD personnel and authorized agencies.</p>
                        </div>
                    </div>
                </div>
            `;
        }, 1000);
    }

    // Vehicle Management Methods
    renderVehicles() {
        const vehiclesGrid = document.getElementById('vehicles-grid');
        if (!vehiclesGrid) return;

        const filteredVehicles = this.getFilteredVehicles();

        if (filteredVehicles.length === 0) {
            vehiclesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-truck"></i>
                    <h3>No Vehicles Found</h3>
                    <p>No vehicles match your current filters.</p>
                    <button class="btn primary" onclick="roster.requireAuth(() => roster.openVehicleModal())">
                        <i class="fas fa-plus"></i> Add First Vehicle
                    </button>
                </div>
            `;
            return;
        }

        vehiclesGrid.innerHTML = filteredVehicles.map(vehicle => this.createVehicleCard(vehicle)).join('');
    }

    getFilteredVehicles() {
        const searchTerm = document.getElementById('vehicle-search')?.value.toLowerCase() || '';

        return this.vehicles.filter(vehicle => {
            const matchesSearch = !searchTerm || 
                vehicle.name?.toLowerCase().includes(searchTerm) ||
                vehicle.notes?.toLowerCase().includes(searchTerm);

            return matchesSearch;
        });
    }

    createVehicleCard(vehicle) {
        const type = this.vehicleTypes[vehicle.type];
        const isReadOnly = !this.isAuthenticated;

        const allowedRanks = vehicle.allowedRanks || [];
        const rankNames = allowedRanks.map(rankId => {
            const rank = this.ranks.find(r => r.id === rankId);
            return rank ? `${rank.icon} ${rank.name}` : rankId;
        }).join(', ');

        return `
            <div class="vehicle-card ${isReadOnly ? 'read-only' : ''}">
                <div class="vehicle-header">
                    <div class="vehicle-title">
                        <h3>${this.escapeHtml(vehicle.name)}</h3>
                        <div class="vehicle-info">
                            <span class="badge badge-type">${type ? `${type.icon} ${type.name}` : 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="vehicle-type-icon">
                        ${type ? type.icon : '🚗'}
                    </div>
                </div>
                <div class="vehicle-details">
                    <div class="detail-item">
                        <i class="fas fa-user-shield"></i>
                        <span><strong>Allowed Ranks:</strong> ${rankNames || 'None specified'}</span>
                    </div>
                    ${vehicle.notes ? `
                    <div class="detail-item full">
                        <i class="fas fa-sticky-note"></i>
                        <span>${this.escapeHtml(vehicle.notes)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="vehicle-actions">
                    <button onclick="roster.requireAuth(() => roster.openVehicleModal('${vehicle.id}'))" ${isReadOnly ? 'disabled' : ''}>
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="roster.requireAuth(() => roster.deleteVehicle('${vehicle.id}'))" ${isReadOnly ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    openVehicleModal(vehicleId = null) {
        const modal = document.getElementById('vehicle-modal');
        const form = document.getElementById('vehicle-form');
        const title = document.getElementById('vehicle-modal-title');

        this.currentVehicleEditId = vehicleId;

        if (vehicleId) {
            const vehicle = this.vehicles.find(v => v.id === vehicleId);
            if (vehicle) {
                title.textContent = 'Edit Vehicle';
                this.populateVehicleForm(vehicle);
            }
        } else {
            title.textContent = 'Add Vehicle';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeVehicleModal() {
        const modal = document.getElementById('vehicle-modal');
        modal.classList.remove('active');
        this.currentVehicleEditId = null;
    }

    populateVehicleForm(vehicle) {
        const form = document.getElementById('vehicle-form');
        
        // Populate text and select fields
        Object.keys(vehicle).forEach(key => {
            const input = form.querySelector(`#vehicle-${key}`);
            if (input) {
                input.value = vehicle[key] || '';
            }
        });

        // Populate rank checkboxes
        const allowedRanks = vehicle.allowedRanks || [];
        this.ranks.forEach(rank => {
            const checkbox = form.querySelector(`#rank-${rank.id}`);
            if (checkbox) {
                checkbox.checked = allowedRanks.includes(rank.id);
            }
        });
    }

    handleVehicleSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('vehicle-name').value,
            type: document.getElementById('vehicle-type').value,
            notes: document.getElementById('vehicle-notes').value
        };

        // Get allowed ranks from checkboxes
        const allowedRanks = [];
        this.ranks.forEach(rank => {
            const checkbox = document.querySelector(`#rank-${rank.id}`);
            if (checkbox && checkbox.checked) {
                allowedRanks.push(rank.id);
            }
        });
        formData.allowedRanks = allowedRanks;

        // Validate
        if (!formData.name || !formData.type) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (allowedRanks.length === 0) {
            this.showToast('Please select at least one rank that can use this vehicle', 'error');
            return;
        }

        if (this.currentVehicleEditId) {
            this.updateVehicle(this.currentVehicleEditId, formData);
        } else {
            this.addVehicle(formData);
        }

        this.closeVehicleModal();
    }

    addVehicle(data) {
        const vehicle = {
            ...data,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };

        this.vehicles.push(vehicle);
        this.saveVehicles();
        this.renderVehicles();
        this.showToast('Vehicle added successfully', 'success');
    }

    updateVehicle(vehicleId, data) {
        const index = this.vehicles.findIndex(v => v.id === vehicleId);
        if (index === -1) return;

        this.vehicles[index] = {
            ...this.vehicles[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        this.saveVehicles();
        this.renderVehicles();
        this.showToast('Vehicle updated successfully', 'success');
    }

    deleteVehicle(vehicleId) {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
        this.saveVehicles();
        this.renderVehicles();
        this.showToast('Vehicle deleted successfully', 'success');
    }

    exportVehicles() {
        try {
            const dataStr = JSON.stringify(this.vehicles, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `safd_vehicles_${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);
            this.showToast('Vehicles exported successfully', 'success');
        } catch (error) {
            this.showToast('Error exporting vehicles', 'error');
        }
    }

    // Storage methods for vehicles
    loadVehicles() {
        try {
            const saved = localStorage.getItem('safd_vehicles');
            if (saved) {
                this.vehicles = JSON.parse(saved);
            } else {
                this.vehicles = [];
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
            this.vehicles = [];
        }
    }

    saveVehicles() {
        try {
            localStorage.setItem('safd_vehicles', JSON.stringify(this.vehicles));
        } catch (error) {
            console.error('Error saving vehicles:', error);
            this.showToast('Error saving vehicle data', 'error');
        }
    }

    // Authentication methods
    toggleAuth() {
        if (this.isAuthenticated) {
            this.logout();
        } else {
            this.showAuthModal();
        }
    }

    showAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
        document.getElementById('password')?.focus();
    }

    closeAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
    }

    authenticate() {
        const password = document.getElementById('password')?.value;
        
        if (password === this.adminPassword) {
            this.isAuthenticated = true;
            sessionStorage.setItem('safd_auth', 'true');
            this.updateAuthUI();
            this.closeAuthModal();
            this.showToast('Authentication successful!', 'success');
            this.render();
        } else {
            this.showToast('Invalid password', 'error');
            document.getElementById('password').value = '';
        }
    }

    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('safd_auth');
        this.updateAuthUI();
        this.showToast('Logged out successfully', 'info');
        this.render();
    }

    checkAuth() {
        const auth = sessionStorage.getItem('safd_auth');
        this.isAuthenticated = auth === 'true';
        this.updateAuthUI();
    }

    updateAuthUI() {
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            authBtn.textContent = this.isAuthenticated ? 'Logout' : 'Login';
            authBtn.style.background = this.isAuthenticated ? 
                'rgba(244, 67, 54, 0.2)' : 'rgba(255, 215, 0, 0.2)';
            authBtn.style.borderColor = this.isAuthenticated ? 
                '#f44336' : '#ffd700';
            authBtn.style.color = this.isAuthenticated ? 
                '#f44336' : '#ffd700';
        }
    }

    requireAuth(callback) {
        if (this.isAuthenticated) {
            callback();
        } else {
            this.showAuthModal();
            // Store callback for after authentication
            this.pendingAction = callback;
        }
    }

    executePendingAction() {
        if (this.pendingAction) {
            const action = this.pendingAction;
            this.pendingAction = null;
            action();
        }
    }

    // Storage methods
    loadMembers() {
        try {
            const saved = localStorage.getItem('safd_members');
            if (saved) {
                this.members = JSON.parse(saved);
            } else {
                this.members = [];
            }
        } catch (error) {
            console.error('Error loading members:', error);
            this.members = [];
        }
        
        this.loadVehicles();
        this.checkAuth();
    }

    saveMembers() {
        try {
            localStorage.setItem('safd_members', JSON.stringify(this.members));
        } catch (error) {
            console.error('Error saving members:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.roster = new SAFDRoster();
});
