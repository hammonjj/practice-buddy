import React, { ReactNode } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="card bg-surface/50 flex items-center gap-4">
      <div className="p-3 bg-primary/20 rounded-lg">
        <Icon className="text-primary h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-white/60">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}