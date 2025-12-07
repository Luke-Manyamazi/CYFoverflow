// api/emails/templates/answerNotificationTemplate.js
export const getAnswerNotificationHtml = ({
	questionAuthorName,
	questionTitle,
	answererName,
	answerContent,
	questionUrl,
}) => {
	return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6; 
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white;
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 40px 20px;
                    text-align: center; 
                }
                .content { 
                    padding: 40px 30px;
                }
                .btn { 
                    display: inline-block; 
                    padding: 14px 32px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 25px 0;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }
                .answer-box { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    border-left: 4px solid #667eea; 
                    margin: 30px 0; 
                    border-radius: 8px;
                }
                .footer { 
                    margin-top: 40px; 
                    color: #666; 
                    font-size: 14px;
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }
                h1 { margin: 0 0 10px 0; font-size: 28px; }
                h2 { color: #333; margin-top: 0; }
                p { margin: 15px 0; }
                .highlight { color: #667eea; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📬 New Answer on CYFoverflow</h1>
                    <p>Someone answered your question!</p>
                </div>
                <div class="content">
                    <h2>Hello ${questionAuthorName || "there"}!</h2>
                    
                    <p><span class="highlight">Your Question:</span><br>${questionTitle}</p>
                    
                    <div class="answer-box">
                        <p><span class="highlight">👤 Answered by ${answererName || "A fellow learner"}:</span></p>
                        <p>${answerContent}</p>
                    </div>
                    
                    <p style="text-align: center;">
                        <a href="${questionUrl}" class="btn">View Full Answer & Respond</a>
                    </p>
                    
                    <p>Click the button above to view the complete answer and continue the discussion with the community.</p>
                    
                    <div class="footer">
                        <p>This email was sent by <span class="highlight">CYFoverflow</span> at cyf.academy.</p>
                        <p>You're receiving this because someone answered your question.</p>
                        <p style="font-size: 12px; color: #888;">
                            Sent at: ${new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const getAnswerNotificationText = ({
	questionTitle,
	answererName,
	answerContent,
	questionUrl,
}) => {
	return `NEW ANSWER ON CYFOVERFLOW

Hello!

Your question "${questionTitle}" has received a new answer.

Answer by ${answererName || "A fellow learner"}:
${answerContent}

View the full answer and reply:
${questionUrl}

---
This email was sent by CYFoverflow at cyf.academy.
You're receiving this because someone answered your question.

Sent at: ${new Date().toLocaleString()}`;
};
