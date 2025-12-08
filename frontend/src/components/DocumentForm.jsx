import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { FileText, Save, X, Tag, Loader } from 'lucide-react';

const DocumentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing document
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState({
    title: '',
    type: 'REPORT',
    content: '',
    tags: [],
    status: 'DRAFT',
    relatedModel: null,
    relatedId: null,
    metadata: {},
    userId: null, // This should be handled by backend authentication
  });

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/reports/documents/${id}`);
          setDocument(res.data);
        } catch (error) {
          console.error('Failed to fetch document for edit:', error);
          alert('Failed to load document.');
        } finally {
          setLoading(false);
        }
      };
      fetchDocument();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocument(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        // await api.put(`/reports/documents/${id}`, document);
        alert('Document update functionality not yet implemented. Saved to console.');
        console.log('Update Document:', document);
      } else {
        const res = await api.post('/reports/documents', document);
        alert('Document created successfully!');
        navigate(`/reports?documentId=${res.data.id}`); // Navigate back to reports with new doc selected
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200">
        <Loader size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-sans text-gray-100 bg-transparent animate-fade-in">
      <div className="max-w-4xl mx-auto bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FileText size={28} className="text-purple-400" /> {id ? 'Edit Document' : 'Create New Document'}
          </h1>
          <button onClick={() => navigate('/reports')} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-gray-400 uppercase mb-2">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={document.title}
              onChange={handleChange}
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none text-lg font-medium"
              placeholder="Report Title or Document Name"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-xs font-bold text-gray-400 uppercase mb-2">Document Type</label>
            <select
              id="type"
              name="type"
              value={document.type}
              onChange={handleChange}
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
            >
              <option value="REPORT">Report</option>
              <option value="MEMO">Memo</option>
              <option value="SPECIFICATION">Specification</option>
              <option value="INCIDENT">Incident Report</option>
              <option value="MEETING_MINUTES">Meeting Minutes</option>
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-xs font-bold text-gray-400 uppercase mb-2">Content (Markdown/HTML)</label>
            <textarea
              id="content"
              name="content"
              value={document.content}
              onChange={handleChange}
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-y h-48"
              placeholder="Write your document content here..."
            />
          </div>
          
          {/* Tags - Future AI Feature */}
          <div>
            <label htmlFor="tags" className="block text-xs font-bold text-gray-400 uppercase mb-2">Tags (Comma Separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={document.tags.join(', ')}
              onChange={(e) => setDocument(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) }))}
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              placeholder="e.g., safety, client-meeting, site-visit"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => navigate('/reports')}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
            >
              <Save size={18} className="inline-block mr-2"/> {saving ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
