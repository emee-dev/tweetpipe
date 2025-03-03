"use client";

import HistoryPage from "@/components/history";
import SettingsPage from "@/components/settings";
import { Sidebar } from "@/components/sidebar";
import TweetList from "@/components/tweet-list";
import { pipe } from "@screenpipe/browser";
import { Instagram, Twitter } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

type Tabs = "social" | "settings" | "history";
type PageProps = {
  params: Promise<any>;
  searchParams: Promise<{ tab: Tabs } | undefined>;
};

export default function SearchPage({ searchParams }: PageProps) {
  const [currentTable, setCurrentTable] = useState<Tabs>("" as Tabs);

  const getSearchParams = async () => {
    const table = await searchParams;

    if (table?.tab) {
      setCurrentTable(table.tab);
    } else {
      setCurrentTable("social");
    }
  };

  useEffect(() => {
    getSearchParams();
    pipe.captureMainFeatureEvent("data-table");
  }, []);

  return (
    <div className="flex h-full mt-4">
      <div className="w-[20%]">
        <Suspense fallback={<div>Loading layout...</div>}>
          <Sidebar
            currentTable={currentTable as string}
            onTableSelect={setCurrentTable as any}
          />
        </Suspense>
      </div>
      <div className="flex flex-col w-full px-4">
        <div className="text-xl font-bold mt-8 flex items-center px-1">
          Tweetpipe{" "}
          <div className="border border-black/50 flex items-center ml-2 h-7 px-1 rounded-lg">
            <Twitter className="size-5 text-blue-600 fill-blue-700" />
            <Instagram className="ml-3 size-5 text-orange-500" />
          </div>
        </div>
        <div className="pt-[50px]">
          <div className="w-full">
            {currentTable === "social" && <TweetList />}
            {currentTable === "settings" && <SettingsPage />}
            {currentTable === "history" && <HistoryPage />}
            {!currentTable && (
              <div className="w-full flex items-center justify-center mt-8">
                <p>Loading layout...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
