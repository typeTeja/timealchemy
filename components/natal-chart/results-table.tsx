'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { saveAs } from 'file-saver'

export type Planet = {
  name: string
  longitude: number
  latitude: number
  distance: number
  speed_longitude: number
  speed_latitude: number
  speed_distance: number
  is_retrograde: boolean
  apparent_longitude: number
  coordinate_system: string
  is_heliocentric: boolean
  nearby_vertex: boolean
}

export type AstroRow = {
  name: string
  date: string
  time: string
  place: string
  planets: Planet[]
  houses?: {
    cusps: Array<{house: number, longitude: number}>
    angles: {
      ascendant: number
      mc: number
      armc: number
      vertex: number
      equatorial_ascendant: number
    }
  }
  metadata?: {
    date: string
    time: string
    julian_day: number
    location: {
      latitude: number
      longitude: number
      elevation: number
    }
    house_system: string
    ayanamsa: string
    ayanamsa_value: number
    zodiac_type: string
    coordinate_system: string
  }
}

type Props = {
  data: AstroRow[]
}

export default function ResultsTable({ data }: Props) {
  const exportToCSV = () => {
    const headers = ['Name', 'Date', 'Time', 'Place', ...data[0].planets.map(p => p.name), 'Nearby Planets']
    const rows = data.map(row => {
      const nearby = row.planets.filter(p => p.nearby_vertex).map(p => p.name).join(', ')
      const planetValues = row.planets.map(p => p.longitude.toFixed(2))
      return [row.name, row.date, row.time, row.place, ...planetValues, nearby]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'natal_chart_results.csv')
  }

  if (!data || data.length === 0) {
    console.log('No data provided to ResultsTable')
    return null
  }

  // Debug log to check the incoming data structure
  console.log('ResultsTable received data:', JSON.stringify(data, null, 2))

  // Safely get planet names from the first valid data entry
  const planetNames = (() => {
    const firstValidEntry = data.find(entry => entry?.planets?.length > 0)
    const names = firstValidEntry?.planets?.map(p => p.name) || []
    console.log('Planet names extracted:', names)
    return names
  })()

  return (
    <Card className="mt-10">
      <CardContent className="overflow-auto">
        <div className="flex justify-end py-4">
          <Button onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Place</TableHead>
              {planetNames.length > 0 ? (
                planetNames.map(p => (
                  <TableHead key={p}>{p}</TableHead>
                ))
              ) : (
                <TableHead colSpan={12} className="text-center">No planetary data available</TableHead>
              )}
              <TableHead>Asc</TableHead>
              <TableHead>MC</TableHead>
              <TableHead>ARMC</TableHead>
              <TableHead>Vertex</TableHead>
              <TableHead>Nearby Planets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => {
              if (!row.planets) {
                console.warn(`Row ${i} has no planets data:`, row)
                return null
              }
              
              const nearbyPlanets = row.planets.filter(p => p.nearby_vertex).map(p => p.name);
              console.log(`Row ${i} nearby planets:`, nearbyPlanets);
              
              return (
                <TableRow key={i}>
                  <TableCell>{row.name || 'N/A'}</TableCell>
                  <TableCell>{row.date || 'N/A'}</TableCell>
                  <TableCell>{row.time || 'N/A'}</TableCell>
                  <TableCell>{row.place || 'N/A'}</TableCell>
                  
                  {row.planets?.length > 0 ? (
                    row.planets.map((planet, j) => (
                      <TableCell
                        key={`${planet.name}-${j}`}
                        className={planet.nearby_vertex ? 'bg-yellow-100 font-semibold' : ''}
                        title={`Lat: ${planet.latitude.toFixed(2)}° | Dist: ${planet.distance.toFixed(2)}`}
                      >
                        <div className="flex flex-col">
                          <span>{planet.longitude.toFixed(2)}°</span>
                          {planet.is_retrograde && (
                            <span className="text-xs text-red-500">R</span>
                          )}
                        </div>
                      </TableCell>
                    ))
                  ) : (
                    <TableCell colSpan={planetNames.length || 12} className="text-center">
                      No planetary data
                    </TableCell>
                  )}
                  
                  <TableCell>
                    {row.houses?.angles?.ascendant ? `${row.houses.angles.ascendant.toFixed(2)}°` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {row.houses?.angles?.mc ? `${row.houses.angles.mc.toFixed(2)}°` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {row.houses?.angles?.armc ? `${row.houses.angles.armc.toFixed(2)}°` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {row.houses?.angles?.vertex ? `${row.houses.angles.vertex.toFixed(2)}°` : 'N/A'}
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {nearbyPlanets.length > 0 ? nearbyPlanets.join(', ') : 'None'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
