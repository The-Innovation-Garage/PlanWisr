"use client"

import { useState, useEffect, use } from "react"
import { 

  Download, 
 
  Plus, 
  Save, 
  Send, 
  Trash2, 
  
} from "lucide-react"
import { format } from "date-fns"
import jsPDF from 'jspdf'
import 'jspdf-autotable'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast"

export default function CreateInvoicePage({params}) {
  const { projectId } = use(params)
 const [invoiceData, setInvoiceData] = useState({
  projectId: projectId,
    project: "",
    number: generateInvoiceNumber(),
    date: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date().setDate(new Date().getDate() + 30), "yyyy-MM-dd"),
    sender: {
      name: "",
      email: "",
      phone: "",
      logo: null
    },
    client: {
      name: "",
      email: "",
      company: "",
      address: ""
    },
    items: [
      { 
        id: Date.now(), 
        feature: "",
        description: "", 
        hours: 0,
        rate: 0, 
        total: 0 
      }
    ],
     subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: "",
    terms: "Net 30"
  })

  const [selectedTemplate, setSelectedTemplate] = useState('modern');

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
        console.log('Company settings fetched:', data.company)
        // Also update invoice sender data
        setInvoiceData(prev => ({
          ...prev,
          sender: {
            name: data.company.name || "",
            email: data.company.email || "",
            phone: data.company.phone || "",
            address: data.company.address || "",
            website: data.company.website || "",
            logoUrl: data.company.logoUrl || ""
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching company settings:', error)
    }
  }
  
// Add template options constant
const INVOICE_TEMPLATES = {
  modern: 'Modern',
  classic: 'Classic', 
  minimal: 'Minimal',
  corporate: 'Corporate'
}
const [companyData, setCompanyData] = useState({
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  logoUrl: ""
})


  const [projects, setProjects] = useState([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  // Helper function to generate invoice number
  function generateInvoiceNumber() {
    const prefix = "INV"
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${prefix}-${year}-${random}`
  }

  // Calculate totals when items change
  // Update the useEffect for calculations
useEffect(() => {
  const subtotal = invoiceData.items.reduce((sum, item) => 
    sum + ((item.hours || 0) * (item.rate || 0)), 0)
  const taxAmount = subtotal * ((invoiceData.tax || 0) / 100)
  const discountAmount = subtotal * ((invoiceData.discount || 0) / 100)
  const total = subtotal + taxAmount - discountAmount
  
  setInvoiceData(prev => ({
    ...prev,
    subtotal,
    total
  }))
}, [invoiceData.items, invoiceData.tax, invoiceData.discount])

   const addLineItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { 
          id: Date.now(), 
          feature: "",
          description: "", 
          hours: 0,
          rate: 0, 
          total: 0 
        }
      ]
    }))
  }

  // Remove line item
  const removeLineItem = (id) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

   // Update the updateLineItem function
  const updateLineItem = (id, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          updatedItem.total = updatedItem.hours * updatedItem.rate
          return updatedItem
        }
        return item
      })
    }))
  }

// Enhanced generatePDF function with templates
const generatePDF = async() => {
  const doc = new jsPDF()

    // Convert logo to base64 if it exists
    var logoBase64 = null;
    if (companyData.logoUrl) {
      logoBase64 = await imageUrlToBase64(companyData.logoUrl);
    }
  
  switch(selectedTemplate) {
    case 'modern':
      generateModernTemplate(doc, logoBase64)
      break
    case 'classic':
      generateClassicTemplate(doc, logoBase64)
      break
    case 'minimal':
      generateMinimalTemplate(doc, logoBase64)
      break
    case 'corporate':
      generateCorporateTemplate(doc, logoBase64)
      break
    default:
      generateModernTemplate(doc, logoBase64)
  }
  
  // Save the PDF
  doc.save(`Invoice-${invoiceData.number}.pdf`)
}
// Modern Template (updated with logo)
const generateModernTemplate = (doc, logoBase64) => {
  // Header with gradient effect
  doc.setFillColor(79, 70, 229) // Indigo
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 14, 25)
  
  // Add company logo if available (top right corner)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 170, 5, 30, 30)
    } catch (error) {
      console.log('Error adding logo:', error)
    }
  }
  
  // Company info on right - positioned to avoid logo overlap
  const companyInfoX = logoBase64 ? 120 : 140 // Move left if logo exists
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(companyData.name || 'Your Company', companyInfoX, 15)
  doc.text(companyData.email || 'email@company.com', companyInfoX, 20)
  doc.text(companyData.phone || '+1 234 567 8900', companyInfoX, 25)
  if (companyData.website) {
    doc.text(companyData.website, companyInfoX, 30)
  }
  
  // Add company address below header if available
  if (companyData.address) {
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.text('From:', 14, 48)
    const addressLines = doc.splitTextToSize(companyData.address, 60)
    doc.text(addressLines, 14, 52)
  }
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  // Invoice details (adjust Y position if address is present)
  const detailsY = companyData.address ? 65 : 55
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Invoice #: ${invoiceData.number}`, 14, detailsY)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${format(new Date(invoiceData.date), "MMM d, yyyy")}`, 14, detailsY + 7)
  doc.text(`Due Date: ${format(new Date(invoiceData.dueDate), "MMM d, yyyy")}`, 14, detailsY + 14)
  
  // Client info with background (adjust Y position)
  const clientY = companyData.address ? 90 : 80
  doc.setFillColor(248, 250, 252)
  doc.rect(14, clientY, 180, 35, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 18, clientY + 10)
  doc.setFont('helvetica', 'normal')
  doc.text(invoiceData.client.name || 'Client Name', 18, clientY + 17)
  doc.text(invoiceData.client.company || 'Company Name', 18, clientY + 24)
  doc.text(invoiceData.client.address || 'Address', 18, clientY + 31)
  
  // Table (adjust margin)
  const tableData = invoiceData.items.map(item => [
    item.feature || '',
    item.description || '',
    item.hours || '0',
    formatCurrency(item.rate || 0),
    formatCurrency((item.hours || 0) * (item.rate || 0))
  ])
  
  doc.autoTable({
    margin: { top: clientY + 45 },
    head: [['Feature', 'Description', 'Hours', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  })
  
  addTotalsSection(doc)
  addNotesAndTerms(doc)
}


const imageUrlToBase64 = async (url) => {
  try {
    // Use our proxy API route to avoid CORS issues
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

// Classic Template (updated with logo)
const generateClassicTemplate = (doc, logoBase64) => {
  // Simple header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 14, 25)
  
  // Add logo in top right
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 165, 5, 35, 35)
    } catch (error) {
      console.log('Error adding logo:', error)
    }
  }
  
  // Company info positioned to avoid logo collision
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(companyData.name || 'Your Company', 14, 35)
  doc.text(companyData.email || 'email@company.com', 14, 40)
  if (companyData.phone) {
    doc.text(companyData.phone, 14, 45)
  }
  if (companyData.address) {
    const addressLines = doc.splitTextToSize(companyData.address, 80)
    doc.text(addressLines, 14, 50)
  }
  
  // Invoice details with borders (positioned on right side)
  doc.rect(120, 45, 80, 25)
  doc.text(`Invoice #: ${invoiceData.number}`, 122, 55)
  doc.text(`Date: ${format(new Date(invoiceData.date), "MMM d, yyyy")}`, 122, 60)
  doc.text(`Due: ${format(new Date(invoiceData.dueDate), "MMM d, yyyy")}`, 122, 65)
  
  // Client section with border (adjust Y based on company address)
  const clientY = companyData.address ? 80 : 75
  doc.rect(14, clientY, 180, 30)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 16, clientY + 10)
  doc.setFont('helvetica', 'normal')
  doc.text(invoiceData.client.name || 'Client Name', 16, clientY + 17)
  doc.text(invoiceData.client.company || 'Company Name', 16, clientY + 22)
  doc.text(invoiceData.client.address || 'Address', 16, clientY + 27)
  
  // Table with classic styling
  const tableData = invoiceData.items.map(item => [
    item.feature || '',
    item.description || '',
    item.hours || '0',
    formatCurrency(item.rate || 0),
    formatCurrency((item.hours || 0) * (item.rate || 0))
  ])
  
  doc.autoTable({
    margin: { top: clientY + 40 },
    head: [['Feature', 'Description', 'Hours', 'Rate', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 11,
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [128, 128, 128]
    }
  })
  
  addTotalsSection(doc)
  addNotesAndTerms(doc)
}


// Corporate Template (updated with logo)
const generateCorporateTemplate = (doc, logoBase64) => {
  // Professional header with logo space
  doc.setFillColor(44, 62, 80) // Dark blue
  doc.rect(0, 0, 210, 50, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 14, 30)
  
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 170, 5, 30, 30)
    } catch (error) {
      console.log('Error adding logo:', error)
    }
  }
  
  // Company details in header with real data
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(companyData.name || 'Your Company Name', 120, 20)
  doc.text(companyData.email || 'contact@company.com', 120, 26)
  doc.text(companyData.phone || '+1 (555) 123-4567', 120, 32)
  if (companyData.website) {
    doc.text(companyData.website, 120, 38)
  }
  
  // Company address below header
  doc.setTextColor(0, 0, 0)
  if (companyData.address) {
    doc.setFontSize(8)
    doc.text('Company Address:', 14, 58)
    const addressLines = doc.splitTextToSize(companyData.address, 100)
    doc.text(addressLines, 14, 62)
  }
  
  // Invoice details section (adjust Y position)
  const detailsY = companyData.address ? 75 : 60
  doc.setFillColor(236, 240, 241)
  doc.rect(14, detailsY, 180, 25, 'F')
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Details', 18, detailsY + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Invoice Number: ${invoiceData.number}`, 18, detailsY + 17)
  doc.text(`Invoice Date: ${format(new Date(invoiceData.date), "MMM d, yyyy")}`, 100, detailsY + 17)
  doc.text(`Due Date: ${format(new Date(invoiceData.dueDate), "MMM d, yyyy")}`, 18, detailsY + 22)
  
  // Client information (adjust Y position)
  const clientY = detailsY + 35
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Bill To:', 14, clientY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(invoiceData.client.name || 'Client Name', 14, clientY + 8)
  doc.text(invoiceData.client.company || 'Company Name', 14, clientY + 15)
  doc.text(invoiceData.client.address || 'Address', 14, clientY + 22)
  
  // Professional table (adjust margin)
  const tableData = invoiceData.items.map(item => [
    item.feature || '',
    item.description || '',
    item.hours || '0',
    formatCurrency(item.rate || 0),
    formatCurrency((item.hours || 0) * (item.rate || 0))
  ])
  
  doc.autoTable({
    margin: { top: clientY + 35 },
    head: [['Feature', 'Description', 'Hours', 'Rate', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  })
  
  addTotalsSection(doc)
  addNotesAndTerms(doc)
}


// Minimal Template (updated with logo)
const generateMinimalTemplate = (doc, logoBase64) => {
  // Clean header with company name
  doc.setFontSize(32)
  doc.setFont('helvetica', 'normal')
  doc.text('Invoice', 14, 30)
  
  // Add logo in top right corner
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 165, 5, 35, 35)
    } catch (error) {
      console.log('Error adding logo:', error)
    }
  }
  
  // Company info positioned to avoid logo overlap
  doc.setFontSize(12)
  doc.text(companyData.name || 'Your Company', 14, 45)
  
  // Company contact info (minimal) - positioned below company name
  doc.setFontSize(8)
  doc.text(companyData.email || 'email@company.com', 14, 52)
  if (companyData.phone) {
    doc.text(companyData.phone, 14, 57)
  }
  
  // Company address if available (minimal style)
  if (companyData.address) {
    doc.setFontSize(7)
    const addressLines = doc.splitTextToSize(companyData.address, 80)
    doc.text(addressLines, 14, 62)
  }
  
  // Minimal invoice details (positioned on right)
  doc.setFontSize(10)
  doc.text(`${invoiceData.number}`, 120, 45)
  doc.text(`${format(new Date(invoiceData.date), "MMM d, yyyy")}`, 120, 52)
  
  // Client info - minimal (adjust Y position)
  const clientY = companyData.address ? 80 : 75
  doc.setFontSize(11)
  doc.text(invoiceData.client.name || 'Client Name', 14, clientY)
  doc.setFontSize(9)
  doc.text(invoiceData.client.company || 'Company Name', 14, clientY + 7)
  
  // Clean table
  const tableData = invoiceData.items.map(item => [
    item.feature || '',
    item.description || '',
    item.hours || '0',
    formatCurrency(item.rate || 0),
    formatCurrency((item.hours || 0) * (item.rate || 0))
  ])
  
  doc.autoTable({
    margin: { top: clientY + 20 },
    head: [['Feature', 'Description', 'Hours', 'Rate', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 10,
      fontStyle: 'normal'
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  })
  
  addTotalsSection(doc)
}




// Helper function for totals section
const addTotalsSection = (doc) => {
  const finalY = doc.lastAutoTable.finalY + 15
  
  // Totals box
  doc.setFillColor(248, 250, 252)
  doc.rect(130, finalY - 5, 70, 35, 'F')
  
  doc.setFontSize(10)
  doc.text(`Subtotal:`, 135, finalY + 2)
  doc.text(formatCurrency(invoiceData.subtotal || 0), 190, finalY + 2, { align: 'right' })
  
  doc.text(`Tax (${invoiceData.tax || 0}%):`, 135, finalY + 8)
  doc.text(formatCurrency((invoiceData.subtotal || 0) * ((invoiceData.tax || 0) / 100)), 190, finalY + 8, { align: 'right' })
  
  doc.text(`Discount (${invoiceData.discount || 0}%):`, 135, finalY + 14)
  doc.text(formatCurrency((invoiceData.subtotal || 0) * ((invoiceData.discount || 0) / 100)), 190, finalY + 14, { align: 'right' })
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`Total:`, 135, finalY + 22)
  doc.text(formatCurrency(invoiceData.total || 0), 190, finalY + 22, { align: 'right' })
}

// Helper function for notes and terms
const addNotesAndTerms = (doc) => {
  const finalY = doc.lastAutoTable.finalY + 55
  
  if (invoiceData.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 14, finalY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(invoiceData.notes, 180)
    doc.text(splitNotes, 14, finalY + 5)
  }
  
  if (invoiceData.terms) {
    const notesHeight = invoiceData.notes ? 15 : 0
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Terms & Conditions:', 14, finalY + notesHeight)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitTerms = doc.splitTextToSize(invoiceData.terms, 180)
    doc.text(splitTerms, 14, finalY + notesHeight + 5)
  }
}

  const saveInvoice = async() => {
    toast.loading('Saving invoice...')
    const token = localStorage.getItem('token')
    const req = await fetch('/api/invoice/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,

      },
      body: JSON.stringify(invoiceData)
    })

    const res = await req.json()
    toast.dismiss()
    if (res.type === 'success') {
      toast.success('Invoice saved successfully!')
    }
    else {
      toast.error(`Error saving invoice: ${res.message}`)
    }
  }


  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new invoice
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            {isPreviewMode ? "Edit" : "Preview"}
          </Button> */}
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select template" />
    </SelectTrigger>
    <SelectContent>
      {Object.entries(INVOICE_TEMPLATES).map(([key, label]) => (
        <SelectItem key={key} value={key}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
          <Button onClick={saveInvoice} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={generatePDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {/* <Button>
            <Send className="mr-2 h-4 w-4" />
            Send to Client
          </Button> */}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Project and Invoice Details */}
        <Card>
  <CardHeader>
    <CardTitle>Invoice Details</CardTitle>
  </CardHeader>
  <CardContent className="grid gap-6">
    {/* Basic Invoice Info */}
   

    {/* Dates */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label>Invoice Date</Label>
        <Input 
          type="date" 
          value={invoiceData.date}
          onChange={(e) => setInvoiceData(prev => ({ 
            ...prev, 
            date: e.target.value 
          }))}
        />
      </div>
      <div className="grid gap-2">
        <Label>Due Date</Label>
        <Input 
          type="date"
          value={invoiceData.dueDate}
          onChange={(e) => setInvoiceData(prev => ({ 
            ...prev, 
            dueDate: e.target.value 
          }))}
        />
      </div>
    </div>

    {/* Client Information */}
    <div className="border-t pt-4">
      <h3 className="text-sm font-medium mb-4">Client Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Client Name</Label>
          <Input 
            placeholder="Enter client name"
            value={invoiceData.client.name}
            onChange={(e) => setInvoiceData(prev => ({ 
              ...prev, 
              client: { ...prev.client, name: e.target.value } 
            }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Company Name</Label>
          <Input 
            placeholder="Enter company name"
            value={invoiceData.client.company}
            onChange={(e) => setInvoiceData(prev => ({ 
              ...prev, 
              client: { ...prev.client, company: e.target.value } 
            }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input 
            type="email"
            placeholder="Enter client email"
            value={invoiceData.client.email}
            onChange={(e) => setInvoiceData(prev => ({ 
              ...prev, 
              client: { ...prev.client, email: e.target.value } 
            }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Address</Label>
          <Textarea 
            placeholder="Enter client address"
            value={invoiceData.client.address}
            onChange={(e) => setInvoiceData(prev => ({ 
              ...prev, 
              client: { ...prev.client, address: e.target.value } 
            }))}
          />
        </div>
      </div>
    </div>
  </CardContent>
</Card>

    {/* Line Items */}
    <Card>
      <CardHeader>
        <CardTitle>Feature Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Feature</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-1">Hours</div>
          <div className="col-span-2">Rate</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1"></div>
        </div>
        {invoiceData.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3">
              <Input
                placeholder="Feature name"
                value={item.feature}
                onChange={(e) => updateLineItem(item.id, "feature", e.target.value)}
              />
            </div>
            <div className="col-span-4">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <Input
                type="number"
                placeholder="Hours"
                value={item.hours}
                onChange={(e) => updateLineItem(item.id, "hours", parseFloat(e.target.value))}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value))}
              />
            </div>
            <div className="col-span-1">
              <Input
                disabled
                value={formatCurrency(item.hours * item.rate)}
              />
            </div>
            <div className="col-span-1">
              {index > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeLineItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addLineItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </CardContent>
    </Card>


        {/* Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(invoiceData.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax (%)</span>
                <Input
                  type="number"
                  className="w-24"
                  value={invoiceData.tax}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    tax: parseFloat(e.target.value)
                  }))}
                />
              </div>
              <div className="flex justify-between items-center">
                <span>Discount (%)</span>
                <Input
                  type="number"
                  className="w-24"
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    discount: parseFloat(e.target.value)
                  }))}
                />
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(invoiceData.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes and Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add any notes or special instructions..."
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Terms</Label>
              <Textarea
                placeholder="Payment terms and conditions..."
                value={invoiceData.terms}
                onChange={(e) => setInvoiceData(prev => ({
                  ...prev,
                  terms: e.target.value
                }))}
              />
            </div>
          </CardContent>
        </Card>

       
       
      </div>
    </div>
  )
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}