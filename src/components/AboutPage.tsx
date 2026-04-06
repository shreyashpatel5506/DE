import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Users, Target, Award, CheckCircle, TrendingUp, Heart } from 'lucide-react';

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Director of Public Works',
    description: 'Leading infrastructure development and maintenance across the city.',
    experience: '12 years'
  },
  {
    name: 'Michael Chen',
    role: 'Community Engagement Manager',
    description: 'Connecting citizens with government services and facilitating communication.',
    experience: '8 years'
  },
  {
    name: 'Lisa Rodriguez',
    role: 'Infrastructure Analyst',
    description: 'Data-driven insights to optimize infrastructure maintenance and planning.',
    experience: '6 years'
  },
  {
    name: 'David Thompson',
    role: 'Emergency Response Coordinator',
    description: 'Coordinating rapid response to critical infrastructure issues.',
    experience: '10 years'
  }
];

const achievements = [
  {
    icon: CheckCircle,
    title: '1,200+ Issues Resolved',
    description: 'Successfully addressed community-reported infrastructure problems',
    color: 'text-green-500'
  },
  {
    icon: TrendingUp,
    title: '4.8 Day Average Response',
    description: 'Rapid response time to citizen reports',
    color: 'text-blue-500'
  },
  {
    icon: Users,
    title: '5,000+ Active Users',
    description: 'Growing community of engaged citizens',
    color: 'text-purple-500'
  },
  {
    icon: Award,
    title: 'Smart City Award 2024',
    description: 'Recognized for innovative civic technology',
    color: 'text-yellow-500'
  }
];

const values = [
  {
    icon: Shield,
    title: 'Transparency',
    description: 'Open communication and clear reporting on all infrastructure projects and issues.'
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Prioritizing citizen needs and fostering inclusive participation in civic matters.'
  },
  {
    icon: Target,
    title: 'Efficiency',
    description: 'Streamlined processes and data-driven decisions for optimal resource allocation.'
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: 'Building infrastructure solutions that benefit current and future generations.'
  }
];

export function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          About CivicReport
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
          Empowering communities through transparent communication, efficient infrastructure management, 
          and collaborative problem-solving. Together, we're building stronger, more resilient cities.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To create a seamless bridge between citizens and local government, enabling efficient 
              reporting, tracking, and resolution of infrastructure issues while fostering transparency 
              and community engagement in civic processes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              A future where every citizen feels heard, every infrastructure issue is addressed promptly, 
              and communities actively participate in shaping their urban environment through 
              technology-enabled civic engagement.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div>
        <h2 className="text-center mb-8">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-center mb-8">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${achievement.color}`} />
                  <h4 className="mb-2">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-center mb-8">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-semibold text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h4 className="mb-1">{member.name}</h4>
                <Badge variant="outline" className="mb-3">{member.role}</Badge>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {member.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {member.experience} experience
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>How CivicReport Works</CardTitle>
          <CardDescription>
            A simple, transparent process for reporting and resolving infrastructure issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h4 className="mb-2">Report Issue</h4>
              <p className="text-sm text-muted-foreground">
                Citizens easily report infrastructure problems through our user-friendly platform
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 dark:text-green-400">2</span>
              </div>
              <h4 className="mb-2">Verification</h4>
              <p className="text-sm text-muted-foreground">
                Government officials verify and prioritize reported issues for appropriate action
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 dark:text-yellow-400">3</span>
              </div>
              <h4 className="mb-2">Resolution</h4>
              <p className="text-sm text-muted-foreground">
                Assigned teams work to resolve issues while keeping citizens informed of progress
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 dark:text-purple-400">4</span>
              </div>
              <h4 className="mb-2">Follow-up</h4>
              <p className="text-sm text-muted-foreground">
                Citizens receive updates and can provide feedback on completed work
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Join Us Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border-0">
        <CardContent className="text-center py-12">
          <h2 className="mb-4">Join Our Community</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Be part of the solution. Whether you're reporting an issue, tracking progress, or simply 
            staying informed about your community's infrastructure, every contribution makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge variant="outline" className="px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Community Driven
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Government Backed
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Results Focused
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}