"use client"

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import withAuth from '@/components/withAuth';

function UpdateInvoicePage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projectId } = use(params)
  const invoiceId = searchParams.get('invoiceId')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [invoice, setInvoice] = useState(null)

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/invoice/get-single-invoice`, {
          method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ invoiceId })
      })
      const data = await response.json()
      
      if (data.type === 'success') {
        setInvoice({
          ...data.invoice,
          invoiceDate: format(new Date(data.invoice.invoiceDate), "yyyy-MM-dd"),
          dueDate: format(new Date(data.invoice.dueDate), "yyyy-MM-dd"),
          items: data.invoice.items.map(item => ({ 
            ...item, 
            id: item._id || Date.now() + Math.random()
          }))
        })
      } else {
        toast.error('Failed to fetch invoice')
        router.back()
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      toast.error('Error loading invoice')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const updateInvoiceField = (field, value) => {
    setInvoice(prev => ({ ...prev, [field]: value }))
  }

  const updateClientField = (field, value) => {
    setInvoice(prev => ({ 
      ...prev, 
      client: { ...prev.client, [field]: value } 
    }))
  }

  const updateLineItem = (id, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        (item.id === id) ? { ...item, [field]: value } : item
      )
    }))
  }

  const addLineItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        feature: "",
        description: "",
        hours: 0,
        rate: 0
      }]
    }))
  }

  const removeLineItem = (id) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  // Calculate totals whenever items, tax, or discount change
  useEffect(() => {
    if (!invoice) return
    
    const subtotal = invoice.items.reduce((sum, item) => 
      sum + ((item.hours || 0) * (item.rate || 0)), 0
    )
    const taxAmount = subtotal * ((invoice.tax || 0) / 100)
    const discountAmount = subtotal * ((invoice.discount || 0) / 100)
    const total = subtotal + taxAmount - discountAmount
    
    setInvoice(prev => ({ ...prev, subtotal, total }))
  }, [invoice?.items, invoice?.tax, invoice?.discount])

  const saveInvoice = async () => {
    setSaving(true)
    toast.loading('Updating invoice...')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/invoice/update-invoice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({invoice:invoice})
      })
      const data = await response.json()
      
      toast.dismiss()
      if (data.type === 'success') {
        toast.success('Invoice updated successfully!')
        router.push(`/projects/${projectId}/invoices`)
      } else {
        toast.error(data.message || 'Failed to update invoice')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Error updating invoice')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null) return '$0.00'
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p>Invoice not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Invoice #{invoice.invoiceId}
            </h1>
            <p className="text-muted-foreground">
              Update invoice details and line items
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={saveInvoice} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="flex space-x-2 border-b">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={(e) => updateInvoiceField('invoiceDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoiceField('dueDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={invoice.status} 
                    onValueChange={(v) => updateInvoiceField('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Client Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={invoice.client.name}
                      onChange={(e) => updateClientField('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={invoice.client.company || ''}
                      onChange={(e) => updateClientField('company', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={invoice.client.email || ''}
                    onChange={(e) => updateClientField('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    className="resize-none"
                    rows={3}
                    value={invoice.client.address || ''}
                    onChange={(e) => updateClientField('address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Line Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <div style={{
                marginBottom: '1rem',
              }} className=" flex items-center justify-between my-10">
                <CardTitle>Line Items</CardTitle>
                <Button onClick={addLineItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Feature/Service</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-1">Hours</div>
                <div className="col-span-2">Rate ($)</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1">Action</div>
              </div>

              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                    <Input
                      className="col-span-3"
                      placeholder="Feature name"
                      value={item.feature || ''}
                      onChange={(e) => updateLineItem(item.id, "feature", e.target.value)}
                    />
                    <Input
                      className="col-span-4"
                      placeholder="Description"
                      value={item.description || ''}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                    />
                    <Input
                      className="col-span-1"
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.hours || 0}
                      onChange={(e) => updateLineItem(item.id, "hours", parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      className="col-span-2"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate || 0}
                      onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                    />
                    <div className="col-span-1 font-semibold text-green-600">
                      {formatCurrency((item.hours || 0) * (item.rate || 0))}
                    </div>
                    <Button
                      className="col-span-1"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center font-medium">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tax Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoice.tax || 0}
                      onChange={(e) => updateInvoiceField('tax', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tax Amount: {formatCurrency((invoice.subtotal || 0) * (invoice.tax || 0) / 100)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discount Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Discount Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Discount Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoice.discount || 0}
                      onChange={(e) => updateInvoiceField('discount', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Discount Amount: -{formatCurrency((invoice.subtotal || 0) * (invoice.discount || 0) / 100)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax ({invoice.tax || 0}%):</span>
                  <span className="font-medium">+{formatCurrency((invoice.subtotal || 0) * (invoice.tax || 0) / 100)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount ({invoice.discount || 0}%):</span>
                  <span className="font-medium">-{formatCurrency((invoice.subtotal || 0) * (invoice.discount || 0) / 100)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(invoice.total || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Notes for Client</Label>
                  <Textarea
                    className="resize-none"
                    rows={5}
                    placeholder="Any additional notes, special instructions, or thank you message for the client..."
                    value={invoice.notes || ''}
                    onChange={(e) => updateInvoiceField('notes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    className="resize-none"
                    rows={5}
                    placeholder="Payment terms, late fees, refund policy, etc..."
                    value={invoice.terms || ''}
                    onChange={(e) => updateInvoiceField('terms', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withAuth(UpdateInvoicePage)