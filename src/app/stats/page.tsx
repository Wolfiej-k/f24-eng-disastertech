"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from "recharts";

interface ContainerStats {
  status: string;
  cpu: {
    percent: number;
  };
  memory: {
    usage_mb: number;
    limit_mb: number;
    percent: number;
  };
}

interface Stats {
  timestamp: string;
  containers: Record<string, ContainerStats>;
}

const COLORS = ["#9CAF88", "#d3d3d3"];

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = await getUser();
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/stats`, {
          headers: {
            Authorization: `Bearer ${user?.access}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <TypographyP>Error loading stats.</TypographyP>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="p-6">
        <TypographyP>Loading...</TypographyP>
      </div>
    );
  }

  return (
    <div className="p-6">
      <p className="text-sm leading-tight text-gray-500">Fetched: {new Date(stats.timestamp).toLocaleString()}</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(stats.containers).map(([name, container]) => (
          <Card key={name} className="mt-3">
            <CardHeader>
              <CardTitle className="font-bold">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <TypographyP className="mb-0 leading-tight">
                    <span className="font-semibold">Status: </span>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-white ${container.status === "running" ? "bg-primary" : "bg-destructive"}`}
                    >
                      {container.status}
                    </span>
                  </TypographyP>
                  <TypographyP className="mb-0 leading-tight">
                    <span className="font-semibold">CPU Usage:</span> {container.cpu.percent}%
                  </TypographyP>
                  <TypographyP className="mb-0 leading-tight">
                    <span className="font-semibold">Memory Usage:</span> {container.memory.percent}%
                  </TypographyP>
                </div>
                <div className="mr-4 flex gap-2">
                  <div className="flex flex-col justify-start text-center">
                    <h3 className="mb-0 font-semibold">CPU (%)</h3>
                    <PieChart width={200} height={200}>
                      <Pie
                        data={[
                          { name: "Used", value: container.cpu.percent },
                          { name: "Free", value: 100 - container.cpu.percent },
                        ]}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </div>
                  <div className="flex flex-col justify-start text-center">
                    <h3 className="mb-0 font-semibold">Memory (MB)</h3>
                    <PieChart width={200} height={200}>
                      <Pie
                        data={[
                          { name: "Used", value: container.memory.usage_mb },
                          { name: "Free", value: (container.memory.limit_mb - container.memory.usage_mb).toFixed(2) },
                        ]}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
