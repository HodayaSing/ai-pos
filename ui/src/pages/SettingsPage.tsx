import React, { useState, useEffect } from 'react';
import { getAiConfig, updateAiConfig } from '../services/aiService';

const SettingsPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>(['gpt-3.5-turbo', 'gpt-4', 'claude-2']); // Default models, will be updated from backend if provided
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        const config = await getAiConfig();
        setPrompt(config.prompt);
        setModel(config.model);
        if (config.availableModels && config.availableModels.length > 0) {
          setAvailableModels(config.availableModels);
        }
      } catch (err) {
        console.error("Failed to fetch AI config:", err);
        setError(err instanceof Error ? err.message : 'Failed to load AI configuration.');
        // Set default values if fetch fails, or handle error appropriately
        setPrompt("Error loading prompt. Please try saving a new one.");
        setModel(availableModels[0] || '');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
    console.log("SettingsPage component mounted");
  }, []);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateAiConfig({ prompt, model });
      setSuccessMessage('Settings saved successfully!');
    } catch (err) {
      console.error("Failed to save AI config:", err);
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setIsLoading(false);
      // Optionally clear messages after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
    }
  };

  if (isLoading && !prompt && !model) { // Show loading only on initial load
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-700">Loading AI Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">AI Settings</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <label htmlFor="llmPrompt" className="block text-lg font-medium text-gray-700 mb-2">
          LLM Prompt
        </label>
        <textarea
          id="llmPrompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          placeholder="Enter your LLM prompt here..."
          disabled={isLoading}
        />
        <p className="mt-2 text-sm text-gray-500">
          This prompt will be used for the AI product search feature. Customize it to optimize search results.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <label htmlFor="llmModel" className="block text-lg font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <select
          id="llmModel"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
          disabled={isLoading}
        >
          {availableModels.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Select the AI model to be used for processing search queries.
        </p>
      </div>

      <button
        onClick={handleSaveChanges}
        className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default SettingsPage;
