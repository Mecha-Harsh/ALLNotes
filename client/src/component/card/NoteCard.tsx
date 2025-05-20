import React from 'react';

interface Prop {
  title: string;
  text: string;
}

export const NoteCard = ({ title, text }: Prop) => (
  <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
    <h4>{title}</h4>
    <p>{text}</p>
  </div>
);
