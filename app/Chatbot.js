// app/Chatbot.js
{/*import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatbot } from '../hooks/useChatbotHooks';

const ChatbotScreen = () => {
  const {
    messages,
    inputText,
    setInputText,
    selectedPdf,
    isLoading,
    apiError,
    setApiError,
    scrollViewRef,
    pickPdf,
    sendMessage,
    setSelectedPdf
  } = useChatbot();

  const renderMessageItem = (message) => {
    return (
      <View 
        key={message.id} 
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.botMessage,
          message.isError && styles.errorMessage
        ]}
      >
        {message.pdfName && (
          <View style={styles.pdfIndicator}>
            <MaterialIcons name="picture-as-pdf" size={16} color="#FF5252" />
            <Text style={styles.pdfName} numberOfLines={1}>{message.pdfName}</Text>
          </View>
        )}
        <Text style={styles.messageText}>{message.text}</Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatbot</Text>
      </View>
      
      {apiError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{apiError}</Text>
          <TouchableOpacity onPress={() => setApiError(null)}>
            <MaterialIcons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(message => renderMessageItem(message))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0891b2" />
                <Text style={styles.loadingText}>Traitement en cours...</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              Envoyez un message ou téléchargez un PDF pour commencer la conversation
            </Text>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={pickPdf}>
            <MaterialIcons name="attach-file" size={24} color="#0891b2" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Posez votre question..."
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!inputText.trim() && !selectedPdf) && styles.disabledButton
            ]}
            onPress={sendMessage}
            disabled={(!inputText.trim() && !selectedPdf) || isLoading}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {selectedPdf && (
          <View style={styles.selectedFileContainer}>
            <MaterialIcons name="picture-as-pdf" size={20} color="#FF5252" />
            <Text style={styles.selectedFileName} numberOfLines={1}>
              {selectedPdf.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedPdf(null)}>
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    //backgroundColor: '#0891b2',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorBanner: {
    backgroundColor: '#FF5252',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorBannerText: {
    color: 'white',
    flex: 1
  },
  keyboardAvoid: {
    flex: 1
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10
  },
  messagesContent: {
    paddingTop: 20,
    paddingBottom: 10
  },
  messageContainer: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    maxWidth: '80%',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  userMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5
  },
  botMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5
  },
  errorMessage: {
    backgroundColor: '#FFE5E5'
  },
  messageText: {
    fontSize: 16,
    color: '#333'
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  pdfIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  pdfName: {
    fontSize: 12,
    color: '#FF5252',
    marginLeft: 4,
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  attachButton: {
    padding: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginHorizontal: 8
  },
  sendButton: {
    backgroundColor: '#0891b2',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#cccccc'
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#666',
    fontSize: 16
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  loadingText: {
    color: '#0891b2',
    marginLeft: 10,
    fontSize: 14
  }
});

export default ChatbotScreen;*/}
// app/Chatbot.js
// app/Chatbot.js
{/*import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatbot } from '../hooks/useChatbotHooks';
import SidebarChatbot from '../components/SidebarChatbot';

// Composant Message séparé pour une meilleure organisation
const MessageItem = ({ message }) => {
  const messageAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(messageAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
        message.isError && styles.errorMessage,
        { 
          opacity: messageAnimation,
          transform: [{ 
            translateY: messageAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }
      ]}
    >
      {!message.isUser && (
        <View style={styles.botAvatarContainer}>
          <Image 
            source={require('../assets/robot-logo.png')} 
            style={styles.botAvatar} 
          />
        </View>
      )}
      
      <View style={[
        styles.messageContentContainer,
        message.isUser ? styles.userMessageContent : styles.botMessageContent
      ]}>
        {message.pdfName && (
          <View style={styles.pdfIndicator}>
            <MaterialIcons name="picture-as-pdf" size={16} color="#FF5252" />
            <Text style={styles.pdfName} numberOfLines={1}>{message.pdfName}</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText
        ]}>{message.text}</Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {message.isUser && (
        <View style={styles.userAvatarContainer}>
          <Image 
            source={require('../assets/user.png')} 
            style={styles.userAvatar} 
          />
        </View>
      )}
    </Animated.View>
  );
};

const IntroScreen = ({ onComplete }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const handleGetStarted = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.introContainer,
        { 
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim
        }
      ]}
    >
      <View style={styles.introContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/assistant-illustration.png')} 
            style={styles.logoImage} 
          />
        </View>
        <Text style={styles.introTitle}>Je suis votre assistant IA,
           prêt à vous aider. Commencez quand vous voulez !</Text>
        <Text style={styles.introSubtitle}>
          Posez vos questions ou partagez des documents
        </Text>
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedArrows}>{'>>'}</Text>
          <Text style={styles.getStartedMainText}>Commencer</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const ChatbotScreen = () => {
  // Move state declarations outside of useChatbot for clarity
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const inputAnimation = useRef(new Animated.Value(0)).current;

  // Ensure we're properly destructuring ALL the props from useChatbot
  const {
    messages,
    setMessages,
    inputText,
    setInputText,
    selectedPdf,
    isLoading,
    apiError,
    setApiError,
    scrollViewRef,
    pickPdf,
    sendMessage,
    setSelectedPdf,
    histories,
    fetchHistories,
    isLoadingHistories,
    fetchConversationDetails,
    currentConversationId,
    setCurrentConversationId
  } = useChatbot();

  const handleSelectHistory = (history) => {
    fetchConversationDetails(history.id);
    setShowSidebar(false);
  };
  const handleDeleteConversation = async (id) => {
    try {
      await axios.delete(`http://192.168.1.7:5000/api/chatbot/${id}`);
      await fetchHistories();
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      setApiError('Impossible de supprimer la conversation.');
    }
  };
  // Utiliser l'objet navigation (remplacez par votre vraie navigation)
  const navigation = { navigate: () => {} }; // Exemple - remplacez par la vraie valeur

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
    setSelectedPdf(null);
    setCurrentConversationId(null);
  };
  const renderMessageItem = (message) => {
    return (
      <View 
        key={message.id} 
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.botMessage,
          message.isError && styles.errorMessage
        ]}
      >
        {message.pdfName && (
          <View style={styles.pdfIndicator}>
            <MaterialIcons name="picture-as-pdf" size={16} color="#FF5252" />
            <Text style={styles.pdfName} numberOfLines={1}>{message.pdfName}</Text>
          </View>
        )}
        <Text style={styles.messageText}>{message.text}</Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    if (!showIntro) {
      Animated.spring(inputAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }).start();
    }
  }, [showIntro]);
  

  const handleIntroComplete = () => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setShowIntro(false);
    });
  };

  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleSidebar}
          >
            <Ionicons name="menu" size={24} color="#007BFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assistant IA</Text>
        </View>
        
        {apiError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
            <TouchableOpacity onPress={() => setApiError(null)}>
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {messages.length > 0 ? (
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map(message => (
                <MessageItem key={message.id} message={message} />
              ))}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#007BFF" />
                  <Text style={styles.loadingText}>Traitement en cours...</Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Image 
                source={require('../assets/robot-logo.png')} 
                style={styles.emptyBotImage} 
              />
              <Text style={styles.emptyText}>
                Envoyez un message ou téléchargez un PDF pour commencer la conversation
              </Text>
            </View>
          )}
          
          <Animated.View 
            style={[
              styles.inputContainer,
              {
                transform: [{ 
                  translateY: inputAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity style={styles.attachButton} onPress={pickPdf}>
              <MaterialIcons name="attach-file" size={24} color="#007BFF" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Posez votre question..."
              multiline
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                (!inputText.trim() && !selectedPdf) && styles.disabledButton
              ]}
              onPress={sendMessage}
              disabled={(!inputText.trim() && !selectedPdf) || isLoading}
            >
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
          
          {selectedPdf && (
            <View style={styles.selectedFileContainer}>
              <MaterialIcons name="picture-as-pdf" size={20} color="#FF5252" />
              <Text style={styles.selectedFileName} numberOfLines={1}>
                {selectedPdf.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedPdf(null)}>
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Affichage de la Sidebar et de l'overlay 
      {isSidebarOpen && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={toggleSidebar}
            activeOpacity={1}
          />
          {/* Pass setMessages to SidebarChatbot only if it exists 
          <SidebarChatbot
            onNewChat={handleNewChat}
            onClose={toggleSidebar}
            navigation={navigation}
            // Conditionally pass setMessages only if available
            {...(setMessages ? { setMessages } : {})}
          />
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  /*menuButton: {
    marginRight: 16,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerTitle: {
    color: '#2c3e50',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16, // Ajout d'une marge pour l'espacement après le bouton
  },
  errorBanner: {
    backgroundColor: '#FF5252',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorBannerText: {
    color: 'white',
    fontWeight: '500',
    flex: 1
  },
  keyboardAvoid: {
    flex: 1
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12
  },
  messagesContent: {
    paddingTop: 24,
    paddingBottom: 16
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  botAvatarContainer: {
    marginRight: 8,
  },
  userAvatarContainer: {
    marginLeft: 8,
  },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E9F5FF',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  messageContentContainer: {
    borderRadius: 22,
    padding: 14,
    maxWidth: '70%',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  userMessageContent: {
    backgroundColor: '#007BFF',
  },
  botMessageContent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userMessage: {
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  botMessage: {
    justifyContent: 'flex-start',
    marginRight: 'auto',
  },
  errorMessage: {
    backgroundColor: '#FFE5E5'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 5
  },
  pdfIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  pdfName: {
    fontSize: 12,
    color: '#FF5252',
    marginLeft: 4,
    fontWeight: '500'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  attachButton: {
    padding: 10
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    
  },
  sendButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  disabledButton: {
    backgroundColor: '#B0D1F5'
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8'
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 10,
    fontWeight: '500'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8F9FA'
  },
  emptyBotImage: {
    width: 90,
    height: 90,
    marginBottom: 24,
    opacity: 0.8
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#666',
    fontSize: 16,
    lineHeight: 24
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 20
  },
  loadingText: {
    color: '#007BFF',
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  // Intro Screen Styles
  introContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContent: {
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 32,
  },
  introSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 50,
  },
  getStartedButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 230,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedArrows: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  getStartedMainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChatbotScreen;*/}
// app/Chatbot.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Animated,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatbot } from '../hooks/useChatbotHooks';
import SidebarChatbot from '../components/SidebarChatbot';
import axios from 'axios';
import { useLanguage } from './i18n';
import { useAuth } from '../contexts/AuthContext';
// Composant Message séparé pour une meilleure organisation
const MessageItem = ({ message }) => {
  const messageAnimation = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();
  useEffect(() => {
    Animated.timing(messageAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
        message.isError && styles.errorMessage,
        { 
          opacity: messageAnimation,
          transform: [{ 
            translateY: messageAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }
      ]}
    >
      {!message.isUser && (
        <View style={styles.botAvatarContainer}>
          <Image 
            source={require('../assets/robot-logo.jpg')} 
            style={styles.botAvatar} 
          />
        </View>
      )}
      
      <View style={[
        styles.messageContentContainer,
        message.isUser ? styles.userMessageContent : styles.botMessageContent
      ]}>
        {message.pdfName && (
          <View style={styles.pdfIndicator}>
            <MaterialIcons name="picture-as-pdf" size={16} color="#FF5252" />
            <Text style={styles.pdfName} numberOfLines={1}>{message.pdfName}</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText
        ]}>{message.text}</Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {message.isUser && (
        <View style={styles.userAvatarContainer}>
          <Image 
            source={require('../assets/user.jpg')} 
            style={styles.userAvatar} 
          />
        </View>
      )}
    </Animated.View>
  );
};

const IntroScreen = ({ onComplete }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
   const { t } = useLanguage(); // Ajouter cette ligne
   const { isLoggedIn, user, logout } = useAuth();

// Vérification d'authentification
if (!isLoggedIn) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.notLoggedInContainer}>
        <Ionicons name="lock-closed" size={50} color="#6818a5" />
        <Text style={styles.notLoggedInTitle}>{t('accessDeniedTitle')}</Text>
        <Text style={styles.notLoggedInMessage}>
          {t('accessDeniedMessage')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const handleGetStarted = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.introContainer,
        { 
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim
        }
      ]}
    >
      <View style={styles.introContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/assistant-illustration.png')} 
            style={styles.logoImage} 
          />
        </View>
        <Text style={styles.introTitle}>{t('introTitle')}</Text>
        <Text style={styles.introSubtitle}>
          {t('introSubtitle')} 
        </Text>
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedArrows}>{'>>'}</Text>
          <Text style={styles.getStartedMainText}>{t('getStarted')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const ChatbotScreen = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const { t } = useLanguage(); // Ajouter cette ligne
  const {
    messages,
    setMessages,
    inputText,
    setInputText,
    selectedPdf,
    isLoading,
    apiError,
    setApiError,
    scrollViewRef,
    pickPdf,
    sendMessage,
    setSelectedPdf,
    histories,
    fetchHistories,
    isLoadingHistories,
    fetchConversationDetails,
    currentConversationId,
    setCurrentConversationId
  } = useChatbot();

  const handleSelectHistory = (history) => {
    fetchConversationDetails(history.id);
    setShowSidebar(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
    setSelectedPdf(null);
    setCurrentConversationId(null);
  };

  const handleDeleteConversation = async (id) => {
    try {
      await axios.delete(`http://192.168.1.10:5000/api/chatbot/${id}`);
      await fetchHistories();
    } catch (error) {
      console.error(t('errorDeletingConversation'), error);
      setApiError(t('errorDeleting'));
    }
  };

  // Main content to render after intro screen
  const renderMainContent = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSidebar(true)}
        >
          <MaterialIcons name="menu" size={24} color="#6818A5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chatbot')}</Text>
      </View>
      
      {apiError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{apiError}</Text>
          <TouchableOpacity onPress={() => setApiError(null)}>
            <MaterialIcons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(message => (
              <MessageItem key={message.id} message={message} />
            ))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#D283FF" />
                <Text style={styles.loadingText}>{t('processing')}</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {t('sendMessage')} 
            </Text>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={pickPdf}>
            <MaterialIcons name="attach-file" size={24} color="#5A108F" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('askQuestion')} 
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!inputText.trim() && !selectedPdf) && styles.disabledButton
            ]}
            onPress={sendMessage}
            disabled={(!inputText.trim() && !selectedPdf) || isLoading}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {selectedPdf && (
          <View style={styles.selectedFileContainer}>
            <MaterialIcons name="picture-as-pdf" size={20} color="#FF5252" />
            <Text style={styles.selectedFileName} numberOfLines={1}>
              {selectedPdf.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedPdf(null)}>
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {showSidebar && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable}
            onPress={() => setShowSidebar(false)}
            activeOpacity={1}
          />
          <View style={styles.sidebarAbsoluteContainer}>
            <SidebarChatbot
              histories={histories}
              onSelectHistory={handleSelectHistory}
              onNewChat={handleNewChat}
              onClose={() => setShowSidebar(false)}
              isLoadingHistories={isLoadingHistories}
              fetchHistories={fetchHistories}
              onDeleteHistory={handleDeleteConversation}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1 }}>
      {showIntro ? (
        <IntroScreen onComplete={() => setShowIntro(false)} />
      ) : (
        renderMainContent()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  // Styles pour la page non connectée
notLoggedInContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
notLoggedInTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#6818a5',
  marginTop: 15,
  marginBottom: 10,
},
notLoggedInMessage: {
  fontSize: 16,
  color: '#4F566B',
  textAlign: 'center',
  lineHeight: 22,
},
  header: {
    backgroundColor: 'white',
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15
  },
  menuButton: {
    marginRight: 15,
    padding: 8,
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#6818A5',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1, 
    right: 15,
    textAlign: 'center'  
  },
  errorBanner: {
    backgroundColor: '#FF5252',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorBannerText: {
    color: 'white',
    flex: 1
  },
  keyboardAvoid: {
    flex: 1
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10
  },
  messagesContent: {
    paddingTop: 20,
    paddingBottom: 10
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '90%',
  },
  botAvatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  userAvatarContainer: {
    marginLeft: 8,
    alignSelf: 'flex-end',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageContentContainer: {
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: '80%',
  },
  userMessageContent: {
    backgroundColor: '#E6E6FA',
    borderBottomRightRadius: 5,
  },
  botMessageContent: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  errorMessage: {
    backgroundColor: '#FFE5E5'
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#333',
  },
  botMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  pdfIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  pdfName: {
    fontSize: 12,
    color: '#FF5252',
    marginLeft: 4,
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  attachButton: {
    padding: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginHorizontal: 8
  },
  sendButton: {
    backgroundColor: '#5A108F',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#DC97FF'
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#666',
    fontSize: 16
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  loadingText: {
    color: '#D283FF',
    marginLeft: 10,
    fontSize: 14
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebarAbsoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '90%',
    height: '100%',
    zIndex: 1001,
  },
  historyButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  // IntroScreen styles
  introContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContent: {
    width: '80%',
    alignItems: 'center',
  },
  logoContainer: {
    width: 270,
    height: 260,
    marginBottom: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B2FC9',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  getStartedArrows: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  getStartedMainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
