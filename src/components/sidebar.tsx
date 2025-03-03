"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database, History, LucideProps, Settings } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface TableItem {
  name: string;
  displayName: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}

const tables: TableItem[] = [
  {
    name: "social",
    displayName: "Tweets",
    icon: Database,
  },
  {
    name: "history",
    displayName: "History",
    icon: History,
  },
  {
    name: "settings",
    displayName: "Settings",
    icon: Settings,
  },
];

interface SidebarProps {
  currentTable: string;
  onTableSelect: (table: string) => void;
}

export function Sidebar({ currentTable, onTableSelect }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const updateTab = (tab: string) => {
    const params = new URLSearchParams(search.toString());

    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);

    onTableSelect(tab);
  };

  return (
    <div className="pb-12 w-64 border-r">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Sources</h2>
          <div className="space-y-1">
            {tables.map(({ displayName, icon: Icon, name }) => (
              <Button
                key={name}
                variant={currentTable === name ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  currentTable === name && "bg-muted"
                )}
                onClick={() => updateTab(name)}
              >
                <Icon
                  className={`h-4 w-4 ${
                    currentTable === name
                      ? "text-blue-600"
                      : "text-muted-foreground/80"
                  }`}
                />
                <span className="ml-2">{displayName}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
