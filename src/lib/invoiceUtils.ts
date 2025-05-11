import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

interface Purchase {
  id: number
  subscriptionName: string
  date: Date
  amount: number
  items: Array<{ name: string; price: number }>
  duration_days?: number
  transactionHash?: string
}

interface UserData {
  email: string
  username: string
}

export const generateInvoicePDF = async (purchase: Purchase, userData: UserData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Generate QR Code for transaction verification
  const qrCodeData = `Order ID: ${purchase.id}\nSubscription: ${purchase.subscriptionName}\nDate: ${purchase.date.toISOString()}${purchase.transactionHash ? `\nTransaction Hash: ${purchase.transactionHash}` : ''}`
  const qrCodeImage = await QRCode.toDataURL(qrCodeData)

  // Page setup
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // Company Logo and Header
  doc.setFontSize(10)
  doc.setTextColor(50)
  
  doc.setFont('helvetica', 'bold')
  doc.text('RollWithdraw', margin, 20)
  doc.setFont('helvetica', 'normal')
  doc.text('Smart CSGORoll Withdrawals', margin, 25)
  doc.text('support@rollwithdraw.com', margin, 30)

  // Horizontal Line
  doc.setLineWidth(0.5)
  doc.line(margin, 35, pageWidth - margin, 35)

  // Invoice Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT INVOICE', pageWidth / 2, 45, { align: 'center' })

  // Order Details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let y = 55

  const addDetailRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, pageWidth - margin, y, { align: 'right' })
    y += 6
  }

  const invoiceNumber = `RW-${purchase.id}-${new Date(purchase.date).getFullYear()}`
  
  addDetailRow('Invoice Number:', invoiceNumber)
  addDetailRow('Date:', purchase.date.toLocaleString())
  addDetailRow('Email:', userData.email)

  // Horizontal Line
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Subscription Information Section
  doc.setFont('helvetica', 'bold')
  doc.text('SUBSCRIPTION DETAILS', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  addDetailRow('Subscription:', purchase.subscriptionName)
  addDetailRow('Subscription Period:', formatSubscriptionDuration(purchase.duration_days))

  // Horizontal Line
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Payment Details Section
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT DETAILS', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  // Calculate total
  const total = purchase.amount

  addDetailRow('Amount:', `€${total.toFixed(2)}`)
  
  // Reset text color
  doc.setTextColor(50)
  addDetailRow('Payment Method:', 'Crypto')
  
  // Add order ID
  addDetailRow('Order ID:', purchase.id.toString())
  
  // Add transaction hash if available
  if (purchase.transactionHash) {
    addDetailRow('Transaction Hash:', purchase.transactionHash)
    // Add a clickable link to view the transaction
    const txHash = purchase.transactionHash
    const txUrl = `https://etherscan.io/tx/${txHash}`
    doc.setTextColor(0, 0, 255) // Blue color for link
    doc.textWithLink('View Transaction', pageWidth - margin - 60, y, { url: txUrl })
    doc.setTextColor(50) // Reset text color
  }

  // Horizontal Line
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Total Amount
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL AMOUNT:', margin, y)
  doc.text(`€${total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
  y += 10

  // Items List
  if (purchase.items && purchase.items.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('ITEMS', margin, y)
    y += 6
    
    doc.setFont('helvetica', 'normal')
    purchase.items.forEach(item => {
      doc.text(`${item.name}`, margin, y)
      doc.text(`€${item.price.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
      y += 5
    })
  }

  // QR Code
  const qrCodeX = pageWidth - margin - 30
  const qrCodeY = pageHeight - margin - 30
  doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, 30, 30)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('© 2025 RollWithdraw. All rights reserved.', margin, pageHeight - 10)
  doc.text('This is an official invoice for your records.', pageWidth - margin, pageHeight - 10, { align: 'right' })

//   // Watermark
//   doc.setTextColor(200)
//   doc.setFontSize(60)
//   doc.setFont('helvetica', 'bold')
//   doc.text('ROLLWITHDRAW', pageWidth / 2, pageHeight / 2, { 
//     align: 'center', 
//     angle: -45
//   })

  // Save PDF
  const filename = `RollWithdraw_Invoice_${invoiceNumber}.pdf`
  doc.save(filename)
}

export const calculateSubscriptionEndDate = (startDate: Date, durationDays: number): Date => {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + durationDays)
  return endDate
}

export const formatSubscriptionDuration = (durationDays: number | undefined): string => {
  return `${durationDays || 1} Days`
}
