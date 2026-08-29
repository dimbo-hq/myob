'use client';

import React, { useState, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { POSCartItem, Customer } from '@/types/inventory';
import { Printer, CheckCircle2, X, Download, Loader2, User, Phone, MapPin, ReceiptText, MessageSquare, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '@/lib/currency';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  items: POSCartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customer?: Customer | null;
}

// Crisp SVG Barcode that renders in screen, canvas, and print
const BarcodeSvg: React.FC<{ value: string }> = ({ value }) => {
  const barSequence = [2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 1, 3, 1, 2];

  let currentX = 6;
  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-1">
      <svg
        className="w-48 h-9 overflow-visible"
        viewBox="0 0 190 32"
        fill="#000000"
        xmlns="http://www.w3.org/2000/svg"
      >
        {barSequence.map((width, idx) => {
          const x = currentX;
          currentX += width + 2;
          if (idx % 2 === 0 && currentX <= 184) {
            return (
              <rect
                key={idx}
                x={x}
                y="0"
                width={width}
                height="32"
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </svg>
      <span className="font-mono text-[10px] tracking-widest text-slate-800 font-bold mt-1 block">
        * {value} *
      </span>
    </div>
  );
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  orderId,
  items,
  subtotal,
  discountTotal,
  tax,
  total,
  paymentMethod,
  customer
}) => {
  const { storeName } = useInventory();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displayName = storeName ? storeName.toUpperCase() : 'MYOB STORE';

  // 1. Direct PDF Download with html2canvas-pro (supports Tailwind v4 lab/oklch colors)
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPDF(true);

    try {
      // Capture only the receipt node
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 80; // 80mm thermal width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, Math.max(100, imgHeight + 4)]
      });

      pdf.addImage(imgData, 'PNG', 0, 2, imgWidth, imgHeight);
      pdf.save(`Receipt-${orderId}.pdf`);
    } catch (error) {
      console.warn('Canvas PDF export warning, falling back to direct vector PDF:', error);

      // Resilient Vector PDF Fallback
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 150 + items.length * 8 + (customer ? 20 : 0)]
      });

      pdf.setFont('courier', 'bold');
      pdf.setFontSize(14);
      pdf.text(displayName, 40, 10, { align: 'center' });

      pdf.setFontSize(9);
      pdf.setFont('courier', 'normal');
      pdf.text('myob Retail OS', 40, 15, { align: 'center' });
      pdf.text(`Receipt #: ${orderId}`, 5, 22);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 5, 27);
      pdf.text(`Payment: ${paymentMethod.toUpperCase()}`, 5, 32);

      let currentY = 37;
      if (customer) {
        pdf.text(`Customer: ${customer.name}`, 5, currentY);
        currentY += 4;
        pdf.text(`Mobile: ${customer.phone}`, 5, currentY);
        currentY += 4;
        if (customer.gstin) {
          pdf.text(`GSTIN: ${customer.gstin}`, 5, currentY);
          currentY += 4;
        }
      }

      pdf.line(5, currentY, 75, currentY);
      currentY += 5;

      items.forEach((ci) => {
        pdf.setFont('courier', 'bold');
        pdf.text(ci.item.name.substring(0, 22), 5, currentY);
        pdf.text(`Rs. ${ci.total.toFixed(2)}`, 75, currentY, { align: 'right' });
        currentY += 4;
        pdf.setFont('courier', 'normal');
        pdf.text(`${ci.quantity} x Rs. ${ci.unitPrice.toFixed(2)}`, 5, currentY);
        currentY += 5;
      });

      pdf.line(5, currentY, 75, currentY);
      currentY += 5;
      pdf.text(`Subtotal:`, 5, currentY);
      pdf.text(`Rs. ${subtotal.toFixed(2)}`, 75, currentY, { align: 'right' });
      currentY += 4;
      if (discountTotal > 0) {
        pdf.text(`Savings:`, 5, currentY);
        pdf.text(`-Rs. ${discountTotal.toFixed(2)}`, 75, currentY, { align: 'right' });
        currentY += 4;
      }
      pdf.text(`GST (5%):`, 5, currentY);
      pdf.text(`Rs. ${tax.toFixed(2)}`, 75, currentY, { align: 'right' });
      currentY += 6;

      pdf.setFont('courier', 'bold');
      pdf.setFontSize(11);
      pdf.text(`TOTAL: Rs. ${total.toFixed(2)}`, 5, currentY);
      currentY += 10;

      pdf.setFontSize(8);
      pdf.setFont('courier', 'normal');
      pdf.text(`* ${orderId} *`, 40, currentY, { align: 'center' });
      pdf.text(`Thank you for shopping!`, 40, currentY + 5, { align: 'center' });

      pdf.save(`Receipt-${orderId}.pdf`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 2. High-speed 1-Page Isolated Iframe Printing (Bypasses Parent DOM 500-page freeze)
  const handlePrint = () => {
    if (!receiptRef.current) return;

    const receiptHtml = receiptRef.current.outerHTML;

    // Create an isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${orderId}</title>
          <style>
            @page {
              margin: 0;
              size: 80mm auto;
            }
            body {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              margin: 0;
              padding: 6mm;
              color: #000000;
              background: #ffffff;
              width: 80mm;
              box-sizing: border-box;
            }
            .no-print { display: none !important; }
            * { box-sizing: border-box; }
            /* Tailwind helper classes inlined for standalone iframe */
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .border-b { border-bottom: 1px dashed #94a3b8; }
            .border-t { border-top: 1px dashed #94a3b8; }
            .border-t-2 { border-top: 2px solid #000000; }
            .py-1 { padding-top: 2px; padding-bottom: 2px; }
            .py-2 { padding-top: 6px; padding-bottom: 6px; }
            .pb-2 { padding-bottom: 6px; }
            .pt-2 { padding-top: 6px; }
            .mt-1 { margin-top: 4px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-2 > * + * { margin-top: 6px; }
            .text-xs { font-size: 11px; }
            .text-sm { font-size: 13px; }
            .text-base { font-size: 14px; }
            .text-lg { font-size: 16px; }
            .line-through { text-decoration: line-through; color: #64748b; }
            svg { display: block; margin: 0 auto; }
          </style>
        </head>
        <body>
          ${receiptHtml}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    // Clean up temporary iframe after print dialog opens
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  };

  const handleShareWhatsApp = () => {
    const itemLines = items.map((ci) => `• ${ci.item.name} (${ci.quantity} ${ci.item.unit}) - ₹${ci.total}`).join('\n');
    const message = `🧾 *${displayName}* - Receipt #${orderId}\n\n📅 Date: ${new Date().toLocaleDateString()}\n💳 Payment: ${paymentMethod}\n\n*Items Purchased:*\n${itemLines}\n\nSubtotal: ₹${subtotal}\n${discountTotal > 0 ? `💰 Clearance Savings: -₹${discountTotal}\n` : ''}GST (5%): ₹${tax}\n*TOTAL PAID: ₹${total}*\n\nThank you for shopping with us!`;
    
    const phone = customer?.phone ? customer.phone.replace(/\D/g, '') : '';
    const url = phone 
      ? `https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-700 bg-white text-slate-900 shadow-2xl z-10 font-mono"
        >
          {/* Top Receipt header (Pinned) */}
          <div className="bg-zinc-900 px-5 py-3 text-center text-white font-sans border-b border-zinc-800 shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Tax Invoice / Receipt
              </span>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-black tracking-tight uppercase text-white">{displayName}</h2>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
              Mind Your Own Business (myob)
            </p>
          </div>

          {/* Printable & Downloadable Receipt Container (Scrollable Middle Section) */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-white">
            <div ref={receiptRef} className="bg-white text-slate-900 p-5 text-xs space-y-3 font-mono">
              {/* Order Meta info */}
              <div className="border-b border-dashed border-slate-300 pb-2.5 space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>RECEIPT NO:</span>
                  <span className="font-bold text-slate-900">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE & TIME:</span>
                  <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT MODE:</span>
                  <span className="font-bold uppercase text-slate-900">{paymentMethod}</span>
                </div>
              </div>

              {/* Customer Profile if attached */}
              {customer && (
                <div className="border-b border-dashed border-slate-300 pb-2.5 space-y-1 text-[11px] bg-slate-50 p-2 rounded">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <User className="h-3 w-3 text-slate-500" />
                    <span>CUSTOMER: {customer.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>PHONE: {customer.phone}</span>
                    {customer.totalSpent > 5000 && (
                      <span className="font-bold text-emerald-700">★ VIP</span>
                    )}
                  </div>
                  {customer.gstin && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      GSTIN: {customer.gstin}
                    </div>
                  )}
                </div>
              )}

              {/* Itemized product breakdown */}
              <div className="space-y-2 py-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1">
                  <span>Item</span>
                  <span>Qty × Price = Total</span>
                </div>

                {items.map((ci, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px] leading-tight">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-900">{ci.item.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {ci.quantity} {ci.item.unit} @ {formatINR(ci.unitPrice)}
                        {ci.appliedDiscountPercentage > 0 && (
                          <span className="text-amber-600 font-semibold ml-1">
                            ({ci.appliedDiscountPercentage}% OFF)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-900">
                      {formatINR(ci.total)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Clearance Markdown Savings:</span>
                    <span>-{formatINR(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST (5% Included):</span>
                  <span>{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-950 border-t-2 border-slate-900 pt-1.5 mt-1.5">
                  <span>TOTAL PAID:</span>
                  <span className="text-base">{formatINR(total)}</span>
                </div>
              </div>

              {/* Barcode & Footer */}
              <div className="text-center pt-1 space-y-1.5 border-t border-dashed border-slate-300">
                <BarcodeSvg value={orderId} />
                <p className="text-[10px] text-slate-600 font-sans">
                  {customer ? `Thank you for your visit, ${customer.name.split(' ')[0]}!` : `Thank you for shopping at ${displayName}!`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons (Download PDF, Print, WhatsApp) (Pinned Bottom) */}
          <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-col gap-2 font-sans shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Share on WhatsApp</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
