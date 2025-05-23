import React, { useCallback, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import { data, useParams } from "react-router-dom";
import { useGlobalContext } from '../../Context/context'
import debounce from 'lodash.debounce';
import { updateNoteById } from "../../IndexDB/db";


export const NoteEditor = () => {


  const [content, setContent] = useState<string | undefined>("");
  const [title,setTitle] = useState<string>("Untitled");
  const {id,setId,notes,setNotes} = useGlobalContext();
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "link",
    "image",
  ];
  const handleChange = (value: string) => {

    setContent(value);
    const temp_tile = generateTitleFromContent(value ?? ""); 
    setNotes(preNotes=>
      preNotes.map(note=>
        note.id==id 
        ? { ...note , title:temp_tile ,content:value?? ""} : note
      )
    );
    const current_id = id;
    saveContent(id, value?? "", temp_tile);
    
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id
          ? { ...note, title: temp_tile, body: value??"" } // 👈 update this one
          : note 
      )
    );
  };

  const generateTitleFromContent = (content: string): string => {
    // Try to extract first <h1> or <h2> tag content
    const Match = content.match(/<h[1-2][^>]*>(.*?)<\/h[1-2]>|<br\s*\/?>/i);

    if (Match && Match[1]) {
      return Match[1].trim();
    }

    const plainText = content.replace(/<[^>]+>/g, '');
    const words = plainText.trim().split(/\s+/);
    return words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
  };
  
  const saveContent = useCallback(
    debounce((id:string,content:string,title:string)=>{
      updateNoteById(id,{title:title,content:content})
    },200),
    []
  )
  
  useEffect(()=>{
    saveContent.cancel();
    setContent(notes.find(n=>n.id==id)?.content || '');
  },[id]);



  return (
    <div style={{ margin: "20px" }}>
      <ReactQuill
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        theme="snow"
      />
    </div>
  );
};
