const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lower = content.toLowerCase();
      
      const targets = ['.png', '.jpg', '.jpeg', '.webp', '.gif', 'assets/'];
      let found = false;
      const foundLines = [];
      
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        // Skip http / https external references or db upload paths
        if (lowerLine.includes('http://') || lowerLine.includes('https://') || lowerLine.includes('/uploads/')) {
          return;
        }
        // Skip imports we just added
        if (lowerLine.includes("import aboutimage") || lowerLine.includes("import flowerimage")) {
          return;
        }
        for (const target of targets) {
          if (lowerLine.includes(target)) {
            found = true;
            foundLines.push(`  Line ${index + 1}: ${line.trim()}`);
            break;
          }
        }
      });
      
      if (found && foundLines.length > 0) {
        console.log(`Found match in: ${fullPath}`);
        foundLines.forEach(l => console.log(l));
      }
    }
  }
}

searchDir(path.join(__dirname, '../client/src'));

