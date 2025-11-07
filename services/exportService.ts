// services/exportService.ts
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";
import { API_URL } from "../constants/config";

export async function exportExpensesToExcel(
  token: string,
  monthId: number,
  monthName: string
) {
  try {
    const res = await axios.get(`${API_URL}/budget/expense/export/${monthId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Nincs exportálható adat.");
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kiadások");
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

    // 👇 TypeScript workaround
    const FS: any = FileSystem;

    const dir =
      FS.cacheDirectory ??
      FS.documentDirectory ??
      FileSystem.cacheDirectory ??
      FileSystem.documentDirectory;

    const fileUri = `${dir}${monthName}_koltsegek.xlsx`;

    await FS.writeAsStringAsync(fileUri, wbout, {
      encoding: FS.EncodingType?.Base64 ?? "base64",
    });

    console.log("Excel fájl létrehozva:", fileUri);
    return { uri: fileUri };
  } catch (err) {
    console.error("Export hiba:", err);
    throw err;
  }
}
