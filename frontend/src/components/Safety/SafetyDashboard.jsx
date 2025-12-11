import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, AlertTriangle, Users, ClipboardCheck, ArrowRight, Trash2 } from 'lucide-react';
import axios from 'axios';

const SafetyDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5003/api/safety', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(res.data);
    } catch (error) {
      console.error('Error fetching safety forms:', error);
      if (error.response) {
          console.error('Server Response:', JSON.stringify(error.response.data, null, 2));
          console.error('Status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5003/api/safety/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const filteredForms = forms.filter(f => {
    const matchesType = filter === 'ALL' || f.type === filter;
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'SWMS': return <AlertTriangle className="text-orange-500" />;
      case 'TOOLBOX_TALK': return <Users className="text-blue-500" />;
      case 'INCIDENT_REPORT': return <FileText className="text-red-500" />;
      default: return <ClipboardCheck className="text-green-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-indigo-500" />
            Safety & Compliance
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage SWMS, Toolbox Talks, and Site Incidents</p>
        </div>
        <Link 
          to="/safety/new" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
        >
          <Plus size={20} />
          New Form
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Forms', val: forms.length, color: 'bg-blue-500/10 text-blue-500' },
          { label: 'SWMS', val: forms.filter(f => f.type === 'SWMS').length, color: 'bg-orange-500/10 text-orange-500' },
          { label: 'Toolbox Talks', val: forms.filter(f => f.type === 'TOOLBOX_TALK').length, color: 'bg-purple-500/10 text-purple-500' },
          { label: 'Incidents', val: forms.filter(f => f.type === 'INCIDENT_REPORT').length, color: 'bg-red-500/10 text-red-500' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border border-white/5 ${stat.color} backdrop-blur-sm`}>
            <div className="text-2xl font-bold">{stat.val}</div>
            <div className="text-sm opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-gray-200 dark:border-stone-800 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'SWMS', 'TOOLBOX_TALK', 'INCIDENT_REPORT', 'INSPECTION'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === type 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-stone-800'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search forms..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-gray-200 dark:border-stone-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading forms...</div>
        ) : filteredForms.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <ClipboardCheck className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No forms found</p>
            <p className="text-sm">Create a new safety document to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-stone-800">
            {filteredForms.map(form => (
              <div key={form.id} className="p-4 hover:bg-gray-50 dark:hover:bg-stone-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-stone-800 rounded-xl">
                    {getIcon(form.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                      {form.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="bg-gray-100 dark:bg-stone-800 px-2 py-0.5 rounded text-xs font-mono">
                        {form.type.replace('_', ' ')}
                      </span>
                      <span>• {new Date(form.createdAt).toLocaleDateString()}</span>
                      <span>• {form.signatures?.length || 0} Signatures</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                   <Link 
                     to={`/safety/${form.id}`}
                     className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                   >
                     View <ArrowRight size={16} />
                   </Link>
                   <button 
                     onClick={() => deleteForm(form.id)}
                     className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyDashboard;
