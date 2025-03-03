import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SettingsProps } from "@/lib/settings";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";

const fetchSettings = async () => {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }
  return response.json() as Promise<SettingsProps>;
};

const updateSettings = async (newSettings: SettingsProps) => {
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSettings),
  });
  if (!response.ok) {
    throw new Error("Failed to update settings");
  }
  return response.json();
};

function SettingsPage() {
  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
  });

  const [provider, setProvider] = useState("google");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [mood, setMood] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      setProvider(settings.provider || "google");
      setApiKey(settings?.apiKey || "");
      setModel(settings?.model || "");
      setMood(settings?.mood || "");
    }
  }, [settings]);

  useEffect(() => {
    setModel("");
    setApiKey("");
  }, [provider]);

  useEffect(() => {
    if (mutation.data) {
      console.log("Saved settings", mutation.data);
    }
  }, [mutation.data]);

  const handleSave = () => {
    if (!model) {
      toast({
        title: "Error:",
        description: "Please select a model",
        variant: "destructive",
      });
      return;
    }

    if (provider !== "ollama" && !apiKey) {
      toast({
        title: "Error:",
        description: "API key is required for this provider",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      provider: provider as any,
      model,
      // @ts-expect-error
      apiKey: provider === "ollama" ? null : apiKey,
      mood,
    });

    toast({
      title: "Settings:",
      description: "settings has been updated.",
      variant: "default",
    });
  };

  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center mt-8">
        <p>Loading...</p>
      </div>
    );
  if (isError) return <p>Error loading settings</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Config</CardTitle>
        <CardDescription>
          Configure AI model and API credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="provider">AI Provider</Label>
          <RadioGroup
            id="provider"
            name="provider"
            value={provider}
            onValueChange={(value) => setProvider(value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai">OpenAI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="google" id="google" />
              <Label htmlFor="google">Google</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ollama" id="ollama" />
              <Label htmlFor="ollama">Ollama</Label>
            </div>
          </RadioGroup>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            name="model"
            placeholder="Enter model identifier"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
        {provider !== "ollama" && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${
                provider === "openai" ? "OpenAI" : "Google"
              } API key`}
            />
            <p className="text-sm text-muted-foreground">
              {provider === "openai"
                ? "Your OpenAI API key can be found in your OpenAI dashboard."
                : "Your Gemini API key can be found at https://ai.google.dev/."}
            </p>
          </div>
        )}
        {provider === "ollama" && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Ollama doesn't require an API key. Just select your model and
              ensure Ollama is running locally.
            </p>
          </div>
        )}
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="mood" className="text-base tracking-tight">
            Tweet Mood
          </Label>
          <p className="text-sm text-muted-foreground tracking-tighter">
            Future tweets will be based on this mood.
          </p>
          <Input
            name="mood"
            placeholder="Use comma separated values eg funny, informative"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        {!mutation.isPending && (
          <Button size="sm" onClick={handleSave} className="ml-auto">
            <Save className="mr-2 h-4 w-4" />
            Update
          </Button>
        )}
        {mutation.isPending && (
          <Button size="sm" disabled className="ml-auto">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default SettingsPage;
