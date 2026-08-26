const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');
const servicesDir = path.join(__dirname, '..', 'src', 'services');

if (!fs.existsSync(controllersDir)) fs.mkdirSync(controllersDir, { recursive: true });
if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir, { recursive: true });

console.log("Directories created.");
