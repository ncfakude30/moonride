import React, { useState, useEffect, useRef } from 'react';
import tw from 'tailwind-styled-components';

const OrderComponent = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Fetch recent orders from your API endpoint
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    // Add user message to chat
    const userMessage = { sender: 'user', text: inputValue };
    setChatMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setChatLoading(true);
    try {
      // Call your OpenAI-powered search endpoint
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      const aiMessage = { sender: 'ai', text: data.results };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage = {
        sender: 'ai',
        text: 'Sorry, an error occurred. Please try again.',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Container>
      <SectionTitle>Recent Orders</SectionTitle>
      {isLoading ? (
        <LoadingMessage>Loading orders...</LoadingMessage>
      ) : orders.length === 0 ? (
        <NoOrdersMessage>No orders yet. Place your first order!</NoOrdersMessage>
      ) : (
        orders.map((order) => (
          <OrderCard key={order.orderId}>
            <OrderDetail>
              <Label>Product:</Label>
              <Value>{order.product}</Value>
            </OrderDetail>
            <OrderDetail>
              <Label>Price:</Label>
              <Value>R{order.price}</Value>
            </OrderDetail>
            <OrderDetail>
              <Label>Date:</Label>
              <Value>{order.date}</Value>
            </OrderDetail>
            <OrderDetail>
              <Label>Status:</Label>
              <Value>{order.status}</Value>
            </OrderDetail>
          </OrderCard>
        ))
      )}
      <FloatingButton onClick={openChat}>
        <PlusIcon>+</PlusIcon>
      </FloatingButton>
      {isChatOpen && (
        <ChatOverlay>
          <ChatCard>
            <ChatHeader>
              <ChatTitle>Order Search</ChatTitle>
              <CloseChatButton onClick={closeChat}>X</CloseChatButton>
            </ChatHeader>
            <ChatBody>
              {chatMessages.map((msg, index) => (
                <ChatMessageBubble key={index} sender={msg.sender}>
                  {msg.text}
                </ChatMessageBubble>
              ))}
              {chatLoading && (
                <ChatMessageBubble sender="ai">Loading...</ChatMessageBubble>
              )}
              <div ref={chatEndRef} />
            </ChatBody>
            <ChatInputForm onSubmit={handleSend}>
              <ChatInput
                type="text"
                placeholder="Type your order request..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <SendButton type="submit">Send</SendButton>
            </ChatInputForm>
          </ChatCard>
        </ChatOverlay>
      )}
    </Container>
  );
};

/* Styled Components */
const Container = tw.div`
  p-4
`;

const SectionTitle = tw.h2`
  text-2xl font-bold mb-4 text-gray-800
`;

const LoadingMessage = tw.div`
  text-center text-gray-600 font-medium
`;

const NoOrdersMessage = tw.div`
  text-center text-gray-600 font-medium
`;

const OrderCard = tw.div`
  bg-white text-gray-800 rounded-lg p-4 shadow-lg transition-transform transform hover:scale-105 cursor-pointer border border-gray-200 mb-4
`;

const OrderDetail = tw.div`
  flex items-center mb-2
`;

const Label = tw.span`
  font-medium text-gray-600 mr-2
`;

const Value = tw.span`
  text-gray-800
`;

const FloatingButton = tw.button`
  fixed bottom-8 right-8 bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full p-4 font-semibold shadow-lg hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
`;

const PlusIcon = tw.div`
  text-3xl leading-none
`;

const ChatOverlay = tw.div`
  fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20
`;

const ChatCard = tw.div`
  bg-white rounded-lg shadow-lg p-6 w-96 max-w-full flex flex-col
`;

const ChatHeader = tw.div`
  flex justify-between items-center mb-4
`;

const ChatTitle = tw.h2`
  text-xl font-bold
`;

const CloseChatButton = tw.button`
  bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center focus:outline-none
`;

const ChatBody = tw.div`
  flex-1 overflow-y-auto mb-4 space-y-2 max-h-60
`;

const ChatMessageBubble = tw.div`
  p-2 rounded-lg text-sm max-w-full ${(props) =>
    props.sender === 'user' ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}
`;

const ChatInputForm = tw.form`
  flex items-center
`;

const ChatInput = tw.input`
  flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none
`;

const SendButton = tw.button`
  bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-r-lg p-2 font-semibold shadow-lg hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
`;

export default OrderComponent;
