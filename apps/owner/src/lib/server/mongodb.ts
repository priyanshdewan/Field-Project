import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var mongoClient: MongoClient | undefined;
}

let client: MongoClient | null = null;
let isConnected = false;

export async function connectMongoDB(): Promise<MongoClient | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("placeholder") || uri.includes("YOUR-")) {
    return null;
  }

  if (globalThis.mongoClient) {
    return globalThis.mongoClient;
  }

  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    await client.connect();
    globalThis.mongoClient = client;
    isConnected = true;
    console.log("Successfully connected to MongoDB.");
    return client;
  } catch (error) {
    console.warn("Failed to connect to MongoDB, running in fallback mode:", error);
    client = null;
    isConnected = false;
    return null;
  }
}

/**
 * Log AI Interaction to MongoDB
 */
export async function logAiInteraction(data: {
  workspaceId: string;
  userId: string;
  query: string;
  intent: string;
  response: any;
  timestamp?: Date;
}) {
  const mongo = await connectMongoDB();
  const interaction = {
    ...data,
    timestamp: data.timestamp || new Date(),
  };

  if (mongo && isConnected) {
    try {
      const db = mongo.db("bizora");
      const collection = db.collection("ai_logs");
      await collection.insertOne(interaction);
      console.log("[MongoDB] Logged AI Interaction successfully.");
    } catch (e) {
      console.error("[MongoDB] Failed to log AI interaction:", e);
    }
  } else {
    console.log("[Mock MongoDB Log] AI Interaction:", JSON.stringify(interaction, null, 2));
  }
}

/**
 * Log WhatsApp Audit log to MongoDB
 */
export async function logWhatsAppAudit(data: {
  workspaceId: string;
  phoneNumber: string;
  direction: "incoming" | "outgoing";
  messageText: string;
  status: string;
  timestamp?: Date;
}) {
  const mongo = await connectMongoDB();
  const logEntry = {
    ...data,
    timestamp: data.timestamp || new Date(),
  };

  if (mongo && isConnected) {
    try {
      const db = mongo.db("bizora");
      const collection = db.collection("whatsapp_logs");
      await collection.insertOne(logEntry);
      console.log("[MongoDB] Logged WhatsApp audit log successfully.");
    } catch (e) {
      console.error("[MongoDB] Failed to log WhatsApp audit log:", e);
    }
  } else {
    console.log("[Mock MongoDB Log] WhatsApp Audit:", JSON.stringify(logEntry, null, 2));
  }
}
