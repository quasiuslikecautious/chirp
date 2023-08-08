import { useState } from "react";

import Head from "next/head";
import  Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import type { NextPage } from "next";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";

import { LoadingPage, LoadingSpinner } from "~/components/loading";
import Link from "next/link";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
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


type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  return (
    <>
      <div key={props.id} className="flex border-b border-slate-400 p-4 items-center gap-3">
        <Image
          src={props.author.image!}
          className="h-14 w-14 rounded-full"
          alt={`@{props.author.name}'s profile picture`}
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <Link href={`/@${props.author.name}`}>
            <div className="flex text-slate-300 gap-1">
              <span>{`@${props.author.name}`}</span>
              <span className="font-thin">·</span>
              <span className="font-thin">{dayjs(props.createdAt).fromNow()}</span>
            </div>
          </Link>
          <Link href={`/post/${props.id}`}>
            <span className="text-2xl">{props.content}</span>
          </Link>
        </div>
      </div>
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

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
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
        </div>
      </main>
    </>
  );
}

export default Home;
