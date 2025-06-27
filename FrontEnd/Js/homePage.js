class DonationCampaign {
  constructor() {
    this.currentDonation = 0;
    this.campaignID = "";
    this.collectedAmount = 0;
    this.goalAmount = 0;
    this.candidateName = "";
    this.description = "";
    this.initialize();
  }

  async initialize() {
    await this.fetchCampaignData();
    this.setupEventListeners();
  }

  async fetchCampaignData() {
   function formatDescription(text) {
  console.log("Original from API:", text); 

  // Apply custom markdown-style formatting
  text = text.replace(/\/\/(.*?)\/\//g, '<u>$1</u>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<i>$1</i>');
  text = text.replace(/\*(.*?)\*/g, '<b>$1</b>');

  console.log("After formatting:", text); 

  return text;
}


    try {
      const response = await fetch('https://api.helpthem.live/donCampController/getValidCampaign');

      const data = await response.json();

      if(data.campaignID === "dummy"){
      }

      this.campaignID = data.campaignID;
      this.collectedAmount = data.collectedAmount;
      this.goalAmount = data.goalAmount;
      this.candidateName = data.candidateName || "Our Charity Campaign";
      this.description =formatDescription(data.description) || "Help us make a difference...";
      document.getElementById("aboutCampaign").innerHTML =this.description ;
      this.updateCampaignUI(data);
      return data;

    } catch (error) {
      console.error('Error fetching campaign data:', error);
      this.showError("Failed to load campaign data. Please try again later.");
      throw error;
    }
  }
  updateCampaignUI(data) {
    document.getElementById('candidateName').textContent = this.candidateName;
    document.getElementById('collectedAmount').textContent = `${this.formatCurrency(data.collectedAmount)}Rs`;
    document.getElementById('goalAmount').textContent = `/${this.formatCurrency(data.goalAmount)}Rs`;
    this.updateProgressBar(data.collectedAmount, data.goalAmount);
    this.displayCampaignDates(data.startDate, data.endDate);
   document.getElementById('aboutCampaign').innerHTML = this.description;


    this.CampaignCompleted(data.collectedAmount, data.goalAmount, data);
  }

  formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  updateProgressBar(collected, goal) {
    const percentage = Math.min((collected / goal) * 100, 100);
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');

    let currentWidth = parseFloat(progressBar.style.width) || 0;
    const animationDuration = 1000;
    const startTime = performance.now();

    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const newWidth = currentWidth + (percentage - currentWidth) * progress;

      progressBar.style.width = `${newWidth}%`;
      progressPercentage.textContent = `${Math.round(newWidth)}%`;

      if (newWidth >= 100) {
        progressBar.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
      } else if (newWidth >= 75) {
        progressBar.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
      } else {
        progressBar.style.background = 'linear-gradient(90deg, #e74c3c, #f39c12)';
      }

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  displayCampaignDates(startDateStr, endDateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };

    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      document.getElementById('startDate').textContent = startDate.toLocaleDateString('en-US', options);
      document.getElementById('endDate').textContent = endDate.toLocaleDateString('en-US', options);

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

  showError(message) {
    const errorElement = document.getElementById('desc') || document.getElementById('aboutCampaign');
    errorElement.textContent = message;
    errorElement.classList.add('text-danger');
  }

  openDonationModal() {
    document.getElementById('donationModal').classList.add('active');
    // document.body.classList.add('modal-open');
    // document.querySelector(".donation-modal").style.display='block'
  }

  closeDonationModal() {
    document.getElementById('donationModal').classList.remove('active');
    // document.body.classList.remove('modal-open');
    this.resetDonationForm();
  }

  resetDonationForm() {
    document.getElementById('donorName').value = '';
    document.getElementById('donationAmount').value = '';
    document.getElementById('anonymousCheck').checked = false;
    document.getElementById('donorName').classList.remove('is-invalid');
    document.getElementById('donationAmount').classList.remove('is-invalid');
  }

  setAmount(amount) {
    document.getElementById('donationAmount').value = amount;
    document.getElementById('donationAmount').focus();
  }

  async submitDonation() {
    const donorName = document.getElementById('donorName').value.trim();
    const donationAmount = parseInt(document.getElementById('donationAmount').value);
    const isAnonymous = document.getElementById('anonymousCheck').checked;

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
      const campaignData = await this.fetchCampaignData();

      const response = await fetch('https://api.helpthem.live/donController', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName,
          amount: donationAmount,
          annonymous: isAnonymous,
          campaignID: this.campaignID
        })
      });

      if (!response.ok) throw new Error('Donation submission failed');
      const result = await response.text();
      console.log('Donation successful:', result);

      this.closeDonationModal();
      await this.fetchCampaignData();
      this.CampaignCompleted(this.collectedAmount, this.goalAmount);

    } catch (error) {
      console.error('Donation error:', error);
      alert("Failed to submit donation. Please try again later.");
    }
  }


ShowSubmitDonation(){

}


  CampaignCompleted(collectedAmount, goalAmount, campaignData) {
    const form = document.getElementById('donation_Form');
    const postContainer = document.getElementById('postCampaignInfo');
    const completed = collectedAmount >= goalAmount

    if (completed) {
      if (form) form.style.display = "none";
      if (postContainer) postContainer.style.display = "block";



      if (!document.querySelector('.campaign-completed-message')) {
        const msg = document.createElement('div');
        msg.className = 'campaign-completed-message';
        msg.innerHTML = `
          <div class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            ${completed ? 'This campaign has successfully reached its goal! Thank you to all donors.' : 'This campaign has ended. Thank you for your support.'}
          </div>
        `;
        postContainer?.appendChild(msg);
      }
    } else {
      if (form) form.style.display = "block";
      if (postContainer) postContainer.style.display = "none";
    }
  }

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

// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.donationCampaign = new DonationCampaign();
  window.openDonationModal = () => window.donationCampaign.openDonationModal();
  window.closeDonationModal = () => window.donationCampaign.closeDonationModal();
  window.submitDonation = () => window.donationCampaign.submitDonation();
  window.setAmount = (amt) => window.donationCampaign.setAmount(amt);
});
