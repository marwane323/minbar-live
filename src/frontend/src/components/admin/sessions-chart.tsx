"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Jan", sessions: 4 },
  { name: "Feb", sessions: 6 },
  { name: "Mar", sessions: 8 },
  { name: "Apr", sessions: 12 },
  { name: "May", sessions: 16 },
  { name: "Jun", sessions: 24 },
];

export function SessionsChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`} 
          />
          <Tooltip 
            cursor={{ fill: '#1a1a1e' }}
            contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f3f4f6' }}
          />
          <Bar dataKey="sessions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
