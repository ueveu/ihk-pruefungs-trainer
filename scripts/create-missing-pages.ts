
import fs from 'fs';
import path from 'path';

const APP_TSX_PATH = 'client/src/App.tsx';
const PAGES_DIR = 'client/src/pages';

// Read App.tsx and extract page imports
const appContent = fs.readFileSync(APP_TSX_PATH, 'utf-8');
const importRegex = /import\s+(\w+)\s+from\s+['"]\.\/pages\/(\w+)['"];/g;
const matches = [...appContent.matchAll(importRegex)];

// Create template for new page component
const createPageTemplate = (pageName: string) => `\
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ${pageName}() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>${pageName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>${pageName} content coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
`;

// Check and create missing pages
matches.forEach(match => {
  const [, componentName, pagePath] = match;
  const filePath = path.join(PAGES_DIR, `${pagePath}.tsx`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Creating missing page: ${filePath}`);
    fs.writeFileSync(filePath, createPageTemplate(componentName));
  }
});

console.log('Finished checking and creating missing pages');
