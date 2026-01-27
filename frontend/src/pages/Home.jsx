import React, { useState, useRef } from 'react';
import { Mic, Send, StopCircle, FileText, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { submitTextComplaint, submitVoiceComplaint } from '../services/api';

const Home = () => {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'voice'
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null); // { blob, url }
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await submitTextComplaint(text);
      setResponse(res.summary);
      setText('');
    } catch (error) {
      console.error(error);
      alert('Failed to submit complaint');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio({ blob: audioBlob, url: audioUrl });
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordedAudio(null); 
    } catch (error) {
      console.error(error);
      alert('Error accessing microphone. Please ensure you have granted permission.');
    }
  };

  const submitRecording = async () => {
    if (!recordedAudio) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await submitVoiceComplaint(recordedAudio.blob);
      setResponse(res.summary);
      setRecordedAudio(null); // Clear after success
    } catch (error) {
      console.error(error);
      alert('Failed to submit voice complaint');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecording = () => {
    setRecordedAudio(null);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Submit a Complaint</h1>
          <p className="text-lg text-slate-600">We're here to help. Tell us what's wrong.</p>
        </div>

        <Card className="p-1">
          <div className="grid grid-cols-2 p-1 bg-slate-100/50 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'text' 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText size={18} />
              Text Input
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'voice' 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mic size={18} />
              Voice Input
            </button>
          </div>

          <div className="p-6 pt-0">
            {activeTab === 'text' ? (
              <div className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white text-slate-900 outline-none"
                />
                <Button 
                  onClick={handleTextSubmit} 
                  isLoading={isLoading} 
                  className="w-full"
                  disabled={!text.trim() || isLoading}
                >
                  Submit Complaint <Send size={18} className="ml-2" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-8 py-8">
                {/* Recording Interface */}
                {!recordedAudio && (
                  <>
                    <div 
                      className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-50' : 'bg-indigo-50'}`}
                    >
                      {isRecording && (
                        <span className="absolute w-full h-full rounded-full bg-red-400/20 animate-ping"></span>
                      )}
                      <div className={`z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white shadow-xl shadow-red-200' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'}`}>
                        <Mic size={40} />
                      </div>
                    </div>
                    
                    <p className="text-slate-600 font-medium">
                      {isRecording ? "Listening... Speak clearly." : "Tap to start recording"}
                    </p>

                    {isRecording ? (
                      <Button variant="danger" onClick={stopRecording} className="w-full max-w-xs">
                        Stop Recording <StopCircle size={18} className="ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={startRecording} isLoading={isLoading} className="w-full max-w-xs" disabled={isLoading}>
                        Start Recording
                      </Button>
                    )}
                  </>
                )}

                {/* Review Interface */}
                {recordedAudio && (
                  <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-center">
                      <h3 className="text-slate-900 font-semibold mb-2">Recording Complete</h3>
                      <audio controls src={recordedAudio.url} className="w-full" />
                      <div className="flex gap-3 pt-2">
                         <button 
                          onClick={deleteRecording}
                          className="flex-1 py-3 px-4 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                        >
                          Discard
                        </button>
                        <Button 
                          onClick={submitRecording} 
                          isLoading={isLoading} 
                          className="flex-1"
                        >
                          Submit <Send size={18} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-center text-slate-400">
                      Review your complaint before submitting.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {response && (
          <Card className="p-6 bg-green-50/50 border-green-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-green-900">Complaint Processed Successfully</h3>
                <div className="p-4 bg-white rounded-xl border border-green-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Summary & Action</p>
                  <p className="text-slate-800 leading-relaxed font-medium">{response}</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Home;
