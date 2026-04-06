import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Phone, Mail, MapPin, Clock, Users, Shield, Wrench, Globe, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const contactInfo = [
  {
    category: 'Government Teams',
    icon: Shield,
    contacts: [
      {
        department: 'Public Works Department',
        phone: '(555) 123-4567',
        email: 'publicworks@city.gov',
        hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
        description: 'Roads, water systems, waste management, and general infrastructure'
      },
      {
        department: 'Emergency Services',
        phone: '(555) 911-0000',
        email: 'emergency@city.gov',
        hours: '24/7 Emergency Response',
        description: 'Critical infrastructure failures and emergency situations'
      },
      {
        department: 'Parks & Recreation',
        phone: '(555) 234-5678',
        email: 'parks@city.gov',
        hours: 'Mon-Fri: 9:00 AM - 4:00 PM',
        description: 'Park facilities, recreational areas, and green spaces'
      },
      {
        department: 'Transportation Services',
        phone: '(555) 345-6789',
        email: 'transport@city.gov',
        hours: 'Mon-Fri: 7:00 AM - 6:00 PM',
        description: 'Traffic signals, street lighting, and public transit'
      }
    ]
  },
  {
    category: 'Technical Support',
    icon: Wrench,
    contacts: [
      {
        department: 'IT Help Desk',
        phone: '(555) 456-7890',
        email: 'support@civicreport.gov',
        hours: 'Mon-Fri: 8:00 AM - 6:00 PM',
        description: 'Account issues, password resets, and platform navigation'
      },
      {
        department: 'Technical Issues',
        phone: '(555) 567-8901',
        email: 'tech@civicreport.gov',
        hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
        description: 'Website bugs, mobile app problems, and system errors'
      }
    ]
  },
  {
    category: 'Website & Platform',
    icon: Globe,
    contacts: [
      {
        department: 'Digital Services',
        phone: '(555) 678-9012',
        email: 'digital@city.gov',
        hours: 'Mon-Fri: 8:30 AM - 5:30 PM',
        description: 'Website feedback, accessibility issues, and feature requests'
      },
      {
        department: 'Community Engagement',
        phone: '(555) 789-0123',
        email: 'community@city.gov',
        hours: 'Mon-Fri: 9:00 AM - 4:00 PM',
        description: 'Community events, feedback sessions, and public meetings'
      }
    ]
  }
];

const inquiryTypes = [
  'General Question',
  'Technical Support',
  'Report an Issue',
  'Feature Request',
  'Accessibility Concern',
  'Community Feedback',
  'Partnership Inquiry',
  'Other'
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Your message has been sent successfully! We\'ll get back to you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiryType: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get in touch with our government teams, technical support, or website administrators. 
          We're here to help you make the most of CivicReport.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your inquiry"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide details about your question, issue, or feedback..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Quick Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium">General Inquiries</div>
                  <div className="text-sm text-muted-foreground">(555) 123-CITY</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-500" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-muted-foreground">info@civicreport.gov</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="font-medium">City Hall</div>
                  <div className="text-sm text-muted-foreground">123 Main Street<br />Downtown, ST 12345</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="font-medium">Office Hours</div>
                  <div className="text-sm text-muted-foreground">Mon-Fri: 8:00 AM - 5:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-red-600 dark:text-red-400">Emergency Line</span>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">(555) 911-0000</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  For critical infrastructure failures, public safety hazards, or emergencies only.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Contact Cards */}
      <div className="space-y-8">
        {contactInfo.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          return (
            <div key={categoryIndex}>
              <h2 className="flex items-center gap-2 mb-6">
                <CategoryIcon className="w-6 h-6 text-blue-500" />
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.contacts.map((contact, contactIndex) => (
                  <Card key={contactIndex} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg">{contact.department}</CardTitle>
                      <CardDescription>{contact.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span className="font-mono">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <Badge variant="outline" className="text-xs">
                          {contact.hours}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions about CivicReport
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4>How long does it take to get a response?</h4>
            <p className="text-sm text-muted-foreground">
              We aim to respond to all inquiries within 24 hours during business days. Emergency issues receive immediate attention.
            </p>
          </div>
          <div className="space-y-2">
            <h4>Can I track the status of my inquiry?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! After submitting a message, you'll receive a confirmation email with a reference number to track your inquiry.
            </p>
          </div>
          <div className="space-y-2">
            <h4>What information should I include when reporting technical issues?</h4>
            <p className="text-sm text-muted-foreground">
              Please include your device type, browser version, a description of the problem, and any error messages you encountered.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}