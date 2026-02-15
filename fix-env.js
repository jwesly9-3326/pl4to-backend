const fs = require('fs');
const path = require('path');

const envContent = `JWT_SECRET=gps_financier_secret_key_super_secure_2024
PORT=3000
DATABASE_URL="postgresql://postgres:REDACTED_DB_PASSWORD@localhost:5432/gps_financier"
`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf8');
console.log('✅ Fichier .env créé avec succès avec DATABASE_URL!');