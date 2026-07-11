import { useState } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChangeSignature() {
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSignatureFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setSignaturePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadSignatureToBackend = async () => {
    if (!signatureFile) {
      setMessage("❗ Please select a signature image first.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          const response = await fetch("/api/changesignature", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ signature: reader.result }),
          });

          const data = await response.json();
          if (response.ok && data.success) {
            setMessage("✅ Signature uploaded successfully.");
          } else {
            setMessage(data.message || "❌ Upload failed.");
          }
        }
        setUploading(false);
      };
      reader.readAsDataURL(signatureFile);
    } catch (error) {
      console.error("Error uploading signature:", error);
      setMessage("❌ Network error.");
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4">Change Signature</h2>

      {signaturePreview && (
        <img
          src={signaturePreview}
          alt="Signature Preview"
          className="h-24 border rounded mb-4"
        />
      )}

      {/* Icon-only button to choose file */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => document.getElementById("signatureInput")?.click()}
        className="rounded-full mb-2"
        disabled={uploading}
      >
        <ImagePlus className="h-5 w-5" />
      </Button>

      {/* Hidden file input */}
      <input
        id="signatureInput"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Upload Button */}
      <Button
        onClick={uploadSignatureToBackend}
        disabled={uploading || !signatureFile}
      >
        {uploading ? "Uploading..." : "Upload"}
        <Upload className="ml-2 h-4 w-4" />
      </Button>

      {/* Status message */}
      {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}
    </div>
  );
}
