"use client";

import DataTable from "@/components/table";
import { TweetCard } from "@/components/tweet-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useOCRData from "@/hooks/use-ocr-data";
import useTweet from "@/hooks/use-tweet";
import {
  generateBlueskyShareUrl,
  generateTwitterShareUrl,
  randomGradient,
} from "@/lib/utils";
import { MessageSquare, MoreHorizontal, RefreshCcw, Table } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tweet = { id: string; tweet: string; bg_color: string };

export default function TweetBoard() {
  const [pageSize] = useState(9);
  const [pageIndex] = useState(0);
  const [textFilter] = useState("");
  const [appFilter] = useState("");
  const [isTable, setIsTable] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [displayedTweets, setDisplayedTweets] = useState<Tweet[]>([]);

  const {
    data: chunks,
    isPending: isTablePending,
    error: tableError,
    mutate: refreshTableData,
  } = useOCRData(pageIndex, pageSize, textFilter, appFilter);

  const {
    data: aiTweet,
    isPending: isTweetPending,
    error: tweetError,
    mutate: fetchTweets,
  } = useTweet();

  useEffect(() => {
    refreshTableData();
  }, [refreshTableData]);

  useEffect(() => {
    if (chunks?.data && chunks.data.length > 0) {
      fetchTweets(chunks.data);
    }
  }, [chunks, fetchTweets]);

  useEffect(() => {
    if (aiTweet && aiTweet.length > 0) {
      setDisplayedTweets(
        aiTweet.map((item) => ({ ...item, bg_color: randomGradient() }))
      );
    }
  }, [aiTweet]);

  const handleRefresh = useCallback(() => {
    if (isTable) {
      refreshTableData();
    } else {
      if (chunks?.data) {
        fetchTweets(chunks.data);
      } else {
        toast({
          title: "Tweet error:",
          description: "Tweet generation failed, reload table and try again.",
          // variant: "destructive",
        });
      }
    }
  }, [isTable, refreshTableData, fetchTweets, chunks?.data]);

  const handleEdit = useCallback((id: string, newContent: string) => {
    setDisplayedTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.id === id ? { ...tweet, tweet: newContent } : tweet
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDisplayedTweets((prevTweets) =>
      prevTweets.filter((tweet) => tweet.id !== id)
    );
  }, []);

  const toggleView = useCallback((tableView: boolean) => {
    setIsTable(tableView);
  }, []);

  const renderError = useCallback((error: Error | null) => {
    if (!error) return null;

    return (
      <div className="w-full flex items-center justify-center text-muted-foreground">
        <span>There was a problem: {error.message}.</span>
      </div>
    );
  }, []);

  const renderLoading = useMemo(
    () => (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="w-full h-32 rounded-lg" />
        ))}
      </div>
    ),
    []
  );

  return (
    <div className="container mx-auto py-4">
      <header className="mb-4 px-2">
        <div className="flex justify-between items-center">
          <div className=" flex items-center gap-x-2">
            <span className="text-muted-foreground">You are viewing:</span> (
            {isTable ? (
              <div className="flex items-center">
                <Table className="size-4 mr-2" />
                Table
              </div>
            ) : (
              <div className="flex items-center">
                <MessageSquare className="size-4 mr-2" />
                Tweets
              </div>
            )}
            )
          </div>

          <div className="ml-auto gap-x-2 flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isTablePending || isTweetPending}
              title="Refresh data"
            >
              <RefreshCcw
                className={`size-4 ${
                  isTablePending || isTweetPending ? "animate-spin" : ""
                }`}
              />
              <span className="sr-only">Refresh</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleView(true)}>
                  <Table className="h-4 w-4 mr-2" />
                  Show table
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleView(false)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Show tweets
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Table View */}
      {isTable && (
        <>
          {tableError && renderError(tableError)}

          {isTablePending ? (
            renderLoading
          ) : chunks?.data && chunks.data.length > 0 ? (
            <div>
              <DataTable data={chunks.data} />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No data available. Try refreshing or adjusting your filters.
            </div>
          )}
        </>
      )}

      {/* Tweet Cards View */}
      {!isTable && (
        <>
          {tweetError && renderError(tweetError)}

          {isTweetPending ? (
            renderLoading
          ) : displayedTweets && displayedTweets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-all ease-in-out duration-300">
              {displayedTweets.map((item) => (
                <TweetCard
                  editable
                  key={item.id}
                  tweet={item}
                  bg_color={item.bg_color}
                  onDelete={() => handleDelete(item.id)}
                  onCopy={() => console.log(item.tweet)}
                  onTwitterShare={() => {
                    const shareUrl = generateTwitterShareUrl({
                      text: item.tweet,
                      hashtags: ["screen_pipe", "tweetpipe"],
                    });

                    router.push(shareUrl);
                  }}
                  onBlueSkyShare={() => {
                    const shareUrl = generateBlueskyShareUrl({
                      text: item.tweet,
                    });
                    router.push(shareUrl);
                  }}
                  onEdit={(newContent) => handleEdit(item.id, newContent)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tweets to display. Try refreshing or generating new tweets.
            </div>
          )}
        </>
      )}
    </div>
  );
}
