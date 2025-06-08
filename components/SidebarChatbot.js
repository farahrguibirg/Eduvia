{/*import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const SidebarChatbot = ({ 
  histories = [], 
  isLoadingHistories = false, 
  onSelectHistory, 
  onDeleteHistory, 
  isVisible,
  onClose,
  onNewChat,
  fetchHistories
}) => {
  // Tronquer le texte si trop long
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Formater la date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString || 'Date inconnue';
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* Header 
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Conversations</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible accessibilityLabel="Fermer">
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Bouton Nouvelle conversation 
      <TouchableOpacity 
        style={styles.newChatButton}
        onPress={() => {
          onNewChat();
          onClose();
        }}
        accessible
        accessibilityLabel="Nouvelle conversation"
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newChatText}>Nouvelle conversation</Text>
      </TouchableOpacity>

      {/* Bouton Rafraîchir 
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={fetchHistories}
        disabled={isLoadingHistories}
        accessible
        accessibilityLabel="Rafraîchir l'historique"
      >
        <Text style={styles.refreshButtonText}>Rafraîchir l'historique</Text>
        {isLoadingHistories ? 
          <ActivityIndicator size="small" color="#3C0663" /> : 
          <Ionicons name="refresh" size={18} color="#3C0663" />
        }
      </TouchableOpacity>

      {/* Liste des conversations 
      <Text style={styles.historyTitle}>Historique</Text>
      {isLoadingHistories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C0663" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      ) : Array.isArray(histories) && histories.length > 0 ? (
        <ScrollView style={styles.historyList}>
          {histories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => onSelectHistory(item)}
              accessible
              accessibilityLabel={`Conversation du ${formatDate(item.date_creation)}`}
            >
              <View style={styles.historyItemContent}>
                <MaterialCommunityIcons name="chat-outline" size={16} color="#3C0663" style={{marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={styles.chatText} numberOfLines={1}>
                    {truncateText(item.title || 'Conversation')}
                  </Text>
                  <View style={styles.chatDetails}>
                    <Text style={styles.dateText}>{formatDate(item.date_creation)}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => onDeleteHistory(item.id)} style={styles.deleteButton} accessibilityLabel="Supprimer la conversation">
                  <AntDesign name="delete" size={18} color="#8B2FC9" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons name="chat-outline" size={60} color="#ccc" />
          <Text style={styles.emptyHistoryText}>Aucune conversation dans l'historique</Text>
          <Text style={styles.emptyHistorySubText}>Vos conversations apparaîtront ici</Text>
        </View>
      )}
    </View>
  );
};
*/}
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Platform,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useLanguage } from '../app/i18n';

// Composant Sidebar Chatbot
const SidebarChatbot = ({ 
  histories = [], 
  isLoadingHistories = false, 
  onSelectHistory, 
  onDeleteHistory, 
  isVisible,
  onClose,
  onNewChat,
  fetchHistories
}) => {
  const { t } = useLanguage();

  // Tronquer le texte si trop long
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Formater la date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString || t('unknownDate');
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      if (Platform.OS === 'web') {
        if (window.confirm(`${t('confirmDelete')} cette conversation ?`)) {
          await onDeleteHistory(id);
        }
      } else {
        Alert.alert(
          t('confirmation'),
          `${t('confirmDelete')} cette conversation ?`,
          [
            {
              text: t('cancel'),
              style: 'cancel'
            },
            {
              text: t('delete'),
              style: 'destructive',
              onPress: async () => {
                await onDeleteHistory(id);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(t('deletionError'), error);
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* Header */}
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>{t('conversations')}</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose} 
          accessible 
          accessibilityLabel={t('closeAccessibility')}
        >
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Bouton Nouvelle conversation */}
      <TouchableOpacity 
        style={styles.newChatButton}
        onPress={() => {
          onNewChat();
          onClose();
        }}
        accessible
        accessibilityLabel={t('newConversationAccessibility')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newChatText}>{t('newConversation')}</Text>
      </TouchableOpacity>

      {/* Bouton Rafraîchir */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={fetchHistories}
        disabled={isLoadingHistories}
        accessible
        accessibilityLabel={t('refreshHistoryAccessibility')}
      >
        <Text style={styles.refreshButtonText}>{t('refreshHistory')}</Text>
        {isLoadingHistories ? 
          <ActivityIndicator size="small" color="#3C0663" /> : 
          <Ionicons name="refresh" size={18} color="#3C0663" />
        }
      </TouchableOpacity>

      {/* Liste des conversations */}
      <Text style={styles.historyTitle}>{t('history')}</Text>
      {isLoadingHistories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C0663" />
          <Text style={styles.loadingText}>{t('loadingHistory')}</Text>
        </View>
      ) : Array.isArray(histories) && histories.length > 0 ? (
        <ScrollView style={styles.historyList}>
          {histories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => onSelectHistory(item)}
              accessible
              accessibilityLabel={`${t('conversationAccessibility')} ${formatDate(item.date_creation)}`}
            >
              <View style={styles.historyItemContent}>
                <MaterialCommunityIcons name="chat-outline" size={16} color="#3C0663" style={{marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={styles.chatText} numberOfLines={1}>
                    {truncateText(item.title || t('conversation'))}
                  </Text>
                  <View style={styles.chatDetails}>
                    <Text style={styles.dateText}>{formatDate(item.date_creation)}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDeleteHistory(item.id)} 
                  style={styles.deleteButton} 
                  accessibilityLabel={t('deleteConversationAccessibility')}
                >
                  <AntDesign name="delete" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons name="chat-outline" size={60} color="#ccc" />
          <Text style={styles.emptyHistoryText}>{t('noConversationInHistory')}</Text>
          <Text style={styles.emptyHistorySubText}>{t('conversationsWillAppear')}</Text>
        </View>
      )}
    </View>
  );
};

// Composant Message
const MessageBubble = ({ message, isBot = false }) => {
  const { t } = useLanguage();

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.messageContainer, isBot ? styles.botMessage : styles.userMessage]}>
      <View style={[styles.messageBubble, isBot ? styles.botBubble : styles.userBubble]}>
        {isBot && (
          <View style={styles.botIcon}>
            <MaterialCommunityIcons name="robot" size={16} color="#8B2FC9" />
          </View>
        )}
        <View style={styles.messageContent}>
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
            {message.text}
          </Text>
          <Text style={[styles.messageTime, isBot ? styles.botTime : styles.userTime]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Composant Typing Indicator
const TypingIndicator = () => {
  const { t } = useLanguage();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.messageContainer, styles.botMessage]}>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.botIcon}>
          <MaterialCommunityIcons name="robot" size={16} color="#8B2FC9" />
        </View>
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Assistant écrit{dots}</Text>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Composant Principal Chatbot
const ChatbotPage = () => {
  const { t } = useLanguage();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);
  const scrollViewRef = useRef(null);

  // Messages d'exemple pour démarrer
  const welcomeMessages = [
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
      timestamp: Date.now(),
      isBot: true
    }
  ];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages(welcomeMessages);
    }
  }, []);

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  // Simuler la réponse du bot
  const simulateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simuler un délai de réponse
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      "C'est une excellente question ! Laissez-moi y réfléchir...",
      "Je comprends votre point de vue. Voici ce que je pense...",
      "Intéressant ! Pouvez-vous me donner plus de détails ?",
      "Voici quelques informations qui pourraient vous aider...",
      "Je vais faire de mon mieux pour vous aider avec cela.",
      "C'est un sujet fascinant. Permettez-moi de vous expliquer...",
      "Bonne question ! Voici ma réponse détaillée...",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const botMessage = {
      id: Date.now(),
      text: randomResponse,
      timestamp: Date.now(),
      isBot: true
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      timestamp: Date.now(),
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simuler la réponse du bot
    await simulateBotResponse(userMessage.text);
  };

  // Nouvelle conversation
  const handleNewChat = () => {
    const newConversation = {
      id: Date.now(),
      title: "Nouvelle conversation",
      messages: [...welcomeMessages],
      date_creation: new Date().toISOString()
    };
    
    // Sauvegarder la conversation actuelle si elle existe
    if (currentConversationId && messages.length > 1) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages, title: messages[1]?.text?.substr(0, 30) + '...' || 'Conversation' }
            : conv
        )
      );
    }

    setMessages([...welcomeMessages]);
    setCurrentConversationId(newConversation.id);
    setConversations(prev => [newConversation, ...prev]);
  };

  // Sélectionner une conversation depuis l'historique
  const handleSelectHistory = (conversation) => {
    // Sauvegarder la conversation actuelle
    if (currentConversationId && messages.length > 1) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages, title: messages[1]?.text?.substr(0, 30) + '...' || 'Conversation' }
            : conv
        )
      );
    }

    setMessages(conversation.messages || [...welcomeMessages]);
    setCurrentConversationId(conversation.id);
    setSidebarVisible(false);
  };

  // Supprimer une conversation
  const handleDeleteHistory = async (id) => {
    try {
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      // Si c'est la conversation actuelle, créer une nouvelle
      if (currentConversationId === id) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Erreur suppression conversation:', error);
    }
  };

  // Rafraîchir l'historique
  const fetchHistories = async () => {
    setIsLoadingHistories(true);
    try {
      // Simuler le chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      // L'historique est déjà dans le state conversations
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setIsLoadingHistories(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#8B2FC9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chatbot')}</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleNewChat}
        >
          <Ionicons name="add" size={24} color="#8B2FC9" />
        </TouchableOpacity>
      </View>

      {/* Zone de chat */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isBot={message.isBot}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* Zone de saisie */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Tapez votre message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#FFF" : "#CCC"} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.characterCount}>
            {inputText.length}/1000
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar */}
      {sidebarVisible && (
        <Modal
          visible={sidebarVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.sidebarOverlay}>
            <SidebarChatbot
              histories={conversations}
              isLoadingHistories={isLoadingHistories}
              onSelectHistory={handleSelectHistory}
              onDeleteHistory={handleDeleteHistory}
              isVisible={sidebarVisible}
              onClose={() => setSidebarVisible(false)}
              onNewChat={handleNewChat}
              fetchHistories={fetchHistories}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '90%',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 0,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C0663',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    borderRadius: 8,
    justifyContent: 'center',
    width: 'auto',
  },
  newChatText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3C0663',
    borderRadius: 8,
    backgroundColor: '#DC97FF',
  },
  refreshButtonText: {
    color: '#3C0663',
    marginRight: 8,
    fontWeight: '500',
    fontSize: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 0,
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 0,
  },
  historyItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  chatDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 4,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyHistoryText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  emptyHistorySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#555',
  },
});

export default SidebarChatbot; 


