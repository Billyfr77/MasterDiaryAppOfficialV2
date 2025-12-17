import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';

const PlanCard = ({ title, price, features, recommended, onSubscribe, currentPlan, loading }) => {
    const isCurrent = currentPlan === title.toLowerCase();
    
    return (
        <div className={`relative p-8 rounded-3xl border flex flex-col h-full transition-all duration-300 ${recommended ? 'bg-gradient-to-b from-indigo-900/40 to-stone-900 border-indigo-500/50 shadow-2xl scale-105 z-10' : 'bg-stone-900/60 border-white/5 hover:border-white/10'}`}>
            {recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Most Popular
                </div>
            )}
            <h3 className="text-xl font-black text-white uppercase tracking-wide mb-2">{title}</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">${price}</span>
                <span className="text-sm text-gray-400 font-bold">/mo</span>
            </div>
            
            <div className="flex-1 space-y-4 mb-8">
                {features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${recommended ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-400'}`}>
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-300 font-medium">{feat}</span>
                    </div>
                ))}
            </div>

            <button 
                onClick={() => onSubscribe(title.toLowerCase())}
                disabled={loading || isCurrent}
                className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2
                    ${isCurrent 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                        : recommended 
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                            : 'bg-white text-black hover:bg-gray-200'}
                `}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {isCurrent ? 'Current Plan' : 'Subscribe Now'}
            </button>
        </div>
    );
};

const SubscriptionPage = () => {
    const [currentPlan, setCurrentPlan] = useState('free');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch current subscription status
        api.get('/subscriptions').then(res => {
            setCurrentPlan(res.data.plan || 'free');
        }).catch(err => console.error(err));
    }, []);

    const handleSubscribe = async (plan) => {
        setLoading(true);
        try {
            const res = await api.post('/stripe/create-checkout-session', { plan });
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            console.error("Subscription Error", err);
            alert("Failed to start checkout.");
        } finally {
            setLoading(false);
        }
    };

    const handleManage = async () => {
        setLoading(true);
        try {
            const res = await api.post('/stripe/create-portal-session');
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            alert("Failed to open billing portal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-950 text-white p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="flex justify-between items-center mb-8">
                        <button onClick={() => window.history.back()} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Back</button>
                        {process.env.NODE_ENV === 'development' && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded uppercase">Dev Mode: Payments Simulated</span>}
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">Upgrade your Workflow</h1>
                    <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto">
                        Choose the plan that fits your construction business. Scale up as you grow with enterprise-grade features and AI power.
                    </p>
                    
                    <div className="flex gap-4 justify-center mt-8">
                        {currentPlan !== 'free' && (
                            <button onClick={handleManage} className="px-6 py-3 bg-stone-800 border border-white/10 rounded-xl hover:bg-stone-700 transition-all font-bold text-sm flex items-center gap-2">
                                <CreditCard size={16} /> Manage Billing & Invoices
                            </button>
                        )}
                        <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-3 text-gray-400 hover:text-white font-bold text-sm underline decoration-gray-700 underline-offset-4">
                            Continue with Free Plan
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <PlanCard 
                        title="Starter" 
                        price="29" 
                        features={['5 Active Projects', 'Basic Quoting', 'Standard Invoicing', '5GB Document Storage']} 
                        onSubscribe={handleSubscribe}
                        currentPlan={currentPlan}
                        loading={loading}
                    />
                    <PlanCard 
                        title="Pro" 
                        price="79" 
                        recommended={true}
                        features={['Unlimited Projects', 'AI Quote Estimator', 'Safety Compliance Suite', 'Visual Map Builder', '50GB Storage', 'Xero Integration']} 
                        onSubscribe={handleSubscribe}
                        currentPlan={currentPlan}
                        loading={loading}
                    />
                    <PlanCard 
                        title="Enterprise" 
                        price="199" 
                        features={['Unlimited Everything', 'Dedicated Support', 'Custom AI Training', 'API Access', 'White Labeling', 'Advanced Analytics']} 
                        onSubscribe={handleSubscribe}
                        currentPlan={currentPlan}
                        loading={loading}
                    />
                </div>
                
                <div className="mt-20 border-t border-white/10 pt-10 text-center">
                    <p className="text-gray-500 text-sm font-bold">Trusted by 500+ Construction Firms Worldwide</p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
