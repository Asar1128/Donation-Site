let currentDonation = 0;
let campaignID = "";
let collectedAmount = 0;
let goalAmount = 0;

// function progress_bar(amount) {
//     const speed = 10;
//     const barItem = $('.progress_bar_item');
//     const bar = barItem.find('.progress');
//     const valueDisplay = barItem.find('.item_value');
//     const goal = goalAmount;

//     currentDonation += amount;
//     if (currentDonation > goal) currentDonation = goal;

//     let i = parseInt(barItem.data('current')) || 0;

//     const count = setInterval(function () {
//         if (i < currentDonation) {
//             i++;
//             let percent = (i / goal) * 100;
//             bar.css('width', percent + '%');
//             valueDisplay.text(i + 'Rs');
//             barItem.data('current', i);
//         } else {
//             clearInterval(count);
//         }
//     }, speed);
// }


function submitDonation() {
    // First GET the campaign data
    fetch('https://donation-site-backend-e100d7fddae1.herokuapp.com/donCampController/getValidCampaign')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch campaign data");
            }
            return response.json();
        })
        .then(data => {
            console.log("Campaign data received:", data);

            // Extract from GET response
            campaignID = data.campaignID;
            collectedAmount = data.collectedAmount;
            goalAmount = data.goalAmount;
            const description = data.description;
            const candidateName = data.candidateName;

            // Proceed with donation now that you have campaignID
            const amount = parseInt(document.getElementById("donationAmount").value);
            if (!amount || amount <= 0) {
                alert("Please enter a valid donation amount.");
                return;
            }
            const name = document.getElementById("donorName").value;
            if (!name) {
                alert("Please enter your name.");
                return;
            }
            const annonymous = document.getElementById("anonymousCheck").checked;

            // Now send donation POST (optional)
            fetch('https://donation-site-backend-e100d7fddae1.herokuapp.com/donController', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    donorName: name,
                    amount: amount,
                    annonymous: annonymous,
                    campaignID: campaignID
                })
            })
            .then(response => response.text())
            .then(postData => {
                console.log('Donation posted:', postData);
                // progress_bar(amount);
                alert("Thank you for your donation of " + amount + " Rs!");
            })
            .catch(error => {
                console.error('Donation error:', error);
                alert("Failed to submit donation.");
            });

        })
        .catch(error => {
            console.error("Campaign fetch error:", error);
            alert("Failed to fetch campaign data.");
        });
}
