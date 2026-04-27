require('dotenv').config();
const bcrypt = require('bcryptjs');


const { db, store, user, businessHours } = require('./setup');
async function seed() {
    try {
        await db.sync({ force: true });

        console.log('Database synced');

        // users
        const users = await user.bulkCreate([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: bcrypt.hashSync('password123', 10),
                role: 'admin'
            },
            {
                name: 'Manager User',
                email: 'manager@example.com',
                password: bcrypt.hashSync('password123', 10),
                role: 'manager'
            },
            {
                name: 'Employee User',
                email: 'employee@example.com',
                password: bcrypt.hashSync('password123', 10),
                role: 'employee'
            }
        ]);

        console.log('Users seeded');

        // stores
        const stores = await store.bulkCreate([
            {
                name: 'Main Street Store',
                address: '123 Main St'
            },
            {
                name: 'Mall Location',
                address: '456 Mall Blvd'
            }
        ]);

        console.log('Stores seeded');

        // business hours
        const hoursData = [];

        const days = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ];

        for (const s of stores) {
            for (const day of days) {
                hoursData.push({
                    storeId: s.id,
                    dayOfWeek: day,
                    openTime: '09:00',
                    closeTime: '17:00',
                    isClosed: day === 'Sunday' // closed Sundays
                });
            }
        }

        await businessHours.bulkCreate(hoursData);

        console.log('Business hours seeded');

        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();