import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const envContent = `MONGO_URI=mongodb+srv://heapp8720_db_user:szTxtpaMokHvUdJg@clusterabid.jmfs8k2.mongodb.net/kashif-hisab-kitab?appName=Clusterabid
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_here

DB_HOST=localhost
DB_USER=u410869863_abid
DB_PASSWORD=Abid@123uncle
DB_NAME=u410869863_Abiddatabse
DB_CONNECTION_LIMIT=5
`;

console.log('📝 Creating .env file in:', rootDir);

try {
    fs.writeFileSync(path.join(rootDir, '.env'), envContent);
    console.log('✅ .env file created successfully!');
    console.log('📄 Content written:');
    console.log(envContent);
} catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
}
