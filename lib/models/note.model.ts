import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
  ],
});

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
export default Note;
