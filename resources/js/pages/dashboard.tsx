import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface ChartDataAPI {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
    }[];
}

interface ChartDataItem {
    name: string;
    [key: string]: string | number; // allow dynamic keys
}

export default function Dashboard() {
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [datasets, setDatasets] = useState<ChartDataAPI['datasets']>([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/chartData')
            .then((res) => res.json())
            .then((data: ChartDataAPI) => {
                const transformed: ChartDataItem[] = data.labels.map((label, index) => {
                    const obj: ChartDataItem = { name: label };
                    data.datasets.forEach((ds) => {
                        obj[ds.label] = ds.data[index];
                    });
                    return obj;
                });

                setChartData(transformed);
                setDatasets(data.datasets);
            })
            .catch((err) => console.error('Failed to fetch chart data:', err));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* Title */}
                <h2 className="text-xl font-semibold mb-2">Transaksi Harian</h2>

                {/* Smaller chart container */}
                <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {datasets.map((ds) => (
                                <Bar
                                    key={ds.label}
                                    dataKey={ds.label}
                                    fill={ds.backgroundColor}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AppLayout>
    );
}
