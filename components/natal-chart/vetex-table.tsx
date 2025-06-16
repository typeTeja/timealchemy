'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { AstroRow, Planet } from './results-table'
import Papa from 'papaparse'

type Props = {
  onSubmitResult: (result: AstroRow) => void
}

export default function NatalChartDashboard({ onSubmitResult }: Props) {
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    place: '',
    latitude: '',
    longitude: '',
    zodiacType: 'tropical',
    coordinateSystem: 'geocentric',
    ayanamsa: 'lahiri',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.latitude || !form.longitude) {
      alert('Please fill all required fields.')
      return
    }

    const url = `https://api.hiteja.com/api/v1/vertex?date=${form.date}&time=${form.time}&latitude=${form.latitude}&longitude=${form.longitude}&elevation=0&house_system=P&ayanamsa=${form.ayanamsa}&zodiac_type=${form.zodiacType}&coordinate_system=${form.coordinateSystem}`           
    try {
      console.log('Fetching from URL:', url);
      const response = await fetch(url)
      const responseData = await response.json()
      console.log('API Response:', JSON.stringify(responseData, null, 2));

      // Access the nested data property from the response
      const data = responseData.data;
      if (!data || !data.planets || !Array.isArray(data.planets)) {
        console.error('Invalid planets data in API response:', data);
        throw new Error('Invalid planets data received from API');
      }

      const newResult: AstroRow = {
        name: form.name,
        date: form.date,
        time: form.time,
        place: form.place,
        planets: data.planets.map((planet: Planet) => ({
          name: planet.name,
          longitude: planet.longitude,
          latitude: planet.latitude,
          distance: planet.distance,
          speed_longitude: planet.speed_longitude,
          speed_latitude: planet.speed_latitude,
          speed_distance: planet.speed_distance,
          is_retrograde: planet.is_retrograde,
          apparent_longitude: planet.apparent_longitude,
          coordinate_system: planet.coordinate_system,
          is_heliocentric: planet.is_heliocentric,
          nearby_vertex: planet.nearby_vertex || false
        })),
        houses: data.houses,
        metadata: data.metadata
      };

      console.log('Mapped result:', newResult);

      onSubmitResult(newResult)

      setForm({
        name: '',
        date: '',
        time: '',
        place: '',
        latitude: '',
        longitude: '',
        zodiacType: 'sidereal',
        coordinateSystem: 'geocentric',
        ayanamsa: 'lahiri',
      })
    } catch (error) {
      console.error('Error fetching natal chart:', error)
    }
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (const row of results.data as any[]) {
          try {
            const year = row.Year
            const month = row.Month.padStart(2, '0')
            const day = row.Day.padStart(2, '0')
            const hour = row.Hour.padStart(2, '0')
            const min = row.Min.padStart(2, '0')
            const sec = row.Sec?.padStart(2, '0') || '00'

            const dateStr = `${year}-${month}-${day}`
            const timeStr = `${hour}:${min}:${sec}`

            const lat = row.Lat
            const lon = row.Lon
            const name = row.Name
            const place = row.Place

            //const url = `https://api.hiteja.com/api/v1/natal-chart?datetime_str=${datetimeStr}&lat=${lat}&lon=${lon}&zodiac_type=sidereal&coordinate_system=geocentric&ayanamsa=lahiri`
            // Using the new Vertex API endpoint
            const url = `https://web-production-5eab0.up.railway.app/api/v1/vertex?date=${dateStr}&time=${timeStr}&latitude=${lat}&longitude=${lon}&elevation=0&house_system=P&ayanamsa=LAHIRI&zodiac_type=sidereal&coordinate_system=geocentric`
            const response = await fetch(url)
            const responseData = await response.json()
            const data = responseData.data;

            if (!data || !data.planets || !Array.isArray(data.planets)) {
              console.error('Invalid planets data in API response from CSV:', data);
              return;
            }

            const newResult: AstroRow = {
              name: name || 'CSV Entry',
              date: `${year}-${month}-${day}`,
              time: `${hour}:${min}`,
              place: place,
              planets: data.planets.map((planet: Planet) => ({
                name: planet.name,
                longitude: planet.longitude,
                latitude: planet.latitude,
                distance: planet.distance,
                speed_longitude: planet.speed_longitude,
                speed_latitude: planet.speed_latitude,
                speed_distance: planet.speed_distance,
                is_retrograde: planet.is_retrograde,
                apparent_longitude: planet.apparent_longitude,
                coordinate_system: planet.coordinate_system,
                is_heliocentric: planet.is_heliocentric,
                nearby_vertex: planet.nearby_vertex || false
              })),
              houses: data.houses,
              metadata: data.metadata
            }

            onSubmitResult(newResult)
          } catch (err) {
            console.error('CSV row error:', err)
          }
        }
      },
    })
  }

  return (
    <Card className="w-full max-w-5xl mx-auto my-10">
      <CardHeader>
        <CardTitle>Enter Birth Details or Upload CSV</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
        </div>

        <div>
          <Label>Date of Birth</Label>
          <Input name="date" value={form.date} onChange={handleChange} placeholder="YYYY-MM-DD" />
        </div>

        <div>
          <Label>Time of Birth</Label>
          <Input name="time" value={form.time} onChange={handleChange} placeholder="HH:MM" />
        </div>

        <div>
          <Label>Place of Birth</Label>
          <Input name="place" value={form.place} onChange={handleChange} placeholder="City, Country" />
        </div>

        <div>
          <Label>Latitude</Label>
          <Input name="latitude" value={form.latitude} onChange={handleChange} placeholder="e.g. 12.9716" />
        </div>

        <div>
          <Label>Longitude</Label>
          <Input name="longitude" value={form.longitude} onChange={handleChange} placeholder="e.g. 77.5946" />
        </div>

        <div>
          <Label>Zodiac Type</Label>
          <Select value={form.zodiacType} onValueChange={(value) => setForm({ ...form, zodiacType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sidereal">Sidereal</SelectItem>
              <SelectItem value="tropical">Tropical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Coordinate System</Label>
          <Select value={form.coordinateSystem} onValueChange={(value) => setForm({ ...form, coordinateSystem: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heliocentric">Heliocentric</SelectItem>
              <SelectItem value="geocentric">Geocentric</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ayanamsa</Label>
          <Select value={form.ayanamsa} onValueChange={(value) => setForm({ ...form, ayanamsa: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lahiri">Lahiri</SelectItem>
              <SelectItem value="krishnamurti">Krishnamurti</SelectItem>
              <SelectItem value="raman">Raman</SelectItem>
              <SelectItem value="ushashashi">Ushashashi</SelectItem>
              <SelectItem value="yukteshwar">Yukteshwar</SelectItem>
              <SelectItem value="true_citra">True Citra</SelectItem>
              <SelectItem value="aryabhata">Aryabhata</SelectItem>
              <SelectItem value="suryasiddhanta">Suryasiddhanta</SelectItem>
              <SelectItem value="jangam">Jangam</SelectItem>
              <SelectItem value="fagan">Fagan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Button className="w-full" onClick={handleSubmit}>
            Calculate and Add
          </Button>
        </div>

        <div className="md:col-span-2">
          <Label className="block mb-2">Or Upload CSV File</Label>
          <Input type="file" accept=".csv" onChange={handleCSVUpload} />
        </div>
      </CardContent>
    </Card>
  )
}
