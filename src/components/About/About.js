import React from 'react';
import { Rocket, Users, Shield, Zap, TrendingUp, Code, Globe, Award, Target, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import './About.css';

const About = () => {
  const features = [
    {
      icon: <Rocket className="w-8 h-8 text-brand" />,
      title: "Innovation First",
      description: "We're revolutionizing how developers and investors connect, bringing cutting-edge solutions to the digital marketplace."
    },
    {
      icon: <Shield className="w-8 h-8 text-brand" />,
      title: "Secure Transactions",
      description: "Bank-level security with encrypted payments, ensuring your transactions and data are always protected."
    },
    {
      icon: <Users className="w-8 h-8 text-brand" />,
      title: "Global Community",
      description: "Join thousands of developers and investors from around the world collaborating on innovative projects."
    },
    {
      icon: <Zap className="w-8 h-8 text-brand" />,
      title: "Fast & Efficient",
      description: "Streamlined processes that get your projects moving quickly, from listing to delivery."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "5K+", label: "Projects Completed" },
    { number: "$2M+", label: "Total Transactions" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6 text-brand" />,
      title: "Mission-Driven",
      description: "Empowering developers to monetize their skills while helping investors find quality solutions."
    },
    {
      icon: <Heart className="w-6 h-6 text-brand" />,
      title: "Community-Focused",
      description: "Building a supportive ecosystem where everyone can thrive and grow together."
    },
    {
      icon: <Award className="w-6 h-6 text-brand" />,
      title: "Quality Assured",
      description: "Maintaining high standards through reputation systems and verified transactions."
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        {/* Hero Section */}
        <div className="about-hero text-center mb-16">
          <div className="about-hero-icon">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="about-title">
            About BiteBids
          </h1>
          <p className="about-description">
            The premier marketplace connecting talented developers with visionary investors. 
            We're building the future of digital commerce, one project at a time.
          </p>
        </div>

        {/* Stats Section */}
        <div className="about-stats">
          {stats.map((stat, index) => (
            <div key={index} className="about-stat-card">
              <span className="about-stat-number">{stat.number}</span>
              <span className="about-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Our Story Section */}
        <div className="mb-16">
          <div className="about-story-card">
            <h2 className="about-story-title">
              <Globe className="w-8 h-8 text-brand" />
              Our Story
            </h2>
            <div className="about-story-content">
              <p>
                BiteBids was founded with a simple yet powerful vision: to create a transparent, 
                efficient marketplace where developers can showcase their talents and investors 
                can discover innovative digital solutions.
              </p>
              <p>
                We recognized the gap between talented developers seeking opportunities to monetize 
                their skills and investors looking for reliable, quality digital products. Our platform 
                bridges this gap with cutting-edge technology, secure payment systems, and a 
                reputation-based trust system.
              </p>
              <p>
                Today, BiteBids serves a global community of developers and investors, facilitating 
                thousands of successful transactions and fostering innovation across the digital landscape.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="about-features-title">
            Why Choose BiteBids?
          </h2>
          <div className="about-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="about-feature-card">
                <div className="about-feature-icon">{feature.icon}</div>
                <h3 className="about-feature-title">{feature.title}</h3>
                <p className="about-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="about-features-title">
            Our Core Values
          </h2>
          <div className="about-values-grid">
            {values.map((value, index) => (
              <div key={index} className="about-value-card">
                <div className="about-value-icon">{value.icon}</div>
                <h3 className="about-value-title">{value.title}</h3>
                <p className="about-value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Developers Section */}
        <div className="about-roles-grid">
          <div className="about-role-card">
            <div className="about-role-header">
              <Code className="w-6 h-6 text-brand" />
              <h2 className="about-role-title">For Developers</h2>
            </div>
            <ul className="about-role-list">
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Monetize your skills and projects</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Build your reputation and portfolio</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Connect with investors worldwide</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Secure payment processing</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Flexible listing options: fixed price or auction</span>
              </li>
            </ul>
          </div>

          <div className="about-role-card">
            <div className="about-role-header">
              <TrendingUp className="w-6 h-6 text-brand" />
              <h2 className="about-role-title">For Investors</h2>
            </div>
            <ul className="about-role-list">
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Access quality digital solutions</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Browse vetted developer portfolios</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Request custom solutions</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Participate in auctions for unique projects</span>
              </li>
              <li className="about-role-item">
                <span className="about-role-item-check">✓</span>
                <span>Transparent pricing and secure transactions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="about-cta-card">
            <div className="about-cta-content">
              <h2 className="about-cta-title">
                Ready to Get Started?
              </h2>
              <p className="about-cta-description">
                Join thousands of developers and investors already using BiteBids
              </p>
              <div className="about-cta-buttons">
                <button className="about-cta-button about-cta-button-primary">
                  Join as Developer
                </button>
                <button className="about-cta-button about-cta-button-outline">
                  Join as Investor
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;