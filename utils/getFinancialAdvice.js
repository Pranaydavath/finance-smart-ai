// utils/getFinancialAdvice.js

const getFinancialAdvice = async (totalBudget, totalIncome, totalSpend) => {
  console.log("Fetching free Gemini advice for:", totalBudget, totalIncome, totalSpend);
  
  try {
    const userPrompt = `
      Based on the following financial data:
      - Total Budget: ${totalBudget} USD 
      - Expenses: ${totalSpend} USD 
      - Incomes: ${totalIncome} USD
      Provide detailed financial advice in 2 sentences to help the user manage their finances more effectively.
    `;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing Gemini API Key in .env.local");
      return "Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.";
    }

    // 🛠️ FIXED: Routing back to v1beta and targeting the active gemini-2.5-flash model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userPrompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini Internal API Error Platform Info:", data.error);
      return "AI configuration error. Please verify your Google project status.";
    }
    
    const advice = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!advice) {
      throw new Error("Empty response string or payload issue from Gemini API channel");
    }

    console.log("Gemini Advice successfully generated:", advice);
    return advice;

  } catch (error) {
    console.error("Error fetching financial advice from Gemini:", error);
    return "Hi! Try adding more budget milestones or logging a new expense category to generate deeper metrics.";
  }
};

export default getFinancialAdvice;