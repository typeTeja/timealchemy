'use client';

import { Input } from '@/components/ui/input';

export function PlaceAutoComplete({ formData, setFormData }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const place = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      place,
      lat: '12.9716',  // Replace with real geolocation API
      lon: '77.5946'
    }));
  };

  return (
    <Input
      placeholder="Place of Birth"
      value={formData.place}
      onChange={handleChange}
    />
  );
}
