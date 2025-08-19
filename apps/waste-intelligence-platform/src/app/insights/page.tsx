'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WasteCompany } from '@/types/waste'
import { formatNumber } from '@/lib/utils'
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	PieChart,
	Pie,
	Cell,
} from 'recharts'

type DistDatum = { name: string; value: number; percentage?: number }

async function fetchAllCompanies(): Promise<WasteCompany[]> {
	const url = `/api/waste-data?limit=1000&page=1`
	const res = await fetch(url)
	if (!res.ok) throw new Error('Failed to fetch companies')
	const body = await res.json()
	// Handle both array and { data } shapes
	return Array.isArray(body) ? (body as WasteCompany[]) : (body.data as WasteCompany[])
}

function toBands(value: number, bands: { label: string; min: number; max: number }[]) {
	const band = bands.find(b => value >= b.min && value < b.max)
	return band ? band.label : 'Other'
}

const RECYCLING_BANDS = [
	{ label: '0–25%', min: 0, max: 25 },
	{ label: '25–50%', min: 25, max: 50 },
	{ label: '50–75%', min: 50, max: 75 },
	{ label: '75–90%', min: 75, max: 90 },
	{ label: '90–100%', min: 90, max: 101 },
]

const COMPLIANCE_BANDS = [
	{ label: '0–60', min: 0, max: 60 },
	{ label: '60–75', min: 60, max: 75 },
	{ label: '75–90', min: 75, max: 90 },
	{ label: '90–100', min: 90, max: 101 },
]

const PIE_COLORS = ['#16a34a', '#2563eb', '#dc2626', '#ea580c', '#7c3aed', '#0ea5e9', '#65a30d']

export default function InsightsPage() {
	const [companies, setCompanies] = useState<WasteCompany[] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let isMounted = true
		;(async () => {
			try {
				setLoading(true)
				const all = await fetchAllCompanies()
				if (isMounted) setCompanies(all)
			} catch (e: any) {
				if (isMounted) setError(e.message || 'Failed to load data')
			} finally {
				if (isMounted) setLoading(false)
			}
		})()
		return () => {
			isMounted = false
		}
	}, [])

	const totalCompanies = companies?.length ?? 0

	const regionDist: DistDatum[] = useMemo(() => {
		if (!companies) return []
		const counts = companies.reduce<Record<string, number>>((acc, c) => {
			const key = c.region || 'Unknown'
			acc[key] = (acc[key] || 0) + 1
			return acc
		}, {})
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([name, value]) => ({ name, value, percentage: (value / totalCompanies) * 100 }))
	}, [companies, totalCompanies])

	const streamDist: DistDatum[] = useMemo(() => {
		if (!companies) return []
		const counts = companies.reduce<Record<string, number>>((acc, c) => {
			const key = c.wasteType || 'Unknown'
			acc[key] = (acc[key] || 0) + 1
			return acc
		}, {})
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([name, value]) => ({ name, value, percentage: (value / totalCompanies) * 100 }))
	}, [companies, totalCompanies])

	const recyclingBandDist: DistDatum[] = useMemo(() => {
		if (!companies) return []
		const counts = companies.reduce<Record<string, number>>((acc, c) => {
			const label = toBands(c.recyclingRate ?? 0, RECYCLING_BANDS)
			acc[label] = (acc[label] || 0) + 1
			return acc
		}, {})
		return RECYCLING_BANDS.map(b => ({
			name: b.label,
			value: counts[b.label] || 0,
			percentage: totalCompanies ? ((counts[b.label] || 0) / totalCompanies) * 100 : 0,
		}))
	}, [companies, totalCompanies])

	const complianceBandDist: DistDatum[] = useMemo(() => {
		if (!companies) return []
		const counts = companies.reduce<Record<string, number>>((acc, c) => {
			const label = toBands(c.complianceScore ?? 0, COMPLIANCE_BANDS)
			acc[label] = (acc[label] || 0) + 1
			return acc
		}, {})
		return COMPLIANCE_BANDS.map(b => ({
			name: b.label,
			value: counts[b.label] || 0,
			percentage: totalCompanies ? ((counts[b.label] || 0) / totalCompanies) * 100 : 0,
		}))
	}, [companies, totalCompanies])

	if (loading) {
		return (
			<div className="p-6">
				<Card>
					<CardHeader>
						<CardTitle>Company Distributions</CardTitle>
					</CardHeader>
					<CardContent>Loading...</CardContent>
				</Card>
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-6">
				<Card>
					<CardHeader>
						<CardTitle>Error</CardTitle>
					</CardHeader>
					<CardContent className="text-red-600">{error}</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-baseline justify-between">
				<h1 className="text-2xl font-semibold">Company Distributions</h1>
				<p className="text-sm text-gray-600">{formatNumber(totalCompanies)} companies</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>By Region (count)</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={regionDist}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" fontSize={12} angle={-30} textAnchor="end" height={60} />
								<YAxis fontSize={12} allowDecimals={false} />
								<Tooltip formatter={(v: any, n: any, p: any) => [v, 'Companies']} />
								<Bar dataKey="value" fill="#2563eb" radius={[4,4,0,0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>By Waste Stream (count)</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie data={streamDist} dataKey="value" nameKey="name" outerRadius={110}>
									{streamDist.map((_, i) => (
										<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
									))}
								</Pie>
								<Tooltip formatter={(v: any) => [v, 'Companies']} />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Recycling Rate Bands</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={recyclingBandDist}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" fontSize={12} />
								<YAxis fontSize={12} allowDecimals={false} />
								<Tooltip formatter={(v: any) => [v, 'Companies']} />
								<Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Compliance Score Bands</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={complianceBandDist}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" fontSize={12} />
								<YAxis fontSize={12} allowDecimals={false} />
								<Tooltip formatter={(v: any) => [v, 'Companies']} />
								<Bar dataKey="value" fill="#f59e0b" radius={[4,4,0,0]} />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<p className="text-xs text-gray-500">Notes: Distributions are by company count. Percentages are of total companies loaded.</p>
		</div>
	)
}

