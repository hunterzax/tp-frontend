const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (path.extname(f) === '.tsx') {
        callback(dirPath);
      }
    }
  });
}

const targetDir = '/Users/zax/Documents/Project_TPA_SCAN/VA146/TPA-FRONT-END/src/app';

walkDir(targetDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to match the specific ClientProps interface
  // Handling slight whitespace variations
  const clientPropsRegex = /interface\s+ClientProps\s*\{\s*params\s*:\s*\{\s*lng\s*:\s*string\s*;?\s*\}\s*;?\s*\}/g;
  
  // Regex to match the component definition
  const componentRegex = /const\s+([a-zA-Z0-9_]+)\s*:\s*React\.FC<ClientProps>\s*=\s*\(props\)\s*=>\s*\{/g;
  
  if (clientPropsRegex.test(content) && componentRegex.test(content)) {
     
     let newContent = content.replace(clientPropsRegex, `interface ClientProps {
    // params: {
    //     lng: string;
    // };
}`);
     
     newContent = newContent.replace(componentRegex, (match, name) => {
         return `const ${name}: React.FC<ClientProps> = () => {`;
     });
     
     if (newContent !== content) {
         console.log(`Updating ${filePath}`);
         fs.writeFileSync(filePath, newContent);
     }
  }
});
