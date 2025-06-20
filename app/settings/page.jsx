// app/settings/page.jsx
"use client"
import withAuth from '@/components/withAuth';

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Save } from "lucide-react"
import toast from "react-hot-toast"
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from "@/firebase/firebaseStorage"
function CompanySettingsPage() {
    const [companyData, setCompanyData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        logo: null,
        logoUrl: ""
    })

    const [logoPreview, setLogoPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState("");
    const fileInputRef = useRef(null)


    useEffect(() => {
        fetchCompanySettings()
    }, [])

    const fetchCompanySettings = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/company/get-settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.type === 'success') {
                setCompanyData(data.company)
                if (data.company.logoUrl) {
                    setLogoPreview(data.company.logoUrl)
                }
            }
        } catch (error) {
            console.error('Error fetching company settings:', error)
        }
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const maxSize = 2 * 1024 * 1024; // 2MB in bytes

            if (file.size > maxSize) {
                toast.error('File size must be less than 2MB. Please choose a smaller file.');
                // Clear the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP).');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            setCompanyData(prev => ({ ...prev, logo: file }))
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result)
            }
            reader.readAsDataURL(file)
            handleUploadFile(file)
        }
    }

    const handleUploadFile = async (file) => {
        if (!file) {
            console.error('No file selected for upload')
            return
        }

        toast.loading('Uploading logo...')
        // console.log(`File: ${file}`)
        if (file) {
            const name = file.name
            const storageRef = ref(storage, `planwisr/${name}`)
            const uploadTask = uploadBytesResumable(storageRef, file)

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100

                    setUploadProgress(progress) // to show progress upload

                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused')
                            break
                        case 'running':
                            console.log('Upload is running')
                            break
                    }
                },
                (error) => {
                    console.error(error.message)
                    toast.dismiss()
                    toast.error('Error uploading logo')
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                        toast.dismiss()
                        setDownloadURL(url)
                        setCompanyData(prev => ({ ...prev, logoUrl: url }))
                        toast.success('Logo uploaded successfully!')
                    })
                },
            )
        } else {
            console.error('File not found')
        }
    }

    const saveSettings = async () => {
        try {
            toast.loading('Saving company settings...')
            const token = localStorage.getItem('token')

            const requestBody = {
                name: companyData.name || "",
                email: companyData.email || "",
                phone: companyData.phone || "",
                address: companyData.address || "",
                website: companyData.website || "",
                logoUrl: companyData.logoUrl || ""
            }

            const response = await fetch('/api/company/update-settings', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
       
            })

            const data = await response.json()
            toast.dismiss()

            if (data.type === 'success') {
                toast.success('Company settings saved successfully!')
            } else {
                toast.error(data.message || 'Error saving settings')
            }
        } catch (error) {
            toast.dismiss()
            toast.error('Error saving company settings')
        }
    }

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Company Settings</h1>
                <p className="text-muted-foreground">
                    Update your company information for invoices and documents
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <Label>Company Logo</Label>
                        <div className="flex items-center gap-4">
                            {logoPreview && (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-16 h-16 object-contain border rounded"
                                />
                            )}
                            <div>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <Button variant="outline" asChild>
                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Logo
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Company Details */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Company Name</Label>
                            <Input
                                value={companyData.name}
                                onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Your Company Name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={companyData.email}
                                onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="company@email.com"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Phone</Label>
                            <Input
                                value={companyData.phone}
                                onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Website</Label>
                            <Input
                                value={companyData.website}
                                onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://yourcompany.com"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Address</Label>
                            <Textarea
                                value={companyData.address}
                                onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="123 Business St, City, State 12345"
                                rows={3}
                            />
                        </div>
                    </div>

                    <Button onClick={saveSettings} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Company Settings
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default withAuth(CompanySettingsPage);