// Application State
let customers = {};
let businessSettings = {
    name: 'My Business',
    type: 'salon',
    address: '123 Business St, Nairobi',
    pointsRequired: 100,
    rewardDescription: 'Free service'
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with some sample data for demo purposes
    initializeSampleData();
    loadData();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Check-in form submission
    document.getElementById('customerPhone').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkInCustomer();
    });
    
    // Customer search
    document.getElementById('customerSearch').addEventListener('input', searchCustomers);
    
    // Reward settings form
    document.getElementById('pointsRequired').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') updateRewardSettings();
    });
    
    // Quick reward actions
    document.getElementById('rewardPhone').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') redeemReward();
    });
}

// Load data from memory on page load
function loadData() {
    updateDashboard();
    renderCustomers();
    loadBusinessSettings();
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.classList.add('active');
}

// Customer check-in functionality
function checkInCustomer() {
    const phone = document.getElementById('customerPhone').value.trim();
    const name = document.getElementById('customerName').value.trim();
    const points = parseInt(document.getElementById('visitPoints').value) || 10;
    const notes = document.getElementById('visitNotes').value.trim();

    if (!phone) {
        showMessage('checkinMessage', 'Please enter customer phone number', 'error');
        return;
    }

    if (!customers[phone]) {
        if (!name) {
            showMessage('checkinMessage', 'Please enter customer name for new customers', 'error');
            return;
        }
        customers[phone] = {
            name: name,
            phone: phone,
            totalPoints: 0,
            visits: 0,
            joinDate: new Date().toLocaleDateString(),
            lastVisit: null,
            visitHistory: []
        };
    }

    // Add visit
    customers[phone].visits++;
    customers[phone].totalPoints += points;
    customers[phone].lastVisit = new Date().toLocaleDateString();
    customers[phone].visitHistory.push({
        date: new Date().toLocaleDateString(),
        points: points,
        notes: notes
    });

    // Check for reward eligibility
    let rewardMessage = '';
    if (customers[phone].totalPoints >= businessSettings.pointsRequired) {
        rewardMessage = ` 🎉 Customer is eligible for: ${businessSettings.rewardDescription}!`;
    }

    showMessage('checkinMessage', `✅ Check-in successful! ${customers[phone].name} earned ${points} points.${rewardMessage}`, 'success');
    
    // Clear form
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('visitNotes').value = '';
    
    updateDashboard();
    renderCustomers();
}

// Update dashboard stats
function updateDashboard() {
    const customerCount = Object.keys(customers).length;
    const totalVisits = Object.values(customers).reduce((sum, customer) => sum + customer.visits, 0);
    const totalPoints = Object.values(customers).reduce((sum, customer) => sum + customer.totalPoints, 0);
    
    document.getElementById('totalCustomers').textContent = customerCount;
    document.getElementById('totalVisits').textContent = totalVisits;
    document.getElementById('activeRewards').textContent = Object.values(customers).filter(c => c.totalPoints >= businessSettings.pointsRequired).length;
    document.getElementById('pointsIssued').textContent = totalPoints;
}

// Render customers list
function renderCustomers() {
    const customersList = document.getElementById('customersList');
    const customerArray = Object.values(customers);
    
    if (customerArray.length === 0) {
        customersList.innerHTML = `
            <div class="empty-state">
                <h3>No customers yet</h3>
                <p>Add your first customer using the check-in feature!</p>
            </div>
        `;
        return;
    }

    customersList.innerHTML = customerArray.map(customer => {
        const progressPercent = Math.min((customer.totalPoints / businessSettings.pointsRequired) * 100, 100);
        const isEligibleForReward = customer.totalPoints >= businessSettings.pointsRequired;
        
        return `
            <div class="customer-card">
                <div class="customer-header">
                    <div>
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-phone">${customer.phone}</div>
                    </div>
                    <div class="visit-count">${customer.visits} visits</div>
                </div>
                
                <div class="points-display">
                    <div class="points">${customer.totalPoints} pts</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <small>${businessSettings.pointsRequired - customer.totalPoints > 0 ? businessSettings.pointsRequired - customer.totalPoints : 0} pts to reward</small>
                </div>
                
                <div class="customer-actions">
                    <button class="btn btn-small btn-secondary" onclick="addQuickVisit('${customer.phone}')">Quick Check-in</button>
                    ${isEligibleForReward ? `<button class="btn btn-small" onclick="redeemCustomerReward('${customer.phone}')">🎁 Redeem Reward</button>` : ''}
                    <button class="btn btn-small btn-secondary" onclick="viewCustomerHistory('${customer.phone}')">View History</button>
                    <button class="btn btn-small" onclick="editCustomer('${customer.phone}')">✏️ Edit</button>
                </div>
                
                ${isEligibleForReward ? `<div class="alert alert-success" style="margin-top: 15px;">🎉 Eligible for: ${businessSettings.rewardDescription}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Quick visit function
function addQuickVisit(phone) {
    if (customers[phone]) {
        customers[phone].visits++;
        customers[phone].totalPoints += 10;
        customers[phone].lastVisit = new Date().toLocaleDateString();
        customers[phone].visitHistory.push({
            date: new Date().toLocaleDateString(),
            points: 10,
            notes: 'Quick check-in'
        });
        
        updateDashboard();
        renderCustomers();
        
        // Show success message
        const card = event.target.closest('.customer-card');
        card.style.background = '#d4edda';
        setTimeout(() => {
            card.style.background = 'white';
        }, 1000);
    }
}

// View customer history
function viewCustomerHistory(phone) {
    const customer = customers[phone];
    if (!customer) return;
    
    const historyHTML = customer.visitHistory.map(visit => `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${visit.date}</strong>: ${visit.points} points
            ${visit.notes ? `<div style="color: #666; font-size: 0.9em;">${visit.notes}</div>` : ''}
        </div>
    `).join('');
    
    alert(`
        Customer: ${customer.name} (${customer.phone})
        Total Points: ${customer.totalPoints}
        Total Visits: ${customer.visits}
        Member Since: ${customer.joinDate}
        
        Visit History:
        ${historyHTML}
    `);
}

// Edit customer details
function editCustomer(phone) {
    const customer = customers[phone];
    if (!customer) return;
    
    const newName = prompt('Edit customer name:', customer.name);
    if (newName !== null && newName.trim() !== '') {
        customer.name = newName.trim();
        renderCustomers();
    }
    
    const newPoints = prompt('Adjust points (add or subtract):', '0');
    if (newPoints !== null && !isNaN(newPoints)) {
        const pointsChange = parseInt(newPoints);
        customer.totalPoints += pointsChange;
        customer.visitHistory.push({
            date: new Date().toLocaleDateString(),
            points: pointsChange,
            notes: 'Manual points adjustment'
        });
        updateDashboard();
        renderCustomers();
    }
}

// Redeem reward for specific customer
function redeemCustomerReward(phone) {
    if (customers[phone] && customers[phone].totalPoints >= businessSettings.pointsRequired) {
        customers[phone].totalPoints -= businessSettings.pointsRequired;
        customers[phone].visitHistory.push({
            date: new Date().toLocaleDateString(),
            points: -businessSettings.pointsRequired,
            notes: `Redeemed: ${businessSettings.rewardDescription}`
        });
        
        alert(`🎉 Reward redeemed for ${customers[phone].name}!\n${businessSettings.rewardDescription}`);
        updateDashboard();
        renderCustomers();
    }
}

// Search customers
function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const filteredCustomers = Object.values(customers).filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) || 
        customer.phone.includes(searchTerm)
    );
    
    const customersList = document.getElementById('customersList');
    
    if (filteredCustomers.length === 0 && searchTerm) {
        customersList.innerHTML = `
            <div class="empty-state">
                <h3>No customers found</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }
    
    // Re-render with filtered results
    const originalCustomers = customers;
    customers = {};
    filteredCustomers.forEach(customer => {
        customers[customer.phone] = customer;
    });
    renderCustomers();
    customers = originalCustomers;
}

// Update reward settings
function updateRewardSettings() {
    const pointsRequired = parseInt(document.getElementById('pointsRequired').value) || 100;
    const rewardDescription = document.getElementById('rewardDescription').value.trim() || 'Free service';
    
    businessSettings.pointsRequired = pointsRequired;
    businessSettings.rewardDescription = rewardDescription;
    
    showMessage('rewardMessage', '✅ Reward settings updated successfully!', 'success');
    renderCustomers();
}

// Redeem reward by phone
function redeemReward() {
    const phone = document.getElementById('rewardPhone').value.trim();
    
    if (!phone) {
        showMessage('rewardMessage', 'Please enter customer phone number', 'error');
        return;
    }
    
    if (!customers[phone]) {
        showMessage('rewardMessage', 'Customer not found', 'error');
        return;
    }
    
    if (customers[phone].totalPoints < businessSettings.pointsRequired) {
        showMessage('rewardMessage', `Customer needs ${businessSettings.pointsRequired - customers[phone].totalPoints} more points`, 'error');
        return;
    }
    
    redeemCustomerReward(phone);
    document.getElementById('rewardPhone').value = '';
    showMessage('rewardMessage', '🎉 Reward redeemed successfully!', 'success');
}

// Add bonus points
function addBonusPoints() {
    const phone = document.getElementById('rewardPhone').value.trim();
    
    if (!phone) {
        showMessage('rewardMessage', 'Please enter customer phone number', 'error');
        return;
    }
    
    if (!customers[phone]) {
        showMessage('rewardMessage', 'Customer not found', 'error');
        return;
    }
    
    const bonusPoints = 50;
    customers[phone].totalPoints += bonusPoints;
    customers[phone].visitHistory.push({
        date: new Date().toLocaleDateString(),
        points: bonusPoints,
        notes: 'Bonus points added'
    });
    
    document.getElementById('rewardPhone').value = '';
    showMessage('rewardMessage', `✅ Added ${bonusPoints} bonus points to ${customers[phone].name}!`, 'success');
    updateDashboard();
    renderCustomers();
}

// Save business settings
function saveBusinessSettings() {
    businessSettings.name = document.getElementById('businessName').value.trim();
    businessSettings.type = document.getElementById('businessType').value;
    businessSettings.address = document.getElementById('businessAddress').value.trim();
    
    showMessage('settingsMessage', '✅ Business settings saved successfully!', 'success');
}

// Load business settings into form
function loadBusinessSettings() {
    document.getElementById('businessName').value = businessSettings.name;
    document.getElementById('businessType').value = businessSettings.type;
    document.getElementById('businessAddress').value = businessSettings.address;
    document.getElementById('pointsRequired').value = businessSettings.pointsRequired;
    document.getElementById('rewardDescription').value = businessSettings.rewardDescription;
}

// Show message in a container
function showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="alert ${type === 'error' ? 'alert-error' : 'alert-success'}">
            ${message}
        </div>
    `;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Export data (for future functionality)
function exportData() {
    const data = {
        customers: customers,
        businessSettings: businessSettings
    };
    alert('Export functionality would save this data:\n\n' + JSON.stringify(data, null, 2));
}

// Import data (for future functionality)
function importData() {
    alert('Import functionality would load data from a file');
}