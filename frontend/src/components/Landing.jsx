/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, Calendar, FileText, CheckCircle, Star, ArrowRight, Zap, Target, Sparkles, MousePointer, Layers, Wand2, Rocket, Award, TrendingUp, Shield, Play, Pause, Volume2, VolumeX, Trophy, Crown, Diamond, ChevronDown, Check } from 'lucide-react'

const Landing = () => {
  const navigate = useNavigate()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const demoRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % 4)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const demoSteps = [
    {
      title: "Drag Materials",
      description: "Simply drag concrete, gravel, or any material onto the canvas",
      icon: "🧱",
      position: { left: '10%', top: '25%' }
    },
    {
      title: "Add Labor",
      description: "Drop staff members with their hourly rates",
      icon: "👷",
      position: { left: '50%', top: '15%' }
    },
    {
      title: "Include Equipment",
      description: "Add machinery and tools with daily costs",
      icon: "🚜",
      position: { left: '30%', top: '55%' }
    },
    {
      title: "Watch Profits",
      description: "Real-time calculations show your projected profits instantly",
      icon: "💰",
      position: { left: '70%', top: '35%' }
    }
  ]

  const features = [
    {
      icon: <Zap size={48} className="text-primary" />,
      title: 'Revolutionary Drag-Drop Quote Builder',
      description: 'Intuitively drag materials, staff, and equipment onto a visual canvas to create quotes in seconds. No forms, no complexity—just pure innovation.',
      badge: 'PATENT PENDING'
    },
    {
      icon: <Target size={48} className="text-secondary" />,
      title: 'Precision Calculations',
      description: 'Real-time cost analysis, margin optimization, and financial forecasting with every drag. See profits update instantly.',
      badge: '99.9% ACCURACY'
    },
    {
      icon: <Layers size={48} className="text-pink-400" />,
      title: 'Visual Project Flow',
      description: 'Map out entire projects visually with interconnected nodes. Equipment, labor, materials—all flowing together seamlessly.',
      badge: 'GAME CHANGER'
    },
    {
      icon: <Wand2 size={48} className="text-success" />,
      title: 'AI-Powered Insights',
      description: 'Smart suggestions for optimal pricing, cost-saving opportunities, and project efficiency improvements.',
      badge: 'SMART TECH'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Estimator',
      content: 'The drag-drop quote builder changed everything. What used to take hours now takes minutes. It\'s revolutionary!',
      rating: 5,
      highlight: 'Revolutionary',
      company: 'Chen Construction',
      avatar: 'SC'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Construction CEO',
      content: 'Our quoting accuracy improved 40% overnight. The visual interface makes complex estimates intuitive.',
      rating: 5,
      highlight: '40% More Accurate',
      company: 'Rodriguez Builders',
      avatar: 'MR'
    },
    {
      name: 'Emma Thompson',
      role: 'Project Manager',
      content: 'Finally, a tool that matches how we think about construction. Drag, drop, done. Pure genius.',
      rating: 5,
      highlight: 'Intuitive Genius',
      company: 'Thompson Projects',
      avatar: 'ET'
    }
  ]

  const awards = [
    { icon: <Trophy size={32} />, title: 'Best Innovation 2024', org: 'Construction Tech Awards' },
    { icon: <Crown size={32} />, title: '#1 SaaS Solution', org: 'Industry Leaders' },
    { icon: <Diamond size={32} />, title: 'Excellence Award', org: 'Tech Excellence' }
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Professional Particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-indigo-400/30 animate-float" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${20 + Math.random() * 20}s`,
            animationDelay: `${Math.random() * 10}s`
          }} />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center">
          
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in-up">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-stone-900/60 backdrop-blur-lg border border-white/10 rounded-full text-xs font-black text-indigo-300 shadow-xl uppercase tracking-widest hover:scale-105 transition-transform">
              <Sparkles size={14} />
              <span>Revolutionary Innovation</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-xs font-black text-indigo-200 shadow-xl uppercase tracking-widest hover:scale-105 transition-transform">
              <Diamond size={14} />
              <span>Premium Solution</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter text-white animate-fade-in-up delay-100 drop-shadow-2xl">
            The Future of Quoting is <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Drag & Drop</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed font-medium animate-fade-in-up delay-200">
            MasterDiaryApp's revolutionary drag-drop quote builder transforms complex estimates into intuitive visual experiences. Drag materials, staff, and equipment onto an interactive canvas—watch profits calculate in real-time.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-16 animate-fade-in-up delay-300">
            {[ 
              { val: "10x", label: "Faster Quoting", trend: "↑ 1000%" },
              { val: "99%", label: "Accuracy", trend: "↑ 95%" },
              { val: "∞", label: "Innovation", trend: "UNLIMITED" }
            ].map((stat, i) => (
              <div key={i} className="bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[180px] hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                <div className="text-5xl font-black text-white mb-2 tracking-tight">{stat.val}</div>
                <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
                <div className="text-xs text-emerald-400 font-black mt-2 bg-emerald-500/10 px-2 py-1 rounded inline-block">{stat.trend}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-16 animate-fade-in-up delay-400">
            {awards.map((award, index) => (
              <div key={index} className="flex items-center gap-4 bg-stone-900/40 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl hover:bg-stone-800/40 transition-colors">
                <div className="text-amber-400">{award.icon}</div>
                <div className="text-left">
                  <div className="text-sm font-black text-white uppercase tracking-wide">{award.title}</div>
                  <div className="text-[10px] text-gray-500 font-bold">{award.org}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up delay-500">
            <button className="px-10 py-5 bg-white hover:bg-gray-100 text-indigo-900 rounded-full font-black text-xl flex items-center gap-3 shadow-2xl shadow-white/10 transition-all hover:-translate-y-1 hover:scale-105" onClick={() => navigate('/quote-builder')}> 
              <MousePointer size={24} />
              Experience the Revolution <ArrowRight size={24} />
            </button>
            <button className="px-10 py-5 bg-stone-900/60 hover:bg-stone-800 text-white border border-white/20 rounded-full font-bold text-xl flex items-center gap-3 transition-all hover:-translate-y-1 backdrop-blur-md" onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}>
              <Play size={24} className="fill-white" />
              Watch Live Demo
            </button>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Scroll to explore</span>
            <ChevronDown size={24} />
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-32 relative bg-stone-950/80 backdrop-blur-xl border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Play size={14} className="fill-current" />
              <span>Live Interactive Demo</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white tracking-tight">See It In Action</h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Watch how revolutionary drag-drop quoting transforms construction estimating in real-time
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto bg-stone-900/60 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden h-[700px] flex flex-col md:flex-row gap-8 backdrop-blur-2xl ring-1 ring-white/5">
            {/* Sidebar Mockup */}
            <div className="w-full md:w-72 bg-black/20 rounded-2xl p-6 flex flex-col gap-4 border border-white/5">
               <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tools Panel</div>
               <div className="p-4 bg-stone-800/50 rounded-xl flex items-center gap-4 cursor-grab hover:bg-stone-700/50 transition-all border border-white/5 hover:border-indigo-500/50 group">
                 <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🧱</span>
                 <div>
                   <div className="font-bold text-white text-sm">Materials</div>
                   <div className="text-xs text-gray-500 font-mono">Drag to add</div>
                 </div>
               </div>
               <div className="p-4 bg-stone-800/50 rounded-xl flex items-center gap-4 cursor-grab hover:bg-stone-700/50 transition-all border border-white/5 hover:border-emerald-500/50 group">
                 <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">👷</span>
                 <div>
                   <div className="font-bold text-white text-sm">Staff</div>
                   <div className="text-xs text-gray-500 font-mono">$85/hr</div>
                 </div>
               </div>
               <div className="p-4 bg-stone-800/50 rounded-xl flex items-center gap-4 cursor-grab hover:bg-stone-700/50 transition-all border border-white/5 hover:border-amber-500/50 group">
                 <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🚜</span>
                 <div>
                   <div className="font-bold text-white text-sm">Equipment</div>
                   <div className="text-xs text-gray-500 font-mono">$200/day</div>
                 </div>
               </div>
               
               <div className="mt-auto p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/30 text-center relative overflow-hidden">
                 <div className="relative z-10">
                   <div className="text-3xl font-black text-white tracking-tight">$127,450</div>
                   <div className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold mt-1">Projected Profit</div>
                 </div>
               </div>
            </div>

            {/* Canvas Mockup */}
            <div className="flex-1 relative bg-stone-950/50 rounded-2xl border border-white/5 overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[size:40px_40px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] pointer-events-none" />
              
              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  className={`absolute transition-all duration-500 transform
                    ${currentStep === index ? 'opacity-100 scale-110 z-10' : 'opacity-30 scale-90 z-0 blur-sm'}
                  `}
                  style={{ left: step.position.left, top: step.position.top }}
                >
                  <div className="bg-stone-900/90 border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 w-48 backdrop-blur-md">
                    <div className="text-5xl mb-2">{step.icon}</div>
                    <div className="text-xs font-black text-center text-white uppercase tracking-wide">{step.title}</div>
                  </div>
                </div>
              ))}
              
              <div className="absolute bottom-8 right-8 flex gap-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
                >
                   {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
                </button>
              </div>

              <div className="absolute top-6 left-6 flex items-center gap-2 text-white/30 text-xs font-mono font-bold uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Canvas Active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-transparent">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-black text-center mb-6 text-white tracking-tight">Built Around the Revolution</h2>
          <p className="text-gray-400 text-center mb-20 max-w-2xl mx-auto text-lg">Everything in MasterDiaryApp enhances your drag-drop quoting experience</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-stone-900/40 backdrop-blur-md border border-white/10 p-10 rounded-3xl transition-all hover:-translate-y-2 hover:border-indigo-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white/5 px-6 py-3 rounded-bl-3xl text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-l border-white/5">
                  {feature.badge}
                </div>
                <div className="mb-8 p-5 bg-black/30 rounded-2xl w-fit group-hover:scale-110 transition-transform border border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 text-white tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-b from-transparent to-black/80">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-black text-center mb-20 text-white tracking-tight">The Revolution Speaks</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-stone-900/40 backdrop-blur-md border border-white/10 p-10 rounded-3xl hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{testimonial.name}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">{testimonial.role}</div>
                    <div className="text-[10px] text-indigo-400 uppercase tracking-widest mt-1 font-black">{testimonial.company}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic text-lg leading-relaxed font-medium">"{testimonial.content}"</p>
                <div className="mt-8 inline-block px-4 py-1.5 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full">
                  {testimonial.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-6xl font-black mb-8 text-white tracking-tighter">Ready to Join the Revolution?</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium">
            Experience the future of construction quoting. Drag-drop your way to better profits.
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-16">
            <div className="flex items-center gap-3 text-white font-bold">
              <CheckCircle size={24} className="text-emerald-500 fill-emerald-500/20" /> Free 14-day trial
            </div>
            <div className="flex items-center gap-3 text-white font-bold">
              <CheckCircle size={24} className="text-emerald-500 fill-emerald-500/20" /> No credit card required
            </div>
            <div className="flex items-center gap-3 text-white font-bold">
              <CheckCircle size={24} className="text-emerald-500 fill-emerald-500/20" /> Full access
            </div>
          </div>

          <button 
            onClick={() => navigate('/quote-builder')}
            className="px-12 py-6 bg-white text-indigo-900 hover:bg-gray-100 rounded-full font-black text-2xl shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all flex items-center gap-4 mx-auto transform hover:scale-105"
          >
            <Rocket size={28} />
            Start Your Revolution
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black text-white tracking-tight mb-3">
                MasterDiary<span className="text-indigo-500">App</span>
              </h3>
              <p className="text-gray-500 text-sm font-medium">Revolutionizing construction with drag-drop innovation</p>
            </div>
            <div className="flex gap-8 font-bold text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Testimonials</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Login</a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600 font-bold uppercase tracking-widest">
            <p>&copy; 2025 MasterDiaryApp. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-gray-400">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
