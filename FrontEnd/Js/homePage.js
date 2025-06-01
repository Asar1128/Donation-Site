class DonationCampaign {
  constructor() {
    this.currentDonation = 0;
    this.campaignID = "";
    this.collectedAmount = 0;
    this.goalAmount = 0;
    this.initialize();
  }

  // Initialize the campaign
  async initialize() {
    await this.fetchCampaignData();
    this.setupEventListeners();
  }

  // Fetch campaign data from API
  async fetchCampaignData() {
    try {
      const response = await fetch('https://donation-site-backend-e100d7fddae1.herokuapp.com/donCampController/getValidCampaign');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.campaignID = data.campaignID;
      this.collectedAmount = data.collectedAmount;
      this.goalAmount = data.goalAmount;

      // Update the UI
      this.updateCampaignUI(data);
      return data;
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      this.showError("Failed to load campaign data. Please try again later.");
      throw error;
    }
  }

  // Update campaign UI with fetched data
  updateCampaignUI(data) {
    document.getElementById('candidateName').textContent = data.candidateName || "Our Charity Campaign";
    document.getElementById('collectedAmount').textContent = `${this.formatCurrency(data.collectedAmount)}Rs`;
    document.getElementById('goalAmount').textContent = `/${this.formatCurrency(data.goalAmount)}Rs`;
    this.updateProgressBar(data.collectedAmount, data.goalAmount);
    this.displayCampaignDates(data.startDate, data.endDate);
    document.getElementById('aboutCampaign').textContent = data.description || 
      "Help us make a difference with your generous donation.";
  }

  // Format currency with commas
  formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Update progress bar with animation
  updateProgressBar(collected, goal) {
    const percentage = Math.min((collected / goal) * 100, 100);
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    
    // Animate progress bar
    let currentWidth = parseFloat(progressBar.style.width) || 0;
    const animationDuration = 1000; // ms
    const startTime = performance.now();
    
    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const newWidth = currentWidth + (percentage - currentWidth) * progress;
      
      progressBar.style.width = `${newWidth}%`;
      progressPercentage.textContent = `${Math.round(newWidth)}%`;
      
      // Change color based on progress
      if (newWidth >= 100) {
        progressBar.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
      } else if (newWidth >= 75) {
        progressBar.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
      } else {
        progressBar.style.background = 'linear-gradient(90deg, #e74c3c, #f39c12)';
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Display formatted campaign dates
  displayCampaignDates(startDateStr, endDateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      document.getElementById('startDate').textContent = startDate.toLocaleDateString('en-US', options);
      document.getElementById('endDate').textContent = endDate.toLocaleDateString('en-US', options);
      
      // Add warning if campaign is expired
      if (new Date() > endDate) {
        document.getElementById('endDate').classList.add('text-danger');
        document.getElementById('endDate').insertAdjacentHTML('afterend', 
          '<span class="campaign-ended-badge">Ended</span>');
      }
    } catch (e) {
      console.error('Error formatting dates:', e);
      document.getElementById('startDate').textContent = 'Not specified';
      document.getElementById('endDate').textContent = 'Not specified';
    }
  }

  // Show error message
  showError(message) {
    const errorElement = document.getElementById('desc') || document.getElementById('aboutCampaign');
    errorElement.textContent = message;
    errorElement.classList.add('text-danger');
  }

  // Modal control functions
  openDonationModal() {
    document.getElementById('donationModal').classList.add('active');
    document.body.classList.add('modal-open');
  }

  closeDonationModal() {
    document.getElementById('donationModal').classList.remove('active');
    document.body.classList.remove('modal-open');
    this.resetDonationForm();
  }

  // Reset donation form
  resetDonationForm() {
    document.getElementById('donorName').value = '';
    document.getElementById('donationAmount').value = '';
    document.getElementById('anonymousCheck').checked = false;
    document.getElementById('donorName').classList.remove('is-invalid');
    document.getElementById('donationAmount').classList.remove('is-invalid');
  }

  // Set quick donation amount
  setAmount(amount) {
    document.getElementById('donationAmount').value = amount;
    document.getElementById('donationAmount').focus();
  }

  // Submit donation
  async submitDonation() {
    const donorName = document.getElementById('donorName').value.trim();
    const donationAmount = parseInt(document.getElementById('donationAmount').value);
    const isAnonymous = document.getElementById('anonymousCheck').checked;
    
    // Validate inputs
    let isValid = true;
    if (!donorName) {
      document.getElementById('donorName').classList.add('is-invalid');
      isValid = false;
    }
    
    if (isNaN(donationAmount)) {
      document.getElementById('donationAmount').classList.add('is-invalid');
      isValid = false;
    }
    
    if (!isValid) {
      alert("Please fill in all required fields correctly.");
      return;
    }
    
    try {
      // First ensure we have the latest campaign data
      const campaignData = await this.fetchCampaignData();
      
      // Submit the donation
      const response = await fetch('https://donation-site-backend-e100d7fddae1.herokuapp.com/donController', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donorName: donorName,
          amount: donationAmount,
          annonymous: isAnonymous,
          campaignID: this.campaignID
        })
      });
      
      if (!response.ok) {
        throw new Error('Donation submission failed');
      }
      
      const result = await response.text();
      console.log('Donation successful:', result);
      
      // Update UI and show success message
      this.currentDonation += donationAmount;
      this.collectedAmount += donationAmount;
      this.updateProgressBar(this.collectedAmount, this.goalAmount);
      document.getElementById('collectedAmount').textContent = `${this.formatCurrency(this.collectedAmount)}Rs`;
      this.showThankYouMessage(donorName, donationAmount, isAnonymous);
      this.closeDonationModal();
      
    } catch (error) {
      console.error('Donation error:', error);
      alert("Failed to submit donation. Please try again later.");
    }
  }

  // Show thank you message
  showThankYouMessage(name, amount, anonymous) {
    const thankYouMessage = `
      <div class="thank-you-message">
        <i class="fas fa-heart"></i>
        <h3>Thank You ${anonymous ? 'Anonymous Donor' : name}!</h3>
        <p>Your donation of ${this.formatCurrency(amount)}Rs will make a difference.</p>
        <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-primary">Close</button>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', thankYouMessage);
  }

  // Setup event listeners
  setupEventListeners() {
    document.getElementById('donorName')?.addEventListener('input', () => {
      document.getElementById('donorName').classList.remove('is-invalid');
    });
    
    document.getElementById('donationAmount')?.addEventListener('input', () => {
      document.getElementById('donationAmount').classList.remove('is-invalid');
    });
    
    window.addEventListener('click', (event) => {
      if (event.target === document.getElementById('donationModal')) {
        this.closeDonationModal();
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.donationCampaign = new DonationCampaign();
  
  // Expose methods to global scope for HTML onclick handlers
  window.openDonationModal = () => window.donationCampaign.openDonationModal();
  window.closeDonationModal = () => window.donationCampaign.closeDonationModal();
  window.setAmount = (amount) => window.donationCampaign.setAmount(amount);
  window.submitDonation = () => window.donationCampaign.submitDonation();
});