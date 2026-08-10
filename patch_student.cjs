const fs = require('fs');
let code = fs.readFileSync('src/components/StudentManagement.tsx', 'utf8');

const replacement = `  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
  });`;

code = code.replace(/const \[startDate, setStartDate\] = useState\('2026-08-10'\);/g, replacement);
code = code.replace(/setStartDate\('2026-08-10'\);/g, `setStartDate(() => { const d = new Date(); return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`; });`);

fs.writeFileSync('src/components/StudentManagement.tsx', code);
