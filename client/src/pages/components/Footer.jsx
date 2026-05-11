// client/src/pages/auctionManager/components/Footer.jsx
export default function Footer() {
  return (
    <footer style={{
      background: '#0f172a',
      color: 'white',
      padding: '2rem 0'
    }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-lg font-semibold mb-2">DriveBidRent</p>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} DriveBidRent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}