export async function calculateNatalChart(params: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`http://localhost:8000/api/v1/natal-chart?${query}`);
    if (!res.ok) return null;
    return await res.json();
  }
  