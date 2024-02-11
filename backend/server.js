import express from 'express';
import 'dotenv/config';
import overtimes from './src/routes/overtimes.js';
import db from './modules/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use((req, res, next) => {
    const date = new Date();
    console.log(`${`${date.getDate()} ${date.getHours()}h:${date.getMinutes()}m:${date.getSeconds()}s ${date.getMilliseconds()}ms`} : [${req.method}] "${req.path}"`);
    next();
});

app.use('/api/overtimes', overtimes);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
  
process.on("SIGINT", () => {
    console.log("Shutting down"); 
    db.close();
    app.close(() => process.exit(0));
});
