import express from 'express';
import 'dotenv/config';
import overtimes from './src/routes/overtimes.js';
import db from './modules/db.js';
import Overtime from './src/models/overtimeModel.js';

const app = express();
const PORT = process.env.PORT || 5000;

// db.serialize(() => {
//     // db.run("CREATE TABLE lorem (info TEXT)");

//     const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (let i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//         console.log(row.id + ": " + row.info);
//     });
// });


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
