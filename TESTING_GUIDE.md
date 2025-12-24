# Phase 2 Testing Guide

## Quick Start Testing

### Prerequisites
1. Ensure IntraMind services are running:
   - Vector Service (port 50052)
   - API Gateway (port 5000)
   - Weaviate (port 8080)

2. You should have some documents already ingested for testing

### Start Web UI Backend

```bash
# Navigate to web-ui backend
cd web-ui/backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/Mac:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Test the Widget

**Option 1: Using Demo Page (Recommended)**

1. Serve the demo page:
   ```bash
   cd web-ui/demo-site
   python -m http.server 8080
   ```

2. Open browser to: `http://localhost:8080`

3. You should see:
   - Beautiful demo page with IntraMind branding
   - Chat button in bottom-right corner (purple circle with 💬)

4. Click the chat button:
   - Chat window slides in with animation
   - Welcome message displayed
   - Input field ready

5. Type a question and press Enter:
   - Message appears as "You"
   - Loading indicator with pulsing dots
   - AI response appears as "IntraMind AI"
   - Citations shown below response (if available)
   - Timestamp displayed

**Option 2: Direct Widget Test**

1. Open browser console (F12)

2. Load widget manually:
   ```javascript
   // Load the widget script
   const script = document.createElement('script');
   script.src = 'http://localhost:8001/widget.js';
   script.onload = () => {
     IntraMind.init({
       apiKey: 'demo-api-key',
       collection: 'intramind_documents',
       primaryColor: '#667eea'
     });
   };
   document.head.appendChild(script);
   ```

### Test Scenarios

#### 1. Basic Chat Flow ✅
- Click chat button → window opens
- Type "What documents do you have?" → Press Enter
- Wait for response
- Check that response has proper formatting
- Verify citations are shown (if any)

#### 2. Session Persistence ✅
- Send 3-4 messages
- Refresh the page (F5)
- Click chat button
- **Expected**: Previous messages restored

#### 3. Multiple Messages ✅
- Send several messages in sequence
- **Expected**: Auto-scrolls to bottom
- **Expected**: Loading indicator shows between messages
- **Expected**: Each message has timestamp

#### 4. Long Responses ✅
- Ask complex question: "Summarize all the policies"
- **Expected**: Long response wraps properly
- **Expected**: Citations display correctly
- **Expected**: Scroll works in message list

#### 5. Error Handling ✅
- Stop the backend (Ctrl+C)
- Try to send a message
- **Expected**: Error message displayed to user
- **Expected**: No crash, input still works

#### 6. UI Interactions ✅
- Hover over chat button → scales up
- Click while open → closes
- Type message but don't send → text persists
- Press Enter with empty input → nothing happens

### API Testing

Test the backend directly:

```bash
# Health check
curl http://localhost:8001/health

# Chat health
curl http://localhost:8001/api/chat/health

# Send chat message
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: demo-api-key" \
  -d '{
    "query": "What are the main topics in the documents?",
    "collection": "intramind_documents"
  }'
```

Expected response:
```json
{
  "response": "Based on your documents, ...",
  "citations": [
    {
      "id": "doc_123",
      "title": "Document Title",
      "content": "Snippet of content...",
      "score": 0.89,
      "metadata": {
        "collection": "intramind_documents",
        "source": "document.pdf",
        "chunk_id": "0"
      }
    }
  ],
  "conversationId": "conv_abc123",
  "queryComplexity": "simple"
}
```

### Browser Console Logs

When testing, you should see these logs:

```
✅ IntraMind widget initialized successfully
✨ Started new conversation {conversationId: "conv_..."}
✅ Restored session from localStorage {messageCount: 5, ...}
✅ Message sent successfully {query: "...", responseLength: 234, citationsCount: 3}
```

### Troubleshooting

**Widget not appearing:**
- Check browser console for errors
- Verify widget built: `cd widget && npm run build`
- Check dist/ folder exists with .iife.js file
- Try accessing http://localhost:8001/widget.js directly

**"AI Agent not available":**
- This is expected if AI Agent isn't running
- Widget will still work with mock responses
- Check backend logs for import errors

**No response from chat:**
- Check backend is running on port 8001
- Check browser Network tab for failed requests
- Check CORS errors (should be allowed in dev)
- Verify API Gateway is running (port 5000)

**Messages not persisting:**
- Check browser localStorage:
  - F12 → Application → Local Storage
  - Look for keys starting with "intramind_"
- Try in incognito mode (localStorage might be disabled)

**Citations not showing:**
- This is normal if no documents are ingested
- AI Agent will return empty citations array
- Test with documents that exist in your collection

### Success Indicators

✅ Chat button appears and animates
✅ Window opens/closes smoothly
✅ Messages send and receive
✅ AI responses appear with formatting
✅ Loading indicators work
✅ Sessions persist across reloads
✅ Citations display (when available)
✅ Error handling works gracefully
✅ No console errors
✅ Backend logs show requests

---

## Next Steps

If everything works:
1. ✅ Phase 2 is complete!
2. 🎯 Ready for Phase 3 (Document Upload)
3. 📝 Update main PROJECT_ROADMAP.md
4. 🚀 Consider adding more test scenarios

If issues found:
1. Check Prerequisites section
2. Review Troubleshooting section
3. Check browser console and backend logs
4. Verify all services are running

---

*Need help? Check PHASE_2_COMPLETE.md for implementation details*
