'use client';

import { useState, useEffect } from 'react';
import { toCanvas as QRCodeToCanvas } from 'qrcode';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export  function OrdersUploadContent() {
  const [courierName, setCourierName] = useState<string>('Steven Courier');
  const [trackingNumber, setTrackingNumber] = useState<string>('51684EDN');
  const [address, setAddress] = useState<string>('Grey Lang, Unit 3, Charles Street, West Bromwich B70 0AZ');
  const [weight, setWeight] = useState<string>('33 KG');
  const [reference, setReference] = useState<string>('EU-DR4121');
  const [instructions, setInstructions] = useState<string>('Handle with care');

  useEffect(() => {
    handleGenerateLabel();
  }, [trackingNumber]);

  const generateBarcode = (canvasId: string, data: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      JsBarcode(canvas, data, {
        format: 'CODE128',
        displayValue: true,
      });
    }
  };

  const generateQRCode = (canvasId: string, data: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      QRCodeToCanvas(canvas, data, (error) => {
        if (error) console.error(error);
      });
    }
  };

  const handleGenerateLabel = () => {
    generateBarcode('barcodeCanvas', trackingNumber);
    generateQRCode('qrcodeCanvas', trackingNumber);
  };

  const handleDownloadLabel = () => {
    const labelElement = document.getElementById('label');
    if (labelElement) {
      html2canvas(labelElement).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'shipping-label.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const handlePrintLabel = () => {
    const labelElement = document.getElementById('label');
    if (labelElement) {
      html2canvas(labelElement).then((canvas) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write('<img src="' + canvas.toDataURL('image/png') + '" />');
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shipping Label Generator</h1>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="courierName">Courier Name:</label>
          <Input
            id="courierName"
            type="text"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="ml-2 p-2 text-lg"
          />
        </div>
        <div>
          <label htmlFor="trackingNumber">Tracking Number:</label>
          <Input
            id="trackingNumber"
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="ml-2 p-2 text-lg"
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="ml-2 p-2 text-lg"
          />
        </div>
        <div>
          <label htmlFor="weight">Weight:</label>
          <Input
            id="weight"
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="ml-2 p-2 text-lg"
          />
        </div>
        <div>
          <label htmlFor="reference">Reference:</label>
          <Input
            id="reference"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="ml-2 p-2 text-lg"
          />
        </div>
        <div>
          <label htmlFor="instructions">Instructions:</label>
          <Input
            id="instructions"
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="ml-2 p-2 text-lg"
          />
        </div>
        <Button onClick={handleGenerateLabel}>Generate Label</Button>
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Generated Label</h2>
        <div id="label" className="p-4 border rounded-lg bg-white" style={{ width: '300px', height: '600px' }}>
          
          <div className="text-center mb-4">
            <p className="text-lg font-bold">{courierName}</p>
            <p className="text-sm">Exclusive Delivery Network</p>
            <p className="text-sm">Next Day</p>
          </div>
          <p><strong>Tracking Number:</strong> {trackingNumber}</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Weight:</strong> {weight}</p>
          <p><strong>Reference:</strong> {reference}</p>
          <p><strong>Instructions:</strong> {instructions}</p>
          <canvas id="barcodeCanvas" className="my-2"></canvas>
          <canvas id="qrcodeCanvas" className="my-2"></canvas>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleDownloadLabel}>Download Label</Button>
          <Button onClick={handlePrintLabel}>Print Label</Button>
        </div>
      </div>
    </div>
  );
}