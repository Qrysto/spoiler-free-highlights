'use server';

import { fetchFixtures } from '@/lib/ics';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const FIXTURES_FILE_PATH = path.join(process.cwd(), 'data', 'fixtures.json');

export async function updateFixtures() {
  try {
    console.log('Starting fixture update...');
    const fixtures = await fetchFixtures();

    if (fixtures.length === 0) {
      return { success: false, message: 'No fixtures found from any source.' };
    }

    await fs.writeFile(FIXTURES_FILE_PATH, JSON.stringify(fixtures, null, 2));
    
    revalidatePath('/');
    console.log(`Updated fixtures: ${fixtures.length} matches found.`);
    return { success: true, message: `Successfully updated ${fixtures.length} fixtures.` };
  } catch (error) {
    console.error('Failed to update fixtures:', error);
    return { success: false, message: 'Failed to update fixtures. Check server logs.' };
  }
}


