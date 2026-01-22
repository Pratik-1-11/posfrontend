import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface SalesTrendData {
    displayDate: string;
    amount: number;
    orders: number;
    [key: string]: any;
}

interface SalesTrendChartProps {
    data: SalesTrendData[];
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" /> Sales & Orders Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontWeight: 600, fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontWeight: 600, fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontWeight: 600, fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                yAxisId="left"
                                dataKey="amount"
                                name="Sales (Rs.)"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="orders"
                                name="Total Orders"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
