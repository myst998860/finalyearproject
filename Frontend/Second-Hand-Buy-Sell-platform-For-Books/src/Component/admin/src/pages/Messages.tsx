import { useState } from 'react';
import { Send } from 'lucide-react';

const userMessages = [
  {
    id: 1,
    name: 'Saurab Doe',
    lastMessage: "I'm interested in harry porter collection",
    time: '10:30 AM',
    unread: true,
    type: 'user'
  },
  {
    id: 3,
    name: 'John Smith',
    lastMessage: "Do you have any science fiction books available?",
    time: '09:45 AM',
    unread: false,
    type: 'user'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    lastMessage: "Thank you for the quick delivery!",
    time: '09:20 AM',
    unread: false,
    type: 'user'
  }
];

const organizationMessages = [
  {
    id: 2,
    name: 'Nepal Orphans House',
    lastMessage: "We would like to donate 50 educational books",
    time: '10:25 AM',
    unread: true,
    type: 'organization'
  },
  {
    id: 4,
    name: 'Children\'s Library Foundation',
    lastMessage: "Our monthly donation is ready for pickup",
    time: '08:30 AM',
    unread: false,
    type: 'organization'
  },
  {
    id: 6,
    name: 'Community Education Center',
    lastMessage: "We have textbooks to contribute to your program",
    time: '08:15 AM',
    unread: false,
    type: 'organization'
  }
];

const allConversations = [...userMessages, ...organizationMessages].sort((a, b) => {
  const timeA = new Date(`1970/01/01 ${a.time}`);
  const timeB = new Date(`1970/01/01 ${b.time}`);
  return timeB.getTime() - timeA.getTime();
});

const chatMessages = [
  {
    id: 1,
    sender: 'John Doe Customer',
    message: "Hello! I'm interested in the Harry Potter collection you have listed on your website. Is it still available?",
    time: '10:30 AM',
    isOwn: false
  },
  {
    id: 2,
    sender: 'You',
    message: "Hi John! Yes, the Harry Potter collection is still available. It includes all 7 books in good condition.",
    time: '10:35 AM',
    isOwn: true
  },
  {
    id: 3,
    sender: 'John Doe Customer',
    message: "Great! what's the total price for the collection?",
    time: '10:37 AM',
    isOwn: false
  },
  {
    id: 4,
    sender: 'You',
    message: "The complete collection is priced at $65. We also offer free delivery within the city.",
    time: '10:40 AM',
    isOwn: true
  }
];

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Users', 'Organizations'];

  // Filter conversations based on active tab
  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'Users':
        return userMessages;
      case 'Organizations':
        return organizationMessages;
      default:
        return allConversations;
    }
  };

  const filteredConversations = getFilteredConversations();
  const selectedConv = filteredConversations.find(conv => conv.id === selectedConversation) || filteredConversations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {activeTab === 'Users' && `${userMessages.filter(u => u.unread).length} unread user messages`}
            {activeTab === 'Organizations' && `${organizationMessages.filter(o => o.unread).length} unread organization messages`}
            {activeTab === 'All' && `${allConversations.filter(c => c.unread).length} total unread messages`}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab}
              {tab === 'Users' && (
                <span className="ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  {userMessages.length}
                </span>
              )}
              {tab === 'Organizations' && (
                <span className="ml-2 px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full">
                  {organizationMessages.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversation List */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">
              {activeTab === 'Users' && 'User Messages'}
              {activeTab === 'Organizations' && 'Organization Messages'}
              {activeTab === 'All' && 'All Conversations'}
            </h3>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${
                  selectedConversation === conv.id ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">{conv.name}</h4>
                      {conv.type === 'organization' && (
                        <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full">
                          Org
                        </span>
                      )}
                      {conv.type === 'user' && (
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                          User
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No {activeTab.toLowerCase()} messages found
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">John Doe Customer</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}