// public/js/donate.js

document.getElementById('donationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        description: form.description.value,
        imageUrl: form.imageUrl.value,
        category: form.category.value,
        donorName: form.donorName.value,
        location: form.location.value,
        contactInfo: form.contactInfo.value
    };
    try {
        const res = await fetch('/api/donate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        const msgDiv = document.getElementById('message');
        if (res.ok) {
            msgDiv.textContent = 'Donation posted successfully!';
            msgDiv.style.color = 'green';
            form.reset();
        } else {
            msgDiv.textContent = result.error || 'Failed to post donation.';
            msgDiv.style.color = 'red';
        }
    } catch (err) {
        document.getElementById('message').textContent = 'Network error.';
    }
}); 