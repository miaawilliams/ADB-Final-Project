const app = require('./app');
const { db, user, store, businessHours } = require('./database/setup');

db.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

async function testConnection() {
    try {
        await db.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// User routes

app.get('/api/users', async (req, res) => {
    try {
        const users = await user.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(404).json({ error: 'Users not found' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const users = await user.findbyPk(req.params.id);
        if (!users) {
            return res.status(404).json({ error: 'User not found' }); 
        }
        res.json(users)
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({error: 'User not found' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password, employee } = req.body;
        const newUser = await user.create({
            name, 
            email,
            password,
            employee
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user'})
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email, password, employee } = req.body;
        const [updatedRowsCount] = await user.update(
            {name, email, password, employee},
            {where: { id: req.params.id }}
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'User not founf'});
        }

        const updatedUser = await user.findbyPk(req.params.id);
            res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedRowsCount = await user.destroy({
            where: { id: req.params.id}
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

app.get('/api/stores', async (req, res) => {
    try {
        const stores = await store.findAll();
        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(404).json({ error: 'Stores not found' });
    }
});

app.get('/api/stores/:id', async (req, res) => {
    try {
        const stores = await
        store.findbyPk(req.params.id); 

        if (!stores) {
            return res.status(404).json({ error: 'Store not found' });
        }
        res.json(stores);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(404).json({ error: 'Store not found' });
    }
});

app.post('/api/stores', async (req, res) => {
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

app.put('/api/stores/:id', async (req, res) => {
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


app.delete('/api/stores/:id', async (req, res) => {
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

app.get('/api/business-hours', async (req, res) => {
    try {
        const hours = await businessHours.findAll();
        res.json(hours);
    } catch (error) {
        console.error('Error fetching business hours:', error);
        res.status(500).json({ error: 'Failed to fetch business hours' });
    }
});

app.get('/api/business-hours/:id', async (req, res) => {
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

app.post('/api/business-hours', async (req, res) => {
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

app.put('/api/business-hours/:id', async (req, res) => {
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

app.delete('/api/business-hours/:id', async (req, res) => {
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