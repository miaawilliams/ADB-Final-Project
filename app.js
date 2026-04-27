const express = require('express');
const { db, user, store, businessHours } = require('./database/setup');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const PORT = process.env.PORT || 4000;
process.env.JWT_SECRET = 'testsecret';

const app = express();
app.use(express.json());
app.use(cors());



function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided'});
    }
     
    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role 
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            return res.status(401).json({ error: 'Token verification failed' });
        }
    }
}

function requireManager(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role === 'manager' || req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Manager or admin role required' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required'});
    }
    if (req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Admin role requires'});
    }
}



// User routes

app.get('/api/users', requireManager, async (req, res) => {
    try {
        const users = await user.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(404).json({ error: 'Users not found' });
    }
});

app.get('/api/users/:id', requireManager, async (req, res) => {
    try {
        const users = await user.findByPk(req.params.id);
        if (!users) {
            return res.status(404).json({ error: 'User not found' }); 
        }
        res.json(users)
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({error: 'User not found' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingUser = await user.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await user.create({
            name, 
            email,
            password: hashedPassword,
            role: 'employee'
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user'})
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }
        
        const foundUser = await user.findOne({ where: {email } });
        if (!foundUser) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, foundUser.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password' 
            });
        }

        const token = jwt.sign(
            {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN } 
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role
            }
        });
    } catch (error) {
        console.error('Error loggin in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});


app.put('/api/users/:id', requireManager, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const [updatedRowsCount] = await user.update(
            {name, email, password, role},
            {where: { id: req.params.id }}
        );
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'User not found'});
        }

        const updatedUser = await user.findByPk(req.params.id);
            res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const deletedRowsCount = await user.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        } 
        res.json({ message: 'User deleted successfully' }); 
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});



// store routes

app.get('/api/stores', requireAuth, async (req, res) => {
    try {
        const stores = await store.findAll();
        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(404).json({ error: 'Stores not found' });
    }
});

app.get('/api/stores/:id', requireAuth, async (req, res) => {
    try {
        const stores = await
        store.findByPk(req.params.id); 

        if (!stores) {
            return res.status(404).json({ error: 'Store not found' });
        }
        res.json(stores);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(404).json({ error: 'Store not found' });
    }
});

app.post('/api/stores', requireAdmin, async (req, res) => {
    try {
        const { name, address } = req.body;
        const newStore = await store.create({ 
            name, 
            address 
        });
        res.status(201).json(newStore);
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ error: 'Failed to create store'});
    }
});

app.put('/api/stores/:id', requireManager, async (req, res) => {
    try {
        const { name, address } = req.body;
        const [updatedRowsCount] = await store.update(
            {name, address},
            {where: { id: req.params.id }}
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const updatedStore = await store.findByPk(req.params.id);
            res.json(updatedStore);
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ error: 'Failed to update store' });
    }
});


app.delete('/api/stores/:id', requireAdmin, async (req, res) => {
    try {
        const storeDelete = await store.findByPk(req.params.id);

        if (!storeDelete) {
            return res.status(404).json({ error: 'Store not found' });
        }

        await storeDelete.destroy();
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
});



// business hours routes

app.get('/api/business-hours', requireAuth, async (req, res) => {
    try {
        const hours = await businessHours.findAll();
        res.json(hours);
    } catch (error) {
        console.error('Error fetching business hours:', error);
        res.status(500).json({ error: 'Failed to fetch business hours' });
    }
});

app.get('/api/business-hours/:id', requireAuth, async (req, res) => {
    try {
        const hours = await businessHours.findByPk(req.params.id);
        if (!hours) {
            return res.status(404).json({ error: 'Business hours not found' });
        }
        res.json(hours);
    } catch (error) {
        console.error('Error fetching business hours:', error);
        res.status(500).json({ error: 'Failed to fetch business hours' });
    }
});

app.post('/api/business-hours', requireAdmin, async (req, res) => {
    try {
        const { storeId, dayOfWeek, openTime, closeTime, isClosed } = req.body;
        const newHours = await businessHours.create({
            storeId,
            dayOfWeek,
            openTime,
            closeTime,
            isClosed
        });
        res.status(201).json(newHours);
    } catch (error) {
        console.error('Error creating business hours:', error);
        res.status(500).json({ error: 'Failed to create business hours' });
    }
});

app.put('/api/business-hours/:id', requireManager, async (req, res) => {
    try {
        const { storeId, dayOfWeek, openTime, closeTime, isClosed } = req.body;
        const [updatedRowsCount] = await businessHours.update(
            { storeId, dayOfWeek, openTime, closeTime, isClosed },
            { where: { id: req.params.id } }
        );

        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Business hours not found' });
        }

        const updatedHours = await businessHours.findByPk(req.params.id);
        res.json(updatedHours);
    } catch (error) {
        console.error('Error updating business hours:', error);
        res.status(500).json({ error: 'Failed to update business hours' });
    }
});

app.delete('/api/business-hours/:id', requireAdmin, async (req, res) => {
    try {
        const hoursDelete = await businessHours.findByPk(req.params.id);
        if (!hoursDelete) {
            return res.status(404).json({ error: 'Business hours not found' });
        }
        await hoursDelete.destroy();
        res.json({ message: 'Business hours deleted successfully' });
    } catch (error) {
        console.error('Error deleting business hours:', error);
        res.status(500).json({ error: 'Failed to delete business hours' });
    }
});

afterAll(async () => {
    if (db && db.close) {
        await db.close();
    }
});

module.exports = app;


