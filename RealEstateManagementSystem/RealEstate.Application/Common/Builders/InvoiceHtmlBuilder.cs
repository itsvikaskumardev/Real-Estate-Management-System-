using RealEstate.Application.Buyer.Queries;
using System;

namespace RealEstate.Application.Common.Builders
{
    public static class InvoiceHtmlBuilder
    {
        public static string Build(InvoiceDetailsDto dto)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Invoice - {dto.TransactionId}</title>
    <script src=""https://cdn.tailwindcss.com""></script>
    <style>
        @media print {{
            @page {{ margin: 0; }}
            body {{ margin: 1.6cm; }}
            .no-print {{ display: none !important; }}
        }}
    </style>
</head>
<body class=""bg-gray-50 text-gray-800 font-sans"">
    <div class=""max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-sm rounded-md my-10"">
        
        <!-- Header -->
        <div class=""flex justify-between items-start border-b pb-8"">
            <div>
                <h1 class=""text-4xl font-bold text-teal-700"">INVOICE</h1>
                <p class=""text-gray-500 mt-2"">Transaction ID: {dto.TransactionId}</p>
                <p class=""text-gray-500"">Date: {dto.PurchaseDate.ToString("MMMM dd, yyyy")}</p>
            </div>
            <div class=""text-right"">
                <div class=""flex justify-end items-center gap-2 mb-2"">
                    <div class=""bg-teal-600 p-2 rounded-md"">
                        <svg stroke=""currentColor"" fill=""none"" stroke-width=""2"" viewBox=""0 0 24 24"" stroke-linecap=""round"" stroke-linejoin=""round"" height=""24"" width=""24"" xmlns=""http://www.w3.org/2000/svg"" style=""color: white;"">
                            <path d=""M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z""></path>
                        </svg>
                    </div>
                    <div class=""text-3xl font-bold text-gray-800 tracking-tight"">RealEstate</div>
                </div>
                <p class=""text-gray-500 font-medium"">123 Real Estate Ave</p>
                <p class=""text-gray-500"">Business City, NY 10001</p>
                <p class=""text-teal-600"">support@realestate.com</p>
            </div>
        </div>

        <!-- Billing Info -->
        <div class=""flex justify-between items-start mt-8"">
            <div>
                <h2 class=""text-sm font-semibold text-gray-400 uppercase tracking-wider"">Billed To</h2>
                <div class=""mt-2"">
                    <p class=""text-lg font-semibold text-gray-800"">{dto.BuyerName}</p>
                    <p class=""text-gray-600"">{dto.BuyerEmail}</p>
                </div>
            </div>
            <div class=""text-right"">
                <h2 class=""text-sm font-semibold text-gray-400 uppercase tracking-wider"">Property Seller</h2>
                <div class=""mt-2"">
                    <p class=""text-lg font-semibold text-gray-800"">{dto.SellerName}</p>
                    <p class=""text-gray-600"">{dto.SellerEmail}</p>
                </div>
            </div>
        </div>

        <!-- Property Details -->
        <div class=""mt-12"">
            <h2 class=""text-xl font-semibold text-gray-800 border-b pb-2"">Purchase Details</h2>
            <div class=""mt-4 flex flex-col gap-2"">
                <div class=""flex justify-between"">
                    <span class=""text-gray-600"">Property Title:</span>
                    <span class=""font-medium"">{dto.PropertyTitle}</span>
                </div>
                <div class=""flex justify-between"">
                    <span class=""text-gray-600"">City:</span>
                    <span class=""font-medium"">{dto.PropertyCity}</span>
                </div>
                <div class=""flex justify-between"">
                    <span class=""text-gray-600"">Property Type:</span>
                    <span class=""font-medium"">{dto.PropertyType}</span>
                </div>
                <div class=""flex justify-between"">
                    <span class=""text-gray-600"">Status:</span>
                    <span class=""font-medium text-teal-600"">{dto.Status}</span>
                </div>
            </div>
        </div>

        <!-- Financial Summary -->
        <div class=""mt-12"">
            <table class=""w-full text-left"">
                <thead>
                    <tr class=""border-b-2 border-gray-200"">
                        <th class=""pb-3 font-semibold text-gray-600"">Description</th>
                        <th class=""pb-3 text-right font-semibold text-gray-600"">Amount</th>
                    </tr>
                </thead>
                <tbody class=""divide-y divide-gray-100"">
                    <tr>
                        <td class=""py-4"">
                            <div class=""font-medium text-gray-800"">Property Base Price</div>
                            <div class=""text-sm text-gray-500"">Agreed purchase price</div>
                        </td>
                        <td class=""py-4 text-right font-medium"">₹{dto.Price.ToString("N2")}</td>
                    </tr>
                    <tr>
                        <td class=""py-4"">
                            <div class=""font-medium text-gray-800"">Platform Commission (Included)</div>
                            <div class=""text-sm text-gray-500"">2% admin processing fee</div>
                        </td>
                        <td class=""py-4 text-right text-gray-500"">(₹{dto.AdminCommission.ToString("N2")})</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class=""border-t-2 border-gray-200"">
                        <td class=""pt-6 text-right font-semibold text-gray-600"">Total Paid</td>
                        <td class=""pt-6 text-right text-2xl font-bold text-teal-700"">₹{dto.Price.ToString("N2")}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Footer -->
        <div class=""mt-20 pt-8 border-t text-center text-sm text-gray-500"">
            <p>Thank you for choosing RealEstate Platform!</p>
            <p class=""mt-1"">This is a system generated invoice and does not require a physical signature.</p>
        </div>

        <!-- Action Button -->
        <div class=""mt-10 text-center no-print"">
            <button onclick=""window.print()"" class=""bg-teal-600 text-white px-6 py-2 rounded shadow hover:bg-teal-700 transition"">
                Print / Save as PDF
            </button>
        </div>

    </div>
    <script>
        window.onload = function() {{
            window.print();
        }};
    </script>
</body>
</html>";
        }
    }
}
