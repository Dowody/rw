import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle 
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Invoice {
  id: string
  subscriptionName: string
  date: Date
  amount: number
  status: string
  items: { name: string; price: number; quantity: number }[]
  invoiceNumber: string
}

const InvoicesSection: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Fetch Invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('User not authenticated')
          setLoading(false)
          return
        }

        // Fetch user details
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (!userData) {
          setError('Failed to get user data')
          setLoading(false)
          return
        }

        // Fetch orders with subscription details
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders_with_items')
          .select(`
            id, 
            total_amount, 
            transaction_date, 
            status, 
            items,
            subscription_id,
            subscriptions (name)
          `)
          .eq('user_id', userData.id)
          .order('transaction_date', { ascending: false })

        if (ordersError) {
          setError('Failed to fetch invoices')
          setLoading(false)
          return
        }

        // Process invoices
        const processedInvoices: Invoice[] = (ordersData || []).map((order, index) => ({
          id: order.id,
          subscriptionName: order.subscriptions?.[0]?.name || 'Unknown Subscription',
          date: new Date(order.transaction_date),
          amount: order.total_amount,
          status: order.status,
          items: order.items || [],
          invoiceNumber: `INV-${new Date(order.transaction_date).getFullYear()}-${String(index + 1).padStart(4, '0')}`
        }))

        setInvoices(processedInvoices)
        setLoading(false)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  // Generate PDF Invoice
  const generatePDF = async (invoice: Invoice) => {
    try {
      // Create new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Set document properties
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      // Invoice Header
      doc.setFontSize(18)
      doc.text('RollWithdraw Invoice', 105, 30, { align: 'center' })
      
      // Invoice Details
      doc.setFontSize(10)
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 50)
      doc.text(`Date: ${invoice.date.toLocaleDateString()}`, 20, 60)
      doc.text(`Subscription: ${invoice.subscriptionName}`, 20, 70)
      doc.text(`Status: ${invoice.status}`, 20, 80)

      // Items Table
      doc.setFontSize(10)
      doc.text('Items', 20, 100)
      doc.setLineWidth(0.5)
      doc.line(20, 105, 190, 105)

      let yPosition = 110
      invoice.items.forEach((item, index) => {
        doc.text(item.name, 20, yPosition)
        doc.text(`€${item.price.toFixed(2)}`, 120, yPosition)
        doc.text(item.quantity.toString(), 160, yPosition)
        doc.text(`€${(item.price * item.quantity).toFixed(2)}`, 180, yPosition)
        yPosition += 10
      })

      // Total
      doc.setLineWidth(0.5)
      doc.line(20, yPosition, 190, yPosition)
      yPosition += 10
      doc.text('Total:', 140, yPosition)
      doc.text(`€${invoice.amount.toFixed(2)}`, 180, yPosition)

      // Footer
      doc.setFontSize(8)
      doc.text('© 2025 RollWithdraw. All rights reserved.', 105, 280, { align: 'center' })

      // Save PDF
      doc.save(`Invoice_${invoice.invoiceNumber}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Failed to generate PDF')
    }
  }

  // Render Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8a4fff]"></div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="backdrop-blur-xl rounded-3xl p-8 border border-[#8a4fff]/10"
    >
      <h2 className="text-2xl font-bold text-[#8a4fff] mb-6 flex items-center">
        <FileText className="mr-3 w-6 h-6" /> Invoices
      </h2>

      {/* Invoices List */}
      <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-3xl p-6 border border-[#8a4fff]/10">
        {invoices.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p>No invoices available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="bg-[#2c1b4a] rounded-xl p-4 
                border border-transparent hover:border-[#8a4fff]/30 
                transition-all group flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center space-x-3">
                    <h5 className="text-sm font-semibold text-white group-hover:text-[#8a4fff] transition-colors">
                      {invoice.subscriptionName}
                    </h5>
                    <span 
                      className={`
                        px-2 py-1 rounded-full text-xs
                        ${invoice.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'}
                      `}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    {invoice.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    <span className="mx-2">•</span>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Invoice #{invoice.invoiceNumber}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-white group-hover:text-[#8a4fff] font-bold transition-colors">
                    €{invoice.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => generatePDF(invoice)}
                    className="bg-[#8a4fff]/10 text-[#8a4fff] p-2 rounded-lg 
                    hover:bg-[#8a4fff]/20 transition-colors"
                    title="Download Invoice"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default InvoicesSection
