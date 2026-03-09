import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import prisma from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MODEL_ID = '5e5e2093-6928-4fb8-9aae-9f175038a360';

async function downloadModel() {
  try {
    console.log('Fetching model from database...');
    const model = await prisma.model3D.findUnique({
      where: { id: MODEL_ID }
    });

    if (!model) {
      console.error('Model not found');
      process.exit(1);
    }

    console.log('Model found:', model.productName);
    console.log('Current URL:', model.modelUrl);

    if (!model.modelUrl || !model.modelUrl.startsWith('http')) {
      console.log('Model already uses local path');
      process.exit(0);
    }

    // Create models directory if it doesn't exist
    const modelsDir = path.join(__dirname, 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
      console.log('Created models directory');
    }

    // Download GLB file
    console.log('Downloading GLB file...');
    const response = await axios.get(model.modelUrl, {
      responseType: 'arraybuffer',
      timeout: 60000 // 60 second timeout
    });

    const filename = `${MODEL_ID}.glb`;
    const filepath = path.join(modelsDir, filename);

    fs.writeFileSync(filepath, Buffer.from(response.data));
    console.log(`✅ Downloaded GLB file: ${filename} (${(response.data.byteLength / 1024 / 1024).toFixed(2)} MB)`);

    // Update database
    const localPath = `/models/${filename}`;
    await prisma.model3D.update({
      where: { id: MODEL_ID },
      data: {
        modelUrl: localPath
      }
    });

    console.log('✅ Updated database with local path:', localPath);
    console.log('\nDone! You can now view the model at:');
    console.log(`http://localhost:5173/model/${MODEL_ID}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
  } finally {
    await prisma.$disconnect();
  }
}

downloadModel();
