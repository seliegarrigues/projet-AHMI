import fs from "fs";
import path from "path";

const baseDir = "./src/routes";

fs.readdir(baseDir, (err, files) => {
  if (err) return console.error(err);

  files.forEach((file) => {
    const fullPath = path.join(baseDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");

    const regex = /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const pathValue = match[2];
      if (/\/:[^a-zA-Z]/.test(pathValue) || /\/:$/.test(pathValue)) {
        console.info(`Mauvais path dans ${file} : "${pathValue}"`);
      }
    }
  });
});
