const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';

let provider = 'postgresql';
if (!dbUrl || dbUrl.startsWith('file:') || dbUrl.includes('.db') || dbUrl.startsWith('sqlite:')) {
  provider = 'sqlite';
}

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, 'utf8');
  
  // Replace provider inside datasource db { ... }
  const newContent = content.replace(
    /(datasource\s+db\s*\{\s*[\s\S]*?provider\s*=\s*")[^"]+("\s*[\s\S]*?\})/m,
    `$1${provider}$2`
  );
  
  if (content !== newContent) {
    fs.writeFileSync(schemaPath, newContent, 'utf8');
    console.log(`[Prisma Setup] Updated schema.prisma provider to "${provider}" because DATABASE_URL is "${dbUrl}"`);
  } else {
    console.log(`[Prisma Setup] schema.prisma provider is already "${provider}"`);
  }
} else {
  console.error('[Prisma Setup] schema.prisma not found!');
}
