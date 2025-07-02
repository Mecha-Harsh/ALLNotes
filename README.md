📝 Collaborative Notes App (with Supabase + Yjs)
This project is a real-time collaborative note-taking app built with:

Supabase (auth + database)
Yjs for shared editing
y-websocket for real-time sync
Custom backend and frontend
🚀 Getting Started
1. Clone the repository
git clone https://github.com/yourusername/your-repo-name.git cd your-repo-name

Install dependencies Install packages for both server and client: --> cd server npm install
--> cd ../client npm install

Start the development servers Open two separate terminals for server and client.
Terminal 1: Start the backend

cd server npm run dev

Terminal 2: Start the frontend

cd client npm run dev

Start the Yjs WebSocket Server Open a third terminal and run:
npx y-websocket --port 1234 You can also install it globally with: npm install -g y-websocket And then run: y-websocket --port 1234

🛠 Environment Variables Make sure to set up your .env files in both client/ and server/.

Example for client (client/.env):

VITE_SUPABASE_URL=https://your-project-id.supabase.co 
VITE_SUPABASE_ANON_KEY=your-anon-key

Example for server (server/.env):

SUPABASE_URL=https://your-project-id.supabase.co 
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key