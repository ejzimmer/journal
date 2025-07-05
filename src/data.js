let id = 1;
const commentid = () => `c${id++}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const BACKEND_DATA = [
  {
    id: commentid(),
    content: "Hi everyone!",
    author: "You",
    children: [
      {
        id: commentid(),
        content: "Hi! How are you?",
        author: "l33t_c0der",
        children: [
          {
            id: commentid(),
            content: "I'm good, thanks!",
            author: "You",
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: commentid(),
    content: "Spicy programming topics?",
    author: "l33t_c0der",
    children: [
      {
        id: commentid(),
        content: "Tabs or spaces?",
        author: "l33t_c0der",
        children: [
          {
            id: commentid(),
            content: "Spaces!",
            author: "JS_coder",
            children: [],
          },
          {
            id: commentid(),
            content: "Tabs!!!",
            author: "C_coder",
            children: [],
          },
          {
            id: commentid(),
            content: "But spaces are more precise!",
            author: "JS_coder",
            children: [],
          },
        ],
      },
      {
        id: commentid(),
        content: "Semicolons are considered harmful.",
        author: "JS_coder",
        children: [],
      },
    ],
  },
  {
    id: commentid(),
    content: "Garbage collection is overrated.",
    author: "C_coder",
    children: [],
  },
];

// --- Public API ---
export async function fetchComments() {
  await sleep(100);
  return BACKEND_DATA;
}

export async function postComment({ content }, parentId = null) {
  await sleep(1500);
  return { id: commentid(), author: "You", content, children: [] };
}
// --- End of public API ---
