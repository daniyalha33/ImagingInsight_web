import React, { useState } from 'react';

const API_BASE = 'http://localhost:3000/api/v1';

export function RagScreen({ token, onBack }: { token?: string; onBack: () => void }) {
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [docFiles, setDocFiles] = useState<FileList | null>(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Array<string | { filename: string; chunks_stored: number }>>([]);
  const [docError, setDocError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<any | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [visionQuestion, setVisionQuestion] = useState('');
const [imageDisclaimer, setImageDisclaimer] = useState<string | null>(null);
  async function handleAsk() {
    if (!question.trim()) return;
    setChatLoading(true);
    setChatError(null);
    setChatAnswer(null);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (data.success && (data.answer || data.data)) {
        setChatAnswer(data.answer ?? data.data ?? JSON.stringify(data));
      } else if (data.answer) {
        setChatAnswer(data.answer);
      } else {
        setChatError(data.message || 'No answer returned');
      }
    } catch (err: any) {
      setChatError(err?.message || 'Network error');
    } finally {
      setChatLoading(false);
    }
  }

  async function handleUploadDocs() {
    if (!docFiles || docFiles.length === 0) return;
    setUploadingDocs(true);
    setDocError(null);
    try {
      // Endpoint accepts a single file under key `file` — upload the first selected file.
      const file = docFiles[0];
      const form = new FormData();
      form.append('file', file);

      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Response shape: { filename: string, chunks_stored: number, message: string }
        setUploadedDocs((prev) => [
          ...prev,
          { filename: data.filename || file.name, chunks_stored: data.chunks_stored ?? 0 },
        ]);
        setDocFiles(null);
      } else {
        setDocError(data.message || data.detail || 'Upload failed');
      }
    } catch (err: any) {
      setDocError(err?.message || 'Network error');
    } finally {
      setUploadingDocs(false);
    }
  }

  async function handleAnalyzeImage() {
  if (!imageFile) return;
  setAnalyzingImage(true);
  setImageError(null);
  setImageAnalysis(null);
  setImageDisclaimer(null);
  try {
    const form = new FormData();
    form.append('file', imageFile);
    if (visionQuestion.trim()) form.append('question', visionQuestion.trim());

    const res = await fetch(`${API_BASE}/vision/analyze`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      // Use 'analysis' field — confirmed from Swagger schema
      const result = data.analysis ?? data.answer ?? data.result ?? data.data;
      setImageAnalysis(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      if (data.disclaimer) setImageDisclaimer(data.disclaimer);
    } else {
      setImageError(data.message || data.detail || 'Analysis failed');
    }
  } catch (err: any) {
    setImageError(err?.message || 'Network error');
  } finally {
    setAnalyzingImage(false);
  }
}

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">RAG Assistant</h2>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-3 py-1 rounded-md bg-gray-100">Back</button>
        </div>
      </div>

      <section className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Ask a question (text)</h3>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="w-full border p-2 rounded" />
        <div className="flex items-center gap-2 mt-2">
          <button onClick={handleAsk} disabled={chatLoading} className="bg-blue-600 text-white px-3 py-1 rounded">
            {chatLoading ? 'Asking…' : 'Ask'}
          </button>
          {chatError && <div className="text-red-600">{chatError}</div>}
        </div>
        {chatAnswer && (
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <pre className="whitespace-pre-wrap">{chatAnswer}</pre>
          </div>
        )}
      </section>

      <section className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Upload documents to knowledge base</h3>
        <input type="file" multiple onChange={(e) => setDocFiles(e.target.files)} />
        <div className="mt-2 flex items-center gap-2">
          <button onClick={handleUploadDocs} disabled={uploadingDocs} className="bg-green-600 text-white px-3 py-1 rounded">
            {uploadingDocs ? 'Uploading…' : 'Upload Documents'}
          </button>
          {docError && <div className="text-red-600">{docError}</div>}
        </div>
        {uploadedDocs.length > 0 && (
          <div className="bg-white rounded-lg p-5 shadow-sm mt-3">
            <h3 className="font-medium text-gray-800 mb-2">Uploaded this session</h3>
            <ul className="space-y-1">
              {uploadedDocs.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {typeof item === 'string'
                    ? item
                    : `${item.filename} (${item.chunks_stored} chunks)`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mb-6 bg-white p-4 rounded shadow">
  <h3 className="font-medium mb-2">Ask about an image</h3>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
  />

  {/* Question prompt input — was missing entirely */}
  <textarea
    value={visionQuestion}
    onChange={(e) => setVisionQuestion(e.target.value)}
    rows={2}
    placeholder="Optional: what should the AI look for? e.g. identify organs visible in this CT slice"
    className="mt-3 w-full border p-2 rounded text-sm"
  />

  <div className="mt-2 flex items-center gap-2">
    <button
      onClick={handleAnalyzeImage}
      disabled={analyzingImage || !imageFile}
      className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
    >
      {analyzingImage ? 'Analyzing…' : 'Analyze Image'}
    </button>
    {imageError && <div className="text-red-600 text-sm">{imageError}</div>}
  </div>

  {/* Result */}
  {imageAnalysis && (
    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
      <p className="whitespace-pre-wrap text-gray-800">{imageAnalysis}</p>
    </div>
  )}

  {/* Disclaimer */}
  {imageDisclaimer && (
    <div className="mt-2 flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
      <span className="text-amber-500 text-sm">⚠</span>
      <p className="text-xs text-amber-800">{imageDisclaimer}</p>
    </div>
  )}
</section>

      <div className="text-xs text-gray-500 mt-3">Note: The RAG backend is mounted under <code>{API_BASE}</code> — adjust endpoints if your backend differs.</div>
    </div>
  );
}
