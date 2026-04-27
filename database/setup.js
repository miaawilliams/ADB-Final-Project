const { Sequelize, DataTypes } = require('sequelize');

const db = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});



// Models

const user = db.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: true 
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'employee',
        validate: {
            isIn: [['employee', 'manager', 'admin']]
        }
    }
});

const store = db.define('store', {
    id: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const businessHours = db.define('businessHours', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: store,
            key: 'id'
        }
    },
    dayOfWeek: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    openTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    closeTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    isClosed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});


module.exports = {db, user, store, businessHours};
