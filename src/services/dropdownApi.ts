import { DropdownOption } from "../components/MultiDropdown";

export interface DropdownData {
  options: DropdownOption[];
  selectedOptions: DropdownOption[];
}

export class DropdownApiService {
  private static readonly STORAGE_KEY = "dropdown_data";
  private static readonly API_DELAY = 1000;

  static async saveToServer(data: DropdownData): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.API_DELAY));
    try {
      const dataToSave = {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("✅ Data saved to server:", dataToSave);

      if (Math.random() < 0.1) {
        throw new Error("Server error: Failed to save data");
      }
    } catch (error) {
      console.error("❌ Failed to save to server:", error);
      throw error;
    }
  }

  static async loadFromServer(): Promise<DropdownData | null> {
    await new Promise((resolve) => setTimeout(resolve, this.API_DELAY / 2));

    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log("📥 Data loaded from server:", parsed);
        return {
          options: parsed.options || [],
          selectedOptions: parsed.selectedOptions || [],
        };
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to load from server:", error);
      return null;
    }
  }

  static async deleteOptionOnServer(optionId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.API_DELAY / 2));

    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);

        parsed.options = parsed.options.filter(
          (opt: DropdownOption) => opt.id !== optionId
        );
        parsed.selectedOptions = parsed.selectedOptions.filter(
          (opt: DropdownOption) => opt.id !== optionId
        );

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
        console.log("🗑️ Option deleted on server:", optionId);
      }
    } catch (error) {
      console.error("❌ Failed to delete option on server:", error);
      throw error;
    }
  }

  static clearServerData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log("🧹 Server data cleared");
  }
}
