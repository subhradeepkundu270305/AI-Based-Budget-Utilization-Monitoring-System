const axios = require("axios");
const Department = require("../models/Department");
const Budget = require("../models/Budget");
const Expenditure = require("../models/Expenditure");
const Alert = require("../models/Alert");
const User = require("../models/User");

const chatController = {
  async ask(req, res, next) {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: "Message is required." });

      const apiKey = process.env.GEMINI_API_KEY;
      
      const [deptCount, userCount, budgetCount, alertCount] = await Promise.all([
        Department.countDocuments(),
        User.countDocuments(),
        Budget.countDocuments(),
        Alert.countDocuments({ resolved: false })
      ]);
      
      const budgets = await Budget.find().populate('department');
      const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
      
      const expenditures = await Expenditure.find();
      const totalSpent = expenditures.reduce((acc, e) => acc + e.amountSpent, 0);
      
      const contextStr = `
        System Context: You are an AI Budget Monitoring Assistant for a government budget utilization system.
        Current Database Stats:
        - Departments: ${deptCount}
        - Total Budgets/Schemes: ${budgetCount}
        - Unresolved Alerts (Anomalies): ${alertCount}
        - Total Allocated Funds: ₹${totalAllocated.toLocaleString('en-IN')}
        - Total Spent Funds: ₹${totalSpent.toLocaleString('en-IN')}
        - Utilization Percentage: ${totalAllocated ? ((totalSpent / totalAllocated) * 100).toFixed(2) : 0}%
        
        The user (an official) says: "${message}"
        
        Respond clearly, professionally, and concisely using the context provided. If they ask about stats, provide them. Keep it short.
      `;

      if (!apiKey) {
        return res.json({ 
          reply: "I am currently running in offline mode because the GEMINI_API_KEY is not configured in the backend environment. Here are the stats I know: " +
                 `Total Allocated: ₹${totalAllocated.toLocaleString('en-IN')}, Total Spent: ₹${totalSpent.toLocaleString('en-IN')}.`
        });
      }

      try {
        const url = `https://openrouter.ai/api/v1/chat/completions`;
        let response;
        let retries = 3;
        
        while (retries > 0) {
          try {
            response = await axios.post(url, {
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: contextStr },
                { role: "user", content: message }
              ],
              max_tokens: 1000
            }, {
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              }
            });
            break; // Success
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            await new Promise(res => setTimeout(res, 2000)); // wait 2s before retry
          }
        }
        
        const replyText = response.data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
        return res.json({ reply: replyText });
      } catch (geminiError) {
        console.error("Gemini Error:", geminiError.message || geminiError);
        if (geminiError.response) {
          console.error("Gemini Error Data:", JSON.stringify(geminiError.response.data));
        }
        return res.json({ 
          reply: "I am having trouble connecting to the AI service. Here are the current stats: " +
                 `Total Allocated: ₹${totalAllocated.toLocaleString('en-IN')}, Total Spent: ₹${totalSpent.toLocaleString('en-IN')}.`
        });
      }
      
    } catch (err) {
      next(err);
    }
  }
};

module.exports = chatController;
