
import { NoteEditor } from "../../component/Input/TextInput";

import NoteList from "../../component/Sidebar/NoteList";


export const Home = () => {


  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 overflow-y-auto">
        <NoteList />
      </aside>

      <main className="flex-1 p-6 bg-white">
        <NoteEditor />
      </main>
    </div>
  );
};

export default Home;
