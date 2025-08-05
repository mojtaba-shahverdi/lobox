"use client";

import { useState, useEffect } from "react";
import { MultiDropdown, DropdownOption } from "../components";
import { DropdownApiService } from "../services/dropdownApi";

const initialOptions: DropdownOption[] = [
  { id: "1", label: "lobox", emoji: "✨" },
  { id: "2", label: "Education", emoji: "🎓" },
  { id: "3", label: "Health", emoji: "🏥" },
];

export default function Home() {
  const [options, setOptions] = useState<DropdownOption[]>(initialOptions);

  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([
    { id: "1", label: "lobox", emoji: "✨" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const serverData = await DropdownApiService.loadFromServer();
        if (serverData) {
          setOptions(serverData.options);
          setSelectedOptions(serverData.selectedOptions);
        }
      } catch (error) {
        console.error("Failed to load data from server:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectionChange = (newSelection: DropdownOption[]) => {
    setSelectedOptions(newSelection);
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      setOptions((prev) => prev.filter((opt) => opt.id !== optionId));
      setSelectedOptions((prev) => prev.filter((opt) => opt.id !== optionId));

      await DropdownApiService.deleteOptionOnServer(optionId);
    } catch (error) {
      console.error("Failed to delete option:", error);
    }
  };

  const handleSaveToServer = async (data: {
    options: DropdownOption[];
    selectedOptions: DropdownOption[];
  }) => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      await DropdownApiService.saveToServer(data);
      setSaveStatus("success");

      const serverData = await DropdownApiService.loadFromServer();
      if (serverData) {
        setOptions(serverData.options);
        setSelectedOptions(serverData.selectedOptions);
      }

      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save to server:", error);
      setSaveStatus("error");

      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = () => {
    DropdownApiService.clearServerData();
    setOptions(initialOptions);
    setSelectedOptions([{ id: "1", label: "lobox", emoji: "✨" }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 lobox">LOBOX</h1>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Select or Add options:
            </h2>
          </div>

          {saveStatus === "success" && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
              <span className="mr-2">✅</span>
              <span>Data saved successfully to server!</span>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <span className="mr-2">❌</span>
              <span>Failed to save data to server. Please try again.</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading from server...</span>
            </div>
          ) : (
            <MultiDropdown
              options={options}
              selectedOptions={selectedOptions}
              onSelectionChange={handleSelectionChange}
              onOptionsChange={setOptions}
              onDeleteOption={handleDeleteOption}
              placeholder="Science"
              allowAddNew={true}
              allowDelete={true}
              className="mb-6"
            />
          )}
          <div className="flex gap-4 justify-center pt-4 border-t border-gray-200">
            <button
              onClick={() => handleSaveToServer({ options, selectedOptions })}
              disabled={isSaving}
              className={`px-8 py-3 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2 ${
                isSaving
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save to Server</span>
                </>
              )}
            </button>
            <button
              onClick={handleClearData}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg cursor-pointer"
            >
              🧹 Reset Demo
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Selected Options:
            </h3>
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedOptions.map((option) => (
                  <span
                    key={option.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {option.label} {option.emoji}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No options selected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
