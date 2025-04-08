const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
process.on('uncaughtException', (err) => {
  console.log('UncaughtException');
  console.log(err.name, err.message);
  process.exit(1);
});
const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Prevent deprecation warnings
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('✅ Database connected successfully');
  });

const port = 3000;
const server = app.listen(port, () => {
  console.log(`🚀server is running on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection', err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
