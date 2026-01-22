import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon | React.ComponentType<any>;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    className?: string;
    onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    description,
    className,
    onClick
}) => {
    return (
        <Card
            className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <div className={cn(
                        "text-xs font-medium mt-1",
                        trend.isPositive ? "text-green-600" : "text-red-600"
                    )}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}% from last month
                    </div>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
