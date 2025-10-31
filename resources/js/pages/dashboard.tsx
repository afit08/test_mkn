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
    PieChart,
    Pie,
    Cell
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

interface PieDataItem {
    name: string;
    value: number;
    fill: string;
    [key: string]: string | number; // untuk kompatibilitas dengan Recharts
}


export default function Dashboard() {
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [datasets, setDatasets] = useState<ChartDataAPI['datasets']>([]);
    const [pieChartData, setPieChartData] = useState<PieDataItem[]>([]);

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

    // Fetch pie chart data (Stok Barang)
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/chart/stok-pie')
            .then((res) => res.json())
            .then((result) => {
                if (result.status && result.data) {
                    const transformed: PieDataItem[] = result.data.labels.map(
                        (label: string, index: number) => {
                            const value = result.data.datasets[0].data[index];
                            const fill =
                                result.data.datasets[0].backgroundColor[
                                index % result.data.datasets[0].backgroundColor.length
                                ];
                            return { name: label, value, fill };
                        }
                    );
                    setPieChartData(transformed);
                }
            })
            .catch((err) => console.error('Failed to fetch pie chart data:', err));
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

                {/* Pie Chart */}
                <h2 className="text-xl font-semibold mt-6 mb-2">Stok Barang</h2>
                <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {pieChartData.map((entry: PieDataItem, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AppLayout>
    );
}
