import React, { useRef, useState } from "react";

const allowedTypes = [
  "text/csv",
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];
const API_URL = import.meta.env.VITE_API_URL||"";

const BulkUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload .csv, .xls, or .xlsx only.");
      setSuccess(null);
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/inventory/bulk-upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed.");

      setSuccess("Upload successful!");
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md lg:w-80">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .xls, .xlsx"
        style={{ display: "none" }}
      />
  <div>

      <p
        onClick={handleTriggerFileInput}
        className="text-blue-600 hover:underline cursor-pointer font-medium"
        >
        Bulk Upload
      </p>

      <p className="text-sm text-gray-500 mt-1 truncate">{fileName}</p>
        </div>

      {isUploading && (
        <p className="text-sm text-blue-500 mt-2">Uploading...</p>
      )}
      {success && <p className="text-sm text-green-500 mt-2">{success}</p>}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default BulkUpload;
