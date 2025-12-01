'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, FileDown, FileText, Edit, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import { UserProfile, Education, Experience, Project, Skill, SocialProfile, Certification, Internship } from '@/types/profile';

type CollectionItem<T> = Omit<T, '_id'> & { _id?: string; id: string; isNew?: boolean };

interface ProfileFormData extends Omit<UserProfile, 'education' | 'experience' | 'projects' | 'skills' | 'socialProfiles' | 'certifications' | 'internships' | 'image' | 'resumeUrl'> {
    education: CollectionItem<Education>[];
    experience: CollectionItem<Experience>[];
    internships: CollectionItem<Internship>[];
    projects: CollectionItem<Project>[];
    skills: CollectionItem<Skill>[];
    socialProfiles: CollectionItem<SocialProfile>[];
    certifications: CollectionItem<Certification>[];
    newEducation: Omit<Education, '_id'>;
    newExperience: Omit<Experience, '_id'>;
    newInternship: Omit<Internship, '_id'>;
    newProject: Omit<Project, '_id'>;
    newSkill: Omit<Skill, '_id'>;
    newSocialProfile: Omit<SocialProfile, '_id'>;
    newCertification: Omit<Certification, '_id'>;
    resumeFile: File | null;
    profileImage: File | null;
    image?: string;
    resumeUrl?: string;
}

export default function EditProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [interestsInput, setInterestsInput] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>(() => ({
        _id: '',
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        role: '',
        bio: '',
        phone: '',
        location: '',
        website: '',
        department: '',
        year: undefined,
        interests: [],
        availableForHire: false,
        organizations: [],
        education: [],
        experience: [],
        internships: [],
        projects: [],
        skills: [],
        socialProfiles: [],
        certifications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        image: session?.user?.image || '',
        resumeUrl: '',
        newEducation: {
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            description: '',
            gpa: ''
        },
        newExperience: {
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        },
        newInternship: {
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        },
        newProject: {
            name: '',
            description: '',
            technologies: [],
            startDate: '',
            endDate: '',
            url: ''
        },
        newSkill: {
            name: '',
            level: 'intermediate',
            category: 'technical'
        },
        newSocialProfile: {
            platform: 'github',
            url: '',
            username: ''
        },
        newCertification: {
            name: '',
            issuer: '',
            issueDate: '',
            credentialUrl: ''
        },
        resumeFile: null,
        profileImage: null
    }));

    useEffect(() => {
        if (status === 'loading') return;

        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                const profileData = data as UserProfile;
                setFormData({
                    ...formData,
                    name: profileData.name || '',
                    email: profileData.email || '',
                    role: profileData.role || '',
                    bio: profileData.bio || '',
                    phone: profileData.phone || '',
                    location: profileData.location || '',
                    website: profileData.website || '',
                    department: profileData.department || '',
                    year: profileData.year,
                    interests: profileData.interests || [],
                    availableForHire: profileData.availableForHire || false,
                    education: (profileData.education || []).map(edu => ({
                        ...edu,
                        id: edu._id,
                        isNew: false
                    })),
                    experience: (profileData.experience || []).map(exp => ({
                        ...exp,
                        id: exp._id,
                        isNew: false
                    })),
                    internships: (profileData.internships || []).map(intern => ({
                        ...intern,
                        id: intern._id,
                        isNew: false
                    })),
                    projects: (profileData.projects || []).map(proj => ({
                        ...proj,
                        id: proj._id,
                        isNew: false
                    })),
                    skills: (profileData.skills || []).map(skill => ({
                        ...skill,
                        id: skill._id,
                        isNew: false
                    })),
                    socialProfiles: (profileData.socialProfiles || []).map(profile => ({
                        ...profile,
                        id: `social-${Date.now()}`,
                        isNew: false
                    })),
                    certifications: (profileData.certifications || []).map(cert => ({
                        ...cert,
                        id: cert._id || `cert-${Date.now()}`,
                        isNew: false
                    })),
                    _id: profileData._id,
                    organizations: profileData.organizations || [],
                    createdAt: profileData.createdAt || new Date().toISOString(),
                    updatedAt: profileData.updatedAt || new Date().toISOString()
                });
            } catch (err) {
                toast.error('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [status]);

    const addEducation = useCallback(() => {
        if (!formData.newEducation.institution || !formData.newEducation.degree) return;

        setFormData(prev => ({
            ...prev,
            education: [
                ...prev.education,
                {
                    ...prev.newEducation,
                    id: `new-${Date.now()}`,
                    isNew: true,
                    _id: `temp-${Date.now()}`
                }
            ],
            newEducation: {
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                description: '',
                gpa: ''
            }
        }));
    }, [formData.newEducation]);

    const removeEducation = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    }, []);

    const addExperience = useCallback(() => {
        if (!formData.newExperience.company || !formData.newExperience.position) return;

        setFormData(prev => ({
            ...prev,
            experience: [
                ...prev.experience,
                {
                    ...prev.newExperience,
                    id: `exp-${Date.now()}`,
                    isNew: true
                }
            ],
            newExperience: {
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            }
        }));
    }, [formData.newExperience]);

    const removeExperience = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    }, []);

    const addInternship = useCallback(() => {
        if (!formData.newInternship.company || !formData.newInternship.position) return;

        setFormData(prev => ({
            ...prev,
            internships: [
                ...prev.internships,
                {
                    ...prev.newInternship,
                    id: `intern-${Date.now()}`,
                    isNew: true
                }
            ],
            newInternship: {
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            }
        }));
    }, [formData.newInternship]);

    const removeInternship = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            internships: prev.internships.filter(intern => intern.id !== id)
        }));
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: 'resumeFile' | 'profileImage') => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                [field]: e.target.files?.[0] || null
            }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formDataToSend = new window.FormData();

            const profileData = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                bio: formData.bio,
                phone: formData.phone,
                location: formData.location,
                website: formData.website,
                department: formData.department,
                year: formData.year,
                interests: formData.interests,
                availableForHire: formData.availableForHire,
                education: formData.education.map(({ id, isNew, ...rest }) => rest),
                experience: formData.experience.map(({ id, isNew, ...rest }) => rest),
                internships: formData.internships.map(({ id, isNew, ...rest }) => rest),
                projects: formData.projects.map(({ id, isNew, ...rest }) => rest),
                skills: formData.skills.map(({ id, isNew, ...rest }) => rest),
                socialProfiles: formData.socialProfiles.map(({ id, isNew, ...rest }) => rest),
                certifications: formData.certifications.map(({ id, isNew, ...rest }) => rest),
                organizations: formData.organizations
            };

            // Append JSON data
            formDataToSend.append('profile', JSON.stringify(profileData));

            // Append files if they exist
            if (formData.profileImage) {
                formDataToSend.append('profileImage', formData.profileImage);
            }
            if (formData.resumeFile) {
                formDataToSend.append('resume', formData.resumeFile);
            }

            const response = await fetch('/api/profile', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) throw new Error('Failed to save profile');

            toast.success('Profile updated successfully');

            router.push('/profile');
        } catch (err) {
            console.error('Error saving profile:', err);
            toast.error('Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!session) {
            toast.error('You must be logged in to save your profile.');
            return;
        }

        setSaving(true);

        try {
            // Create a clean data object without internal fields
            const cleanData = (data: any) => {
                if (Array.isArray(data)) {
                    return data.map(item => {
                        const { id, isNew, _id, ...rest } = item;
                        return rest;
                    });
                }
                return data;
            };

            const dataToSend = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                bio: formData.bio,
                phone: formData.phone,
                location: formData.location,
                website: formData.website,
                department: formData.department,
                year: formData.year,
                interests: formData.interests,
                availableForHire: formData.availableForHire,
                education: cleanData(formData.education),
                experience: cleanData(formData.experience),
                internships: cleanData(formData.internships),
                projects: cleanData(formData.projects),
                skills: cleanData(formData.skills),
                socialProfiles: cleanData(formData.socialProfiles),
                certifications: cleanData(formData.certifications),
                image: formData.image,
                resumeUrl: formData.resumeUrl
            };

            console.log('Sending data:', dataToSend); // Debug log

            // Handle file uploads if needed
            const formDataToSend = new FormData();
            if (formData.resumeFile) {
                formDataToSend.append('resume', formData.resumeFile);
            }
            if (formData.profileImage) {
                formDataToSend.append('profileImage', formData.profileImage);
            }
            formDataToSend.append('data', JSON.stringify(dataToSend));

            // Send the data to your API
            const response = await fetch('/api/profile', {
                method: 'PUT',
                body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            const result = await response.json();

            toast.success('Your profile has been updated successfully!');

            // Redirect to the profile page
            router.push('/profile');
            router.refresh(); // Refresh the page to show updated data

        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const removeInterest = (interestToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            interests: (prev.interests || []).filter(i => i !== interestToRemove)
        }));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                                    <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="personal" onClick={() => setActiveTab('personal')}>
                    Personal Info
                </TabsTrigger>
                <TabsTrigger value="resume" onClick={() => setActiveTab('resume')}>
                    Resume
                </TabsTrigger>
                <TabsTrigger value="social" onClick={() => setActiveTab('social')}>
                    Social & Links
                </TabsTrigger>
                <TabsTrigger value="preferences" onClick={() => setActiveTab('preferences')}>
                    Preferences
                </TabsTrigger>
            </TabsList>

            <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveProfile();
            }} className="space-y-8">
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={formData.image} />
                                        <AvatarFallback>
                                            {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'profileImage')}
                                        />
                                        <Edit className="h-4 w-4" />
                                    </label>
                                </div>
                                <p className="text-sm text-muted-foreground">Click to change profile picture</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        disabled
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={formData.location || ''}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="website">Website/Portfolio</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={formData.website || ''}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role">Professional Title/Role *</Label>
                                    <Input
                                        id="role"
                                        value={formData.role || ''}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                        placeholder="e.g., Software Engineer"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bio">Professional Summary</Label>
                                <textarea
                                    id="bio"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.bio || ''}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="A brief summary of your professional background and skills..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Experience</CardTitle>
                            <CardDescription>Highlight your professional journey</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {formData.experience.length > 0 ? (
                                formData.experience.map((exp) => (
                                    <div key={exp.id} className="rounded-lg border p-4 relative">
                                        <button
                                            type="button"
                                            onClick={() => removeExperience(exp.id)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold">{exp.position}</p>
                                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                                            {exp.location && (
                                                <p className="text-xs text-muted-foreground">{exp.location}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'N/A'}
                                            </p>
                                            {exp.description && (
                                                <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No experience added yet.</p>
                            )}

                            <div className="rounded-lg border border-dashed p-4 space-y-4">
                                <h4 className="font-medium">Add Experience</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="expCompany">Company *</Label>
                                        <Input
                                            id="expCompany"
                                            value={formData.newExperience.company}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    newExperience: { ...prev.newExperience, company: e.target.value }
                                                }))
                                            }
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="expPosition">Position *</Label>
                                        <Input
                                            id="expPosition"
                                            value={formData.newExperience.position}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    newExperience: { ...prev.newExperience, position: e.target.value }
                                                }))
                                            }
                                            placeholder="Role / Title"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="expLocation">Location</Label>
                                        <Input
                                            id="expLocation"
                                            value={formData.newExperience.location || ''}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    newExperience: { ...prev.newExperience, location: e.target.value }
                                                }))
                                            }
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="expStartDate">Start Date</Label>
                                            <Input
                                                id="expStartDate"
                                                type="date"
                                                value={formData.newExperience.startDate}
                                                onChange={(e) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        newExperience: { ...prev.newExperience, startDate: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="expEndDate">End Date</Label>
                                            <Input
                                                id="expEndDate"
                                                type="date"
                                                disabled={formData.newExperience.current}
                                                value={formData.newExperience.endDate || ''}
                                                onChange={(e) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        newExperience: { ...prev.newExperience, endDate: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="expCurrent"
                                        checked={formData.newExperience.current}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                newExperience: {
                                                    ...prev.newExperience,
                                                    current: Boolean(checked),
                                                    endDate: checked ? '' : prev.newExperience.endDate
                                                }
                                            }))
                                        }
                                    />
                                    <Label htmlFor="expCurrent">I currently work here</Label>
                                </div>
                                <div>
                                    <Label htmlFor="expDescription">Description</Label>
                                    <Textarea
                                        id="expDescription"
                                        value={formData.newExperience.description || ''}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                newExperience: { ...prev.newExperience, description: e.target.value }
                                            }))
                                        }
                                        placeholder="Key responsibilities, achievements, tools..."
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addExperience}
                                    disabled={!formData.newExperience.company || !formData.newExperience.position}
                                >
                                    Add Experience
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Internships</CardTitle>
                            <CardDescription>Capture hands-on learning experiences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {formData.internships.length > 0 ? (
                                formData.internships.map((intern) => (
                                    <div key={intern.id} className="rounded-lg border p-4 relative">
                                        <button
                                            type="button"
                                            onClick={() => removeInternship(intern.id)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold">{intern.position}</p>
                                            <p className="text-sm text-muted-foreground">{intern.company}</p>
                                            {intern.location && (
                                                <p className="text-xs text-muted-foreground">{intern.location}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {intern.startDate} - {intern.current ? 'Present' : intern.endDate || 'N/A'}
                                            </p>
                                            {intern.description && (
                                                <p className="text-sm text-muted-foreground mt-2">{intern.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No internships recorded yet.</p>
                            )}

                            <div className="rounded-lg border border-dashed p-4 space-y-4">
                                <h4 className="font-medium">Add Internship</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="internCompany">Company *</Label>
                                        <Input
                                            id="internCompany"
                                            value={formData.newInternship.company}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    newInternship: { ...prev.newInternship, company: e.target.value }
                                                }))
                                            }
                                            placeholder="Organization"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="internPosition">Role *</Label>
                                        <Input
                                            id="internPosition"
                                            value={formData.newInternship.position}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    newInternship: { ...prev.newInternship, position: e.target.value }
                                                }))
                                            }
                                            placeholder="Internship Title"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="internLocation">Location</Label>
                                        <Input
                                            id="internLocation"
                                            value={formData.newInternship.location || ''}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    newInternship: { ...prev.newInternship, location: e.target.value }
                                                }))
                                            }
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="internStartDate">Start Date</Label>
                                            <Input
                                                id="internStartDate"
                                                type="date"
                                                value={formData.newInternship.startDate}
                                                onChange={(e) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        newInternship: { ...prev.newInternship, startDate: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="internEndDate">End Date</Label>
                                            <Input
                                                id="internEndDate"
                                                type="date"
                                                disabled={formData.newInternship.current}
                                                value={formData.newInternship.endDate || ''}
                                                onChange={(e) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        newInternship: { ...prev.newInternship, endDate: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="internCurrent"
                                        checked={formData.newInternship.current}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                newInternship: {
                                                    ...prev.newInternship,
                                                    current: Boolean(checked),
                                                    endDate: checked ? '' : prev.newInternship.endDate
                                                }
                                            }))
                                        }
                                    />
                                    <Label htmlFor="internCurrent">I am currently interning here</Label>
                                </div>
                                <div>
                                    <Label htmlFor="internDescription">Responsibilities / Learnings</Label>
                                    <Textarea
                                        id="internDescription"
                                        value={formData.newInternship.description || ''}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                newInternship: { ...prev.newInternship, description: e.target.value }
                                            }))
                                        }
                                        placeholder="Tools, mentorship, accomplishments..."
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addInternship}
                                    disabled={!formData.newInternship.company || !formData.newInternship.position}
                                >
                                    Add Internship
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Education</CardTitle>
                            <CardDescription>Add your educational background</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {formData.education.map((edu) => (
                                <div key={edu.id} className="p-4 border rounded-lg space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{edu.degree}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {edu.institution} • {edu.field}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                                                {edu.gpa && ` • GPA: ${edu.gpa}`}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeEducation(edu.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                    {edu.description && (
                                        <p className="text-sm">{edu.description}</p>
                                    )}
                                </div>
                            ))}

                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-medium">Add Education</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="eduInstitution">Institution *</Label>
                                        <Input
                                            id="eduInstitution"
                                            value={formData.newEducation.institution}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newEducation: {
                                                        ...formData.newEducation,
                                                        institution: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="University Name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="eduDegree">Degree *</Label>
                                        <Input
                                            id="eduDegree"
                                            value={formData.newEducation.degree}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newEducation: {
                                                        ...formData.newEducation,
                                                        degree: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="e.g., Bachelor of Science"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="eduField">Field of Study</Label>
                                        <Input
                                            id="eduField"
                                            value={formData.newEducation.field}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newEducation: {
                                                        ...formData.newEducation,
                                                        field: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="eduGPA">GPA</Label>
                                        <Input
                                            id="eduGPA"
                                            value={formData.newEducation.gpa || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newEducation: {
                                                        ...formData.newEducation,
                                                        gpa: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="e.g., 3.8/4.0"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="eduStartDate">Start Date</Label>
                                        <Input
                                            id="eduStartDate"
                                            type="date"
                                            value={formData.newEducation.startDate}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newEducation: {
                                                        ...formData.newEducation,
                                                        startDate: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="eduEndDate">End Date (or expected)</Label>
                                        <Input
                                            id="eduEndDate"
                                            type="date"
                                            value={formData.newEducation.endDate || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newEducation: {
                                                        ...formData.newEducation,
                                                        endDate: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="eduDescription">Description</Label>
                                    <textarea
                                        id="eduDescription"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.newEducation.description || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                newEducation: {
                                                    ...formData.newEducation,
                                                    description: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="Notable achievements, coursework, or activities"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEducation}
                                    disabled={!formData.newEducation.institution || !formData.newEducation.degree}
                                >
                                    Add Education
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Similar sections for Experience, Projects, etc. would go here */}
                    {/* I'll implement those in the next response to keep the size manageable */}
                </TabsContent>

                {/* Resume Tab */}
                <TabsContent value="resume" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resume Upload</CardTitle>
                            <CardDescription>
                                Upload your resume/CV to make it available for download
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <FileDown className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {formData.resumeFile
                                                ? formData.resumeFile.name
                                                : 'Drag and drop your resume here, or click to browse'}
                                        </p>
                                        <input
                                            type="file"
                                            id="resume-upload"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => handleFileChange(e, 'resumeFile')}
                                        />
                                        <label
                                            htmlFor="resume-upload"
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                                        >
                                            Choose File
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                            PDF, DOC, or DOCX (max 5MB)
                                        </p>
                                    </div>
                                </div>
                                {formData.resumeFile && (
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {formData.resumeFile.name}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setFormData({ ...formData, resumeFile: null })
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Social & Links Tab */}
                <TabsContent value="social" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Profiles</CardTitle>
                            <CardDescription>
                                Add links to your social media profiles
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Social profiles list would go here */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="socialPlatform">Platform</Label>
                                        <select
                                            id="socialPlatform"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.newSocialProfile.platform}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newSocialProfile: {
                                                        ...formData.newSocialProfile,
                                                        platform: e.target.value as any,
                                                    },
                                                })
                                            }
                                        >
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="github">GitHub</option>
                                            <option value="twitter">Twitter</option>
                                            <option value="portfolio">Portfolio</option>
                                            <option value="medium">Medium</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="socialUsername">Username</Label>
                                        <Input
                                            id="socialUsername"
                                            value={formData.newSocialProfile.username || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    newSocialProfile: {
                                                        ...formData.newSocialProfile,
                                                        username: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="yourusername"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            className="w-full"
                                            disabled={!formData.newSocialProfile.platform || !formData.newSocialProfile.username}
                                        >
                                            Add Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>
                                Set your account preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="availableForHire"
                                        checked={formData.availableForHire || false}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                availableForHire: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="availableForHire">
                                        Available for hire
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    When enabled, your profile will be visible to potential employers.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Interests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={interestsInput}
                                        onChange={(e) => setInterestsInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && interestsInput.trim()) {
                                                e.preventDefault();
                                                if (!formData.interests?.includes(interestsInput.trim())) {
                                                    setFormData({
                                                        ...formData,
                                                        interests: [...(formData.interests || []), interestsInput.trim()],
                                                    });
                                                }
                                                setInterestsInput('');
                                            }
                                        }}
                                        placeholder="Type and press Enter to add interest"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (interestsInput.trim() && !formData.interests?.includes(interestsInput.trim())) {
                                                setFormData({
                                                    ...formData,
                                                    interests: [...(formData.interests || []), interestsInput.trim()],
                                                });
                                                setInterestsInput('');
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.interests?.map((interest, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                                        >
                                            {interest}
                                            <button
                                                type="button"
                                                className="ml-2 text-primary/70 hover:text-primary"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        interests: formData.interests?.filter((_, i) => i !== index) || [],
                                                    });
                                                }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </form>
            {/* Add this before the closing </Tabs> tag */}
            <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/profile')}
                    disabled={saving}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : 'Save Changes'}
                </Button>
            </div>
        </Tabs>
    );
}
