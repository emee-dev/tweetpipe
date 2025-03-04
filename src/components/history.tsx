import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCopy } from "@/hooks/use-copy";
import { Storage } from "@/lib/cron_config";
import {
  generateBlueskyShareUrl,
  generateTwitterShareUrl,
  randomGradient,
} from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { useEffect } from "react";
import { TweetCard } from "./tweet-card";

const assignColors = (history: [Storage]) => {
  return Object.fromEntries(
    Object.entries(history).map(([timestamp, { tweets }]) => [
      timestamp,
      {
        tweets: tweets?.map((tweet: any) => ({
          ...tweet,
          bg_color: randomGradient(),
        })),
      },
    ])
  );
};

const getPreviousTweets = async () => {
  const req = await fetch("/api/tweet");

  if (!req.ok) {
    throw new Error(await req.text());
  }
  const res: History = await req.json();

  if (!res) {
    throw new Error("Failed to load previous tweets.");
  }

  if (Object.keys(res.history).length === 0) {
    return null;
  }

  return res;
};

type History = { history: Storage };

const HistoryPage = () => {
  const { toast } = useToast();
  const { copyToClipboard } = useCopy();

  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["history"],
    queryFn: getPreviousTweets,
  });

  useEffect(() => {
    if (error) {
      console.log(error);
      toast({
        title: "Error: ",
        description: "There was an error fetching history.",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center mt-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoading && !history?.history) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available.
      </div>
    );
  }

  return (
    <div>
      <header className="mb-4 px-2">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Catch all the tweets you missed
          </p>

          <div className="ml-auto gap-x-2 flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCcw
                className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {!isLoading && history?.history && (
        <div className="space-y-4 p-4">
          {history?.history &&
            Object.entries(assignColors(history.history as any)).map(
              ([timestamp, { tweets }]) => (
                <div
                  key={timestamp}
                  className="border p-4 rounded-lg shadow-md"
                >
                  <h2 className="text-lg tracking-tighter font-semibold text-gray-800 font-mono">
                    {new Date(timestamp).toLocaleString()}
                  </h2>
                  <div className="space-y-4 transition-all ease-in-out duration-300 mt-2">
                    {tweets ? (
                      tweets?.map((item) => {
                        return (
                          <TweetCard
                            key={item.id}
                            tweet={item}
                            bg_color={item.bg_color}
                            onCopy={() => copyToClipboard(item.tweet)}
                            onTwitterShare={() => {
                              const shareUrl = generateTwitterShareUrl({
                                text: item.tweet,
                                hashtags: ["screenpipe"],
                              });

                              window.open(shareUrl, "_blank");
                            }}
                            onBlueSkyShare={() => {
                              const shareUrl = generateBlueskyShareUrl({
                                text: item.tweet,
                              });

                              window.open(shareUrl, "_blank");
                            }}
                          />
                        );
                      })
                    ) : (
                      <div>No history to load</div>
                    )}
                  </div>
                </div>
              )
            )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
