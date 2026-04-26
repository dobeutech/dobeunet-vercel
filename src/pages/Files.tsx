import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { Download, FileText, Image, File, AlertTriangle } from "lucide-react";

interface ClientFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  storage_bucket: string;
  created_at: string;
  expires_at: string;
  project_id: string | null;
}

export default function Files() {
  const { user, getAccessToken } = useAuth();
  const api = useApi();
  const { toast } = useToast();
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);

  const RETENTION_DAYS = 1095; // 3 years

  const fetchFiles = useCallback(async () => {
    if (!user) return;

    try {
      const data = await api.get<ClientFile[]>("/files");
      setFiles(data || []);
      const totalSize = (data || []).reduce(
        (sum, file) => sum + (file.file_size || 0),
        0,
      );
      setStorageUsed(totalSize);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [user, api, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file: ClientFile) => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/files?id=${file.id}&download=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (fileType.includes("pdf") || fileType.includes("document"))
      return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getRetentionStatus = (createdAt: string, expiresAt: string) => {
    const daysOld = differenceInDays(new Date(), new Date(createdAt));
    const daysRemaining = differenceInDays(new Date(expiresAt), new Date());
    const progress = (daysOld / RETENTION_DAYS) * 100;

    return { daysOld, daysRemaining, progress };
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Files</h1>
          <p className="text-xl text-muted-foreground">
            Access contracts, documents, and project files
          </p>
        </div>

        <Card className="shadow-material mb-8">
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
            <CardDescription>
              Files are retained for 3 years from upload date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total Files</span>
                <span className="font-semibold">{files.length} files</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-semibold">
                  {formatFileSize(storageUsed)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Files automatically expire 3 years after upload. Download
                important files before expiration.
              </p>
            </div>
          </CardContent>
        </Card>

        {files.length === 0 ? (
          <Card className="shadow-material">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No files uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {files.map((file) => {
              const retention = getRetentionStatus(
                file.created_at,
                file.expires_at,
              );
              const isExpiringSoon = retention.daysRemaining < 30;

              return (
                <Card key={file.id} className="shadow-material">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent rounded-lg">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {file.file_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.file_size)} • Uploaded{" "}
                              {format(new Date(file.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDownload(file)}
                            size="sm"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                        <div className="space-y-2 mt-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {retention.daysOld} days old •{" "}
                              {retention.daysRemaining} days remaining
                            </span>
                            {isExpiringSoon && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              >
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                          <Progress
                            value={retention.progress}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
