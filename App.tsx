
import React, { useState, useCallback } from 'react';
import { generateFrameworkPrompt } from './services/geminiService';
import { ClipboardIcon, CheckIcon, SparklesIcon } from './components/Icons';

// Helper component for rendering formatted prompt text
const FormattedPrompt: React.FC<{ prompt: string }> = ({ prompt }) => {
  // Regex to match section headers like "C –", "T –", etc.
  const sectionHeaderRegex = /^([A-Z]+) – /;

  return (
    <div className="text-left space-y-3 text-slate-600">
      {prompt.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        const match = trimmedLine.match(sectionHeaderRegex);
        if (match) {
          const title = match[0]; // e.g., "C – "
          const content = trimmedLine.substring(title.length).trim();
          return (
            <div key={index}>
              <p className="font-bold text-blue-600">{title}</p>
              <p className="pl-1">{content}</p>
            </div>
          );
        }
        return <p key={index}>{trimmedLine}</p>;
      })}
    </div>
  );
};

// Main App Component
export default function App() {
  const [taskDescription, setTaskDescription] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [justification, setJustification] = useState('');
  const [promptBody, setPromptBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGeneratePrompt = useCallback(async () => {
    if (!taskDescription.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    setJustification('');
    setPromptBody('');
    setIsCopied(false);

    try {
      const prompt = await generateFrameworkPrompt(taskDescription);
      setGeneratedPrompt(prompt); // Save full response for copy

      const justificationRegex = /^\*\*Framework-Wahl:\*\*\s*(.*)/;
      const match = prompt.match(justificationRegex);

      if (match && match[1]) {
        setJustification(match[1]);
        const promptBodyText = prompt.substring(match[0].length).trim();
        setPromptBody(promptBodyText);
      } else {
        setJustification('');
        setPromptBody(prompt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  }, [taskDescription, isLoading]);

  const handleCopy = useCallback(() => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [generatedPrompt]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <header className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-wide">
                AIKIA <span className="font-extralight">LABS</span>
            </h1>
            <p className="mt-1 text-sm text-blue-600 tracking-widest font-light">
                THINK AI-FIRST
            </p>
            <p className="mt-6 text-lg text-slate-600">
                Verwandeln Sie Ihre Ziele in präzise Prompts mit intelligenten KI-Frameworks.
            </p>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <label htmlFor="task-description" className="block text-lg font-medium text-slate-900 mb-2">
            Ihre Aufgabe oder Ihr Ziel
          </label>
          <textarea
            id="task-description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="z.B. Erstelle eine Social-Media-Kampagne für ein neues Tech-Produkt..."
            className="w-full h-32 p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none placeholder-slate-400 text-slate-800"
            disabled={isLoading}
          />
          <button
            onClick={handleGeneratePrompt}
            disabled={isLoading || !taskDescription.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <span>Generiere...</span>
              </>
            ) : (
                <>
                <SparklesIcon className="w-5 h-5"/>
                <span>Prompt generieren</span>
                </>
            )}
          </button>
        </div>

        {(generatedPrompt || isLoading || error) && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[200px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-medium text-slate-900">Generierter Prompt</h2>
                 {generatedPrompt && !isLoading && (
                     <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                     >
                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-500"/> : <ClipboardIcon className="w-4 h-4"/>}
                        {isCopied ? 'Kopiert!' : 'Kopieren'}
                     </button>
                 )}
            </div>
            <div className="flex-grow flex flex-col gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
              {isLoading && <p className="text-slate-500 animate-pulse">Prompt wird generiert...</p>}
              {error && <p className="text-red-500">{error}</p>}
              
              {justification && !isLoading && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-700 text-sm mb-1">Framework-Wahl</p>
                  <p className="text-slate-700 text-sm">{justification}</p>
                </div>
              )}

              {promptBody && !isLoading && <FormattedPrompt prompt={promptBody} />}
            </div>
          </div>
        )}
      </main>
      <footer className="w-full max-w-4xl mx-auto text-center text-slate-500 mt-8 text-sm">
        <p>&copy; {new Date().getFullYear()} AIKIA LABS – THINK AI-FIRST</p>
      </footer>
    </div>
  );
}
