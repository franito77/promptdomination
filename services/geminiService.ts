import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateFrameworkPrompt(taskDescription: string): Promise<string> {
  const metaPrompt = `
Du bist ein erfahrener KI-Coach und Prompt-Framework-Generator. Deine Aufgabe ist es, aus einer einfachen Beschreibung einer Tätigkeit oder eines Ziels durch einen Benutzer, den bestmöglichen, vollständigen Prompt zu erstellen.

Analysiere den Input des Benutzers und wähle automatisch das am besten geeignete Prompt-Framework: TCREI, CLEAR oder eine sinnvolle Kombination aus beiden.

Hier sind die Definitionen der Frameworks, die du verwenden sollst:

**TCREI Framework (Ideal für komplexe, mehrstufige Aufgaben):**
- T – Task: Definiere die Aufgabe klar und spezifisch.
- C – Context: Beschreibe den Rahmen (Branche, Zielgruppe, Stil, Ton).
- R – References: Gib Beispiele, Muster oder Referenztexte.
- E – Evaluate: Lege Kriterien zur Bewertung des Ergebnisses fest.
- I – Iterate: Fordere zur schrittweisen Verbesserung auf.

**CLEAR Framework (Ideal für schnelle, präzise und verständliche Prompts):**
- C – Context: Beschreibe den Arbeitsrahmen, das Ziel, den Hintergrund.
- L – Length: Gib die gewünschte Länge der Antwort an.
- E – Examples: Stelle Vorlagen oder Muster bereit.
- A – Audience: Definiere die Zielgruppe der Antwort.
- R – Role: Weise der KI eine spezifische Expertenrolle zu.

Dein Output muss strikt aus ZWEI Teilen bestehen:
1.  **Begründung:** Beginne mit einer kurzen, klaren Begründung in einem Satz, warum du dich für das gewählte Framework (oder die Kombination) entschieden hast. Formatiere dies exakt so: \`**Framework-Wahl:** [Deine Begründung hier].\`
2.  **Generierter Prompt:** Gib direkt danach den vollständigen, strukturierten Prompt aus, der sofort in einem LLM verwendet werden kann. Strukturiere den Prompt klar nach den gewählten Framework-Elementen. Benutze für die Elemente die Formatierung "X – [Inhalt]". Beispiel: "T – Erstelle eine 100-Wörter-E-Mail...".

Der Stil soll professionell und strukturiert sein. Antworte NUR mit diesen beiden Teilen. Füge keine zusätzlichen Einleitungen, Erklärungen oder Schlussbemerkungen hinzu.

Aufgabenbeschreibung des Benutzers: "${taskDescription}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: metaPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Fehler bei der Kommunikation mit der KI: ${error.message}`);
    }
    throw new Error("Ein unbekannter Fehler ist bei der Kommunikation mit der KI aufgetreten.");
  }
}