import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Screenshot {
  screenshot_id: number;
  image_url: string;
  ocr_text: string | null;
  captured_on: string;
  processing_status: string;
  distance?: number;
}

export default function HomeScreen() {
  const theme = useTheme();
  
  // Settings & Configuration
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [showSettings, setShowSettings] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // App States
  const [activeTab, setActiveTab] = useState<'search' | 'ask'>('search');
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loadingScreenshots, setLoadingScreenshots] = useState(false);
  
  // Upload States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Screenshot[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Ask AI States
  const [askQuestion, setAskQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiSources, setAiSources] = useState<Screenshot[]>([]);
  const [asking, setAsking] = useState(false);

  // Selected screenshot details modal-like state
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteScreenshot = async (screenshotId: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`${backendUrl}/screenshots/${screenshotId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedScreenshot(null);
        fetchRecentScreenshots();
        setSearchResults(prev => prev.filter(item => item.screenshot_id !== screenshotId));
      } else {
        alert('Failed to delete screenshot.');
      }
    } catch (err) {
      console.error('Error deleting screenshot:', err);
      alert('Error connecting to backend to delete screenshot.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (screenshotId: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this screenshot?')) {
        handleDeleteScreenshot(screenshotId);
      }
    } else {
      Alert.alert(
        'Delete Screenshot',
        'Are you sure you want to delete this screenshot?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteScreenshot(screenshotId) }
        ]
      );
    }
  };

  // Check backend connection
  const checkBackend = async (url: string) => {
    setBackendStatus('checking');
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(`${url}/`, { signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      setBackendStatus('offline');
    }
  };

  // Fetch recent screenshots
  const fetchRecentScreenshots = async () => {
    setLoadingScreenshots(true);
    try {
      const res = await fetch(`${backendUrl}/screenshots`);
      if (res.ok) {
        const data = await res.json();
        setScreenshots(data);
      }
    } catch (err) {
      console.error('Error fetching screenshots:', err);
    } finally {
      setLoadingScreenshots(false);
    }
  };

  // Initialize and run connectivity check
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkBackend(backendUrl);
    // On load, attempt to fetch screenshots
    fetchRecentScreenshots();
  }, []);

  // Pick an image
  const pickImage = async () => {
    setUploadStatus('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      alert('Failed to select image');
    }
  };

  // Upload the selected image
  const handleUpload = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    setUploadStatus('Uploading image to Cloudinary...');
    
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        formData.append('file', blob, 'screenshot.jpg');
      } else {
        formData.append('file', {
          uri: selectedImage,
          name: 'screenshot.jpg',
          type: 'image/jpeg',
        } as any);
      }
      
      const res = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUploadStatus('Processing Complete! OCR and Embeddings saved.');
        setSelectedImage(null);
        // Refresh gallery
        fetchRecentScreenshots();
        
        // Auto clear upload message after 4s
        setTimeout(() => setUploadStatus(''), 4000);
      } else {
        const errorText = await res.text();
        console.error('Upload failed response:', errorText);
        setUploadStatus(`Upload failed: ${res.statusText}`);
      }
    } catch (err: any) {
      console.error('Error uploading:', err);
      setUploadStatus(`Error: ${err.message || 'Server connection failed'}`);
    } finally {
      setUploading(false);
    }
  };

  // Run Semantic Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchResults([]);
    
    try {
      const res = await fetch(`${backendUrl}/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Search failed. Check backend connection.');
    } finally {
      setSearching(false);
    }
  };

  // Run AI RAG Question Ask
  const handleAsk = async () => {
    if (!askQuestion.trim()) return;
    
    setAsking(true);
    setAiResponse('');
    setAiSources([]);
    
    try {
      const res = await fetch(`${backendUrl}/ask?question=${encodeURIComponent(askQuestion)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          setAiResponse(data.answer);
          setAiSources(data.sources || []);
        } else {
          setAiResponse(data.message || 'No relevant information found.');
        }
      } else {
        setAiResponse('Error fetching answer from backend.');
      }
    } catch (err) {
      console.error('Ask error:', err);
      setAiResponse('Failed to connect to AI server.');
    } finally {
      setAsking(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>SnapRecall</Text>
            <Text style={styles.taglineText}>Search your learning screenshots</Text>
          </View>
          
          <Pressable 
            onPress={() => {
              setShowSettings(!showSettings);
              checkBackend(backendUrl);
            }}
            style={[styles.statusBadge, {
              backgroundColor: backendStatus === 'online' ? '#DEF7EC' : backendStatus === 'checking' ? '#FEF08A' : '#FDE8E8'
            }]}
          >
            <View style={[styles.statusDot, {
              backgroundColor: backendStatus === 'online' ? '#0E9F6E' : backendStatus === 'checking' ? '#CA8A04' : '#E02424'
            }]} />
            <Text style={[styles.statusText, {
              color: backendStatus === 'online' ? '#03543F' : backendStatus === 'checking' ? '#713F12' : '#9B1C1C'
            }]}>
              {backendStatus === 'online' ? 'Connected' : backendStatus === 'checking' ? 'Checking...' : 'Offline'}
            </Text>
          </Pressable>
        </View>

        {/* Backend Configuration Settings */}
        {showSettings && (
          <View style={styles.settingsPanel}>
            <Text style={styles.sectionTitleSmall}>API Settings</Text>
            <View style={styles.settingsRow}>
              <TextInput
                style={styles.settingsInput}
                value={backendUrl}
                onChangeText={setBackendUrl}
                placeholder="Backend URL (e.g. http://localhost:8000)"
                placeholderTextColor="#999"
              />
              <Pressable 
                style={styles.settingsButton}
                onPress={() => {
                  checkBackend(backendUrl);
                  fetchRecentScreenshots();
                }}
              >
                <Text style={styles.settingsButtonText}>Test</Text>
              </Pressable>
            </View>
            <Text style={styles.settingsHelpText}>
              {"Note: Android emulators use http://10.0.2.2:8000. Real devices use your computer's local IP address."}
            </Text>
          </View>
        )}

        {/* Upload Screenshot Panel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Screenshot</Text>
          <Text style={styles.cardSubtitle}>Select a screenshot to extract OCR text and index it semantically.</Text>
          
          <View style={styles.uploadRow}>
            {selectedImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="contain" />
                <Pressable style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                  <Text style={styles.removeImageBtnText}>×</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.dropZone} onPress={pickImage}>
                
                <Text style={styles.dropZoneText}>Select from Photos</Text>
              </Pressable>
            )}

            {selectedImage && (
              <View style={styles.uploadActions}>
                <Pressable 
                  style={[styles.primaryButton, uploading && styles.buttonDisabled]} 
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Upload & Process</Text>
                  )}
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => setSelectedImage(null)}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </View>
            )}
          </View>

          {uploadStatus ? (
            <View style={styles.statusBanner}>
              <Text style={styles.statusBannerText}>{uploadStatus}</Text>
            </View>
          ) : null}
        </View>

        {/* Tab Controls (Search vs Ask AI) */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tabButton, activeTab === 'search' && styles.tabButtonActive]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'search' && styles.tabButtonTextActive]}>
               Semantic Search
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tabButton, activeTab === 'ask' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ask')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'ask' && styles.tabButtonTextActive]}>
               Ask AI (RAG)
            </Text>
          </Pressable>
        </View>

        {/* Tab Content: Semantic Search */}
        {activeTab === 'search' && (
          <View style={styles.card}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search text, concepts, or topics..."
                placeholderTextColor="#999"
                onSubmitEditing={handleSearch}
              />
              <Pressable 
                style={[styles.searchButton, searching && styles.buttonDisabled]}
                onPress={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.searchButtonText}>Search</Text>
                )}
              </Pressable>
            </View>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsHeading}>Search Results</Text>
                {searchResults.map((item) => (
                  <Pressable 
                    key={item.screenshot_id} 
                    style={styles.resultCard}
                    onPress={() => setSelectedScreenshot(item)}
                  >
                    <Image source={{ uri: item.image_url }} style={styles.resultThumbnail} />
                    <View style={styles.resultDetails}>
                      <Text style={styles.resultOcr} numberOfLines={2}>
                        {item.ocr_text || '(No OCR text found)'}
                      </Text>
                      <View style={styles.resultMetaRow}>
                        <Text style={styles.resultMetaText}>ID: #{item.screenshot_id}</Text>
                        {item.distance !== undefined && (
                          <Text style={styles.similarityBadge}>
                            Match: {Math.max(0, Math.round((1 - item.distance) * 100))}%
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : searchQuery.trim() && !searching ? (
              <Text style={styles.emptyResultsText}>No matching screenshots found.</Text>
            ) : null}
          </View>
        )}

        {/* Tab Content: Ask AI */}
        {activeTab === 'ask' && (
          <View style={styles.card}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={askQuestion}
                onChangeText={setAskQuestion}
                placeholder="Ask a question about your saved screenshots..."
                placeholderTextColor="#999"
                onSubmitEditing={handleAsk}
              />
              <Pressable 
                style={[styles.askButton, asking && styles.buttonDisabled]}
                onPress={handleAsk}
                disabled={asking}
              >
                {asking ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.askButtonText}>Ask AI</Text>
                )}
              </Pressable>
            </View>

            {/* AI Answer Response */}
            {aiResponse ? (
              <View style={styles.aiResponseCard}>
                <Text style={styles.aiResponseTitle}>AI Answer</Text>
                <Text style={styles.aiResponseText}>{aiResponse}</Text>
                
                {aiSources.length > 0 && (
                  <View style={styles.aiSourcesContainer}>
                    <Text style={styles.aiSourcesTitle}>Sources Used:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sourcesScroll}>
                      {aiSources.map((source) => (
                        <Pressable 
                          key={source.screenshot_id} 
                          style={styles.sourceThumbnailWrapper}
                          onPress={() => setSelectedScreenshot(source)}
                        >
                          <Image source={{ uri: source.image_url }} style={styles.sourceThumbnail} />
                          <Text style={styles.sourceIdText}>#{source.screenshot_id}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : asking ? (
              <View style={styles.aiLoadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.aiLoadingText}>AI is scanning your screenshots for answers...</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* All Screenshots Gallery */}
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>Saved Screenshots</Text>
          <Pressable style={styles.refreshButton} onPress={fetchRecentScreenshots}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </Pressable>
        </View>

        {loadingScreenshots ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : screenshots.length === 0 ? (
          <View style={styles.emptyGallery}>
            <Text style={styles.emptyGalleryEmoji}>📷</Text>
            <Text style={styles.emptyGalleryText}>No screenshots uploaded yet.</Text>
            <Text style={styles.emptyGallerySubtext}>Upload screenshots of lectures, slides, code, or books to get started.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {screenshots.map((item) => (
              <Pressable 
                key={item.screenshot_id} 
                style={styles.gridItem}
                onPress={() => setSelectedScreenshot(item)}
              >
                <Image source={{ uri: item.image_url }} style={styles.gridImage} resizeMode="cover" />
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridOcrText} numberOfLines={1}>
                    {item.ocr_text || '(Processing OCR...)'}
                  </Text>
                  <Text style={styles.gridDate}>
                    {formatDate(item.captured_on)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Detail View Overlay (Modal) */}
      {selectedScreenshot && (
        <Modal
          visible={!!selectedScreenshot}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedScreenshot(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Screenshot Details</Text>
                <Pressable onPress={() => setSelectedScreenshot(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>×</Text>
                </Pressable>
              </View>
              
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Image 
                  source={{ uri: selectedScreenshot.image_url }} 
                  style={styles.modalImage} 
                  resizeMode="contain"
                />
                
                <Text style={styles.metadataLabel}>Captured On</Text>
                <Text style={styles.metadataValue}>{formatDate(selectedScreenshot.captured_on)}</Text>
                
                <Text style={styles.metadataLabel}>Status</Text>
                <Text style={styles.metadataValue}>{selectedScreenshot.processing_status.toUpperCase()}</Text>

                <Text style={styles.metadataLabel}>Extracted Text (OCR)</Text>
                <View style={styles.ocrTextContainer}>
                  <Text style={styles.ocrTextContent} selectable={true}>
                    {selectedScreenshot.ocr_text || 'No text extracted from this image.'}
                  </Text>
                </View>

                {/* Delete Button */}
                <Pressable 
                  style={[styles.deleteButton, deleting && styles.buttonDisabled]} 
                  onPress={() => confirmDelete(selectedScreenshot.screenshot_id)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete Screenshot</Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;
const numColumns = windowWidth > 600 ? 3 : 2;
const gridItemWidth = (Math.min(windowWidth, MaxContentWidth) - (Spacing.four * 2) - (Spacing.three * (numColumns - 1))) / numColumns;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: BottomTabInset + Spacing.five,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: Spacing.four,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8b5cf6',
  },
  taglineText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsPanel: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#334155',
  },
  settingsButton: {
    backgroundColor: '#64748B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  settingsButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  settingsHelpText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 14,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      }
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  uploadRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.three,
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C084FC',
    borderRadius: 12,
    backgroundColor: '#FAF5FF',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropZoneEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  dropZoneText: {
    color: '#8b5cf6',
    fontWeight: '600',
    fontSize: 14,
  },
  previewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  secondaryButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  statusBanner: {
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    padding: Spacing.two,
    marginTop: Spacing.two,
    borderLeftWidth: 4,
    borderLeftColor: '#A855F7',
  },
  statusBannerText: {
    color: '#7E22CE',
    fontSize: 13,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.four,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      }
    }),
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#1E293B',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  searchButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  askButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  askButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.three,
  },
  resultsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: Spacing.two,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Spacing.two,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  resultThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: Spacing.three,
    backgroundColor: '#000',
  },
  resultDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultOcr: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  resultMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  resultMetaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  similarityBadge: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyResultsText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    marginTop: Spacing.three,
  },
  aiResponseCard: {
    marginTop: Spacing.four,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  aiResponseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: Spacing.two,
  },
  aiResponseText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 22,
  },
  aiSourcesContainer: {
    marginTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#BAE6FD',
    paddingTop: Spacing.two,
  },
  aiSourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 6,
  },
  sourcesScroll: {
    gap: 8,
  },
  sourceThumbnailWrapper: {
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sourceThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  sourceIdText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFF',
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 1,
  },
  aiLoadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  aiLoadingText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: Spacing.two,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  refreshButtonText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  loaderContainer: {
    paddingVertical: Spacing.six,
  },
  emptyGallery: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyGalleryEmoji: {
    fontSize: 40,
    marginBottom: Spacing.two,
  },
  emptyGalleryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  emptyGallerySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.five,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  gridItem: {
    width: gridItemWidth,
    height: gridItemWidth * 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  gridOcrText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '500',
  },
  gridDate: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: Spacing.two,
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalScroll: {
    gap: Spacing.three,
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  metadataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  metadataValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  ocrTextContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ocrTextContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

