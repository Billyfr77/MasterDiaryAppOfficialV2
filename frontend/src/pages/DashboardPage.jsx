import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import {
  XCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Loader,
} from 'lucide-react';

import DashboardHeader from '../components/Dashboard/DashboardHeader';
import SummaryPanel from '../components/Dashboard/SummaryPanel';
import ControlsBar from '../components/Dashboard/ControlsBar';
import Tabs from '../components/Dashboard/Tabs';
import TabContent from '../components/Dashboard/TabContent';

// Main Enhanced Ultimate Dashboard Component
const DashboardPage = () => {
  // Core state with safe defaults
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // AI and UI state
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Google Maps
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });
  useEffect(() => {
    loadDashboardData();
  }, []);

  // AI Analysis when data changes
  useEffect(() => {
    if (
      projects.length > 0 ||
      staff.length > 0 ||
      equipment.length > 0 ||
      materials.length > 0
    ) {
      performAIAnalysis();
    }
  }, [projects, staff, equipment, materials]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, staffRes, equipRes, nodesRes] = await Promise.all([
        api.get('/projects'),
        api.get('/staff'),
        api.get('/equipment'),
        api.get('/nodes'), // Fixed: materials are nodes
      ]);

      // Ensure all data is always arrays to prevent filter errors
      setProjects(
        Array.isArray(projectsRes.data.data) ? projectsRes.data.data : []
      );
      setStaff(Array.isArray(staffRes.data.data) ? staffRes.data.data : []);
      setEquipment(
        Array.isArray(equipRes.data.data) ? equipRes.data.data : []
      );
      setMaterials(
        Array.isArray(nodesRes.data.data) ? nodesRes.data.data : []
      );
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays on error to prevent crashes
      setProjects([]);
      setStaff([]);
      setEquipment([]);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const data = { projects, staff, equipment, materials };
      
      // Call Real Backend AI
      const response = await api.post('/ai/analyze-business', data);
      
      if (response.data && response.data.analysis) {
         setAiAnalysis(response.data.analysis);
      } else {
         throw new Error("Invalid analysis format received");
      }

    } catch (error) {
      console.error("AI Analysis Failed:", error);
      // Fallback safe state
      setAiAnalysis({
        insights: [{ id: 'err', title: 'AI Unavailable', message: 'Connection to Intelligence Core failed.', type: 'warning' }],
        alerts: [],
        predictions: [],
        optimizations: [],
        anomalies: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Comprehensive metrics calculation with safe array operations
  const metrics = useMemo(() => {
    // Projects metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter(
      (p) => p.status === 'completed'
    ).length;
    const overdueProjects = projects.filter(
      (p) => new Date(p.deadline) < new Date() && p.status !== 'completed'
    ).length;
    const totalProjectValue = projects.reduce(
      (sum, p) => sum + (p.value || 0),
      0
    );

    // Staff metrics
    const totalStaff = staff.length;
    const avgProductivity =
      staff.length > 0
        ? staff.reduce((sum, s) => sum + (s.productivity || 85), 0) /
          staff.length
        : 0;
    const totalStaffHours = staff.reduce(
      (sum, s) => sum + (s.totalHours || 0),
      0
    );

    // Equipment metrics
    const totalEquipment = equipment.length;
    const maintenanceNeeded = equipment.filter(
      (e) => (e.hoursUsed || 0) > (e.maintenanceThreshold || 1000)
    ).length;
    const totalEquipmentValue = equipment.reduce(
      (sum, e) => sum + (e.value || 0),
      0
    );

    // Materials metrics (nodes)
    const totalMaterials = materials.length;
    const lowStockItems = materials.filter(
      (m) => (m.pricePerUnit || 0) < 1 // Using price as stock indicator
    ).length;
    const totalMaterialValue = materials.reduce(
      (sum, m) => sum + (m.pricePerUnit || 0),
      0
    );

    // AI metrics
    const aiInsights = aiAnalysis.insights?.length || 0;
    const aiAlerts = aiAnalysis.alerts?.length || 0;
    const aiPredictions = aiAnalysis.predictions?.length || 0;
    const aiOptimizations = aiAnalysis.optimizations?.length || 0;

    return {
      // Projects
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalProjectValue,
      // Staff
      totalStaff,
      avgProductivity,
      totalStaffHours,
      // Equipment
      totalEquipment,
      maintenanceNeeded,
      totalEquipmentValue,
      // Materials (nodes)
      totalMaterials,
      lowStockItems,
      totalMaterialValue,
      // AI
      aiInsights,
      aiAlerts,
      aiPredictions,
      aiOptimizations,
      // Overall
      totalEntities:
        totalProjects + totalStaff + totalEquipment + totalMaterials,
      totalValue: totalProjectValue + totalEquipmentValue + totalMaterialValue,
    };
  }, [projects, staff, equipment, materials, aiAnalysis]);

  // Filtered and sorted data with safe operations
  const filteredData = useMemo(() => {
    const filterEntity = (entities, search) => {
      if (!Array.isArray(entities)) return [];
      if (!search) return entities;
      return entities.filter((entity) =>
        Object.values(entity).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      );
    };

    const sortEntity = (entities, sortBy, sortOrder) => {
      if (!Array.isArray(entities)) return [];
      return [...entities].sort((a, b) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    };

    return {
      projects: sortEntity(
        filterEntity(projects, searchTerm),
        sortBy,
        sortOrder
      ),
      staff: sortEntity(filterEntity(staff, searchTerm), sortBy, sortOrder),
      equipment: sortEntity(
        filterEntity(equipment, searchTerm),
        sortBy,
        sortOrder
      ),
      materials: sortEntity(
        filterEntity(materials, searchTerm),
        sortBy,
        sortOrder
      ),
    };
  }, [projects, staff, equipment, materials, searchTerm, sortBy, sortOrder]);

  // Health status calculation
  const healthStatus = useMemo(() => {
    const alerts = aiAnalysis.alerts?.length || 0;
    const criticalAlerts =
      aiAnalysis.alerts?.filter((a) => a.priority >= 9).length || 0;

    if (criticalAlerts > 0)
      return { status: 'critical', color: '#ef4444', icon: XCircle };
    if (alerts > 10)
      return { status: 'warning', color: '#f59e0b', icon: AlertTriangle };
    if (alerts > 5) return { status: 'caution', color: '#3b82f6', icon: Info };
    return { status: 'healthy', color: '#10b981', icon: CheckCircle };
  }, [aiAnalysis.alerts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200">
        <div className="bg-stone-900/80 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl text-center">
          <Loader
            size={48}
            className="mx-auto mb-4 animate-spin text-indigo-500"
          />
          <div className="text-xl font-bold mb-2 text-white">
            Initializing AI Dashboard
          </div>
          <div className="text-sm text-gray-400 font-mono">
            Loading comprehensive business intelligence...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-gray-100 bg-transparent">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <DashboardHeader
          lastUpdate={lastUpdate}
          healthStatus={healthStatus}
          isAnalyzing={isAnalyzing}
          performAIAnalysis={performAIAnalysis}
        />

        <SummaryPanel metrics={metrics} setActiveTab={setActiveTab} />

        <div className="space-y-6">
          <ControlsBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          <Tabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            metrics={metrics}
          />

          <div className="animate-fade-in">
            <TabContent
              activeTab={activeTab}
              aiAnalysis={aiAnalysis}
              healthStatus={healthStatus}
              filteredData={filteredData}
              metrics={metrics}
              isMapLoaded={isMapLoaded}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;