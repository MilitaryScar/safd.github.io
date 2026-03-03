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
                        <p class="sop-version">Official Department Manual</p>
                    </div>

                    <div class="sop-toc">
                        <h3><i class="fas fa-list"></i> Table of Contents</h3>
                        <ul>
                            <li><a href="#department-overview">Department Overview</a></li>
                            <li><a href="#department-mission">Department Mission</a></li>
                            <li><a href="#command-staff">Command Staff Authority</a></li>
                            <li><a href="#chain-of-command">Chain of Command</a></li>
                            <li><a href="#duties-responsibilities">Duties and Responsibilities</a></li>
                            <li><a href="#emergency-operations">Emergency Response Operations</a></li>
                            <li><a href="#vehicle-operations">Emergency Vehicle Operation and Speed Guidelines</a></li>
                            <li><a href="#training-division">Training Division</a></li>
                            <li><a href="#activity-expectations">Activity and Service Expectations</a></li>
                            <li><a href="#conduct-standards">Conduct and Professional Standards</a></li>
                            <li><a href="#interagency-cooperation">Interagency Cooperation</a></li>
                            <li><a href="#closing-statement">Closing Statement</a></li>
                        </ul>
                    </div>

                    <div class="sop-section" id="department-overview">
                        <h3><i class="fas fa-building"></i> Department Overview</h3>
                        
                        <div class="sop-subsection">
                            <p>The San Andreas Fire Department is responsible for providing fire suppression, emergency medical services, rescue operations, disaster response, and public safety services throughout the state of San Andreas.</p>
                            
                            <p>Personnel assigned to the department are expected to operate with professionalism, integrity, and dedication to the safety of the public. Members of the department shall work together to ensure effective emergency response and protection of life and property.</p>
                            
                            <p>The department operates under an organized command structure to ensure incidents are managed efficiently and safely.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="department-mission">
                        <h3><i class="fas fa-flag"></i> Department Mission</h3>
                        
                        <div class="sop-subsection">
                            <p>The mission of the San Andreas Fire Department is to protect life, property, and the environment through rapid response, effective emergency operations, and professional public service.</p>
                            
                            <p>Personnel shall respond to emergencies, provide medical aid, control hazardous situations, and support the community whenever assistance is required.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="command-staff">
                        <h3><i class="fas fa-users-cog"></i> Command Staff Authority</h3>
                        
                        <div class="sop-subsection">
                            <p>Within the San Andreas Fire Department, the positions of Fire Chief, Deputy Chief, and Assistant Chief serve as the primary leadership of the department. These command staff members are responsible for the direction, oversight, and operational integrity of all department activities across San Andreas.</p>
                            
                            <p>The Fire Chief maintains overall authority of the department and establishes departmental policy, operational standards, and long-term planning for emergency services within the state. The Fire Chief has final decision-making authority during departmental matters and large-scale incidents.</p>
                            
                            <p>The Deputy Chief oversees major operational functions of the department and assists the Fire Chief in ensuring all divisions operate effectively. The Deputy Chief may assume departmental command when required and plays a key role in large-scale emergency management.</p>
                            
                            <p>The Assistant Chief is responsible for supporting operational command, assisting with field coordination, and ensuring department policies and procedures are properly carried out during daily operations.</p>
                            
                            <p>Command staff are expected to provide leadership, maintain operational readiness, and ensure the department remains capable of responding to emergencies across the state.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="chain-of-command">
                        <h3><i class="fas fa-sitemap"></i> Chain of Command</h3>
                        
                        <div class="sop-subsection">
                            <p>The San Andreas Fire Department operates under the following rank structure:</p>
                            
                            <div class="rank-structure">
                                <div class="rank-category">
                                    <h5>Command Staff</h5>
                                    <ul>
                                        <li><strong>Fire Chief</strong></li>
                                        <li><strong>Deputy Chief</strong></li>
                                        <li><strong>Assistant Chief</strong></li>
                                        <li><strong>Battalion Chief</strong></li>
                                    </ul>
                                </div>
                                <div class="rank-category">
                                    <h5>Company Officers</h5>
                                    <ul>
                                        <li><strong>Captain</strong></li>
                                        <li><strong>Lieutenant</strong></li>
                                    </ul>
                                </div>
                                <div class="rank-category">
                                    <h5>Operations Personnel</h5>
                                    <ul>
                                        <li><strong>Firefighter/Paramedic</strong></li>
                                        <li><strong>Firefighter/Engineer</strong></li>
                                        <li><strong>Firefighter</strong></li>
                                        <li><strong>Reserve Firefighter</strong></li>
                                    </ul>
                                </div>
                                <div class="rank-category">
                                    <h5>Support Personnel</h5>
                                    <ul>
                                        <li><strong>Volunteer Firefighter</strong></li>
                                        <li><strong>Probationary Firefighter</strong></li>
                                        <li><strong>Cadet</strong></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <p>Personnel shall follow lawful orders issued by superior officers during incidents, training, and departmental operations. The chain of command ensures clear leadership and efficient management during emergency responses.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="duties-responsibilities">
                        <h3><i class="fas fa-clipboard-list"></i> Duties and Responsibilities</h3>
                        
                        <div class="sop-subsection">
                            <p>All members of the San Andreas Fire Department are responsible for maintaining readiness and professionalism while performing their duties.</p>
                            
                            <p>Personnel shall maintain preparedness for emergency response, operate department equipment safely, follow established procedures, and uphold the standards of the department while representing SAFD.</p>
                            
                            <p>Officers are responsible for supervising personnel, managing incident scenes, and ensuring that emergency operations are carried out safely and effectively.</p>
                            
                            <p>Command staff oversee department operations, major incidents, and ensure the department continues to operate efficiently throughout the state.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="emergency-operations">
                        <h3><i class="fas fa-truck"></i> Emergency Response Operations</h3>
                        
                        <div class="sop-subsection">
                            <p>The San Andreas Fire Department responds to a wide range of emergency incidents across the state.</p>
                            
                            <p>These incidents may include structure fires, vehicle fires, medical emergencies, rescues, hazardous situations, and large-scale disasters.</p>
                            
                            <p>Structure fires may involve multiple responding units including engine companies, rescue units, and command staff when available. Incident command may be established to organize the scene and maintain firefighter safety.</p>
                            
                            <p>Medical incidents involve patient assessment, treatment, and transport when necessary.</p>
                            
                            <p>Major incidents such as aircraft crashes, explosions, large fires, or major emergencies may require coordination between multiple responding units and agencies.</p>
                            
                            <p>Command officers may establish command and coordinate operations to ensure the incident is handled safely and effectively.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="vehicle-operations">
                        <h3><i class="fas fa-car"></i> Emergency Vehicle Operation and Speed Guidelines</h3>
                        
                        <div class="sop-subsection">
                            <p>Members of the San Andreas Fire Department shall operate all emergency vehicles with caution, professionalism, and awareness of public safety while responding to incidents throughout the state.</p>
                            
                            <p>Personnel operating command vehicles or apparatus authorized by a Lieutenant or higher ranking officer shall not exceed ninety miles per hour while traveling on highways or major roadways.</p>
                            
                            <p>When operating on standard city streets and normal roadways, emergency vehicles shall not exceed seventy miles per hour during response.</p>
                            
                            <p>On narrow roads, rural routes, dirt roads, or areas where visibility and maneuverability are limited, emergency vehicles shall maintain speeds no greater than forty miles per hour.</p>
                            
                            <p>Personnel shall slow appropriately when approaching intersections, traffic congestion, or populated areas. Emergency lights and sirens provide the right of way but do not guarantee it. Drivers must ensure intersections are clear before proceeding.</p>
                            
                            <p>These guidelines are in place to ensure the safety of department personnel and the public while responding to emergencies.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="training-division">
                        <h3><i class="fas fa-graduation-cap"></i> Training Division</h3>
                        
                        <div class="sop-subsection">
                            <p>The San Andreas Fire Department maintains training programs to ensure all personnel remain prepared for emergency response operations.</p>
                            
                            <p>New members entering the department may be assigned probationary status while learning department procedures, equipment operation, and emergency response techniques.</p>
                            
                            <p>Cadets and probationary firefighters may participate in training exercises and assist under supervision while developing the skills necessary to operate as full members of the department.</p>
                            
                            <p>Training may include fire suppression, rescue operations, medical response, and coordinated incidents with other agencies.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="activity-expectations">
                        <h3><i class="fas fa-calendar-check"></i> Activity and Service Expectations</h3>
                        
                        <div class="sop-subsection">
                            <p>Personnel assigned to the San Andreas Fire Department are expected to maintain availability for emergency response duties.</p>
                            
                            <p>Members who are unable to perform duties for extended periods should notify command staff when possible. Department leadership may review assignments to ensure adequate staffing and operational readiness across the state.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="conduct-standards">
                        <h3><i class="fas fa-gavel"></i> Conduct and Professional Standards</h3>
                        
                        <div class="sop-subsection">
                            <p>Members of the San Andreas Fire Department shall maintain professional conduct while representing the department.</p>
                            
                            <p>Failure to follow department procedures, misconduct, or actions that negatively impact department operations may result in disciplinary action.</p>
                            
                            <p>Command staff may issue counseling, warnings, suspension, or removal from the department depending on the severity of the situation.</p>
                            
                            <p>These standards are in place to maintain the integrity and effectiveness of the department.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="interagency-cooperation">
                        <h3><i class="fas fa-handshake"></i> Interagency Cooperation</h3>
                        
                        <div class="sop-subsection">
                            <p>The San Andreas Fire Department works alongside other emergency services operating within the state.</p>
                            
                            <p>During major incidents, the department may coordinate with law enforcement, medical services, and other response agencies to ensure effective incident management and public safety.</p>
                            
                            <p>Clear communication and cooperation between agencies is expected during joint operations.</p>
                        </div>
                    </div>

                    <div class="sop-section" id="closing-statement">
                        <h3><i class="fas fa-award"></i> Closing Statement</h3>
                        
                        <div class="sop-subsection">
                            <p>The San Andreas Fire Department remains committed to protecting the people of San Andreas through professional emergency response and dedicated public service.</p>
                            
                            <p>All personnel are expected to uphold the standards of the department and carry out their duties with integrity, responsibility, and commitment to public safety.</p>
                        </div>
                    </div>

                    <div class="sop-footer">
                        <div class="footer-content">
                            <p><strong>Document Information:</strong></p>
                            <ul>
                                <li>Version: SAFD-SOP-v2.0</li>
                                <li>Effective Date: March 3, 2026</li>
                                <li>Next Review: June 1, 2026</li>
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
