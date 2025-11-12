/*
 * AI Assistant Component - Dream Experience
 * Voice-powered, predictive, intelligent helper
 */

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Zap, Brain, MessageCircle, Volume2 } from 'lucide-react'

const AIAssistant = ({ diaryEntries, onSuggestion, onVoiceCommand, weather, currentTime }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)
        processVoiceCommand(finalTranscript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Generate AI suggestions based on context
  useEffect(() => {
    generateSuggestions()
  }, [diaryEntries, weather, currentTime])

  const generateSuggestions = () => {
    setIsThinking(true)

    setTimeout(() => {
      const newSuggestions = []

      // Weather-based suggestions
      if (weather.condition === 'Rainy') {
        newSuggestions.push({
          type: 'weather',
          title: 'Rain Protection Needed',
          description: 'Consider tarps and indoor work due to rain',
          action: () => onSuggestion('add_equipment', 'Tarps')
        })
      }

      // Time-based suggestions
      const hour = new Date().getHours()
      if (hour >= 17) {
        newSuggestions.push({
          type: 'time',
          title: 'End of Day Wrap-up',
          description: 'Review progress and plan tomorrow\'s tasks',
          action: () => onSuggestion('create_entry', 'End of Day Review')
        })
      }

      // Productivity suggestions
      const recentEntries = diaryEntries.slice(-5)
      const avgDuration = recentEntries.reduce((sum, entry) =>
        sum + entry.items.reduce((s, item) => s + (item.duration || 0), 0), 0
      ) / Math.max(recentEntries.length, 1)

      if (avgDuration > 8) {
        newSuggestions.push({
          type: 'productivity',
          title: 'Long Work Sessions Detected',
          description: `Average ${avgDuration.toFixed(1)}h sessions. Consider breaks for safety.`,
          action: () => onSuggestion('add_note', 'Take safety breaks')
        })
      }

      // Cost optimization
      const highCostEntries = diaryEntries.filter(entry =>
        entry.items.reduce((sum, item) => sum + (item.cost || 0), 0) > 1000
      )

      if (highCostEntries.length > 0) {
        newSuggestions.push({
          type: 'cost',
          title: 'High-Cost Projects',
          description: `${highCostEntries.length} entries over $1000. Review for optimization.`,
          action: () => onSuggestion('filter', 'high_cost')
        })
      }

      setSuggestions(newSuggestions)
      setIsThinking(false)
    }, 1000) // Simulate AI processing time
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes('new entry') || lowerCommand.includes('create entry')) {
      onVoiceCommand('create_entry')
    } else if (lowerCommand.includes('add staff') || lowerCommand.includes('add worker')) {
      onVoiceCommand('add_staff')
    } else if (lowerCommand.includes('add equipment') || lowerCommand.includes('add tool')) {
      onVoiceCommand('add_equipment')
    } else if (lowerCommand.includes('start timer') || lowerCommand.includes('begin work')) {
      onVoiceCommand('start_timer')
    } else if (lowerCommand.includes('stop timer') || lowerCommand.includes('end work')) {
      onVoiceCommand('stop_timer')
    } else if (lowerCommand.includes('save') || lowerCommand.includes('save diary')) {
      onVoiceCommand('save')
    }
  }

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      color: 'white',
      zIndex: 1000
    }}>
      {/* AI Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Brain size={24} />
        <div>
          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>AI Assistant</h4>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {isThinking ? '🤔 Analyzing...' : '💡 Ready to help'}
          </div>
        </div>
      </div>

      {/* Voice Control */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={toggleListening}
          style={{
            width: '100%',
            padding: '12px',
            background: isListening ? '#e74c3c' : '#28a745',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening ? 'Listening...' : 'Voice Commands'}
        </button>

        {transcript && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            🎤 {transcript}
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <div>
        <h5 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} />
          Smart Suggestions
        </h5>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
              <MessageCircle size={32} />
              <div style={{ marginTop: '8px' }}>No suggestions at the moment</div>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={suggestion.action}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {suggestion.title}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>
                  {suggestion.description}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => speak("Hello! I'm your AI assistant. Say 'new entry' to create a diary entry, or 'start timer' to begin tracking time.")}
          style={{
            flex: 1,
            padding: '8px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Volume2 size={14} />
          Help
        </button>
      </div>
    </div>
  )
}

export default AIAssistant