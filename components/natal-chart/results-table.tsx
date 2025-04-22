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
  retrograde: boolean
  near_vertex: boolean
}

export type AstroRow = {
  name: string
  date: string
  time: string
  place: string
  planets: Planet[]
}

type Props = {
  data: AstroRow[]
}

export default function ResultsTable({ data }: Props) {
  const exportToCSV = () => {
    const headers = ['Name', 'Date', 'Time', 'Place', ...data[0].planets.map(p => p.name), 'Nearby Planets']
    const rows = data.map(row => {
      const nearby = row.planets.filter(p => p.near_vertex).map(p => p.name).join(', ')
      const planetValues = row.planets.map(p => p.longitude.toFixed(2))
      return [row.name, row.date, row.time, row.place, ...planetValues, nearby]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'natal_chart_results.csv')
  }

  if (data.length === 0) return null

  const planetNames = data[0].planets.map(p => p.name)

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
              {planetNames.map(p => (
                <TableHead key={p}>{p}</TableHead>
              ))}
              <TableHead>Nearby Planets Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => {
              const nearbyPlanets = row.planets.filter(p => p.near_vertex).map(p => p.name)
              return (
                <TableRow key={i}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.place}</TableCell>
                  {row.planets.map((planet, j) => (
                    <TableCell
                      key={j}
                      className={planet.near_vertex ? 'bg-yellow-100 font-semibold' : ''}
                    >
                      {planet.longitude.toFixed(2)}
                    </TableCell>
                  ))}
                  <TableCell>{nearbyPlanets.join(', ')}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
