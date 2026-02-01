import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import { SmartEdgeTypes } from '../TimelineCanvas/SmartEdges';

export const useQuoteGraph = (initialNodes = [], initialEdges = []) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [quoteItems, setQuoteItems] = useState([]);
    const { screenToFlowPosition } = useReactFlow();

    // --- SMART CONNECTION LOGIC ---
    const isValidConnection = useCallback((connection) => {
        const source = nodes.find(n => n.id === connection.source);
        const target = nodes.find(n => n.id === connection.target);
        if (!source || !target) return false;

        // Logic: Areas drive Materials/Labour
        if (source.type === 'areaNode') {
            return ['quoteMaterial', 'quoteLabour'].includes(target.type);
        }
        // Logic: Zones organize everything
        if (source.type === 'zone') {
            return ['quoteMaterial', 'quoteLabour', 'areaNode', 'taskNode'].includes(target.type);
        }
        
        // Default: Allow loose connections for other types
        return true;
    }, [nodes]);

    const getSmartEdgeParams = useCallback((sourceId) => { 
        const sourceNode = nodes.find(n => n.id === sourceId); 
        const type = sourceNode?.data?.type || 'material'; 
        let edgeType = 'default'; 
        
        if (type === 'staff' || type === 'equipment') edgeType = 'orbit'; 
        else if (type === 'material') edgeType = 'gradient'; 
        
        return { type: edgeType, data: { type, sourceType: type } }; 
    }, [nodes]);

    const onConnect = useCallback((params) => { 
        // We can add validation notification in the component level if needed
        const smartParams = getSmartEdgeParams(params.source); 
        setEdges((eds) => addEdge({ ...params, ...smartParams, animated: true }, eds)); 
    }, [setEdges, getSmartEdgeParams]);

    const deleteNode = useCallback((id) => { 
        setNodes((nds) => nds.filter(n => n.id !== id)); 
        setQuoteItems((items) => items.filter(i => i.tempId !== id)); 
    }, [setNodes]);

    const updateItemNodeData = useCallback((nodeId, updates) => {
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n));
        setQuoteItems(items => items.map(i => i.tempId === nodeId ? { ...i, ...updates } : i));
    }, [setNodes]);

    const addNode = useCallback((item, position, customName = null, quantity = 1, cost = 0) => {
        const nodeId = `${item.type}-${Date.now()}`; 
        const finalName = customName || item.name;
        
        const isZone = item.type === 'zone' || item.type === 'wormhole';
        const isDimension = item.type === 'dimension' || item.type === 'areaNode';
        
        // Determine correct quantity field based on type
        // Staff/Equipment use 'duration', others use 'quantity'
        const isTimeBased = item.type === 'staff' || item.type === 'equipment';
        
        const nodeData = { 
            label: finalName, 
            subLabel: item.type, 
            type: item.type, // For DiaryNode styling
            onDelete: () => deleteNode(nodeId),
            onUpdate: updateItemNodeData,
            // Generic props
            quantity: isTimeBased ? 1 : quantity,
            duration: isTimeBased ? quantity : 0, // CRITICAL FIX: Ensure duration is set for staff/equip
            
            // Special Node Defaults
            ...(item.type === 'taskNode' ? { plannedHours: 8, status: 'pending' } : {}),
            ...(item.type === 'zone' ? { zoneTotal: 0, nodeCount: 0 } : {}),
            ...(item.type === 'areaNode' ? { width: 10, length: 10, depth: 0 } : {}),
            ...(item.type === 'quoteMaterial' ? { rate: cost || item.pricePerUnit || 0, coverage: 10, waste: 10, unit: item.unit || 'Unit' } : {}),
            ...(item.type === 'quoteLabour' ? { rate: cost || item.chargeOutBase || 0, prodRate: 2 } : {}),
            ...(item.type === 'profitNode' ? { markup: 20, overhead: 10, contingency: 5, quoteTotal: 0 } : {}),
            ...(item.type === 'estimationPrism' ? { status: 'analyzing', quoteTotal: 0, profitMargin: '0%', riskLevel: 'low' } : {})
        };

        const newNode = { 
            id: nodeId, 
            type: item.type || 'glass', 
            position, 
            data: nodeData,
            style: (isZone || isDimension) ? { width: isZone ? 400 : (item.type === 'areaNode' ? 300 : 200), height: isZone ? 400 : (item.type === 'areaNode' ? 300 : 200), zIndex: -1 } : undefined
        };

        setNodes(nds => nds.concat(newNode)); 
        
        const isLogicNode = ['zone', 'wormhole', 'dimension', 'neuralPrism', 'chronos', 'shapeNode', 'photoNode', 'areaNode', 'quoteMaterial', 'quoteLabour', 'profitNode', 'estimationPrism'].includes(item.type);
        if (!isLogicNode) {
            setQuoteItems(prev => [...prev, { nodeId: item.id, tempId: nodeId, quantity, material: { ...item, name: finalName }, type: item.type, customRate: cost > 0 ? cost : undefined }]); 
        }
    }, [setNodes, deleteNode, updateItemNodeData]);

    return {
        nodes, setNodes, onNodesChange,
        edges, setEdges, onEdgesChange,
        onConnect,
        isValidConnection,
        addNode,
        deleteNode,
        updateItemNodeData,
        quoteItems, setQuoteItems
    };
};
