import { useState } from "react";

import type { NextPage } from "next";
import Image from "next/image";

import { signIn, useSession } from "next-auth/react";

import { api } from "~/utils/api";

import { toast } from "react-hot-toast";

import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

export const CreatePostWizard = () => {
  const { data: sessionData } = useSession();
  const ctx = api.useContext();
  const [input, setInput] = useState<string>("");

  if (!sessionData) return null;

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  return (
    <>
      {sessionData.user.image && (
        <div className="flex gap-3 w-full font-medium">
          <Image
            src={sessionData.user.image}
            className="h-14 w-14 rounded-full"
            alt="Profile image"
            width={56}
            height={56}
          />
          <input
            placeholder="Type some emojis!"
            className="bg-transparent grow outline-none"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (input !== "") {
                  mutate({ content: input })
                }
              }
            }}
            disabled={isPosting}
          />
          {input !== "" && !isPosting && (
            <button onClick={() => mutate({ content: input })} disabled={isPosting}>
              Post
            </button>
          )}
          {isPosting && (
            <div className="flex items-center justify-center">
              <LoadingSpinner size={24} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const Feed = () => {
  const { data: postsData, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
  if (!postsData) return <div>Something went wrong</div>;
  
  return (
    <div className="flex flex-col">
      {postsData?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.id} />
      ))}
    </div>
  );
}

const Home: NextPage = () => {
  const { status: sessionStatus } = useSession();

  // Return empty div if BOTH aren't loaded, since session tends to load faster
  if (sessionStatus === "loading")  return <div />;

  return (<PageLayout>
    <div className="flex border-b border-slate-400 p-4">
      {(sessionStatus !== "authenticated") && (
        <button
          className="flex justify-center"
          onClick={() => void signIn()}
        >
          Sign in
        </button>
      )}

      {(sessionStatus === "authenticated") && <CreatePostWizard />}
    </div>

    <Feed />
  </PageLayout>);
}

export default Home;
