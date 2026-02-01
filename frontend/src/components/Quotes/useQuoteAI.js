import { useState } from 'react';
import { api } from '../../utils/api';
import { useReactFlow } from '@xyflow/react';

export const useQuoteAI = (nodes, edges, quoteItems, selectedProject, setNodes, setEdges, setQuoteItems, deleteNode, updateItemNodeData, addNotification) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
    const { screenToFlowPosition, fitView } = useReactFlow();

    const handleAIChat = async (message, quoteSettings, financials, historicalDeltas, projects) => {
        if (!message.trim()) return;
        
        if (!navigator.onLine) {
            setChatMessages(prev => [...prev, { role: 'user', content: message }]);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "I am offline. Please connect to the internet to access my reasoning core." }]);
            return;
        }

        setChatMessages(prev => [...prev, { role: 'user', content: message }]);
        setIsTyping(true);
        try {
            // Prepare Rich Context for "World's Best" Estimation
            const graphSummary = nodes.map(n => {
                let value = 0;
                if (n.data.quoteTotal) value = n.data.quoteTotal;
                else if (n.data.rate && n.data.quantity) value = n.data.rate * n.data.quantity;
                
                return {
                    id: n.id,
                    type: n.type,
                    label: n.data.label || n.type,
                    data: n.data, 
                    value: value
                };
            });

            const context = { 
                project: projects.find(p => p.id === selectedProject) || {}, 
                items: quoteItems.map(i => ({ id: i.tempId, name: i.material.name, qty: i.quantity, type: i.type })), 
                nodes: graphSummary, 
                edges,
                settings: quoteSettings,
                financials 
            };
            
            const res = await api.post('/ai/chat-quote', { 
                message, 
                context: { ...context, historicalContext: historicalDeltas } 
            });
            setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, actions: res.data.suggestedActions, nodes: res.data.suggestedNodes }]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsTyping(false);
        }
    };

    const handleGenerateBlueprint = async (prompt, historicalDeltas) => {
        if (!prompt || !prompt.trim()) { addNotification('warning', 'Input Required', 'Please describe what you want to build.'); return; }
        
        if (!navigator.onLine) {
            setChatMessages(prev => [...prev, { role: 'user', content: `Generate Blueprint: ${prompt}` }]);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Blueprint generation requires Neural Link. Please reconnect." }]);
            return;
        }

        setIsGeneratingBlueprint(true);
        setChatMessages(prev => [...prev, { role: 'user', content: `Generate Blueprint: ${prompt}` }]);
        try {
            const startTime = Date.now();
            const res = await api.post('/ai/quote', { prompt, historicalContext: historicalDeltas });
            const { nodes: aiNodes, edges: aiEdges } = res.data;
            const elapsed = Date.now() - startTime;
            if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
            
            if (aiNodes && aiNodes.length > 0) {
                addNotification('success', 'Blueprint Generated', 'AI has constructed the visual quote.');
                const newNodes = [];
                const newItems = [];
                const newEdges = [];
                
                // Map types
                aiNodes.forEach(rawNode => {
                    let n = rawNode;
                    if (!n.data) n = { id: rawNode.id || `ai-${Math.random()}`, type: rawNode.type || 'glass', position: rawNode.position || {x:0, y:0}, data: rawNode };
                    if (!n.data) return;
                    
                    const nodeId = n.id;
                    const rawType = n.type || n.data.type;
                    const isZone = rawType === 'zone';
                    const isDimension = rawType === 'dimension';
                    const isContainer = isZone || isDimension;
                    
                    // Item Category (staff/equip/material)
                    const itemCategory = n.data.nodeType || n.data.category || 'material';
                    
                    // CRITICAL FIX: Ensure STAFF/EQUIPMENT get 'duration' populated from 'quantity'
                    const isTimeBased = itemCategory === 'staff' || itemCategory === 'equipment';
                    const quantityVal = parseFloat(n.data.quantity) || 1;

                    newNodes.push({
                        id: nodeId,
                        type: isZone ? 'zone' : isDimension ? 'dimension' : 'glass',
                        position: n.position || { x: Math.random() * 500, y: Math.random() * 500 },
                        data: { 
                            ...n.data, 
                            label: n.data.label || 'New Item',
                            type: itemCategory, 
                            // Ensure duration is set for time-based nodes so they don't show "0H"
                            duration: isTimeBased ? quantityVal : 0,
                            quantity: isTimeBased ? 1 : quantityVal,
                            
                            onUpdate: updateItemNodeData,
                            onDelete: () => deleteNode(nodeId) 
                        },
                        style: isContainer ? { width: isZone ? 400 : 200, height: isZone ? 400 : 200, zIndex: -1 } : undefined
                    });

                    if (!isContainer) {
                        newItems.push({
                            nodeId: n.data.nodeId || n.id,
                            tempId: nodeId,
                            quantity: quantityVal,
                            material: { name: n.data.label || n.label, price: n.data.cost || 0 },
                            type: itemCategory,
                            customRate: n.data.cost
                        });
                    }
                });

                // SMART LINKING
                if (aiEdges && aiEdges.length > 0) {
                    setEdges(prev => [...prev, ...aiEdges]);
                } else {
                    const containers = newNodes.filter(n => n.type === 'zone' || n.type === 'dimension');
                    if (containers.length > 0) {
                        newNodes.filter(n => n.type === 'glass').forEach((itemNode, idx) => {
                            const parent = containers[idx % containers.length];
                            const edgeType = itemNode.data.type === 'staff' || itemNode.data.type === 'equipment' ? 'orbit' : 'gradient';
                            newEdges.push({
                                id: `e-auto-${parent.id}-${itemNode.id}`,
                                source: parent.id,
                                target: itemNode.id,
                                animated: true,
                                type: edgeType 
                            });
                        });
                        setEdges(prev => [...prev, ...newEdges]);
                    }
                }

                setNodes(prev => [...prev, ...newNodes]);
                setQuoteItems(prev => [...prev, ...newItems]);
                setChatMessages(prev => [...prev, { role: 'assistant', content: "Blueprint generated. Items have been auto-structured by phase/zone for clarity." }]);
                setTimeout(() => fitView({ padding: 0.2 }), 500);
            }
        } catch (err) {
            console.error(err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Error generating blueprint." }]);
        } finally {
            setIsGeneratingBlueprint(false);
            setIsTyping(false);
        }
    };

    const handleCopilotAction = (action) => {
        if (action.type === 'add_node') {
             // Let the main component handle simple adds via its addNode function logic if possible, 
             // but here we just return the instruction or call a passed handler?
             // Actually, we can just return the action and let the component handle it, 
             // OR we can implement the complex node adding here if we had access to `addNode`.
             // For now, assume the component passes a handler or we modify `useQuoteAI` to take `addNode`.
        }
        return action;
    };

    return {
        chatMessages, setChatMessages,
        isTyping,
        isGeneratingBlueprint,
        handleAIChat,
        handleGenerateBlueprint,
        handleCopilotAction
    };
};
