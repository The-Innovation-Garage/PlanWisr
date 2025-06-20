"use client"

import { useState, useEffect, use } from "react"
import { format } from "date-fns"
import { Download, Edit, Eye, Plus, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import withAuth from '@/components/withAuth';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Template options
const INVOICE_TEMPLATES = {
  modern: 'Modern',
  classic: 'Classic', 
  minimal: 'Minimal',
  corporate: 'Corporate'
}

function InvoicesPage({ params }) {
  const router = useRouter()
  const { projectId } = use(params)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Template selection dialog state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    logoUrl: ""
  })

  useEffect(() => {
    fetchInvoices()
    fetchCompanySettings()
  }, [])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/invoice/get-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projectId })
      })
      const data = await response.json()
      
      if (data.type === 'success') {
        setInvoices(data.invoices)
      } else {
        toast.error('Failed to fetch invoices')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Error loading invoices')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanySettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/company/get-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.type === 'success') {
        setCompanyData(data.company)
      }
    } catch (error) {
      console.error('Error fetching company settings:', error)
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={statusStyles[status] || statusStyles.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleViewInvoice = (invoice) => {
    router.push(`/projects/${projectId}/invoices/update?invoiceId=${invoice._id}`)
  }

  const handleDownloadInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setIsTemplateDialogOpen(true)
  }

  const handleTemplateDownload = async () => {
    if (!selectedInvoice) return
    
    toast.loading('Generating PDF...')
    try {
      await generateInvoicePDF(selectedInvoice, selectedTemplate)
      toast.dismiss()
      toast.success('Invoice downloaded successfully!')
    } catch (error) {
      toast.dismiss()
      toast.error('Error generating PDF')
      console.error('PDF generation error:', error)
    } finally {
      setIsTemplateDialogOpen(false)
      setSelectedInvoice(null)
    }
  }

  // Helper function to convert image URL to base64
  const imageUrlToBase64 = async (url) => {
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error converting image to base64:', error)
      return null
    }
  }

  // Main PDF generation function
  const generateInvoicePDF = async (invoiceData, template) => {
    const doc = new jsPDF()

    // Convert logo to base64 if it exists
    let logoBase64 = null
    if (companyData.logoUrl) {
      logoBase64 = await imageUrlToBase64(companyData.logoUrl)
    }
  
    switch(template) {
      case 'modern':
        generateModernTemplate(doc, logoBase64, invoiceData)
        break
      case 'classic':
        generateClassicTemplate(doc, logoBase64, invoiceData)
        break
      case 'minimal':
        generateMinimalTemplate(doc, logoBase64, invoiceData)
        break
      case 'corporate':
        generateCorporateTemplate(doc, logoBase64, invoiceData)
        break
      default:
        generateModernTemplate(doc, logoBase64, invoiceData)
    }
    
    // Save the PDF
    doc.save(`Invoice-${invoiceData.invoiceId}.pdf`)
  }

  // Modern Template
  const generateModernTemplate = (doc, logoBase64, invoiceData) => {
    // Header with gradient effect
    doc.setFillColor(79, 70, 229) // Indigo
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 14, 25)
    
    // Add company logo if available
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', 170, 5, 30, 30)
      } catch (error) {
        console.log('Error adding logo:', error)
      }
    }
    
    // Company info
    const companyInfoX = logoBase64 ? 120 : 140
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(companyData.name || 'Your Company', companyInfoX, 15)
    doc.text(companyData.email || 'email@company.com', companyInfoX, 20)
    doc.text(companyData.phone || '+1 234 567 8900', companyInfoX, 25)
    if (companyData.website) {
      doc.text(companyData.website, companyInfoX, 30)
    }
    
    // Company address
    if (companyData.address) {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(8)
      doc.text('From:', 14, 48)
      const addressLines = doc.splitTextToSize(companyData.address, 60)
      doc.text(addressLines, 14, 52)
    }
    
    doc.setTextColor(0, 0, 0)
    
    // Invoice details
    const detailsY = companyData.address ? 65 : 55
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Invoice #: ${invoiceData.invoiceId}`, 14, detailsY)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${format(new Date(invoiceData.invoiceDate), "MMM d, yyyy")}`, 14, detailsY + 7)
    doc.text(`Due Date: ${format(new Date(invoiceData.dueDate), "MMM d, yyyy")}`, 14, detailsY + 14)
    
    // Client info
    const clientY = companyData.address ? 90 : 80
    doc.setFillColor(248, 250, 252)
    doc.rect(14, clientY, 180, 35, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', 18, clientY + 10)
    doc.setFont('helvetica', 'normal')
    doc.text(invoiceData.client.name || 'Client Name', 18, clientY + 17)
    doc.text(invoiceData.client.company || 'Company Name', 18, clientY + 24)
    doc.text(invoiceData.client.address || 'Address', 18, clientY + 31)
    
    // Table
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
    
    addTotalsSection(doc, invoiceData)
    addNotesAndTerms(doc, invoiceData)
  }

  // Classic Template
  const generateClassicTemplate = (doc, logoBase64, invoiceData) => {
    // Simple header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 14, 25)
    
    // Add logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', 165, 5, 35, 35)
      } catch (error) {
        console.log('Error adding logo:', error)
      }
    }
    
    // Company info
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
    
    // Invoice details with borders
    doc.rect(120, 45, 80, 25)
    doc.text(`Invoice #: ${invoiceData.invoiceId}`, 122, 55)
    doc.text(`Date: ${format(new Date(invoiceData.invoiceDate), "MMM d, yyyy")}`, 122, 60)
    doc.text(`Due: ${format(new Date(invoiceData.dueDate), "MMM d, yyyy")}`, 122, 65)
    
    // Client section
    const clientY = companyData.address ? 80 : 75
    doc.rect(14, clientY, 180, 30)
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', 16, clientY + 10)
    doc.setFont('helvetica', 'normal')
    doc.text(invoiceData.client.name || 'Client Name', 16, clientY + 17)
    doc.text(invoiceData.client.company || 'Company Name', 16, clientY + 22)
    doc.text(invoiceData.client.address || 'Address', 16, clientY + 27)
    
    // Table
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
    
    addTotalsSection(doc, invoiceData)
    addNotesAndTerms(doc, invoiceData)
  }

  // Corporate Template
  const generateCorporateTemplate = (doc, logoBase64, invoiceData) => {
    // Professional header
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
    
    // Company details in header
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(companyData.name || 'Your Company Name', 120, 20)
    doc.text(companyData.email || 'contact@company.com', 120, 26)
    doc.text(companyData.phone || '+1 (555) 123-4567', 120, 32)
    if (companyData.website) {
      doc.text(companyData.website, 120, 38)
    }
    
    // Company address
    doc.setTextColor(0, 0, 0)
    if (companyData.address) {
      doc.setFontSize(8)
      doc.text('Company Address:', 14, 58)
      const addressLines = doc.splitTextToSize(companyData.address, 100)
      doc.text(addressLines, 14, 62)
    }
    
    // Invoice details section
    const detailsY = companyData.address ? 75 : 60
    doc.setFillColor(236, 240, 241)
    doc.rect(14, detailsY, 180, 25, 'F')
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice Details', 18, detailsY + 10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Invoice Number: ${invoiceData.invoiceId}`, 18, detailsY + 17)
    doc.text(`Invoice Date: ${format(new Date(invoiceData.invoiceDate), "MMM d, yyyy")}`, 100, detailsY + 17)
    doc.text(`Due Date: ${format(new Date(invoiceData.dueDate), "MMM d, yyyy")}`, 18, detailsY + 22)
    
    // Client information
    const clientY = detailsY + 35
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Bill To:', 14, clientY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(invoiceData.client.name || 'Client Name', 14, clientY + 8)
    doc.text(invoiceData.client.company || 'Company Name', 14, clientY + 15)
    doc.text(invoiceData.client.address || 'Address', 14, clientY + 22)
    
    // Professional table
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
    
    addTotalsSection(doc, invoiceData)
    addNotesAndTerms(doc, invoiceData)
  }

  // Minimal Template
  const generateMinimalTemplate = (doc, logoBase64, invoiceData) => {
    // Clean header
    doc.setFontSize(32)
    doc.setFont('helvetica', 'normal')
    doc.text('Invoice', 14, 30)
    
    // Add logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', 165, 5, 35, 35)
      } catch (error) {
        console.log('Error adding logo:', error)
      }
    }
    
    // Company info
    doc.setFontSize(12)
    doc.text(companyData.name || 'Your Company', 14, 45)
    
    doc.setFontSize(8)
    doc.text(companyData.email || 'email@company.com', 14, 52)
    if (companyData.phone) {
      doc.text(companyData.phone, 14, 57)
    }
    
    if (companyData.address) {
      doc.setFontSize(7)
      const addressLines = doc.splitTextToSize(companyData.address, 80)
      doc.text(addressLines, 14, 62)
    }
    
    // Minimal invoice details
    doc.setFontSize(10)
    doc.text(`${invoiceData.invoiceId}`, 120, 45)
    doc.text(`${format(new Date(invoiceData.invoiceDate), "MMM d, yyyy")}`, 120, 52)
    
    // Client info
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
    
    addTotalsSection(doc, invoiceData)
  }

  // Helper function for totals section
  const addTotalsSection = (doc, invoiceData) => {
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
  const addNotesAndTerms = (doc, invoiceData) => {
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

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null) return '$0.00'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage and track your project invoices</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => router.push(`/projects/${projectId}/invoices/create`)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(inv => inv.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>{format(new Date(invoice.invoiceDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewInvoice(invoice)}
                            title="Edit Invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Invoice Template</DialogTitle>
            <DialogDescription>
              Select a template for your invoice PDF download.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
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
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTemplateDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


export default withAuth(InvoicesPage)