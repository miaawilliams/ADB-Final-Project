const express = require('express');
const { db, user, store, businessHours } = require('./database/setup');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
