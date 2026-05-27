import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const DocumentsPage = () => {
  const { advisor } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // Only Compliance Officer or Admin can upload
  const canUpload = advisor?.role === 'Compliance Officer' || advisor?.role === 'Admin' || advisor?.role === 'Operations';

  const fetchStatus = async () => {
    try {
      const { data } = await documentsAPI.getStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await documentsAPI.upload(formData);
      toast.success('Document uploaded and indexed successfully!');
      setFile(null);
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearchResult(null);
    try {
      const { data } = await documentsAPI.search(query);
      setSearchResult(data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-body space-y-8">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Knowledge Base (RAG)</h1>
        <p className="text-slate-400 mt-1">Upload financial reports and perform conversational search.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Vector Database Status</h2>
          {status ? (
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Engine:</span> {status.vectorDb}</p>
              <p><span className="text-slate-500">Status:</span> 
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${status.status === 'Ready' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {status.status}
                </span>
              </p>
              {status.indexSizeBytes && (
                <p><span className="text-slate-500">Size:</span> {(status.indexSizeBytes / 1024).toFixed(2)} KB</p>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Loading status...</p>
          )}

          {canUpload && (
            <form onSubmit={handleUpload} className="mt-6 border-t border-surface-600 pt-6">
              <h3 className="text-sm font-bold text-white mb-3">Upload New Document (PDF)</h3>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30"
                />
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          )}
          {!canUpload && (
            <div className="mt-6 border-t border-surface-600 pt-6">
              <p className="text-xs text-amber-400 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">
                ⚠️ Only Compliance Officers and Admins can upload documents to the knowledge base.
              </p>
            </div>
          )}
        </div>

        <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4">Conversational Search</h2>
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="E.g. What is the latest RBI guideline on mutual funds?"
              className="flex-1 bg-surface-700 border border-surface-500 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-primary-500 outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim() || searching}
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResult && (
            <div className="flex-1 overflow-y-auto bg-surface-700/50 rounded-xl p-4 border border-surface-600">
              <div className="prose prose-invert prose-sm">
                <ReactMarkdown>{searchResult.answer}</ReactMarkdown>
              </div>
              {searchResult.sources && searchResult.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-600">
                  <p className="text-xs text-slate-500 font-bold mb-2">Sources:</p>
                  <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                    {[...new Set(searchResult.sources)].map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
