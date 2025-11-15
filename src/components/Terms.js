import React from "react";

export default function Terms() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <main className="min-h-[70vh] bg-white">
      <div className="container mx-auto px-6 lg:px-10 py-12">
        
        {/* Header */}
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-gray-600 text-base">
            These Terms govern your use of VKart, a portfolio demonstration project created for 
            showcasing full-stack e-commerce functionality. No real commercial activity occurs on this site.
          </p>
          <p className="mt-1 text-xs text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <section className="mt-10 max-w-4xl space-y-8 text-gray-800 text-[15px] leading-relaxed">
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">1. Overview</h2>
            <p className="mt-1">
              VKart (“the Site”) is a non-commercial demo project built solely for learning,
              portfolio display, and recruitment purposes. All products, orders, accounts, payments,
              or data interactions shown on this platform are simulated.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">2. Use of the Demo</h2>
            <p className="mt-1">
              You may explore the Site for educational or demonstrative purposes. However:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Do not submit personal, financial, or sensitive information.</li>
              <li>Any entered data may be cleared at any time without notice.</li>
              <li>Do not attempt to hack, exploit, or reverse-engineer the system.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">3. Accounts & Uploaded Content</h2>
            <p className="mt-1">
              Account creation, login flows, and uploaded content are purely illustrative.  
              Uploaded images or text should be non-sensitive and safe for public display.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">4. Payments & Orders (Simulated)</h2>
            <p className="mt-1">
              Checkout, orders, and payments on VKart are <strong>not real</strong>.  
              No transactions are processed, and no charges are made under any circumstances.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">5. Third-Party Services</h2>
            <p className="mt-1">
              Some product data may be fetched from public demo APIs. These external services maintain
              their own Terms and Privacy Policies. VKart does not control their content or guarantees.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">6. Limitation of Liability</h2>
            <p className="mt-1">
              The Site is provided “as-is” for demonstration purposes only. The creator is not liable
              for any loss, damage, or issues arising from your use of this demo platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">7. Changes to These Terms</h2>
            <p className="mt-1">
              These Terms may be updated to reflect improvements or additions to the demo.  
              Any changes become effective once published on this page.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">8. Contact Information</h2>
            <p className="mt-1">
              For questions about this demo project, please use the Contact page.  
              For attribution of open-source assets, refer to the License page.
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}
