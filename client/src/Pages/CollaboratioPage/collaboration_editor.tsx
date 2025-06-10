import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import 'quill/dist/quill.snow.css';
import { WebsocketProvider } from "y-websocket";
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import LoginInCollab from '../Login/lgoin_in_collab';
import { FaColonSign } from 'react-icons/fa6';

Quill.register('modules/cursors', QuillCursors);


const getAuthToken = (): string | null => {
  try {
    const authData = localStorage.getItem('sb-chshfxzxdtdyyzcnnusr-auth-token');
      if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.access_token;
    }
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }
  return null;
};



interface CollaborativeEditorProps {
  roomName?: string;
  placeholder?: string;
  userName?: string;
  userColor?: string;
}



const _modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['clean']
  ],
  cursors: true,
};

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomName: propRoomName,
  placeholder = 'Start collaborating...',
  userName: propUserName,
  userColor = 'blue',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const[participants,setParticipants] = useState<string[]>([]);
  const [content,setContent] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [searchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>("anonymous");
  // const [token,setToken] = useState<any>(null);
  // Get params from URL or use props as fallback
  const roomName = searchParams.get("id") ?? propRoomName ?? 'default-room';
  


  useEffect( () => {
    //  const resp = axios.get("http://localhost:8080/CollabNotes", { params: { id: roomName } });
    //  resp.then(response => setContent(response.data.content));
    //  console.log(resp);
  }, [searchParams]);

  // Function to log Quill content
  const logQuillContent = (source = 'unknown') => {
    if (quillRef.current) {
      const htmlContent = quillRef.current.root.innerHTML;
      const textContent = quillRef.current.getText();
      const delta = quillRef.current.getContents();
      

      console.log(`=== Quill Content Log (${source}) ===`);
      setContent(htmlContent);
      console.log('HTML:', htmlContent);
      console.log('Text:', textContent);
      console.log('Delta:', delta);
      console.log('Is empty:', htmlContent === '<p><br></p>' || textContent.trim() === '');
      console.log('=====================================');
    } else {
      console.log(`Quill not initialized yet (${source})`);
    }
  };

  console.log("Component render - isVerified:", isVerified);
  console.log("Component render - roomName:", roomName);
  console.log("Component render - userName:", userId);

  // Permission check function
  useEffect(() => {
    console.log("Permission useEffect triggered");
    const checkPermission = async () => {
      console.log("Starting permission check...");
      const token = getAuthToken();
      console.log("the user found:",token);
      try {
        const response = await axios.get("http://localhost:8080/verifyPermission", {
          params: { id: roomName },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUserId(response.data.userId)
        console.log("Permission API response:", response.data.data);
        
        const per = response.data.data[0]?.permission || [];
        console.log("Extracted permissions:", per);
        
        if (per.includes("r") && per.includes("w")) {
          console.log("User has read and write permissions - setting verified to true");
          setIsVerified(true);
        } else {
          console.log("User lacks required permissions - setting verified to false");
          setIsVerified(false);
        }
      } catch (err) {
        console.error("Permission check failed:", err);
        setIsVerified(false);
      }
    };
    
    setIsVerified(null); // Show loading on param change
    checkPermission();
  }, [roomName, userId, searchParams, propUserName,setUserId]);

  // Editor initialization
  useLayoutEffect(() => {
    console.log("useLayoutEffect triggered - isVerified:", isVerified);
    
    // Don't initialize if not verified or still checking
    if (!isVerified || !editorRef.current) {
      console.log("Not verified or editorRef null, skipping editor initialization");
      return;
    }

    console.log("Starting editor initialization");

    let isMounted = true;
    let binding: any = null;
    let _provider: WebsocketProvider | null = null;
    let ydoc: Y.Doc | null = null;

    const initializeEditor = () => {
      try {
        console.log("Creating Yjs document");
        // 1. Create Yjs document
        ydoc = new Y.Doc();

        console.log("Creating WebSocket provider");
        // 2. Create WebSocket provider
        _provider = new WebsocketProvider('ws://localhost:1234', roomName, ydoc);

        console.log("Getting shared text type");
        // 3. Get shared text type
        const ytext = ydoc.getText('quill');

        console.log("Initializing Quill editor");
        // 4. Initialize Quill editor
        const quill = new Quill(editorRef.current!, {
          theme: 'snow',
          modules: _modules,
          placeholder,
        });

        // Set the ref immediately
        quillRef.current = quill;
        
        // Log initial state (will likely be empty)
        logQuillContent('after-quill-init');

        console.log("Creating QuillBinding");
        binding = new QuillBinding(ytext, quill, _provider.awareness);

        console.log("Quill initialized successfully");

        // Add event listeners for content changes
        quill.on('text-change', (delta, oldDelta, source) => {
          console.log('Text changed, source:', source);
          logQuillContent('text-change');
        });

        // Listen for when collaborative content is loaded
        ytext.observe((event) => {
          console.log('Yjs text observed change:', event);
          // Use setTimeout to ensure DOM is updated
          setTimeout(() => {
            logQuillContent('yjs-text-change');
          }, 0);
        });



        const updateParticipants = () => {
          if (!_provider?.awareness) return;
          
          const states = _provider.awareness.getStates();
          const userNames = Array.from(states.values())
            .map(state => state.user?.name)
            .filter((name): name is string => !!name && name.trim() !== '');
          
          console.log('Updating participants:', userNames);
          setParticipants(userNames);
        };
        

        const getUserColor = (name: string) => {
          const colors = [
            'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
            'bg-orange-500', 'bg-cyan-500'
          ];
          let hash = 0;
          for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
          }
          return colors[Math.abs(hash) % colors.length];
        };


        // Listen for provider sync events
        _provider.on('sync', (isSynced: boolean) => {
          console.log('Provider sync status:', isSynced);
          // const states = _provider?.awareness.getStates();
          // const userNames = Array.from((states ?? new Map()).values()).map(state => state.user?.name).filter(Boolean);
          // setParticipants(userNames);
          
          if (isSynced) {
            setTimeout(() => {
              updateParticipants();
              logQuillContent('provider-synced');
            }, 100); // Small delay to ensure content is loaded
          }
        });

        console.log("Setting user awareness");
        // 6. Set user awareness
        _provider.awareness.setLocalStateField('user', {
          name: userId,
          color: userColor,
        });

        const awarenessChangeHandler = () => {
          updateParticipants();
        }
        _provider.awareness.on('change', awarenessChangeHandler);

        if (isMounted) {
          console.log("Setting provider and connection state");
          setProvider(_provider);
          setIsConnected(_provider.wsconnected);
        }

        // Listen for connection status
        const handleStatus = () => {
          console.log("Connection status changed:", _provider?.wsconnected);
          if (isMounted) setIsConnected(_provider?.wsconnected || false);
        };
        _provider.on('status', handleStatus);

        // Log content after a delay to catch any initial sync
        setTimeout(() => {
          logQuillContent('delayed-after-init');
        }, 1000);

        setTimeout(()=>{
          updateParticipants();
        },500);

        console.log("Editor initialization complete");
      } catch (error) {
        console.error("Error during editor initialization:", error);
      }
    };

    initializeEditor();
    
    // Cleanup
    return () => {
      console.log("Cleanup triggered");
      isMounted = false;
      if (binding) binding.destroy();
      if (_provider) _provider.destroy();
      if (ydoc) ydoc.destroy();
      if (editorRef.current) {
        while (editorRef.current.firstChild) {
          editorRef.current.removeChild(editorRef.current.firstChild);
        }
      }
    };
  }, [roomName, userId, isVerified, userColor, placeholder, propUserName]);

  // Toggle connection
  const toggleConnection = () => {
    if (!provider) return;
    if (provider.wsconnected) {
      provider.disconnect();
    } else {
      provider.connect();
    }
    setIsConnected(provider.wsconnected);
  };

  // Debug function to manually log content
  const debugLogContent = async() => {
    try{
      // const { id, title, content, updatedAt }
      const response = await axios.post("http://localhost:8080/update_notes",{id:roomName,userId:userId,
        title:"for now exp",content:content,updatedAt: new Date().toISOString()
      });
    }catch{
      alert("you are not the owner of the file!!!");
    }
  };

  // Debug render states
  console.log("About to check render conditions:");
  console.log("isVerified === null:", isVerified === null);
  console.log("!isVerified:", !isVerified);
  console.log("Should render editor:", isVerified === true);

  // Loading state
  if (isVerified === null) {
    console.log("Rendering loading state");
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="text-center py-8">
          <div className="text-lg">Checking permissions...</div>
        </div>
      </div>
    );
  }
  
  // Access denied state
  if (!isVerified) {
    console.log("Rendering denied state");
    return (
      <div>
        <LoginInCollab setUserId={setUserId}/>
      </div>
    );
  }

  console.log("Rendering main editor component");

  // Main editor component
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Collaborative Editor</h1>
        <div className="flex gap-2">
          <button
            onClick={debugLogContent}
            className="px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save
          </button>
          <button
            onClick={toggleConnection}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div ref={editorRef} className="min-h-[300px] bg-white" />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <span
          className={`inline-flex items-center ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span className="ml-4">Room: {roomName}</span>
        <span className="ml-4">User: {userId}</span>
        <span className="ml-4">Verified: {isVerified ? 'Yes' : 'No'}</span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
      <span>Participants ({participants.length}): </span>
      {participants.length > 0 ? (
        <span className="font-medium">
          {participants.join(', ')}
        </span>
      ) : (
        <span className="text-gray-400">No participants connected</span>
      )}
    </div>
    </div>
  );
};

export default CollaborativeEditor;