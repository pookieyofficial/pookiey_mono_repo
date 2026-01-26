import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getActiveAnnouncementAPI, Announcement } from '@/APIs/announcementAPIs';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const activeAnnouncement = await getActiveAnnouncementAPI(token);
        
        if (activeAnnouncement) {
          setAnnouncement(activeAnnouncement);
        } else {
          // No active announcement, close the screen
          router.back();
        }
      } catch (err: any) {
        console.error('Error fetching announcement:', err);
        setError(err.message || 'Failed to load announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [token]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.red} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !announcement) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.primary.red} />
          <ThemedText style={styles.errorText}>
            {error || 'No announcement available'}
          </ThemedText>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Create HTML content with proper styling for mobile
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            background-color: #ffffff;
            padding: 20px;
            overflow-x: hidden;
            word-wrap: break-word;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px 0;
          }
          a {
            color: #${Colors.primary.red.replace('#', '')};
            text-decoration: none;
          }
          a:active {
            opacity: 0.7;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 20px;
            margin-bottom: 10px;
            line-height: 1.2;
          }
          p {
            margin-bottom: 15px;
          }
          ul, ol {
            margin-left: 20px;
            margin-bottom: 15px;
          }
          iframe {
            max-width: 100%;
            width: 100%;
          }
        </style>
      </head>
      <body>
        ${announcement.htmlContent}
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{announcement.title}</ThemedText>
        <TouchableOpacity
          style={styles.closeIcon}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        bounces={false}
        // Allow links to open in external browser
        onShouldStartLoadWithRequest={(request) => {
          // Allow same-origin navigation
          if (request.url.startsWith('data:text/html') || request.url === 'about:blank') {
            return true;
          }
          // For external links, open in browser
          if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
            Linking.openURL(request.url).catch((err: any) => {
              console.error('Failed to open URL:', err);
            });
            return false;
          }
          return true;
        }}
        // Inject JavaScript to handle responsive images and links
        injectedJavaScript={`
          (function() {
            // Make all images responsive
            const images = document.querySelectorAll('img');
            images.forEach(img => {
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
            });
            
            // Handle link clicks
            const links = document.querySelectorAll('a');
            links.forEach(link => {
              link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                  e.preventDefault();
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'link', url: href }));
                }
              });
            });
            
            // Prevent zoom on double tap
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
              const now = Date.now();
              if (now - lastTouchEnd <= 300) {
                event.preventDefault();
              }
              lastTouchEnd = now;
            }, false);
          })();
          true;
        `}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'link' && data.url) {
              Linking.openURL(data.url).catch((err: any) => {
                console.error('Failed to open URL:', err);
              });
            }
          } catch (err) {
            console.error('Error parsing WebView message:', err);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.light,
    backgroundColor: Colors.primary.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  closeIcon: {
    padding: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.primary.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primary.white,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary.red,
    borderRadius: 8,
  },
  closeButtonText: {
    color: Colors.primary.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
