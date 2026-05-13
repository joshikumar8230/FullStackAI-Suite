import express from "express";
import cors from "cors";
import OpenAI from "openai";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: "*", 
  methods: ["GET","POST","PUT","DELETE","OPTIONS"]
}));

// Initialize Groq client 
const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://api.groq.com/openai/v1"
});
const JWT_SECRET = "OpenAi";

/* -----------------------------
JWT Authentication Middleware
----------------------------- */

function authenticate(req,res,next){

  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith("Bearer ")){

    return res.status(401).json({
      message:"No token provided"
    });

  }

  try{

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token,JWT_SECRET);

    req.user = decoded;

    next();

  }
  catch(err){

    return res.status(401).json({
      message:"Invalid token"
    });

  }

}

/* -----------------------------
MongoDB Connection
----------------------------- */

mongoose.connect(
"mongodb+srv://joshikumar_db_user:Jackfrost23.@openai.9p83gp6.mongodb.net/eco_ai"
)
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log(err));

/* -----------------------------
User Schema
----------------------------- */

const userSchema = new mongoose.Schema({

  username:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  }

});

const User = mongoose.model("User", userSchema);

/* -----------------------------
Category Schema
----------------------------- */

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const categorySchemas = mongoose.model("Category", categorySchema);

/* -----------------------------
sustainabilityFilterSchema
----------------------------- */

const sustainabilityFilterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const sustainabilityFilterSchemas = mongoose.model("SustainabilityFilter", sustainabilityFilterSchema);

/* -----------------------------
Product Schema
----------------------------- */

const productSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  product_name: {
    type: String,
    required: true
  },

  primary_category: {
    type: String,
    required: true
  },

  sub_category: {
    type: String
  },

  seo_tags: [
    {
      type: String
    }
  ],

  sustainability_filters: [
    {
      type: String
    }
  ]

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

/* -----------------------------
Signup API
----------------------------- */

app.post("/signup", async (req,res)=>{

  try{

    const {username,password} = req.body;

    if(!username || !password){
      return res.status(400).json({
        message:"Username and password required"
      });
    }

    const existingUser = await User.findOne({username});

    if(existingUser){
      return res.status(400).json({
        message:"User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = new User({
      username,
      password:hashedPassword
    });

    await newUser.save();

    res.json({
      message:"Signup successful"
    });

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      message:"Signup failed"
    });

  }

});

/* -----------------------------
Login API
----------------------------- */

app.post("/login", async (req,res)=>{

  try{

    const {username,password} = req.body;

    const user = await User.findOne({username});

    if(!user){
      return res.status(400).json({
        message:"User not found"
      });
    }

    const match = await bcrypt.compare(password,user.password);

    if(!match){
      return res.status(400).json({
        message:"Invalid password"
      });
    }

    const token = jwt.sign(
      {
        userId:user._id,
        username:user.username
      },
      JWT_SECRET,
      { expiresIn:"1h" }
    );

    res.json({
      message:"Login successful",
      token,
      user:{
        id:user._id,
        username:user.username
      }
    });

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      message:"Login failed"
    });

  }

});


app.post("/auto-category", authenticate, async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product description is required"
      });
    }
    const categories = await categorySchemas.find({});
    const filters = await sustainabilityFilterSchemas.find({});

    const PRIMARY_CATEGORIES = categories.map(c => c.name);
    const SUSTAINABILITY_FILTERS = filters.map(f => f.name);

    const prompt = `
You are an AI assistant specialized ONLY in product auto-categorization and product metadata generation for a sustainability-focused product catalog.

Your task is to analyze a PRODUCT DESCRIPTION and generate structured catalog metadata.

PRIMARY CATEGORY LIST:
${PRIMARY_CATEGORIES.join(", ")}

SUSTAINABILITY FILTER LIST:
${SUSTAINABILITY_FILTERS.join(", ")}

Instructions:

1. Generate a short and clear product_name based on the description.
2. Select ONE primary_category from the primary category list above.
3. Suggest an appropriate sub_category related to the product.
4. Generate 5 to 10 SEO tags describing the product.
5. Select relevant sustainability_filters ONLY from the sustainability filter list above.
6. If the input is NOT a product description, return an error message explaining what a valid input should look like.

Product description:
"${description}"

Return JSON ONLY in this format:

{
  "product_name": "...",
  "primary_category": "...",
  "sub_category": "...",
  "seo_tags": ["...", "...", "..."],
  "sustainability_filters": ["...", "..."]
}

If the input is NOT a product description, return:

{
  "error": "Invalid input. This AI assistant only performs product auto-categorization. Please provide a product description such as: 'Reusable bamboo coffee cup with silicone lid and plastic-free packaging' or 'Organic cotton tote bag made from recycled fabric for grocery shopping.'"
}

Do not include explanations, comments, or extra text.
Return JSON only.
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a strict API that returns JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const aiOutput = response.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(aiOutput);
    } catch (e) {
      parsed = {
        error: "AI returned invalid JSON",
        raw_output: aiOutput
      };
    }

    res.json({
      success: true,
      result: parsed
    });

  } catch (error) {
    console.error("FULL ERROR OBJECT:", error);

    res.status(500).json({
      success: false,
      message: error?.message || "Unknown error",
      type: error?.type,
      code: error?.code,
      status: error?.status
    });
  }
});

app.post("/auto-category/save", authenticate, async (req, res) => {

  try {

    const {
      product_name,
      primary_category,
      sub_category,
      seo_tags,
      sustainability_filters
    } = req.body;

    const newProduct = new Product({
      userId: req.user.userId,   
      product_name,
      primary_category,
      sub_category,
      seo_tags,
      sustainability_filters
    });

    await newProduct.save();

    res.json({
      success: true,
      message: "Product saved successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to save product"
    });

  }

});

app.get("/auto-category/products", authenticate, async (req, res) => {

  try {

    const products = await Product.find({
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });

  }

});

app.post("/b2b-proposal", authenticate, async (req, res) => {
  try {

    const { request } = req.body;
    
    if (!request || request.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Proposal request is required"
      });
    }

        const products = await Product.find(
      {},
      {
        _id: 0,
        product_name: 1,
        primary_category: 1,
        sustainability_filters: 1
      }
    );

    const PRODUCT_CATALOG = products;
const prompt = `
You are an AI assistant that generates B2B sustainability merchandise proposals for corporate events.

AVAILABLE PRODUCT CATALOG:
${JSON.stringify(PRODUCT_CATALOG, null, 2)}

Each catalog item contains:
- product_name
- primary_category
- sustainability_filters

First, understand what the PRODUCT_CATALOG contains and use ONLY these products when creating a proposal.

Your task is to analyze the user's request and generate a sustainable corporate merchandise proposal.

Instructions:

1. Build product_mix using ONLY products from the PRODUCT_CATALOG.
2. Do NOT invent products not listed in the catalog.
3. Select products whose sustainability_filters align with the user's sustainability request.
4. Determine quantities based on the number of attendees.

Quantity Rules:
- For attendee merchandise, quantity should usually equal the attendee count.
- Reduce quantities only for premium or optional items.

Budget Rules:
- Total estimated spend must NOT exceed the budget.
- Target spending between 85% and 100% of the total budget.
- Avoid leaving a large unused budget.

Product Mix Rules:
- Include 4–8 different products when possible.
- Prefer creating a conference merchandise bundle that attendees receive.

Data Rules:
- Use primary_category as "category".
- Copy sustainability_filters exactly from the catalog.

Return JSON ONLY in this format:

{
  "product_mix": [
    {
      "product_name": "...",
      "category": "...",
      "sustainability_filters": ["...", "..."],
      "quantity": number,
      "unit_price": number,
      "total_cost": number
    }
  ],
  "budget_summary": {
    "total_budget": number,
    "estimated_spend": number,
    "remaining_budget": number
  },
  "impact_summary": "Short sustainability positioning statement explaining how the selected products support sustainability goals."
}

User request:
"${request}"

IMPORTANT RULES:
- If the user's description IS related to a B2B sustainability merchandise proposal, the response must be valid JSON.
- Do not include explanations outside the JSON.
- The first character must be { and the last must be }.

- If the user's description is NOT related to a B2B sustainability merchandise proposal,
  do NOT return JSON. Instead return this plain text message:

This AI handles only B2B sustainability merchandise proposals. Example request: A technology company is hosting a sustainability conference for 200 attendees with a $5000 budget and wants eco-friendly merchandise for participants.
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a strict API that returns JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const aiOutput = response.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(aiOutput);
    } catch (e) {
      parsed = {
        error: "This AI handles only B2B sustainability merchandise proposals. Example request: A technology company is hosting a sustainability conference for 200 attendees with a total merchandise budget of $5000. They want eco-friendly products such as reusable drinkware, sustainable stationery, and biodegradable materials for participants",
        raw_output: aiOutput
      };
    }

    res.json({
      success: true,
      result: parsed
    });

  } catch (error) {

    console.error("FULL ERROR OBJECT:", error);

    res.status(500).json({
      success: false,
      message: error?.message || "Unknown error"
    });

  }
});

/* -----------------------------
Order Schema
----------------------------- */

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  proposal: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);


/* -----------------------------
Create Order API
----------------------------- */

app.post("/create-order", authenticate, async (req, res) => {
  
  try {

    const { proposal } = req.body;
    if (!proposal) {
      return res.status(400).json({
        success: false,
        message: "Proposal required"
      });
    }

    await Order.create({
      userId: req.user.userId,
      proposal
    });

    res.json({
      success: true,
      message: "Order created successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });

  }
});

/* ----------------------- SESSION MEMORY ----------------------- */

const SESSION = {
  active_order_id: null
};

const CHAT_HISTORY = [];



const SYSTEM_PROMPT = `
You are an AI support classifier for an eco-friendly merchandise company.

Your job is ONLY to classify the user's request.

Possible intents:

greeting
list_orders
order_status
return_policy
cancel_order
refund
irrelevant

Also extract order_id if present.

Return ONLY JSON in this format:

{
 "intent": "",
 "order_id": null
}

Examples:

User: hi
Response:
{ "intent": "greeting", "order_id": null }

User: show my orders
Response:
{ "intent": "list_orders", "order_id": null }

User: check order ECO1001
Response:
{ "intent": "order_status", "order_id": "ECO1001" }

User: cancel it
Response:
{ "intent": "cancel_order", "order_id": null }

User: tell me a joke
Response:
{ "intent": "irrelevant", "order_id": null }
`;

/* ----------------------- SUPPORT ROUTE ----------------------- */

app.post("/support-chat", authenticate, async (req, res) => {

  try {

    const { message } = req.body;

    CHAT_HISTORY.push({
      role: "user",
      content: message
    });

    /* ---------------- FETCH ORDERS FROM DATABASE ---------------- */

    const dbOrders = await Order.find({ userId: req.user.userId });

const ORDERS_DB = dbOrders.map((o) => ({
  order_id: o._id.toString(),
  status: "Processing",
  expected_delivery: "5-7 days",
  products: o.proposal.product_mix.map(p => p.product_name),
  total_budget: o.proposal.budget_summary.total_budget
}));

        /* ---------------- INTENT CLASSIFICATION ---------------- */
        
 const ai = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    ...CHAT_HISTORY
  ]
});

    let data;

    try {
      data = JSON.parse(ai.choices[0].message.content);
    } catch {
      data = { intent: "irrelevant", order_id: null };
    }

    let reply = "";
    let escalate = false;

    if (data.order_id) {
      SESSION.active_order_id = data.order_id;
    }

    const activeOrder = ORDERS_DB.find(
      (o) => o.order_id === SESSION.active_order_id
    );

    /* -------- GREETING -------- */

if (data.intent === "greeting") {

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are a friendly WhatsApp customer support assistant for an eco-friendly merchandise company.

Greet the user naturally and briefly explain you can help with:
- checking orders
- return policies
- cancellations
- refunds

Do not invent order information.
Keep responses short and conversational.
`
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  reply = response.choices[0].message.content;
}

    /* -------- LIST ORDERS -------- */

/* -------- LIST ORDERS -------- */

else if (data.intent === "list_orders") {

  if (ORDERS_DB.length === 0) {

    reply = "You don't have any orders yet.";

  } else {

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a customer support assistant for an eco-friendly merchandise company.

The user wants to see their orders.

Use the structured order data below and present it clearly.

Rules:
- Show order ID
- List the products in the order
- Show the total budget
- Mention the order status
- Do not invent information
- Keep the response friendly and concise
- Each order must be separated by a blank line
- Display products as a bullet list

Use this exact format:

Order ID: <order_id>

Products:
- product 1
- product 2
- product 3

Total Budget: $<total_budget>
Status: <status>

Repeat this structure for each order.
`
        },
        {
          role: "system",
          content: `ORDER_DATA:\n${JSON.stringify(ORDERS_DB, null, 2)}`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    reply = response.choices[0].message.content.replace(/\n/g, "<br>");

  }
}
/* -------- ORDER STATUS -------- */

else if (data.intent === "order_status") {

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are a customer support assistant for an eco-friendly merchandise company.

Below is the list of customer orders.

Orders:
${JSON.stringify(ORDERS_DB, null, 2)}

Instructions:
- If the user mentions an Order ID, find the matching order from the list.
- Show the order details clearly.
- Include Order ID, Products, Total Budget, Status, and Expected Delivery.
- If the order ID is not found, politely tell the user it could not be located.
- If the user asks about order status without giving an order ID, ask them to provide the order ID.
- Do not invent any order information.
- Keep the response friendly and concise.
`
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  reply = response.choices[0].message.content;
}

    /* -------- RETURN POLICY -------- */

else if (data.intent === "return_policy") {

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are a customer support agent for an eco-friendly merchandise company.

Explain return policies clearly and professionally.

Return policy rules:
- Returns allowed within 30 days
- Item must be unused
- Must be in original packaging

Respond conversationally.
`
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  reply = response.choices[0].message.content;
}

    /* -------- CANCEL ORDER -------- */

 else if (data.intent === "cancel_order") {

  if (!activeOrder) {

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a support assistant.

If the user asks to cancel an order but does not specify the order ID,
ask them politely which order they want to cancel.
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    reply = response.choices[0].message.content;

  } else {

    activeOrder.status = "Cancelled";

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a friendly customer support assistant.

An order has been successfully cancelled.

Order ID: ${activeOrder.order_id}

Inform the user that the cancellation was successful.
Be polite and professional.
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    reply = response.choices[0].message.content;

  }
}

    /* -------- REFUND -------- */

else if (data.intent === "refund") {

  escalate = true;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are a support assistant.

If a user asks about refunds, politely explain that the request will be escalated to a human support specialist.

Be empathetic and professional.
`
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  reply = response.choices[0].message.content;
}
    /* -------- IRRELEVANT -------- */

    else {

      reply =
        "I specialize in order support. You can ask about order status, returns, cancellations, or refunds.";

    }

    CHAT_HISTORY.push({
      role: "assistant",
      content: reply
    });

    res.json({
      reply,
      escalate
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "Support bot encountered an error."
    });

  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});