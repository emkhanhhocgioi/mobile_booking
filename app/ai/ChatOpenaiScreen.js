import React, { useState } from 'react';
import { View, TextInput, Button, FlatList,TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
import axios from 'axios';

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;
  
    // Thêm tin nhắn của người dùng vào chat với id duy nhất
    const newMessage = { id: Date.now().toString(), name: 'user', text: message };
    setChatHistory((prevChat) => [...prevChat, newMessage]);
    setMessage('');
  
    try {
      // Gửi yêu cầu tới API
      const res = await axios.get(`${baseUrl}/api/gemini/generate`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          prompt: message,
        },
      });
  
      const botMessages =
        res.data?.text?.response?.candidates[0]?.content?.parts[0]?.text || 'No response from bot';
  
      // Thêm tin nhắn của bot vào chat với id duy nhất
      setChatHistory((prevChat) => [
        ...prevChat,
        { id: Date.now().toString(), text: botMessages, sender: 'bot' },
      ]);
    } catch (error) {
      console.error('Error fetching from API:', error);
      setChatHistory((prevChat) => [
        ...prevChat,
        {
          id: Date.now().toString(),
          text: 'Bot không thể phản hồi ngay bây giờ. Vui lòng thử lại sau.',
          sender: 'bot',
        },
      ]);
    }
  };
  
 

  return (
    <View style={styles.container}>
      <FlatList
        data={chatHistory}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === 'bot' ? styles.botMessage : styles.userMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default ChatScreen;
