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

  const generatePDF = () => {
    const doc = new jsPDF()
    
    // Add header
    doc.setFontSize(20)
    doc.text('INVOICE', 14, 22)
    
    doc.setFontSize(10)
    doc.text(`Invoice #: ${invoiceData.number}`, 14, 35)
    doc.text(`Date: ${format(new Date(invoiceData.date), "MMM d, yyyy")}`, 14, 40)
    doc.text(`Due Date: ${format(new Date(invoiceData.dueDate), "MMM d, yyyy")}`, 14, 45)
  
    // Add client info
    doc.text('Bill To:', 14, 60)
    doc.text(invoiceData.client.name || 'Client Name', 14, 65)
    doc.text(invoiceData.client.company || 'Company Name', 14, 70)
    doc.text(invoiceData.client.address || 'Address', 14, 75)
  
    // Add items table with formatted data
    const tableData = invoiceData.items.map(item => [
      item.feature || '',
      item.description || '',
      item.hours || '0',
      formatCurrency(item.rate || 0),
      formatCurrency((item.hours || 0) * (item.rate || 0))
    ])
  
    // Use autoTable plugin
    doc.autoTable({
      margin: { top: 85 },
      head: [['Feature', 'Description', 'Hours', 'Rate', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    })
    // Add totals with proper formatting
    const finalY = doc.lastAutoTable.finalY + 10
    doc.text(`Subtotal:`, 140, finalY)
    doc.text(formatCurrency(invoiceData.subtotal || 0), 170, finalY, { align: 'right' })
    
    doc.text(`Tax (${invoiceData.tax || 0}%):`, 140, finalY + 5)
    doc.text(formatCurrency((invoiceData.subtotal || 0) * ((invoiceData.tax || 0) / 100)), 170, finalY + 5, { align: 'right' })
    
    doc.text(`Discount (${invoiceData.discount || 0}%):`, 140, finalY + 10)
    doc.text(formatCurrency((invoiceData.subtotal || 0) * ((invoiceData.discount || 0) / 100)), 170, finalY + 10, { align: 'right' })
    
    doc.text(`Total:`, 140, finalY + 15)
    doc.text(formatCurrency(invoiceData.total || 0), 170, finalY + 15, { align: 'right' })
  
    // Add notes & terms
    if (invoiceData.notes) {
      doc.text('Notes:', 14, finalY + 25)
      doc.setFontSize(8)
      doc.text(invoiceData.notes, 14, finalY + 30)
    }
  
    if (invoiceData.terms) {
      doc.setFontSize(10)
      doc.text('Terms:', 14, finalY + 40)
      doc.setFontSize(8)
      doc.text(invoiceData.terms, 14, finalY + 45)
    }
  
    // Save the PDF
    doc.save(`Invoice-${invoiceData.number}.pdf`)
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
          <Button onClick={saveInvoice} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={generatePDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send to Client
          </Button>
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