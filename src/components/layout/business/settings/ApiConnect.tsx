"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Edit, Save, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";
import useGetOrgz from "@/hooks/getOrgz";

type ApiInsert = Database["public"]["Tables"]["apis"]["Insert"];
type ApiUpdate = Database["public"]["Tables"]["apis"]["Update"];

interface ApiEntry {
  id: string;
  api_name: string;
  api_link: string;
  api_key?: string;
  isEditing?: boolean;
}

interface ApiResult {
  url: string;
  data: unknown;
}

export default function ApiConnect() {
  const supabase = createClient();
  const { orgz, loading: orgzLoading } = useGetOrgz();

  const [apiEntries, setApiEntries] = React.useState<ApiEntry[]>([]);
  const [resultAPI, setResultAPI] = React.useState<ApiResult[]>([]);
  const [generation, setGeneration] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load existing APIs on component mount
  React.useEffect(() => {
    if (orgz && orgz.length > 0) {
      loadApis();
      loadSavedAnalysis();
    }
  }, [orgz]);

  const loadApis = async () => {
    if (!orgz || orgz.length === 0) return;

    try {
      const { data: apis, error } = await supabase
        .from("apis")
        .select("*")
        .eq("organizations_id", orgz[0].id);

      if (error) {
        console.error("Error loading APIs:", error);
        return;
      }

      // Convert saved APIs to entries format
      const entries = (apis || []).map((api) => ({
        id: api.id,
        api_name: api.api_name || "",
        api_link: api.api_link || "",
        api_key: api.api_key || "",
        isEditing: false,
      }));

      setApiEntries(entries);
    } catch (error) {
      console.error("Error loading APIs:", error);
    }
  };

  const loadSavedAnalysis = () => {
    if (!orgz || orgz.length === 0) return;

    const currentOrg = orgz[0];
    const currentDataJson = currentOrg.data_json;

    if (
      currentDataJson &&
      typeof currentDataJson === "object" &&
      currentDataJson !== null &&
      !Array.isArray(currentDataJson)
    ) {
      const dataObj = currentDataJson as Record<string, unknown>;
      if (
        dataObj.apiAnalysis &&
        typeof dataObj.apiAnalysis === "object" &&
        dataObj.apiAnalysis !== null
      ) {
        const analysis = dataObj.apiAnalysis as {
          summary?: string;
          result?: string;
        };
        if (analysis.summary) {
          setGeneration(analysis.summary);
          console.log("Loaded saved AI analysis summary:", analysis.summary);
        } else if (analysis.result) {
          // Fallback for old format
          setGeneration(analysis.result);
          console.log(
            "Loaded saved AI analysis (old format):",
            analysis.result
          );
        }
      }
    }
  };

  const addNewEntry = () => {
    setApiEntries((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        api_name: "",
        api_link: "",
        api_key: "",
        isEditing: true,
      },
    ]);
  };

  const removeEntry = async (id: string) => {
    // If it's a temporary entry, just remove from state
    if (id.startsWith("temp-")) {
      setApiEntries((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }

    // If it's a saved entry, delete from database
    try {
      const { error } = await supabase.from("apis").delete().eq("id", id);

      if (error) {
        console.error("Error deleting API:", error);
        return;
      }

      // Remove from both states
      setApiEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting API:", error);
    }
  };

  const updateEntry = (
    id: string,
    field: "api_name" | "api_link" | "api_key",
    value: string
  ) => {
    setApiEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const toggleEdit = (id: string) => {
    setApiEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, isEditing: !entry.isEditing } : entry
      )
    );
  };

  const saveEntry = async (id: string) => {
    const entry = apiEntries.find((e) => e.id === id);
    if (!entry || !orgz || orgz.length === 0) return;

    setIsSaving(true);

    try {
      if (id.startsWith("temp-")) {
        // Insert new API
        const newApi: ApiInsert = {
          organizations_id: orgz[0].id,
          api_name: entry.api_name,
          api_link: entry.api_link,
          api_key: entry.api_key || null,
        };

        const { data, error } = await supabase
          .from("apis")
          .insert([newApi])
          .select()
          .single();

        if (error) {
          console.error("Error inserting API:", error);
          return;
        }

        // Update the entry with the real ID and remove editing state
        setApiEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, id: data.id, isEditing: false } : e
          )
        );
      } else {
        // Update existing API
        const updateData: ApiUpdate = {
          api_name: entry.api_name,
          api_link: entry.api_link,
          api_key: entry.api_key || null,
        };

        const { error } = await supabase
          .from("apis")
          .update(updateData)
          .eq("id", id);

        if (error) {
          console.error("Error updating API:", error);
          return;
        }

        // Update the entry and remove editing state
        setApiEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isEditing: false } : e))
        );
      }
    } catch (error) {
      console.error("Error saving API:", error);
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    const fetchApiData = async () => {
      const results = [];
      for (const entry of apiEntries) {
        if (entry.api_link && !entry.id.startsWith("temp-")) {
          try {
            const response = await fetch(entry.api_link, {
              headers: entry.api_key
                ? { Authorization: `Bearer ${entry.api_key}` }
                : undefined,
            });
            if (!response.ok) {
              console.error(
                `Error fetching ${entry.api_link}: ${response.statusText}`
              );
            } else {
              const data = await response.json();
              results.push({
                url: entry.api_link,
                data: data,
              });
            }
          } catch (error) {
            console.error("Fetch error:", error);
          }
        }
      }
      setResultAPI(results);
    };

    if (apiEntries.length > 0) {
      fetchApiData();
    }
  }, [apiEntries]);

  async function generateText() {
    setIsLoading(true);

    console.log("Sending to API:", resultAPI);

    // Only proceed if we have actual API results
    if (resultAPI.length === 0) {
      setGeneration(
        "No API data available. Please add and configure API endpoints first."
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/extract-api", {
        method: "POST",
        body: JSON.stringify({
          prompt: JSON.stringify(resultAPI),
        }),
      });

      const json = await response.json();
      let analysisResult = "";

      try {
        // Try to parse the response as JSON to extract summary
        const parsedResponse = JSON.parse(json.text);
        if (parsedResponse.summary) {
          analysisResult = parsedResponse.summary;
        } else {
          analysisResult = json.text;
        }
      } catch {
        // If parsing fails, display the raw text
        analysisResult = json.text;
      }

      setGeneration(analysisResult);
      console.log("AI Analysis Result:", analysisResult);

      // Save the AI analysis to the organization's data_json field
      if (orgz && orgz.length > 0) {
        const currentOrg = orgz[0];
        const currentDataJson = currentOrg.data_json || {};

        // Create the new data structure
        const updatedDataJson = {
          ...(typeof currentDataJson === "object" && currentDataJson !== null
            ? currentDataJson
            : {}),
          apiAnalysis: {
            timestamp: new Date().toISOString(),
            summary: analysisResult, // Store only the summary
            fullResult: json.text, // Store the full result separately
            apiData: resultAPI,
            apis: apiEntries
              .filter((entry) => !entry.id.startsWith("temp-"))
              .map((entry) => ({
                id: entry.id,
                name: entry.api_name,
                link: entry.api_link,
                hasKey: !!entry.api_key,
              })),
          },
        };

        // Update the organization's data_json field
        const { error: updateError } = await supabase
          .from("organizations")
          .update({ data_json: updatedDataJson })
          .eq("id", currentOrg.id);

        if (updateError) {
          console.error("Error saving AI analysis to database:", updateError);
          alert(
            "Analysis generated successfully, but failed to save to database."
          );
        } else {
          console.log("AI analysis saved to organization data_json");
        }
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      setGeneration("Error generating analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (orgzLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-7">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Event Data APIs</CardTitle>
            <CardDescription>
              Manage your API connections for event data. Add, edit, or remove
              API endpoints.
            </CardDescription>
          </div>
          <Button onClick={addNewEntry}>+ ADD API</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiEntries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-3 gap-4 p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <Label>API Name</Label>
                  <Input
                    placeholder="My Event API"
                    value={entry.api_name}
                    onChange={(e) =>
                      updateEntry(entry.id, "api_name", e.target.value)
                    }
                    disabled={!entry.isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <Label>API Link</Label>
                  <Input
                    placeholder="https://api.event.com/events"
                    value={entry.api_link}
                    onChange={(e) =>
                      updateEntry(entry.id, "api_link", e.target.value)
                    }
                    disabled={!entry.isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <Label>API Key (optional)</Label>
                  <Input
                    type="password"
                    placeholder="your-api-key"
                    value={entry.api_key}
                    onChange={(e) =>
                      updateEntry(entry.id, "api_key", e.target.value)
                    }
                    disabled={!entry.isEditing}
                  />
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  {entry.isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveEntry(entry.id)}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleEdit(entry.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleEdit(entry.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {apiEntries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No APIs configured. Click &quot;ADD API &quot; to get started.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={generateText}
            disabled={isLoading || apiEntries.length === 0}
          >
            Generate & Save AI Analysis
          </Button>
        </CardFooter>
      </Card>
      {generation && (
        <Card className="bg-transparent">
          <CardHeader>
            <CardTitle>AI Analysis Summary</CardTitle>
            <CardDescription>
              Summary of your API data analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              "Loading..."
            ) : (
              <p className="whitespace-pre-line">{generation}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
