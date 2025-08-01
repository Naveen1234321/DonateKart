// public/js/my-donations.js

document.getElementById('donorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const donorName = e.target.donorName.value.trim();
    const donationsList = document.getElementById('donationsList');
    const messageDiv = document.getElementById('message');
    if (!donorName) {
        messageDiv.textContent = 'Please enter your name.';
        messageDiv.style.color = 'red';
        return;
    }
    messageDiv.textContent = '';
    donationsList.innerHTML = 'Loading...';
    try {
        const res = await fetch(`/api/my-donations/${encodeURIComponent(donorName)}`);
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) {
            donationsList.innerHTML = '<p>No donations found for this name.</p>';
            return;
        }
        donationsList.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'donation-card';
            div.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p><b>Category:</b> ${item.category}</p>
                <p><b>Location:</b> ${item.location}</p>
                <p><b>Status:</b> ${item.status}</p>
                ${item.status === 'requested' ? `<button class="deliver-btn" data-id="${item._id}">Mark as Delivered</button>` : ''}
            `;
            div.style = 'border:1px solid #ccc;padding:12px;margin:12px 0;border-radius:8px;background:#fff;max-width:400px;';
            donationsList.appendChild(div);
        });
        // Add event listeners for deliver buttons
        document.querySelectorAll('.deliver-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                this.disabled = true;
                this.textContent = 'Updating...';
                try {
                    const res = await fetch(`/api/items/${id}/deliver`, { method: 'POST' });
                    const result = await res.json();
                    if (res.ok) {
                        messageDiv.textContent = 'Item marked as delivered.';
                        messageDiv.style.color = 'green';
                        document.getElementById('donorForm').dispatchEvent(new Event('submit'));
                    } else {
                        messageDiv.textContent = result.error || 'Failed to update.';
                        messageDiv.style.color = 'red';
                        this.disabled = false;
                        this.textContent = 'Mark as Delivered';
                    }
                } catch (err) {
                    messageDiv.textContent = 'Network error.';
                    messageDiv.style.color = 'red';
                    this.disabled = false;
                    this.textContent = 'Mark as Delivered';
                }
            });
        });
    } catch (err) {
        donationsList.innerHTML = '<p>Failed to load donations.</p>';
    }
}); 