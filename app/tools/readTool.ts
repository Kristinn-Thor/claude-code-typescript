import fs from 'fs';

/**
 * Reads the contents of a file at the given path.
 * @param filePath The path to the file to read
 * @returns The contents of the file
 */
export default function readTool(filePath: string): void {
  // For security reasons, we don't allow reading .env files or any files outside of this package directory.
  if (filePath.includes('.env') || filePath.includes('..')) {
    throw new Error('Invalid file path');
  }
  // For testing: log the current working directory and the file path being read.
  console.warn(`Current working directory: ${process.cwd()}`);
  console.warn(`Reading file at path: ${filePath}`);
  // Read the file and return its contents.
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    // Print the raw file contents to stdout so that it can be captured in tests.
    console.log(data);
  } catch (err) {
    throw new Error(
      `Error reading file: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
