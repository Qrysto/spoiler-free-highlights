'use client';

import { updateFixtures } from '@/actions/update-fixtures';
import { RefreshCw } from 'lucide-react';
import { useTransition } from 'react';

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const result = await updateFixtures();
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm border border-transparent dark:border-gray-700"
    >
      <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Updating...' : 'Refresh Fixtures'}
    </button>
  );
}

