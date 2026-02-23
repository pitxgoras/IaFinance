const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const requestLogger = (req, res, next) => {
  const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}\n`;
  
  fs.appendFile(path.join(logDir, 'requests.log'), logMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

const errorLogger = (err, req, res, next) => {
  const logMessage = `${new Date().toISOString()} - ERROR: ${err.message}\nStack: ${err.stack}\n\n`;
  
  fs.appendFile(path.join(logDir, 'errors.log'), logMessage, (err) => {
    if (err) console.error('Error writing to error log:', err);
  });
  
  next(err);
};

module.exports = { requestLogger, errorLogger };
