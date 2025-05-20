import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import { NoteCard } from "../../component/card/NoteCard";
import axios from "axios";
import { NoteEditor } from "../../component/Input/TextInput";
import { useNavigate } from "react-router-dom";
import NoteList from "../../component/Sidebar/NoteList";

interface Notes {
  id: number;
  title: string;
  body: string;
}

export const Home = () => {
  const [notes, setNotes] = useState<Notes[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleNewNote = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission

    try {
      // Create a new empty note with a placeholder title
      const res = await axios.post("http://localhost:8080/add_notes");

      const noteId = res.data.id;
      console.log(noteId);
      navigate(`/edit/${noteId}`); // Fixed URL format (removed "Id=")
    } catch (err) {
      console.error("Error creating new note:", err);
    }
  };

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
