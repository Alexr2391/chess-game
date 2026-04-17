import { execSync } from "child_process";
import path from "path";

const [, , input, output] = process.argv;

if (!input || !output) {
  console.error("Usage: npm run optimize <input> <output>");
  console.error(
    "Example: npm run optimize public/models/chess.glb public/models/chess-optimized.glb",
  );
  process.exit(1);
}

const inputPath = path.resolve(input);
const outputPath = path.resolve(output);

console.log(`Optimizing ${inputPath}...`);

execSync(
  `gltf-transform optimize ${inputPath} ${outputPath} --texture-compress webp`,
  { stdio: "inherit" },
);

console.log(`Done! Saved to ${outputPath}`);
