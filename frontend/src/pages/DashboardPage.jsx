import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../utils/api';
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

// Enhanced AI Engine for Comprehensive Business Intelligence
class ComprehensiveAIEngine {
  constructor() {
    this.insights = [];
    this.predictions = [];
    this.alerts = [];
    this.optimizations = [];
    this.anomalies = [];
    this.isActive = true;
    this.analysisHistory = [];
  }

  analyze(data) {
    this.reset();
    const timestamp = new Date();

    // Analyze each entity with comprehensive algorithms
    this.analyzeProjects(data.projects);
    this.analyzeStaff(data.staff);
    this.analyzeEquipment(data.equipment);
    this.analyzeMaterials(data.materials);

    // Cross-entity analysis
    this.analyzeEntityCorrelations(data);

    // Generate predictions
    this.generatePredictions(data);

    // Detect anomalies
    this.detectAnomalies(data);

    // Store analysis history
    this.analysisHistory.push({
      timestamp,
      insights: this.insights.length,
      alerts: this.alerts.length,
      predictions: this.predictions.length,
    });

    return {
      insights: this.insights,
      predictions: this.predictions,
      alerts: this.alerts,
      optimizations: this.optimizations,
      anomalies: this.anomalies,
      summary: this.generateSummary(),
      timestamp,
    };
  }

  reset() {
    this.insights = [];
    this.predictions = [];
    this.alerts = [];
    this.optimizations = [];
    this.anomalies = [];
  }

  analyzeProjects(projects) {
    if (!projects || projects.length === 0) return;

    const totalProjects = projects.length;
    const completedProjects = projects.filter(
      (p) => p.status === 'completed'
    ).length;
    const overdueProjects = projects.filter(
      (p) => new Date(p.deadline) < new Date() && p.status !== 'completed'
    ).length;

    // Project completion rate insight
    const completionRate =
      totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    if (completionRate < 70) {
      this.insights.push({
        id: 'proj-completion-rate',
        type: 'warning',
        category: 'projects',
        title: 'Project Completion Rate Below Target',
        message: `Only ${completionRate.toFixed(
          1
        )}% of projects completed. Target: 85%`,
        impact: 'high',
        recommendation:
          'Review project management processes and resource allocation',
        priority: 8,
      });
    }

    // Overdue projects alert
    if (overdueProjects > 0) {
      this.alerts.push({
        id: 'proj-overdue',
        type: 'danger',
        category: 'projects',
        title: 'Overdue Projects Detected',
        message: `${overdueProjects} project(s) are past deadline`,
        impact: 'critical',
        action: 'Immediate review required',
        priority: 10,
      });
    }

    // Project value analysis
    const avgProjectValue =
      projects.reduce((sum, p) => sum + (p.value || 0), 0) / projects.length;
    if (avgProjectValue > 0) {
      this.insights.push({
        id: 'proj-value-analysis',
        type: 'info',
        category: 'projects',
        title: 'Average Project Value',
        message: `Average project value: $${avgProjectValue.toLocaleString()}`,
        impact: 'medium',
        data: { avgValue: avgProjectValue },
      });
    }
  }

  analyzeStaff(staff) {
    if (!staff || staff.length === 0) return;

    // Productivity analysis
    staff.forEach((member) => {
      const productivity = this.calculateStaffProductivity(member);
      const utilization = this.calculateStaffUtilization(member);

      if (productivity < 70) {
        this.insights.push({
          id: `staff-prod-${member.id}`,
          type: 'warning',
          category: 'staff',
          title: 'Staff Productivity Alert',
          message: `${
            member.name
          }'s productivity is ${productivity.toFixed(1)}% (below 70% target)`,
          impact: 'high',
          recommendation: 'Review workload distribution and training needs',
          priority: 7,
        });
      }

      if (utilization < 60) {
        this.optimizations.push({
          id: `staff-util-${member.id}`,
          category: 'staff',
          title: 'Staff Underutilization Opportunity',
          message: `${member.name} is only ${utilization.toFixed(
            1
          )}% utilized`,
          impact: 'medium',
          action: 'Consider additional project assignments',
        });
      }
    });

    // Overall staff metrics
    const avgProductivity =
      staff.reduce((sum, s) => sum + this.calculateStaffProductivity(s), 0) /
      staff.length;
    const totalUtilization =
      staff.reduce((sum, s) => sum + this.calculateStaffUtilization(s), 0) /
      staff.length;

    this.insights.push({
      id: 'staff-overall-metrics',
      type: 'info',
      category: 'staff',
      title: 'Staff Performance Summary',
      message: `Average productivity: ${avgProductivity.toFixed(
        1
      )}%, Utilization: ${totalUtilization.toFixed(1)}%`,
      impact: 'medium',
      data: { avgProductivity, totalUtilization },
    });
  }

  analyzeEquipment(equipment) {
    if (!equipment || equipment.length === 0) return;

    equipment.forEach((item) => {
      // Maintenance analysis
      if (item.hoursUsed > (item.maintenanceThreshold || 1000)) {
        this.alerts.push({
          id: `equip-maint-${item.id}`,
          type: 'danger',
          category: 'equipment',
          title: 'Equipment Maintenance Required',
          message: `${item.name} has exceeded maintenance threshold (${
            item.hoursUsed
          }h > ${(item.maintenanceThreshold || 1000)}h)`,
          impact: 'high',
          action: 'Schedule maintenance immediately',
          priority: 9,
        });
      }

      // Utilization analysis
      const utilization = this.calculateEquipmentUtilization(item);
      if (utilization < 40) {
        this.optimizations.push({
          id: `equip-util-${item.id}`,
          category: 'equipment',
          title: 'Equipment Underutilization',
          message: `${item.name} utilization is only ${utilization.toFixed(
            1
          )}%`,
          impact: 'medium',
          action: 'Consider rental or sale options',
        });
      }

      // Cost efficiency analysis
      const efficiency = this.calculateEquipmentEfficiency(item);
      if (efficiency < 0.8) {
        this.insights.push({
          id: `equip-eff-${item.id}`,
          type: 'warning',
          category: 'equipment',
          title: 'Equipment Cost Inefficiency',
          message: `${
            item.name
          } efficiency rating: ${efficiency.toFixed(2)} (below 0.8 target)`,
          impact: 'medium',
          recommendation: 'Review usage patterns and maintenance schedule',
        });
      }
    });
  }

  analyzeMaterials(materials) {
    if (!materials || materials.length === 0) return;

    materials.forEach((material) => {
      // Stock level analysis (using pricePerUnit as stock indicator)
      if ((material.pricePerUnit || 0) < 1) {
        this.alerts.push({
          id: `mat-stock-${material.id}`,
          type: 'warning',
          category: 'materials',
          title: 'Material Price Alert',
          message: `${material.name} has very low price per unit ($${material.pricePerUnit})`,
          impact: 'medium',
          action: 'Review pricing and availability',
          priority: 6,
        });
      }

      // Usage trend analysis (mock calculation)
      const usageTrend = this.calculateMaterialUsageTrend(material);
      if (usageTrend > 20) {
        this.predictions.push({
          id: `mat-trend-${material.id}`,
          category: 'materials',
          title: 'Increasing Material Demand',
          message: `${
            material.name
          } usage trending up by ${usageTrend.toFixed(1)}%`,
          confidence: 85,
          timeframe: 'next 30 days',
          recommendation: 'Increase stock levels proactively',
        });
      }

      // Cost analysis
      const costEfficiency = this.calculateMaterialCostEfficiency(material);
      if (costEfficiency < 0.9) {
        this.optimizations.push({
          id: `mat-cost-${material.id}`,
          category: 'materials',
          title: 'Material Cost Optimization',
          message: `${
            material.name
          } cost efficiency: ${costEfficiency.toFixed(2)}`,
          impact: 'medium',
          action: 'Explore alternative suppliers',
        });
      }
    });
  }

  analyzeEntityCorrelations(data) {
    // Analyze relationships between entities
    const { projects, staff, equipment, materials } = data;

    // Staff-Equipment correlation
    const staffEquipmentRatio =
      staff.length > 0 && equipment.length > 0
        ? equipment.length / staff.length
        : 0;

    if (staffEquipmentRatio < 0.5) {
      this.insights.push({
        id: 'correlation-staff-equip',
        type: 'info',
        category: 'correlations',
        title: 'Staff-Equipment Ratio Analysis',
        message: `Equipment per staff member: ${staffEquipmentRatio.toFixed(
          1
        )} (target: 0.8-1.2)`,
        impact: 'medium',
        recommendation: 'Consider equipment acquisition or rental',
      });
    }

    // Project-Material correlation
    const avgMaterialsPerProject =
      projects.length > 0 && materials.length > 0
        ? materials.length / projects.length
        : 0;

    if (avgMaterialsPerProject > 10) {
      this.optimizations.push({
        id: 'correlation-proj-mat',
        category: 'correlations',
        title: 'Material Inventory Optimization',
        message: `Average materials per project: ${avgMaterialsPerProject.toFixed(
          1
        )}`,
        impact: 'medium',
        action: 'Review material usage patterns',
      });
    }
  }

  generatePredictions(data) {
    // Generate predictive insights
    const { projects, staff, equipment, materials } = data;

    // Project completion prediction
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    if (activeProjects > 0) {
      const avgCompletionTime = this.calculateAverageCompletionTime(projects);
      this.predictions.push({
        id: 'pred-project-completion',
        category: 'projects',
        title: 'Project Completion Forecast',
        message: `Based on current trends, ${Math.min(
          activeProjects,
          2
        )} projects expected to complete in ${avgCompletionTime} days`,
        confidence: 75,
        timeframe: 'next 30 days',
      });
    }

    // Equipment maintenance prediction
    const maintenanceDue = equipment.filter(
      (e) => e.hoursUsed > (e.maintenanceThreshold || 1000) * 0.8
    ).length;

    if (maintenanceDue > 0) {
      this.predictions.push({
        id: 'pred-equip-maintenance',
        category: 'equipment',
        title: 'Maintenance Schedule Prediction',
        message: `${maintenanceDue} equipment items will require maintenance within 2 weeks`,
        confidence: 80,
        timeframe: 'next 14 days',
        recommendation: 'Schedule maintenance to prevent downtime',
      });
    }
  }

  detectAnomalies(data) {
    // Detect statistical anomalies (simplified)
    const { projects, staff, equipment, materials } = data;

    // Simple anomaly detection for demonstration
    if (projects.length > 0 && staff.length > 0 && equipment.length > 0) {
      this.anomalies.push({
        id: 'anomaly-demo',
        category: 'general',
        title: 'Business Health Analysis',
        message: 'AI analysis completed successfully',
        severity: 'info',
      });
    }
  }

  generateSummary() {
    return {
      totalInsights: this.insights.length,
      criticalAlerts: this.alerts.filter((a) => a.priority >= 9).length,
      totalPredictions: this.predictions.length,
      totalOptimizations: this.optimizations.length,
      totalAnomalies: this.anomalies.length,
      overallHealth: this.calculateOverallHealth(),
    };
  }

  calculateOverallHealth() {
    const alerts = this.alerts.length;
    const criticalAlerts = this.alerts.filter((a) => a.priority >= 9).length;

    if (criticalAlerts > 0) return 'critical';
    if (alerts > 5) return 'warning';
    if (alerts > 2) return 'caution';
    return 'healthy';
  }

  // Helper calculation methods
  calculateStaffProductivity(staff) {
    // Mock calculation - in real app, use actual metrics
    const baseProductivity = 85;
    const variation = (Math.random() - 0.5) * 30;
    return Math.max(0, Math.min(100, baseProductivity + variation));
  }

  calculateStaffUtilization(staff) {
    // Mock calculation
    const baseUtilization = 75;
    const variation = (Math.random() - 0.5) * 40;
    return Math.max(0, Math.min(100, baseUtilization + variation));
  }

  calculateEquipmentUtilization(equipment) {
    // Mock calculation
    const baseUtilization = 60;
    const variation = (Math.random() - 0.5) * 50;
    return Math.max(0, Math.min(100, baseUtilization + variation));
  }

  calculateEquipmentEfficiency(equipment) {
    // Mock calculation
    const baseEfficiency = 0.85;
    const variation = (Math.random() - 0.5) * 0.3;
    return Math.max(0, Math.min(1, baseEfficiency + variation));
  }

  calculateMaterialUsageTrend(material) {
    // Mock calculation
    return (Math.random() - 0.5) * 40;
  }

  calculateMaterialCostEfficiency(material) {
    // Mock calculation
    const baseEfficiency = 0.92;
    const variation = (Math.random() - 0.5) * 0.15;
    return Math.max(0, Math.min(1, baseEfficiency + variation));
  }

  calculateAverageCompletionTime(projects) {
    // Mock calculation
    return Math.floor(14 + Math.random() * 21);
  }
}

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
  const aiEngine = useRef(new ComprehensiveAIEngine());
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load all data with robust error handling
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
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = { projects, staff, equipment, materials };
    const analysis = aiEngine.current.analyze(data);
    setAiAnalysis(analysis);

    setIsAnalyzing(false);
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;