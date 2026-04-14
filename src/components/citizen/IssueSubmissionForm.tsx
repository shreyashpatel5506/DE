import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, MapPin, Camera, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';
import { api } from '../../lib/api';
import { ISSUE_CATEGORIES } from '@/lib/constants';

export function IssueSubmissionForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    photo: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { userId } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!formData.photo) {
        toast.error('An image is required to submit an issue');
        setIsSubmitting(false);
        return;
      }

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('department', formData.category); // Using category as department
      payload.append('location', formData.location || 'Unknown');
      
      if (userId) {
        payload.append('userId', userId);
      }
      
      if (formData.photo) {
        payload.append('image', formData.photo);
      }

      const response = await api.post('/api/createPost', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setSubmitted(true);
        toast.success('Issue submitted successfully!');
        
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            title: '',
            description: '',
            category: '',
            location: '',
            photo: null
          });
        }, 3000);
      } else {
        toast.error(response.data.message || 'Submission failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'A server error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-8 pb-8">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="mb-2">Issue Submitted Successfully!</h3>
            <p className="text-muted-foreground">
              Your issue has been submitted with ID: <strong>#{Math.floor(Math.random() * 10000)}</strong>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            You can track the progress in the "Track Issues" tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Issue</CardTitle>
        <CardDescription>
          Please provide detailed information about the infrastructure problem you've encountered.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the problem"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Street address or landmark"
                className="pl-10"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue, including when you noticed it and how it affects the community"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                required
              />
              <label
                htmlFor="photo"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {formData.photo ? (
                  <>
                    <Camera className="w-8 h-8 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {formData.photo.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click to change photo
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm">
                      Click to upload photo
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Issue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}