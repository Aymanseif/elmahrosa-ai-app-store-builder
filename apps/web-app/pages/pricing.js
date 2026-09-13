export default function Pricing() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Free Tier */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Free</h2>
          <p className="text-gray-600 mb-4">$0/month</p>
          <ul className="space-y-2 mb-6 text-left text-sm">
            <li>1 app</li>
            <li>Watermark</li>
            <li>Manual export</li>
            <li>3 builds/month</li>
            <li>No publishing</li>
          </ul>
          <a href="https://dodo.pe/pkal21u3gd" target="_blank" rel="noopener noreferrer" className="w-full inline-block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Start Free Plan
          </a>
        </div>
        {/* Pro Tier */}
        <div className="border p-6 rounded-lg bg-blue-50">
          <h2 className="text-xl font-bold mb-4">Pro</h2>
          <p className="text-gray-600 mb-4">$29/month</p>
          <ul className="space-y-2 mb-6 text-left text-sm">
            <li>5 apps</li>
            <li>No watermark</li>
            <li>One-click publishing</li>
            <li>30 builds/month</li>
            <li>10 publishing actions</li>
            <li>Stripe/Fawry/Paymob/Dodo</li>
          </ul>
          <a href="https://dodo.pe/8xgua9wiwkx" target="_blank" rel="noopener noreferrer" className="w-full inline-block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Choose Pro Plan
          </a>
        </div>
        {/* Enterprise Tier */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Enterprise</h2>
          <p className="text-gray-600 mb-4">$199/month</p>
          <ul className="space-y-2 mb-6 text-left text-sm">
            <li>Unlimited apps</li>
            <li>White-label</li>
            <li>API access</li>
            <li>Team support</li>
            <li>Custom limits</li>
          </ul>
          <a href="https://dodo.pe/proteos" target="_blank" rel="noopener noreferrer" className="w-full inline-block text-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
            Choose Enterprise Plan
          </a>
        </div>
      </div>
    </div>
  )
}
