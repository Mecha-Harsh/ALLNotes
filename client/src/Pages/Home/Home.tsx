
import { NoteEditor } from "../../component/Input/TextInput";

import NoteList from "../../component/Sidebar/NoteList";
import Navbar from "../../component/Navbar/Navbar";
import autoSync from "../../utils/autoSync";

export const Home = () => {

  // const autosync =  autoSync();

  return (

    <>
    <Navbar/>
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 ">
        <NoteList />
      </aside>

      <main className="flex-1 p-6 bg-white overflow:visible">
        <NoteEditor />
      </main>
    </div>
    </>
  );
};

export default Home;
