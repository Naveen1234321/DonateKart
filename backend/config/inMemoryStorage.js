// In-memory storage fallback when MongoDB is not available
const bcrypt = require('bcryptjs');

class InMemoryStorage {
    constructor() {
        this.items = [];
        this.requests = [];
        this.users = [];
        this.itemCounter = 1;
        this.requestCounter = 1;
        this.userCounter = 1;
    }

    // Item methods
    async createItem(itemData) {
        const item = {
            _id: this.itemCounter.toString(),
            ...itemData,
            status: 'available',
            createdAt: new Date()
        };
        this.items.push(item);
        this.itemCounter++;
        return item;
    }

    async findItems() {
        return this.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async findItemById(id) {
        return this.items.find(item => item._id === id);
    }

    async findItemsByDonor(donorName) {
        return this.items.filter(item => item.donorName === donorName)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async updateItemStatus(id, status) {
        const item = this.items.find(item => item._id === id);
        if (item) {
            item.status = status;
            return item;
        }
        return null;
    }

    // Request methods
    async createRequest(requestData) {
        const request = {
            _id: this.requestCounter.toString(),
            ...requestData,
            status: 'requested',
            createdAt: new Date()
        };
        this.requests.push(request);
        this.requestCounter++;
        return request;
    }

    async findRequestsByRequestor(requestorName) {
        const requests = this.requests.filter(req => req.requestorName === requestorName);
        return requests.map(req => ({
            ...req,
            item: this.items.find(item => item._id === req.item)
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async updateRequestStatus(itemId, status) {
        this.requests.forEach(req => {
            if (req.item === itemId && req.status !== 'delivered') {
                req.status = status;
            }
        });
    }

    // User methods
    async createUser(userData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const user = {
            _id: this.userCounter.toString(),
            ...userData,
            password: hashedPassword,
            createdAt: new Date()
        };
        this.users.push(user);
        this.userCounter++;
        return user;
    }

    async findUserByEmail(email) {
        return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    async findUserById(id) {
        return this.users.find(user => user._id === id);
    }
}

module.exports = InMemoryStorage; 