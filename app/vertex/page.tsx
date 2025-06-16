'use client'

import { useState } from 'react'
// import NatalChartDashboard from '@/components/natal-chart/dashboard2'
import NatalChartDashboard from '@/components/natal-chart/vetex-table'
import ResultsTable, { AstroRow } from '@/components/natal-chart/results-table'

export default function NatalChartPage() {
  const [results, setResults] = useState<AstroRow[]>([])

  const handleAddResult = (newResult: AstroRow) => {
    setResults((prev) => [...prev, newResult])
  }

  return (
    <main className="container max-w-7xl mx-auto py-10 px-4">
      <NatalChartDashboard onSubmitResult={handleAddResult} />
      {results.length > 0 && <ResultsTable data={results} />}
    </main>
  )
}
