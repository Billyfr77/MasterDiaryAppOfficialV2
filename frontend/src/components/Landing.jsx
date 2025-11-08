import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, Calendar, FileText, CheckCircle, Star, ArrowRight } from 'lucide-react'

const Landing = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <BarChart3 size={48} color="var(--primary-color)" />,
      title: 'Real-Time Analytics',
      description: 'Track costs, revenues, and margins with live calculations and beautiful charts.'
    },
    {
      icon: <Users size={48} color="var(--success-color)" />,
      title: 'Team Management',
      description: 'Assign projects to users, manage staff rates, and collaborate efficiently.'
    },
    {
      icon: <Calendar size={48} color="var(--info-color)" />,
      title: 'Diary Tracking',
      description: 'Log work hours, equipment usage, and breaks with automated calculations.'
    },
    {
      icon: <FileText size={48} color="var(--warning-color)" />,
      title: 'PDF Reports',
      description: 'Generate detailed reports with filters and export to PDF instantly.'
    }
  ]

  const testimonials = [
    {
      name: 'John Doe',
      role: 'Construction Manager',
      content: 'MasterDiaryApp revolutionized our project tracking. The real-time calculations save us hours!',
      rating: 5
    },
    {
      name: 'Jane Smith',
      role: 'Project Coordinator',
      content: 'Beautiful interface and powerful features. Our team productivity increased by 30%.',
      rating: 5
    },
    {
      name: 'Mike Johnson',
      role: 'Site Supervisor',
      content: 'The dark mode and mobile support make it perfect for on-site use.',
      rating: 5
    }
  ]

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Revolutionize Your <span className="highlight">Construction Management</span>
            </h1>
            <p className="hero-subtitle">
              MasterDiaryApp: The ultimate SaaS solution for tracking work hours, costs, and revenues with real-time calculations and beautiful analytics.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Get Started <ArrowRight size={20} style={{ marginLeft: 'var(--spacing-sm)' }} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="mockup">
              <div className="mockup-screen">
                <div className="dashboard-preview">
                  <div className="preview-header">
                    <div className="skeleton skeleton-text" style={{ width: '60%', height: '24px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', height: '16px' }}></div>
                  </div>
                  <div className="preview-cards">
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                  </div>
                  <div className="preview-chart">
                    <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--border-radius-lg)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need to manage construction projects efficiently</p>
          <div className="grid grid-2">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
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
          <h2 className="section-title">What Our Users Say</h2>
          <div className="grid grid-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} color="var(--warning-color)" fill="var(--warning-color)" />
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

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Construction Management?</h2>
            <p>Join thousands of construction professionals using MasterDiaryApp</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Start Free Trial <ArrowRight size={20} style={{ marginLeft: 'var(--spacing-sm)' }} />
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
              <p>Revolutionizing construction management</p>
            </div>
            <div className="footer-links">
              <a href="#features" className="footer-link">Features</a>
              <a href="#testimonials" className="footer-link">Testimonials</a>
              <button onClick={() => navigate('/login')} className="footer-link">Login</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 MasterDiaryApp. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing {
          min-height: 100vh;
        }

        .hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--info-color) 100%);
          color: var(--white);
          padding: var(--spacing-2xl) 0;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.1;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
        }

        .hero-title {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--spacing-lg);
          line-height: 1.2;
        }

        .highlight {
          color: var(--warning-color);
        }

        .hero-subtitle {
          font-size: var(--font-size-xl);
          margin-bottom: var(--spacing-xl);
          opacity: 0.9;
        }

        .hero-buttons {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: var(--font-size-lg);
        }

        .hero-image {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
        }

        .mockup {
          width: 400px;
          height: 300px;
          background: var(--white);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-xl);
          position: relative;
          overflow: hidden;
        }

        .mockup-screen {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 60px;
          background: var(--gray-100);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-md);
        }

        .dashboard-preview {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preview-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-sm);
        }

        .section-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          text-align: center;
          margin-bottom: var(--spacing-md);
          color: var(--gray-900);
        }

        .section-subtitle {
          font-size: var(--font-size-lg);
          text-align: center;
          margin-bottom: var(--spacing-xl);
          color: var(--gray-600);
        }

        .features {
          padding: var(--spacing-2xl) 0;
          background: var(--gray-50);
        }

        .feature-card {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .feature-icon {
          margin-bottom: var(--spacing-lg);
        }

        .feature-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          margin-bottom: var(--spacing-md);
          color: var(--gray-900);
        }

        .feature-description {
          color: var(--gray-600);
          line-height: 1.6;
        }

        .testimonials {
          padding: var(--spacing-2xl) 0;
          background: var(--white);
        }

        .testimonial-card {
          padding: var(--spacing-lg);
          text-align: center;
        }

        .testimonial-rating {
          margin-bottom: var(--spacing-md);
        }

        .testimonial-content {
          font-style: italic;
          margin-bottom: var(--spacing-lg);
          color: var(--gray-700);
        }

        .testimonial-author {
          color: var(--gray-900);
        }

        .cta {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
          color: var(--white);
          padding: var(--spacing-2xl) 0;
          text-align: center;
        }

        .cta-content h2 {
          font-size: var(--font-size-3xl);
          margin-bottom: var(--spacing-md);
        }

        .cta-content p {
          font-size: var(--font-size-lg);
          margin-bottom: var(--spacing-xl);
          opacity: 0.9;
        }

        .footer {
          background: var(--gray-900);
          color: var(--gray-100);
          padding: var(--spacing-xl) 0 var(--spacing-md);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .footer-brand h3 {
          color: var(--primary-color);
          margin-bottom: var(--spacing-sm);
        }

        .footer-links {
          display: flex;
          gap: var(--spacing-lg);
        }

        .footer-link {
          color: var(--gray-400);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-link:hover {
          color: var(--primary-color);
        }

        .footer-bottom {
          text-align: center;
          border-top: 1px solid var(--gray-700);
          padding-top: var(--spacing-md);
          color: var(--gray-500);
        }

        @media (max-width: 768px) {
          .hero {
            text-align: center;
            padding: var(--spacing-xl) 0;
          }

          .hero-content {
            max-width: none;
          }

          .hero-title {
            font-size: var(--font-size-2xl);
          }

          .hero-buttons {
            justify-content: center;
          }

          .hero-image {
            position: static;
            transform: none;
            margin-top: var(--spacing-xl);
          }

          .mockup {
            width: 100%;
            max-width: 300px;
            height: 225px;
            margin: 0 auto;
          }

          .grid-2,
          .grid-3 {
            grid-template-columns: 1fr;
          }

          .footer-content {
            flex-direction: column;
            gap: var(--spacing-lg);
          }

          .footer-links {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Landing
