import React, { useState, useCallback, ChangeEvent } from 'react';
import { generateIcon } from './services/geminiService';
import { UploadIcon, SparklesIcon, DownloadIcon, SpinnerIcon } from './components/icons';

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
  reset: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreviewUrl, reset }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        onImageUpload(file);
      } else {
        alert('Please upload a valid image file (PNG, JPEG, WEBP).');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
       if (['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        onImageUpload(file);
      } else {
        alert('Please upload a valid image file (PNG, JPEG, WEBP).');
      }
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {imagePreviewUrl ? (
          <>
            <img src={imagePreviewUrl} alt="Preview" className="object-contain h-full w-full rounded-lg p-2" />
            <button
              onClick={(e) => { e.preventDefault(); reset(); }}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <UploadIcon className="w-10 h-10 mb-3" />
            <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs">PNG, JPG or WEBP</p>
          </div>
        )}
        <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      </label>
    </div>
  );
};


const ResultDisplay: React.FC<{ generatedIcon: string | null; isLoading: boolean; error: string | null }> = ({ generatedIcon, isLoading, error }) => {
    return (
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-800 rounded-lg min-h-[400px]">
            {isLoading ? (
                <div className="flex flex-col items-center text-gray-300">
                    <SpinnerIcon className="w-12 h-12" />
                    <p className="mt-4 text-lg animate-pulse">Generating your icon...</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-400">
                    <p className="font-semibold">An error occurred:</p>
                    <p className="mt-2 text-sm">{error}</p>
                </div>
            ) : generatedIcon ? (
                <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4 text-white">Your Icon is Ready!</h3>
                    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
                        <img src={generatedIcon} alt="Generated Icon" className="w-64 h-64 object-contain rounded-md" />
                    </div>
                    <a
                        href={generatedIcon}
                        download="generated-icon.png"
                        className="inline-flex items-center justify-center px-6 py-3 mt-6 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 gap-2 transition-transform transform hover:scale-105"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download Icon
                    </a>
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    <SparklesIcon className="w-16 h-16 mx-auto" />
                    <p className="mt-4 text-lg">Your generated icon will appear here</p>
                </div>
            )}
        </div>
    );
};


export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('load data to database');
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  }, []);

  const resetUploader = useCallback(() => {
    if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  }, [imagePreviewUrl]);

  const handleGenerateClick = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedIcon(null);

    try {
      const { data: base64Data, mimeType } = await fileToBase64(imageFile);
      const resultBase64 = await generateIcon(base64Data, mimeType, prompt);
      setGeneratedIcon(`data:image/png;base64,${resultBase64}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            AI <span className="text-purple-400">Icon</span> Generator
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Turn your sketches or images into professional desktop icons. Upload a picture, describe its purpose, and let AI do the magic.
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 flex flex-col gap-6 p-8 bg-gray-800 rounded-lg shadow-2xl">
            <div>
              <label className="text-lg font-semibold text-white mb-2 block">1. Upload Your Image</label>
              <ImageUploader onImageUpload={handleImageUpload} imagePreviewUrl={imagePreviewUrl} reset={resetUploader} />
            </div>
            <div>
              <label htmlFor="prompt" className="text-lg font-semibold text-white mb-2 block">2. Describe the Icon's Purpose</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., load data to database, run a security scan..."
                className="w-full h-28 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow text-white placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleGenerateClick}
              disabled={!imageFile || isLoading}
              className="w-full inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 gap-2 transition-all transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-6 h-6" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Generate Icon
                </>
              )}
            </button>
          </div>

          <ResultDisplay generatedIcon={generatedIcon} isLoading={isLoading} error={error} />
        </main>
      </div>
    </div>
  );
}
