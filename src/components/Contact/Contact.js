import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          category: "general",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.detail || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-brand" />,
      title: "Email Us",
      details: "bitebids@gmail.com",
      subtext: "We’ll reply within 24 hours",
    },
    {
      icon: <Phone className="w-6 h-6 text-brand" />,
      title: "Call Us",
      details: "+961 71 50 90 50",
      subtext: "Mon–Fri, 9am–6pm EST",
    },
    {
      icon: <MapPin className="w-6 h-6 text-brand" />,
      title: "Visit Us",
      details: "123 Tech Street, San Francisco, CA 94105",
      subtext: "By appointment only",
    },
    {
      icon: <Clock className="w-6 h-6 text-brand" />,
      title: "Business Hours",
      details: "Monday – Friday: 9AM – 6PM EST",
      subtext: "Weekends: Closed",
    },
  ];

  const faqs = [
    {
      question: "How do I get started as a developer?",
      answer:
        "Sign up for a developer account, complete your profile, and start listing your solutions or bidding on projects.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit cards, PayPal, Apple Pay, and Google Pay for secure transactions.",
    },
    {
      question: "How does the auction system work?",
      answer:
        "Developers list solutions as auctions. Investors bid, and the highest bidder wins when the auction ends.",
    },
    {
      question: "What are the platform fees?",
      answer:
        "We charge a 6% platform fee plus a $30 processing fee per transaction.",
    },
  ];

  return (
    <div className="contact-page">


      {/* ===== Hero Section ===== */}
      <section className="contact-hero cosmic-hero">
        <div className="hero-overlay" />
        <div className="hero-content text-center">
          <div className="hero-icon-wrapper">
            <div className="hero-icon-glow" />
            <div className="hero-icon-circle">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="hero-title">
            Let’s Build Something Amazing
          </h1>
          <p className="hero-subtitle">
            We’d love to collaborate, assist, or hear your feedback — reach out and our team will connect with you shortly.
          </p>
        </div>
      </section>

      {/* ===== Contact Info Section ===== */}
      <section className="contact-info container">
        <div className="info-grid">
          {contactInfo.map((info, i) => (
            <Card key={i} className="cosmic-glass-card text-center">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-center">{info.icon}</div>
                <h3 className="text-lg font-semibold text-white">{info.title}</h3>
                <p className="text-gray-300">{info.details}</p>
                <p className="text-sm text-gray-400">{info.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== FAQ & Links Section ===== */}
      <section className="faq-section container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="cosmic-glass-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">FAQs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <h4 className="text-sm font-semibold text-brand">{faq.question}</h4>
                  <p className="text-sm text-gray-300">{faq.answer}</p>
                  {i < faqs.length - 1 && (
                    <div className="border-t border-cosmic-border my-3"></div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="cosmic-glass-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-brand transition-colors">Help Center →</a>
              <a href="#" className="block text-gray-300 hover:text-brand transition-colors">Documentation →</a>
              <a href="#" className="block text-gray-300 hover:text-brand transition-colors">Community Forum →</a>
              <a href="#" className="block text-gray-300 hover:text-brand transition-colors">Status Page →</a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== Form Section ===== */}
      <section className="contact-form-section container">
        <Card className="cosmic-glass-card form-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Send className="w-6 h-6 text-brand" />
              Send a Message
            </CardTitle>
            <CardDescription className="text-gray-300">
              Our team will get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {submitted ? (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-gray-300">
                  Thank you for reaching out. We'll respond soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="cosmic-input text-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="cosmic-input text-white"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-white">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => handleInputChange("category", v)}
                  >
                    <SelectTrigger className="cosmic-input text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                      <SelectContent className="bg-white text-gray-900 border border-gray-200">
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="cosmic-input text-white"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className="cosmic-input text-white"
                    placeholder="Tell us more..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full cosmic-button" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

    </div>
  );
};

export default Contact;