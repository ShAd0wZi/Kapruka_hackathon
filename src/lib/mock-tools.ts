import { tool } from "ai";
import { z } from "zod";

export const getMockKaprukaTools = () => {
  return {
    kapruka_search_products: tool({
      description: "Search the Kapruka catalog for products",
      parameters: z.object({
        query: z.string().describe("The search query"),
        category: z.string().optional().describe("Optional category filter"),
      }),
      execute: async ({ query, category }) => {
        // Return some dummy Kapruka products for the demo
        console.log(`Searching Kapruka for: ${query}`);
        
        const mockProducts = [
          {
            id: "p1",
            name: "Kapruka Ribbon Cake (1.3kg)",
            price: 3200,
            image: "https://www.kapruka.com/cdn-cgi/image/width=600,quality=95,format=auto/shops/specialGifts/productImages/1594967394332_Kapruka-Ribbon-Cake-1.3kg.jpg",
            category: "cakes",
            inStock: true,
            url: "https://www.kapruka.com/buyonline/kapruka-ribbon-cake-1.3kg/kid/cakes0001",
          },
          {
            id: "p2",
            name: "Fresh Red Roses Bouquet",
            price: 4500,
            image: "https://www.kapruka.com/cdn-cgi/image/width=600,quality=95,format=auto/shops/specialGifts/productImages/1310103738018_roses.jpg",
            category: "flowers",
            inStock: true,
            url: "https://www.kapruka.com/buyonline/fresh-red-roses-bouquet/kid/flowers0001",
          },
          {
            id: "p3",
            name: "Munchee Super Cream Cracker 400g",
            price: 450,
            image: "https://www.kapruka.com/cdn-cgi/image/width=600,quality=95,format=auto/shops/specialGifts/productImages/1628151523425_Munchee-Super-Cream-Cracker-400g.jpg",
            category: "groceries",
            inStock: true,
            url: "https://www.kapruka.com/buyonline/munchee-super-cream-cracker-400g/kid/groceries0001",
          },
          {
            id: "p4",
            name: "Sony PlayStation 5 Console",
            price: 195000,
            image: "https://www.kapruka.com/cdn-cgi/image/width=600,quality=95,format=auto/shops/specialGifts/productImages/1675239922923_PS5-Standard-Edition.jpg",
            category: "electronics",
            inStock: false,
            url: "https://www.kapruka.com/buyonline/sony-playstation-5/kid/elec0001",
          }
        ];

        // Filter based on query loosely
        const results = mockProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          p.category.toLowerCase().includes(query.toLowerCase())
        );

        return {
          results: results.length > 0 ? results : mockProducts.slice(0, 2), // Return at least some for demo
          totalFound: results.length > 0 ? results.length : 2
        };
      },
    }),

    kapruka_get_delivery_quote: tool({
      description: "Get a delivery fee estimate based on city",
      parameters: z.object({
        city: z.string().describe("The city name in Sri Lanka"),
      }),
      execute: async ({ city }) => {
        console.log(`Getting delivery quote for: ${city}`);
        const fee = city.toLowerCase() === "colombo" ? 300 : 800;
        return {
          city,
          estimatedFee: fee,
          currency: "LKR",
          deliveryTime: city.toLowerCase() === "colombo" ? "Same Day" : "1-3 Business Days"
        };
      },
    }),

    kapruka_create_order: tool({
      description: "Create an order checkout link",
      parameters: z.object({
        items: z.array(z.object({
          id: z.string(),
          quantity: z.number()
        })).describe("List of product IDs and quantities")
      }),
      execute: async ({ items }) => {
        console.log(`Creating order link for items:`, items);
        return {
          success: true,
          orderId: `KAP-${Math.floor(Math.random() * 100000)}`,
          paymentLink: "https://www.kapruka.com/checkout/demo-payment-link",
          message: "Payment link valid for 60 minutes"
        };
      },
    }),
  };
};
