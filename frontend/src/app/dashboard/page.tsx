'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import machine from '@/utils/machine';
import Cookies from 'js-cookie';
import styles from '@/styles/Dashboard.module.css';

interface Detection { class: string; confidence: string; box: number[]; }
interface ChatMessage { role: 'user' | 'ai'; content: string; }

interface UserProfile {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<number | null>(null);
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await machine.get('/me/');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, [router]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/');
  };

  const getDisplayName = () => {
    if (!user) return 'Loading...';
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    return user.username;
  };

  const getInitials = () => {
    if (!user) return '...';
    const name = getDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnnotatedImageUrl(null);
      setDetections([]);
      setChatMessages([]);
      setIsChatLoading(false);
    }
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await machine.post('/detect/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageId(response.data.id);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      setAnnotatedImageUrl(`${baseUrl}${response.data.annotated_image}`);
      setDetections(response.data.detection_results);
    } catch (error) {
      alert('Detection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !imageId || isChatLoading) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsChatLoading(true);

    try {
      const res = await machine.post('/chat/', { image_id: imageId, question: msg });
      setChatMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Error getting response." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    
    const sorted = [...detections].sort((a: any, b: any) => {
      if (key === 'confidence') {
        const valA = parseInt(a[key].replace('%', ''));
        const valB = parseInt(b[key].replace('%', ''));
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      return direction === 'asc' ? String(a[key]).localeCompare(String(b[key])) : String(b[key]).localeCompare(String(a[key]));
    });
    setDetections(sorted);
  };

  // --- NEW FUNCTION: Renders Text with Bold Support ---
  // This splits the text by '**'. Odd parts become bold.
  // Example: "Hello **World**" -> ["Hello ", "World", ""] -> "World" is index 1 (odd) -> Bold
  const renderMessage = (content: string) => {
    const parts = content.split('**');
    return parts.map((part, index) => 
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
  };

  return (
    <div className={styles.dashboardBody}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </div>
            <h1>AI Vision Platform</h1>
          </div>
          <div className={styles.userMenu}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{getInitials()}</div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{getDisplayName()}</div>
                <div className={styles.userEmail}>{user?.email || 'Loading...'}</div>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>Upload Image for Detection</h2>
          <p className={styles.sectionSubtitle}>Upload an image to detect objects using our advanced YOLO model</p>

          {!previewUrl ? (
            <div 
              className={`${styles.uploadArea} ${isDragging ? styles.dragover : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.uploadIcon}>
                <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <div className={styles.uploadText}>Drop your image here</div>
              <div className={styles.uploadSubtext}>or click to browse (PNG, JPG, JPEG)</div>
              <button className={styles.uploadBtn}>Select Image</button>
              <input type="file" ref={fileInputRef} className={styles.hiddenInput} accept="image/*" onChange={handleFileSelect} />
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <div className={styles.previewImageWrapper}>
                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
              </div>
              <div className={styles.previewActions}>
                <button className={`${styles.actionBtn} ${styles.detectBtn}`} onClick={handleDetect}>{loading ? 'Processing...' : 'Detect Objects'}</button>
                <button className={`${styles.actionBtn} ${styles.removeBtn}`} onClick={() => { setPreviewUrl(null); setFile(null); }}>Remove Image</button>
              </div>
            </div>
          )}
        </section>

        {annotatedImageUrl && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsGrid}>
              <div className={styles.resultCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Annotated Image</h3>
                  <span className={styles.cardBadge}>{detections.length} Objects</span>
                </div>
                <div className={styles.annotatedImageWrapper}>
                  <img src={annotatedImageUrl} alt="Annotated" className={styles.annotatedImage} />
                </div>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Detection Results</h3>
                  <span className={styles.cardBadge}>Sortable</span>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.resultsTable}>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('class')} className={sortConfig?.key === 'class' ? styles.sorted : ''}>Object <span className={styles.sortIcon}>▼</span></th>
                        <th onClick={() => handleSort('confidence')} className={sortConfig?.key === 'confidence' ? styles.sorted : ''}>Confidence <span className={styles.sortIcon}>▼</span></th>
                        <th onClick={() => handleSort('box')}>Box <span className={styles.sortIcon}>▼</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {detections.map((det, idx) => (
                        <tr key={idx}>
                          <td><span className={styles.objectClass}>{det.class}</span></td>
                          <td>
                            <div className={styles.confidenceBar}>
                              <div className={styles.confidenceProgress}>
                                <div className={styles.confidenceFill} style={{ width: det.confidence }}></div>
                              </div>
                              <span className={styles.confidenceValue}>{det.confidence}</span>
                            </div>
                          </td>
                          <td><span className={styles.bboxCoords}>[{det.box.join(', ')}]</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={styles.qaSection}>
              <div className={styles.qaHeader}>
                <div className={styles.qaIcon}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg></div>
                <div><h3 className={styles.cardTitle}>Ask Questions</h3><p className={styles.sectionSubtitle} style={{margin:0}}>Powered by Gemini 2.5 Flash</p></div>
              </div>
              
              <div className={styles.chatContainer} ref={chatContainerRef}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`${styles.chatMessage} ${msg.role === 'user' ? styles.user : styles.ai}`}>
                    <div className={`${styles.messageAvatar} ${msg.role === 'user' ? styles.user : styles.ai}`}>
                          {msg.role === 'user' ? getInitials() : 'AI'}
                    </div>
                    {/* --- CHANGE HERE: Use renderMessage instead of direct string --- */}
                    <div className={styles.messageContent}>
                      {renderMessage(msg.content)}
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className={`${styles.chatMessage} ${styles.ai}`}>
                    <div className={`${styles.messageAvatar} ${styles.ai}`}>AI</div>
                    <div className={`${styles.messageContent} ${styles.loadingBubble}`}>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.qaInputWrapper}>
                <input 
                  type="text" 
                  className={styles.qaInput} 
                  placeholder={isChatLoading ? "AI is thinking..." : "Ask about results..."} 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isChatLoading}
                />
                <button 
                  className={styles.qaSubmit} 
                  onClick={handleSendMessage}
                  disabled={isChatLoading}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}