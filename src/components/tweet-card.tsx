"use client";

import { Clipboard, MoreHorizontal, Twitter, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";

interface Tweet {
  id: string;
  tweet: string;
}

interface TweetCardProps {
  tweet: Tweet;
  bg_color: string;
  editable?: boolean;
  onCopy?: () => void;
  onDelete?: (id: string) => void;
  onTwitterShare?: (id: string) => void;
  onBlueSkyShare?: (id: string) => void;
  onEdit?: (id: string, newContent: string) => void;
}

export function TweetCard({
  tweet,
  onDelete,
  onCopy,
  onTwitterShare,
  onBlueSkyShare,
  onEdit,
  editable = false,
  bg_color,
}: TweetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.tweet);

  const avatar_url = "https://unavatar.io/x/screen_pipe";

  return (
    <Card
      className="mb-4 overflow-hidden border-border/40"
      style={{ background: bg_color }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              className="bg-transparent"
              src={avatar_url}
              alt={"screenpipe avatar"}
            />
            <AvatarFallback>{"S"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Screenpipe</div>
            <div className="text-sm text-muted-foreground">
              @{"screen_pipe"}
            </div>
          </div>
        </div>
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
            <DropdownMenuItem onClick={() => onCopy?.()}>
              <Clipboard className="mr-2 size-5" />
              Copy text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {editable && (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Edit tweet
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              // className="gap-x-2"
              onClick={() => onTwitterShare?.(tweet.id)}
            >
              <Twitter className="mr-2 size-5 text-blue-600 fill-blue-700" />
              Share on Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBlueSkyShare?.(tweet.id)}>
              <X className="mr-2 size-5 text-blue-600 fill-blue-700" />
              Share on Bluesky
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(tweet.id)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 transition-all ease-in-out duration-300">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full p-2 rounded-md bg-transparent"
              value={editContent}
              autoCorrect="off"
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(tweet.tweet);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onEdit?.(tweet.id, editContent);
                  setIsEditing(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{tweet.tweet}</p>
        )}
      </CardContent>
    </Card>
  );
}
