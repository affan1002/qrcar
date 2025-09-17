const QRCode = require('qrcode');

async function generateCarQR(carId, plateNumber) {
    try {
        // This is the smart part - it detects if we're on Vercel or localhost
        // When deployed, VERCEL_URL will be your real website address
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        // The QR code will contain your real website URL plus the car ID
        const qrData = `${baseUrl}?car=${carId}`;

        // Generate the actual QR code image
        const qrBase64 = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return {
            qrBase64,
            qrData,
            downloadUrl: `/api/download/qr-${plateNumber}-${Date.now()}.png`
        };
    } catch (error) {
        throw new Error('Failed to generate QR code');
    }
}

module.exports = { generateCarQR };