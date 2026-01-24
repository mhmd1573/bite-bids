import React from 'react';
import { 
  Rocket, Zap, Users, TrendingUp, Shield, Code, 
  Globe, CheckCircle2, ArrowRight, Star, Clock, DollarSign 
} from 'lucide-react';
import './ModernHomePage.css';

const ModernHomePage = ({navigateToPage}) => {
  return (
    <div className="homepage">
    
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge badge-primary">
                <Rocket className="w-4 h-4" />
                Trusted by 500+ companies
              </span>
            </div>
            
            <h1 className="hero-title">
              Find Expert AI Developers
              <span className="text-brand"> For Your Next Project</span>
            </h1>
            
            <p className="hero-description">
              Connect with top-tier AI developers, browse innovative solutions,
              and bid on projects. BiteBids makes it easy to transform your ideas into reality.
            </p>
            
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => { navigateToPage('marketplace'); }} >
                <Rocket className="w-5 h-5" />
                Browse Marketplace
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => { navigateToPage('marketplace'); }} >
                <Code className="w-5 h-5" />
                Post a Project
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">1,000+</div>
                <div className="hero-stat-label">Active Projects</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">500+</div>
                <div className="hero-stat-label">Expert Developers</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">$5M+</div>
                <div className="hero-stat-label">Value Traded</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">98%</div>
                <div className="hero-stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose BiteBids?</h2>
            <p className="section-description">
              Everything you need to succeed in the AI development marketplace
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="feature-card">
              <div className="feature-icon feature-icon-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Real-time bidding system with instant notifications. 
                Never miss an opportunity with our live auction updates.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-success">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Secure Payments</h3>
              <p className="feature-description">
                Protected transactions with escrow service. Your money is safe 
                until the work is completed to your satisfaction.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-warning">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Vetted Experts</h3>
              <p className="feature-description">
                Every developer is carefully screened. Work with professionals 
                who have proven track records and verified skills.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-primary">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="feature-title">AI-Powered Matching</h3>
              <p className="feature-description">
                Smart algorithms match your project with the perfect developers.
                Save time and find the right fit faster.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-success">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Market Insights</h3>
              <p className="feature-description">
                Data-driven analytics help you make informed decisions.
                Track trends and optimize your strategy.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-warning">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="feature-title">Global Network</h3>
              <p className="feature-description">
                Connect with talent from around the world. Access a diverse 
                pool of developers with specialized expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Get started in three simple steps
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Post Your Project</h3>
                <p className="step-description">
                  Describe your project requirements, set your budget, 
                  and specify your timeline. It takes just 5 minutes.
                </p>
              </div>
            </div>

            <div className="step-arrow">
              <ArrowRight className="w-6 h-6 text-secondary" />
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Receive Proposals</h3>
                <p className="step-description">
                  Interested Investors bid on your project. Review portfolios,
                  compare rates, and choose the best fit.
                </p>
              </div>
            </div>

            <div className="step-arrow">
              <ArrowRight className="w-6 h-6 text-secondary" />
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Work Together</h3>
                <p className="step-description">
                  Collaborate with your chosen developer. Track progress,
                  communicate easily, and pay securely.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="btn btn-primary btn-lg" onClick={() => { navigateToPage('login'); }} >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>



      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trusted by Industry Leaders</h2>
            <p className="section-description">
              See what our clients say about working with BiteBids
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-5 h-5 fill-warning-400 text-warning-400" 
                  />
                ))}
              </div>
              <p className="testimonial-text">
                "BiteBids connected us with an incredible AI developer who 
                delivered beyond our expectations. The platform made the 
                entire process seamless."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <span>JD</span>
                </div>
                <div>
                  <div className="testimonial-name">John Doe</div>
                  <div className="testimonial-role">CTO, TechCorp</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-5 h-5 fill-warning-400 text-warning-400" 
                  />
                ))}
              </div>
              <p className="testimonial-text">
                "As a developer, BiteBids has been a game-changer for finding 
                quality projects. The bidding system is fair and transparent."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <span>SM</span>
                </div>
                <div>
                  <div className="testimonial-name">Sarah Martinez</div>
                  <div className="testimonial-role">AI Developer</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-5 h-5 fill-warning-400 text-warning-400" 
                  />
                ))}
              </div>
              <p className="testimonial-text">
                "The quality of developers on BiteBids is outstanding. We've 
                completed three projects with amazing results each time."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <span>MC</span>
                </div>
                <div>
                  <div className="testimonial-name">Michael Chen</div>
                  <div className="testimonial-role">Product Manager, StartupXYZ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Start Your Next AI Project?
            </h2>
            <p className="cta-description">
              Join thousands of companies and developers building the future with AI
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-xl" onClick={() => { navigateToPage('login'); }}>
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn btn-secondary btn-xl" onClick={() => { navigateToPage('contact'); }}>
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernHomePage;



      // {/* Featured Projects Section */}
      // <section className="featured-projects">
      //   <div className="container">
      //     <div className="section-header">
      //       <h2 className="section-title">Featured Projects</h2>
      //       <p className="section-description">
      //         Browse popular projects from our marketplace
      //       </p>
      //     </div>

      //     <div className="grid grid-cols-3 gap-6">
      //       {/* Project Card 1 */}
      //       <div className="card card-project">
      //         <div className="card-project-image-container">
      //           <img 
      //             src="/api/placeholder/400/200" 
      //             alt="Project" 
      //             className="card-project-image"
      //           />
      //           <div className="card-project-badge">
      //             <span className="badge badge-success">Available</span>
      //           </div>
      //         </div>
      //         <div className="card-content">
      //           <h3 className="card-title">AI Chatbot Development</h3>
      //           <p className="card-description line-clamp-2">
      //             Build a custom AI-powered chatbot with natural language 
      //             processing capabilities for customer support automation.
      //           </p>
                
      //           <div className="project-meta">
      //             <div className="project-tags">
      //               <span className="badge badge-gray">React</span>
      //               <span className="badge badge-gray">Python</span>
      //               <span className="badge badge-gray">GPT-4</span>
      //             </div>
      //           </div>

      //           <div className="project-footer">
      //             <div className="project-price">
      //               <DollarSign className="w-5 h-5 text-secondary" />
      //               <span className="text-2xl font-bold text-brand">$5,000</span>
      //             </div>
      //             <div className="project-rating">
      //               <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
      //               <span className="font-medium">4.9</span>
      //               <span className="text-secondary">(24)</span>
      //             </div>
      //           </div>
      //         </div>
      //         <div className="card-footer">
      //           <button className="btn btn-primary btn-block">
      //             View Details
      //             <ArrowRight className="w-4 h-4" />
      //           </button>
      //         </div>
      //       </div>

      //       {/* Project Card 2 */}
      //       <div className="card card-project">
      //         <div className="card-project-image-container">
      //           <img 
      //             src="/api/placeholder/400/200" 
      //             alt="Project" 
      //             className="card-project-image"
      //           />
      //           <div className="card-project-badge">
      //             <span className="badge badge-warning">Auction</span>
      //           </div>
      //         </div>
      //         <div className="card-content">
      //           <h3 className="card-title">Machine Learning Model</h3>
      //           <p className="card-description line-clamp-2">
      //             Develop a predictive ML model for sales forecasting with 
      //             data visualization dashboard and real-time analytics.
      //           </p>
                
      //           <div className="project-meta">
      //             <div className="project-tags">
      //               <span className="badge badge-gray">TensorFlow</span>
      //               <span className="badge badge-gray">Python</span>
      //               <span className="badge badge-gray">AWS</span>
      //             </div>
      //           </div>

      //           <div className="project-footer">
      //             <div className="project-price">
      //               <DollarSign className="w-5 h-5 text-secondary" />
      //               <span className="text-2xl font-bold text-brand">$8,500</span>
      //             </div>
      //             <div className="project-rating">
      //               <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
      //               <span className="font-medium">5.0</span>
      //               <span className="text-secondary">(12)</span>
      //             </div>
      //           </div>
      //         </div>
      //         <div className="card-footer">
      //           <button className="btn btn-primary btn-block">
      //             Place Bid
      //             <ArrowRight className="w-4 h-4" />
      //           </button>
      //         </div>
      //       </div>

      //       {/* Project Card 3 */}
      //       <div className="card card-project">
      //         <div className="card-project-image-container">
      //           <img 
      //             src="/api/placeholder/400/200" 
      //             alt="Project" 
      //             className="card-project-image"
      //           />
      //           <div className="card-project-badge">
      //             <span className="badge badge-success">Available</span>
      //           </div>
      //         </div>
      //         <div className="card-content">
      //           <h3 className="card-title">Computer Vision System</h3>
      //           <p className="card-description line-clamp-2">
      //             Create an object detection and classification system for 
      //             automated quality control in manufacturing processes.
      //           </p>
                
      //           <div className="project-meta">
      //             <div className="project-tags">
      //               <span className="badge badge-gray">OpenCV</span>
      //               <span className="badge badge-gray">PyTorch</span>
      //               <span className="badge badge-gray">Docker</span>
      //             </div>
      //           </div>

      //           <div className="project-footer">
      //             <div className="project-price">
      //               <DollarSign className="w-5 h-5 text-secondary" />
      //               <span className="text-2xl font-bold text-brand">$12,000</span>
      //             </div>
      //             <div className="project-rating">
      //               <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
      //               <span className="font-medium">4.8</span>
      //               <span className="text-secondary">(31)</span>
      //             </div>
      //           </div>
      //         </div>
      //         <div className="card-footer">
      //           <button className="btn btn-primary btn-block">
      //             View Details
      //             <ArrowRight className="w-4 h-4" />
      //           </button>
      //         </div>
      //       </div>
      //     </div>

      //     <div className="text-center mt-8">
      //       <button className="btn btn-outline btn-lg" onClick={() => { navigateToPage('marketplace'); }}>
      //         View All Projects
      //         <ArrowRight className="w-5 h-5" />
      //       </button>
      //     </div>
      //   </div>
      // </section>