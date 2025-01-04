import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Document } from "./schema";

interface SearchesChartProps {
  documents: Document[];
}

export default function SearchesChart({ documents }: SearchesChartProps) {
  const config = {
    searches: {
      label: "Searches",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardContent>
        <ChartContainer config={config} className="h-[600px] w-full px-2 py-6">
          <BarChart accessibilityLayer data={getMostSearched(documents, 8)}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="title" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="searches" fill="var(--color-searches)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function getMostSearched(docs: Document[], n: number) {
  const heap: Document[] = [];

  for (const doc of docs) {
    if (heap.length < n) {
      heap.push(doc);
      heap.sort((a, b) => a.searches - b.searches);
    } else if (doc.searches > heap[0].searches) {
      heap[0] = doc;
      heap.sort((a, b) => a.searches - b.searches);
    }
  }

  return heap.toReversed();
}
