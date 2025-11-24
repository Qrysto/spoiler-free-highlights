import { promises as fs } from 'fs';
import path from 'path';
import { Fixture } from './types';

const FIXTURES_FILE_PATH = path.join(process.cwd(), 'data', 'fixtures.json');

export async function getLocalFixtures(): Promise<Fixture[]> {
  try {
    const data = await fs.readFile(FIXTURES_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

