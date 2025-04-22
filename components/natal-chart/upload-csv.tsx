'use client';

import { Input } from '@/components/ui/input';

export function UploadCSV({ onUpload }: { onUpload: (file: File) => void }) {
  return (
    <Input
      type="file"
      accept=".csv"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          onUpload(e.target.files[0]);
        }
      }}
    />
  );
}
