// Landing.jsx without InteractiveQuoteSandbox import
// Replace the current Landing.jsx with this content

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
      icon: <Zap size={48} color="#667eea" />,
      title: 'Revolutionary Drag-Drop Quote Builder',
      description: 'Intuitively drag materials, staff, and equipment onto a visual canvas to create quotes in seconds. No forms, no complexity—just pure innovation.',
      badge: 'PATENT PENDING'
    },
    {
      icon: <Target size={48} color="#764ba2" />,
      title: 'Precision Calculations',
      description: 'Real-time cost analysis, margin optimization, and financial forecasting with every drag. See profits update instantly.',
      badge: '99.9% ACCURACY'
    },
    {
      icon: <Layers size={48} color="#f093fb" />,
      title: 'Visual Project Flow',
      description: 'Map out entire projects visually with interconnected nodes. Equipment, labor, materials—all flowing together seamlessly.',
      badge: 'GAME CHANGER'
    },
    {
      icon: <Wand2 size={48} color="#4ecdc4" />,
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
    <div className="landing" style={{
      background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(102, 126, 234, 0.1) 0%, transparent 50%)`,
      transition: 'background 0.3s ease'
    }}>
      {/* Professional Particles */}
      <div className="particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 25}s`,
            animationDuration: `${35 + Math.random() * 25}s`,
            background: `hsl(${200 + Math.random() * 60}, 50%, 70%)`
          }} />
        ))}
      </div>

      {/* Morphing Background */}
      <div className="morphing-bg">
        <div className="morph-shape shape1"></div>
        <div className="morph-shape shape2"></div>
        <div className="morph-shape shape3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero" style={{
        transform: `translateY(${scrollY * 0.5}px)`,
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%), radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 70%)`
      }}>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badges">
              <div className="badge badge-glow">
                <Sparkles size={16} />
                <span>REVOLUTIONARY INNOVATION</span>
              </div>
              <div className="badge badge-premium">
                <Diamond size={16} />
                <span>PREMIUM SOLUTION</span>
              </div>
            </div>
            <h1 className="hero-title">
              The Future of Construction Quoting is <span className="highlight">Drag & Drop</span>
            </h1>
            <p className="hero-subtitle">
              MasterDiaryApp's revolutionary drag-drop quote builder transforms complex estimates into intuitive visual experiences. Drag materials, staff, and equipment onto an interactive canvas—watch profits calculate in real-time. No spreadsheets, no confusion—just pure construction genius.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10x</div>
                <div className="stat-label">Faster Quoting</div>
                <div className="stat-trend">↑ 1000%</div>
              </div>
              <div className="stat">
                <div className="stat-number">99%</div>
                <div className="stat-label">Accuracy</div>
                <div className="stat-trend">↑ 95%</div>
              </div>
              <div className="stat">
                <div className="stat-number">∞</div>
                <div className="stat-label">Innovation</div>
                <div className="stat-trend">UNLIMITED</div>
              </div>
            </div>
            <div className="hero-awards">
              {awards.map((award, index) => (
                <div key={index} className="award" style={{ animationDelay: `${index * 0.2}s` }}>
                  {award.icon}
                  <div>
                    <div className="award-title">{award.title}</div>
                    <div className="award-org">{award.org}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/quote-builder')}>
                <MousePointer size={20} />
                Experience the Revolution <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}>
                <Play size={20} />
                Watch Live Demo
              </button>
            </div>
            <div className="scroll-indicator">
              <ChevronDown size={24} />
              <span>Scroll to explore</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="drag-demo" ref={demoRef}>
              <div className="canvas-mockup">
                {demoSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`floating-element ${currentStep === index ? 'active' : ''}`}
                    style={{
                      left: step.position.left,
                      top: step.position.top,
                      animationDelay: `${index * 0.5}s`,
                      zIndex: currentStep === index ? 10 : 1
                    }}
                  >
                    <div className="element-icon">{step.icon}</div>
                    <div className="element-label">{step.title}</div>
                  </div>
                ))}
                <div className="profit-display">
                  <div className="profit-amount animate-number">$127,450</div>
                  <div className="profit-label">Projected Profit</div>
                  <div className="profit-sparkle">✨</div>
                  <div className="profit-trend">↗️ +23%</div>
                </div>
                <div className="drag-hint">
                  <MousePointer size={24} />
                  <span>{isPlaying ? 'Watch the magic happen...' : 'Click play to see it in action'}</span>
                </div>
                <button
                  className="demo-play-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(102, 126, 234, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>
              <div className="sidebar-mockup">
                <div className="sidebar-header">
                  <h4>Drag Items Here</h4>
                  <div className="sidebar-stats">
                    <div className="stat-mini">
                      <span className="stat-mini-number">3</span>
                      <span className="stat-mini-label">Materials</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-number">2</span>
                      <span className="stat-mini-label">Staff</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-number">1</span>
                      <span className="stat-mini-label">Equipment</span>
                    </div>
                  </div>
                </div>
                <div className="sidebar-item material">
                  <div className="item-icon">🪨</div>
                  <div className="item-info">
                    <div className="item-name">Gravel</div>
                    <div className="item-price">$45/ton</div>
                  </div>
                  <div className="drag-indicator">↗️</div>
                </div>
                <div className="sidebar-item staff">
                  <div className="item-icon">👨‍🔧</div>
                  <div className="item-info">
                    <div className="item-name">Electrician</div>
                    <div className="item-price">$85/hr</div>
                  </div>
                  <div className="drag-indicator">↗️</div>
                </div>
                <div className="sidebar-item equipment">
                  <div className="item-icon">🏗️</div>
                  <div className="item-info">
                    <div className="item-name">Crane</div>
                    <div className="item-price">$200/day</div>
                  </div>
                  <div className="drag-indicator">↗️</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="demo-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Play size={24} />
              <span>LIVE DEMO</span>
            </div>
            <h2 className="section-title">See It In Action</h2>
            <p className="section-subtitle">
              Watch how revolutionary drag-drop quoting transforms construction estimating in real-time
            </p>
          </div>
          <div className="demo-steps">
            {demoSteps.map((step, index) => (
              <div
                key={index}
                className={`demo-step ${currentStep === index ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {currentStep === index && <div className="step-active-indicator">▶️</div>}
              </div>
            ))}
          </div>
          <div className="demo-controls">
            <button
              className="btn btn-secondary"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause Demo' : 'Play Demo'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/quote-builder')}
            >
              Try It Yourself <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Revolutionary Drag-Drop Section */}
      <section className="revolutionary-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Rocket size={24} />
              <span>THE REVOLUTION</span>
            </div>
            <h2 className="section-title">Why Drag-Drop Changes Everything</h2>
            <p className="section-subtitle">
              Traditional quoting methods are obsolete. Our revolutionary drag-drop system reimagines how construction professionals create estimates.
            </p>
          </div>
          <div className="revolution-grid">
            <div className="revolution-card">
              <div className="card-icon">
                <Zap size={40} />
              </div>
              <h3>Instant Visual Feedback</h3>
              <p>Every drag updates costs, margins, and profits in real-time. No more guessing—see results instantly.</p>
              <div className="card-benefit">
                <Check size={16} />
                <span>Real-time calculations</span>
              </div>
            </div>
            <div className="revolution-card">
              <div className="card-icon">
                <Target size={40} />
              </div>
              <h3>Intuitive Workflow</h3>
              <p>Mirrors how construction professionals think. Drag materials, connect labor, add equipment—naturally.</p>
              <div className="card-benefit">
                <Check size={16} />
                <span>Natural interaction</span>
              </div>
            </div>
            <div className="revolution-card">
              <div className="card-icon">
                <TrendingUp size={40} />
              </div>
              <h3>Profit Optimization</h3>
              <p>AI suggestions help maximize margins while maintaining competitive pricing. Smarter quotes, better profits.</p>
              <div className="card-benefit">
                <Check size={16} />
                <span>AI-powered insights</span>
              </div>
            </div>
            <div className="revolution-card">
              <div className="card-icon">
                <Shield size={40} />
              </div>
              <h3>Accuracy Guaranteed</h3>
              <p>Visual system eliminates calculation errors. What you see is what you quote—precisely.</p>
              <div className="card-benefit">
                <Check size={16} />
                <span>Zero calculation errors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Built Around the Revolution</h2>
          <p className="section-subtitle">Everything in MasterDiaryApp enhances your drag-drop quoting experience</p>
          <div className="grid grid-2">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card" style={{
                animationDelay: `${index * 0.2}s`
              }}>
                <div className="feature-badge">{feature.badge}</div>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">The Revolution Speaks</h2>
          <div className="grid grid-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card card" style={{
                animationDelay: `${index * 0.3}s`
              }}>
                <div className="testimonial-avatar">
                  <div className="avatar-circle">{testimonial.avatar}</div>
                  <div className="avatar-company">{testimonial.company}</div>
                </div>
                <div className="testimonial-highlight">{testimonial.highlight}</div>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} color="#ffd700" fill="#ffd700" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <br />
                  <small>{testimonial.role}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="metrics-section">
        <div className="container">
          <h2 className="section-title">Proven Results</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-number">500+</div>
              <div className="metric-label">Construction Companies</div>
              <div className="metric-description">Trust our revolutionary system</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">$2.3M</div>
              <div className="metric-label">Time Saved Annually</div>
              <div className="metric-description">Across all our users</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">98%</div>
              <div className="metric-label">User Satisfaction</div>
              <div className="metric-description">Based on user feedback</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">24/7</div>
              <div className="metric-label">Support Available</div>
              <div className="metric-description">Always here to help</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-badges">
              <div className="cta-badge">
                <Award size={32} />
                <span>#1 Construction SaaS</span>
              </div>
              <div className="cta-badge">
                <Trophy size={32} />
                <span>Award Winning</span>
              </div>
            </div>
            <h2>Ready to Join the Revolution?</h2>
            <p>Experience the future of construction quoting. Drag-drop your way to better profits.</p>
            <div className="cta-features">
              <div className="cta-feature">
                <Check size={16} />
                <span>Free 14-day trial</span>
              </div>
              <div className="cta-feature">
                <Check size={16} />
                <span>No credit card required</span>
              </div>
              <div className="cta-feature">
                <Check size={16} />
                <span>Full access to all features</span>
              </div>
            </div>
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/quote-builder')}>
              <Rocket size={24} />
              Start Your Revolution <ArrowRight size={24} style={{ marginLeft: '12px' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>MasterDiaryApp</h3>
              <p>Revolutionizing construction with drag-drop innovation</p>
              <div className="footer-social">
                <div className="social-link">📘</div>
                <div className="social-link">🐦</div>
                <div className="social-link">💼</div>
              </div>
            </div>
            <div className="footer-links">
              <a href="#demo" className="footer-link">Live Demo</a>
              <a href="#revolutionary" className="footer-link">The Revolution</a>
              <a href="#features" className="footer-link">Features</a>
              <a href="#testimonials" className="footer-link">Testimonials</a>
              <button onClick={() => navigate('/quote-builder')} className="footer-link">Try It Now</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 MasterDiaryApp. Leading the construction revolution.</p>
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Privacy Policy</a>
              <a href="#" className="footer-legal-link">Terms of Service</a>
              <a href="#" className="footer-legal-link">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .landing {
          min-height: 100vh;
          overflow-x: hidden;
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: professionalFloat 30s linear infinite;
        }

        .morphing-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }

        .morph-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
          animation: morph 25s ease-in-out infinite;
        }

        .shape1 {
          width: 250px;
          height: 250px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape2 {
          width: 180px;
          height: 180px;
          top: 60%;
          right: 10%;
          animation-delay: 7s;
        }

        .shape3 {
          width: 120px;
          height: 120px;
          bottom: 20%;
          left: 50%;
          animation-delay: 14s;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          color: white;
        }

        .hero-badges {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.9em;
          font-weight: bold;
        }

        .badge-glow {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          animation: glow 3s ease-in-out infinite alternate;
        }

        .badge-premium {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          color: #333;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          margin-bottom: 24px;
          line-height: 1.1;
          text-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
        }

        .highlight {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          margin-bottom: 32px;
          opacity: 0.9;
          line-height: 1.6;
          max-width: 600px;
        }

        .hero-stats {
          display: flex;
          gap: 32px;
          margin-bottom: 32px;
        }

        .stat {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #ffd700;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        .stat-trend {
          font-size: 0.7rem;
          color: #4ecdc4;
          margin-top: 4px;
          font-weight: bold;
        }

        .hero-awards {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .award {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .award-title {
          font-size: 0.8rem;
          font-weight: bold;
        }

        .award-org {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          color: #333;
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255, 215, 0, 0.4);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .btn-lg {
          padding: 18px 32px;
          font-size: 1.1rem;
        }

        .btn-xl {
          padding: 20px 40px;
          font-size: 1.2rem;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          animation: bounce 3s ease-in-out infinite;
        }

        .hero-visual {
          position: relative;
          z-index: 2;
        }

        .drag-demo {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .canvas-mockup {
          width: 500px;
          height: 400px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          border: 2px dashed rgba(255,255,255,0.3);
          border-radius: 20px;
          position: relative;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }

        .canvas-mockup::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid-canvas" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid-canvas)"/></svg>');
          opacity: 0.5;
        }

        .floating-element {
          position: absolute;
          background: rgba(255,255,255,0.95);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          animation: elementFloat 4s ease-in-out infinite;
          cursor: grab;
          transition: all 0.3s ease;
          z-index: 1;
        }

        .floating-element.active {
          transform: scale(1.05);
          box-shadow: 0 10px 28px rgba(102, 126, 234, 0.3);
          animation: elementPulse 2s ease-in-out infinite;
        }

        .element-icon {
          font-size: 1.5rem;
        }

        .element-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #333;
        }

        .profit-display {
          position: absolute;
          top: 20px;
          right: 20px;
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          color: white;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(78, 205, 196, 0.3);
        }

        .animate-number {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .profit-label {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .profit-sparkle {
          position: absolute;
          top: -5px;
          right: -5px;
          animation: sparkle 3s ease-in-out infinite;
        }

        .profit-trend {
          font-size: 0.7rem;
          color: #ffd700;
          margin-top: 4px;
        }

        .drag-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(102, 126, 234, 0.9);
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.9rem;
          animation: pulse 3s ease-in-out infinite;
        }

        .sidebar-mockup {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-header {
          background: rgba(255,255,255,0.1);
          padding: 16px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .sidebar-header h4 {
          margin: 0 0 12px 0;
          color: white;
          font-size: 1rem;
        }

        .sidebar-stats {
          display: flex;
          gap: 12px;
        }

        .stat-mini {
          text-align: center;
          flex: 1;
        }

        .stat-mini-number {
          display: block;
          font-size: 1.2rem;
          font-weight: bold;
          color: #ffd700;
        }

        .stat-mini-label {
          font-size: 0.7rem;
          opacity: 0.8;
          color: white;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.1);
          padding: 12px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          min-width: 200px;
          transition: all 0.3s ease;
          cursor: grab;
        }

        .sidebar-item:hover {
          transform: translateX(6px);
          background: rgba(255,255,255,0.15);
        }

        .item-icon {
          font-size: 1.5rem;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          font-weight: 500;
          color: white;
        }

        .item-price {
          font-size: 0.8rem;
          opacity: 0.8;
          color: #ffd700;
        }

        .drag-indicator {
          font-size: 1rem;
          opacity: 0.6;
        }

        .demo-section {
          padding: 100px 0;
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          position: relative;
          color: #333;
        }

        .demo-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
          margin: 60px 0;
        }

        .demo-step {
          background: rgba(255,255,255,0.95);
          padding: 32px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          border: 2px solid transparent;
          color: #333;
        }

        .demo-step:hover, .demo-step.active {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.15);
          border-color: #667eea;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin: 0 auto 16px;
        }

        .step-icon {
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .step-active-indicator {
          position: absolute;
          top: -10px;
          right: -10px;
          font-size: 1.5rem;
        }

        .demo-controls {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .revolutionary-section {
          padding: 100px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          position: relative;
        }

        .revolutionary-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(102,126,234,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
          position: relative;
          z-index: 1;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.9em;
          font-weight: bold;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          margin-bottom: 16px;
          color: #333;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .revolution-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          position: relative;
          z-index: 1;
        }

        .revolution-card {
          background: white;
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          text-align: center;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .revolution-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        }

        .revolution-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 26px 70px rgba(0,0,0,0.15);
          border-color: #667eea;
        }

        .card-icon {
          margin-bottom: 24px;
          color: #667eea;
        }

        .revolution-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #333;
        }

        .revolution-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .card-benefit {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          color: #4ecdc4;
          font-weight: 500;
        }

        .features {
          padding: 100px 0;
          background: white;
        }

        .feature-card {
          text-align: center;
          padding: 40px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%);
          animation: rotate 25s linear infinite;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 50px rgba(102, 126, 234, 0.2);
        }

        .feature-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: bold;
        }

        .feature-icon {
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #333;
          position: relative;
          z-index: 1;
        }

        .feature-description {
          color: #666;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        .metrics-section {
          padding: 100px 0;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 32px;
          border-radius: 20px;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-6px);
          background: rgba(255, 255, 255, 0.15);
        }

        .metric-number {
          font-size: 3rem;
          font-weight: 900;
          color: #ffd700;
          margin-bottom: 8px;
        }

        .metric-label {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .metric-description {
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .testimonials {
          padding: 100px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .testimonial-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 32px;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
          position: relative;
          overflow: hidden;
        }

        .testimonial-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%);
        }

        .testimonial-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.15);
        }

        .testimonial-avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 16px;
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          color: #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          margin-bottom: 8px;
        }

        .avatar-company {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .testimonial-highlight {
          background: #ffd700;
          color: #333;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: bold;
          margin-bottom: 16px;
          display: inline-block;
        }

        .testimonial-rating {
          margin-bottom: 16px;
        }

        .testimonial-content {
          font-style: italic;
          margin-bottom: 24px;
          font-size: 1.1rem;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        .testimonial-author strong {
          font-weight: 700;
          position: relative;
          z-index: 1;
        }

        .testimonial-author small {
          opacity: 0.8;
          position: relative;
          z-index: 1;
        }

        .cta {
          padding: 100px 0;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="20" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="20" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
        }

        .cta-badges {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 215, 0, 0.2);
          color: #ffd700;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.9em;
          font-weight: bold;
        }

        .cta-content h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          margin-bottom: 16px;
          text-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .cta-features {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .cta-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.9rem;
        }

        .footer {
          background: #1a1a1a;
          color: #ccc;
          padding: 60px 0 20px;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .footer-brand h3 {
          color: #667eea;
          margin-bottom: 8px;
          font-size: 1.5rem;
        }

        .footer-brand p {
          margin: 0;
          opacity: 0.8;
        }

        .footer-social {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          background: rgba(102, 126, 234, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(102, 126, 234, 0.4);
          transform: scale(1.1);
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-link {
          color: #ccc;
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .footer-link:hover {
          color: #667eea;
        }

        .footer-bottom {
          text-align: center;
          border-top: 1px solid #333;
          padding-top: 20px;
        }

        .footer-legal {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .footer-legal-link {
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .footer-legal-link:hover {
          color: #667eea;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .grid {
          display: grid;
          gap: 32px;
        }

        .grid-2 {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        }

        .grid-3 {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .card {
          border-radius: 20px;
          overflow: hidden;
        }

        @keyframes professionalFloat {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0.3; }
          10% { opacity: 0.6; }
          50% { opacity: 0.6; transform: translateY(-30vh) rotate(90deg); }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) rotate(180deg); opacity: 0.3; }
        }

        @keyframes colorShift {
          0% { background: rgba(102, 126, 234, 0.4); }
          33% { background: rgba(118, 75, 162, 0.4); }
          66% { background: rgba(240, 147, 251, 0.4); }
          100% { background: rgba(102, 126, 234, 0.4); }
        }

        @keyframes morph {
          0%, 100% { border-radius: 50%; transform: scale(1) rotate(0deg); }
          25% { border-radius: 40% 60% 60% 40%; transform: scale(1.05) rotate(45deg); }
          50% { border-radius: 60% 40% 40% 60%; transform: scale(0.95) rotate(90deg); }
          75% { border-radius: 40% 60% 40% 60%; transform: scale(1.02) rotate(135deg); }
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes elementFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes elementPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
          50% { transform: scale(1.02); box-shadow: 0 10px 28px rgba(102, 126, 234, 0.3); }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.1) rotate(90deg); opacity: 0.9; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes glow {
          from { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
          to { box-shadow: 0 0 30px rgba(102, 126, 234, 0.7); }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -12px, 0); }
          70% { transform: translate3d(0, -6px, 0); }
          90% { transform: translate3d(0, -2px, 0); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            text-align: center;
            min-height: auto;
            padding: 60px 0;
          }

          .hero-content {
            margin-bottom: 40px;
          }

          .hero-stats {
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero-awards {
            justify-content: center;
          }

          .hero-buttons {
            justify-content: center;
          }

          .drag-demo {
            flex-direction: column;
            gap: 24px;
          }

          .canvas-mockup {
            width: 100%;
            max-width: 400px;
            height: 300px;
          }

          .sidebar-mockup {
            flex-direction: row;
            justify-content: center;
            flex-wrap: wrap;
          }

          .sidebar-item {
            min-width: 150px;
          }

          .demo-steps {
            grid-template-columns: 1fr;
          }

          .revolution-grid {
            grid-template-columns: 1fr;
          }

          .grid-2,
          .grid-3 {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .cta-features {
            flex-direction: column;
            align-items: center;
          }

          .footer-content {
            flex-direction: column;
            gap: 32px;
            text-align: center;
          }

          .footer-links {
            justify-content: center;
            flex-wrap: wrap;
          }

          .footer-legal {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default Landing